import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const revision='7aeb0698819be2b4097dae8ec8fe6a795e5cf3ae';
const base=`https://raw.githubusercontent.com/orioncactus/pretendard/${revision}/`;
const manifest=[];fs.mkdirSync(path.join(here,'fonts'),{recursive:true});
for(const weight of ['Regular','Bold']){
  const name=`Pretendard-${weight}.woff2`,url=base+'packages/pretendard/dist/web/static/woff2/'+name;
  const response=await fetch(url);if(!response.ok)throw new Error(`${response.status} ${url}`);
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.subarray(0,4).toString()!=='wOF2')throw new Error('Invalid font');
  fs.writeFileSync(path.join(here,'fonts',name),bytes);manifest.push({name,url,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
const license=await fetch(base+'LICENSE');if(!license.ok)throw new Error('Font license unavailable');
fs.writeFileSync(path.join(here,'fonts/LICENSE.txt'),await license.text());
fs.writeFileSync(path.join(here,'fonts/manifest.json'),JSON.stringify({revision,files:manifest},null,2)+'\n');
console.log('Fetched and hashed 2 Pretendard fonts from '+revision);
