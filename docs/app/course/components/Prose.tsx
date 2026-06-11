import type { ReactNode } from 'react';

// Full-width interstitial prose, set at a book measure (~65ch) for interleaving
// chapter intros and between-card commentary among the resource cards.
//
// INTERSTITIAL-PROSE CONTRACT (no markdown/math pipeline yet — layout only):
// Real chapter prose (Little-Book-of-Deep-Learning style, with inline math) will
// be authored later as separate markdown files and slotted in by key:
//   - chapter intro:  prose that renders BEFORE the first card  → key `intro`
//   - between cards:   prose that renders AFTER a given card     → key = resource id
// ChapterSection walks `chapter.items` and, for each resource, emits the card and
// then any prose block keyed to that resource id. The intro block (if any) is
// emitted once at the top of the body. A future loader will produce a
// `Record<string, ReactNode>` (id|"intro" → rendered prose) per chapter; for now
// nothing is wired in and no prose is faked.
export function Prose({
  children,
  intro,
}: {
  children: ReactNode;
  intro?: boolean;
}) {
  return <div className={`prose${intro ? ' prose--intro' : ''}`}>{children}</div>;
}
