import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),args=process.argv.slice(2),target=args[0];
const opt=(key,fallback)=>{const at=args.indexOf('--'+key);return at<0?fallback:args[at+1];};
if(!target||target.startsWith('--')){console.error('capture.mjs <url|file> --out <dir> [--widths 320,375,768,1440] [--browser chrome]');process.exit(2);}
const widths=opt('widths','320,375,768,1440').split(',').map(Number);
if(widths.some(w=>!Number.isInteger(w)||w<240||w>7680))throw new Error('Invalid widths');
let pw,pwVersion;
for(const spec of [process.env.PLAYWRIGHT_PATH,'playwright','/opt/node-tools/node_modules/playwright'].filter(Boolean)){try{pw=require(spec);pwVersion=require(spec+'/package.json').version;break;}catch{}}
if(!pw)throw new Error('Install scripts/package.json dependencies or set PLAYWRIGHT_PATH');
const launch={args:['--no-sandbox','--disable-dev-shm-usage']};
if(process.env.CHROME_BIN)launch.executablePath=process.env.CHROME_BIN;
else if(opt('browser','')==='chrome')launch.channel='chrome';
const out=path.resolve(opt('out','./ui-evidence'));fs.mkdirSync(out,{recursive:true});
const browser=await pw.chromium.launch(launch),url=/^(https?|file):/.test(target)?target:pathToFileURL(path.resolve(target)).href;
const report={target:url,runtime:{node:process.version,playwright:pwVersion,browser:browser.version(),platform:process.platform},viewports:[],errors:[],network:[],fonts:[]};
const pending=[];
try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text());});
  page.on('requestfailed',request=>report.network.push({url:request.url(),error:request.failure()?.errorText}));
  page.on('response',response=>{
    if(response.status()>=400)report.network.push({url:response.url(),status:response.status()});
    if(response.request().resourceType()==='font'&&response.ok())pending.push(response.body().then(bytes=>report.fonts.push({url:response.url(),sha256:crypto.createHash('sha256').update(bytes).digest('hex')})).catch(()=>{}));
  });
  await page.goto(url,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  for(const width of widths){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const evidence=await page.evaluate(()=>{
      const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';};
      return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,fonts:[...document.fonts].map(f=>({family:f.family,weight:f.weight,status:f.status})),images:[...document.images].filter(img=>!img.complete||!img.naturalWidth).map(img=>img.src),headings:[...document.querySelectorAll('h1,h2,h3')].filter(visible).map(el=>({text:el.textContent.trim(),font:getComputedStyle(el).fontFamily,size:getComputedStyle(el).fontSize,overflow:el.scrollWidth>el.clientWidth+1}))};
    });
    await page.screenshot({path:path.join(out,`viewport-${width}.png`),animations:'disabled'});
    await page.screenshot({path:path.join(out,`full-${width}.png`),fullPage:true,animations:'disabled'});
    report.viewports.push(evidence);
  }
  await Promise.allSettled(pending);
}finally{await browser.close();}
report.errors=[...new Set(report.errors)];report.fonts=report.fonts.filter((f,i,a)=>a.findIndex(x=>x.url===f.url)===i);
report.pass=!report.errors.length&&!report.network.length&&report.viewports.every(v=>!v.overflow&&!v.images.length&&!v.headings.some(h=>h.overflow)&&!v.fonts.some(f=>f.status==='error'));
fs.writeFileSync(path.join(out,'capture.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pass:report.pass,widths,errors:report.errors,network:report.network,out},null,2));
if(!report.pass)process.exitCode=1;
