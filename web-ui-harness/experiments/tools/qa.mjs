#!/usr/bin/env node
// Mechanical QA runner — viewport sweep (cheap DOM checks) + key-viewport screenshots + optional Impeccable detect.
// Measurement only: it never judges design quality (see experiments/protocol.md, "Mechanical QA").
//
// usage: node qa.mjs <file-or-url> --out <dir> [--sweep 320:1440:64] [--shots 320,375,768,1024,1440] [--impeccable]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// Playwright is preinstalled globally in this environment (do not `playwright install`).
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright');
const CHROME = process.env.CHROME_BIN || '/opt/pw-browsers/chromium';

const argv = process.argv.slice(2);
const target = argv.find((a) => !a.startsWith('--'));
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
if (!target) {
  console.error('usage: node qa.mjs <file-or-url> --out <dir> [--sweep 320:1440:64] [--shots 320,375,768,1024,1440] [--impeccable]');
  process.exit(2);
}
const out = resolve(opt('out', './qa-out'));
const [s0, s1, step] = opt('sweep', '320:1440:64').split(':').map(Number);
const shots = opt('shots', '320,375,768,1024,1440').split(',').map(Number);
const isUrl = /^https?:\/\//.test(target);
const url = isUrl ? target : pathToFileURL(resolve(target)).href;
mkdirSync(out, { recursive: true });

// Runs inside the page. Returns raw measurements for one viewport width.
function measure() {
  const vw = document.documentElement.clientWidth;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const sel = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    else if (el.classList.length) s += '.' + [...el.classList].slice(0, 2).join('.');
    return s;
  };
  const res = { vw, hOverflow: null, clipped: [], smallTargets: [], korean: [] };

  const sw = document.documentElement.scrollWidth;
  if (sw > vw + 1) {
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1) offenders.push({ el: sel(el), right: Math.round(r.right) });
    }
    offenders.sort((a, b) => b.right - a.right);
    res.hOverflow = { scrollWidth: sw, over: sw - vw, offenders: offenders.slice(0, 5) };
  }

  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    const clips = /hidden|clip/.test(cs.overflowX);
    // visually-hidden(sr-only) 패턴(너비/높이 ≤1px로 clip)은 의도된 숨김이므로 제외
    const hiddenByDesign = el.clientWidth <= 1 || el.clientHeight <= 1;
    if (clips && !hiddenByDesign && el.scrollWidth > el.clientWidth + 1 && (el.textContent || '').trim()) {
      res.clipped.push({ el: sel(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, ellipsis: cs.textOverflow === 'ellipsis' });
    }
  }

  const targets = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=link]')].filter(vis);
  const rects = targets.map((el) => el.getBoundingClientRect());
  targets.forEach((el, i) => {
    const r = rects[i];
    if (r.width >= 24 && r.height >= 24) return;
    // WCAG 2.2 SC 2.5.8 spacing exception: a 24px circle centred on the target must not intersect any other target.
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const clash = rects.some((o, j) => {
      if (j === i) return false;
      // 다른 타깃이 소형이면 그 타깃의 24px 원과도 겹치는지(중심 거리 < 24), 아니면 사각형과 12px 반경 원이 겹치는지
      if (o.width < 24 || o.height < 24) {
        const ox = o.left + o.width / 2, oy = o.top + o.height / 2;
        return Math.hypot(ox - cx, oy - cy) < 24;
      }
      const dx = Math.max(o.left - cx, 0, cx - o.right), dy = Math.max(o.top - cy, 0, cy - o.bottom);
      return Math.hypot(dx, dy) < 12;
    });
    if (clash) res.smallTargets.push({ el: sel(el), w: Math.round(r.width), h: Math.round(r.height) });
  });

  // Korean wrapping: for each text node containing Hangul, find eojeol (space-delimited token) split across lines.
  const hangul = /[ㄱ-ㆎ가-힣]/;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seenParents = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue;
    if (!text.trim() || !hangul.test(text)) continue;
    const parent = n.parentElement;
    if (!parent || !vis(parent) || /^(SCRIPT|STYLE)$/.test(parent.tagName)) continue;
    const range = document.createRange();
    const tops = [];
    for (let i = 0; i < text.length; i++) {
      if (/\s/.test(text[i])) { tops.push(null); continue; }
      range.setStart(n, i); range.setEnd(n, i + 1);
      const rc = range.getClientRects()[0];
      tops.push(rc ? Math.round(rc.top) : null);
    }
    const lineTops = [...new Set(tops.filter((t) => t !== null))].sort((a, b) => a - b);
    const lines = lineTops.reduce((acc, t) => (acc.length && t - acc[acc.length - 1] < 6 ? acc : [...acc, t]), []);
    let midWord = 0; const samples = [];
    for (let i = 1; i < text.length; i++) {
      if (tops[i] === null || tops[i - 1] === null) continue;
      if (!hangul.test(text[i]) || !hangul.test(text[i - 1])) continue; // Hangul|Latin/digit boundaries are legal break points
      if (tops[i] - tops[i - 1] > 6) {
        midWord++;
        if (samples.length < 2) samples.push(text.slice(Math.max(0, i - 4), i) + '|' + text.slice(i, i + 4));
      }
    }
    // orphan: last visual line holds <=2 non-space chars while there are >=2 lines
    let orphan = false;
    if (lines.length >= 2) {
      const lastTop = lines[lines.length - 1];
      const lastChars = tops.filter((t) => t !== null && Math.abs(t - lastTop) < 6).length;
      orphan = lastChars <= 2;
    }
    const cs = getComputedStyle(parent);
    res.korean.push({
      el: sel(parent), lines: lines.length, midWordBreaks: midWord, samples, orphan,
      wordBreak: cs.wordBreak, fontFamily: cs.fontFamily.split(',')[0].trim(), fontSize: cs.fontSize,
      chars: text.trim().length,
    });
  }
  return res;
}

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: s0, height: 800 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const sweep = [];
const widths = new Set();
for (let w = s0; w <= s1; w += step) widths.add(w);
for (const w of shots) widths.add(w);
for (const w of [...widths].sort((a, b) => a - b)) {
  await page.setViewportSize({ width: w, height: 800 });
  await page.waitForTimeout(60);
  sweep.push(await page.evaluate(measure));
  if (shots.includes(w)) {
    await page.screenshot({ path: join(out, `shot-${w}.png`) });
    await page.screenshot({ path: join(out, `full-${w}.png`), fullPage: true });
  }
}
await browser.close();

