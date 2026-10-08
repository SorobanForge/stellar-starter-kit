# Phase 4 — Naming, Scope, and Repo Structure

## 4.1 Name

**Stellar Streams** — final. GitHub: [`SorobanForge/stellar-streams`](https://github.com/SorobanForge/stellar-streams).
The package scope stays `@stellar-starter-kit/*` to avoid a mass rename; the _product_ name is
Stellar Streams and that is what every user-facing surface says.

## 4.2 One-paragraph description (non-technical + grant reviewer)

> Stellar Streams is an open protocol for programmable payments on Stellar. Instead of sending money
> as a single transfer, anyone can lock funds in a smart contract and have them unlock continuously
> to a recipient over a chosen period — with an optional cliff — so salaries, grants, token unlocks,
> and revenue shares accrue second by second and can be withdrawn at any time. It also provides
> proportional payment splits and arbiter-based escrow. Everything runs on Soroban contracts written
> in Rust, with a typed TypeScript SDK and an open web dashboard any Stellar app can build on.

## 4.3 Scope — in and out

**In scope for this submission**

- `stream` contract: linear vesting, cliffs, cancel/refund, optional protocol fee, TTL bumping.
- `splits` contract: proportional, atomic, dust-safe multi-party payouts.
- `escrow` contract: arbiter escrow with deadline refunds and explicit state machine.
- `@stellar-starter-kit/sdk`: typed `StreamsClient` for reads and writes.
- `@stellar-starter-kit/{types,utils,hooks,wallets,ui,contracts}`: shared TS surface.
- `apps/web`: reference dashboard (`/`, `/streams`, `/escrow`, `/docs`).

**Explicitly out of scope** (so reviewers don't read absence as an oversight)

- Fiat off-ramp / anchor integrations (no SEP-24 — that is a payroll _app_, rejected in Phase 3).
- Usage-attestation oracles (Phase 3 Direction E — blocked).
- Mainnet deployment and external audit (Tracked on the roadmap; the contracts are unaudited
  pre-1.0 and the README says so).

## 4.4 Repo structure — decision

**Decision: keep the single monorepo; do not split into `stellar-streams-contract` and
`stellar-streams-app` at this time.**

The playbook's default is to split to maximize Wave surface area (two eligible repos). Applying the
same reasoning to _this_ repo:

- **Argument for splitting:** two repos = two approvable surfaces = potentially more Wave points.
- **Argument against splitting here:** the contract layer (~3 small crates, ~29 tests) and the app
  layer share no build graph today, but they _do_ share a single maintainer and a single release
  cadence. Splitting now would add cross-repo version-pinning overhead (SDK must track contract
  events and storage layout) without adding a _distinct_ contributor population — the same person
  maintains both. The approved Wave list is full of single monorepos (e.g. `offer-hub-monorepo`,
  `akkuea`, `kindfi`), so a monorepo is not a non-starter.
- **Revisit when:** there is more than one maintainer per layer, or the contract repo needs its own
  release/audit cadence independent of the app.

If the team later decides to split, the exact plan is:

```
stellar-streams-contract/          # pure Rust workspace
├── Cargo.toml
├── rust-toolchain.toml
├── clippy.toml
├── rustfmt.toml
├── stream/
├── splits/
└── escrow/

stellar-streams-app/               # pnpm + Turborepo monorepo
├── packages/{sdk,types,utils,hooks,wallets,ui,contracts}
├── apps/web
├── scripts/
└── docs/
```

The contract repo builds first and publishes its WASM/contract ids, which the app repo consumes as
environment variables. **Dependency order is contracts → app, always.**

## 4.5 Current on-disk structure (what actually exists)

```
.
├── contracts/                 # Rust workspace, soroban-sdk 27.0.0, target wasm32v1-none
│   ├── Cargo.toml
│   ├── rust-toolchain.toml
│   ├── rustfmt.toml
│   ├── clippy.toml
│   ├── stream/                # ⭐ continuous streaming + vesting + protocol fee
│   ├── splits/                # proportional splits
│   └── escrow/                # arbiter escrow
├── packages/
│   ├── sdk/                   # @stellar-starter-kit/sdk     — StreamsClient
│   ├── types/                 # @stellar-starter-kit/types
│   ├── utils/                 # @stellar-starter-kit/utils
│   ├── hooks/                 # @stellar-starter-kit/hooks
│   ├── wallets/               # @stellar-starter-kit/wallets
│   ├── ui/                    # @stellar-starter-kit/ui
│   ├── contracts/             # generated Soroban bindings
│   ├── eslint-config/         # shared ESLint config
│   └── tsconfig/              # shared tsconfig bases
├── apps/web/                  # Next.js 15 App Router dashboard
├── scripts/                   # cross-platform build/deploy/invoke (sh + ps1) + run.js
├── docs/                      # development guide, good-first-issues
├── wave/                      # this playbook record
└── .github/                   # workflows, issue templates, labels
```
