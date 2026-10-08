#![cfg(test)]
#![allow(deprecated, elided_lifetimes_in_paths, mismatched_lifetime_syntaxes)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    Env,
};

fn setup_test_env(
    env: &Env,
) -> (Address, Address, Address, token::Client, token::StellarAssetClient) {
    let sender = Address::generate(env);
    let recipient = Address::generate(env);
    let token_admin = Address::generate(env);
    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let token_client = token::Client::new(env, &token_id);
    let token_admin_client = token::StellarAssetClient::new(env, &token_id);
    (sender, recipient, token_id, token_client, token_admin_client)
}

fn set_time(env: &Env, t: u64) {
    let mut ledger = env.ledger().get();
    ledger.timestamp = t;
    env.ledger().set(ledger);
}

fn register(env: &Env) -> StreamContractClient {
    let contract_id = env.register_contract(None, StreamContract);
    StreamContractClient::new(env, &contract_id)
}

#[test]
fn test_linear_vesting_and_withdraw() {
    let env = Env::default();
    env.mock_all_auths();
    let (sender, recipient, token_id, token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&sender, &1000);
    let client = register(&env);

    let id = client.create_stream(&sender, &recipient, &token_id, &1000, &0, &1000, &0);
    assert_eq!(id, 1);
    assert_eq!(token_client.balance(&sender), 0);
    assert_eq!(token_client.balance(&client.address), 1000);

    // Nothing has vested at t=0.
    assert_eq!(client.claimable(&id), 0);
    assert!(client.try_withdraw(&id).is_err());

    // Halfway through, exactly half is claimable.
    set_time(&env, 500);
    assert_eq!(client.claimable(&id), 500);
    assert_eq!(client.withdraw(&id), 500);
    assert_eq!(token_client.balance(&recipient), 500);
    assert_eq!(token_client.balance(&client.address), 500);

    // A second withdraw at the same instant yields nothing.
    assert!(client.try_withdraw(&id).is_err());

    // At the end, the remainder is withdrawable.
    set_time(&env, 1000);
    assert_eq!(client.withdraw(&id), 500);
    assert_eq!(token_client.balance(&recipient), 1000);
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn test_cliff_blocks_early_withdrawal() {
    let env = Env::default();
    env.mock_all_auths();
    let (sender, recipient, token_id, _token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&sender, &1000);
    let client = register(&env);

    let id = client.create_stream(&sender, &recipient, &token_id, &1000, &0, &1000, &400);

    set_time(&env, 399);
    assert_eq!(client.claimable(&id), 0);
    assert!(client.try_withdraw(&id).is_err());

    set_time(&env, 400);
    assert_eq!(client.claimable(&id), 400);
    assert_eq!(client.withdraw(&id), 400);
}

#[test]
fn test_full_vest_after_end() {
    let env = Env::default();
    env.mock_all_auths();
    let (sender, recipient, token_id, _token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&sender, &1000);
    let client = register(&env);

    let id = client.create_stream(&sender, &recipient, &token_id, &1000, &100, &1100, &100);
    set_time(&env, 5000);
    assert_eq!(client.vested(&id), 1000);
    assert_eq!(client.claimable(&id), 1000);
}

#[test]
fn test_cancel_refunds_unvested_and_keeps_vested() {
    let env = Env::default();
    env.mock_all_auths();
    let (sender, recipient, token_id, token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&sender, &1000);
    let client = register(&env);

    let id = client.create_stream(&sender, &recipient, &token_id, &1000, &0, &1000, &0);

    set_time(&env, 300);
    client.cancel(&id);

    // Sender is refunded the unvested 700.
    assert_eq!(token_client.balance(&sender), 700);
    // The vested 300 remains claimable by the recipient.
    assert_eq!(client.claimable(&id), 300);
    assert_eq!(client.withdraw(&id), 300);
    assert_eq!(token_client.balance(&recipient), 300);
    assert_eq!(token_client.balance(&client.address), 0);

    let stream = client.get_stream(&id).unwrap();
    assert!(stream.cancelled);
}

#[test]
fn test_cancel_twice_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let (sender, recipient, token_id, _token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&sender, &1000);
    let client = register(&env);

    let id = client.create_stream(&sender, &recipient, &token_id, &1000, &0, &1000, &0);
    set_time(&env, 300);
    client.cancel(&id);
    let res = client.try_cancel(&id);
    assert_eq!(res, Err(Ok(StreamError::AlreadyCancelled)));
}

