# Good first issues

A curated set of well-scoped, independently solvable issues. Each entry is written so it can be
copied straight into GitHub with the suggested labels and complexity.

Complexity maps to Drips Wave points: **Trivial** (100), **Medium** (150), **High** (200).

---

## 1. Add a `/splits` dashboard page

- **Labels:** `type: feature`, `area: web`, `status: good-first-issue`, `difficulty: medium`
- **Complexity:** Medium
- **Context:** The dashboard has `/streams`; the `splits` contract has no UI.
- **Task:** Add `apps/web/src/app/splits/page.tsx` that lets a user create a split (recipients +
  shares) and distribute a token amount to it.
- **Acceptance:** Uses a `SplitsClient` in `@stellar-starter-kit/sdk` (add one, mirroring
  `StreamsClient`), validates inputs, and reports transaction errors.

## 2. `SplitsClient` in the SDK

- **Labels:** `type: feature`, `area: sdk`, `status: good-first-issue`, `difficulty: medium`
- **Complexity:** Medium
- **Context:** Only `StreamsClient` exists.
- **Task:** Add a typed `SplitsClient` covering `create_split`, `distribute`, `get_split`,
  `next_split_id`.
- **Acceptance:** Typechecks, mirrors `StreamsClient` structure, and is exported from the package.

## 3. Poll stream state in the dashboard

- **Labels:** `type: feature`, `area: web`, `status: good-first-issue`, `difficulty: easy`
- **Complexity:** Trivial
- **Context:** `useStream` supports a `pollMs` argument that the UI never passes.
- **Task:** Pass a sensible interval when a stream is open and `streaming`, and stop polling when it
  is `completed`/`cancelled`.
- **Acceptance:** Vesting progress updates without a manual reload; no polling once terminal.

## 4. Retry/backoff around `sendTransaction`

- **Labels:** `type: feature`, `area: sdk`, `difficulty: medium`
- **Complexity:** Medium
- **Context:** A transient RPC error currently aborts a write.
- **Task:** Add bounded retry with backoff around submission and polling in `StreamsClient`.
- **Acceptance:** Configurable attempts; still surfaces permanent errors cleanly.

## 5. Contract edge-case tests

- **Labels:** `type: test`, `area: contracts`, `status: good-first-issue`, `difficulty: easy`
- **Complexity:** Trivial
- **Context:** `stream` has 13 tests; boundary coverage can improve.
- **Task:** Add tests for: fee at the 10% cap, a stream whose `cliff == end`, and withdrawing the
  exact full amount twice.
- **Acceptance:** New `#[test]`s pass under `cargo test`.

## 6. Document deployed contracts

- **Labels:** `type: documentation`, `status: good-first-issue`, `difficulty: easy`
- **Complexity:** Trivial
- **Task:** After a Testnet deploy, add a `docs/deployments.md` with contract ids and Stellar Expert
  links for `stream`, `splits`, and `escrow`.
- **Acceptance:** Links resolve on `stellar.expert`.

## 7. Localized number/duration formatting

- **Labels:** `type: feature`, `area: utils`, `difficulty: easy`
- **Complexity:** Trivial
- **Task:** Add optional `Intl`-based formatting to `formatStroopsToXlm`/`formatDuration` without
  regressing the precise default output.
- **Acceptance:** Existing tests still pass; new tests cover the localized paths.

## 8. Integration test against a local node

- **Labels:** `type: test`, `area: contracts`, `difficulty: hard`
- **Complexity:** High
- **Task:** Add a Soroban integration test (or script) that starts a local node, deploys `stream`,
  creates a stream, advances ledger time, and withdraws.
- **Acceptance:** Runs in CI as an optional job; documented in `docs/development-guide.md`.

---

## Contribution flow

1. Comment on the issue to get assigned.
2. Branch from `main`: `git checkout -b feat/<short-name>`.
3. Keep PRs focused; run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and (for contract changes)
   `pnpm test:contracts`.
4. Open a PR using the template and reference the issue.
