'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Chapter, Concept } from '../../data/types';
import { conceptLearned, useProgress } from '../../lib/progress';
import { Rail } from '../Rail';
import { ResourceCard } from '../ResourceCard';
import { CheckIcon, ChevronIcon } from '../../lib/icons';
import type { VariantProps } from './types';

// B: focus accordion. Within a chapter exactly one concept is expanded at a
// time; opening the next collapses the previous, so the page stays short and
// the reading order stays linear.
function FocusChapter({
  chapter,
  index,
  prose,
}: {
  chapter: Chapter;
  index: number;
  prose?: Record<string, React.ReactNode>;
}) {
  const { mounted, isDone } = useProgress();
  const calm = useReducedMotion();
  const firstOpen = chapter.concepts.find(
    (c) => !(mounted && conceptLearned(c, isDone)),
  )?.id;
  const [open, setOpen] = useState<string | null>(null);
  const current = open ?? firstOpen ?? null;
  const num = chapter.number ?? String(index).padStart(2, '0');

  const row = (c: Concept) => {
    const learned = mounted && conceptLearned(c, isDone);
    const on = current === c.id;
    return (
      <li key={c.id} className={`focus__item${on ? ' focus__item--open' : ''}`}>
        <button
          type="button"
          className="focus__row"
          aria-expanded={on}
          onClick={() => setOpen(on ? '' : c.id)}
        >
          <span
            className={`focus__mark${learned ? ' focus__mark--done' : ''}`}
            aria-hidden="true"
          >
            <CheckIcon width={11} height={11} />
          </span>
          <span className="focus__title">{c.title}</span>
          <span className="focus__count">
            {mounted ? c.items.filter((r) => isDone(r.id)).length : 0}/{c.items.length}
          </span>
          <ChevronIcon
            className={`focus__chevron${on ? ' focus__chevron--open' : ''}`}
            width={14}
            height={14}
          />
        </button>
        <AnimatePresence initial={false}>
          {on && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={calm ? { duration: 0 } : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {c.summary && <p className="focus__summary">{c.summary}</p>}
              <Rail>
                {c.items.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </Rail>
              {prose?.[c.id]}
            </motion.div>
          )}
        </AnimatePresence>
      </li>
    );
  };

  return (
    <section className="chapter" id={chapter.id}>
      <header className="focus__chapter-head">
        <span className="chapter__num" aria-hidden="true">
          {num}
        </span>
        <div>
          <h2 className="focus__chapter-title">{chapter.title}</h2>
          <p className="chapter__summary">{chapter.summary}</p>
        </div>
      </header>
      {prose?.intro}
      <ol className="focus__list">{chapter.concepts.map(row)}</ol>
    </section>
  );
}

export function Focus({ chapters, prose }: VariantProps) {
  return (
    <div className="chapters">
      {chapters.map((ch, i) => (
        <FocusChapter key={ch.id} chapter={ch} index={i + 1} prose={prose[ch.id]} />
      ))}
    </div>
  );
}
