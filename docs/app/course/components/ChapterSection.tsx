'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import type { Chapter } from '../data/types';
import { conceptLearned, useProgress } from '../lib/progress';
import { ConceptCluster } from './ConceptCluster';
import { ChevronIcon } from '../lib/icons';

interface Props {
  chapter: Chapter;
  /** 1-based fallback when chapter.number is absent. */
  index: number;
  /** Server-rendered prose blocks: 'intro' before the concepts, a concept id after it. */
  prose?: Record<string, ReactNode>;
}

// A chapter: number + serif title + summary + per-chapter progress, then a
// collapsible body of concept clusters with interstitial prose interleaved.
// Progress counts CORE concepts learned.
export function ChapterSection({ chapter, index, prose }: Props) {
  const { mounted, isDone } = useProgress();
  const [open, setOpen] = useState(true);
  const body = useId();

  const core = chapter.concepts.filter((c) => c.track === 'core');
  const learned = mounted
    ? core.filter((c) => conceptLearned(c, isDone)).length
    : 0;
  const complete = core.length > 0 && learned === core.length;
  const num = chapter.number ?? String(index).padStart(2, '0');

  return (
    <section
      className={`chapter${complete ? ' chapter--complete' : ''}${
        chapter.optional ? ' chapter--optional' : ''
      }`}
      id={chapter.id}
      aria-labelledby={`${chapter.id}-title`}
    >
      <header className="chapter__header">
        <button
          type="button"
          className="chapter__toggle"
          aria-expanded={open}
          aria-controls={body}
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
                <span className="chapter__num-sr">Chapter {num}. </span>
                {chapter.title}
                {chapter.optional && (
                  <span className="chapter__optional-tag">optional</span>
                )}
              </span>
              <span className="chapter__summary">{chapter.summary}</span>
            </span>
          </span>
        </button>

        {core.length > 0 && (
          <p className="chapter__progress" aria-live="polite">
            <strong>{learned}</strong> / {core.length} learned
          </p>
        )}
      </header>

      <div
        id={body}
        className={`chapter__body${open ? ' chapter__body--open' : ''}`}
        hidden={!open}
      >
        {prose?.intro}
        <ol className="concepts">
          {chapter.concepts.map((c) => (
            <li key={c.id}>
              <ConceptCluster concept={c} />
              {prose?.[c.id]}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
