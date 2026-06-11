#!/usr/bin/env node
// Cache the readable full text / transcript of every /course curriculum
// resource into sources/_fulltext/<id>.md so we have offline copies to work
// from later.
//
// Per resource type:
//   article / course / interactive  -> readable HTML -> markdown-ish text
//   paper (arxiv)                    -> ar5iv / arxiv HTML full text, else abstract
//   video (YouTube)                  -> transcript (yt-dlp if present, else page captions)
//   book                             -> product-page metadata only (usually paywalled)
//
// Idempotent: skips ids whose <id>.md already exists and is > 500 bytes, so it
// is safe to re-run when the curriculum grows.
//
// Run directly with node (no npm/npx):  node docs/scripts/fetch-texts.mjs
// ESM, Node 24, global fetch.

import { mkdir, writeFile, readFile, stat, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..'); // docs/
const REPO_ROOT = join(ROOT, '..');
const CURRICULUM = join(ROOT, 'app', 'course', 'data', 'curriculum.ts');
const OUT_DIR = join(REPO_ROOT, 'sources', '_fulltext');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 4;
const RETRIES = 2;
const MIN_BYTES = 500;

/** Extract resource records from curriculum.ts via tolerant regex parsing. */
async function parseResources() {
  const src = await readFile(CURRICULUM, 'utf8');
  const resources = [];
  const urlRe = /\burl:\s*'([^']+)'/g;
  let m;
  while ((m = urlRe.exec(src)) !== null) {
    const url = m[1];
    const before = src.slice(0, m.index);
    const idMatch = [...before.matchAll(/\bid:\s*'([^']+)'/g)].pop();
    const typeMatch = [...before.matchAll(/\btype:\s*'([^']+)'/g)].pop();
    const titleMatch = [...before.matchAll(/\btitle:\s*'([^']+)'/g)].pop();
    const authorMatch = [...before.matchAll(/\bauthor:\s*'([^']+)'/g)].pop();
    if (!idMatch || !typeMatch) continue;
    resources.push({
      id: idMatch[1],
      type: typeMatch[1],
      url,
      title: titleMatch ? titleMatch[1] : '',
      author: authorMatch ? authorMatch[1] : '',
    });
  }
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Fetch text with timeout + retries on transient errors. */
async function fetchText(url, { accept } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const { signal, clear } = withTimeout(TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal,
        redirect: 'follow',
        headers: {
          'User-Agent': UA,
          Accept:
            accept ||
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (!res.ok) {
        // Retry on 429/5xx; bail immediately on other 4xx.
        if (res.status === 429 || res.status >= 500) {
          throw new Error(`HTTP ${res.status}`);
        }
        const err = new Error(`HTTP ${res.status}`);
        err.fatal = true;
        throw err;
      }
      return await res.text();
    } catch (e) {
      lastErr = e;
      if (e.fatal || attempt === RETRIES) break;
      await sleep(800 * (attempt + 1));
    } finally {
      clear();
    }
  }
  throw lastErr;
}

// --------------------------------------------------------------------------
// HTML -> text helpers
// --------------------------------------------------------------------------

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => {
      try {
        return String.fromCodePoint(Number(n));
      } catch {
        return _;
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => {
      try {
        return String.fromCodePoint(parseInt(n, 16));
      } catch {
        return _;
      }
    });
}

/** Strip elements we never want from an HTML fragment. */
function stripChrome(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, '')
    .replace(/<header\b[\s\S]*?<\/header>/gi, '')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, '')
    .replace(/<form\b[\s\S]*?<\/form>/gi, '')
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, '');
}

/** Convert a cleaned HTML fragment into readable markdown-ish text. */
function htmlFragmentToText(fragment) {
  let s = fragment;
  // Block-level breaks.
  s = s
    .replace(/<\/(p|div|section|article|li|tr|figure|figcaption)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(ul|ol|table|pre|blockquote)>/gi, '\n\n');
  // Headings -> markdown.
  for (let level = 1; level <= 6; level++) {
    const re = new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi');
    s = s.replace(re, (_, inner) => `\n\n${'#'.repeat(level)} ${stripTags(inner).trim()}\n\n`);
  }
  // List items -> bullets.
  s = s.replace(/<li\b[^>]*>/gi, '\n- ');
  // Drop all remaining tags.
  s = stripTags(s);
  s = decodeEntities(s);
  // Collapse whitespace.
  s = s
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
  return s;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '');
}

