import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}





export interface Client {
  /**
   * Construct and simulate a get transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Retrieve the current value of the counter.
   */
  get: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a reset transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Reset the counter back to 0. Emits a reset event.
   */
  reset: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a decrement transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Decrement the counter by 1. Prevents underflow (stops at 0). Emits a decrement event.
   */
  decrement: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a increment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Increment the counter by 1. Emits an increment event.
   */
  increment: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAACpSZXRyaWV2ZSB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgY291bnRlci4AAAAAAANnZXQAAAAAAAAAAAEAAAAE",
        "AAAAAAAAADFSZXNldCB0aGUgY291bnRlciBiYWNrIHRvIDAuIEVtaXRzIGEgcmVzZXQgZXZlbnQuAAAAAAAABXJlc2V0AAAAAAAAAAAAAAEAAAAE",
        "AAAAAAAAAFVEZWNyZW1lbnQgdGhlIGNvdW50ZXIgYnkgMS4gUHJldmVudHMgdW5kZXJmbG93IChzdG9wcyBhdCAwKS4gRW1pdHMgYSBkZWNyZW1lbnQgZXZlbnQuAAAAAAAACWRlY3JlbWVudAAAAAAAAAAAAAABAAAABA==",
        "AAAAAAAAADVJbmNyZW1lbnQgdGhlIGNvdW50ZXIgYnkgMS4gRW1pdHMgYW4gaW5jcmVtZW50IGV2ZW50LgAAAAAAAAlpbmNyZW1lbnQAAAAAAAAAAAAAAQAAAAQ=" ]),
      options
    )
  }
  public readonly fromJSON = {
    get: this.txFromJSON<u32>,
        reset: this.txFromJSON<u32>,
        decrement: this.txFromJSON<u32>,
        increment: this.txFromJSON<u32>
  }
}