#![no_std]
#![allow(deprecated)]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};

#[contract]
pub struct CounterContract;

const COUNTER_KEY: Symbol = symbol_short!("COUNTER");

#[contractimpl]
impl CounterContract {
    /// Retrieve the current value of the counter.
    pub fn get(env: Env) -> u32 {
        env.storage().instance().get(&COUNTER_KEY).unwrap_or(0)
    }

    /// Increment the counter by 1. Emits an increment event.
    pub fn increment(env: Env) -> u32 {
        let mut count = Self::get(env.clone());
        count += 1;
        env.storage().instance().set(&COUNTER_KEY, &count);

        // Extend storage TTL
        env.storage().instance().extend_ttl(100, 100);

        // Emit increment event
        env.events().publish((symbol_short!("counter"), symbol_short!("increment")), count);

        count
    }

    /// Decrement the counter by 1. Prevents underflow (stops at 0). Emits a decrement event.
    pub fn decrement(env: Env) -> u32 {
        let count = Self::get(env.clone()).saturating_sub(1);
        env.storage().instance().set(&COUNTER_KEY, &count);

        // Extend storage TTL
        env.storage().instance().extend_ttl(100, 100);

        // Emit decrement event
        env.events().publish((symbol_short!("counter"), symbol_short!("decrement")), count);

        count
    }

    /// Reset the counter back to 0. Emits a reset event.
    pub fn reset(env: Env) -> u32 {
        let count = 0;
        env.storage().instance().set(&COUNTER_KEY, &count);

        // Extend storage TTL
        env.storage().instance().extend_ttl(100, 100);

        // Emit reset event
        env.events().publish((symbol_short!("counter"), symbol_short!("reset")), count);

        count
    }
}

mod test;
