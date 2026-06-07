'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Curriculum } from '../data/types';
import { useProgress } from '../lib/useProgress';
import { ChapterSection } from './ChapterSection';
import { ProgressBar, ProgressRing } from './ProgressMeter';
import { CheckIcon, ListIcon, ResetIcon } from '../lib/icons';

interface CourseAppProps {
  curriculum: Curriculum;
}

// Top-level client app. Owns progress state, renders the sticky header, the
// desktop TOC rail, the chapter sections, and the completion moment.
export function CourseApp({ curriculum }: CourseAppProps) {
  const progress = useProgress();
  const { mounted, isDone, toggle, resetAll } = progress;

  // Derived core totals across the whole curriculum.
  const { coreIds, coreTotal } = useMemo(() => {
    const ids: string[] = [];
    for (const ch of curriculum.chapters)
      for (const r of ch.items) if (r.track === 'core') ids.push(r.id);
    return { coreIds: ids, coreTotal: ids.length };
  }, [curriculum]);

  const optionalTotal = useMemo(() => {
    let n = 0;
    for (const ch of curriculum.chapters)
      for (const r of ch.items) if (r.track !== 'core') n += 1;
    return n;
  }, [curriculum]);

  const coreDone = mounted ? progress.countDone(coreIds) : 0;
  const optionalDone = mounted ? progress.doneCount - coreDone : 0;
  const pct = coreTotal > 0 ? Math.round((coreDone / coreTotal) * 100) : 0;
  const allCoreDone = mounted && coreTotal > 0 && coreDone === coreTotal;

  // Sticky header compaction once scrolled past the masthead.
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry?.isIntersecting),
      { rootMargin: '0px 0px 0px 0px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Active chapter for the TOC rail.
  const [activeChapter, setActiveChapter] = useState<string>(
    curriculum.chapters[0]?.id ?? '',
  );
  useEffect(() => {
    const sections = curriculum.chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveChapter(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [curriculum]);

  // Inline reset confirmation (no browser confirm()).
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => {
    if (!confirmReset) return;
    const t = window.setTimeout(() => setConfirmReset(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirmReset]);

  return (
    <>
      <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
        <div className="site-header__inner">
          <div className="site-header__title-block">
            <span className="site-header__title">{curriculum.title}</span>
          </div>

          <div className="site-header__progress">
            <span className="site-header__ring">
              <ProgressRing value={coreDone} total={coreTotal} size={28} />
            </span>
            <span className="site-header__counts">
              <span className="site-header__counts-main">
                {coreDone} / {coreTotal} core
              </span>
              <span className="site-header__counts-sub">{pct}%</span>
            </span>
          </div>

          <div className="site-header__actions">
            {confirmReset ? (
              <span className="reset" role="group" aria-label="Confirm reset">
                <span className="reset__prompt">Reset all progress?</span>
                <button
                  type="button"
                  className="reset__confirm"
                  onClick={() => {
                    resetAll();
                    setConfirmReset(false);
                  }}
                >
                  Yes, reset
                </button>
                <button
                  type="button"
                  className="reset__cancel"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="reset__trigger"
                onClick={() => setConfirmReset(true)}
                disabled={!mounted || progress.doneCount === 0}
              >
                <ResetIcon width={15} height={15} />
                <span>Reset progress</span>
              </button>
            )}
          </div>
        </div>
        <ProgressBar
          value={coreDone}
          total={coreTotal}
          className="site-header__bar"
        />
      </header>

      <div className="layout">
        <nav className="toc" aria-label="Chapters">
          <p className="toc__label">
            <ListIcon width={14} height={14} />
            Contents
          </p>
          <ol className="toc__list">
            {curriculum.chapters.map((ch, i) => {
              const core = ch.items.filter((r) => r.track === 'core');
              const done = mounted
                ? core.filter((r) => isDone(r.id)).length
                : 0;
              const complete = core.length > 0 && done === core.length;
              const active = activeChapter === ch.id;
              return (
                <li key={ch.id} className="toc__item">
                  <a
                    href={`#${ch.id}`}
                    className={`toc__link${active ? ' toc__link--active' : ''}${
                      complete ? ' toc__link--complete' : ''
                    }`}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span className="toc__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="toc__text">{ch.title}</span>
                    <span className="toc__count" aria-hidden="true">
                      {complete ? (
                        <CheckIcon width={13} height={13} />
                      ) : core.length > 0 ? (
                        `${done}/${core.length}`
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
              A curated path through the best videos, articles, books, papers, and
              interactive demos on how large language models actually work. The{' '}
              <span className="masthead__core-word">core</span> resources form the
              spine; <span className="masthead__opt-word">background</span> and{' '}
              <span className="masthead__opt-word">advanced</span> items are
              optional detours. Check things off as you go — completed items
              collapse so the path ahead stays clear. Progress is saved in this
              browser only.
            </p>
            <dl className="masthead__stats">
              <div className="masthead__stat">
                <dt>Chapters</dt>
                <dd>{curriculum.chapters.length}</dd>
              </div>
              <div className="masthead__stat">
                <dt>Core resources</dt>
                <dd>{coreTotal}</dd>
              </div>
              <div className="masthead__stat">
                <dt>Optional detours</dt>
                <dd>{optionalTotal}</dd>
              </div>
            </dl>
          </div>

          <div ref={sentinelRef} className="masthead-sentinel" aria-hidden="true" />

          {allCoreDone && (
            <div className="done-banner" role="status">
              <span className="done-banner__mark">
                <CheckIcon width={20} height={20} />
              </span>
              <div className="done-banner__text">
                <p className="done-banner__title">You finished the core path.</p>
                <p className="done-banner__sub">
                  Every required resource is checked off — from a single neuron to
                  the frontier.
                  {optionalDone < optionalTotal && (
                    <>
                      {' '}
                      {optionalTotal - optionalDone} optional detour
                      {optionalTotal - optionalDone === 1 ? '' : 's'} remain if you
                      want to go deeper.
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
                number={i + 1}
                isDone={isDone}
                onToggle={toggle}
                mounted={mounted}
              />
            ))}
          </div>

          <footer className="colophon">
            <p>
              {curriculum.title}. All resources link to their original authors and
              publishers. No accounts, no tracking — your progress lives only in
              this browser.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
