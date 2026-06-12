import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:3000/course', { waitUntil: 'networkidle' });
const info = await p.evaluate(() => {
  const rail = document.querySelector('.concept__rail');
  const c = getComputedStyle(rail);
  return {
    padding: c.padding,
    scrollLeft: rail.scrollLeft,
    firstLeft: rail.firstElementChild.getBoundingClientRect().left,
    railLeft: rail.getBoundingClientRect().left,
    userSelect: c.userSelect,
  };
});
console.log(JSON.stringify(info));
await b.close();
