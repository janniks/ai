import fs from 'node:fs';
import path from 'node:path';

// Server-only loader for the interstitial prose markdown files. Layout:
//   app/course/prose/<chapterId>/intro.md        → before the first concept
//   app/course/prose/<chapterId>/<conceptId>.md  → after that concept
// Missing directory or files simply mean no prose; nothing is faked.
const ROOT = path.join(process.cwd(), 'app/course/prose');

export type ChapterProse = Record<string, string>;

export function getProse(): Record<string, ChapterProse> {
  if (!fs.existsSync(ROOT)) return {};
  const out: Record<string, ChapterProse> = {};
  for (const chapter of fs.readdirSync(ROOT)) {
    const dir = path.join(ROOT, chapter);
    if (!fs.statSync(dir).isDirectory()) continue;
    const blocks: ChapterProse = {};
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      const text = fs.readFileSync(path.join(dir, file), 'utf8').trim();
      if (text) blocks[file.replace(/\.md$/, '')] = text;
    }
    if (Object.keys(blocks).length > 0) out[chapter] = blocks;
  }
  return out;
}
