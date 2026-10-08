# Phase 2 — Product Directions

Directions grounded in Phase 1's landscape. For each: the real-world problem, the Stellar primitives
it uses and why they are **load-bearing** (not decorative), and its fit against what is already
approved.

---

## Direction A — Stellar Streams _(the direction this repo implements)_

**Problem.** Salaries, grants, token unlocks, and revenue shares are paid today as lump-sum
transfers. The recipient is exposed to the payer's default risk for the whole period, the payer has
no way to stop paying for work that has stopped, and neither side has a live, auditable record of
what has accrued. Traditional escrow fixes the trust problem but reintroduces a counterparty
holding the money. Payroll and vesting tools exist off-chain but require trusting a company with the
funds.

**Stellar primitives used, and why they're load-bearing.**

- **Soroban contracts** — hold the locked funds and enforce the vesting curve. Without a contract
  there is no party that can be trusted _not_ to move the money; the contract replaces that party.
- **SAC / SEP-41 token interface** — lets the same contract stream XLM and any issued asset
  (USDC, tokenized RWAs) through one code path. This is _why_ it is generic, not Stellar-decorative.
- **Ledger timestamp** — vesting is computed from `env.ledger().timestamp()`, so "what has vested"
  is a property of the chain, not of either party's clock.
- **SHA-256 / contract storage** — each stream is immutable, addressable state anyone can read.

**Fit vs. approved list.** Streaming/vesting did not appear in the live sample, but
`Fluxora-Contracts` is a direct competitor (Phase 1 §4). Differentiation must be the **primitive
library + typed SDK + splits/escrow modules**, not "we do streaming" alone.

---

## Direction B — StreamPay: payroll product on top of the primitive

**Problem.** A company wants to run monthly payroll in streams but will not integrate a contract
SDK by hand. It needs employee onboarding, fiat off-ramp, and a compliance trail.

**Primitives.** Same Soroban stream contract; SEP-12/SEP-24 for identity and off-ramp; Horizon for
payout history.

**Fit.** Crowded — `Stellopay` and the `Emmy123222/*` cluster already do merchant/payment
frontends. Building the _app_ without owning the _primitive_ is thin differentiation.

---

## Direction C — VestLock: token vesting for issuing teams

**Problem.** A team issuing an RWA or a token on Stellar needs a cliff-and-linear schedule for
team/investor allocations that is publicly verifiable. Grant reviewers and investors want to see
the lock, not a spreadsheet.

**Primitives.** Soroban contract holds the allocation; SAC exposes the issued asset; ledger time
drives the curve.

**Fit.** Strong _timing_ wedge — tokenization on Stellar is scaling (DTCC H1 2027, $3B RWA) and no
approved repo in the live sample does vesting-as-a-service. But it is a **niche app**, not a
primitive library.

---

## Direction D — SplitRouter: proportional payout primitive

**Problem.** Revenue from one sale must be routed to many contributors (marketplaces, creator
platforms, DAOs) without a custodial payout service. Doing it in many separate transfers is
non-atomic and leaks dust.

**Primitives.** Soroban contract computes `amount * share / total_shares` on-chain and pays all
recipients in **one atomic transaction**; the token interface handles any asset.

**Fit.** Genuine white space — no approved repo in the sample does this as a standalone primitive.
But a splits-only product is too small to carry a Wave repo on its own; it belongs as a module.

---

## Direction E — StreamMeter: streaming-gated API/subscription access

**Problem.** Pay-as-you-go access to an API or service, billed per second of use, where the service
can cut access the moment payment stops.

**Primitives.** Stream contract + an oracle/meter reading; the "stream" acts as a payment channel.

**Fit.** Overlaps the crowded x402/agent-payment space (`routedock`, `stellarmind`). Also depends on
an off-chain metering oracle that does not exist here — flagged in Phase 3.

---

## Direction F — Milestone escrow marketplace

**Problem.** Freelance work paid against milestones with dispute resolution.

**Primitives.** Escrow contract + arbiter + deadline.

**Fit. Reject on saturation.** Escrow is the single most crowded domain in the approved list
(SafeTrust, Trustless Work, KindFi). Entering it head-on duplicates existing work.

---

## Selected direction

**A + C + D combined: a composable payment-primitive library (streams, vesting, splits, escrow)
with a typed SDK and a reference dashboard, positioned to serve the tokenization/vesting wave.**

This is what the repository already is. Phase 3 tests whether it deserves to be built as scoped.
