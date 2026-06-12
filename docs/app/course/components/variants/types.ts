import type { ReactNode } from 'react';
import type { Chapter } from '../../data/types';

export interface VariantProps {
  chapters: Chapter[];
  /** chapterId → ('intro' | conceptId) → server-rendered prose node. */
  prose: Record<string, Record<string, ReactNode>>;
}
