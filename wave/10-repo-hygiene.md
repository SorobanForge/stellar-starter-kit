# Phase 10 — Repo Hygiene for Program Approval

Brings the repo to the standard of what is already approved. Where a standard required an actual
change, the change is in the repo and linked here — this is not just a document.

The approved-repo pattern was confirmed by reading live Wave listings (Phase 1): banner/logo,
badges, maintainer table with contact (Telegram is common), community link, concise architecture,
quick-start commands, contributing section, and a contributors credit image. Heavy inline diagrams
are **optional** — check the top repos before assuming a format.

---

## 10.1 Branch protection — ✅ tooling added, ⏳ run it

- Required: PRs on `main`, 1 approving review, dismiss stale reviews, code-owner review, and the CI
  status checks whose **contexts are the actual job names** in `.github/workflows/`:
  - `Lint Codebase` (ci.yml)
  - `Run TypeScript Checks` (ci.yml)
  - `Run Unit Tests` (ci.yml)
  - `Test Soroban Contracts` (ci.yml)
  - `Verify Production Build` (ci.yml)
  - (`Validate PR Title` from pr-check.yml is optional as a required check.)
- Script: [`scripts/setup-branch-protection.sh`](../scripts/setup-branch-protection.sh).
  **Action:** run it (`pnpm repo:protect`) with an admin token.

## 10.2 Community files

| File                 | Status     | Notes                                                                          |
| :------------------- | :--------- | :----------------------------------------------------------------------------- |
| `CONTRIBUTING.md`    | ✅ present | Prereqs, workflow, Conventional Commits, PR steps.                             |
| `SECURITY.md`        | ✅ present | Responsible-disclosure contact (`ademolabuild@gmail.com`), supported versions. |
| `CODE_OF_CONDUCT.md` | ✅ present |                                                                                |
| `CODEOWNERS`         | ✅ present | `* @SorobanForge`.                                                             |
| `CHANGELOG.md`       | ✅ present | Keep-a-Changelog format.                                                       |
| Audit disclaimer     | ✅ present | README states the contracts are unaudited and not on Mainnet.                  |

**Action for SECURITY.md:** add an explicit **scope** statement and an **audit status** disclaimer to
match the approved pattern. Tracked as a follow-up in Phase 13.

## 10.3 README — ✅ updated this pass

The README already had a banner, badges, architecture mermaid, quick start, and contributing. Added
to match the approved pattern:

- **Maintainers** table with a contact column (Telegram placeholder — fill before submission).
- **Community** section linking GitHub Discussions.
- **Deployments** section linking `docs/deployments.md`.
- **Contributors** credit via `contrib.rocks`.

**Action:** replace the Telegram placeholder with the real handle.

## 10.4 GitHub topics — ✅ script added, ⏳ run it

- Topics: `stellar`, `soroban`, `smart-contracts`, `rust`, `typescript`, `payment-streams`,
  `vesting`, `defi`, `web3`, `nextjs`, `stellar-wave`.
- Script: [`scripts/set-topics.sh`](../scripts/set-topics.sh) → `pnpm repo:topics`.

## 10.5 Issue generation at scale — ✅ script added

- [`scripts/create-issues.sh`](../scripts/create-issues.sh) creates the full planned backlog in one
  run via `gh`. Each issue has a commit-style title, labels
  (`type:*`, `area:*`, `difficulty:*`, `status: good-first-issue`), and a body with **Summary**,
  **Acceptance Criteria** checkboxes, and **Tech Stack**.
- Run with `./scripts/create-issues.sh` (or `--dry-run` to preview). `pnpm create:issues`.
- The issues are split by contract/component so contributors can find scoped work:
  contracts (TTL alignment, fee-cap tests, local-node integration), SDK (`SplitsClient`, retry),
  utils (localized formatting), web (`/splits` page, polling, explorer links), docs, and CI.

## 10.6 Labels — ✅ present

`.github/labels.yml` defines 35 labels and `scripts/create-labels.sh` syncs them. ⏳ run
`./scripts/create-labels.sh` if labels are not yet on the repo.

## 10.7 Release tag — ⏳ blocked on deployment

A `v0.1.0` tag whose release body lists the deployed contract addresses cannot be created until a
Testnet deployment exists. Exact command once ids are known:

```bash
git tag -a v0.1.0 -m "v0.1.0 — initial Testnet deployment"
git push origin v0.1.0
gh release create v0.1.0 \
  --title "v0.1.0 — Testnet" \
  --notes "$(cat docs/deployments.md)"
```

**Action:** deploy (Phase 8), then run the above.

## 10.8 Summary checklist

- [x] CONTRIBUTING.md · SECURITY.md · CODE_OF_CONDUCT.md · CODEOWNERS · CHANGELOG.md
- [x] README rewritten to the approved pattern (maintainers, community, contributors credit)
- [x] Issue-generation script (`scripts/create-issues.sh`)
- [x] Branch-protection script with real CI job names (`scripts/setup-branch-protection.sh`)
- [x] Topics script (`scripts/set-topics.sh`)
- [x] `docs/deployments.md` record template
- [ ] Run `scripts/create-issues.sh`, `scripts/setup-branch-protection.sh`, `scripts/set-topics.sh`
- [ ] Fill the Telegram handle in the README maintainer table
- [ ] Deploy to Testnet, then tag `v0.1.0` with the contract addresses
