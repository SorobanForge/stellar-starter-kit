#![no_std]
#![allow(deprecated)]
#![allow(clippy::too_many_arguments)]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
};

/// Number of ledgers before a persistent entry is bumped (~1 day at 5s ledgers).
const LEDGER_BUMP_THRESHOLD: u32 = 17_280;
/// Maximum number of ledgers a persistent entry can be extended by (~30 days).
const LEDGER_BUMP_LIMIT: u32 = 518_400;
/// Hard cap on the protocol fee (10%).
const MAX_FEE_BPS: u32 = 1_000;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum StreamError {
    InvalidAmount = 1,
    InvalidTimeRange = 2,
    InvalidCliff = 3,
    StreamNotFound = 4,
    NothingToWithdraw = 5,
    Unauthorized = 6,
    InvalidFee = 7,
    AlreadyCancelled = 8,
    AlreadyInitialized = 9,
    TreasuryNotSet = 10,
}

/// A single linear payment stream. Tokens are locked in the contract and vest
/// continuously between `start_time` and `end_time`, with an optional cliff.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Stream {
    pub id: u64,
    pub sender: Address,
    pub recipient: Address,
    pub token: Address,
    pub total_amount: i128,
    pub withdrawn: i128,
    pub start_time: u64,
    pub end_time: u64,
    pub cliff_time: u64,
    pub cancelled: bool,
}

/// Protocol-level configuration, set once at initialization.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    pub admin: Address,
    pub treasury: Address,
    pub fee_bps: u32,
}

#[contracttype]
pub enum DataKey {
    Stream(u64),
    NextId,
    Admin,
    Treasury,
    FeeBps,
}

#[contract]
pub struct StreamContract;

