const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:320,height:900}});await p.goto('file://'+process.cwd()+'/index.html');
console.log(await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>321).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().right)).slice(0,10)));await b.close()})()
