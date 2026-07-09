'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'Why another starter kit?',
    a: 'Most boilerplates are single-package templates that mix frontend components with wallet connections. We provide a workspace separation layout that allows team logic, smart contracts bindings, and UI packages to compile independently, mirroring real-world enterprise architectures.',
  },
  {
    q: 'Which wallets are supported?',
    a: 'We provide immediate support for Freighter, Albedo, Hana, and Rabe wallets out-of-the-box. Connecting new wallets is simple: import the driver and hook it into our central multi-wallet provider inside @stellar-starter-kit/wallets.',
  },
  {
    q: 'How do I contribute?',
    a: 'We welcome contributors! Check out CONTRIBUTING.md in the root directory for instructions on issue tracking, PR validation, conventional commits headers format, and changesets tags creation.',
  },
  {
    q: 'Does it support Soroban?',
    a: 'Absolutely. Soroban smart contracts compilation and JavaScript declaration file updates are fully supported. Use our integrated setup scripts to spin up a local Soroban node or deploy contracts to the Testnet.',
  },
  {
    q: 'Can I use it commercially?',
    a: 'Yes. The Stellar Starter Kit is released under the MIT License, allowing you to use it for private, public, or commercial blockchain initiatives without restrictions.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="border-t border-slate-900/60 bg-slate-950/10 py-20 md:py-24"
      aria-label="Frequently Asked Questions"
    >
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-slate-400">
            Answers to common questions about framework choices, wallet drivers, and workspace
            extensions.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="glass overflow-hidden rounded-2xl border border-slate-900/60 transition-all duration-200"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3 text-base font-bold text-white md:text-lg">
                    <HelpCircle className="h-5 w-5 flex-shrink-0 text-purple-400" />
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="text-slate-450 h-5 w-5" />
                  ) : (
                    <ChevronDown className="text-slate-455 h-5 w-5" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-900/40 p-6 pt-0 text-sm leading-relaxed text-slate-400 md:text-base">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
