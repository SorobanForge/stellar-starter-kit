'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Compass, Laptop, Link2, Settings } from 'lucide-react';
import { cn } from '@stellar-starter-kit/ui';

const NODES = {
  apps: {
    title: 'Applications',
    desc: 'Deployable frontends & services',
    items: [
      { name: 'apps/web', detail: 'Next.js 15 dashboard portal. Imports UI, wallets, and SDK.' },
    ],
  },
  packages: {
    title: 'Shared Workspaces',
    desc: 'Private packages linked locally via pnpm',
    items: [
      {
        name: '@stellar-starter-kit/wallets',
        detail: 'Unified context for Freighter, Albedo, Hana, and Rabe.',
      },
      {
        name: '@stellar-starter-kit/ui',
        detail: 'Shared component system styled with Tailwind CSS.',
      },
      {
        name: '@stellar-starter-kit/contracts',
        detail: 'Typed smart contract binding declarations.',
      },
      { name: '@stellar-starter-kit/sdk', detail: 'Client SDK layer handling RPC nodes requests.' },
    ],
  },
  examples: {
    title: 'Boilerplate Demos',
    desc: 'Functional standalone sandboxes',
    items: [
      {
        name: 'examples/basic-payment',
        detail: 'Standalone script showing transaction signatures.',
      },
    ],
  },
};

export default function Architecture() {
  const [selectedNode, setSelectedNode] = useState<keyof typeof NODES>('packages');

  return (
    <section
      id="architecture"
      className="border-t border-slate-900/60 bg-[#07070d]/30 py-20 md:py-24"
      aria-label="Monorepo Architecture Overview"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Clean Architecture Separators
          </h2>
          <p className="mt-4 text-slate-400">
            Learn how workspaces pass compilation settings, compile contract bindings, and
            communicate internally.
          </p>
        </div>

        {/* Visual Columns Layout */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          {/* Interaction column */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {(Object.keys(NODES) as Array<keyof typeof NODES>).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedNode(key)}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200',
                  selectedNode === key
                    ? 'border-purple-500/30 bg-gradient-to-tr from-purple-950/10 to-transparent shadow-lg shadow-purple-500/5'
                    : 'text-slate-450 border-slate-900 bg-slate-950/40 hover:bg-slate-900/20',
                )}
              >
                <div className="flex items-center gap-3">
                  {key === 'apps' && <Laptop className="h-5 w-5 text-purple-400" />}
                  {key === 'packages' && <Box className="h-5 w-5 text-cyan-400" />}
                  {key === 'examples' && <Compass className="h-5 w-5 text-pink-400" />}
                  <h4 className="text-base font-bold text-white">{NODES[key].title}</h4>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{NODES[key].desc}</p>
              </button>
            ))}
          </div>

          {/* Visual Board Display */}
          <div className="relative flex min-h-[350px] flex-col justify-between rounded-3xl border border-slate-900 bg-[#08080f]/80 p-8 shadow-2xl lg:col-span-7">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5"></div>

            <div className="relative z-10">
              <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-400">
                Active View: {NODES[selectedNode].title}
              </span>

              <div className="space-y-4">
                {NODES[selectedNode].items.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="border-slate-850 rounded-2xl border bg-slate-950/60 p-5 transition-colors hover:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-cyan-400">
                        {item.name}
                      </span>
                      <Link2 className="text-slate-650 h-3.5 w-3.5" />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.detail}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-8 flex items-center justify-between border-t border-slate-900/60 pt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Settings className="animate-spin-slow h-3.5 w-3.5 text-slate-600" />
                Orchestrated via Turbo & pnpm
              </span>
              <a
                href="/docs"
                className="hover:text-slate-355 flex items-center gap-1 transition-colors"
              >
                View detailed architecture map <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
