'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Wallet, Cpu, Layers, ShieldCheck, Layers3, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: <Terminal className="h-6 w-6 text-purple-400" />,
    title: 'Monorepo Architecture',
    description:
      'Managed by Turborepo and pnpm workspaces. Experience lightning-fast builds with local caching, split packages, and isolated compiler configuration scopes.',
    link: '#architecture',
  },
  {
    icon: <Wallet className="h-6 w-6 text-cyan-400" />,
    title: 'Multi-Wallet Adapters',
    description:
      'Immediate compatibility with Freighter, Albedo, Hana, and Rabe wallets via a unified provider context. Handle connections, balances, and signing without boilerplate.',
    link: '#examples',
  },
  {
    icon: <Cpu className="h-6 w-6 text-pink-400" />,
    title: 'Soroban Smart Contracts',
    description:
      'Instant WASM compilation and TypeScript contract binding synchronization. Keep smart contract clients and frontends type-safe in real time.',
    link: '#code',
  },
  {
    icon: <Layers className="h-6 w-6 text-emerald-400" />,
    title: 'Next.js 15 App Router',
    description:
      'Engineered with React 19 and Next.js 15. Leverage Server Components, Suspense-driven streaming layouts, and optimal build compilation times.',
    link: '#code',
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-blue-400" />,
    title: 'Flagship CI/CD Workflows',
    description:
      'Enforce standard formatting via commitlint, husky git hooks, code vulnerability checks using CodeQL, and version tags through Changesets.',
    link: 'https://github.com/techAlhaji/stellar-starter-kit/blob/main/CONTRIBUTING.md',
  },
  {
    icon: <Layers3 className="h-6 w-6 text-amber-400" />,
    title: 'Tailwind Design System',
    description:
      'Fully optimized styles with custom cosmic variable colors, glassmorphic layout primitives, dark mode styling tokens, and framer-motion micro-interactions.',
    link: '#code',
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-20 md:py-24" aria-label="Core Features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need for Stellar dApps.
          </h2>
          <p className="mt-4 text-base text-slate-400 md:text-lg">
            Stop spent hours orchestrating workspace linkages, wallet connectors, and contract
            bindings. Start building the core logic immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="glass glass-hover group relative flex flex-col justify-between rounded-2xl border border-slate-900/60 p-6 transition-all duration-300"
            >
              <div>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50">
                  {feat.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{feat.description}</p>
              </div>

              <div className="mt-6 border-t border-slate-900/50 pt-4">
                <a
                  href={feat.link}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 transition-colors group-hover:text-purple-300"
                >
                  Learn more{' '}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