#[test]
fn test_cancel_before_start_refunds_everything() {
    let env = Env::default();
    env.mock_all_auths();
    let (sender, recipient, token_id, token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&sender, &1000);
    let client = register(&env);

    let id = client.create_stream(&sender, &recipient, &token_id, &1000, &500, &1500, &500);
    set_time(&env, 100);
    client.cancel(&id);

    assert_eq!(token_client.balance(&sender), 1000);
    assert_eq!(client.claimable(&id), 0);
}

#[test]
fn test_invalid_parameters() {
    let env = Env::default();
    env.mock_all_auths();
    let (sender, recipient, token_id, _token_client, _token_admin) = setup_test_env(&env);
    let client = register(&env);

    // Zero amount.
    assert_eq!(
        client.try_create_stream(&sender, &recipient, &token_id, &0, &0, &1000, &0),
        Err(Ok(StreamError::InvalidAmount)),
    );
    // End before start.
    assert_eq!(
        client.try_create_stream(&sender, &recipient, &token_id, &1000, &1000, &1000, &1000),
        Err(Ok(StreamError::InvalidTimeRange)),
    );
    // Cliff outside the schedule.
    assert_eq!(
        client.try_create_stream(&sender, &recipient, &token_id, &1000, &0, &1000, &2000),
        Err(Ok(StreamError::InvalidCliff)),
    );
}

#[test]
fn test_stream_not_found() {
    let env = Env::default();
    env.mock_all_auths();
    let client = register(&env);
    assert!(client.get_stream(&99).is_none());
    assert_eq!(client.try_claimable(&99), Err(Ok(StreamError::StreamNotFound)));
}

#[test]
fn test_protocol_fee() {
    let env = Env::default();
    env.mock_all_auths();
    let (sender, recipient, token_id, token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&sender, &1000);
    let client = register(&env);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    client.initialize(&admin, &treasury, &100); // 1%

    let id = client.create_stream(&sender, &recipient, &token_id, &1000, &0, &1000, &0);
    set_time(&env, 1000);

    // 1% of 1000 = 10 to treasury, 990 to recipient.
    assert_eq!(client.withdraw(&id), 990);
    assert_eq!(token_client.balance(&recipient), 990);
    assert_eq!(token_client.balance(&treasury), 10);
}

#[test]
fn test_initialize_twice_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let client = register(&env);
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    client.initialize(&admin, &treasury, &0);
    let res = client.try_initialize(&admin, &treasury, &0);
    assert_eq!(res, Err(Ok(StreamError::AlreadyInitialized)));
}

#[test]
fn test_invalid_fee_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let client = register(&env);
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let res = client.try_initialize(&admin, &treasury, &5000);
    assert_eq!(res, Err(Ok(StreamError::InvalidFee)));
}

#[test]
fn test_auth_is_required_to_create() {
    let env = Env::default();
    env.mock_all_auths();
    let (sender, recipient, token_id, _token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&sender, &1000);
    let client = register(&env);

    // Drop all mocked auths: the call must now fail on `require_auth`.
    env.mock_auths(&[]);
    assert!(client
        .try_create_stream(&sender, &recipient, &token_id, &1000, &0, &1000, &0)
        .is_err());
}

#[test]
fn test_ids_increment() {
    let env = Env::default();
    env.mock_all_auths();
    let (sender, recipient, token_id, _token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&sender, &2000);
    let client = register(&env);

    let a = client.create_stream(&sender, &recipient, &token_id, &1000, &0, &1000, &0);
    let b = client.create_stream(&sender, &recipient, &token_id, &1000, &0, &1000, &0);
    assert_eq!(a, 1);
    assert_eq!(b, 2);
    assert_eq!(client.next_stream_id(), 3);
}
