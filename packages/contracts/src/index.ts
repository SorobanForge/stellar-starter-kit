// Export contracts configurations and utilities
export const SOROBAN_NETWORKS = {
  TESTNET: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
  },
  MAINNET: {
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    rpcUrl: 'https://soroban-rpc.stellar.org',
  },
} as const;

export * as CounterClient from './generated/counter/src';
export * as EscrowClient from './generated/escrow/src';
