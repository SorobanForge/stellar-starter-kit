'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

const TECHS = [
  { name: 'Next.js 15', desc: 'React Framework supporting Server Components and streaming views.' },
  { name: 'React 19', desc: 'Next generation rendering library with native suspense boundaries.' },
  { name: 'TypeScript', desc: 'Type-safe programming across contracts and frontends.' },
  { name: 'Tailwind CSS', desc: 'Utility-first CSS styling for rapid layouts and glass effects.' },
  { name: 'shadcn/ui', desc: 'Accessible visual layout primitives built on Radix UI.' },
  { name: 'Framer Motion', desc: 'Premium micro-animations and page transitions.' },
  { name: 'pnpm Workspaces', desc: 'Fast, isolated node package link structures.' },
  { name: 'Turborepo', desc: 'Parallel execution pipelines and local compilation cache.' },
  { name: 'Stellar SDK', desc: 'Official client for network transactions and ledger operations.' },
  { name: 'Soroban WASM', desc: 'Next-gen smart contract engine for secure computing.' },
];

export default function BuiltWith() {
  return (
    <section
      className="border-t border-slate-900/60 bg-[#07070d]/10 py-20 md:py-24"
      aria-label="Technologies Used"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Modern Developer Stack
          </h2>
          <p className="mt-4 text-slate-400">
            Engineered using industry standard components to deliver a professional foundation out
            of the box.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {TECHS.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass flex flex-col justify-between rounded-2xl border border-slate-900/50 p-5"
            >
              <div>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80">
                  <Code2 className="h-4.5 w-4.5 text-purple-400" />
                </div>
                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
