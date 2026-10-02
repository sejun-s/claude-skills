#!/usr/bin/env node
// v0.3.0 — (v0.2.0 대비: 폰트 미로드 감지, 줄 구분을 세로 겹침으로 판정, --json은 유효한 JSON, 못 찾은 구 보고)
// v0.2.0 — 제목(h1~h3 등)의 폭별 줄바꿈을 추출한다.
//  - 항상: 모든 제목의 폭별 줄 구성, 마지막 줄 고아(공백 제외 2글자 이하), 제목 가로 넘침을 출력한다.
//  - --keep을 주면: 지정한 구가 줄 경계에서 쪼개지는지도 검사한다. (--keep 없이는 구 쪼개짐을 검사하지 않는다 — 출력에 명시)
// usage: node heading-lines.mjs <file.html> [--keep "신규 가입 혜택,가입하기 전에"] [--widths 320,375,768,1024,1440] [--selector "h1,h2,h3"] [--json]
// exit code: 구 쪼개짐 또는 가로 넘침이 있으면 1 (고아 줄은 경고만), Pretendard 등 선언된 웹폰트가 로드되지 않았으면 3, --strict-keep에서 못 찾은 구가 있으면 4.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
for (const m of [process.env.PLAYWRIGHT_PATH, 'playwright', '/opt/node-tools/node_modules/playwright'].filter(Boolean)) {
  try { ({ chromium } = require(m)); break; } catch { /* try next */ }
}
if (!chromium) { console.error('playwright를 찾을 수 없다. PLAYWRIGHT_PATH를 지정하라.'); process.exit(2); }
const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--'));
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
if (!file) { console.error('usage: heading-lines.mjs <file.html> [--keep "a b,c d"] [--widths 320,375,...] [--selector "h1,h2"] [--json]'); process.exit(2); }
const keep = opt('keep', '').split(',').map((s) => s.replace(/\s+/g, '')).filter(Boolean);
const widths = opt('widths', '320,375,768,1024,1440').split(',').map(Number);
const selector = opt('selector', 'h1,h2,h3');

const launchOpts = { args: ['--no-sandbox', '--disable-dev-shm-usage'] };
if (process.env.CHROME_BIN) launchOpts.executablePath = process.env.CHROME_BIN;
else if (existsSync('/opt/pw-browsers/chromium')) launchOpts.executablePath = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(launchOpts);
const page = await browser.newPage({ viewport: { width: widths[0], height: 900 } });
await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const results = []; const keepSeen = Object.fromEntries(keep.map((k) => [k, 0]));
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
          if (/\s/.test(ch)) { chars.push({ c: ' ', top: null, bottom: null }); continue; }
          rg.setStart(n, i); rg.setEnd(n, i + 1);
          const rc = rg.getClientRects()[0];
          chars.push({ c: ch, top: rc ? rc.top : null, bottom: rc ? rc.bottom : null });
        }
      }
      // 웹폰트 로드 확인: 제목의 첫 font-family가 @font-face로 선언되어 있는데 loaded 상태인 face가 없으면 대체 폰트로 측정된 것
      const fam = getComputedStyle(h).fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
      const faces = [...document.fonts].filter((f) => f.family.replace(/^["']|["']$/g, '') === fam);
      const fontMissing = faces.length > 0 && !faces.some((f) => f.status === 'loaded');
      out.push({ tag: h.tagName.toLowerCase(), chars, overflowX: h.scrollWidth > h.clientWidth + 1, fontMissing, fontFamily: fam });
    }
    return out;
  }, selector);
  for (const h of heads) {
    const solid = h.chars.filter((x) => x.c !== ' ' && x.top !== null);
    // 줄 구분: 글자 세로 구간이 현재 줄 구간과 겹치지 않으면 새 줄(글자 크기가 섞여도 같은 줄이면 세로 구간이 겹친다)
    const lines = []; let cur = ''; const lineOf = [];
    let li = -1; let lt = null, lb = null;
    for (const x of h.chars) {
      if (x.c === ' ') { cur += ' '; continue; }
      if (x.top === null) { cur += x.c; continue; }
      const overlap = lt === null ? 0 : Math.min(lb, x.bottom) - Math.max(lt, x.top);
      const smaller = lt === null ? 1 : Math.min(lb - lt, x.bottom - x.top);
      if (lt === null || overlap < smaller * 0.4) { if (lt !== null) lines.push(cur.trim()); cur = ''; li++; lt = x.top; lb = x.bottom; }
      else { lt = Math.min(lt, x.top); lb = Math.max(lb, x.bottom); }
      cur += x.c; lineOf.push(li);
    }
    lines.push(cur.trim());
    const flat = solid.map((x) => x.c).join('');
    const broken = [];
    for (const p of keep) {
      let from = 0;
      for (;;) {
        const at = flat.indexOf(p, from); if (at < 0) break;
        keepSeen[p]++;
        const set = new Set(lineOf.slice(at, at + p.length));
        if (set.size > 1) broken.push(p);
        from = at + p.length;
      }
    }
    const lastLen = (lines[lines.length - 1] || '').replace(/\s+/g, '').length;
    const orphan = lines.length >= 2 && lastLen <= 2;
    results.push({ width: w, tag: h.tag, text: flat, lines, brokenPhrases: [...new Set(broken)], overflowX: h.overflowX, orphan, fontMissing: h.fontMissing, fontFamily: h.fontFamily });
  }
}
await browser.close();

