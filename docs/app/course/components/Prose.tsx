import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Full-width interstitial prose, set at a book measure (~65ch), interleaved
// among the concept clusters. Server component: markdown with inline/display
// math is rendered at build time via remark-math + KaTeX.
//   - <chapter>/intro.md        renders before the first concept
//   - <chapter>/<conceptId>.md  renders after that concept
export function Prose({ text, intro }: { text: string; intro?: boolean }) {
  return (
    <div className={`prose${intro ? ' prose--intro' : ''}`}>
      <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {text}
      </Markdown>
    </div>
  );
}
