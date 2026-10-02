const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:320,height:900}});await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(2200);
await p.locator('.timeline').screenshot({path:'tl.png'});await b.close()})();
