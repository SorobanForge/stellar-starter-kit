#![cfg(test)]
#![allow(deprecated, elided_lifetimes_in_paths, mismatched_lifetime_syntaxes)]
use super::*;
use soroban_sdk::{testutils::Address as _, vec, Env};

fn setup_test_env(env: &Env) -> (Address, Address, token::Client, token::StellarAssetClient) {
    let payer = Address::generate(env);
    let token_admin = Address::generate(env);
    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let token_client = token::Client::new(env, &token_id);
    let token_admin_client = token::StellarAssetClient::new(env, &token_id);
    (payer, token_id, token_client, token_admin_client)
}

fn register(env: &Env) -> SplitsContractClient {
    let contract_id = env.register_contract(None, SplitsContract);
    SplitsContractClient::new(env, &contract_id)
}

#[test]
fn test_create_and_distribute() {
    let env = Env::default();
    env.mock_all_auths();
    let (payer, token_id, token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&payer, &1000);
    let client = register(&env);

    let creator = Address::generate(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);

    // 75 / 25 split.
    let id =
        client.create_split(&creator, &vec![&env, a.clone(), b.clone()], &vec![&env, 3u32, 1u32]);
    assert_eq!(id, 1);

    client.distribute(&id, &payer, &token_id, &1000);
    assert_eq!(token_client.balance(&a), 750);
    assert_eq!(token_client.balance(&b), 250);
    assert_eq!(token_client.balance(&payer), 0);
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn test_rounding_dust_goes_to_last_recipient() {
    let env = Env::default();
    env.mock_all_auths();
    let (payer, token_id, token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&payer, &100);
    let client = register(&env);

    let creator = Address::generate(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let c = Address::generate(&env);

    // Equal thirds of 100 -> 33, 33, 34.
    let id = client.create_split(
        &creator,
        &vec![&env, a.clone(), b.clone(), c.clone()],
        &vec![&env, 1u32, 1u32, 1u32],
    );
    client.distribute(&id, &payer, &token_id, &100);

    assert_eq!(token_client.balance(&a), 33);
    assert_eq!(token_client.balance(&b), 33);
    assert_eq!(token_client.balance(&c), 34);
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn test_invalid_splits() {
    let env = Env::default();
    env.mock_all_auths();
    let client = register(&env);
    let creator = Address::generate(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);

    // Empty recipients.
    assert_eq!(
        client.try_create_split(&creator, &vec![&env], &vec![&env]),
        Err(Ok(SplitError::EmptyRecipients)),
    );

    // Length mismatch (two recipients, one share).
    assert_eq!(
        client.try_create_split(&creator, &vec![&env, a.clone(), b.clone()], &vec![&env, 1u32]),
        Err(Ok(SplitError::LengthMismatch)),
    );

    // Zero share.
    assert_eq!(
        client.try_create_split(&creator, &vec![&env, a.clone()], &vec![&env, 0u32]),
        Err(Ok(SplitError::InvalidShares)),
    );

    // Duplicate recipient.
    assert_eq!(
        client.try_create_split(
            &creator,
            &vec![&env, a.clone(), a.clone()],
            &vec![&env, 1u32, 1u32]
        ),
        Err(Ok(SplitError::DuplicateRecipient)),
    );
}

#[test]
fn test_distribute_validations() {
    let env = Env::default();
    env.mock_all_auths();
    let (payer, token_id, _token_client, _token_admin) = setup_test_env(&env);
    let client = register(&env);
    let creator = Address::generate(&env);
    let a = Address::generate(&env);

    let id = client.create_split(&creator, &vec![&env, a.clone()], &vec![&env, 1u32]);

    // Unknown split.
    assert_eq!(
        client.try_distribute(&99, &payer, &token_id, &10),
        Err(Ok(SplitError::SplitNotFound)),
    );

    // Non-positive amount.
    assert_eq!(
        client.try_distribute(&id, &payer, &token_id, &0),
        Err(Ok(SplitError::InvalidAmount)),
    );
}

#[test]
fn test_single_recipient_gets_everything() {
    let env = Env::default();
    env.mock_all_auths();
    let (payer, token_id, token_client, token_admin) = setup_test_env(&env);
    token_admin.mint(&payer, &500);
    let client = register(&env);

    let creator = Address::generate(&env);
    let a = Address::generate(&env);
    let id = client.create_split(&creator, &vec![&env, a.clone()], &vec![&env, 7u32]);

    client.distribute(&id, &payer, &token_id, &500);
    assert_eq!(token_client.balance(&a), 500);

    let split = client.get_split(&id).unwrap();
    assert_eq!(split.total_shares, 7);
    assert_eq!(client.next_split_id(), 2);
}
