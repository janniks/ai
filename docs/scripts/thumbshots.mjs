// Screenshot-based thumbnail fallback for resources whose pages expose no
// og:image (mostly interactive demos). Renders the live page at 16:9 and saves
// a JPEG into public/course/thumbs, then merges into thumbnails.json.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const THUMBS = path.join(ROOT, 'public/course/thumbs');
const JSON_PATH = path.join(ROOT, 'app/course/data/thumbnails.json');

const ids = [
  'immersive-linear-algebra',
  'stat110',
  'r2d3-visual-ml',
  'programmers-intro-math',
  'wigner-unreasonable-math',
  'karpathy-zero-to-hero',
  'intro-to-pytorch',
  'goodfellow-dl-book',
  'tiktokenizer',
  'llm-viz-3d',
  'transformers-from-scratch-bloem',
  'rotary-embeddings-eleuther',
  'sutskever-decade',
  'diffusion-explainer',
  'gan-lab',
  'flow-matching-mit',
  'induction-heads',
  'transformer-circuits-framework',
  'distill-zoom-in-circuits',
  'toy-models-superposition',
];

const source = fs.readFileSync(
  path.join(ROOT, 'app/course/data/curriculum.ts'),
  'utf8',
);
const urlFor = (id) => {
  const m = source.match(
    new RegExp(`id: '${id}'[\\s\\S]{0,400}?url: '([^']+)'`),
  );
  return m?.[1];
};

const json = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const browser = await chromium.launch();

for (const id of ids) {
  const out = path.join(THUMBS, `${id}.jpg`);
  if (fs.existsSync(out)) {
    json[id] = { thumbnail: `/course/thumbs/${id}.jpg` };
    continue;
  }
  const url = urlFor(id);
  if (!url) {
    console.log(`SKIP ${id}: no url`);
    continue;
  }
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
    });
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: out, type: 'jpeg', quality: 80 });
    await page.close();
    json[id] = { thumbnail: `/course/thumbs/${id}.jpg` };
    console.log(`ok   ${id}`);
  } catch (e) {
    console.log(`FAIL ${id}: ${e.message.split('\n')[0]}`);
  }
}

await browser.close();
fs.writeFileSync(JSON_PATH, JSON.stringify(json, null, 2) + '\n');
console.log('thumbnails.json updated');
