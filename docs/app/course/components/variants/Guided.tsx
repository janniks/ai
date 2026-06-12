'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Chapter } from '../../data/types';
import { conceptLearned, useProgress } from '../../lib/progress';
import { chapterMinutes, split, tier } from '../../lib/tiers';
import { ResourceCard } from '../ResourceCard';
import { Rail } from '../Rail';
import { Fold, RowItem } from './bits';
import { CheckIcon, ChevronIcon } from '../../lib/icons';
import type { VariantProps } from './types';

// D: guided plan. The course as ten one-hour sessions. Only the current
// session (first not-yet-finished chapter) is expanded; finished and future
// sessions collapse to a single row each. Click any row to jump around.
function Session({
  chapter,
  day,
  active,
  onOpen,
  prose,
}: {
  chapter: Chapter;
  day: number;
  active: boolean;
  onOpen: () => void;
  prose?: Record<string, React.ReactNode>;
}) {
  const { mounted, isDone } = useProgress();
  const calm = useReducedMotion();
  const core = chapter.concepts.filter((c) => c.track !== 'advanced');
  const learned = mounted ? core.filter((c) => conceptLearned(c, isDone)).length : 0;
  const complete = core.length > 0 && learned === core.length;
  const mins = chapterMinutes(chapter);
  const groups = split(chapter);

  return (
    <li className={`day${active ? ' day--active' : ''}${complete ? ' day--done' : ''}`} id={chapter.id}>
      <button type="button" className="day__row" aria-expanded={active} onClick={onOpen}>
        <span className="day__label">Day {day}</span>
        <span className="day__title">{chapter.title}</span>
        <span className="day__meta">
          {complete ? (
            <CheckIcon width={13} height={13} />
          ) : (
            `${learned}/${core.length}${mins > 0 ? ` · ~${Math.round(mins / 5) * 5} min` : ''}`
          )}
        </span>
        <ChevronIcon
          className={`day__chevron${active ? ' day__chevron--open' : ''}`}
          width={14}
          height={14}
        />
      </button>
      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={calm ? { duration: 0 } : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="day__body">
              <p className="chapter__summary">{chapter.summary}</p>
              {prose?.intro}
              {groups.fast.map((c) => {
                const tiers = tier(c);
                const picks = tiers.essentials.length > 0 ? tiers.essentials : c.items.slice(0, 1);
                return (
                  <div key={c.id} className="fast__concept">
                    <h3 className="fast__concept-title">{c.title}</h3>
                    <Rail>
                      {[...tiers.teasers, ...picks].map((r) => (
                        <ResourceCard key={r.id} resource={r} />
                      ))}
                    </Rail>
                    <Fold label="Deep dive" count={tiers.deep.length}>
                      <ol className="fold__rows">
                        {tiers.deep.map((r) => (
                          <RowItem key={r.id} resource={r} />
                        ))}
                      </ol>
                    </Fold>
                    {prose?.[c.id]}
                  </div>
                );
              })}
              <Fold label="Advanced" count={groups.advanced.flatMap((c) => c.items).length}>
                <ol className="fold__rows">
                  {groups.advanced.flatMap((c) => c.items).map((r) => (
                    <RowItem key={r.id} resource={r} />
                  ))}
                </ol>
              </Fold>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Guided({ chapters, prose }: VariantProps) {
  const { mounted, isDone } = useProgress();
  const firstOpen = chapters.find(
    (ch) =>
      !ch.concepts
        .filter((c) => c.track !== 'advanced')
        .every((c) => mounted && conceptLearned(c, isDone)),
  )?.id;
  const [open, setOpen] = useState<string | null>(null);
  const current = open ?? firstOpen ?? chapters[0]?.id;

  return (
    <ol className="days">
      {chapters.map((ch, i) => (
        <Session
          key={ch.id}
          chapter={ch}
          day={i + 1}
          active={current === ch.id}
          onOpen={() => setOpen(current === ch.id ? '' : ch.id)}
          prose={prose[ch.id]}
        />
      ))}
    </ol>
  );
}
