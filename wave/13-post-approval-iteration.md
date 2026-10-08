# Phase 13 — Post-Approval Iteration

Once approved, treat every new gap the same way: scope it honestly, sequence it correctly, and write
it with the same rigor as the original batch. Never build a fix before confirming which existing
architecture it depends on — shipping a frontend feature before its contract dependency is deployed
creates bugs that look like regressions.

This repo is a single monorepo, so "cross-repo" coordination in the playbook becomes **cross-layer**
coordination: a `packages/*` issue that depends on a `contracts/*` change must say so, and the
contract must land first.

---

## Process

1. **Scope honestly.** Is it a quick addition or does it touch core architecture? Say so _before_
   writing the issue.
2. **State the dependency.** If it spans layers, add an explicit `Depends on #<n>` and sequence
   contracts → SDK → app.
3. **Write the issue** with: Summary, why it matters, scoped options if there's a design decision,
   Acceptance Criteria as checkboxes, Tech Stack.
4. **Confirm the target** before building.

---

## Worked examples for this project

### Example A — SECURITY.md scope and audit disclaimer _(documentation, no dependency)_

- **Scope:** quick. Documentation only.
- **Why:** the approved-repo pattern wants an explicit scope and an audit-status disclaimer.
- **Acceptance Criteria:**
  - [ ] A "Scope" section states which contracts/versions reports apply to.
  - [ ] An "Audit status" line states the contracts are unaudited pre-1.0.
  - [ ] The disclosure contact is reachable and confirmed.
- **Tech Stack:** Markdown.

### Example B — Arbitrary-token support end-to-end _(spans contracts → SDK → app)_

- **Scope:** touches core UX, not architecture. The contracts already stream any SEP-41 token; the
  gap is app-side and in `packages/types`.
- **Depends on:** nothing on-chain — the contract interface is already token-agnostic.
- **Options:**
  1. Keep a single configurable `NEXT_PUBLIC_TOKEN_CONTRACT_ID` (simplest, today's behaviour).
  2. Add a token picker that reads a known list per network (more UX, needs a small registry).
- **Acceptance Criteria:**
  - [ ] A chosen token other than XLM can be streamed from `/streams`.
  - [ ] Amount formatting respects the token's decimals (XLM/SAC = 7).
  - [ ] Existing XLM flow is unchanged.
- **Tech Stack:** Next.js 15, TypeScript, `packages/types`, `packages/utils`.

### Example C — Event indexer for "my streams" _(spans contracts → new service → app)_

- **Scope:** architecture. Introduces a new long-running service and database (Phase 9 §9.2).
- **Depends on:** nothing on-chain (the events exist), but requires the hosting topology decision to
  be made first.
- **Acceptance Criteria:**
  - [ ] Service tails `stream`/`splits`/`escrow` events and stores them.
  - [ ] `GET /accounts/:address/streams` returns ids for a wallet.
  - [ ] Dashboard lists a wallet's streams without a known id.
  - [ ] Deployed per Phase 9 (Render + Render Postgres, internal connection string).
- **Tech Stack:** TypeScript/Node (or Go), Postgres, Soroban RPC.

### Example D — Milestone / non-linear vesting _(contracts-first)_

- **Scope:** touches core architecture — the vesting curve is a core invariant.
- **Depends on:** design decision on the schedule representation before any code.
- **Options:**
  1. Add a `milestones: Vec<(u64, i128)>` to a new `StreamV2` (keeps `Stream` frozen).
  2. Extend `Stream` in place (contract upgrade required; risky for live streams).
- **Acceptance Criteria:**
  - [ ] Schedule representation chosen and documented in `wave/05-contract-specification.md`.
  - [ ] `vested_amount` handles milestone schedules; boundary tests added.
  - [ ] SDK decodes the new shape; existing linear streams still work.
- **Tech Stack:** Rust/soroban-sdk 27, TypeScript SDK.

---

## Guardrails

- Never ship an app feature that reads a field or calls a function the deployed contract does not yet
  expose. Deploy the contract change first.
- When a new issue changes a public contract signature, update
  `wave/05-contract-specification.md` in the same PR.
- Keep the issue body format identical to the original batch so contributors see a consistent
  standard.