#[contractimpl]
impl StreamContract {
    /// Configure the protocol fee and treasury. Can only be called once.
    pub fn initialize(
        env: Env,
        admin: Address,
        treasury: Address,
        fee_bps: u32,
    ) -> Result<(), StreamError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(StreamError::AlreadyInitialized);
        }
        if fee_bps > MAX_FEE_BPS {
            return Err(StreamError::InvalidFee);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        env.storage().instance().set(&DataKey::NextId, &1u64);
        Ok(())
    }

    /// Update the protocol fee. Only callable by the configured admin.
    pub fn set_fee(env: Env, fee_bps: u32) -> Result<(), StreamError> {
        let admin: Address =
            env.storage().instance().get(&DataKey::Admin).ok_or(StreamError::Unauthorized)?;
        if fee_bps > MAX_FEE_BPS {
            return Err(StreamError::InvalidFee);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        Ok(())
    }

    /// Update the treasury address. Only callable by the configured admin.
    pub fn set_treasury(env: Env, treasury: Address) -> Result<(), StreamError> {
        let admin: Address =
            env.storage().instance().get(&DataKey::Admin).ok_or(StreamError::Unauthorized)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        Ok(())
    }

    /// Lock `amount` of `token` and begin streaming it from `sender` to `recipient`.
    /// Returns the new stream id.
    pub fn create_stream(
        env: Env,
        sender: Address,
        recipient: Address,
        token: Address,
        amount: i128,
        start_time: u64,
        end_time: u64,
        cliff_time: u64,
    ) -> Result<u64, StreamError> {
        sender.require_auth();

        if amount <= 0 {
            return Err(StreamError::InvalidAmount);
        }
        if end_time <= start_time {
            return Err(StreamError::InvalidTimeRange);
        }
        if cliff_time < start_time || cliff_time > end_time {
            return Err(StreamError::InvalidCliff);
        }

        // Pull the full stream amount into the contract up front.
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&sender, env.current_contract_address(), &amount);

        let id = next_id(&env);
        let stream = Stream {
            id,
            sender,
            recipient,
            token,
            total_amount: amount,
            withdrawn: 0,
            start_time,
            end_time,
            cliff_time,
            cancelled: false,
        };

        let key = DataKey::Stream(id);
        env.storage().persistent().set(&key, &stream);
        env.storage().persistent().extend_ttl(&key, LEDGER_BUMP_THRESHOLD, LEDGER_BUMP_LIMIT);
        env.storage().instance().extend_ttl(LEDGER_BUMP_THRESHOLD, LEDGER_BUMP_LIMIT);

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("created"), id),
            (stream.sender.clone(), stream.recipient.clone(), amount),
        );

        Ok(id)
    }

    /// Withdraw the currently vested (and not yet withdrawn) amount to the recipient.
    /// Returns the net amount transferred after any protocol fee.
    pub fn withdraw(env: Env, stream_id: u64) -> Result<i128, StreamError> {
        let key = DataKey::Stream(stream_id);
        let mut stream: Stream =
            env.storage().persistent().get(&key).ok_or(StreamError::StreamNotFound)?;

        stream.recipient.require_auth();

        let now = env.ledger().timestamp();
        let vested = vested_amount(&stream, now);
        let claimable = vested - stream.withdrawn;
        if claimable <= 0 {
            return Err(StreamError::NothingToWithdraw);
        }

        let fee = claimable * fee_bps(&env) as i128 / 10_000;
        let net = claimable - fee;

        let token_client = token::Client::new(&env, &stream.token);
        if fee > 0 {
            let treasury: Address = env
                .storage()
                .instance()
                .get(&DataKey::Treasury)
                .ok_or(StreamError::TreasuryNotSet)?;
            token_client.transfer(&env.current_contract_address(), &treasury, &fee);
        }
        token_client.transfer(&env.current_contract_address(), &stream.recipient, &net);

        stream.withdrawn += claimable;
        env.storage().persistent().set(&key, &stream);
        env.storage().persistent().extend_ttl(&key, LEDGER_BUMP_THRESHOLD, LEDGER_BUMP_LIMIT);

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("withdrawn"), stream_id),
            (stream.recipient.clone(), net, fee),
        );

        Ok(net)
    }

    /// Cancel a stream. The sender is refunded the unvested portion immediately,
    /// while the recipient keeps the right to withdraw everything already vested.
    pub fn cancel(env: Env, stream_id: u64) -> Result<(), StreamError> {
        let key = DataKey::Stream(stream_id);
        let mut stream: Stream =
            env.storage().persistent().get(&key).ok_or(StreamError::StreamNotFound)?;

        stream.sender.require_auth();

        if stream.cancelled {
            return Err(StreamError::AlreadyCancelled);
        }

        let now = env.ledger().timestamp();
        let vested = vested_amount(&stream, now);
        let unvested = stream.total_amount - vested;

        if unvested > 0 {
            let token_client = token::Client::new(&env, &stream.token);
            token_client.transfer(&env.current_contract_address(), &stream.sender, &unvested);
        }

        // Compress the schedule so the vested remainder becomes fully withdrawable.
        stream.total_amount = vested;
        stream.start_time = now;
        stream.end_time = now;
        stream.cliff_time = now;
        stream.cancelled = true;

        env.storage().persistent().set(&key, &stream);
        env.storage().persistent().extend_ttl(&key, LEDGER_BUMP_THRESHOLD, LEDGER_BUMP_LIMIT);

        env.events().publish(
            (symbol_short!("stream"), symbol_short!("cancelled"), stream_id),
            (stream.sender.clone(), unvested),
        );

        Ok(())
    }

    /// View the amount currently available for the recipient to withdraw.
    pub fn claimable(env: Env, stream_id: u64) -> Result<i128, StreamError> {
        let stream: Stream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)?;
        let now = env.ledger().timestamp();
        let vested = vested_amount(&stream, now);
        Ok((vested - stream.withdrawn).max(0))
    }

    /// View the total amount vested so far (withdrawn + claimable).
    pub fn vested(env: Env, stream_id: u64) -> Result<i128, StreamError> {
        let stream: Stream = env
            .storage()
            .persistent()
            .get(&DataKey::Stream(stream_id))
            .ok_or(StreamError::StreamNotFound)?;
        Ok(vested_amount(&stream, env.ledger().timestamp()))
    }

    /// Fetch a stream by id.
    pub fn get_stream(env: Env, stream_id: u64) -> Option<Stream> {
        env.storage().persistent().get(&DataKey::Stream(stream_id))
    }

    /// Fetch the protocol configuration (returns `None` if uninitialized).
    pub fn get_config(env: Env) -> Option<Config> {
        let admin: Option<Address> = env.storage().instance().get(&DataKey::Admin);
        let treasury: Option<Address> = env.storage().instance().get(&DataKey::Treasury);
        let fee_bps: u32 = env.storage().instance().get(&DataKey::FeeBps).unwrap_or(0);
        match (admin, treasury) {
            (Some(admin), Some(treasury)) => Some(Config { admin, treasury, fee_bps }),
            _ => None,
        }
    }

    /// The id that will be assigned to the next stream.
    pub fn next_stream_id(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::NextId).unwrap_or(1)
    }
}

/// Linearly vested amount of a stream at a given timestamp.
fn vested_amount(stream: &Stream, now: u64) -> i128 {
    if now < stream.start_time || now < stream.cliff_time {
        return 0;
    }
    if now >= stream.end_time {
        return stream.total_amount;
    }
    let elapsed = (now - stream.start_time) as i128;
    let duration = (stream.end_time - stream.start_time) as i128;
    stream.total_amount * elapsed / duration
}

fn next_id(env: &Env) -> u64 {
    let id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);
    env.storage().instance().set(&DataKey::NextId, &(id + 1));
    id
}

fn fee_bps(env: &Env) -> u32 {
    env.storage().instance().get(&DataKey::FeeBps).unwrap_or(0)
}

mod test;
