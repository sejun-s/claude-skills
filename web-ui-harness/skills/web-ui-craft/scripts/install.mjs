import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2),opt=(key,fallback)=>{const at=args.indexOf('--'+key);return at<0?fallback:args[at+1];};
const agent=opt('agent','codex');
if(!['codex','claude'].includes(agent))throw new Error('--agent must be codex or claude');
const project=opt('project','');
const base=project?path.join(path.resolve(project),agent==='codex'?'.agents':'.claude','skills'):agent==='codex'?path.join(process.env.CODEX_HOME||path.join(os.homedir(),'.codex'),'skills'):path.join(os.homedir(),'.claude','skills');
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),destination=path.join(base,'web-ui-craft');
if(fs.existsSync(destination)){throw new Error(`Skill already exists at ${destination}. Review existing changes before replacing it.`);}
fs.mkdirSync(base,{recursive:true});
fs.cpSync(source,destination,{recursive:true,filter:file=>!file.split(path.sep).some(part=>['node_modules','.git'].includes(part))});
if(!fs.existsSync(path.join(destination,'SKILL.md')))throw new Error('Install incomplete');
console.log(`Installed web-ui-craft for ${agent}: ${destination}`);
