import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../..');
const out=path.resolve(here,'generated');
fs.mkdirSync(out,{recursive:true});
const env={...process.env};
const all={};
for(const task of process.argv.slice(2)){
const bench={T1:'T1-marketing-landing',T3:'T3-korean-content',T3b:'T3b-korean-headings-holdout'}[task];
const gold=JSON.parse(fs.readFileSync(path.join(repo,'benchmarks',bench,'gold-nobreak.json'),'utf8'));
for(const id of fs.readdirSync(path.join(repo,'experiments/runs')).filter(id=>id.startsWith(task+'-')&&!id.includes('-CL-'))){
const orig=path.join(repo,'experiments/runs',id,'index.html');
let html=fs.readFileSync(orig,'utf8');
html=html.replace(/(?:\.\.\/)*fonts\/(Pretendard-[\w-]+\.woff2)/g,(_,font)=>pathToFileURL(path.join(out,'fonts',font)).href);
html=html.replace('<head>','<head><base href="'+pathToFileURL(path.dirname(orig)+path.sep).href+'">');
const copy=path.join(out,'rerender',id+'.html');fs.mkdirSync(path.dirname(copy),{recursive:true});fs.writeFileSync(copy,html);
const r=spawnSync(process.execPath,[path.join(repo,'skills/ko-heading-wrap/scripts/heading-lines.mjs'),copy,'--keep',gold.keep.join(','),'--selector',gold.selector,'--json'],{env,encoding:'utf8',timeout:30000});
const cutoff=r.stdout?.indexOf('\n\n제목');let rows;
try{rows=JSON.parse(r.stdout.slice(0,cutoff));}catch{all[id]={error:r.stderr,stdout:r.stdout};console.log(id,'ERROR');continue;}
all[id]={broken:rows.filter(x=>x.brokenPhrases.length).length,overflow:rows.filter(x=>x.overflowX).length,orphan:rows.filter(x=>x.orphan).length,rows,status:r.status};
console.log(id,JSON.stringify({broken:all[id].broken,overflow:all[id].overflow,orphan:all[id].orphan}));
}
}
fs.writeFileSync(path.join(out,'corpus-'+process.argv.slice(2).join('-')+'.json'),JSON.stringify(all,null,2));
