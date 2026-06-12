'use client';

import { ChapterSection } from '../ChapterSection';
import type { VariantProps } from './types';

// A: the current editorial layout. Every concept is a card with its full
// horizontal rail; prose interleaves between concepts.
export function Editorial({ chapters, prose }: VariantProps) {
  return (
    <div className="chapters">
      {chapters.map((ch, i) => (
        <ChapterSection key={ch.id} chapter={ch} index={i + 1} prose={prose[ch.id]} />
      ))}
    </div>
  );
}
