#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
WORKSPACE_ROOT="$SCRIPT_DIR/.."
STELLAR_CLI="stellar"

DEPLOYMENTS_FILE="$WORKSPACE_ROOT/apps/web/src/generated/deployments.json"

if [ ! -f "$DEPLOYMENTS_FILE" ]; then
    echo "Error: Deployments file not found. Please deploy the contract first."
    exit 1
fi

# Extract counter ID using jq or python/grep if jq is missing
if command -v jq &>/dev/null; then
    CONTRACT_ID=$(jq -r '.counter.contractId // .counter' "$DEPLOYMENTS_FILE")
else
    # Simple python fallback that handles both string and dictionary
    CONTRACT_ID=$(python3 -c "
import json
data = json.load(open('$DEPLOYMENTS_FILE'))['counter']
print(data['contractId'] if isinstance(data, dict) else data)
")
fi

if [ -z "$CONTRACT_ID" ] || [ "$CONTRACT_ID" == "null" ]; then
    echo "Error: Counter contract ID not found in deployments."
    exit 1
fi

echo "Invoking Counter contract (ID: $CONTRACT_ID)..."

# 1. Initialize
echo ""
echo "1. Initializing contract with deployer account..."
OWNER=$($STELLAR_CLI contract invoke --id "$CONTRACT_ID" --source-account deployer --network testnet -- get_owner || true)

if [ -z "$OWNER" ] || [[ "$OWNER" == *"null"* ]]; then
    echo "Owner is not set. Initializing..."
    DEPLOYER_ADDRESS=$($STELLAR_CLI keys address deployer)
    $STELLAR_CLI contract invoke --id "$CONTRACT_ID" --source-account deployer --network testnet -- initialize --owner "$DEPLOYER_ADDRESS"
else
    echo "Owner is already set: $OWNER"
fi

# 2. Get current count
echo ""
echo "2. Getting current count..."
COUNT=$($STELLAR_CLI contract invoke --id "$CONTRACT_ID" --source-account deployer --network testnet -- get_count)
echo "Current Count: $COUNT"

# 3. Increment counter
echo ""
echo "3. Incrementing counter..."
NEW_COUNT=$($STELLAR_CLI contract invoke --id "$CONTRACT_ID" --source-account deployer --network testnet -- increment)
echo "New Count: $NEW_COUNT"

# 4. Get count again
echo ""
echo "4. Getting count again..."
COUNT_AFTER=$($STELLAR_CLI contract invoke --id "$CONTRACT_ID" --source-account deployer --network testnet -- get_count)
echo "Final Count: $COUNT_AFTER"
