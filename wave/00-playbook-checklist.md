# Stellar Wave Playbook — Applied to Stellar Streams

This directory is the working record of the Stellar Wave Builder playbook applied to
[`SorobanForge/stellar-streams`](https://github.com/SorobanForge/stellar-streams) — the payment
streaming, vesting, splits, and escrow protocol in this repository.

Each file below is the deliverable for one phase. Where a phase produced a code or config change,
the change lives in the repo and is linked from the phase file.

| Phase | Deliverable                                                     | Status      |
| :---- | :-------------------------------------------------------------- | :---------- |
| 1     | [Ecosystem landscape](01-ecosystem-landscape.md)                | ✅ complete |
| 2     | [Product directions](02-product-directions.md)                  | ✅ complete |
| 3     | [Critical review](03-critical-review.md)                        | ✅ complete |
| 4     | [Naming, scope, repo structure](04-scope-and-repo-structure.md) | ✅ complete |
| 5     | [Contract specification](05-contract-specification.md)          | ✅ complete |
| 6     | [Contract system prompt](06-contract-system-prompt.md)          | ✅ complete |
| 7     | [App system prompt](07-app-system-prompt.md)                    | ✅ complete |
| 8     | [Deployment runbook](08-deployment-runbook.md)                  | ✅ complete |
| 9     | [Hosting & topology](09-hosting-topology.md)                    | ✅ complete |
| 10    | [Repo hygiene for approval](10-repo-hygiene.md)                 | ✅ complete |
| 11    | [Documentation site](11-docs-site-system-prompt.md)             | ✅ complete |
| 12    | [Submission package](12-submission-package.md)                  | ✅ complete |
| 13    | [Post-approval iteration](13-post-approval-iteration.md)        | ✅ complete |

## Evidence rules

Every claim about the ecosystem in Phase 1 and 3 comes from a live fetch performed on
**2026-10-08**, not from memory. Sources are linked inline. Anything that could not be verified is
labelled **unverified** rather than asserted.

## What this project is (one paragraph)

Stellar Streams is an open protocol for programmable payments on Stellar. Salary, grants, token
unlocks, and revenue shares are paid as continuous streams that vest linearly over time, with an
optional cliff, instead of as one-off transfers. Supplemental modules handle proportional payment
splits and arbiter-based escrow. It runs on Soroban smart contracts written in Rust, with a typed
TypeScript SDK and a Next.js dashboard.
