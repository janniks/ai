import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { TipChip } from './TipChip';

interface Node {
  type: string;
  tagName?: string;
  value?: string;
  children?: Node[];
  properties?: Record<string, unknown> & { className?: string[] };
}

// Authors mark non-trivial formulas as `$...${tip:plain reading}`. After KaTeX
// renders, the marker is the text node right after the math element; wrap the
// math in a custom <tip-chip> element carrying the reading, which the renderer
// maps onto the TipChip tooltip component.
const rehypeTips = () => (tree: Node) => {
  const walk = (node: Node) => {
    const kids = node.children;
    if (!kids) return;
    kids.forEach(walk);
    for (let i = kids.length - 1; i > 0; i -= 1) {
      const text = kids[i];
      if (text?.type !== 'text' || !text.value) continue;
      const match = text.value.match(/^\{tip:([^}]+)\}/);
      if (!match) continue;
      const prev = kids[i - 1];
      const cls = prev?.properties?.className;
      if (prev?.type !== 'element' || !cls?.some((c) => c.startsWith('katex'))) continue;
      text.value = text.value.slice(match[0].length);
      kids[i - 1] = {
        type: 'element',
        tagName: 'tip-chip',
        properties: { dataTip: match[1] },
        children: [prev],
      };
    }
  };
  walk(tree);
};

const components = {
  'tip-chip': (props: { 'data-tip'?: string; children?: React.ReactNode }) => (
    <TipChip tip={props['data-tip'] ?? ''}>{props.children}</TipChip>
  ),
} as Components;

// Full-width interstitial prose, set at a book measure (~65ch), interleaved
// among the concept clusters. Server component: markdown with inline/display
// math is rendered at build time via remark-math + KaTeX.
//   - <chapter>/intro.md        renders before the first concept
//   - <chapter>/<conceptId>.md  renders after that concept
export function Prose({ text, intro }: { text: string; intro?: boolean }) {
  return (
    <div className={`prose${intro ? ' prose--intro' : ''}`}>
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeTips]}
        components={components}
      >
        {text}
      </Markdown>
    </div>
  );
}