function extractTitle(html) {
  const m = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(stripTags(m[1])).trim() : '';
}

function extractMetaDescription(html) {
  const patterns = [
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']description["']/i,
    /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:description["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1].trim());
  }
  return '';
}

/**
 * Readability heuristic: pick the largest <article>/<main>, else the densest
 * block of <p> content, and convert it to text.
 */
function readableFromHtml(html) {
  const cleaned = stripChrome(html);

  // Prefer the largest <article> or <main> region.
  const candidates = [];
  for (const tag of ['article', 'main']) {
    const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    let m;
    while ((m = re.exec(cleaned)) !== null) candidates.push(m[1]);
  }
  // Also consider common content containers by id/class.
  const containerRe =
    /<(?:div|section)\b[^>]*(?:id|class)=["'][^"']*(?:content|post|article|markdown|prose|entry|main)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/gi;
  let cm;
  while ((cm = containerRe.exec(cleaned)) !== null) candidates.push(cm[1]);

  let best = '';
  let bestScore = 0;
  for (const c of candidates) {
    const text = htmlFragmentToText(c);
    const pCount = (c.match(/<p\b/gi) || []).length;
    const score = text.length + pCount * 50;
    if (score > bestScore) {
      bestScore = score;
      best = text;
    }
  }

  // Fallback: convert the whole <body> if no good container found.
  const bodyText = (() => {
    const bm = cleaned.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    return htmlFragmentToText(bm ? bm[1] : cleaned);
  })();

  if (best.length >= bodyText.length * 0.4 && best.length > 400) return best;
  return bodyText.length > best.length ? bodyText : best;
}

// --------------------------------------------------------------------------
// arxiv / papers
// --------------------------------------------------------------------------

function arxivId(url) {
  const m = url.match(/arxiv\.org\/abs\/([^?#]+)/i);
  return m ? m[1] : null;
}

async function fetchPaper(res) {
  const id = arxivId(res.url);
  if (!id) {
    // Non-arxiv paper: just do a readability pass.
    const html = await fetchText(res.url);
    return { via: 'html', text: readableFromHtml(html) };
  }
  // 1. ar5iv HTML full text.
  try {
    const html = await fetchText(`https://ar5iv.org/abs/${id}`);
    const text = readableFromHtml(html);
    if (text.length > 2000) return { via: 'ar5iv', text };
  } catch {
    /* fall through */
  }
  // 2. arxiv native HTML (newer papers).
  try {
    const html = await fetchText(`https://arxiv.org/html/${id}`);
    const text = readableFromHtml(html);
    if (text.length > 2000) return { via: 'arxiv-html', text };
  } catch {
    /* fall through */
  }
  // 3. Abstract page fallback.
  const html = await fetchText(res.url);
  const absM = html.match(
    /<blockquote\b[^>]*class=["'][^"']*abstract[^"']*["'][^>]*>([\s\S]*?)<\/blockquote>/i,
  );
  const title = extractTitle(html);
  const abstract = absM ? htmlFragmentToText(absM[1]) : extractMetaDescription(html);
  const text = [title && `# ${title}`, abstract].filter(Boolean).join('\n\n');
  return { via: 'arxiv-abstract', text };
}

// --------------------------------------------------------------------------
// YouTube transcripts
// --------------------------------------------------------------------------

function getYouTubeVideoId(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.has('v')) return u.searchParams.get('v');
    if (u.hostname.includes('youtu.be')) {
      const p = u.pathname.replace(/^\//, '');
      if (p) return p;
    }
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

function firstVideoIdFromHtml(html) {
  const m =
    html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/) ||
    html.match(/watch\?v=([a-zA-Z0-9_-]{11})/) ||
    html.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
  return m ? m[1] : null;
}

let _ytDlpChecked = false;
let _ytDlpAvailable = false;
async function hasYtDlp() {
  if (_ytDlpChecked) return _ytDlpAvailable;
  _ytDlpChecked = true;
  try {
    await execFileP('yt-dlp', ['--version'], { timeout: 10_000 });
    _ytDlpAvailable = true;
  } catch {
    _ytDlpAvailable = false;
  }
  return _ytDlpAvailable;
}

/** Convert WebVTT subtitle text to a plain de-duplicated transcript. */
function vttToText(vtt) {
  const lines = vtt.split(/\r?\n/);
  const out = [];
  let last = '';
  for (let line of lines) {
    if (!line.trim()) continue;
    if (/^WEBVTT/.test(line)) continue;
    if (/^\d+$/.test(line.trim())) continue; // cue number
    if (/-->/.test(line)) continue; // timestamps
    if (/^(Kind|Language|NOTE|STYLE):/i.test(line)) continue;
    // Strip inline timing tags like <00:00:01.000> and <c> styling.
    line = line.replace(/<[^>]+>/g, '').trim();
    line = decodeEntities(line);
    if (!line) continue;
    if (line === last) continue; // YT rolling-caption duplicates
    out.push(line);
    last = line;
  }
  return out.join('\n');
}

/** Try yt-dlp to grab subtitles into the out dir; return transcript or null. */
async function ytDlpTranscript(videoUrl, id) {
  if (!(await hasYtDlp())) return null;
  const tmpl = join(OUT_DIR, `${id}.%(ext)s`);
  try {
    await execFileP(
      'yt-dlp',
      [
        '--skip-download',
        '--write-auto-subs',
        '--write-subs',
        '--sub-langs',
        'en.*,en',
        '--sub-format',
        'vtt',
        '-o',
        tmpl,
        videoUrl,
      ],
      { timeout: 90_000 },
    );
  } catch {
    /* may still have written a file before failing */
  }
  // Find any .vtt the run produced for this id.
  const files = await readdir(OUT_DIR).catch(() => []);
  const vttName = files.find((f) => f.startsWith(`${id}.`) && f.endsWith('.vtt'));
  if (!vttName) return null;
  const vttPath = join(OUT_DIR, vttName);
  const vtt = await readFile(vttPath, 'utf8').catch(() => '');
  await rm(vttPath, { force: true }).catch(() => {});
  const text = vttToText(vtt);
  return text.length > 200 ? text : null;
}

/** Parse captionTracks JSON out of a watch page and fetch the timedtext. */
async function pageCaptionTranscript(videoId) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}&hl=en`;
  const html = await fetchText(watchUrl);
  const m = html.match(/"captionTracks":(\[.*?\])/);
  if (!m) return null;
  let tracks;
  try {
    tracks = JSON.parse(m[1].replace(/\\u0026/g, '&'));
  } catch {
    return null;
  }
  if (!tracks.length) return null;
  // Prefer an English track; else the first.
  const track =
    tracks.find((t) => /^en/i.test(t.languageCode || '')) || tracks[0];
  let baseUrl = track.baseUrl;
  if (!baseUrl) return null;
  baseUrl = baseUrl.replace(/\\u0026/g, '&');

  // Try JSON3 first (clean structured text), then raw XML timedtext.
  for (const u of [`${baseUrl}&fmt=json3`, baseUrl]) {
    try {
      const body = await fetchText(u, { accept: '*/*' });
      const text = u.includes('json3')
        ? timedtextJsonToText(body)
        : timedtextXmlToText(body);
      if (text && text.length > 200) return text;
    } catch {
      /* try next */
    }
  }
  return null;
}

function timedtextJsonToText(body) {
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    return null;
  }
  const events = data.events || [];
  const parts = [];
  for (const ev of events) {
    if (!ev.segs) continue;
    const seg = ev.segs.map((s) => s.utf8 || '').join('');
    if (seg.trim()) parts.push(seg);
  }
  return decodeEntities(parts.join(' '))
    .replace(/\s*\n\s*/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function timedtextXmlToText(body) {
  const texts = [...body.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)].map((m) =>
    decodeEntities(stripTags(m[1])).trim(),
  );
  return texts.filter(Boolean).join(' ').replace(/[ \t]{2,}/g, ' ').trim();
}

async function fetchVideo(res) {
  let videoId = getYouTubeVideoId(res.url);
  let sourceUrl = res.url;

  if (!videoId && isYouTubePlaylist(res.url)) {
    // Transcribe the first video in the playlist.
    try {
      const html = await fetchText(res.url);
      videoId = firstVideoIdFromHtml(html);
      if (videoId) sourceUrl = `https://www.youtube.com/watch?v=${videoId}`;
    } catch {
      /* ignore */
    }
  }
  if (!videoId) throw new Error('no YouTube video id');

  // (a) yt-dlp.
  const viaDlp = await ytDlpTranscript(sourceUrl, res.id);
  if (viaDlp) return { via: 'yt-dlp-transcript', text: viaDlp };

  // (b) watch-page caption tracks.
  const viaPage = await pageCaptionTranscript(videoId);
  if (viaPage) return { via: 'page-transcript', text: viaPage };

  throw new Error('no transcript available');
}

// --------------------------------------------------------------------------
// book: metadata-only
// --------------------------------------------------------------------------

async function fetchBook(res) {
  const html = await fetchText(res.url);
  const title = extractTitle(html);
  const desc = extractMetaDescription(html);
  // Best-effort: capture any visible heading list as a rough TOC.
  const headings = [...stripChrome(html).matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi)]
    .map((m) => decodeEntities(stripTags(m[1])).trim())
    .filter((h) => h && h.length < 200)
    .slice(0, 40);
  const parts = [
    title && `# ${title}`,
    desc && `\n${desc}`,
    headings.length && `\n## Page sections / TOC\n\n${headings.map((h) => `- ${h}`).join('\n')}`,
  ].filter(Boolean);
  return { via: 'metadata', text: parts.join('\n') };
}

