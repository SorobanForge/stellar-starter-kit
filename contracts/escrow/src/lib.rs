#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Symbol,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    EscrowNotFound = 1,
    EscrowAlreadyExists = 2,
    InvalidAmount = 3,
    UnauthorizedOperation = 4,
    InvalidStateTransition = 5,
    DeadlineNotReached = 6,
    DeadlineExpired = 7,
    AlreadyFinalized = 8,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum EscrowStatus {
    Created = 0,
    Funded = 1,
    Released = 2,
    Refunded = 3,
    Cancelled = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Escrow {
    pub id: u64,
    pub payer: Address,
    pub payee: Address,
    pub arbiter: Address,
    pub token: Address,
    pub amount: i128,
    pub deadline: u64,
    pub status: EscrowStatus,
}

#[contracttype]
pub enum DataKey {
    Escrow(u64),
}

const BUMP_THRESHOLD: u32 = 10000; // ~1.5 days of ledgers
const BUMP_LIMIT: u32 = 50000; // ~7 days of ledgers

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Create a new escrow agreement. Initial status is Created (unfunded).
    pub fn create_escrow(
        env: Env,
        id: u64,
        payer: Address,
        payee: Address,
        arbiter: Address,
        token: Address,
        amount: i128,
        deadline: u64,
    ) -> Result<(), EscrowError> {
        let key = DataKey::Escrow(id);
        if env.storage().persistent().has(&key) {
            return Err(EscrowError::EscrowAlreadyExists);
        }

        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }

        payer.require_auth();

        let escrow = Escrow {
            id,
            payer: payer.clone(),
            payee,
            arbiter,
            token,
            amount,
            deadline,
            status: EscrowStatus::Created,
        };

        env.storage().persistent().set(&key, &escrow);
        env.storage().persistent().extend_ttl(&key, BUMP_THRESHOLD, BUMP_LIMIT);

        // Emit creation event
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("created"), id),
            (payer, amount),
        );

        Ok(())
    }

    /// Fund the escrow by transferring the specified amount of tokens from payer to this contract.
    pub fn fund_escrow(env: Env, id: u64) -> Result<(), EscrowError> {
        let key = DataKey::Escrow(id);
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(EscrowError::EscrowNotFound)?;

        if escrow.status != EscrowStatus::Created {
            return Err(EscrowError::InvalidStateTransition);
        }

        escrow.payer.require_auth();

        // Perform token transfer
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&escrow.payer, &env.current_contract_address(), &escrow.amount);

        escrow.status = EscrowStatus::Funded;
        env.storage().persistent().set(&key, &escrow);
        env.storage().persistent().extend_ttl(&key, BUMP_THRESHOLD, BUMP_LIMIT);

        // Emit funding event
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("funded"), id),
            escrow.amount,
        );

        Ok(())
    }

    /// Release funds to the payee. Authorized by either the payer or the arbiter.
    pub fn release_escrow(env: Env, id: u64, caller: Address) -> Result<(), EscrowError> {
        let key = DataKey::Escrow(id);
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(EscrowError::EscrowNotFound)?;

        if escrow.status != EscrowStatus::Funded {
            if escrow.status == EscrowStatus::Created {
                return Err(EscrowError::InvalidStateTransition);
            } else {
                return Err(EscrowError::AlreadyFinalized);
            }
        }

        caller.require_auth();
        if caller != escrow.payer && caller != escrow.arbiter {
            return Err(EscrowError::UnauthorizedOperation);
        }

        // Transfer funds to payee
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.payee, &escrow.amount);

        escrow.status = EscrowStatus::Released;
        env.storage().persistent().set(&key, &escrow);
        env.storage().persistent().extend_ttl(&key, BUMP_THRESHOLD, BUMP_LIMIT);

        // Emit release event
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("released"), id),
            (caller, escrow.payee.clone(), escrow.amount),
        );

        Ok(())
    }

    /// Refund funds to the payer. Authorized by either the payee or the arbiter.
    pub fn refund_escrow(env: Env, id: u64, caller: Address) -> Result<(), EscrowError> {
        let key = DataKey::Escrow(id);
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(EscrowError::EscrowNotFound)?;

        if escrow.status != EscrowStatus::Funded {
            if escrow.status == EscrowStatus::Created {
                return Err(EscrowError::InvalidStateTransition);
            } else {
                return Err(EscrowError::AlreadyFinalized);
            }
        }

        caller.require_auth();
        if caller != escrow.payee && caller != escrow.arbiter {
            return Err(EscrowError::UnauthorizedOperation);
        }

        // Refund funds back to payer
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&env.current_contract_address(), &escrow.payer, &escrow.amount);

        escrow.status = EscrowStatus::Refunded;
        env.storage().persistent().set(&key, &escrow);
        env.storage().persistent().extend_ttl(&key, BUMP_THRESHOLD, BUMP_LIMIT);

        // Emit refund event
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("refunded"), id),
            (caller, escrow.payer.clone(), escrow.amount),
        );

        Ok(())
    }

    /// Cancel the escrow. Can be cancelled by payer immediately if unfunded (Created),
    /// or after the deadline has passed if funded (Funded).
    pub fn cancel_escrow(env: Env, id: u64, caller: Address) -> Result<(), EscrowError> {
        let key = DataKey::Escrow(id);
        let mut escrow: Escrow = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(EscrowError::EscrowNotFound)?;

        caller.require_auth();
        if caller != escrow.payer {
            return Err(EscrowError::UnauthorizedOperation);
        }

        match escrow.status {
            EscrowStatus::Created => {
                // Cancel without transferring funds since it's unfunded
                escrow.status = EscrowStatus::Cancelled;
            }
            EscrowStatus::Funded => {
                // Payer can only cancel if deadline has passed
                if env.ledger().timestamp() < escrow.deadline {
                    return Err(EscrowError::DeadlineNotReached);
                }

                // Transfer funds back to payer
                let token_client = token::Client::new(&env, &escrow.token);
                token_client.transfer(&env.current_contract_address(), &escrow.payer, &escrow.amount);

                escrow.status = EscrowStatus::Cancelled;
            }
            EscrowStatus::Released | EscrowStatus::Refunded | EscrowStatus::Cancelled => {
                return Err(EscrowError::AlreadyFinalized);
            }
        }

        env.storage().persistent().set(&key, &escrow);
        env.storage().persistent().extend_ttl(&key, BUMP_THRESHOLD, BUMP_LIMIT);

        // Emit cancel event
        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("cancelled"), id),
            escrow.payer.clone(),
        );

        Ok(())
    }

    /// Get escrow details by ID.
    pub fn get_escrow(env: Env, id: u64) -> Option<Escrow> {
        let key = DataKey::Escrow(id);
        env.storage().persistent().get(&key)
    }
}

mod test;
