// Shrink thumbnails to what the cards actually render (224px wide, 2x retina):
// 480px-wide WebP. Replaces the originals and rewrites thumbnails.json.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'public/course/thumbs');
const JSON_PATH = path.join(ROOT, 'app/course/data/thumbnails.json');

const json = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
let before = 0;
let after = 0;

for (const file of fs.readdirSync(DIR)) {
  if (file.endsWith('.webp')) continue;
  const src = path.join(DIR, file);
  const id = file.replace(/\.[a-z]+$/, '');
  const out = path.join(DIR, `${id}.webp`);
  before += fs.statSync(src).size;
  await sharp(src)
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out);
  after += fs.statSync(out).size;
  fs.unlinkSync(src);
  if (json[id]) json[id] = { thumbnail: `/course/thumbs/${id}.webp` };
}

fs.writeFileSync(JSON_PATH, JSON.stringify(json, null, 2) + '\n');
console.log(
  `${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB`,
);
