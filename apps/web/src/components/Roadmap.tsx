'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

const MILESTONES = [
  {
    version: 'v0.1',
    title: 'Foundation',
    desc: 'Monorepo skeleton, Turborepo settings, TS configs, changesets release automation, and lint pipelines.',
    done: true,
  },
  {
    version: 'v0.2',
    title: 'Wallet SDK',
    desc: 'Pre-configured wallet context hooks supporting Freighter, Albedo, Hana, and Rabet connectors.',
    done: true,
  },
  {
    version: 'v0.3',
    title: 'Contract SDK',
    desc: 'Soroban contract interface bindings compilation and automatic client declaration export pipelines.',
    done: false,
  },
  {
    version: 'v0.5',
    title: 'Templates',
    desc: 'Adding pre-built templates including basic token pools, multisig DAO governors, and payment checkouts.',
    done: false,
  },
  {
    version: 'v1.0',
    title: 'Stable Release',
    desc: 'Production-ready framework audits, unit tests verification, and community developer onboarding portal.',
    done: false,
  },
  {
    version: 'Future',
    title: 'Next-Gen Integrations',
    desc: 'Cross-chain bridging support, Soroban state optimization tools, and automated gas fee estimation helpers.',
    done: false,
  },
];

export default function Roadmap() {
  return (
    <section
      id="roadmap"
      className="border-t border-slate-900/60 py-20 md:py-24"
      aria-label="Development Roadmap"
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Development Timeline
          </h2>
          <p className="mt-4 text-slate-400">
            Follow our path to stable release. Join the development community to contribute
            suggestions or propose enhancements.
          </p>
        </div>

        {/* Timeline structure */}
        <div className="border-slate-850 relative ml-4 space-y-12 border-l md:ml-32">
          {MILESTONES.map((m, index) => (
            <motion.div
              key={m.version}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative pl-8 md:pl-12"
            >
              {/* Timeline marker */}
              <div className="absolute -left-[13px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-800 bg-slate-950">
                {m.done ? (
                  <CheckCircle2 className="h-4.5 w-4.5 fill-emerald-950/20 text-emerald-400" />
                ) : (
                  <Circle className="h-3 w-3 text-slate-600" />
                )}
              </div>

              {/* Date/Version Column */}
              <div className="absolute left-[-150px] top-1.5 hidden w-[110px] text-right md:block">
                <span className="font-mono text-sm font-bold uppercase tracking-wider text-slate-500">
                  {m.version}
                </span>
              </div>

              {/* Milestone Details */}
              <div className="glass max-w-2xl rounded-2xl border border-slate-900/60 p-6">
                <span className="mb-1.5 inline-block font-mono text-xs font-bold uppercase text-slate-500 md:hidden">
                  {m.version}
                </span>
                <h4 className="flex items-center gap-2 text-base font-bold text-white">
                  {m.title}
                  {m.done && (
                    <span className="rounded-full border border-emerald-900/30 bg-emerald-950/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">
                      Done
                    </span>
                  )}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400 md:text-sm">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
