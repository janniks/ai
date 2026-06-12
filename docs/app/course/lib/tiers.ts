import type { Chapter, Concept, Resource } from '../data/types';

// Splits used by the pace-aware layouts: the fast path shows teasers and
// essentials; everything else folds into deep-dive / advanced sections.

export interface Tiered {
  teasers: Resource[];
  essentials: Resource[];
  deep: Resource[];
}

export const tier = (concept: Concept): Tiered => {
  const teasers = concept.items.filter((r) => r.track === 'inspiration');
  const essentials = concept.items.filter((r) => r.essential);
  const deep = concept.items.filter((r) => !r.essential && r.track !== 'inspiration');
  return { teasers, essentials, deep };
};

/** Concepts on the fast path (shown by default) vs folded behind "advanced". */
export const split = (chapter: Chapter) => ({
  fast: chapter.concepts.filter((c) => c.track !== 'advanced'),
  advanced: chapter.concepts.filter((c) => c.track === 'advanced'),
});

/** Rough minutes from a human duration string ("18 min", "~3 hr", "6-week course"). */
export const minutes = (duration?: string): number => {
  if (!duration) return 20;
  const m = duration.match(/([\d.]+)\s*(min|hr|hour|h\b)/i);
  if (!m) return 30;
  const n = Number(m[1]);
  return /min/i.test(m[2]) ? n : n * 60;
};

export const chapterMinutes = (chapter: Chapter): number =>
  split(chapter)
    .fast.flatMap((c) => tier(c).essentials)
    .reduce((sum, r) => sum + minutes(r.duration), 0);
