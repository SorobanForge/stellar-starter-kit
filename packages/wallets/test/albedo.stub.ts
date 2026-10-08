// Test-only stub for `@albedo-link/intent`.
//
// v0.13.0 ships a UMD bundle whose factory assigns to `this` at import time,
// which throws ("Cannot set properties of undefined") when the module is
// evaluated in Node's ESM test environment. Tests only exercise the call
// signatures, so we alias the package to this stub in `vitest.config.ts`.
export default {
  publicKey: async () => ({ pubkey: '' }),
  tx: async () => ({ signed_envelope_xdr: '', tx_hash: '' }),
};
