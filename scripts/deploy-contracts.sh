#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
WORKSPACE_ROOT="$SCRIPT_DIR/.."
STELLAR_CLI="stellar"

# 1. Setup Network
echo "Configuring Stellar network: testnet..."
$STELLAR_CLI network add --rpc-url https://soroban-testnet.stellar.org --passphrase "Test SDF Network ; September 2015" testnet --global 2>/dev/null || true

# 2. Setup Deployer Key
AccountName="deployer"
echo "Verifying deployer key pair..."
KeysList=$($STELLAR_CLI keys ls || true)
HasKey=false

if [[ $KeysList == *"$AccountName"* ]]; then
    HasKey=true
fi

if [ "$HasKey" = false ]; then
    echo "Generating deployer key pair..."
    $STELLAR_CLI keys generate $AccountName
    echo "Funding deployer account with Friendbot..."
    $STELLAR_CLI keys fund $AccountName --network testnet
else
    echo "Deployer key found."
fi

# 3. Deploy and Generate Bindings
OptimizedDir="$WORKSPACE_ROOT/contracts/target/wasm32v1-none/release"
DeploymentsFile="$WORKSPACE_ROOT/apps/web/src/generated/deployments.json"

# Ensure output folder for deployments exists
DeploymentsDir=$(dirname "$DeploymentsFile")
mkdir -p "$DeploymentsDir"

# Initialize deployments json if it doesn't exist
if [ ! -f "$DeploymentsFile" ]; then
    echo "{}" > "$DeploymentsFile"
fi

Contracts=("counter" "escrow")

for Contract in "${Contracts[@]}"; do
    WasmPath="$OptimizedDir/$Contract.optimized.wasm"
    if [ ! -f "$WasmPath" ]; then
        echo "Optimized WASM not found at $WasmPath, falling back to unoptimized..."
        WasmPath="$OptimizedDir/$Contract.wasm"
    fi

    if [ ! -f "$WasmPath" ]; then
        echo "Error: WASM file not found for $Contract."
        exit 1
    fi

    echo "Deploying $Contract to Testnet..."
    ContractId=$($STELLAR_CLI contract deploy --wasm "$WasmPath" --source-account "$AccountName" --network testnet)
    ContractId=$(echo "$ContractId" | tr -d '\r' | xargs)
    echo "Deployed $Contract successfully. ID: $ContractId"

    # Save to deployments json
    python3 -c "
import json
data = {}
try:
    with open('$DeploymentsFile', 'r') as f:
        data = json.load(f)
except Exception:
    pass
data['$Contract'] = '$ContractId'
with open('$DeploymentsFile', 'w') as f:
    json.dump(data, f, indent=2)
"

    # Generate TS bindings
    OutputDir="$WORKSPACE_ROOT/packages/contracts/src/generated/$Contract"
    echo "Generating TS client bindings for $Contract at: $OutputDir"
    rm -rf "$OutputDir"
    
    $STELLAR_CLI contract bindings typescript --wasm "$WasmPath" --output-dir "$OutputDir" --overwrite
done

echo "Deployments saved to: $DeploymentsFile"
