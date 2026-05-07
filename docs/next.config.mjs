import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/[raw]': ['./app/**/content/*.md', './public/*.md'],
  },
};

export default withMDX(config);
