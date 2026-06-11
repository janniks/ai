'use client';

import type { Concept } from '../data/types';
import { useProgress } from '../lib/progress';
import { ResourceCard } from './ResourceCard';
import { CheckIcon } from '../lib/icons';

interface Props {
  concept: Concept;
}

// Only the deeper/aside tracks get a label; "background" recession is signalled
// by the quieter title alone, so it carries no tag (avoids tag noise).
const TAG: Record<string, string> = {
  advanced: 'advanced',
  inspiration: 'inspiration',
};

// A concept: the thing you learn, with its resources in a horizontal rail. The
// concept counts as learned once you have checked off any one of its resources.
export function ConceptCluster({ concept }: Props) {
  const { mounted, isDone } = useProgress();
  const done = mounted ? concept.items.filter((r) => isDone(r.id)).length : 0;
  const learned = done >= 1;
  const tag = TAG[concept.track];

  return (
    <div className={`concept concept--${concept.track}${learned ? ' concept--learned' : ''}`}>
      <div className="concept__head">
        <span className="concept__mark" aria-hidden="true">
          <CheckIcon width={12} height={12} />
        </span>
        <div className="concept__heading">
          <h3 className="concept__title">
            {concept.title}
            {tag && <span className="concept__tag">{tag}</span>}
          </h3>
          {concept.summary && <p className="concept__summary">{concept.summary}</p>}
        </div>
        <span
          className="concept__progress"
          aria-label={`${done} of ${concept.items.length} resources done`}
        >
          {done}/{concept.items.length}
        </span>
      </div>

      <ol className="concept__rail">
        {concept.items.map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
      </ol>
    </div>
  );
}
