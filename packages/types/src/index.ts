export type StellarNetwork = 'local' | 'testnet' | 'mainnet';

export interface StellarConfig {
  network: StellarNetwork;
  horizonUrl: string;
  rpcUrl: string;
  passphrase: string;
}

export interface WalletState {
  connected: boolean;
  address?: string;
  error?: string;
}

/**
 * A payment stream, mirroring the `stream` Soroban contract.
 * `u64` / `i128` fields are carried as decimal strings because they exceed
 * JavaScript's safe integer range.
 */
export interface Stream {
  id: string;
  sender: string;
  recipient: string;
  token: string;
  totalAmount: string;
  withdrawn: string;
  startTime: number;
  endTime: number;
  cliffTime: number;
  cancelled: boolean;
}

/** Protocol configuration, mirroring the contract's `Config` struct. */
export interface StreamConfig {
  admin: string;
  treasury: string;
  feeBps: number;
}

/** Inputs for `create_stream`, using decimal-string stroop amounts. */
export interface CreateStreamParams {
  sender: string;
  recipient: string;
  token: string;
  amount: string;
  startTime: number;
  endTime: number;
  cliffTime: number;
}

export type StreamStatus = 'scheduled' | 'streaming' | 'completed' | 'cancelled';

/** Derives a human-facing status for a stream at a given timestamp. */
export function getStreamStatus(stream: Stream, now: number): StreamStatus {
  if (stream.cancelled) return 'cancelled';
  if (now < stream.startTime || now < stream.cliffTime) return 'scheduled';
  if (now >= stream.endTime) return 'completed';
  return 'streaming';
}
