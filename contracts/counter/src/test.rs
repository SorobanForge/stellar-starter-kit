#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Events, vec, Env, IntoVal, TryFromVal, TryIntoVal, Val, Vec};

#[test]
fn test_counter() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CounterContract);
    let client = CounterContractClient::new(&env, &contract_id);

    // Assert initial count is 0
    assert_eq!(client.get(), 0);

    // Test increment
    assert_eq!(client.increment(), 1);
    let events = env.events().all();
    assert_eq!(events.events().len(), 1);
    let soroban_sdk::xdr::ContractEventBody::V0(event_v0) = &events.events().last().unwrap().body;
    let topics: Vec<Val> = event_v0.topics.try_into_val(&env).unwrap();
    let data: Val = event_v0.data.try_into_val(&env).unwrap();
    assert_eq!(
        topics,
        vec![
            &env,
            symbol_short!("counter").into_val(&env),
            symbol_short!("increment").into_val(&env)
        ]
    );
    assert_eq!(u32::try_from_val(&env, &data).unwrap(), 1u32);

    assert_eq!(client.get(), 1);

    assert_eq!(client.increment(), 2);
    let events = env.events().all();
    assert_eq!(events.events().len(), 1);
    let soroban_sdk::xdr::ContractEventBody::V0(event_v0) = &events.events().last().unwrap().body;
    let topics: Vec<Val> = event_v0.topics.try_into_val(&env).unwrap();
    let data: Val = event_v0.data.try_into_val(&env).unwrap();
    assert_eq!(
        topics,
        vec![
            &env,
            symbol_short!("counter").into_val(&env),
            symbol_short!("increment").into_val(&env)
        ]
    );
    assert_eq!(u32::try_from_val(&env, &data).unwrap(), 2u32);

    assert_eq!(client.get(), 2);

    // Test decrement
    assert_eq!(client.decrement(), 1);
    let events = env.events().all();
    assert_eq!(events.events().len(), 1);
    let soroban_sdk::xdr::ContractEventBody::V0(event_v0) = &events.events().last().unwrap().body;
    let topics: Vec<Val> = event_v0.topics.try_into_val(&env).unwrap();
    let data: Val = event_v0.data.try_into_val(&env).unwrap();
    assert_eq!(
        topics,
        vec![
            &env,
            symbol_short!("counter").into_val(&env),
            symbol_short!("decrement").into_val(&env)
        ]
    );
    assert_eq!(u32::try_from_val(&env, &data).unwrap(), 1u32);

    assert_eq!(client.get(), 1);

    // Test reset
    assert_eq!(client.reset(), 0);
    let events = env.events().all();
    assert_eq!(events.events().len(), 1);
    let soroban_sdk::xdr::ContractEventBody::V0(event_v0) = &events.events().last().unwrap().body;
    let topics: Vec<Val> = event_v0.topics.try_into_val(&env).unwrap();
    let data: Val = event_v0.data.try_into_val(&env).unwrap();
    assert_eq!(
        topics,
        vec![
            &env,
            symbol_short!("counter").into_val(&env),
            symbol_short!("reset").into_val(&env)
        ]
    );
    assert_eq!(u32::try_from_val(&env, &data).unwrap(), 0u32);

    assert_eq!(client.get(), 0);

    // Decrement from 0 should clamp to 0
    assert_eq!(client.decrement(), 0);
    let events = env.events().all();
    assert_eq!(events.events().len(), 1);
    let soroban_sdk::xdr::ContractEventBody::V0(event_v0) = &events.events().last().unwrap().body;
    let topics: Vec<Val> = event_v0.topics.try_into_val(&env).unwrap();
    let data: Val = event_v0.data.try_into_val(&env).unwrap();
    assert_eq!(
        topics,
        vec![
            &env,
            symbol_short!("counter").into_val(&env),
            symbol_short!("decrement").into_val(&env)
        ]
    );
    assert_eq!(u32::try_from_val(&env, &data).unwrap(), 0u32);

    assert_eq!(client.get(), 0);
}
