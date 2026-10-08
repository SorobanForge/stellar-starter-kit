# Phase 12 — Submission Package

Assemble every supporting link and the form copy **before** submitting. A submission without a
working demo reads as unfinished.

---

## 12.1 Confirm status first

- [ ] **Verify the repo is not already in the approved list.** Phase 1 fetched the live list
      (824 repos, first page); `SorobanForge/stellar-streams` did not appear in the sample and a
      targeted search did not surface it. **Status is unverified** — check the Wave dashboard
      directly for this repo before applying.

## 12.2 Supporting links (fill the pending ones)

| Item                        | Value                                                                            | Status                |
| :-------------------------- | :------------------------------------------------------------------------------- | :-------------------- |
| Live app URL                | `https://<vercel-project>.vercel.app`                                            | ⏳ deploy (Phase 9)   |
| Contracts repo              | https://github.com/SorobanForge/stellar-streams (contracts live in `contracts/`) | ✅                    |
| App repo                    | same repo (monorepo) — see §12.3                                                 | ✅                    |
| Contract verification links | `https://stellar.expert/explorer/testnet/contract/<ID>` ×3                       | ⏳ deploy (Phase 8)   |
| Documentation site          | `<gitbook-url>`                                                                  | ⏳ publish (Phase 11) |
| Demo video                  | short screen recording: create stream → watch vest → withdraw → cancel           | ⏳ record             |

> The demo must show the **actual flow end to end**, not slides. Create a stream, show the vested
> balance increasing, withdraw, and cancel.

## 12.3 Repo relationship description

Because this is a **single monorepo**, submit one repo. If the form asks how the pieces connect:

> `stellar-streams` is a single monorepo. `contracts/` is a Rust workspace containing three
> independent Soroban contracts (`stream`, `splits`, `escrow`). `packages/sdk` is a typed TypeScript
> client that speaks to those contracts over Soroban RPC, and `packages/{types,utils,hooks,wallets}`
> are its shared dependencies. `apps/web` is a Next.js dashboard that consumes the SDK. The
> dependency direction is strictly contracts → SDK → app; the contracts are deployed first and their
> ids are injected into the app as environment variables.

(If the repo is later split, replace this with the two-repo relationship text and state that the
contract repo deploys first.)

## 12.4 Planned issues description

Grounded in the issues `scripts/create-issues.sh` actually creates. Organise by area:

> Planned work is tracked as scoped GitHub issues, created in one batch, split by area so
> contributors can pick up independent work:
>
> **Contracts:** align escrow TTL constants with the other contracts; add fee-cap and cliff-boundary
> tests; add a local-node integration test for a full stream lifecycle.
>
> **SDK:** add a typed `SplitsClient` mirroring `StreamsClient`; add bounded retry/backoff around
> transaction submission and polling.
>
> **Dashboard:** add a `/splits` page; poll active stream state instead of manual reloads; link
> transactions to Stellar Expert.
>
> **Utils:** optional localized number/duration formatting without regressing precise output.
>
> **Docs/CI:** publish deployed contract ids; enforce branch protection with the real CI check names.

## 12.5 Project description for the submission form

> Stellar Streams is an open protocol for programmable payments on Stellar. Instead of sending money
> as a single transfer, a payer locks funds in a Soroban smart contract and has them unlock
> continuously to a recipient over a chosen period, with an optional cliff — so salaries, grants,
> token unlocks, and revenue shares accrue second by second and can be withdrawn at any time, while a
> cancellation refunds only the unvested portion. It also ships proportional payment splits and
> arbiter-based escrow as reusable primitives. The protocol is written in Rust for Soroban and used
> through a typed TypeScript SDK and an open Next.js dashboard. This matters now because tokenized
> real-world assets on Stellar passed $3B in June 2026, and team/investor vesting and token unlocks
> are a concrete need for that cohort. The contracts are unaudited and currently targeted at
> Testnet.

Keep it to that one paragraph. Do not add hype.

## 12.6 Pre-submit checklist

- [ ] Not already approved (verified in dashboard)
- [ ] Testnet deployed; ids recorded in `docs/deployments.md`
- [ ] Live app URL shows the streams dashboard with working wallet connect
- [ ] Docs site published and linked
- [ ] Demo video recorded, end-to-end
- [ ] Issues created via `scripts/create-issues.sh`; labels applied
- [ ] Branch protection and topics configured
- [ ] README maintainer table has a reachable contact
- [ ] `v0.1.0` release created with contract addresses
