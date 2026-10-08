#!/usr/bin/env bash
# Add GitHub topics for discoverability (a Phase 10 approval requirement).
#
# Usage:
#   ./scripts/set-topics.sh
#
# Requires the GitHub CLI, authenticated.

set -euo pipefail

if ! command -v gh &>/dev/null; then
    echo "Error: the GitHub CLI ('gh') is not installed. See https://cli.github.com/."
    exit 1
fi

TOPICS=(
    "stellar"
    "soroban"
    "smart-contracts"
    "rust"
    "typescript"
    "payment-streams"
    "vesting"
    "defi"
    "web3"
    "nextjs"
    "stellar-wave"
)

args=()
for topic in "${TOPICS[@]}"; do
    args+=(--add-topic "$topic")
done

echo "Setting topics on $(gh repo view --json nameWithOwner --jq '.nameWithOwner')..."
gh repo edit "${args[@]}"
echo "Topics set."
