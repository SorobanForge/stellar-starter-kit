#![cfg(test)]
#![allow(deprecated, elided_lifetimes_in_paths, mismatched_lifetime_syntaxes)]
use super::*;
use soroban_sdk::{
    testutils::{Address as _, Events, Ledger},
    vec, Env, IntoVal, TryIntoVal, Val, Vec,
};

fn setup_test_env(env: &Env) -> (Address, Address, Address, Address, token::Client, token::StellarAssetClient) {
    let payer = Address::generate(env);
    let payee = Address::generate(env);
    let arbiter = Address::generate(env);
    let token_admin = Address::generate(env);
    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let token_client = token::Client::new(env, &token_id);
    let token_admin_client = token::StellarAssetClient::new(env, &token_id);
    (payer, payee, arbiter, token_id, token_client, token_admin_client)
}

#[test]
fn test_escrow_lifecycle_release_by_payer() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, token_client, token_admin_client) = setup_test_env(&env);
    token_admin_client.mint(&payer, &1000);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let escrow_id = 1;
    let amount = 500;
    let deadline = 1000;

    // Create
    client.create_escrow(&escrow_id, &payer, &payee, &arbiter, &token_id, &amount, &deadline);
    let escrow = client.get_escrow(&escrow_id).unwrap();
    assert_eq!(escrow.status, EscrowStatus::Created);

    // Fund
    client.fund_escrow(&escrow_id);
    let escrow = client.get_escrow(&escrow_id).unwrap();
    assert_eq!(escrow.status, EscrowStatus::Funded);
    assert_eq!(token_client.balance(&payer), 500);
    assert_eq!(token_client.balance(&contract_id), 500);

    // Release by payer
    client.release_escrow(&escrow_id, &payer);
    let escrow = client.get_escrow(&escrow_id).unwrap();
    assert_eq!(escrow.status, EscrowStatus::Released);
    assert_eq!(token_client.balance(&payee), 500);
    assert_eq!(token_client.balance(&contract_id), 0);
}

#[test]
fn test_escrow_lifecycle_release_by_arbiter() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, token_client, token_admin_client) = setup_test_env(&env);
    token_admin_client.mint(&payer, &1000);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let escrow_id = 1;
    let amount = 500;
    let deadline = 1000;

    client.create_escrow(&escrow_id, &payer, &payee, &arbiter, &token_id, &amount, &deadline);
    client.fund_escrow(&escrow_id);

    // Release by arbiter
    client.release_escrow(&escrow_id, &arbiter);
    let escrow = client.get_escrow(&escrow_id).unwrap();
    assert_eq!(escrow.status, EscrowStatus::Released);
    assert_eq!(token_client.balance(&payee), 500);
}

#[test]
fn test_escrow_lifecycle_refund_by_payee() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, token_client, token_admin_client) = setup_test_env(&env);
    token_admin_client.mint(&payer, &1000);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let escrow_id = 1;
    let amount = 500;
    let deadline = 1000;

    client.create_escrow(&escrow_id, &payer, &payee, &arbiter, &token_id, &amount, &deadline);
    client.fund_escrow(&escrow_id);

    // Refund by payee
    client.refund_escrow(&escrow_id, &payee);
    let escrow = client.get_escrow(&escrow_id).unwrap();
    assert_eq!(escrow.status, EscrowStatus::Refunded);
    assert_eq!(token_client.balance(&payer), 1000);
}

#[test]
fn test_escrow_lifecycle_refund_by_arbiter() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, token_client, token_admin_client) = setup_test_env(&env);
    token_admin_client.mint(&payer, &1000);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let escrow_id = 1;
    let amount = 500;
    let deadline = 1000;

    client.create_escrow(&escrow_id, &payer, &payee, &arbiter, &token_id, &amount, &deadline);
    client.fund_escrow(&escrow_id);

    // Refund by arbiter
    client.refund_escrow(&escrow_id, &arbiter);
    let escrow = client.get_escrow(&escrow_id).unwrap();
    assert_eq!(escrow.status, EscrowStatus::Refunded);
    assert_eq!(token_client.balance(&payer), 1000);
}

#[test]
fn test_escrow_cancel_before_funding() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, _token_client, _token_admin_client) = setup_test_env(&env);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let escrow_id = 1;
    let amount = 500;
    let deadline = 1000;

    client.create_escrow(&escrow_id, &payer, &payee, &arbiter, &token_id, &amount, &deadline);

    // Cancel by payer when Created (unfunded)
    client.cancel_escrow(&escrow_id, &payer);
    let escrow = client.get_escrow(&escrow_id).unwrap();
    assert_eq!(escrow.status, EscrowStatus::Cancelled);
}

#[test]
fn test_escrow_cancel_after_deadline() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, token_client, token_admin_client) = setup_test_env(&env);
    token_admin_client.mint(&payer, &1000);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let escrow_id = 1;
    let amount = 500;
    let deadline = 1000;

    client.create_escrow(&escrow_id, &payer, &payee, &arbiter, &token_id, &amount, &deadline);
    client.fund_escrow(&escrow_id);

    // Set ledger timestamp past deadline
    let mut ledger_info = env.ledger().get();
    ledger_info.timestamp = 1001;
    env.ledger().set(ledger_info);

    // Cancel by payer should work now
    client.cancel_escrow(&escrow_id, &payer);
    let escrow = client.get_escrow(&escrow_id).unwrap();
    assert_eq!(escrow.status, EscrowStatus::Cancelled);
    assert_eq!(token_client.balance(&payer), 1000);
}

