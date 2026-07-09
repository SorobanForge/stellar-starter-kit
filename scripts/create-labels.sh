#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -euo pipefail

echo "🌌 Syncing GitHub Labels for stellar-starter-kit..."

if ! command -v gh &> /dev/null; then
  echo "❌ Error: The GitHub CLI ('gh') is not installed or not in PATH."
  echo "Please install it from https://cli.github.com/ and authenticate with 'gh auth login'."
  exit 1
fi

# Ensure user is authenticated
if ! gh auth status &>/dev/null; then
  echo "❌ Error: Not authenticated with GitHub CLI. Please run 'gh auth login' first."
  exit 1
fi

# Define labels array: "name|color|description"
LABELS=(
  "type: bug|d73a4a|Something isn't working as expected"
  "type: feature|a2eeef|New features, capabilities, or major enhancements"
  "type: documentation|0075ca|Improvements or additions to documentation or guides"
  "type: chore|cfd3d7|Repository maintenance, dependencies, lints, or minor tweaks"
  "type: performance|84b6eb|Code changes that improve CPU, memory, or bundle size performance"
  "type: security|b60205|Security issues, vulnerability updates, or audits"
  "type: refactor|d4c5f9|Code structure refactorings without behavior modifications"
  "type: test|e99695|Adding missing tests or improving existing test suites"
  
  "area: cli|bfdadc|Code and scripts related to packages/cli"
  "area: config|c5def5|Code and settings related to packages/config"
  "area: contracts|fef2c0|Code and tests related to packages/contracts (Soroban)"
  "area: core|0052cc|Code and connections related to packages/core"
  "area: hooks|bfd4f2|React hooks and states related to packages/hooks"
  "area: sdk|1d76db|Developer client modules related to packages/sdk"
  "area: testing|006b75|Mock environments and node simulators related to packages/testing"
  "area: ui|fef2c0|Tailwind UI component files related to packages/ui"
  "area: utils|5319e7|Math, formatting, and conversion helpers related to packages/utils"
  "area: wallets|bfd4f2|Freighter/Albedo wallet adapter adapters related to packages/wallets"
  "area: web|d4c5f9|Views and API routes related to apps/web (Next.js)"
  
  "priority: critical (p0)|b60205|Blocks releases, production deployment, or breaks core APIs"
  "priority: high (p1)|d93f0b|Important feature request or high-visibility bug fix"
  "priority: medium (p2)|fbca04|Standard issues, enhancements, or bug fixes"
  "priority: low (p3)|0e8a16|Minor bug fixes, nice-to-have features, or chores"
  
  "status: blocked|e11d21|Work is blocked by an external dependency or another issue"
  "status: in-progress|fe1351|Work is active or currently being drafted"
  "status: triaged|c2e0c6|Acknowledged, verified, and prioritized by maintainers"
  "status: review-needed|fbca04|Implementation complete; awaiting review approval"
  "status: help-wanted|008672|Extra attention or community help is requested"
  "status: good-first-issue|7057ff|Good starting point for new contributors"
  
  "difficulty: easy|c2e0c6|Simple task requiring minimal knowledge of the codebase"
  "difficulty: medium|fef2c0|Standard developer task requiring basic codebase context"
  "difficulty: hard|f9d0c4|Complex architecture alterations requiring deep understanding"
  
  "ecosystem: soroban|e99695|Soroban WebAssembly smart contract interactions"
  "ecosystem: horizon|c5def5|Horizon server endpoints and REST transactions API"
  "ecosystem: quickstart|0e8a16|Stellar quickstart docker container configurations"
)

# Fetch existing labels
echo "🔍 Fetching existing repository labels..."
EXISTING_LABELS=$(gh label list --limit 100 --json name --jq '.[].name' || echo "")

for label_info in "${LABELS[@]}"; do
  IFS="|" read -r name color description <<< "$label_info"
  
  if echo "$EXISTING_LABELS" | grep -qxF "$name"; then
    echo "🔄 Updating existing label: '$name'..."
    gh label edit "$name" --color "$color" --description "$description"
  else
    echo "➕ Creating new label: '$name'..."
    gh label create "$name" --color "$color" --description "$description"
  fi
done

echo "✅ Labels synchronization complete."
