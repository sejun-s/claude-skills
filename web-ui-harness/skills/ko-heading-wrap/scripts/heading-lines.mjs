#!/usr/bin/env node
// 제목(h1~h3 등)의 폭별 줄바꿈을 추출하고, 지정한 구(phrase)가 줄 경계에서 쪼개지는지 검사한다.
// usage: node heading-lines.mjs <file.html> [--keep "고장의 징후,멈추기 전에"] [--widths 320,375,768,1024,1440] [--selector "h1,h2,h3"] [--json]
// exit code: 쪼개진 구가 있으면 1.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright');
const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--'));
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
if (!file) { console.error('usage: heading-lines.mjs <file.html> [--keep "a b,c d"] [--widths 320,375,...] [--selector "h1,h2"] [--json]'); process.exit(2); }
const keep = opt('keep', '').split(',').map((s) => s.replace(/\s+/g, '')).filter(Boolean);
const widths = opt('widths', '320,375,768,1024,1440').split(',').map(Number);
const selector = opt('selector', 'h1,h2,h3');

const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: widths[0], height: 900 } });
await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const results = [];
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(50);
  const heads = await page.evaluate((sel) => {
    const out = [];
    for (const h of document.querySelectorAll(sel)) {
      const r0 = h.getBoundingClientRect();
      if (!r0.width || !r0.height || getComputedStyle(h).visibility === 'hidden') continue;
      const chars = []; // {c, top}
      const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      const rg = document.createRange();
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        for (let i = 0; i < n.nodeValue.length; i++) {
          const ch = n.nodeValue[i];
          if (/\s/.test(ch)) { chars.push({ c: ' ', top: null }); continue; }
          rg.setStart(n, i); rg.setEnd(n, i + 1);
          const rc = rg.getClientRects()[0];
          chars.push({ c: ch, top: rc ? Math.round(rc.top) : null });
        }
      }
      out.push({ tag: h.tagName.toLowerCase(), chars, overflowX: h.scrollWidth > h.clientWidth + 1 });
    }
    return out;
  }, selector);
  for (const h of heads) {
    const solid = h.chars.filter((x) => x.c !== ' ' && x.top !== null);
    // 줄 구분: top이 6px 이상 달라지면 새 줄
    const lines = []; let cur = ''; let lastTop = null; const lineOf = [];
    let li = -1;
    for (const x of h.chars) {
      if (x.c === ' ') { cur += ' '; continue; }
      if (x.top === null) { cur += x.c; continue; }
      if (lastTop === null || Math.abs(x.top - lastTop) > 6) { if (lastTop !== null) lines.push(cur.trim()); cur = ''; li++; }
      lastTop = x.top; cur += x.c; lineOf.push(li);
    }
    lines.push(cur.trim());
    const flat = solid.map((x) => x.c).join('');
    const broken = [];
    for (const p of keep) {
      let from = 0;
      for (;;) {
        const at = flat.indexOf(p, from); if (at < 0) break;
        const set = new Set(lineOf.slice(at, at + p.length));
        if (set.size > 1) broken.push(p);
        from = at + p.length;
      }
    }
    results.push({ width: w, tag: h.tag, text: flat, lines, brokenPhrases: [...new Set(broken)], overflowX: h.overflowX });
  }
}
await browser.close();

if (argv.includes('--json')) console.log(JSON.stringify(results, null, 1));
else for (const r of results) console.log(`@${String(r.width).padEnd(4)} ${r.tag}: ${r.lines.join(' / ')}${r.brokenPhrases.length ? `   ✗ 쪼개짐: ${r.brokenPhrases.join(', ')}` : ''}${r.overflowX ? '   ⚠ 가로 넘침' : ''}`);
const bad = results.filter((r) => r.brokenPhrases.length || r.overflowX);
console.log(`\n제목 ${new Set(results.map((r) => r.text)).size}개 × 폭 ${widths.length}: 구 쪼개짐 ${results.filter((r) => r.brokenPhrases.length).length}건, 가로 넘침 ${results.filter((r) => r.overflowX).length}건`);
process.exit(bad.length ? 1 : 0);
