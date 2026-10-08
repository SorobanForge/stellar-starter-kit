import { useCallback, useEffect, useRef, useState } from 'react';
import type { StreamsClient } from '@stellar-starter-kit/sdk';
import type { Stream } from '@stellar-starter-kit/types';

/** Tracks browser connectivity as a lightweight proxy for network status. */
export function useStellarNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export interface UseStreamResult {
  stream: Stream | null;
  claimable: bigint;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Loads a single stream (and its claimable balance) from a `StreamsClient`,
 * re-fetching whenever the client or id changes, and exposing a `refresh`.
 */
export function useStream(
  client: StreamsClient | null,
  id: bigint | number | string | null,
  pollMs = 0,
): UseStreamResult {
  const [stream, setStream] = useState<Stream | null>(null);
  const [claimable, setClaimable] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!client || id === null) {
      setStream(null);
      setClaimable(0n);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextStream, nextClaimable] = await Promise.all([
        client.getStream(id),
        client.claimable(id).catch(() => 0n),
      ]);
      if (!mounted.current) return;
      setStream(nextStream);
      setClaimable(nextClaimable);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load stream');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [client, id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!pollMs || !client || id === null) return;
    const timer = setInterval(() => void refresh(), pollMs);
    return () => clearInterval(timer);
  }, [pollMs, refresh, client, id]);

  return { stream, claimable, loading, error, refresh };
}
