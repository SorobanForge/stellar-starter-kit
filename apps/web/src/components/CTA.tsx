'use client';

import React from 'react';
import { MessageSquare, Github, ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section
      className="relative overflow-hidden border-t border-slate-900/60 py-20 md:py-24"
      aria-label="Call to Action"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent"></div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
        {/* Testimonials replacement block */}
        <div className="mx-auto mb-16 inline-flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-slate-900/60 bg-slate-950/40 p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Community Feedback
          </span>
          <p className="text-sm italic text-slate-300">
            &ldquo;Community feedback coming soon. Be among the first contributors to shape the
            template.&rdquo;
          </p>
          <a
            href="https://github.com/techAlhaji/stellar-starter-kit/discussions"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 transition-colors hover:text-purple-300"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Join GitHub Discussions
          </a>
        </div>

        <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
          Ready to Build on Stellar?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base font-light leading-relaxed text-slate-400 md:text-lg">
          Clone the flagship monorepo today and scaffold production-grade smart contracts in
          minutes.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#code"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-8 font-semibold text-white shadow-lg shadow-purple-500/10 transition-all hover:brightness-110 sm:w-auto"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/techAlhaji/stellar-starter-kit"
            target="_blank"
            rel="noreferrer"
            className="border-slate-850 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border bg-slate-950/40 px-8 font-semibold text-slate-300 transition-all hover:bg-slate-900 hover:text-white sm:w-auto"
          >
            <Github className="h-5 w-5" /> View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
