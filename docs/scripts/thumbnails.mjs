#!/usr/bin/env node
// Generate real thumbnail images for the /course curriculum.
// Fetches og:image / YouTube thumbnails from the actual source sites and saves
// them under docs/public/course/thumbs/<id>.<ext>, then writes a map to
// docs/app/course/data/thumbnails.json.
//
// Run directly with node (no npm/npx):  node docs/scripts/thumbnails.mjs
// ESM, Node 24, global fetch.

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..'); // docs/
const THUMBS_DIR = join(ROOT, 'public', 'course', 'thumbs');
const CURRICULUM = join(ROOT, 'app', 'course', 'data', 'curriculum.ts');
const OUT_JSON = join(ROOT, 'app', 'course', 'data', 'thumbnails.json');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const TIMEOUT_MS = 15_000;
const CONCURRENCY = 5;

/** Extract resource records from curriculum.ts via tolerant regex parsing. */
async function parseResources() {
  const src = await readFile(CURRICULUM, 'utf8');
  // Match each object that has id/type/url fields. Pull fields individually so
  // ordering / whitespace differences don't matter.
  const resources = [];
  // Split on "id:" occurrences inside items. Simpler: find all id blocks.
  const idRe = /\bid:\s*'([^']+)'/g;
  // We only want resource ids (those that also have a `url:` shortly after).
  // Parse object literals between `{` ... `}` at the item level is hard with
  // regex, so instead capture the whole file and for each url find the nearest
  // preceding id/type/author.
  // Approach: iterate over `url:` matches; for each, look back in the source.
  const urlRe = /\burl:\s*'([^']+)'/g;
  let m;
  while ((m = urlRe.exec(src)) !== null) {
    const url = m[1];
    const before = src.slice(0, m.index);
    const idMatch = [...before.matchAll(/\bid:\s*'([^']+)'/g)].pop();
    const typeMatch = [...before.matchAll(/\btype:\s*'([^']+)'/g)].pop();
    const authorMatch = [...before.matchAll(/\bauthor:\s*'([^']+)'/g)].pop();
    if (!idMatch || !typeMatch) continue;
    resources.push({
      id: idMatch[1],
      type: typeMatch[1],
      url,
      author: authorMatch ? authorMatch[1] : '',
    });
  }
  // Dedup by id (keep first), and drop ids that look like chapter ids (no url).
  const seen = new Set();
  return resources.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

function withTimeout(ms) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  return { signal: ac.signal, clear: () => clearTimeout(t) };
}

async function fetchText(url) {
  const { signal, clear } = withTimeout(TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal,
      redirect: 'follow',
      headers: {
        'User-Agent': UA,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clear();
  }
}

/** Fetch an image URL; return {buf, ext} or throw. */
async function fetchImage(url) {
  const { signal, clear } = withTimeout(TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal,
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'image/*,*/*;q=0.8' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    if (buf.length < 1024) throw new Error(`too small (${buf.length}b)`);
    const ext = sniffExt(buf, ct);
    if (!ext) throw new Error(`not an image (ct=${ct}, ${buf.length}b)`);
    return { buf, ext };
  } finally {
    clear();
  }
}

/** Determine extension from magic bytes, falling back to content-type. */
function sniffExt(buf, ct) {
  // Magic-byte sniff is authoritative.
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return 'jpg';
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
    return 'png';
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  )
    return 'webp';
  if (buf.length >= 2 && buf[0] === 0x47 && buf[1] === 0x49) return 'gif';
  // SVG (text-based)
  const head = buf.toString('ascii', 0, 256).trim().toLowerCase();
  if (head.startsWith('<svg') || head.startsWith('<?xml')) {
    if (head.includes('<svg')) return 'svg';
  }
  // Fall back to content-type.
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
  if (ct.includes('png')) return 'png';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('gif')) return 'gif';
  if (ct.includes('svg')) return 'svg';
  return null;
}

function getYouTubeVideoId(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.has('v')) return u.searchParams.get('v');
    // youtu.be/ID short form
    if (u.hostname.includes('youtu.be')) {
      const p = u.pathname.replace(/^\//, '');
      if (p) return p;
    }
    // /embed/ID
    const em = u.pathname.match(/\/embed\/([^/?]+)/);
    if (em) return em[1];
  } catch {
    /* ignore */
  }
  return null;
}

function isYouTubePlaylist(url) {
  try {
    const u = new URL(url);
    return u.pathname.includes('/playlist') && u.searchParams.has('list');
  } catch {
    return false;
  }
}

