'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Concept } from '../data/types';
import { useProgress } from '../lib/progress';
import { Rail } from './Rail';
import { ResourceCard } from './ResourceCard';
import { CheckIcon, ChevronIcon } from '../lib/icons';

interface Props {
  concept: Concept;
}

// Only the deeper/aside tracks get a label; "background" recession is signalled
// by the quieter title alone, so it carries no tag (avoids tag noise).
const TAG: Record<string, string> = {
  advanced: 'advanced',
  inspiration: 'inspiration',
};

// A concept card: the thing you learn, with its resources in a horizontal rail.
// The header toggles the rail open/closed; the concept counts as learned once
// any one of its resources is checked.
export function ConceptCluster({ concept }: Props) {
  const { mounted, isDone } = useProgress();
  const [open, setOpen] = useState(true);
  const body = useId();
  const calm = useReducedMotion();
  const done = mounted ? concept.items.filter((r) => isDone(r.id)).length : 0;
  const learned = done >= 1;
  const tag = TAG[concept.track];

  return (
    <div className={`concept concept--${concept.track}${learned ? ' concept--learned' : ''}`}>
      <button
        type="button"
        className="concept__head"
        aria-expanded={open}
        aria-controls={body}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="concept__mark" aria-hidden="true">
          <CheckIcon width={12} height={12} />
        </span>
        <span className="concept__heading">
          <span className="concept__title">
            {concept.title}
            {tag && <span className="concept__tag">{tag}</span>}
          </span>
          {concept.summary && <span className="concept__summary">{concept.summary}</span>}
        </span>
        <span
          className="concept__progress"
          aria-label={`${done} of ${concept.items.length} resources done`}
        >
          {done}/{concept.items.length}
        </span>
        <ChevronIcon
          className={`concept__chevron${open ? ' concept__chevron--open' : ''}`}
          width={16}
          height={16}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={body}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={calm ? { duration: 0 } : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <Rail>
              {concept.items.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </Rail>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
