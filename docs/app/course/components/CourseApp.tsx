'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Concept, Curriculum } from '../data/types';
import { conceptLearned, useProgress } from '../lib/progress';
import { ChapterSection } from './ChapterSection';
import { ProgressBar, ProgressRing } from './ProgressMeter';
import { CheckIcon, ListIcon } from '../lib/icons';
import { ResetControl } from './ResetControl';

interface Props {
  curriculum: Curriculum;
  /** Server-rendered interstitial prose: chapterId → (conceptId | 'intro') → node. */
  prose: Record<string, Record<string, ReactNode>>;
}

// Top-level client app. Progress is tracked per resource; a concept counts as
// learned once any of its resources is checked. Overall progress counts CORE
// concepts (the spine); optional concepts are surfaced separately.
export function CourseApp({ curriculum, prose }: Props) {
  const { mounted, isDone } = useProgress();

  const concepts = useMemo(() => {
    const all = curriculum.chapters.flatMap((ch) => ch.concepts);
    return {
      core: all.filter((c) => c.track === 'core'),
      opt: all.filter((c) => c.track !== 'core'),
    };
  }, [curriculum]);

  const learned = (c: Concept) => mounted && conceptLearned(c, isDone);

  const total = concepts.core.length;
  const done = concepts.core.filter(learned).length;
  const optdone = concepts.opt.filter(learned).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const finished = mounted && total > 0 && done === total;

  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry?.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [active, setActive] = useState(curriculum.chapters[0]?.id ?? '');
  useEffect(() => {
    const els = curriculum.chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );
    els.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [curriculum]);

  return (
    <>
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
        <div className="site-header__inner">
          <div className="site-header__title-block">
            <span className="site-header__title">{curriculum.title}</span>
          </div>
          <div className="site-header__progress">
            <ProgressRing value={done} total={total} size={28} />
            <span className="site-header__counts">
              <span className="site-header__counts-main">
                {done} / {total} learned
              </span>
              <span className="site-header__counts-sub">{pct}%</span>
            </span>
          </div>
        </div>
        <ProgressBar value={done} total={total} className="site-header__bar" />
      </header>

      <div className="layout">
        <nav className="toc" aria-label="Chapters">
          <p className="toc__label">
            <ListIcon width={14} height={14} />
            Contents
          </p>
          <ol className="toc__list">
            {curriculum.chapters.map((ch, i) => {
              const core = ch.concepts.filter((c) => c.track === 'core');
              const cdone = core.filter(learned).length;
              const complete = core.length > 0 && cdone === core.length;
              const on = active === ch.id;
              return (
                <li key={ch.id}>
                  <a
                    href={`#${ch.id}`}
                    className={`toc__link${on ? ' toc__link--active' : ''}${
                      complete ? ' toc__link--complete' : ''
                    }`}
                    aria-current={on ? 'true' : undefined}
                  >
                    <span className="toc__num" aria-hidden="true">
                      {ch.number ?? String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="toc__text">{ch.title}</span>
                    <span className="toc__count" aria-hidden="true">
                      {complete ? (
                        <CheckIcon width={13} height={13} />
                      ) : core.length > 0 ? (
                        `${cdone}/${core.length}`
                      ) : (
                        '·'
                      )}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <main className="content" id="content">
          <div className="masthead">
            <h1 className="masthead__title">{curriculum.title}</h1>
            <p className="masthead__subtitle">{curriculum.subtitle}</p>
            <p className="masthead__lede">
              The best videos, articles, books, papers, and interactive demos on
              how large language models actually work, grouped into the concepts
              you need to learn. Each concept gathers a few ways to learn it;
              pick whichever you like and check it off. Your progress lives only
              in this browser.
            </p>
            <div className="masthead__progress">
              <ProgressBar value={done} total={total} />
              <p className="masthead__progress-label">
                <span>
                  <strong>{done}</strong> of {total} concepts learned
                </span>
                <span>{pct}%</span>
              </p>
            </div>
          </div>

          <div ref={sentinel} className="masthead-sentinel" aria-hidden="true" />

          {finished && (
            <div className="done-banner" role="status">
              <span className="done-banner__mark">
                <CheckIcon width={20} height={20} />
              </span>
              <div className="done-banner__text">
                <p className="done-banner__title">You learned the core path.</p>
                <p className="done-banner__sub">
                  Every required concept is covered, from a single neuron to the
                  frontier.
                  {optdone < concepts.opt.length && (
                    <>
                      {' '}
                      {concepts.opt.length - optdone} optional concept
                      {concepts.opt.length - optdone === 1 ? '' : 's'} remain if
                      you want to go deeper.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="chapters">
            {curriculum.chapters.map((ch, i) => (
              <ChapterSection
                key={ch.id}
                chapter={ch}
                index={i + 1}
                prose={prose[ch.id]}
              />
            ))}
          </div>

          <footer className="colophon">
            <p className="colophon__note">
              {curriculum.title}. All resources link to their original authors and
              publishers. No accounts, no tracking.
            </p>
            <ResetControl />
          </footer>
        </main>
      </div>
    </>
  );
}
