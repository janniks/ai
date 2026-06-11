import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const url = process.env.URL ?? 'http://localhost:3000/course';
const out = process.env.OUT ?? '/tmp/shots';
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const errs = [];

const shot = async (name, width, height, full) => {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  await page.close();
};

await shot('desktop-top', 1280, 900, false);
await shot('desktop-full', 1280, 900, true);
await shot('mobile-top', 390, 844, false);
await shot('mobile-full', 390, 844, true);

await browser.close();
console.log('shots written to', out);
console.log('console errors:', errs.length ? errs.slice(0, 20) : 'none');
