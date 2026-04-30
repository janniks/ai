import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import rehypeRaw from 'rehype-raw';

export const docs = defineDocs({
  docs: { schema: frontmatterSchema },
  meta: { schema: metaSchema },
});

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (v) => [
      [
        rehypeRaw,
        {
          passThrough: [
            'mdxJsxFlowElement',
            'mdxJsxTextElement',
            'mdxFlowExpression',
            'mdxTextExpression',
            'mdxjsEsm',
          ],
        },
      ],
      ...v,
    ],
  },
});
