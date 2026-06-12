'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import type { Resource } from '../../data/types';
import { TYPE_LABEL } from '../../data/types';
import { useProgress } from '../../lib/progress';
import { CheckIcon, ChevronIcon, TypeIcon } from '../../lib/icons';

// Small shared pieces for the layout variants: a text-only resource row and a
// collapsible fold for deep-dive / advanced material.

export function RowItem({ resource }: { resource: Resource }) {
  const { mounted, isDone, toggle } = useProgress();
  const done = mounted && isDone(resource.id);
  return (
    <li className={`rowitem${done ? ' rowitem--done' : ''}`}>
      <button
        type="button"
        className="rowitem__check"
        aria-pressed={done}
        aria-label={`Mark "${resource.title}" as ${done ? 'not done' : 'done'}`}
        onClick={() => toggle(resource.id)}
      >
        <CheckIcon width={12} height={12} />
      </button>
      <a
        className="rowitem__title"
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {resource.title}
      </a>
      <span className="rowitem__meta">
        <TypeIcon type={resource.type} width={11} height={11} />
        {TYPE_LABEL[resource.type]} · {resource.author}
        {resource.duration && ` · ${resource.duration}`}
      </span>
    </li>
  );
}

export function Fold({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const calm = useReducedMotion();
  if (count === 0) return null;
  return (
    <div className={`fold${open ? ' fold--open' : ''}`}>
      <button
        type="button"
        className="fold__head"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronIcon
          className={`fold__chevron${open ? ' fold__chevron--open' : ''}`}
          width={14}
          height={14}
        />
        {label}
        <span className="fold__count">{count}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={calm ? { duration: 0 } : { duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="fold__body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
