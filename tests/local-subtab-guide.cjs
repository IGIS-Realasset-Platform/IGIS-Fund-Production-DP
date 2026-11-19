const assert=require('node:assert/strict');
const {chromium}=require('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),writes=[];
 await context.route('**/*',r=>{if(!['GET','HEAD'].includes(r.request().method())){writes.push(r.request().url());return r.abort()}return r.continue()});
 try{
  await page.goto('http://127.0.0.1:4178/?screen=cost-overview');await page.locator('#content .subtabs').waitFor();
  const measurements=[];
  for(const view of ['cost','permit','company','law']){
   await page.evaluate(v=>App.go(v),view);await page.locator('#content .subtabs').first().waitFor();
   const nav=page.locator('#content .subtabs').first();
   const read=()=>nav.evaluate(n=>{const b=n.querySelector('.active'),s=getComputedStyle(b),p=getComputedStyle(n);return {line:s.borderBottomWidth,font:s.fontSize,weight:s.fontWeight,color:s.color,padding:s.padding,gap:p.columnGap,margin:p.marginLeft,bottom:n.getBoundingClientRect().bottom-b.getBoundingClientRect().bottom}});
   await page.waitForFunction(()=>{
    const n=document.querySelector('#content .subtabs');
    return n&&(n.closest('.dp-partner-navigation')?document.querySelector('.dp-partners .panel'):n.nextElementSibling);
   });
   const contentGap=await nav.evaluate(n=>{
    const target=n.closest('.dp-partner-navigation')?document.querySelector('.dp-partners .panel'):n.nextElementSibling;
    return target.getBoundingClientRect().top-n.getBoundingClientRect().bottom;
   });
   assert.equal(contentGap,18,view+' content gap');
   const style=await read();measurements.push({view,...style});
   assert.equal(style.line,'4px',view);assert.equal(style.margin,'0px',view);assert.ok(Math.abs(style.bottom)<1,view);
   const inactive=nav.locator(':scope > button:not(.active)').first();
   const before=await nav.locator('.active').evaluate(b=>getComputedStyle(b).borderBottom);
   const boxBefore=await inactive.boundingBox();
   assert.deepEqual(await inactive.evaluate(b=>{const s=getComputedStyle(b);return [s.transitionProperty,s.transitionDuration]}),['color','0.18s']);
   await inactive.hover();
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('#content .subtabs > button:not(.active):hover')).color==='rgb(37, 57, 133)');
   assert.deepEqual(await inactive.boundingBox(),boxBefore,view+' hover position');
   assert.equal(await inactive.evaluate(b=>getComputedStyle(b).borderBottomColor),'rgba(0, 0, 0, 0)',view+' inactive underline');
   assert.equal(await nav.locator('.active').evaluate(b=>getComputedStyle(b).borderBottom),before,view+' selected underline');
   const buttons=nav.locator(':scope > button');if(await buttons.count()>1){await buttons.nth(1).click();assert.equal(await nav.locator(':scope > button.active').count(),1);await buttons.first().focus();await page.keyboard.press('Enter');assert.ok(await buttons.first().evaluate(b=>b.classList.contains('active')))}
  }
  for(const m of measurements.slice(1))for(const key of ['font','weight','color','padding','gap'])assert.equal(m[key],measurements[0][key],m.view+' '+key);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('#content .subtabs > button').first().evaluate(b=>getComputedStyle(b).transitionDuration),'0s');
  assert.deepEqual(writes,[]);console.log(JSON.stringify(measurements));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
