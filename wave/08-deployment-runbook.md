# Phase 8 — Local Environment and Deployment

This phase assumes friction. Toolchain problems are the norm. Diagnose the actual error text before
prescribing a fix; prefer surgical fixes over rebuilding the environment.

---

## 8.1 Two toolchains, isolated explicitly

The repo uses two independent toolchains. Keep them separate:

| Toolchain    | Used by                                   | Pin                                                                         |
| :----------- | :---------------------------------------- | :-------------------------------------------------------------------------- |
| Node + pnpm  | `packages/`, `apps/web`, `scripts/run.js` | `engines`: Node ≥ 18, pnpm ≥ 8; `packageManager: pnpm@9.4.0`                |
| Rust + cargo | `contracts/`                              | `rust-toolchain.toml`: stable, `rustfmt` + `clippy`, target `wasm32v1-none` |

**Rule:** always call cargo via `--manifest-path contracts/Cargo.toml` from the repo root, and never
rely on an ambient `cargo` when more than one Rust install is present. If `rustup` shows multiple
toolchains, prefix commands with the pin: `cargo +stable …`.

## 8.2 Known failure modes and their root causes

| Symptom                                                       | Root cause                                    | Fix                                                                                |
| :------------------------------------------------------------ | :-------------------------------------------- | :--------------------------------------------------------------------------------- |
| `error: target 'wasm32v1-none' not found`                     | target not installed for the active toolchain | `rustup target add wasm32v1-none --toolchain stable`                               |
| `stellar: command not found`                                  | CLI not on PATH                               | install `stellar-cli`, or call it by full path; do **not** reinstall the toolchain |
| `cargo` resolves to a different install than `rustup` expects | two Rust installs (e.g. distro + rustup)      | invoke `rustup`'s cargo explicitly, or set PATH for the command only               |
| `linker 'rust-lld' not found` on Windows                      | missing MSVC build tools                      | install "Desktop development with C++"                                             |
| pnpm install fails on `workspace:*`                           | running npm/yarn instead of pnpm              | `corepack enable && pnpm install`                                                  |
| Friendbot funding fails                                       | transient network / DNS                       | retry; verify `https://horizon-testnet.stellar.org` resolves                       |
| `deploy` returns empty id                                     | CLI wrote progress to stdout                  | the script strips `\r` and trims — inspect the raw command output if it recurs     |

If a coding agent starts looping through small workarounds, stop it and issue one ordered set of
commands that addresses the root cause (usually: isolate the toolchain and install the missing
target), rather than another guess.

## 8.3 Local build and test

```bash
pnpm install

# JS workspace
pnpm lint && pnpm typecheck && pnpm test && pnpm build

# Contracts
cargo fmt   --manifest-path contracts/Cargo.toml --all -- --check
cargo clippy --manifest-path contracts/Cargo.toml --all-targets -- -D warnings
cargo test   --manifest-path contracts/Cargo.toml
```

There are **29 contract unit tests** today (stream 13, escrow 11, splits 5) plus JS tests in
`packages/utils` and `packages/wallets`.

## 8.4 Deployment — exact sequence

The deploy script is cross-platform: `scripts/deploy-contracts.sh` (bash) and
`scripts/deploy-contracts.ps1` (PowerShell), invoked through `scripts/run.js`.

```bash
pnpm download:cli      # fetch the stellar CLI if not installed
pnpm build:contracts   # cargo build --target wasm32v1-none --release
pnpm optimize          # stellar contract optimize on each wasm
pnpm deploy:testnet    # deploy stream -> splits -> escrow, write ids, generate bindings
```

What `deploy:testnet` does, in order:

1. Registers the `testnet` network config with the CLI (idempotent).
2. Ensures a funded `deployer` key exists (generates + Friendbot-funds if missing).
3. Deploys each of `stream`, `splits`, `escrow` **in that order** (no cross-contract dependency, but
   flagship first), falling back from `*.optimized.wasm` to `*.wasm`.
4. Writes ids into `apps/web/src/generated/deployments.json`.
5. Generates TypeScript bindings into `packages/contracts/src/generated/<contract>`.
6. **Initializes the `stream` contract** (`initialize --admin <deployer> --treasury <deployer>
--fee_bps ${STREAM_FEE_BPS:-0}`). This is required before `set_fee`/`set_treasury` work.
7. Prints a copy-pasteable block:

```
==================================================================
 Deployment complete - Stellar Testnet
==================================================================
  stream: C...
  splits: C...
  escrow: C...

 Copy into apps/web/.env.local:

NEXT_PUBLIC_STREAM_CONTRACT_ID=C...
NEXT_PUBLIC_SPLITS_CONTRACT_ID=C...
NEXT_PUBLIC_ESCROW_CONTRACT_ID=C...
==================================================================
```

> The `initialize` step and the summary block were **added in this playbook pass** — the previous
> script deployed without initializing `stream` and printed ids only per-contract.

### Verify on-chain

```bash
pnpm invoke:stream   # reads get_config and next_stream_id from the deployed contract
pnpm invoke:escrow   # exercises the escrow lifecycle
```

Then record the ids in `docs/deployments.md` with
`https://stellar.expert/explorer/testnet/contract/<ID>` links.

## 8.5 Wiring deployed ids into the app

1. Copy `.env.example` → `apps/web/.env.local`.
2. Paste the `NEXT_PUBLIC_*_CONTRACT_ID` lines from the deploy summary.
3. `pnpm dev` and open `/streams`.

For hosted environments, these are **build-time** values (`NEXT_PUBLIC_*`): set them in the
platform's environment UI **and rebuild**, not just restart (see Phase 9).
