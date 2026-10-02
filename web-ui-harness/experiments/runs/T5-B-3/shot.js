const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
for(const w of [320,768,1440]){const p=await b.newPage({viewport:{width:w,height:900}});await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(400);
const o=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);console.log(w,'overflow',o,await p.evaluate(()=>document.fonts.check('16px Pretendard')));
await p.screenshot({path:`s${w}.png`,fullPage:true});
if(w<1180){await p.click('.toggle');await p.screenshot({path:`m${w}.png`,clip:{x:0,y:0,width:w,height:500}})}}
await b.close()})()
