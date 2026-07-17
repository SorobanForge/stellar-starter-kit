'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

const WALLETS = [
  {
    name: 'Freighter',
    desc: 'The official SDF extension. Complete support for Freighter balance verification and transaction approvals.',
  },
  {
    name: 'Albedo',
    desc: 'Secure web wallet interface. Ideal for instant browser setups without extension requirements.',
  },
  {
    name: 'Rabet',
    desc: 'User friendly mobile and web wallet connector. Safe transaction signing adapter.',
  },
  {
    name: 'Hana',
    desc: 'Advanced multi-chain wallet interface providing native Stellar and Soroban operation support.',
  },
];

export default function Ecosystem() {
  return (
    <section id="ecosystem" className="py-20 md:py-24" aria-label="Ecosystem Integrations">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stellar Ecosystem Connections
          </h2>
          <p className="mt-4 text-slate-400">
            A unified wallet state machine handles initial handshakes, network swaps, and message
            signature handovers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {WALLETS.map((w, index) => (
            <motion.div
              key={w.name}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass flex flex-col justify-between rounded-2xl border border-slate-900/60 p-6"
            >
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/25 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10">
                  <Wallet className="h-5 w-5 text-cyan-400" />
                </div>
                <h4 className="text-lg font-bold text-white">{w.name}</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{w.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
