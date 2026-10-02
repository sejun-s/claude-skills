const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
for(const w of [320,768,1440]){const p=await b.newPage({viewport:{width:w,height:900}});await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(400);
console.log(w,await p.evaluate(()=>document.documentElement.scrollWidth));
await p.screenshot({path:`s${w}.png`,fullPage:true});}
await b.close()})()
