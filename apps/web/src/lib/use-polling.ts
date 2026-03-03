'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Polls by calling router.refresh() on an interval.
 * router.refresh() triggers Server Component re-render with fresh data from the API.
 * This is the Next.js App Router native approach — no external data library needed.
 *
 * NOTE: router from useRouter() is stable in Next.js App Router — safe to omit from deps.
 * ms changes are rare — also omitted to match the canonical usePolling pattern.
 */
export function usePolling(ms: number, enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => router.refresh(), ms);
    return () => clearInterval(id);
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps
}
