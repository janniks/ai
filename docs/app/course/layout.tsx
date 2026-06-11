import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono, Newsreader } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './course.css';

// Self-contained type system for /course. Loaded here, exposed as CSS variables
// on the .course wrapper, referenced by course.css. The wrapper establishes its
// own background/foreground so the page does not inherit the site (fumadocs) theme.

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'How LLMs Actually Work',
  description:
    'A self-study curriculum, from a single neuron to the frontier. The best videos, articles, books, papers, and interactive demos on how large language models actually work — chaptered and check-off-able.',
};

export default function CourseLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`course ${newsreader.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      {children}
    </div>
  );
}
