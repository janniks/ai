'use client';

import type { Chapter, Concept } from '../../data/types';
import { chapterMinutes, split, tier } from '../../lib/tiers';
import { ResourceCard } from '../ResourceCard';
import { Rail } from '../Rail';
import { Fold, RowItem } from './bits';
import type { VariantProps } from './types';

// C: fast track. Each chapter is an hour: intro prose, a "get motivated"
// teaser strip, then one essential pick per concept. Everything else lives in
// per-concept deep dives and a chapter-level advanced fold, collapsed by
// default; you learn the full mental model without ever expanding them.
function FastConcept({
  concept,
  prose,
}: {
  concept: Concept;
  prose?: React.ReactNode;
}) {
  const tiers = tier(concept);
  const picks = tiers.essentials.length > 0 ? tiers.essentials : concept.items.slice(0, 1);
  return (
    <li className="fast__concept">
      <h3 className="fast__concept-title">{concept.title}</h3>
      {concept.summary && <p className="fast__concept-summary">{concept.summary}</p>}
      <ol className="fast__picks">
        {picks.map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
      </ol>
      <Fold label="Deep dive" count={tiers.deep.filter((r) => !picks.includes(r)).length}>
        <ol className="fold__rows">
          {tiers.deep
            .filter((r) => !picks.includes(r))
            .map((r) => (
              <RowItem key={r.id} resource={r} />
            ))}
        </ol>
      </Fold>
      {prose}
    </li>
  );
}

function FastChapter({
  chapter,
  index,
  prose,
}: {
  chapter: Chapter;
  index: number;
  prose?: Record<string, React.ReactNode>;
}) {
  const groups = split(chapter);
  const teasers = groups.fast.flatMap((c) => tier(c).teasers);
  const mins = chapterMinutes(chapter);
  const num = chapter.number ?? String(index).padStart(2, '0');
  const advancedItems = groups.advanced.flatMap((c) => c.items);

  return (
    <section className="chapter" id={chapter.id}>
      <header className="focus__chapter-head">
        <span className="chapter__num" aria-hidden="true">
          {num}
        </span>
        <div>
          <h2 className="focus__chapter-title">{chapter.title}</h2>
          <p className="chapter__summary">
            {chapter.summary}
            {mins > 0 && <span className="fast__time"> · about {Math.round(mins / 5) * 5} min</span>}
          </p>
        </div>
      </header>
      {prose?.intro}
      {teasers.length > 0 && (
        <div className="fast__teasers">
          <p className="fast__teasers-label">Get motivated</p>
          <Rail>
            {teasers.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </Rail>
        </div>
      )}
      <ol className="fast__concepts">
        {groups.fast.map((c) => (
          <FastConcept key={c.id} concept={c} prose={prose?.[c.id]} />
        ))}
      </ol>
      <Fold label="Advanced" count={advancedItems.length}>
        <ol className="fold__rows">
          {advancedItems.map((r) => (
            <RowItem key={r.id} resource={r} />
          ))}
        </ol>
      </Fold>
    </section>
  );
}

export function FastTrack({ chapters, prose }: VariantProps) {
  return (
    <div className="chapters">
      {chapters.map((ch, i) => (
        <FastChapter key={ch.id} chapter={ch} index={i + 1} prose={prose[ch.id]} />
      ))}
    </div>
  );
}
