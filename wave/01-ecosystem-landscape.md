# Phase 1 — Ecosystem Landscape

All data below was fetched live on **2026-10-08**. Sources are linked. Nothing here is from memory.

---

## 1. The Stellar stack, as it actually exists now

| Layer             | What it is                                                                                                                                                                                                                                                        |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Consensus         | Stellar Consensus Protocol (SCP) — federated Byzantine agreement. Chain live since 2015.                                                                                                                                                                          |
| Smart contracts   | **Soroban**, Stellar's native WASM smart-contract platform. Written in Rust, `soroban-sdk`. This repo pins `soroban-sdk = "27.0.0"`.                                                                                                                              |
| Native DEX        | Built-in order book + path payments, no contract required for swaps.                                                                                                                                                                                              |
| Asset model       | Classic assets (XLM + issued assets) bridged to contracts via the **Stellar Asset Contract (SAC)** — the reason a contract can hold/stream XLM as a token.                                                                                                        |
| Standards         | SEP-1/SEP-10 (auth), SEP-12 (KYC), SEP-24/SEP-31 (anchors / cross-border), SEP-41 (token interface Soroban contracts implement).                                                                                                                                  |
| Client tooling    | Horizon (REST history/accounts), Soroban RPC (simulate + submit), `stellar-cli`, `stellar-sdk` (JS), Freighter/Albedo/Rabet/Hana wallets.                                                                                                                         |
| Current ecosystem | Tokenized RWAs passed **$3B** on Stellar by June 2026 (fystack.io, linked via search, 2026-10-08). DTCC announced tokenized assets natively on Stellar, expected H1 2027. MoneyGram, Circle, Franklin Templeton, DTCC all named as participants in that coverage. |

**Why it matters for this repo:** the SAC is the load-bearing primitive. A streaming contract can
only hold XLM because XLM is exposed as a Soroban token contract. Without it, "stream XLM" would
require a wrapper token.

---

## 2. Drips Wave — what it is and its scale

- Drips Wave is a recurring bounty cycle ("Fix, Merge, Earn") run one week per month per ecosystem.
  It launched with **Stellar as the first ecosystem in January 2026**
  ([Drips docs](https://docs.drips.network/wave/)).
- Wave 1: ~600 participants, **3,000+ PRs merged across 200+ repositories** in ten days. Wave 2
  opened **February 19, 2026** with application quotas (15 pending apps/contributor, 7
  contributors/org), post-contribution surveys, language filtering, and org profiles
  ([Lumen Loop changelog](https://lumenloop.com/news/changelog-key-improvements-stellar-wave-2)).
  Successive waves ran Mar, Jun, Jul 2026 and continue on the monthly cadence.
- **Current approved repo count: 824** — live from
  [drips.network/wave/stellar/repos](https://www.drips.network/wave/stellar/repos) on 2026-10-08.
- Maintainers apply repos; approved repos get issues tagged with point values by complexity;
  contributors earn points that convert to payouts.
- Point multipliers exist per repo (observed: `2x Points`, `4x Points`).

---

## 3. SDF funding priorities — stated, current

From [stellar.org/grants-and-funding](https://stellar.org/grants-and-funding) (fetched 2026-10-08):

- **SCF Build Award** — up to **$150,000 in XLM** for advanced projects moving concept → launch.
  Soroban projects can access **free security audits via the Soroban Audit Bank**.
- **SCF Grow Award** — post-mainnet growth: marketing fund, matching, Enterprise Fund.
- **Bug bounty** — up to $250k XLM protocol-wide; up to $50k USD for Soroban exploits.
- **Matching Fund** — up to $500k USD matching for pre-seed→Series B.
- **Academic, Marketing, Infrastructure grants, Currency Support** — additional tracks.
- SDF's stated goals: **financial inclusion, fast/inexpensive cross-border payments, efficient
  decentralized markets.**

**Implication:** programmable payments (streams/vesting/splits) sit directly on the
"fast and inexpensive cross-border payments" goal, and SDF funds audits for Soroban projects — a
concrete reason a contracts-forward submission is well-aligned.

---

## 4. Approved repos, categorized by domain (live sample, 2026-10-08)

Top of the approved list; categorized by what each actually does.

| Domain                    | Approved repos (live sample)                                                                                                                                      | Saturation               |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------- |
| **Escrow / P2P**          | `safetrustcr/frontend-SafeTrust`, `safetrustcr/backend-SafeTrust`, `Trustless-Work/trustlesswork-smart-contract-stellar`, `kindfi-org/kindfi` (milestone escrows) | **Saturated**            |
| **Agent payments / x402** | `winsznx/routedock` (x402 + MPP `client.pay()`), `Flamki/stellarmind` (x402 agent marketplace)                                                                    | **Saturated**            |
| **RWA / real estate**     | `akkuea/akkuea` ("Real Estate (RWA) + DeFi")                                                                                                                      | **Saturated**            |
| **Rental / marketplace**  | `Stellar-Rent/stellar-rent` (P2P rentals), `OFFER-HUB/offer-hub-monorepo` (freelance)                                                                             | **Saturated**            |
| **Payments / merchant**   | `Stellopay/stellopay-frontend`, `Emmy123222/*` (MicroPay, MarketPay, GreenPay, Search)                                                                            | Crowded                  |
| **Bridges**               | `karagozemin/OverSync` (Ethereum↔Stellar HTLC)                                                                                                                    | Crowded                  |
| **Privacy / markets**     | `karagozemin/Sub-Rosa` (sealed-bid markets)                                                                                                                       | Thin                     |
| **Tooling / infra**       | `Consulting-Manao/tansu`, `boundlessfi/builders`, `ritik4ever/stellar-portfolio-rebalancer`                                                                       | Moderate                 |
| **Streaming / vesting**   | _(none observed in the live sample)_ — but see competitor note below                                                                                              | **Apparent white space** |

### Competitor note (critical)

A live search for Soroban streaming contracts surfaced **`Fluxora-Org/Fluxora-Contracts`** — "the
Fluxora streaming contract on Soroban (Stellar). Streams lock funded assets in contract storage,
release..." ([GitHub issue #255](https://github.com/Fluxora-Org/Fluxora-Contracts/issues/255),
surfaced 2026-10-08). This is direct competition in the streaming niche. "Streaming is empty" is
therefore **not** true — it is _underserved in the approved Wave list_ but _has an active
competitor_. Do not claim first-mover status.

---

## 5. Where the genuine white space is

1. **Composable payment primitives as infrastructure, not a single app.** Escrow exists as a
   product (SafeTrust, Trustless Work, KindFi). Streaming exists as a product (Fluxora). What is
   _not_ visible in the approved list: a **primitive library** — stream + splits + escrow as a
   shared, audited base other Stellar apps can build on, with a typed SDK.
2. **Vesting for the tokenization wave.** DTCC/Franklin/MoneyGram RWAs are landing H1 2027. Token
   unlocks and investor/team vesting are a real need for that cohort, and linear-vesting-with-cliff
   is exactly that primitive. This is a _timing_ wedge, not a claim of exclusivity.
3. **Splits / revenue routing.** No approved repo in the live sample does proportional multi-party
   payment splitting as a standalone primitive.

---

## 6. Honest limitations of this recon

- The approved list shows **824 repos**; the page returns the first page only. This project
  (`SorobanForge/stellar-streams`) did **not** appear in the fetched sample and a targeted search
  did not surface it in the approved list. **Its approval status is unverified** — confirm directly
  in the Wave dashboard before submitting (Phase 12).
- Point multipliers and exact current-wave number were not fully enumerated; the cadence and
  multiplier mechanism are confirmed, specific values are not.
