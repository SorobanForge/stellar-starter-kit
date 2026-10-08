#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
WORKSPACE_ROOT="$SCRIPT_DIR/.."
STELLAR_CLI="stellar"

DEPLOYMENTS_FILE="$WORKSPACE_ROOT/apps/web/src/generated/deployments.json"

if [ ! -f "$DEPLOYMENTS_FILE" ]; then
    echo "Error: Deployments file not found. Deploy the stream contract first."
    exit 1
fi

if command -v jq &>/dev/null; then
    CONTRACT_ID=$(jq -r '.stream' "$DEPLOYMENTS_FILE")
else
    CONTRACT_ID=$(python3 -c "
import json
print(json.load(open('$DEPLOYMENTS_FILE')).get('stream', ''))
")
fi

if [ -z "$CONTRACT_ID" ] || [ "$CONTRACT_ID" == "null" ]; then
    echo "Error: Stream contract id not found in deployments."
    exit 1
fi

echo "Invoking stream contract (ID: $CONTRACT_ID)..."

echo ""
echo "1. Reading protocol config..."
$STELLAR_CLI contract invoke --id "$CONTRACT_ID" --source-account deployer --network testnet -- get_config || true

echo ""
echo "2. Reading next stream id..."
$STELLAR_CLI contract invoke --id "$CONTRACT_ID" --source-account deployer --network testnet -- next_stream_id || true

echo ""
echo "Done. Use the dashboard at /streams to create and manage streams."
