// 각 run의 h1 영역을 375/768px에서 잘라 qa/h1-375.png, qa/h1-768.png 로 저장한다 (제목 줄바꿈 가독성 blind 비교용).
import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url'; import { existsSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright');
const runs = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
for (const id of runs) {
  const dir = new URL(`../runs/${id}/`, import.meta.url).pathname;
  if (!existsSync(dir + 'index.html')) { console.log('skip', id); continue; }
  const p = await b.newPage({ viewport: { width: 375, height: 900 } });
  await p.goto(pathToFileURL(dir + 'index.html').href, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const w of [375, 768]) {
    await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(80);
    const h = await p.$('h1'); const bb = await h.boundingBox();
    const pad = 20; const y = Math.max(0, bb.y - pad);
    await p.screenshot({ path: `${dir}qa/h1-${w}.png`, clip: { x: 0, y: y, width: w, height: Math.min(bb.height + pad * 2, 400) } });
  }
  await p.close(); console.log('ok', id);
}
await b.close();