// --------------------------------------------------------------------------
// dispatch + frontmatter
// --------------------------------------------------------------------------

function yamlEscape(v) {
  const s = String(v ?? '');
  if (/[:#'"\n]/.test(s)) return JSON.stringify(s);
  return s;
}

function frontmatter(res, via) {
  return [
    '---',
    `id: ${yamlEscape(res.id)}`,
    `title: ${yamlEscape(res.title)}`,
    `author: ${yamlEscape(res.author)}`,
    `url: ${yamlEscape(res.url)}`,
    `type: ${yamlEscape(res.type)}`,
    `fetched_via: ${yamlEscape(via)}`,
    '---',
    '',
  ].join('\n');
}

async function fetchResource(res) {
  switch (res.type) {
    case 'paper':
      return fetchPaper(res);
    case 'video':
      return fetchVideo(res);
    case 'book':
      return fetchBook(res);
    case 'article':
    case 'course':
    case 'interactive':
    default: {
      const html = await fetchText(res.url);
      const text = readableFromHtml(html);
      if (!text || text.length < 200) {
        // JS-rendered SPA (common for `interactive`): salvage page metadata so
        // we at least record what the resource is.
        const desc = extractMetaDescription(html);
        const pageTitle = extractTitle(html);
        const note =
          'This is a JavaScript-rendered interactive page; full content is not ' +
          'available as static text. Visit the URL to use it live.';
        const fallback = [
          `# ${pageTitle || res.title}`,
          desc,
          note,
        ]
          .filter(Boolean)
          .join('\n\n');
        return { via: 'metadata', text: fallback };
      }
      return { via: 'html', text };
    }
  }
}

async function alreadyDone(id) {
  try {
    const s = await stat(join(OUT_DIR, `${id}.md`));
    return s.size > MIN_BYTES;
  } catch {
    return false;
  }
}

async function runPool(items, worker) {
  let i = 0;
  const runners = Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx]);
    }
  });
  await Promise.all(runners);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const resources = await parseResources();
  console.log(`Parsed ${resources.length} resources.`);

  const stats = { skipped: 0, ok: 0, failed: 0 };
  const byVia = {};
  const failures = [];

  await runPool(resources, async (res) => {
    if (await alreadyDone(res.id)) {
      stats.skipped++;
      console.log(`  skip ${res.id} (exists)`);
      return;
    }
    try {
      const { via, text } = await fetchResource(res);
      const clean = (text || '').trim();
      const body = frontmatter(res, via) + clean + '\n';
      await writeFile(join(OUT_DIR, `${res.id}.md`), body);
      stats.ok++;
      byVia[via] = (byVia[via] || 0) + 1;
      console.log(`  ok   ${res.id} [${via}] (${body.length}b)`);
    } catch (e) {
      stats.failed++;
      failures.push({ id: res.id, type: res.type, reason: String(e.message || e) });
      console.log(`  FAIL ${res.id}: ${e.message || e}`);
    }
  });

  console.log(
    `\nDone. ${stats.ok} written, ${stats.skipped} skipped, ${stats.failed} failed (of ${resources.length}).`,
  );
  if (Object.keys(byVia).length) {
    console.log('By method:');
    for (const [via, n] of Object.entries(byVia).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${via}: ${n}`);
    }
  }
  if (failures.length) {
    console.log('Failures:');
    for (const f of failures) console.log(`  - ${f.id} (${f.type}): ${f.reason}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
