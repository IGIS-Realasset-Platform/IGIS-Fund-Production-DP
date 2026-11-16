import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
const directory=resolve(process.argv[2]||'dist/review'),prefix='/idm-review/';
const seed=JSON.parse(await readFile(join(directory,'review-data/workspace.json'),'utf8'));
const version=JSON.parse(await readFile(join(directory,'review-version.json'),'utf8'));
const access=JSON.parse(await readFile(join(directory,'review-data/access-screen-capture.json'),'utf8'));
const stakeholders=JSON.parse(await readFile(join(directory,'review-data/stakeholders.json'),'utf8'));
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const mime={html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',png:'image/png',svg:'image/svg+xml',woff2:'font/woff2'};
const requests=[];
const server=http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;requests.push({path,method:req.method});
 if(!path.startsWith(prefix)||req.method!=='GET'){res.writeHead(404).end();return;}
 const relative=decodeURIComponent(path.slice(prefix.length));if(relative.includes('..')){res.writeHead(404).end();return;}
 const file=join(directory,relative,path.endsWith('/')?'index.html':'');
 try{res.writeHead(200,{'content-type':mime[file.split('.').at(-1)]||'application/octet-stream'}).end(await readFile(file));}catch{res.writeHead(404).end();}
});
let browser;
try{
 await new Promise((yes,no)=>server.once('error',no).listen(0,'127.0.0.1',yes));
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage();page.setDefaultTimeout(9000);
 const errors=[],bad=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url());});
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(!['blob:','data:'].includes(url.protocol)&&(url.origin!==origin||!url.pathname.startsWith(prefix))){external.push(url.href);return route.abort();}return route.continue();});
 const oldKey='idm-pages-review-v2:'+prefix;
 await context.addInitScript(({key})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({revision:999,state:{projects:[{id:'old-browser-data'}]}}));},{key:oldKey});
 await page.goto(origin+prefix+'?screen=finance');
 await page.locator('[data-stage-action=details]').waitFor();
 const readWorkspace=()=>page.evaluate(async()=>await(await fetch('/api/workspace')).json());
 const initial=await readWorkspace();assert.equal(initial.revision,version.workspaceRevision);assert.deepEqual(initial.state,seed,'fresh seed matches approved local JSON despite old browser edits');
 assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).revision,oldKey),999,'old browser state remains untouched');
 assert.match(await page.locator('#sidebar-profile').innerText(),/전기영 매니저/);
 await page.waitForFunction(()=>document.querySelector('#sidebar-profile img')?.naturalWidth>0);
 assert.deepEqual(await page.evaluate(async()=>await(await fetch('/api/local-access-preview')).json()),access);
 assert.deepEqual(await page.evaluate(async()=>await(await fetch('/api/work-feed/stakeholders')).json()),stakeholders);
 const funds={A:['2,100억원','2,800억원','3,050억원'],B:['1,400억원','1,700억원','1,921.5억원'],C:['4,400억원','5,600억원','6,405억원']};
 for(const key of ['A','B','C']){
  await page.locator('#sidebar-project-select').selectOption('TEST-20261016-'+key);
  await page.locator('[data-cost-basis=current]').waitFor();
  const buttons=page.locator('[data-cost-basis]');assert.equal(await buttons.count(),3);
  for(let index=0;index<3;index++){
   await buttons.nth(index).click();
   assert.equal(await page.locator('.studio-capital-totals b').first().innerText(),funds[key][index]);
   assert.equal(await page.locator('[data-stage-field=funding] .studio-stage-values b').last().innerText(),funds[key][index]);
  }
  assert.equal(await page.locator('.studio-stage-volume').count(),0);
  const summary=page.getByRole('button',{name:'단계별 핵심 지표 요약표',exact:true});
  if(await summary.getAttribute('aria-expanded')!=='true')await summary.click();
  await page.locator('.studio-cost-bases').waitFor();assert.equal(await page.locator('[data-stage-inline-edit]').count(),3);
 }
 await page.locator('[data-stage-inline-edit=current]').click();
 await page.locator('[data-stage-input=reason]').fill('정적 검토본 격리 저장 검사');
 await page.locator('[data-stage-commit]').click();await page.locator('[data-stage-commit]').waitFor({state:'hidden'});
 const saved=await readWorkspace();assert.equal(saved.revision,version.workspaceRevision+1);
 assert.equal(saved.state.projects.find(p=>p.id==='TEST-20261016-C').financeCurrentStage.reason,'정적 검토본 격리 저장 검사');
 for(const p of seed.projects)assert.deepEqual(saved.state.projects.find(q=>q.id===p.id).costStages,p.costStages);
 await page.reload();await page.locator('[data-cost-basis=current]').waitFor();assert.deepEqual(await readWorkspace(),saved);
 await page.goto(origin+prefix+'?screen=feed');
 const frame=page.frameLocator('iframe[title="논의·협업 Feed"]');await frame.getByText('글작성하기',{exact:true}).waitFor();
 assert.equal(await frame.locator('body').getByText('샘플 검토자',{exact:true}).count(),0);
 assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).revision,oldKey),999);
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 assert(requests.every(r=>r.method==='GET'&&r.path.startsWith(prefix)),'no operational API requests or writes');
 assert.deepEqual(JSON.parse(await readFile(join(directory,'review-data/workspace.json'),'utf8')),seed);
 console.log(JSON.stringify({passed:true,revision:version.workspaceRevision,projects:3,stages:9,stakeholders:stakeholders.stakeholders.length,oldBrowserPreserved:true,saveReload:true,feed:true,missing:bad.length,externalWrites:0}));
}finally{await browser?.close();if(server.listening)await new Promise(resolve=>server.close(resolve));}
