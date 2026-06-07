'use client';

import { useId, useState } from 'react';
import type { Chapter } from '../data/types';
import { ResourceRow } from './ResourceRow';
import { ChevronIcon } from '../lib/icons';

interface ChapterSectionProps {
  chapter: Chapter;
  /** Display number, 1-based. */
  number: number;
  isDone: (id: string) => boolean;
  onToggle: (id: string) => void;
  mounted: boolean;
}

// A chapter: number + serif title + one-line summary + per-chapter progress, then
// a collapsible disclosure body of resource rows. Progress counts CORE completion;
// optional progress is surfaced secondarily. Default expanded.
export function ChapterSection({
  chapter,
  number,
  isDone,
  onToggle,
  mounted,
}: ChapterSectionProps) {
  const [open, setOpen] = useState(true);
  const bodyId = useId();

  const core = chapter.items.filter((r) => r.track === 'core');
  const optional = chapter.items.filter((r) => r.track !== 'core');
  const coreDone = mounted ? core.filter((r) => isDone(r.id)).length : 0;
  const optionalDone = mounted ? optional.filter((r) => isDone(r.id)).length : 0;
  const chapterComplete = core.length > 0 && coreDone === core.length;

  const num = String(number).padStart(2, '0');

  return (
    <section
      className={`chapter${chapterComplete ? ' chapter--complete' : ''}`}
      id={chapter.id}
      aria-labelledby={`${chapter.id}-title`}
    >
      <header className="chapter__header">
        <button
          type="button"
          className="chapter__toggle"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronIcon
            className={`chapter__chevron${open ? ' chapter__chevron--open' : ''}`}
            width={20}
            height={20}
          />
          <span className="chapter__heading">
            <span className="chapter__num" aria-hidden="true">
              {num}
            </span>
            <span className="chapter__title-wrap">
              <span className="chapter__title" id={`${chapter.id}-title`}>
                <span className="chapter__num-sr">Chapter {number}. </span>
                {chapter.title}
              </span>
              <span className="chapter__summary">{chapter.summary}</span>
            </span>
          </span>
        </button>

        <p className="chapter__progress" aria-live="polite">
          {core.length > 0 ? (
            <span className="chapter__progress-core">
              <strong>{coreDone}</strong>
              <span className="chapter__progress-slash">/</span>
              {core.length} core
            </span>
          ) : (
            <span className="chapter__progress-core chapter__progress-core--none">
              optional chapter
            </span>
          )}
          {optional.length > 0 && (
            <span className="chapter__progress-opt">
              +{optionalDone} optional
            </span>
          )}
        </p>
      </header>

      <div
        id={bodyId}
        className={`chapter__body${open ? ' chapter__body--open' : ''}`}
        hidden={!open}
      >
        <ol className="chapter__rows">
          {chapter.items.map((resource, i) => (
            <ResourceRow
              key={resource.id}
              resource={resource}
              done={mounted && isDone(resource.id)}
              onToggle={onToggle}
              index={i}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
