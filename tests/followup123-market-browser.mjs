import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';

// AUTO123-02 independent browser acceptance. This serves the exact supplied HTML,
// not the current WIP modules. Only API boundaries are mocked. Synthetic source
// facts (100 -> 120, intermediate 110) are independent of product geometry/IDs.
// Native option labels choose versions; opaque product IDs are never recreated.
const argv=process.argv.slice(2),arg=name=>{const i=argv.indexOf(name);return i<0?'':argv[i+1]||'';};
const sha=value=>crypto.createHash('sha256').update(value).digest('hex'),copy=structuredClone;
if(argv.includes('--help')){
 console.log('Usage: node tests/followup123-market-browser.mjs --html PATH --expected-sha SHA256 --fixture APPROVED_PACK --reference PARTNERS_REFERENCE [--partners-sha SHA256] [--runtime-package PATH] [--browser-path PATH] [--out .build/UNIQUE_DIR] [--prepare-only]');
 process.exit(0);
}
const required=['--html','--expected-sha','--fixture','--reference'];
for(const flag of required)if(!arg(flag)){console.error(JSON.stringify({status:'preparation-error',missing:flag,actualBrowser:false}));process.exit(2);}
let html,pack,reference,origin,inputs;
try{
 const [htmlBytes,packBytes,referenceBytes]=await Promise.all([fs.readFile(arg('--html')),fs.readFile(arg('--fixture')),fs.readFile(arg('--reference'))]);
 html=htmlBytes;assert.equal(sha(html),arg('--expected-sha').toLowerCase(),'전달받은 정확 HTML 지문');
 pack=JSON.parse(packBytes);reference=JSON.parse(referenceBytes);
 assert.deepEqual(pack.state.projects.map(p=>p.id).sort(),['TEST-20261016-A','TEST-20261016-B','TEST-20261016-C']);
 assert(Array.isArray(reference.groups)&&reference.market&&reference.companies,'승인된 기준정보 모양');
 const runtime=html.toString('utf8').match(/const APP_RUNTIME=(\{[^;]+\});/);assert(runtime,'HTML 런타임 설정');
 origin=JSON.parse(runtime[1]).cloudOrigin;assert.equal(new URL(origin).protocol,'https:','실제 앱과 같은 HTTPS origin을 격리 모의 전송');
 const partners=await fs.readFile('src/partners.js');
 if(arg('--partners-sha')){assert.equal(sha(partners),arg('--partners-sha').toLowerCase());assert(html.includes(partners),'검수 모듈의 정확 바이트가 지정 HTML에 포함되어야 합니다.');}
 inputs={html:{path:arg('--html'),bytes:html.length,sha256:sha(html)},fixture:{path:arg('--fixture'),sha256:sha(packBytes),projectIds:pack.state.projects.map(p=>p.id)},reference:{path:arg('--reference'),sha256:sha(referenceBytes)},partnersSha256:sha(partners)};
}catch(error){console.error(JSON.stringify({status:'preparation-error',message:error.message,actualBrowser:false}));process.exit(2);}
if(argv.includes('--prepare-only')){console.log(JSON.stringify({status:'prepared-not-executed',...inputs,actualBrowser:false,actualRemoteRequests:0}));process.exit(0);}

