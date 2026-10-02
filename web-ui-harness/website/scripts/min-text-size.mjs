#!/usr/bin/env node
// 화면에 보이는 텍스트의 글자 크기 하한 점검. 기존 도구(Impeccable detect 등)가 이미 일부 잡지만 한 번에 요약해 준다.
// usage: node min-text-size.mjs <url> [--floor 12] [--hard 11] [--widths 375,1440]
// exit: hard 미만 텍스트가 있으면 1, floor 미만만 있으면 0(경고).
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
const require = createRequire(import.meta.url);
let chromium;
for (const m of [process.env.PLAYWRIGHT_PATH, 'playwright', '/opt/node-tools/node_modules/playwright'].filter(Boolean)) { try { ({ chromium } = require(m)); break; } catch {} }
if (!chromium) { console.error('playwright를 찾을 수 없다. PLAYWRIGHT_PATH를 지정하라.'); process.exit(2); }
const a = process.argv.slice(2); const url = a.find((x) => !x.startsWith('--'));
const opt = (n, d) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : d; };
if (!url) { console.error('usage: min-text-size.mjs <url> [--floor 12] [--hard 11] [--widths 375,1440]'); process.exit(2); }
const floor = Number(opt('floor', 12)), hard = Number(opt('hard', 11)), widths = opt('widths', '375,1440').split(',').map(Number);
const o = { args: ['--no-sandbox', '--disable-dev-shm-usage'] };
if (process.env.CHROME_BIN) o.executablePath = process.env.CHROME_BIN; else if (existsSync('/opt/pw-browsers/chromium')) o.executablePath = '/opt/pw-browsers/chromium';
const b = await chromium.launch(o); const p = await b.newPage({ viewport: { width: widths[0], height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
let worst = 0; const rows = [];
for (const w of widths) {
  await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(60);
  const found = await p.evaluate((floor) => {
    const out = {}; const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.nodeValue.trim(); if (!t) continue; const e = n.parentElement;
      if (/SCRIPT|STYLE|NOSCRIPT/.test(e.tagName)) continue;
      const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue;
      if (r.width <= 1 || r.height <= 1) continue; // sr-only
      const fs = parseFloat(cs.fontSize); if (fs >= floor) continue;
      const k = fs.toFixed(1) + 'px'; (out[k] = out[k] || []).push(t.slice(0, 20));
    }
    return out;
  }, floor);
  for (const [k, v] of Object.entries(found)) { rows.push({ w, size: k, count: v.length, sample: [...new Set(v)].slice(0, 4) }); if (parseFloat(k) < hard) worst = 1; }
}
await b.close();
if (!rows.length) console.log(`글자 크기 점검: 모든 보이는 텍스트 ≥ ${floor}px (${widths.join(', ')}px)`);
else { console.log(`글자 크기 점검: ${floor}px 미만 텍스트 (hard 하한 ${hard}px)`); rows.sort((x, y) => parseFloat(x.size) - parseFloat(y.size)).forEach((r) => console.log(`  @${r.w} ${r.size} × ${r.count}  예: ${JSON.stringify(r.sample)}${parseFloat(r.size) < hard ? '  ← 하한 미만' : ''}`)); }
process.exit(worst);
