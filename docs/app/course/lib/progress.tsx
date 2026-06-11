'use client';

import { createContext, use, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Concept } from '../data/types';

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
  doneCount: number;
}

const ProgressContext = createContext<ProgressApi | null>(null);

/**
 * localStorage-backed completion set, provided via context so any descendant
 * can read progress without prop drilling.
 * - Renders empty on first paint, hydrates in an effect (mounted flag) to avoid
 *   hydration mismatch.
 * - Writes immediately to localStorage on every change.
 * - Listens to `storage` events so multiple tabs stay in sync.
 */
export function ProgressProvider({ children }: { children: ReactNode }) {
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

  const isDone = useCallback((id: string) => done.has(id), [done]);

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
    const next = new Set<string>();
    writeStorage(next);
    setDone(next);
  }, []);

  return (
    <ProgressContext
      value={{ mounted, isDone, toggle, resetAll, doneCount: done.size }}
    >
      {children}
    </ProgressContext>
  );
}

export function useProgress(): ProgressApi {
  const api = use(ProgressContext);
  if (!api) throw new Error('useProgress requires <ProgressProvider>');
  return api;
}

/** A concept counts as learned once any one of its resources is checked. */
export const conceptLearned = (concept: Concept, isDone: (id: string) => boolean) =>
  concept.items.some((r) => isDone(r.id));
