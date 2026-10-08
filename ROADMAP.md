# Roadmap

This roadmap tracks the Stellar Streams protocol. Dates are indicative, not commitments.

---

## ✅ Shipped

- `stream` contract: linear vesting with cliffs, cancel/refund, optional protocol fee, TTL bumping,
  events, and 13 unit tests.
- `splits` contract: proportional splits with duplicate detection, dust handling, and 5 unit tests.
- `escrow` contract: arbiter escrow with deadline refunds and 11 unit tests.
- `@stellar-starter-kit/sdk`: typed `StreamsClient` for reads and writes.
- `@stellar-starter-kit/utils`: precise stroop formatting/parsing and vesting math (14 tests).
- `apps/web`: streams dashboard (create / inspect / withdraw / cancel).
- CI: JS lint/format, typecheck, unit tests, production build, and a Rust `contracts` job.

---

## 🔜 Next

- [ ] Deploy `stream` and `splits` to Testnet and publish contract ids + explorer links.
- [ ] Add a `splits` dashboard page that mirrors the streams experience.
- [ ] Incrementally refresh stream state in the dashboard via polling (`useStream` already supports
      it) instead of manual reloads.
- [ ] Add Soroban integration tests that exercise a full lifecycle against a local node.
- [ ] Support arbitrary token contracts end-to-end (currently XLM by default in the UI).

---

## 🧭 Later

- [ ] Multi-token streams and per-stream metadata.
- [ ] `stellar-streams` CLI for scripting streams and splits.
- [ ] Event indexer so the dashboard can list a recipient's streams without ids.
- [ ] Milestone-based (non-linear) vesting.
- [ ] Third-party security audit and a 1.0 contract freeze.

---

## 🤝 Good first areas for contributors

- Dashboard: `splits` page, error states, transaction toasts.
- SDK: retry/backoff around `sendTransaction`, richer simulation error handling.
- Utils: localized duration/number formatting.
- Contracts: additional edge-case tests (very long durations, fee boundaries).
- Docs: a deployed-contracts page with live explorer links once Testnet deployment lands.
