'use client';

import type { Chapter } from '../../data/types';
import { split, tier } from '../../lib/tiers';
import { Fold, RowItem } from './bits';
import type { VariantProps } from './types';

// E: reader. Prose-first, like a little book: chapter intro and concept prose
// flow as continuous text; each concept's resources are a quiet text list
// (essential pick emphasized), with deep dives and advanced folded away.
function ReaderChapter({
  chapter,
  index,
  prose,
}: {
  chapter: Chapter;
  index: number;
  prose?: Record<string, React.ReactNode>;
}) {
  const groups = split(chapter);
  const num = chapter.number ?? String(index).padStart(2, '0');
  return (
    <section className="chapter reader__chapter" id={chapter.id}>
      <header className="reader__head">
        <span className="chapter__num" aria-hidden="true">
          {num}
        </span>
        <h2 className="reader__title">{chapter.title}</h2>
      </header>
      {prose?.intro}
      {groups.fast.map((c) => {
        const tiers = tier(c);
        const picks = tiers.essentials.length > 0 ? tiers.essentials : c.items.slice(0, 1);
        const rest = c.items.filter((r) => !picks.includes(r));
        return (
          <div key={c.id} className="reader__concept">
            <h3 className="reader__concept-title">{c.title}</h3>
            <ol className="fold__rows reader__picks">
              {picks.map((r) => (
                <RowItem key={r.id} resource={r} />
              ))}
            </ol>
            {prose?.[c.id]}
            <Fold label="More on this" count={rest.length}>
              <ol className="fold__rows">
                {rest.map((r) => (
                  <RowItem key={r.id} resource={r} />
                ))}
              </ol>
            </Fold>
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
    </section>
  );
}

export function Reader({ chapters, prose }: VariantProps) {
  return (
    <div className="chapters reader">
      {chapters.map((ch, i) => (
        <ReaderChapter key={ch.id} chapter={ch} index={i + 1} prose={prose[ch.id]} />
      ))}
    </div>
  );
}
