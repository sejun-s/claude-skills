const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox']});
for(const w of [320,768,1440]){const p=await b.newPage({viewport:{width:w,height:900}});await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(300);
const o=await p.evaluate(()=>document.documentElement.scrollWidth);console.log(w,'scrollW',o);
await p.screenshot({path:`s${w}.png`,fullPage:true});
if(w==320){await p.click('.menu-btn');await p.screenshot({path:'s320menu.png'});}}
await b.close()})();
