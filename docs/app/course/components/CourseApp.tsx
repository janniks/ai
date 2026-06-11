'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Curriculum } from '../data/types';
import { useProgress } from '../lib/useProgress';
import { ChapterSection } from './ChapterSection';
import { ProgressBar, ProgressRing } from './ProgressMeter';
import { CheckIcon, ListIcon, ResetIcon } from '../lib/icons';

interface Props {
  curriculum: Curriculum;
}

// Top-level client app. Progress is tracked per resource; a concept counts as
// learned once any of its resources is checked. Overall progress counts CORE
// concepts (the spine); optional concepts are surfaced separately.
export function CourseApp({ curriculum }: Props) {
  const progress = useProgress();
  const { mounted, isDone, toggle, resetAll } = progress;

  const concepts = useMemo(() => {
    const core = curriculum.chapters.flatMap((ch) =>
      ch.concepts.filter((c) => c.track === 'core'),
    );
    const opt = curriculum.chapters.flatMap((ch) =>
      ch.concepts.filter((c) => c.track !== 'core'),
    );
    return { core, opt };
  }, [curriculum]);

  const learned = (c: { items: { id: string }[] }) =>
    c.items.some((r) => isDone(r.id));

  const total = concepts.core.length;
  const done = mounted ? concepts.core.filter(learned).length : 0;
  const optdone = mounted ? concepts.opt.filter(learned).length : 0;
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

  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (!confirm) return;
    const t = window.setTimeout(() => setConfirm(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirm]);

  return (
    <>
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
              const cdone = mounted ? core.filter(learned).length : 0;
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
                isDone={isDone}
                onToggle={toggle}
                mounted={mounted}
              />
            ))}
          </div>

          <footer className="colophon">
            <p className="colophon__note">
              {curriculum.title}. All resources link to their original authors and
              publishers. No accounts, no tracking.
            </p>
            <div className="colophon__reset">
              {confirm ? (
                <span className="reset" role="group" aria-label="Confirm reset">
                  <span className="reset__prompt">Reset all progress?</span>
                  <button
                    type="button"
                    className="reset__confirm"
                    onClick={() => {
                      resetAll();
                      setConfirm(false);
                    }}
                  >
                    Yes, reset
                  </button>
                  <button
                    type="button"
                    className="reset__cancel"
                    onClick={() => setConfirm(false)}
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className="reset__trigger"
                  onClick={() => setConfirm(true)}
                  disabled={!mounted || progress.doneCount === 0}
                >
                  <ResetIcon width={14} height={14} />
                  <span>Reset progress</span>
                </button>
              )}
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