#[test]
fn test_escrow_cancel_before_deadline_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, _token_client, token_admin_client) = setup_test_env(&env);
    token_admin_client.mint(&payer, &1000);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let escrow_id = 1;
    let amount = 500;
    let deadline = 1000;

    client.create_escrow(&escrow_id, &payer, &payee, &arbiter, &token_id, &amount, &deadline);
    client.fund_escrow(&escrow_id);

    // Set ledger timestamp before deadline
    let mut ledger_info = env.ledger().get();
    ledger_info.timestamp = 500;
    env.ledger().set(ledger_info);

    // Cancel by payer should fail
    let result = client.try_cancel_escrow(&escrow_id, &payer);
    assert_eq!(
        result,
        Err(Ok(EscrowError::DeadlineNotReached))
    );
}

#[test]
fn test_escrow_invalid_state_transitions() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, _token_client, token_admin_client) = setup_test_env(&env);
    token_admin_client.mint(&payer, &1000);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let escrow_id = 1;
    let amount = 500;
    let deadline = 1000;

    client.create_escrow(&escrow_id, &payer, &payee, &arbiter, &token_id, &amount, &deadline);

    // Try to release unfunded escrow -> should fail
    let res = client.try_release_escrow(&escrow_id, &payer);
    assert_eq!(
        res,
        Err(Ok(EscrowError::InvalidStateTransition))
    );

    // Fund it
    client.fund_escrow(&escrow_id);

    // Try to fund again -> should fail
    let res2 = client.try_fund_escrow(&escrow_id);
    assert_eq!(
        res2,
        Err(Ok(EscrowError::InvalidStateTransition))
    );

    // Release it
    client.release_escrow(&escrow_id, &payer);

    // Try to refund already released escrow -> should fail
    let res3 = client.try_refund_escrow(&escrow_id, &arbiter);
    assert_eq!(
        res3,
        Err(Ok(EscrowError::AlreadyFinalized))
    );
}

#[test]
fn test_escrow_unauthorized_operations() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, _token_client, token_admin_client) = setup_test_env(&env);
    token_admin_client.mint(&payer, &1000);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let escrow_id = 1;
    let amount = 500;
    let deadline = 1000;

    client.create_escrow(&escrow_id, &payer, &payee, &arbiter, &token_id, &amount, &deadline);
    client.fund_escrow(&escrow_id);

    // Unauthorized release (payee calls it) -> should fail
    let res = client.try_release_escrow(&escrow_id, &payee);
    assert_eq!(
        res,
        Err(Ok(EscrowError::UnauthorizedOperation))
    );

    // Unauthorized refund (payer calls it) -> should fail
    let res2 = client.try_refund_escrow(&escrow_id, &payer);
    assert_eq!(
        res2,
        Err(Ok(EscrowError::UnauthorizedOperation))
    );

    // Unauthorized cancel (arbiter calls it) -> should fail
    let res3 = client.try_cancel_escrow(&escrow_id, &arbiter);
    assert_eq!(
        res3,
        Err(Ok(EscrowError::UnauthorizedOperation))
    );
}

#[test]
fn test_escrow_validation_failures() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, _token_client, _token_admin_client) = setup_test_env(&env);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    // Invalid amount
    let res = client.try_create_escrow(&1, &payer, &payee, &arbiter, &token_id, &0, &1000);
    assert_eq!(
        res,
        Err(Ok(EscrowError::InvalidAmount))
    );

    // Successful creation
    client.create_escrow(&1, &payer, &payee, &arbiter, &token_id, &500, &1000);

    // Duplicate ID creation
    let res2 = client.try_create_escrow(&1, &payer, &payee, &arbiter, &token_id, &500, &1000);
    assert_eq!(
        res2,
        Err(Ok(EscrowError::EscrowAlreadyExists))
    );
}

#[test]
fn test_escrow_events() {
    let env = Env::default();
    env.mock_all_auths();

    let (payer, payee, arbiter, token_id, _token_client, token_admin_client) = setup_test_env(&env);
    token_admin_client.mint(&payer, &1000);

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    // We check events after each call because in v27 env.events().all() returns events from the last invocation.
    
    // Create
    client.create_escrow(&1, &payer, &payee, &arbiter, &token_id, &500, &1000);
    let events = env.events().all();
    assert_eq!(events.events().len(), 1);
    let soroban_sdk::xdr::ContractEventBody::V0(event_v0) = &events.events().last().unwrap().body;
    let topics: Vec<Val> = event_v0.topics.try_into_val(&env).unwrap();
    assert_eq!(
        topics,
        vec![
            &env,
            symbol_short!("escrow").into_val(&env),
            symbol_short!("created").into_val(&env),
            1u64.into_val(&env),
        ]
    );

    // Fund
    client.fund_escrow(&1);
    let events = env.events().all();
    // 1 transfer + 1 fund = 2 events
    assert_eq!(events.events().len(), 2);
    let soroban_sdk::xdr::ContractEventBody::V0(event_v0_fund) = &events.events().last().unwrap().body;
    let topics_fund: Vec<Val> = event_v0_fund.topics.try_into_val(&env).unwrap();
    assert_eq!(
        topics_fund,
        vec![
            &env,
            symbol_short!("escrow").into_val(&env),
            symbol_short!("funded").into_val(&env),
            1u64.into_val(&env),
        ]
    );

    // Release
    client.release_escrow(&1, &payer);
    let events = env.events().all();
    // 1 transfer + 1 release = 2 events
    assert_eq!(events.events().len(), 2);
    let soroban_sdk::xdr::ContractEventBody::V0(event_v0_release) = &events.events().last().unwrap().body;
    let topics_release: Vec<Val> = event_v0_release.topics.try_into_val(&env).unwrap();
    assert_eq!(
        topics_release,
        vec![
            &env,
            symbol_short!("escrow").into_val(&env),
            symbol_short!("released").into_val(&env),
            1u64.into_val(&env),
        ]
    );
}