const timestamp=new Date().toISOString().replaceAll(':','-').replaceAll('.','-');
const output=path.resolve(arg('--out')||`.build/recheck-20261022/market-browser/${timestamp}`);
assert(output.startsWith(path.resolve('.build')+path.sep),'증거는 전용 .build 아래에만 생성합니다.');
await fs.mkdir(path.dirname(output),{recursive:true});
await fs.mkdir(output,{recursive:false});
const self=await fs.readFile(new URL(import.meta.url));await fs.writeFile(path.join(output,'runner-source.mjs'),self);
const viewports=[{width:1440,height:900},{width:390,height:844}].filter(v=>!arg('--viewport')||String(v.width)===arg('--viewport'));
assert(viewports.length,'지원하는 뷰포트는 1440 또는 390입니다.');
const cases=['selected-endpoints-keyboard-tooltip','same-month-two-versions-no-time-line','reference-reorder-preserves-selection','lost-explicit-selection-keeps-placeholder'].filter(name=>!arg('--case')||name.includes(arg('--case')));
assert(cases.length,'지정한 흐름 이름이 검사 목록에 없습니다.');
const evidence={scope:'exact HTML; fresh sandboxed Edge; canonical HTTPS origin fulfilled only from loopback mock API; approved A/B/C and synthetic market observations; no real user session, DB, official remote source or workspace write',startedAt:new Date().toISOString(),...inputs,testSourceSha256:sha(self),actualBrowser:true,actualRemoteRequests:0,actualDatabaseAccess:false,flows:[],network:[],blockedExternal:[],mockErrors:[],consoleErrors:[],pageErrors:[],screenshots:[],tooltipDiagnostics:[],allFunctionsVerified:false};
const QA_LABEL='독립 검수 지수 · 실제 통계 아님',QA_SOURCE='QA_MARKET_VERSION_SOURCE';
const rawPoints=[
 {id:'qa-jan-prior',period:'2026-01',value:100,updated_at:'2026-01-01',status:'잠정'},
 {id:'qa-jan-corrected',period:'2026-01',value:9000,updated_at:'2026-01-02',status:'정정'},
 {id:'qa-feb-prior',period:'2026-02',value:105,updated_at:'2026-02-01',status:'잠정'},
 {id:'qa-feb-current',period:'2026-02',value:110,updated_at:'2026-02-02',status:'확정'},
 {id:'qa-mar-prior',period:'2026-03',value:120,updated_at:'2026-03-01',status:'잠정'},
 {id:'qa-mar-corrected',period:'2026-03',value:8000,updated_at:'2026-03-02',status:'정정'}
];
const rawPointsBefore=JSON.stringify(rawPoints),referenceBefore=JSON.stringify(reference),workspaceBefore=JSON.stringify(pack.state);
let currentReference,workspace,browser,currentPage,server;
function reset(){
 workspace=copy(pack.state);currentReference=copy(reference);currentReference.version='qa-market-initial';
 currentReference.market.series=[...(currentReference.market.series||[]),{id:QA_SOURCE,label:QA_LABEL,frequency:'월',unit:'검수 지수',source_name:'합성 관측 원문',source_url:'https://example.invalid/qa-market',points:copy(rawPoints)}];
}
reset();
const roles=()=>Object.fromEntries(workspace.projects.map(p=>[p.id,'approver']));
server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1'),record={method:req.method,path:url.pathname,status:0};
 const json=(body,status=200)=>{record.status=status;res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(body));};
 try{
  if(!['GET','HEAD'].includes(req.method)){evidence.mockErrors.push({kind:'unexpected-write-attempt',method:req.method,path:url.pathname});json({error:'WRITES_DISABLED'},405);return;}
  if(url.pathname==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});res.end(html);return;}
  if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(url.pathname.startsWith('/assets/fonts/')){
   const target=path.resolve('src',url.pathname.slice(1));assert(target.startsWith(path.resolve('src/assets/fonts')+path.sep));
   res.writeHead(200,{'content-type':'font/woff2'});res.end(await fs.readFile(target));return;
  }
  if(url.pathname==='/api/workspace'){json({workspaceId:'platform',revision:1,state:workspace,user:{id:'qa-owner',email:'kylee@igisam.com'},capabilities:{createProject:true,manageAccess:true,viewPlatformSpec:true},projectRoles:roles()});return;}
  if(url.pathname==='/api/session'){json({authenticated:true,userId:'qa-owner',email:'kylee@igisam.com',newAccountCreated:false});return;}
  if(url.pathname==='/api/reference-data'&&url.searchParams.get('kind')==='partners'){
   const key=url.searchParams.get('companyKey');
   if(key){json(currentReference.companies[key]?{version:currentReference.version,company:currentReference.companies[key]}:{error:'NOT_IN_APPROVED_FIXTURE'},currentReference.companies[key]?200:404);return;}
   json({version:currentReference.version,checkedAt:currentReference.checkedAt,source:currentReference.source,groups:currentReference.groups,market:currentReference.market,previousPublications:currentReference.previousPublications||[]});return;
  }
  if(url.pathname==='/api/partner-comments'&&url.searchParams.get('mode')==='summary'){
   json({summaries:Object.keys(currentReference.companies).map(companyKey=>({companyKey,totalCount:0,onlineCount:0,recent31day:false})),viewer:{email:'kylee@igisam.com'}});return;
  }
  if(url.pathname==='/api/notion-source'){json({available:false});return;}
  if(url.pathname==='/api/notifications'){json({states:[],tasks:[],alerts:[]});return;}
  evidence.mockErrors.push({kind:'unimplemented-mock-route',method:req.method,path:url.pathname});json({error:'MOCK_ROUTE_UNIMPLEMENTED'},501);
 }catch(error){evidence.mockErrors.push({kind:'mock-handler-failure',path:url.pathname,message:error.message});if(!res.headersSent)json({error:'MOCK_HANDLER_FAILURE'},500);else res.end();}
 finally{if(url.pathname.startsWith('/api/'))evidence.network.push(record);}
});
const snapshot=async(page,label)=>{const file=path.join(output,label+'.png');await page.screenshot({path:file,fullPage:false});evidence.screenshots.push(path.relative(process.cwd(),file).replaceAll('\\','/'));};
const settle=async page=>{await page.waitForFunction(()=>App.cloudSession.status().phase==='ready'&&!App.cloudPersistence.pending(),{},{timeout:10000});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
const digest=page=>page.evaluate(async()=>{const data=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(App.state)));return [...new Uint8Array(data)].map(x=>x.toString(16).padStart(2,'0')).join('');});
const trend=page=>page.locator('#content .panel').filter({has:page.getByRole('heading',{name:'시장 공사비 동향',exact:true})});
async function chooseVersion(page,side,label){
 const select=page.locator(`#market-${side}-version`),options=await select.locator('option').evaluateAll(nodes=>nodes.map(n=>({label:n.textContent.trim(),value:n.value,disabled:n.disabled})));
 const matches=options.filter(option=>option.label===label&&!option.disabled);assert.equal(matches.length,1,`관측한 버전 표시 ${label}가 정확히 한 개 있어야 합니다.`);
 await select.selectOption(matches[0].value);return matches[0].value;
}
async function selectRange(page,start,end,startLabel,endLabel){
 await page.locator('#market-start').fill(start);await page.locator('#market-start').press('Tab');await settle(page);
 await page.locator('#market-end').fill(end);await page.locator('#market-end').press('Tab');await settle(page);
 const selected={start:await chooseVersion(page,'start',startLabel),end:await chooseVersion(page,'end',endLabel)};
 await page.locator('[data-action="market-compare"]').click();await settle(page);return selected;
}
async function chart(page){
 return trend(page).locator('svg.dp-market-series-chart').evaluate(svg=>({labels:[...svg.querySelectorAll('circle')].map(n=>n.getAttribute('data-tooltip')),points:[...svg.querySelectorAll('circle')].map(n=>({x:Number(n.getAttribute('cx')),y:Number(n.getAttribute('cy'))})),paths:svg.querySelectorAll('path').length,ticks:[...svg.querySelectorAll('text')].map(n=>n.textContent)}));
}
function expectValues(actual,expected){assert.deepEqual(actual.labels.map(label=>Number(label.split(' · ')[1].replaceAll(',',''))),expected,'독립 관측금액과 실제 SVG가 같아야 합니다.');}
async function tooltipWithinViewport(page,expected){
 const tooltip=page.locator('#dp-chart-tooltip');await tooltip.waitFor({state:'visible'});const text=await tooltip.innerText();assert(text.includes(expected));
 const box=await tooltip.boundingBox(),viewport=page.viewportSize();
 evidence.tooltipDiagnostics.push({expected,text,rect:box,viewport,dom:await page.evaluate(()=>{const tip=document.getElementById('dp-chart-tooltip'),active=document.activeElement;return {hidden:tip?.hidden,style:tip?.getAttribute('style'),activeTag:active?.tagName,activeLabel:active?.getAttribute('aria-label'),activeRect:active?.getBoundingClientRect().toJSON(),primaryScrollTop:document.querySelector('.main-scroll')?.scrollTop,documentScrollTop:document.scrollingElement.scrollTop};})});
 assert(box&&box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width+1&&box.y+box.height<=viewport.height+1,'툴팁의 모든 글자가 화면 안에 있어야 합니다.');return {text,rect:box};
}
async function runFlow(page,name,fn,beforeDigest){
 if(arg('--case')&&!name.includes(arg('--case')))return;
 const flow={name,viewport:page.viewportSize(),status:'running',networkStart:evidence.network.length,steps:[]};evidence.flows.push(flow);
 try{await fn(flow);const afterDigest=await digest(page);assert.equal(afterDigest,beforeDigest,'두 사업 이상의 원장·금액·계약·VAT·감사·알림 전체 무변이');assert.equal(JSON.stringify(workspace),workspaceBefore,'모의 서버 원장 무변이');flow.workspaceStateSha256={before:beforeDigest,after:afterDigest};flow.status='passed';}
 catch(error){flow.status=error.name==='AssertionError'?'failed-assertion':'blocked-needs-triage';flow.message=error.message;flow.stack=error.stack;flow.diagnostic=await page.evaluate(()=>({trace:globalThis.__marketFocusTrace||[],activeTag:document.activeElement?.tagName,activeRect:document.activeElement?.getBoundingClientRect().toJSON(),tip:document.getElementById('dp-chart-tooltip')?{hidden:document.getElementById('dp-chart-tooltip').hidden,rect:document.getElementById('dp-chart-tooltip').getBoundingClientRect().toJSON(),style:document.getElementById('dp-chart-tooltip').getAttribute('style')}:null})).catch(()=>null);await snapshot(page,name+'-failure').catch(()=>{});}
 finally{flow.network=evidence.network.slice(flow.networkStart);console.log(JSON.stringify({flow:name,status:flow.status}));}
}
try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const localOrigin='http://127.0.0.1:'+server.address().port;
 const require=createRequire(arg('--runtime-package')||'C:/Users/10524/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),{chromium}=require('playwright');
 browser=await chromium.launch({headless:true,chromiumSandbox:true,executablePath:arg('--browser-path')||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 evidence.transport={origin,loopback:localOrigin,allBrowserRequestsIntercepted:true,browserSandbox:true,freshContexts:true};
 for(const viewport of viewports){
  reset();const context=await browser.newContext({viewport,serviceWorkers:'block',acceptDownloads:false});let closing=false;
  try{
   const page=await context.newPage();currentPage=page;page.setDefaultTimeout(10000);
   page.on('pageerror',error=>evidence.pageErrors.push({viewport,message:error.message}));page.on('console',message=>{if(message.type()==='error')evidence.consoleErrors.push({viewport,text:message.text()});});
   await context.route('**/*',async route=>{
    const url=new URL(route.request().url());if(url.origin!==origin){evidence.blockedExternal.push({origin:url.origin,path:url.pathname});await route.abort();return;}
    try{const response=await route.fetch({url:localOrigin+url.pathname+url.search,maxRedirects:0});await route.fulfill({response});}
    catch(error){if(!closing)evidence.mockErrors.push({kind:'loopback-transport',path:url.pathname,message:error.message.split('\n')[0]});await route.abort().catch(()=>{});}
   });
   await page.goto(origin,{waitUntil:'load'});await settle(page);
   assert.deepEqual((await page.locator('.portfolio-table tbody tr').evaluateAll(rows=>rows.map(row=>row.cells[0]?.textContent.trim()))).sort(),['A','B','C']);
   if(await page.locator('#sidebar').isHidden())await page.getByRole('button',{name:'메뉴 펼치기',exact:true}).click();
   await page.locator('#sidebar [data-action="go"][data-view="company"]').click();await settle(page);
   await page.locator('[data-action="partner-group"][data-group="market"]').click();await page.locator('#market-series-select').waitFor();await settle(page);
   if(await page.getByRole('button',{name:'메뉴 접기',exact:true}).isVisible())await page.getByRole('button',{name:'메뉴 접기',exact:true}).click();
   const observedSeries=await page.locator('#market-series-select option').evaluateAll(nodes=>nodes.map(n=>({label:n.textContent,value:n.value}))),qa=observedSeries.filter(n=>n.label.includes(QA_LABEL));assert.equal(qa.length,1);
   await page.locator('#market-series-select').selectOption(qa[0].value);await settle(page);const beforeDigest=await digest(page),prefix=String(viewport.width);
   await runFlow(page,prefix+'-selected-endpoints-keyboard-tooltip',async flow=>{
    const selected=await selectRange(page,'2026-01','2026-03','2026-01-01 · 잠정 · 100','2026-03-01 · 잠정 · 120');const actual=await chart(page);expectValues(actual,[100,110,120]);assert.equal(actual.paths,2);assert(actual.ticks.every(t=>!t.includes('8,000')&&!t.includes('9,000')));
    const summary=await trend(page).locator('.panel-body > .inline').first().innerText();assert(summary.includes('100')&&summary.includes('120'));assert(/20(?:\.0+)?%/.test(summary),'요약 증감률 20%');
    await page.evaluate(()=>{globalThis.__marketFocusTrace=[];for(const type of ['focusin','focusout','scroll'])document.addEventListener(type,event=>{if(globalThis.__marketFocusTrace.length>=40)return;const active=document.activeElement,tip=document.getElementById('dp-chart-tooltip');globalThis.__marketFocusTrace.push({type,target:event.target.id||event.target.tagName,active:active?.tagName,activeRect:active?.getBoundingClientRect().toJSON(),tipHidden:tip?.hidden,tipRect:tip?.getBoundingClientRect().toJSON(),at:performance.now()});},true);});
    const version=page.locator('#market-end-version');await version.scrollIntoViewIfNeeded();await version.focus();flow.beforeKeyboard=await page.evaluate(()=>({version:document.getElementById('market-end-version').getBoundingClientRect().toJSON(),circles:[...document.querySelectorAll('.dp-market-series-chart circle')].map(n=>n.getBoundingClientRect().toJSON()),scrollTop:document.querySelector('.main-scroll')?.scrollTop}));await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement?.tagName.toLowerCase()),'circle','자료버전 다음 Tab이 실제 SVG 관측점으로 이동');
    const firstTip=await tooltipWithinViewport(page,'2026-01 · 100');assert(firstTip.text.includes('2026-01-01'));
    await page.keyboard.press('Tab');const secondTip=await tooltipWithinViewport(page,'2026-02 · 110');
    const last=trend(page).locator('circle').last();await last.scrollIntoViewIfNeeded();await last.hover();const lastTip=await tooltipWithinViewport(page,'2026-03 · 120');
    flow.steps.push({selectedBy:'exact observed labels, no ID format expectation',selected,summary,actual,keyboardTips:[firstTip,secondTip],hoverTip:lastTip});await snapshot(page,flow.name);
   },beforeDigest);
   await runFlow(page,prefix+'-same-month-two-versions-no-time-line',async flow=>{
    await selectRange(page,'2026-01','2026-01','2026-01-01 · 잠정 · 100','2026-01-02 · 정정 · 9000');const actual=await chart(page);expectValues(actual,[100,9000]);assert.equal(actual.paths,0,'같은 월의 두 판본을 시간 진행선으로 연결하지 않습니다.');assert.equal(actual.points[0].x,actual.points[1].x);assert(actual.labels[0].includes('2026-01-01')&&actual.labels[1].includes('2026-01-02'));flow.steps.push({actual});await trend(page).scrollIntoViewIfNeeded();await snapshot(page,flow.name);
   },beforeDigest);
   await runFlow(page,prefix+'-reference-reorder-preserves-selection',async flow=>{
    const selected=await selectRange(page,'2026-01','2026-03','2026-01-01 · 잠정 · 100','2026-03-01 · 잠정 · 120');const source=currentReference.market.series.find(s=>s.id===QA_SOURCE);
    source.points=source.points.slice().reverse();currentReference.version='qa-market-reordered';currentReference.checkedAt='2026-10-22T09:30:00.000Z';const expectedReference=JSON.stringify(currentReference);
    await page.evaluate(()=>App.partners.ensureReference(true));await settle(page);assert.equal(await page.locator('#market-start-version').inputValue(),selected.start);assert.equal(await page.locator('#market-end-version').inputValue(),selected.end);expectValues(await chart(page),[100,110,120]);assert.equal(JSON.stringify(currentReference),expectedReference,'읽기 소비자가 원문 순서/판본을 수정하지 않습니다.');
    flow.steps.push({fixtureChange:'same raw observations reversed and checkedAt changed; public reference reload used, no business action invented',selected,selectionPreserved:true,actual:await chart(page)});await trend(page).scrollIntoViewIfNeeded();await snapshot(page,flow.name);
   },beforeDigest);
   await runFlow(page,prefix+'-lost-explicit-selection-keeps-placeholder',async flow=>{
    const old=await page.locator('#market-end-version').inputValue(),source=currentReference.market.series.find(s=>s.id===QA_SOURCE);source.points=source.points.filter(p=>p.id!=='qa-mar-prior');currentReference.version='qa-market-prior-removed';const expectedReference=JSON.stringify(currentReference);
    await page.evaluate(()=>App.partners.ensureReference(true));await settle(page);
    const placeholder=await page.locator('#market-end-version option:checked').evaluate(option=>({label:option.textContent,value:option.value,disabled:option.disabled}));assert.deepEqual(placeholder,{label:'선택한 자료버전 없음',value:old,disabled:true});assert.equal(await trend(page).locator('svg circle').count(),0);assert((await trend(page).innerText()).includes('선택한 자료버전의 관측값이 없습니다.'));
    await page.locator('[data-action="market-compare"]').click();await settle(page);assert.equal(await page.locator('#market-end-version').inputValue(),old);assert.equal(await trend(page).locator('svg circle').count(),0,'비교 재클릭도 최신 8000으로 조용히 대체하지 않습니다.');
    flow.steps.push({placeholder,noSilentLatestAfterCompare:true});await trend(page).scrollIntoViewIfNeeded();await snapshot(page,flow.name);
    await chooseVersion(page,'end','2026-03-02 · 정정 · 8000');await page.locator('[data-action="market-compare"]').click();await settle(page);expectValues(await chart(page),[100,110,8000]);assert.equal(JSON.stringify(currentReference),expectedReference);flow.steps.push({explicitUserRecovery:true,actual:await chart(page)});
   },beforeDigest);
  }finally{closing=true;await context.close();currentPage=null;}
 }
 assert.equal(JSON.stringify(reference),referenceBefore,'승인 기준정보 원본 전체 보존');assert.equal(JSON.stringify(rawPoints),rawPointsBefore,'독립 원관측 전체 보존');assert.equal(JSON.stringify(pack.state),workspaceBefore,'승인 샘플팩 전체 보존');
}catch(error){evidence.runError={kind:error.name==='AssertionError'?'failed-assertion':'blocked-needs-triage',message:error.message,stack:error.stack};if(currentPage&&!currentPage.isClosed())await snapshot(currentPage,'run-error').catch(()=>{});}
finally{
 if(browser)await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
 const plannedFlows=viewports.length*cases.length;
 evidence.finishedAt=new Date().toISOString();evidence.browserRemaining=0;evidence.summary={plannedFlows,executedFlows:evidence.flows.length,passed:evidence.flows.filter(f=>f.status==='passed').length,failedAssertions:evidence.flows.filter(f=>f.status==='failed-assertion').length,blockedNeedsTriage:evidence.flows.filter(f=>f.status==='blocked-needs-triage').length,unexecuted:plannedFlows-evidence.flows.length,mockErrors:evidence.mockErrors.length,pageErrors:evidence.pageErrors.length,consoleErrors:evidence.consoleErrors.length,workspaceWriteRequests:evidence.network.filter(n=>n.path==='/api/workspace'&&n.method!=='GET').length,actualRemoteRequests:0};
 evidence.status=evidence.runError||evidence.mockErrors.length||evidence.pageErrors.length||evidence.consoleErrors.length||evidence.summary.failedAssertions||evidence.summary.blockedNeedsTriage||evidence.summary.unexecuted?'requires-triage':'passed-bounded-scope';
 await fs.writeFile(path.join(output,'evidence.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify({output,status:evidence.status,html:inputs.html,summary:evidence.summary,browserRemaining:0},null,2));if(evidence.status!=='passed-bounded-scope')process.exitCode=1;
}