/** Try maxres then hqdefault for a YouTube video id. */
async function youTubeThumb(videoId) {
  const urls = [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  ];
  let lastErr;
  for (const u of urls) {
    try {
      return await fetchImage(u);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('no yt thumb');
}

/** Extract first video id from a playlist page HTML. */
function firstVideoIdFromHtml(html) {
  // Common patterns in playlist page JSON.
  const m =
    html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/) ||
    html.match(/watch\?v=([a-zA-Z0-9_-]{11})/) ||
    html.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
  return m ? m[1] : null;
}

/** Decode HTML entities in attribute values. */
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Pull a meta/link image URL from HTML in priority order. */
function extractOgImage(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /<meta[^>]+property=["']og:image:url["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    /<meta[^>]+name=["']twitter:image:src["'][^>]*content=["']([^"']+)["']/i,
    /<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1].trim());
  }
  return null;
}

function resolveUrl(maybeRelative, base) {
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return maybeRelative;
  }
}

// Noise we never want as a thumbnail: trackers, avatars, license badges, logos.
const IMG_BLOCKLIST =
  /piwik|analytics|avatar|githubusercontent\.com\/u\/|creativecommons|i\.creativecommons|\/logo|logo\.|sprite|icon|favicon|gravatar|badge|\.svg(\?|$)|1x1|pixel|spacer/i;

/** First in-content <img>/data-src that looks like a real diagram. */
function extractFirstContentImage(html) {
  const re =
    /<img\b[^>]*?\b(?:data-src|data-lazy-src|data-original|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const src = m[1].trim();
    if (!src || src.startsWith('data:')) continue;
    if (IMG_BLOCKLIST.test(src)) continue;
    return decodeEntities(src);
  }
  // Fallback: any referenced raster asset path in the page (covers blogs that
  // lazy-render <img> via JS and only ship the asset URL in markup/JSON).
  const assetRe =
    /["'(]((?:https?:)?\/[^"'()\s]+?\.(?:png|jpe?g|webp))["')]/gi;
  while ((m = assetRe.exec(html)) !== null) {
    const src = m[1].trim();
    if (IMG_BLOCKLIST.test(src)) continue;
    return decodeEntities(src);
  }
  return null;
}

/** Largest base64-embedded raster image in the HTML, as {buf, ext}. */
function extractFirstDataUriImage(html) {
  const re = /data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)/gi;
  let best = null;
  let m;
  while ((m = re.exec(html)) !== null) {
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length < 4096) continue; // skip tiny inline icons
    if (!best || buf.length > best.buf.length) {
      let ext = m[1].toLowerCase();
      if (ext === 'jpeg') ext = 'jpg';
      best = { buf, ext };
    }
    if (best && best.buf.length > 200_000) break; // good enough
  }
  return best;
}

async function pageOgImage(pageUrl) {
  const html = await fetchText(pageUrl);
  // Priority 1: og:image / twitter:image / image_src.
  const og = extractOgImage(html);
  if (og) {
    try {
      return await fetchImage(resolveUrl(og, pageUrl));
    } catch {
      /* fall through */
    }
  }
  // Priority 2: first meaningful in-content / referenced image.
  const content = extractFirstContentImage(html);
  if (content) {
    try {
      return await fetchImage(resolveUrl(content, pageUrl));
    } catch {
      /* fall through */
    }
  }
  // Priority 3: embedded base64 image (e.g. notebook-rendered pages).
  const data = extractFirstDataUriImage(html);
  if (data) return data;
  throw new Error('no og:image');
}

async function resolveThumb(res) {
  // YouTube playlist
  if (isYouTubePlaylist(res.url)) {
    try {
      const html = await fetchText(res.url);
      const vid = firstVideoIdFromHtml(html);
      if (vid) return await youTubeThumb(vid);
    } catch {
      /* fall through to og:image */
    }
    return pageOgImage(res.url);
  }
  // YouTube video
  const vid = getYouTubeVideoId(res.url);
  if (vid && /youtu/.test(res.url)) {
    return youTubeThumb(vid);
  }
  // Everything else
  return pageOgImage(res.url);
}

async function runPool(items, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  await mkdir(THUMBS_DIR, { recursive: true });
  const resources = await parseResources();
  console.log(`Parsed ${resources.length} resources.`);

  const map = {};
  const failures = [];

  await runPool(resources, async (res) => {
    try {
      const { buf, ext } = await resolveThumb(res);
      const file = join(THUMBS_DIR, `${res.id}.${ext}`);
      await writeFile(file, buf);
      map[res.id] = { thumbnail: `/course/thumbs/${res.id}.${ext}` };
      console.log(`  ok   ${res.id} -> ${res.id}.${ext} (${buf.length}b)`);
    } catch (e) {
      failures.push({ id: res.id, url: res.url, reason: String(e.message || e) });
      console.log(`  FAIL ${res.id}: ${e.message || e}`);
    }
  });

  // Stable key order for a clean diff.
  const ordered = {};
  for (const r of resources) if (map[r.id]) ordered[r.id] = map[r.id];
  await writeFile(OUT_JSON, JSON.stringify(ordered, null, 2) + '\n');

  console.log(
    `\nDone: ${Object.keys(ordered).length}/${resources.length} saved.`,
  );
  if (failures.length) {
    console.log('Failures:');
    for (const f of failures) console.log(`  - ${f.id}: ${f.reason}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
