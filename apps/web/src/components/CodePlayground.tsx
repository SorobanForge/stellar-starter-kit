'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Copy, CheckCircle } from 'lucide-react';
import { cn } from '@stellar-starter-kit/ui';

const SAMPLES = {
  quickstart: {
    label: 'Quick Start',
    filename: 'terminal',
    code: `# 1. Clone the flagship monorepo
git clone https://github.com/SorobanForge/stellar-starter-kit.git
cd stellar-starter-kit

# 2. Install workspace dependencies
pnpm install

# 3. Spin up local Stellar node & dashboard dev environment
./scripts/setup-local-node.sh
pnpm run dev`,
  },
  wallet: {
    label: 'Wallet Hook',
    filename: 'ConnectButton.tsx',
    code: `import { useWallet } from '@stellar-starter-kit/wallets';

export function ConnectButton() {
  const { address, connected, connect, disconnect } = useWallet();

  return (
    <button onClick={connected ? disconnect : () => connect('freighter')}>
      {connected ? \`Connected: \${address.slice(0, 4)}...\` : 'Connect Freighter'}
    </button>
  );
}`,
  },
  tx: {
    label: 'Transaction Helper',
    filename: 'payment.ts',
    code: `import { TransactionBuilder, Asset, Operation } from 'stellar-sdk';
import { formatAddress } from '@stellar-starter-kit/utils';

// Easily generate transaction layouts
export function buildPaymentTx(source: string, dest: string, amount: string, fee: string) {
  console.log('Building payment from', formatAddress(source));
  return new TransactionBuilder(sourceAccount, { fee })
    .addOperation(
      Operation.payment({
        destination: dest,
        asset: Asset.native(),
        amount
      })
    )
    .build();
}`,
  },
  soroban: {
    label: 'Soroban Client',
    filename: 'CounterService.ts',
    code: `import { CounterClient } from '@stellar-starter-kit/contracts';

// Initialize strongly-typed smart contract client
const client = new CounterClient.Client({
  contractId: 'CBOSYQA...',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015'
});

// Fetch current count & invoke on-chain increment method
const currentVal = await client.get_count();
const txResult = await client.increment();
await txResult.signAndSend();`,
  },
  ui: {
    label: 'Custom UI',
    filename: 'CosmicCard.tsx',
    code: `import { cn } from '@stellar-starter-kit/ui';

export function Card({ className, title, description }) {
  return (
    <div className={cn("glass glass-hover rounded-2xl p-6 transition-all", className)}>
      <h4 className="text-lg font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}`,
  },
};

export default function CodePlayground() {
  const [activeTab, setActiveTab] = useState<keyof typeof SAMPLES>('quickstart');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SAMPLES[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="code"
      className="border-y border-slate-900/60 bg-slate-950/20 py-20 md:py-24"
      aria-label="Interactive Code Playground"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Instant Developer API
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Zero configuration. Explore how we structure setup commands, wallet adapter contexts,
            and utilities.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Tabs Selector */}
          <div className="flex gap-2 overflow-x-auto p-1 lg:col-span-4 lg:flex-col">
            {(Object.keys(SAMPLES) as Array<keyof typeof SAMPLES>).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex w-full flex-shrink-0 items-center justify-start gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-all duration-200',
                  activeTab === key
                    ? 'border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-white shadow-md'
                    : 'border-transparent bg-transparent text-slate-400 hover:bg-slate-900/30 hover:text-slate-200',
                )}
              >
                <Code
                  className={cn(
                    'h-4 w-4',
                    activeTab === key ? 'text-purple-400' : 'text-slate-500',
                  )}
                />
                {SAMPLES[key].label}
              </button>
            ))}
          </div>

          {/* Code display window */}
          <div className="border-slate-850 overflow-hidden rounded-2xl border bg-[#07070d] shadow-2xl lg:col-span-8">
            <div className="flex items-center justify-between border-b border-slate-900 bg-[#08080f] px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/70"></span>
                <span className="ml-3 font-mono text-[10px] text-slate-500">
                  {SAMPLES[activeTab].filename}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="text-slate-450 flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1 text-xs transition-colors hover:text-slate-200"
                aria-label="Copy code snippet to clipboard"
              >
                {copied ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="min-h-[280px] overflow-x-auto p-6 font-mono text-sm leading-relaxed text-slate-300">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <code>{SAMPLES[activeTab].code}</code>
                </motion.pre>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
