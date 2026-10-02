const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto('file://'+process.cwd()+'/index.html');
console.log(await p.evaluate(()=>{const f=document.querySelector('.foot'),c=getComputedStyle(f);return [f.getBoundingClientRect().left,f.getBoundingClientRect().width,c.marginLeft,c.paddingLeft]}));await b.close()})();
