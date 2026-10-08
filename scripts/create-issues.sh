#!/usr/bin/env bash
# Create every planned Stellar Wave issue for stellar-streams in a single run.
#
# Each issue is scoped so a contributor can pick it up independently. Titles use
# commit-style prefixes ("feat(scope): ..."), bodies follow Summary / Acceptance
# Criteria (checkboxes) / Tech Stack, and labels come from .github/labels.yml.
#
# Usage:
#   ./scripts/create-issues.sh            # create all issues
#   ./scripts/create-issues.sh --dry-run  # print what would be created
#
# Requires the GitHub CLI, authenticated: `gh auth login`.

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
fi

if ! command -v gh &>/dev/null; then
    echo "Error: the GitHub CLI ('gh') is not installed. See https://cli.github.com/."
    exit 1
fi

if ! gh auth status &>/dev/null; then
    echo "Error: not authenticated with GitHub CLI. Run 'gh auth login' first."
    exit 1
fi

create_issue() {
    local title="$1" labels="$2" body="$3"

    if [[ "$DRY_RUN" == "true" ]]; then
        echo "---- [dry-run] $title"
        echo "     labels: $labels"
        return 0
    fi

    # shellcheck disable=SC2086
    gh issue create --title "$title" --label "$labels" --body "$body"
}

# ---------------------------------------------------------------------------
# Contracts (Rust / Soroban)
# ---------------------------------------------------------------------------

create_issue \
    "feat(contracts): align escrow TTL constants with stream and splits" \
    "type: chore,area: contracts,difficulty: easy,status: good-first-issue" \
    "$(cat <<'EOF'
## Summary

`escrow` bumps its persistent entries with `(BUMP_THRESHOLD, BUMP_LIMIT)` of
`(10_000, 50_000)`, while `stream` and `splits` use `(17_280, 518_400)`. The escrow
entries can expire far sooner than a long-dated agreement needs.

## Acceptance Criteria

- [ ] Escrow TTL constants are raised to match `stream` / `splits` (`17_280`, `518_400`).
- [ ] A test asserts an escrow created near its deadline is still readable after the old limit.
- [ ] `cargo test`, `cargo fmt --check`, and `cargo clippy -D warnings` pass.

## Tech Stack

Rust, soroban-sdk 27.0.0, `wasm32v1-none`.
EOF
)"

create_issue \
    "feat(stream): add fee-cap boundary tests" \
    "type: test,area: contracts,difficulty: easy,status: good-first-issue" \
    "$(cat <<'EOF'
## Summary

Boundary coverage for the protocol fee is thin. Add tests for the exact cap and
for a stream whose cliff equals its end.

## Acceptance Criteria

- [ ] Test: `fee_bps == 1000` (the 10% cap) withdraws correctly.
- [ ] Test: `fee_bps == 1001` returns `InvalidFee`.
- [ ] Test: `cliff_time == end_time` releases everything at `end_time`.
- [ ] Test: withdrawing the full amount twice returns `NothingToWithdraw` the second time.

## Tech Stack

Rust, soroban-sdk 27.0.0 testutils.
EOF
)"

create_issue \
    "feat(contracts): integration test against a local node" \
    "type: test,area: contracts,difficulty: hard" \
    "$(cat <<'EOF'
## Summary

Unit tests use the mocked `Env`. Add an integration test that starts a local
Stellar node, deploys `stream`, creates a stream, advances ledger time, and
withdraws.

## Acceptance Criteria

- [ ] Script/test starts `docker compose up -d` and waits for RPC readiness.
- [ ] Deploys the optimized `stream` WASM, initializes it, creates a stream, withdraws.
- [ ] Runs as an optional CI job (not on every PR) and is documented in `docs/development-guide.md`.

## Tech Stack

Rust, `stellar-cli`, Docker (Stellar Quickstart), Bash.
EOF
)"

# ---------------------------------------------------------------------------
# SDK / utils
# ---------------------------------------------------------------------------

create_issue \
    "feat(sdk): add SplitsClient" \
    "type: feature,area: sdk,difficulty: medium,status: good-first-issue" \
    "$(cat <<'EOF'
## Summary

The `splits` contract has no typed TypeScript client. Add `SplitsClient` mirroring
`StreamsClient`, covering `create_split`, `distribute`, `get_split`, `next_split_id`.

## Acceptance Criteria

- [ ] `SplitsClient` exported from `@stellar-starter-kit/sdk`.
- [ ] Read methods simulate; write methods prepare/sign/submit/poll.
- [ ] `recipients: Vec<Address>` and `shares: Vec<u32>` are correctly XDR-encoded.
- [ ] `pnpm typecheck` passes.

## Tech Stack

TypeScript 5, `@stellar/stellar-sdk` 14, Soroban RPC.
EOF
)"

