import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1380, height: 1000 } });
await p.goto('http://localhost:3000/course', { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
const order = [['Fast Track','FastTrack'],['Editorial','Editorial'],['Focus','Focus'],['Guided','Guided'],['Reader','Reader']];
let currentLabel = 'Fast Track';
for (const [label, file] of order) {
  if (label !== currentLabel) {
    await p.getByText(currentLabel, { exact: true }).first().click();
    await p.waitForTimeout(300);
    await p.getByText(label, { exact: true }).last().click();
    await p.waitForTimeout(700);
    currentLabel = label;
  }
  await p.evaluate(() => window.scrollTo(0, 820));
  await p.waitForTimeout(500);
  await p.screenshot({ path: `/tmp/shots/v-${file}.png` });
  console.log('shot', file);
}
await b.close();
