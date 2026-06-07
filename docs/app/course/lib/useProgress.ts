'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'course:how-llms-work:done';

function readStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((x): x is string => typeof x === 'string'));
    }
  } catch {
    // Corrupt value — start clean rather than throwing.
  }
  return new Set();
}

function writeStorage(done: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  } catch {
    // Storage full / disabled — progress is best-effort, fail silently.
  }
}

export interface ProgressApi {
  /** True only after client hydration; render unchecked until then (SSR-safe). */
  mounted: boolean;
  isDone: (id: string) => boolean;
  toggle: (id: string) => void;
  resetAll: () => void;
  /** How many of the given ids are done. */
  countDone: (ids: readonly string[]) => number;
  doneCount: number;
}

/**
 * localStorage-backed completion set.
 * - Renders empty on first paint, hydrates in an effect (mounted flag) to avoid
 *   hydration mismatch.
 * - Writes immediately to localStorage on every change.
 * - Listens to `storage` events so multiple tabs stay in sync.
 */
export function useProgress(): ProgressApi {
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDone(readStorage());
    setMounted(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setDone(readStorage());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isDone = useCallback(
    (id: string) => done.has(id),
    [done],
  );

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeStorage(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setDone(() => {
      const next = new Set<string>();
      writeStorage(next);
      return next;
    });
  }, []);

  const countDone = useCallback(
    (ids: readonly string[]) => {
      let n = 0;
      for (const id of ids) if (done.has(id)) n += 1;
      return n;
    },
    [done],
  );

  return {
    mounted,
    isDone,
    toggle,
    resetAll,
    countDone,
    doneCount: done.size,
  };
}
