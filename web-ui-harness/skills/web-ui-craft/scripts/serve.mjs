import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const args=process.argv.slice(2);
const opt=(key,fallback)=>{const at=args.indexOf('--'+key);return at<0?fallback:args[at+1];};
const root=fs.realpathSync(path.resolve(opt('root','.'))),port=Number(opt('port','8787'));
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid port');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
  try{
    let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    const inside=p=>p===root||p.startsWith(root+path.sep);
    if(!inside(file)){res.writeHead(403);return res.end('Forbidden');}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}
    file=fs.realpathSync(file);
    if(!inside(file)||!fs.statSync(file).isFile()){res.writeHead(403);return res.end('Forbidden');}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    if(req.method==='HEAD')return res.end();
    fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(400);res.end('Bad request');}
});
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Preview http://127.0.0.1:${port} from ${root}`));