const unmatched = keep.filter((k) => keepSeen[k] === 0);
const fontMissing = results.filter((r) => r.fontMissing);
const bad = results.filter((r) => r.brokenPhrases.length || r.overflowX);
const summary = {
  headings: new Set(results.map((r) => r.text)).size, widths: widths.length,
  phraseSplits: keep.length ? results.filter((r) => r.brokenPhrases.length).length : null,
  overflow: results.filter((r) => r.overflowX).length, orphans: results.filter((r) => r.orphan).length,
  keepFound: keepSeen, keepUnmatched: unmatched, fontMissing: fontMissing.length > 0,
};
if (argv.includes('--json')) {
  console.log(JSON.stringify({ version: '0.3.0', results, summary }, null, 1));
} else {
  for (const r of results) console.log(`@${String(r.width).padEnd(4)} ${r.tag}: ${r.lines.join(' / ')}${r.brokenPhrases.length ? `   ✗ 쪼개짐: ${r.brokenPhrases.join(', ')}` : ''}${r.overflowX ? '   ⚠ 가로 넘침' : ''}${r.orphan ? '   ⚠ 마지막 줄 고아' : ''}`);
}
const out = argv.includes('--json') ? console.error : console.log; // --json이면 사람용 요약은 stderr
out(`\n제목 ${summary.headings}개 × 폭 ${widths.length}: 구 쪼개짐 ${keep.length ? summary.phraseSplits + '건' : '미검사(--keep 없음)'}, 가로 넘침 ${summary.overflow}건, 마지막 줄 고아 ${summary.orphans}건`);
if (!keep.length) out('※ --keep 없이는 구 쪼개짐을 검사하지 않는다. 위 줄 구성을 눈으로 확인하라.');
if (unmatched.length) out(`※ 제목에서 찾지 못한 구(검사되지 않음): ${unmatched.join(', ')}`);
if (fontMissing.length) out(`⚠ 선언된 웹폰트(${[...new Set(fontMissing.map((r) => r.fontFamily))].join(', ')})가 로드되지 않았다. 대체 폰트로 측정된 결과이므로 신뢰할 수 없다(폰트 파일 경로 확인).`);
process.exit(fontMissing.length ? 3 : (argv.includes('--strict-keep') && unmatched.length) ? 4 : bad.length ? 1 : 0);
