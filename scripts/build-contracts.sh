#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
WORKSPACE_ROOT="$SCRIPT_DIR/.."
CONTRACTS_DIR="$WORKSPACE_ROOT/contracts"
TARGET_WASM="wasm32v1-none"

echo "Building smart contracts in Rust workspace..."
cargo build --manifest-path "$CONTRACTS_DIR/Cargo.toml" --target "$TARGET_WASM" --release

echo "Compilation successful!"
