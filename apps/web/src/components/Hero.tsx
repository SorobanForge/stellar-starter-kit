'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, ArrowRight, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section
      className="relative z-10 overflow-hidden pb-20 pt-24 md:pb-28 md:pt-32"
      aria-label="Hero Introduction"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text block */}
          <div className="text-left lg:col-span-7">
            {/* Trusted By / Community badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-purple-300"
            >
              <span className="flex h-2 w-2 rounded-full bg-purple-400"></span>
              Stellar Community Resource
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold leading-none tracking-tight text-white sm:text-6xl md:text-7xl"
            >
              Build Stellar Apps
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                With Elite Velocity.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-slate-400 md:text-xl"
            >
              An enterprise-grade monorepo template for Stellar and Soroban. Deploy verified
              contracts, manage multi-wallet environments, and build stunning user interfaces.
            </motion.p>

            {/* GitHub badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-2.5"
            >
              <span className="inline-flex items-center rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-xs text-slate-400">
                license: MIT
              </span>
              <span className="inline-flex items-center rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-xs text-slate-400">
                typescript: v5.5
              </span>
              <span className="inline-flex items-center rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-xs text-slate-400">
                next.js: v15.0
              </span>
              <span className="inline-flex items-center rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-xs text-slate-400">
                package-manager: pnpm
              </span>
              <span className="inline-flex items-center rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-xs text-slate-400">
                monorepo: turbo
              </span>
              <span className="inline-flex items-center rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-xs text-slate-400">
                ci: active
              </span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/counter"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 font-semibold text-white shadow-lg shadow-purple-500/10 transition-all hover:brightness-110"
              >
                Counter Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/escrow"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 px-6 font-semibold text-white shadow-lg shadow-cyan-500/10 transition-all hover:brightness-110"
              >
                Escrow Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#code"
                className="border-slate-850 text-slate-350 inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-slate-950/40 px-8 font-semibold transition-all hover:bg-slate-900 hover:text-white"
                aria-label="Get started by viewing setup instructions"
              >
                Get Started
              </a>
              <a
                href="https://github.com/SorobanForge/stellar-starter-kit"
                target="_blank"
                rel="noreferrer"
                className="border-slate-850 text-slate-350 inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-slate-950/40 px-8 font-semibold transition-all hover:bg-slate-900 hover:text-white sm:hidden md:inline-flex"
                aria-label="View stellar starter kit source code on GitHub"
              >
                <Github className="h-5 w-5" /> View on GitHub
              </a>
            </motion.div>
          </div>

          {/* Graphical/Animated Code block */}
          <div className="relative lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="border-slate-850 relative overflow-hidden rounded-2xl border bg-slate-950/80 p-1 shadow-2xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-cyan-500/5"></div>

              {/* Code shell header */}
              <div className="flex items-center justify-between border-b border-slate-900 bg-[#08080f] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/70"></span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">Stellar CLI</span>
              </div>

              {/* Interactive terminal code mock */}
              <div className="min-h-[220px] overflow-x-auto p-5 font-mono text-xs leading-relaxed text-slate-300">
                <div className="text-slate-500"># Install the Stellar Quickstart container</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-purple-400">$</span>
                  <span>./scripts/setup-local-node.sh</span>
                </div>
                <div className="mt-3 text-slate-500"># Spin up development workspaces</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-purple-400">$</span>
                  <span>pnpm run dev</span>
                </div>
                <div className="mt-4 font-semibold text-green-400/90">
                  ✓ Server ready: http://localhost:3000
                </div>
                <div className="mt-1 text-cyan-400">✓ Turborepo build cache initialized</div>
                <div className="mt-3 flex items-center gap-2 text-slate-500">
                  <Terminal className="h-3.5 w-3.5 animate-pulse text-slate-600" />
                  <span className="text-slate-600">waiting for ledger transactions...</span>
                </div>
              </div>
            </motion.div>

            {/* Ambient background glow behind terminal */}
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 blur-[80px]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
