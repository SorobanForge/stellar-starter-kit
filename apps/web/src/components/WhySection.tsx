'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Compass, RefreshCw, Users, FileText, CheckCircle2 } from 'lucide-react';

const REASONS = [
  {
    icon: <Zap className="h-5 w-5 text-purple-400" />,
    title: 'Drastically Reduce Boilerplate',
    desc: 'Skip days of setting up workspaces, TS compiler paths, lint profiles, and monorepo building rules. Start coding core features immediately.',
  },
  {
    icon: <Compass className="h-5 w-5 text-cyan-400" />,
    title: 'Encourage Stellar Best Practices',
    desc: 'Pre-configured directory layouts that separate contract logic, frontend UI views, wallet contexts, and integration wrappers.',
  },
  {
    icon: <RefreshCw className="h-5 w-5 text-pink-400" />,
    title: 'Multi-Wallet Out of the Box',
    desc: 'Ready-to-use wallet context hook with build support for Freighter, Albedo, Hana, and Rabet providers. Plug-and-play wallet adapters.',
  },
  {
    icon: <Users className="h-5 w-5 text-emerald-400" />,
    title: 'Community Driven & Open Source',
    desc: 'Designed as a flagship resource for onboarding and scale. Standard MIT license permitting secure commercial use.',
  },
  {
    icon: <ShieldAlert className="h-5 w-5 text-blue-400" />,
    title: 'Production Configuration Defaults',
    desc: 'Bundled with Husky commit checks, Prettier formatting constraints, ESLint rule systems, CodeQL checks, and changesets automation.',
  },
  {
    icon: <FileText className="h-5 w-5 text-amber-400" />,
    title: 'Flexible & Reusable Architecture',
    desc: 'Clean package borders allow you to deploy the frontend or packages independently without leaking dependencies or styles.',
  },
];

export default function WhySection() {
  return (
    <section
      className="border-t border-slate-900/60 bg-slate-950/10 py-20 md:py-24"
      aria-label="Why Choose Stellar Starter Kit"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          {/* Headline block */}
          <div className="text-left lg:col-span-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Why Stellar Starter Kit?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 md:text-base">
              Setting up high-quality blockchain monorepos is notoriously complex. We provide a
              single boilerplate optimized for speed, security, and developer ergonomics.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                <span className="text-slate-350 text-sm font-medium">
                  Save up to 40+ hours of initial setup
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                <span className="text-slate-350 text-sm font-medium">
                  Pre-built secure pipeline defaults
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                <span className="text-slate-350 text-sm font-medium">
                  Seamless contract TypeScript sync
                </span>
              </div>
            </div>
          </div>

          {/* Feature list block */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-8">
            {REASONS.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex items-start gap-4"
              >
                <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50">
                  {reason.icon}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{reason.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
