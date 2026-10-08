# Phase 3 — Critical Review

Skeptical review of every Phase 2 direction. The point of this phase is to kill weak ideas before
months are spent. Ratings are honest, and where infrastructure does not exist the direction is
**blocked**, not "hard."

---

## Direction A — Stellar Streams (primitive library)

**Weak spot (exact mechanism).** Streaming is _not_ blue ocean. `Fluxora-Contracts` is a live
Soroban streaming contract (Phase 1 §4). The failure mode is not "adoption is hard" — it is
**undifferentiation**: a reviewer sees a second linear-vesting contract and asks why it exists.
The answer must be concrete: this repo ships **three composable primitives plus a typed SDK**, where
Fluxora ships a streaming app.

**Infrastructure dependency.** None missing. SAC, Soroban RPC, and the token interface all exist
and are used here. **Not blocked.**

**Regulatory wall.** None structural. It is a payments primitive, not a licensed financial product.
A _payroll app_ on top would touch employment/KYC rules, but the primitive does not.

**Stellar fit.** High and load-bearing (SAC + ledger time + contract custody). Not "blockchain
because fast/cheap."

**MVP feasibility.** High. Contracts implemented, unit-tested, pass `clippy -D warnings`; SDK and
dashboard exist.

**Verdict: STRONGEST — build this.** The differentiator (primitives + SDK, not a single app) is real
and defensible.

---

## Direction B — StreamPay (payroll app)

**Weak spot.** Two-sided cold start with a regulatory layer on top: you need employers (who demand
fiat off-ramp and employment-law compliance) and employees (who will not hold volatile tokens for a
month). The exact break is at **off-ramp**: without SEP-24 anchors covering the employer's
jurisdiction, the product cannot pay rent.

**Infrastructure dependency.** SEP-24 anchors exist but coverage is jurisdiction-dependent.
**Conditionally blocked** in any country without an anchor.

**Regulatory wall.** Real. Employment law, withholding, and money-transmission licensing.
**Structural blocker** for a permissionless submission.

**Stellar fit.** Medium — the contract is useful but the hard part is off-chain.

**MVP feasibility.** Low for a solo/small team.

**Verdict: WEAK.** Correct as a _future_ app layer, wrong as the Wave submission.

---

## Direction C — VestLock (token vesting)

**Weak spot.** Demand is periodic, not continuous: a token issuer sets a vesting schedule once and
then never touches the tool again. The exact break is **retention** — no reason for a user to
return, so usage is one-and-done.

**Infrastructure dependency.** None missing. **Not blocked.**

**Regulatory wall.** Low. Vesting configuration is not itself a licensed activity.

**Stellar fit.** High for the tokenization cohort (DTCC H1 2027, $3B RWA).

**MVP feasibility.** High — this is a constrained subset of Direction A.

**Verdict: CONDITIONAL.** Strong as a _positioning wedge_ for Direction A's vesting module; too narrow
as a standalone repo.

---

## Direction D — SplitRouter

**Weak spot.** Genuine white space, but a splits-only repo is small: after `create_split` and
`distribute` there are no more functions. The exact break is **scope** — not enough surface area to
justify (or sustain) a maintainer's attention.

**Infrastructure dependency.** None. **Not blocked.**

**Regulatory wall.** Low, though high-value splits can attract money-transmission scrutiny if run as
a service. Not structural for a primitive.

**Stellar fit.** High — atomic multi-party payout is exactly what a contract does better than a
custodial service.

**MVP feasibility.** High.

**Verdict: CONDITIONAL — merge into A** as a module, not a separate repo.

---

## Direction E — StreamMeter (streaming-gated access)

**Weak spot.** Depends on a **metering/reporting oracle that does not exist on Stellar** to attest
usage. The exact break is the oracle: without a trusted reading of "seconds used," the stream cannot
be gated. Hand-rolling that trust assumption just moves the counterparty problem off-chain.

**Infrastructure dependency.** Usage-attestation oracle — **missing. BLOCKED.**

**Regulatory wall.** Low.

**Stellar fit.** Medium.

**MVP feasibility.** Low until the oracle exists.

**Verdict: REJECT (blocked on missing infrastructure).**

---

## Direction F — Milestone escrow marketplace

**Weak spot.** Satur is total. The exact break is **duplication**: SafeTrust, Trustless Work, and
KindFi already cover P2P escrow, escrow infrastructure, and milestone crowdfunding respectively.

**Infrastructure dependency.** None.

**Regulatory wall.** Escrow-as-a-service can trigger money-transmitter rules depending on custody.

**Stellar fit.** High, but irrelevant given saturation.

**MVP feasibility.** High technically, but no differentiation.

**Verdict: REJECT (saturated).**

---

## Summary

| Direction | Verdict       | Decisive reason                                     |
| :-------- | :------------ | :-------------------------------------------------- |
| A         | **STRONGEST** | Primitives + SDK differentiates from Fluxora's app. |
| B         | WEAK          | Structural regulatory wall + off-ramp dependency.   |
| C         | CONDITIONAL   | Real wedge, too narrow standalone → fold into A.    |
| D         | CONDITIONAL   | White space, too small standalone → fold into A.    |
| E         | REJECT        | Blocked: no usage-attestation oracle on Stellar.    |
| F         | REJECT        | Saturated: three approved escrow repos already.     |

**Proceed with A**, incorporating C (vesting) and D (splits) as modules, and treating escrow as an
adjacent primitive rather than the headline. This is the scope this repository already implements.