const defects = [];
for (const m of sweep) {
  if (m.hOverflow) defects.push({ vw: m.vw, type: 'horizontal-overflow', detail: m.hOverflow });
  for (const c of m.clipped) defects.push({ vw: m.vw, type: c.ellipsis ? 'ellipsis-truncated' : 'clipped-text', detail: c });
  for (const t of m.smallTargets) defects.push({ vw: m.vw, type: 'touch-target<24px', detail: t });
  for (const k of m.korean) {
    if (k.midWordBreaks) defects.push({ vw: m.vw, type: 'korean-mid-word-break', detail: k });
    if (k.orphan) defects.push({ vw: m.vw, type: 'korean-orphan-line', detail: k });
  }
}

let impeccable = null;
if (argv.includes('--impeccable')) {
  const env = { ...process.env, IMPECCABLE_BROWSER: join(here, 'chrome-nosandbox.sh') };
  const r = spawnSync('npx', ['--yes', 'impeccable', 'detect', '--json', isUrl ? target : resolve(target)], { env, encoding: 'utf8', timeout: 180000 });
  try { impeccable = JSON.parse(r.stdout); } catch { impeccable = { error: (r.stderr || r.stdout || '').slice(0, 500) }; }
}

const report = { target, url, sweep: { from: s0, to: s1, step, widths: sweep.map((m) => m.vw) }, shots, defects, impeccable, sweepRaw: sweep };
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 2));

const byType = {};
for (const d of defects) (byType[d.type] ||= new Set()).add(d.vw);
console.log(`target: ${target}\nwidths swept: ${sweep.length} (${s0}-${s1}, step ${step}, + shots)`);
if (!defects.length) console.log('mechanical defects: none');
for (const [t, ws] of Object.entries(byType)) console.log(`  ${t}: at ${[...ws].join(', ')}px`);
if (impeccable) {
  const m = {}; (Array.isArray(impeccable) ? impeccable : []).forEach((x) => (m[x.antipattern] = (m[x.antipattern] || 0) + 1));
  console.log('impeccable detect:', Array.isArray(impeccable) ? JSON.stringify(m) : impeccable.error);
}
console.log(`report: ${join(out, 'report.json')}`);
