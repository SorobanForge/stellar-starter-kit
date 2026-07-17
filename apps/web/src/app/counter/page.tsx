'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@stellar-starter-kit/wallets';
import { CounterClient } from '@stellar-starter-kit/contracts';
import deployments from '../../generated/deployments.json';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  RotateCcw,
  Plus,
  Minus,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface LogEntry {
  id: string;
  type: 'increment' | 'decrement' | 'reset' | 'fetch';
  timestamp: Date;
  hash?: string;
  status: 'pending' | 'success' | 'error';
  details: string;
}

export default function CounterDemo() {
  const {
    activeAddress,
    isConnected,
    isConnecting,
    activeProvider,
    connect,
    disconnect,
    signTransaction,
  } = useWallet();
  const [count, setCount] = useState<number | null>(null);
  const [loadingValue, setLoadingValue] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const contractId = deployments.counter;
  const rpcUrl = 'https://soroban-testnet.stellar.org';
  const passphrase = 'Test SDF Network ; September 2015';

  const addLog = useCallback(
    (type: LogEntry['type'], status: LogEntry['status'], details: string, hash?: string) => {
      const newEntry: LogEntry = {
        id: Math.random().toString(36).substring(7),
        type,
        timestamp: new Date(),
        status,
        details,
        hash,
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 19)]);
    },
    [],
  );

  // Helper to instantiate client
  const getClient = useCallback(() => {
    return new CounterClient.Client({
      contractId,
      rpcUrl,
      networkPassphrase: passphrase,
      publicKey: activeAddress || undefined,
      signTransaction: async (txXdr) => {
        const signedTxXdr = await signTransaction(txXdr);
        return { signedTxXdr };
      },
    });
  }, [activeAddress, signTransaction, contractId]);

  // Fetch count
  const fetchCount = useCallback(
    async (silent = false) => {
      if (!silent) setLoadingValue(true);
      setError(null);
      try {
        const client = getClient();
        const tx = await client.get();
        setCount(tx.result);
        if (!silent) {
          addLog('fetch', 'success', `Fetched current counter value: ${tx.result}`);
        }
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch counter value';
        setError(errorMessage);
        if (!silent) {
          addLog('fetch', 'error', `Failed to fetch counter: ${errorMessage}`);
        }
      } finally {
        if (!silent) setLoadingValue(false);
      }
    },
    [getClient, addLog],
  );

  // Fetch on mount and wallet change
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Action handlers
  const handleAction = async (type: 'increment' | 'decrement' | 'reset') => {
    if (!isConnected) {
      setError('Please connect your wallet first.');
      return;
    }

    setActionLoading(true);
    setError(null);
    addLog(type, 'pending', `Initiating ${type} transaction...`);

    try {
      const client = getClient();
      let txAssembledObject;

      if (type === 'increment') {
        txAssembledObject = await client.increment();
      } else if (type === 'decrement') {
        txAssembledObject = await client.decrement();
      } else {
        txAssembledObject = await client.reset();
      }

      // sign and submit
      const result = await txAssembledObject.signAndSend();

      addLog(
        type,
        'success',
        `Successfully performed ${type}!`,
        result.sendTransactionResponse?.hash,
      );

      // Fetch new value
      await fetchCount(true);
    } catch (err) {
      console.error(err);
      let errorMessage = 'Transaction failed';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      if (
        errorMessage.toLowerCase().includes('user rejected') ||
        errorMessage.toLowerCase().includes('declined')
      ) {
        errorMessage = 'Transaction signature declined by user.';
      }
      setError(errorMessage);
      addLog(type, 'error', `Transaction failed: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060c] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-15%] top-[-15%] h-[60%] w-[60%] rounded-full bg-purple-900/10 blur-[150px]"></div>
        <div className="absolute bottom-[-15%] right-[-15%] h-[60%] w-[60%] rounded-full bg-cyan-900/10 blur-[150px]"></div>
      </div>

      <Header />

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Hero Section */}
        <div className="mb-12 text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-semibold tracking-wide text-purple-300">
            Smart Contract Demo
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Counter Contract
          </h1>
          <p className="mt-3 text-lg font-light text-slate-400">
            Read, increment, decrement, and reset a global value deployed on the Stellar Testnet.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Controls Card */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-slate-900/80 bg-slate-950/40 p-8 shadow-2xl backdrop-blur-md">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-cyan-500/5"></div>

              {/* Top Row: Connection Status */}
              <div className="mb-8 flex items-center justify-between border-b border-slate-900 pb-6">
                <div>
                  <h2 className="text-slate-350 text-sm font-semibold uppercase tracking-wider">
                    Wallet Status
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    {isConnected ? (
                      <>
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                        <span className="font-mono text-slate-400">
                          {activeAddress?.substring(0, 6)}...
                          {activeAddress?.substring(activeAddress.length - 4)} ({activeProvider})
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        <span className="text-slate-400">Not Connected</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  {isConnected ? (
                    <button
                      onClick={disconnect}
                      className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-900 hover:text-white"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          setError(null);
                          try {
                            await connect('freighter');
                          } catch (err) {
                            console.error(err);
                            setError(
                              err instanceof Error
                                ? err.message
                                : 'Failed to connect Freighter wallet.',
                            );
                          }
                        }}
                        disabled={isConnecting}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:brightness-110"
                      >
                        {isConnecting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Connect Freighter'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Core Counter View */}
              <div className="my-12 flex flex-col items-center justify-center">
                <div className="text-slate-350 mb-2 text-xs font-semibold uppercase tracking-wider">
                  Current Count
                </div>
                <div className="relative">
                  {loadingValue ? (
                    <div className="flex h-36 w-36 items-center justify-center">
                      <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
                    </div>
                  ) : (
                    <div className="select-none bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text px-4 text-7xl font-black text-transparent sm:text-8xl">
                      {count ?? 0}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fetchCount()}
                  disabled={loadingValue}
                  className="mt-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-slate-400 hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" /> Refresh Count
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-900 pt-8">
                <button
                  onClick={() => handleAction('decrement')}
                  disabled={!isConnected || actionLoading || count === 0}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/20 py-4 font-semibold text-slate-200 shadow-inner transition-all hover:bg-slate-900/50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Minus className="h-5 w-5 text-rose-400" />
                  <span className="text-xs uppercase tracking-wider">Decrement</span>
                </button>

                <button
                  onClick={() => handleAction('reset')}
                  disabled={!isConnected || actionLoading || count === 0}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/20 py-4 font-semibold text-slate-200 shadow-inner transition-all hover:bg-slate-900/50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <RotateCcw className="h-5 w-5 text-yellow-400" />
                  <span className="text-xs uppercase tracking-wider">Reset</span>
                </button>

                <button
                  onClick={() => handleAction('increment')}
                  disabled={!isConnected || actionLoading}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-purple-600/80 to-cyan-500/80 py-4 font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5 text-cyan-200" />
                  )}
                  <span className="text-xs uppercase tracking-wider">Increment</span>
                </button>
              </div>

              {/* Error overlay */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
                    <div>
                      <h4 className="font-semibold text-rose-200">Execution Error</h4>
                      <p className="mt-1 font-light leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Details & Logs Sidebar */}
          <div className="lg:col-span-5">
            {/* Info Box */}
            <div className="mb-6 rounded-2xl border border-slate-900 bg-slate-950/20 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-white">Contract Details</h3>
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Contract ID</div>
                  <div className="mt-1 select-all break-all text-slate-300 transition-colors hover:text-cyan-400">
                    {contractId}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Network</div>
                  <div className="mt-1 text-slate-300">Stellar Testnet</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Explorer</div>
                  <div className="mt-1">
                    <a
                      href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
                    >
                      View on Stellar.expert <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Logs Window */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 backdrop-blur-md">
              <h3 className="mb-4 text-sm font-semibold text-white">Transaction History</h3>

              <div className="scrollbar-thin max-h-[350px] space-y-3 overflow-y-auto pr-2">
                {logs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-600">
                    No transactions recorded yet.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-slate-900 bg-slate-950/60 p-3.5 font-mono text-xs"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-semibold uppercase tracking-wider text-slate-400">
                          {log.type}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs leading-relaxed text-slate-300">{log.details}</div>
                      {log.status === 'pending' && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-yellow-500">
                          <Loader2 className="h-3 w-3 animate-spin" /> Transacting on Testnet...
                        </div>
                      )}
                      {log.status === 'success' && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Success
                          </span>
                          {log.hash && (
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${log.hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-0.5 text-[10px] text-slate-500 hover:text-white"
                            >
                              Tx Hash <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      )}
                      {log.status === 'error' && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-rose-500">
                          <AlertCircle className="h-3 w-3" /> Error
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
