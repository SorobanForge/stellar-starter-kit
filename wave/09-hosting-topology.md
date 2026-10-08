# Phase 9 — Hosting and Service Topology

## 9.1 What exists today

The shipped app is a **static-renderable Next.js frontend that talks directly to Soroban RPC**. There
is no backend service, no indexer, and no database in the current repo. State lives on Stellar; the
frontend reads it by simulating contract calls.

```
User ──> apps/web (Next.js) ──> Soroban RPC ──> contracts/{stream,splits,escrow}
                    │
                    └──> Wallet extension (Freighter / Albedo / Rabet / Hana) ──signs──> submits to RPC
```

- **Reads:** `Server.simulateTransaction` — no wallet needed beyond a source account for simulation.
- **Writes:** the wallet signs the prepared XDR; the app submits and polls. The frontend talks to RPC
  directly for both.

### Where each piece goes

| Piece                   | Platform                                                              | Why                                                                                                                                                                       |
| :---------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web` (Next.js 15) | **Vercel**                                                            | purpose-built for Next.js; zero-config deploy, preview URLs per PR, CDN for static assets. Do not migrate it elsewhere to co-locate with a backend — there is no backend. |
| Contracts               | Stellar (Soroban)                                                     | already deployed; nothing to host.                                                                                                                                        |
| RPC access              | Soroban RPC (public testnet endpoint, or a provider once usage grows) | the frontend calls it directly.                                                                                                                                           |

### Environment variables on Vercel

Set these in **Project → Settings → Environment Variables** for Production and Preview:

- `NEXT_PUBLIC_STELLAR_NETWORK`
- `NEXT_PUBLIC_HORIZON_URL`
- `NEXT_PUBLIC_SOROBAN_RPC_URL`
- `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`
- `NEXT_PUBLIC_STREAM_CONTRACT_ID`
- `NEXT_PUBLIC_SPLITS_CONTRACT_ID`
- `NEXT_PUBLIC_ESCROW_CONTRACT_ID`
- `NEXT_PUBLIC_TOKEN_CONTRACT_ID`
- `NEXT_PUBLIC_STELLAR_EXPERT_URL`

**Failure mode:** if the production site still calls `localhost` or a contract id is stale, the cause
is almost always a `NEXT_PUBLIC_*` value that was **inlined at build time**. `NEXT_PUBLIC_*` values
are baked into the bundle — changing one requires a **redeploy**, not just restarting the service.
Fix at the source (set the variable, redeploy); do not patch it with a runtime fallback.

## 9.2 Planned topology (only when the indexer lands)

The roadmap's next milestone adds an event indexer so the dashboard can list a wallet's streams
without knowing ids. When that ships, this is the intended shape:

```
User ──> Vercel (apps/web) ──> Render (indexer/API) ──> Postgres (Render, same region)
                    │
                    └──> Soroban RPC (contract writes, directly)
```

| Piece        | Platform              | Configuration notes                                                                                                       |
| :----------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| Frontend     | Vercel                | as above.                                                                                                                 |
| Indexer/API  | **Render**            | a long-running process (not serverless). Get runtime, **root directory**, build command, and start command exactly right. |
| Database     | **Render Postgres**   | provision alongside the indexer, **same region**; use the **internal connection string** since both are co-located.       |
| Event source | Soroban RPC / Horizon | the indexer tails contract events (`stream`, `splits`, `escrow` topics).                                                  |

The indexer consumes the same three contracts "read-only." Contract writes never route through the
indexer — the wallet signs and the frontend submits to RPC directly. This split keeps the indexer
stateless-per-request and avoids putting a signing key in a server.

> Do not build this until there is a concrete need. A backend that merely proxies reads the frontend
> can already do directly adds a failure domain for no benefit.
