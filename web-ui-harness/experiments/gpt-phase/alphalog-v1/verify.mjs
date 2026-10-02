import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),require=createRequire(import.meta.url);
let pw;for(const spec of [process.env.PLAYWRIGHT_PATH,'playwright','/opt/node-tools/node_modules/playwright'].filter(Boolean)){try{pw=require(spec);break;}catch{}}
if(!pw)throw new Error('Set PLAYWRIGHT_PATH or install Playwright');
const url=process.env.UI_PREVIEW_URL||'http://127.0.0.1:8787';
const browser=await pw.chromium.launch({executablePath:process.env.CHROME_BIN,...(!process.env.CHROME_BIN?{channel:'chrome'}:{}),args:['--no-sandbox']});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
const checks=[];const record=(name,detail)=>checks.push({name,status:'pass',detail});
try{
const page=await context.newPage();let postRequests=0;page.on('request',request=>{if(request.method()==='POST')postRequests++;});
await page.setViewportSize({width:1440,height:900});await page.goto(url);await page.evaluate(()=>document.fonts.ready);
assert.equal(await page.locator('h1').count(),1);record('Semantic entry','One h1, Korean document language');assert.equal(await page.locator('html').getAttribute('lang'),'ko');
await page.locator('[data-machine=injection]').click();assert.equal(await page.locator('#chart-name').textContent(),'사출기 07');assert.equal(await page.locator('#risk-value').textContent(),'46%');assert.match(await page.locator('#recommendation-title').textContent(),/모터/);record('Machine selection','Name, risk, chart description and recommendation update');
const firstPath=await page.locator('#chart-line').getAttribute('d');await page.locator('[data-period="30"]').click();assert.notEqual(await page.locator('#chart-line').getAttribute('d'),firstPath);assert.match(await page.locator('#chart-title').textContent(),/30일/);record('Period control','Chart data and accessible label update');
await page.locator('#overview-tab').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#maintenance-tab').getAttribute('aria-selected'),'true');assert.equal(await page.locator('#maintenance-panel').isVisible(),true);assert.equal(await page.locator('#overview-panel').isVisible(),false);await page.keyboard.press('Home');assert.equal(await page.locator('#overview-tab').getAttribute('aria-selected'),'true');record('Keyboard tabs','ArrowRight and Home change focus, selected state and panels');
await page.locator('details').nth(1).locator('summary').click();assert.equal(await page.locator('details').nth(1).getAttribute('open'),'');record('Feature disclosure','Native details opens feature copy');
await page.locator('#demo-form button[type=submit]').click();assert.equal(await page.locator('#name').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#request-result').isVisible(),false);
await page.locator('#name').fill('홍길동');await page.locator('#company').fill('테스트 제조');await page.locator('#email').fill('not-an-email');await page.locator('#demo-form button[type=submit]').click();assert.match(await page.locator('#email-error').textContent(),/이메일/);
await page.locator('#email').fill('review@example.com');await page.locator('#message').fill('<script>alert(1)</script> 프레스 공정');await page.locator('#demo-form button[type=submit]').click();assert.equal(await page.locator('#request-result').isVisible(),true);assert.match(await page.locator('#request-text').inputValue(),/<script>/);assert.equal(await page.locator('#request-result script').count(),0);assert.equal(postRequests,0);record('Form validation and honest completion','Required/email errors; generated text is inert; no POST requests');
await page.locator('#copy-request').click();await page.waitForFunction(()=>document.querySelector('#copy-status').textContent.includes('복사했습니다'));const clipboard=await page.evaluate(()=>navigator.clipboard.readText());assert.match(clipboard,/테스트 제조/);record('Clipboard action','Copied actual prepared request');
await page.locator('#company').fill('수정된 회사');assert.equal(await page.locator('#request-result').isVisible(),false);record('Prepared request consistency','Editing a field clears the stale prepared result');
await page.setViewportSize({width:375,height:900});await page.locator('.menu-button').click();assert.equal(await page.locator('#mobile-menu').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-menu').isVisible(),false);await page.locator('.menu-button').click();await page.locator('#mobile-menu a[href="#case"]').click();assert.equal(await page.locator('#mobile-menu').isVisible(),false);record('Mobile navigation','Toggle, Escape and anchor close menu');
for(const width of [320,375,768,1024,1440,1920]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);}
record('Responsive interaction stress','No document overflow at six widths after form expansion and state changes');
await page.goto(url+'/privacy.html');assert.match(await page.locator('h1').textContent(),/입력 정보/);await page.locator('a').first().click();assert.equal(await page.locator('#demo-form').count(),1);record('Information page','Privacy explanation and return link work');
await page.setViewportSize({width:1440,height:900});
const contrast=await page.evaluate(()=>{
  const rgba=s=>{const n=s.match(/[\d.]+/g)?.map(Number)||[0,0,0];return [n[0],n[1],n[2],n[3]??1];};
  const blend=(a,b)=>[...a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3])),1];
  const background=el=>{let bg=[255,255,255,1],chain=[];for(let p=el;p;p=p.parentElement)chain.push(p);for(const p of chain.reverse())bg=blend(rgba(getComputedStyle(p).backgroundColor),bg);return bg;};
  const lum=color=>color.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  const seen=new Set(),failures=[],pairs=[];
  for(const el of document.querySelectorAll('body *')){
    if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||el instanceof SVGElement)continue;
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);if(!r.width||!r.height||cs.visibility==='hidden'||el.closest('[hidden],.sr-only')||cs.position==='fixed')continue;
    const fg=rgba(cs.color),bg=background(el),light=[lum(blend(fg,bg)),lum(bg)],ratio=(Math.max(...light)+.05)/(Math.min(...light)+.05),size=parseFloat(cs.fontSize),threshold=size>=24||(size>=18.667&&Number(cs.fontWeight)>=700)?3:4.5;
    const key=[cs.color,bg.join(','),threshold].join('|');if(seen.has(key))continue;seen.add(key);
    const item={text:el.textContent.trim().slice(0,55),color:cs.color,background:bg.slice(0,3),ratio:Number(ratio.toFixed(2)),threshold};pairs.push(item);if(ratio+.01<threshold)failures.push(item);
  }return {pairs,failures,scope:'Visible HTML text; SVG, imagery, focus and hover need separate inspection'};
});
assert.deepEqual(contrast.failures,[]);record('Text contrast',contrast);
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'web-ui-craft-negative-'));
const capture=path.resolve(here,'../../../skills/web-ui-craft/scripts/capture.mjs');
for(const [name,html] of [['overflow','<!doctype html><div style="width:1800px">Wide</div>'],['font','<!doctype html><style>@font-face{font-family:Missing;src:url(missing.woff2)}body{font-family:Missing}</style><h1>Missing font</h1>']]){
  const file=path.join(temporary,name+'.html');fs.writeFileSync(file,html);const run=spawnSync(process.execPath,[capture,file,'--out',path.join(temporary,name),'--widths','320'],{env:process.env,encoding:'utf8',timeout:30000});assert.equal(run.status,1,run.stderr||run.stdout);const report=JSON.parse(fs.readFileSync(path.join(temporary,name,'capture.json'),'utf8'));assert.equal(report.pass,false);record('Capture negative control: '+name,name==='font'?'Missing font rejected':'Document overflow rejected');
}
await page.goto(url);assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);record('Reduced motion','CSS honors reduced motion preference; content remains visible');
fs.mkdirSync(path.join(here,'evidence'),{recursive:true});fs.writeFileSync(path.join(here,'evidence/interaction-tests.json'),JSON.stringify({checks,pass:true,browser:browser.version()},null,2)+'\n');
console.log(JSON.stringify({pass:true,checks:checks.map(c=>c.name)},null,2));
}finally{await browser.close();}
