import type { ReactNode } from 'react';
import { getCurriculum } from './data/load';
import { getProse } from './data/prose';
import { CourseApp } from './components/CourseApp';
import { Prose } from './components/Prose';
import { ProgressProvider } from './lib/progress';

// Server component: read the curriculum (with thumbnails overlaid), render the
// interstitial prose markdown to React on the server, and hand both to the
// client app. Metadata lives in layout.tsx.
export default function CoursePage() {
  const prose: Record<string, Record<string, ReactNode>> = {};
  for (const [chapter, blocks] of Object.entries(getProse())) {
    prose[chapter] = Object.fromEntries(
      Object.entries(blocks).map(([key, text]) => [
        key,
        <Prose key={key} text={text} intro={key === 'intro'} />,
      ]),
    );
  }

  return (
    <ProgressProvider>
      <CourseApp curriculum={getCurriculum()} prose={prose} />
    </ProgressProvider>
  );
}
