import {
  Account,
  Address,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';
import * as SorobanRpc from '@stellar/stellar-sdk/rpc';
import type { CreateStreamParams, Stream, StreamConfig } from '@stellar-starter-kit/types';

export interface StreamsClientOptions {
  /** The deployed `stream` contract id (C...). */
  contractId: string;
  /** Soroban RPC endpoint, e.g. https://soroban-testnet.stellar.org. */
  rpcUrl: string;
  /** Network passphrase the contract is deployed on. */
  networkPassphrase: string;
  /** Connected account used as the source/simulation account. */
  publicKey?: string;
  /** Signer provided by the wallet layer. Required for state-changing calls. */
  signTransaction?: (
    xdr: string,
    opts: { networkPassphrase: string; address: string },
  ) => Promise<string>;
}

const POLL_INTERVAL_MS = 1_000;
const POLL_TIMEOUT_MS = 30_000;

/**
 * A typed client for the Stellar Streams protocol. Read calls simulate against
 * Soroban RPC; write calls are prepared, signed by the injected wallet signer,
 * submitted, and polled to completion.
 */
export class StreamsClient {
  private readonly server: SorobanRpc.Server;
  private readonly options: StreamsClientOptions;

  constructor(options: StreamsClientOptions) {
    this.options = options;
    this.server = new SorobanRpc.Server(options.rpcUrl);
  }

  /** Builds the contract handle on demand (kept lazy so the client can be
   * constructed before a contract id is configured, e.g. during SSR). */
  private get contract(): Contract {
    if (!this.options.contractId) {
      throw new Error('No stream contract id configured.');
    }
    return new Contract(this.options.contractId);
  }

  /** The configured contract id. */
  get contractId(): string {
    return this.options.contractId;
  }

  private async sourceAccount(): Promise<Account> {
    if (!this.options.publicKey) {
      throw new Error('A connected wallet (publicKey) is required for this operation.');
    }
    return this.server.getAccount(this.options.publicKey);
  }

  /** Simulates a read-only contract call and returns the decoded result. */
  private async simulate(method: string, ...args: xdr.ScVal[]): Promise<unknown> {
    const account = await this.sourceAccount();
    const tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: this.options.networkPassphrase,
    })
      .addOperation(this.contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const response = await this.server.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(response)) {
      throw new Error(`Simulation of ${method} failed: ${response.error}`);
    }
    const retval = response.result?.retval;
    if (!retval) {
      throw new Error(`Simulation of ${method} returned no value.`);
    }
    return scValToNative(retval);
  }

  /** Builds, signs, submits and confirms a state-changing contract call. */
  private async invoke(method: string, ...args: xdr.ScVal[]): Promise<{ hash: string }> {
    const { publicKey, signTransaction, networkPassphrase } = this.options;
    if (!publicKey || !signTransaction) {
      throw new Error('A connected wallet is required to submit transactions.');
    }

    const account = await this.sourceAccount();
    const tx = new TransactionBuilder(account, {
      fee: '1000000',
      networkPassphrase,
    })
      .addOperation(this.contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    const signedXdr = await signTransaction(prepared.toXDR(), {
      networkPassphrase,
      address: publicKey,
    });
    const submitted = await this.server.sendTransaction(
      TransactionBuilder.fromXDR(signedXdr, networkPassphrase) as Parameters<
        SorobanRpc.Server['sendTransaction']
      >[0],
    );

    if (submitted.status === 'ERROR') {
      throw new Error(`Transaction submission failed: ${JSON.stringify(submitted.errorResult)}`);
    }
    return this.poll(submitted.hash);
  }

  private async poll(hash: string): Promise<{ hash: string }> {
    const startedAt = Date.now();
    while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
      const result = await this.server.getTransaction(hash);
      if (result.status !== SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
        if (result.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
          return { hash };
        }
        throw new Error(`Transaction ${hash} failed with status ${result.status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    throw new Error(`Timed out waiting for transaction ${hash}`);
  }

  /** Fetch a stream by id. Returns `null` if it does not exist. */
  async getStream(id: bigint | number | string): Promise<Stream | null> {
    const raw = (await this.simulate(
      'get_stream',
      nativeToScVal(BigInt(id), { type: 'u64' }),
    )) as RawStream | null;
    return raw ? normalizeStream(raw) : null;
  }

  /** Fetch protocol configuration. Returns `null` if the contract is uninitialized. */
  async getConfig(): Promise<StreamConfig | null> {
    const raw = (await this.simulate('get_config')) as RawConfig | null;
    if (!raw) return null;
    return { admin: raw.admin, treasury: raw.treasury, feeBps: Number(raw.fee_bps) };
  }

  /** Currently withdrawable amount for a stream, in stroops. */
  async claimable(id: bigint | number | string): Promise<bigint> {
    return (await this.simulate('claimable', nativeToScVal(BigInt(id), { type: 'u64' }))) as bigint;
  }

  /** Total amount vested so far, in stroops. */
  async vested(id: bigint | number | string): Promise<bigint> {
    return (await this.simulate('vested', nativeToScVal(BigInt(id), { type: 'u64' }))) as bigint;
  }

  /** The id the next stream will receive. */
  async nextStreamId(): Promise<bigint> {
    return (await this.simulate('next_stream_id')) as bigint;
  }

  /** Lock tokens and open a new stream. */
  async createStream(params: CreateStreamParams): Promise<{ hash: string }> {
    return this.invoke(
      'create_stream',
      addressToScVal(params.sender),
      addressToScVal(params.recipient),
      addressToScVal(params.token),
      nativeToScVal(BigInt(params.amount), { type: 'i128' }),
      nativeToScVal(BigInt(params.startTime), { type: 'u64' }),
      nativeToScVal(BigInt(params.endTime), { type: 'u64' }),
      nativeToScVal(BigInt(params.cliffTime), { type: 'u64' }),
    );
  }

  /** Withdraw the vested balance of a stream to its recipient. */
  async withdraw(id: bigint | number | string): Promise<{ hash: string }> {
    return this.invoke('withdraw', nativeToScVal(BigInt(id), { type: 'u64' }));
  }

  /** Cancel a stream, refunding the unvested balance to the sender. */
  async cancel(id: bigint | number | string): Promise<{ hash: string }> {
    return this.invoke('cancel', nativeToScVal(BigInt(id), { type: 'u64' }));
  }
}

interface RawStream {
  id: bigint;
  sender: string;
  recipient: string;
  token: string;
  total_amount: bigint;
  withdrawn: bigint;
  start_time: bigint;
  end_time: bigint;
  cliff_time: bigint;
  cancelled: boolean;
}

interface RawConfig {
  admin: string;
  treasury: string;
  fee_bps: number;
}

function normalizeStream(raw: RawStream): Stream {
  return {
    id: raw.id.toString(),
    sender: raw.sender,
    recipient: raw.recipient,
    token: raw.token,
    totalAmount: raw.total_amount.toString(),
    withdrawn: raw.withdrawn.toString(),
    startTime: Number(raw.start_time),
    endTime: Number(raw.end_time),
    cliffTime: Number(raw.cliff_time),
    cancelled: raw.cancelled,
  };
}

function addressToScVal(address: string): xdr.ScVal {
  return new Address(address).toScVal();
}
