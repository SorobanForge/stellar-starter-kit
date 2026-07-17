# Local Development Guide

Welcome to the `stellar-starter-kit` developer documentation! This guide explains how to configure your local machine for developing Stellar and Soroban smart contract applications.

---

## 1. Running Stellar Quickstart

For local development, it is highly recommended to run a local node rather than testing directly on Testnet or Futurenet. We use the official Stellar Quickstart Docker image.

### Start the Local Node

You can spin up the node in three ways depending on your workflow and OS:

#### Option A: Using pnpm Script (Recommended)

This runs Docker Compose in the background:

```bash
pnpm run node:local
```

#### Option B: Using Setup Scripts

Run the helper setup script for your platform:

- **Windows (PowerShell)**:
  ```powershell
  ./scripts/setup-local-node.ps1
  ```
- **macOS / Linux (Bash)**:
  ```bash
  ./scripts/setup-local-node.sh
  ```

#### Option C: Direct Docker Compose

```bash
docker compose up -d
```

### Horizon and RPC Endpoints

Once running, the following local services are available:

- **Horizon API Gateway**: `http://localhost:8000`
- **Soroban RPC Gateway**: `http://localhost:8000/soroban/rpc`

### Stop the Local Node

To stop the background node and clean up the container resources, run:

```bash
docker compose down
```

---

## 2. Soroban Smart Contract Development & Automation

To compile, test, optimize, and deploy smart contracts, you can use the workspace shortcuts configured in the monorepo root.

### Build Contracts

Compile the Soroban Rust workspace contracts to WebAssembly:

```bash
pnpm build:contracts
```

### Optimize WASM

Optimize compiled contracts to minimize byte size and gas footprint:

```bash
pnpm optimize
```

### Deploy Contracts

Deploy the optimized contracts to Stellar Testnet and generate strongly-typed TypeScript client bindings automatically inside `packages/contracts/src/generated`:

```bash
pnpm deploy:counter
pnpm deploy:escrow
```

### Invoke Contract via CLI

Demonstrate and verify contract execution on Stellar Testnet:

```bash
pnpm invoke:counter
pnpm invoke:escrow
```

### Verification & Linting

Run standard unit tests, formatting checks, and clippy lints inside the `contracts` workspace:

```bash
# Run unit tests
cargo test --manifest-path contracts/Cargo.toml

# Check code formatting
cargo fmt --manifest-path contracts/Cargo.toml -- --check

# Format code automatically
cargo fmt --manifest-path contracts/Cargo.toml

# Run Clippy lints
cargo clippy --manifest-path contracts/Cargo.toml --all-targets -- -D warnings
```
