import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:3000/course', { waitUntil: 'networkidle', timeout: 60000 });
const probe = (sel) =>
  p.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return { sel: s, missing: true };
    const c = getComputedStyle(el);
    return {
      text: el.textContent.slice(0, 28),
      fontFamily: c.fontFamily.slice(0, 40),
      color: c.color,
      lineHeight: c.lineHeight,
      marginTop: c.marginTop,
      fontSize: c.fontSize,
    };
  }, sel);
console.log('h1   ', JSON.stringify(await probe('main h1')));
console.log('sub  ', JSON.stringify(await probe('main h1 + p')));
console.log('lede ', JSON.stringify(await probe('main h1 + p + p')));
await b.close();
