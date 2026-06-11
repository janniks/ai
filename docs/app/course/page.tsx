import { getCurriculum } from './data/load';
import { CourseApp } from './components/CourseApp';
import { ProgressProvider } from './lib/progress';

// Server component: read the curriculum (with thumbnails overlaid) and hand it
// to the client app. Metadata lives in layout.tsx.
export default function CoursePage() {
  return (
    <ProgressProvider>
      <CourseApp curriculum={getCurriculum()} />
    </ProgressProvider>
  );
}