create_issue \
    "feat(sdk): bounded retry with backoff around sendTransaction" \
    "type: feature,area: sdk,difficulty: medium,status: good-first-issue" \
    "$(cat <<'EOF'
## Summary

A transient RPC error currently aborts a write. Add bounded retry/backoff around
submission and polling in `StreamsClient`.

## Acceptance Criteria

- [ ] Configurable attempts and base delay via client options.
- [ ] Permanent errors (simulation failure, ERROR status) are not retried.
- [ ] Tests cover the retry and give-up paths.

## Tech Stack

TypeScript 5, `@stellar/stellar-sdk` 14, Vitest.
EOF
)"

create_issue \
    "feat(utils): localized number and duration formatting" \
    "type: feature,area: utils,difficulty: easy,status: good-first-issue" \
    "$(cat <<'EOF'
## Summary

Add optional `Intl`-based formatting to `formatStroopsToXlm` and `formatDuration`
without regressing the precise default output.

## Acceptance Criteria

- [ ] Default output is byte-for-byte unchanged (existing tests pass).
- [ ] Optional locale argument switches to `Intl` grouping.
- [ ] New tests cover the localized paths.

## Tech Stack

TypeScript 5, Vitest, `Intl`.
EOF
)"

# ---------------------------------------------------------------------------
# Dashboard / app
# ---------------------------------------------------------------------------

create_issue \
    "feat(web): add a /splits dashboard page" \
    "type: feature,area: web,difficulty: medium,status: good-first-issue" \
    "$(cat <<'EOF'
## Summary

The dashboard has `/streams` and `/escrow`; the `splits` contract has no UI. Add a
`/splits` page to create a split and distribute a token amount.

## Acceptance Criteria

- [ ] Form to add recipients and integer shares; validates non-empty, non-zero, no duplicates.
- [ ] Uses `SplitsClient` once available (depends on the SDK issue).
- [ ] Reports transaction hash and errors.
- [ ] `pnpm typecheck` and `pnpm build` pass.

## Tech Stack

Next.js 15, React 19, TypeScript, Tailwind.
EOF
)"

create_issue \
    "feat(web): poll stream state while a stream is active" \
    "type: feature,area: web,difficulty: easy,status: good-first-issue" \
    "$(cat <<'EOF'
## Summary

`useStream` accepts a `pollMs` argument the UI never passes, so vesting progress
only updates on manual reload.

## Acceptance Criteria

- [ ] Pass a sensible interval while the stream is `streaming`.
- [ ] Stop polling once the stream is `completed` or `cancelled`.
- [ ] Interval is cleared on unmount.

## Tech Stack

React 19, `@stellar-starter-kit/hooks`.
EOF
)"

create_issue \
    "feat(web): link transactions to Stellar Expert" \
    "type: feature,area: web,difficulty: easy,status: good-first-issue" \
    "$(cat <<'EOF'
## Summary

After a write, the dashboard shows a hash but no explorer link. Add links using
`NEXT_PUBLIC_STELLAR_EXPERT_URL`.

## Acceptance Criteria

- [ ] Successful create/withdraw/cancel show a clickable explorer link.
- [ ] Base URL is read from the new env var; no hard-coded host.
- [ ] `pnpm lint` and `pnpm build` pass.

## Tech Stack

Next.js 15, React 19, `NEXT_PUBLIC_STELLAR_EXPERT_URL`.
EOF
)"

# ---------------------------------------------------------------------------
# Docs / infra
# ---------------------------------------------------------------------------

create_issue \
    "docs: publish deployed contract ids" \
    "type: documentation,difficulty: easy,status: good-first-issue" \
    "$(cat <<'EOF'
## Summary

After a Testnet deployment, publish the contract ids and explorer links so
reviewers can verify on-chain.

## Acceptance Criteria

- [ ] `docs/deployments.md` filled from `apps/web/src/generated/deployments.json`.
- [ ] Every id links to `stellar.expert` and resolves.
- [ ] Linked from the README.

## Tech Stack

Markdown, `stellar-cli`.
EOF
)"

create_issue \
    "ci: enforce branch protection checks on main" \
    "type: chore,area: config,difficulty: easy" \
    "$(cat <<'EOF'
## Summary

Configure branch protection for `main`: require PRs, one approval, and the CI
jobs as required status checks.

## Acceptance Criteria

- [ ] PRs required, at least one approval, stale reviews dismissed.
- [ ] Required checks: `Lint Codebase`, `Run TypeScript Checks`, `Run Unit Tests`, `Test Soroban Contracts`, `Verify Production Build`.
- [ ] Force-pushes and deletions blocked.

## Tech Stack

GitHub branch protection (via `scripts/setup-branch-protection.sh`).
EOF
)"

echo ""
echo "Issue creation complete."
