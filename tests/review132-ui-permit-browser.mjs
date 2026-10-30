import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';

const args=process.argv.slice(2),arg=name=>args[args.indexOf(name)+1],sha=x=>createHash('sha256').update(x).digest('hex');
const htmlPath=arg('--html'),expectedSha=arg('--sha');
assert(htmlPath&&/^[a-f0-9]{64}$/.test(expectedSha||''),'Provide the exact current HTML and SHA256.');
const html=await fs.readFile(htmlPath);assert.equal(sha(html),expectedSha);
const origin=JSON.parse(html.toString().match(/const APP_RUNTIME=(\{[^;]+\});/)[1]).cloudOrigin;
assert.equal(new URL(origin).protocol,'https:');
const fixturePath='.build/followup-20261021/prepared-final-approved-samples-1792632512936.json',fixtureBytes=await fs.readFile(fixturePath);
assert.equal(sha(fixtureBytes),'6adcf3de9ce10845a86c723ae589d8fdbd4c42ce60b61c533272819453968caa');
const fixture=JSON.parse(fixtureBytes).state,traffic='permit-catalog-3-2';
const landFields=['agreementDate','agreementParties','spvType','spvName','spvDate','acquisitionMethod','purchaseRate','titleSecured','delay','delayReason','delayDetail'];
const land={agreementDate:'2026-10-01',agreementParties:'가상 당사자',spvType:'PFV',spvName:'가상 법인',spvDate:'2026-10-02',acquisitionMethod:'매입',purchaseRate:0,titleSecured:'예',delay:'아니오',delayReason:null,delayDetail:'보존할 내용',legacyExtra:'원문 보존'};
const out=path.resolve(arg('--out')||'.build/review132-client/ui-permit-'+Date.now());await fs.mkdir(out,{recursive:true});
const result={at:new Date().toISOString(),html:{path:htmlPath,sha256:expectedSha},runnerSha256:sha(await fs.readFile(new URL(import.meta.url))),fixture:{path:fixturePath,sha256:sha(fixtureBytes),purpose:'historical approved synthetic seed; current exact product modules are loaded from HTML'},sourcePins:{},scope:'Fresh sandboxed Edge, exact current HTML, all HTTP intercepted, synthetic state and in-memory writes only. Not live server/DB/user acceptance.',flows:[],screenshots:[],errors:[],requests:[],actualDB:false,actualUserCookies:false};
for(const file of ['src/core.js','src/permit-map.js','src/permit-views.js','src/workspace-ux.js','src/cbs.js']){const source=await fs.readFile(file);result.sourcePins[file]=sha(source);assert(html.toString().includes(source.toString().replace(/\r\n/g,'\n').replace(/<\/script/gi,'<\\/script')),file+' current module must match injected HTML');}
const require=createRequire('C:/Users/10524/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),{chromium}=require('playwright');
let browser;
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const closeForm=async(page,{dirty=false}={})=>{await page.keyboard.press('Escape');if(dirty){const discard=page.getByRole('button',{name:'저장하지 않고 닫기',exact:true});await discard.waitFor();await discard.click();}await page.locator('#app-dialog').waitFor({state:'hidden'});await settle(page);};
const navigate=async(page,tab)=>{if(!await page.locator('#sidebar').isVisible())await page.locator('.dp-app [data-action="sidebar-toggle"]').click();await page.locator('#sidebar [data-view="permit"]').click();await page.locator('#content [data-action="tab"][data-tab="'+tab+'"]').click();await settle(page);};
async function inspectLand(page){
 const controls=await page.locator('#app-form input,#app-form select,#app-form textarea').evaluateAll(nodes=>nodes.map(n=>({name:n.name,kind:n.tagName==='SELECT'?'select':n.tagName==='TEXTAREA'?'textarea':n.type,value:n.value})));
 assert.deepEqual(controls.map(x=>x.name),landFields);
 assert.equal(controls.find(x=>x.name==='purchaseRate').kind,'number');assert.equal(controls.find(x=>x.name==='purchaseRate').value,'0');
 for(const name of ['agreementDate','spvDate'])assert.equal(controls.find(x=>x.name===name).kind,'date');
 for(const name of ['titleSecured','delay'])assert.equal(controls.find(x=>x.name===name).kind,'select');
 const geometry=[];
 for(const name of landFields){const control=page.locator('#app-form [name="'+name+'"]');await control.scrollIntoViewIfNeeded();await control.focus();await settle(page);const frame=await control.evaluate(n=>{const r=n.getBoundingClientRect(),b=n.closest('.dialog-body').getBoundingClientRect();return{name:n.name,left:r.left,right:r.right,top:r.top,bottom:r.bottom,body:{left:b.left,right:b.right,top:b.top,bottom:b.bottom},active:document.activeElement===n};});assert(frame.active,name+' keyboard focus');assert(frame.top>=frame.body.top-1&&frame.bottom<=frame.body.bottom+1,name+' vertically reachable');assert(frame.left>=frame.body.left-1&&frame.right<=frame.body.right+1,name+' horizontally contained');geometry.push(frame);}
 return{controls,geometry};
}
try{
 browser=await chromium.launch({headless:true,chromiumSandbox:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const widths=args.includes('--widths')?arg('--widths').split(',').map(Number):[1280,1440,1600,390];
 for(const width of widths)for(const role of ['editor','viewer']){
  const viewport={width,height:width===1280?800:width===1440?900:width===1600?1000:844},context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>result.errors.push({width,role,message:e.message}));
  let state=structuredClone(fixture),revision=1,failNext=false;const p=state.projects[0],projectId=p.id;
  p.land=structuredClone(land);p.permitConditions={...p.permitConditions,trafficZone:'미확인',trafficScope:'미확인'};
  p.permits=[{id:'TRAFFIC_EXISTING',catalogId:traffic,typeId:'company-permit:'+traffic,name:'교통영향평가 보완',group:'영향평가',stage:'보완 중',agency:'가상 관할기관',reportCategory:'공사시행',plannedApplication:'2026-11-01',expected:'2027-01-02',sourcePath:'가상자료/신청.pdf',rounds:[],actionItems:[]}];
  const writes=[];await context.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());assert.equal(url.origin,origin,'External HTTP forbidden');result.requests.push({width,role,method:req.method(),path:url.pathname});const send=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
   if(url.pathname==='/')return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
   if(url.pathname.startsWith('/assets/fonts/'))return route.fulfill({status:200,contentType:'font/woff2',body:await fs.readFile(path.join('src',url.pathname))});
   if(url.pathname==='/api/session')return send({authenticated:true,userId:'ui132-'+role,email:'kylee@igisam.com'});
   if(url.pathname==='/api/workspace'){if(req.method()==='PUT'){const input=req.postDataJSON();writes.push({failed:failNext,requestId:input.requestId});if(failNext){failNext=false;return send({error:'STORAGE_UNAVAILABLE'},503);}assert.equal(role,'editor');state=input.state;revision++;return send({workspaceId:'platform',requestId:input.requestId,revision,state});}return send({workspaceId:'platform',revision,state,user:{id:'ui132-'+role,email:'kylee@igisam.com'},capabilities:{createProject:role==='editor',manageAccess:false,viewPlatformSpec:false},projectRoles:Object.fromEntries(state.projects.map(row=>[row.id,role]))});}
   if(url.pathname==='/api/notifications')return send({states:[],tasks:[],alerts:[],notices:[],projectIds:state.projects.map(row=>row.id)});
   if(url.pathname==='/api/reference-data')return send({version:'UI132',status:'success',records:[],changes:[],watchlist:[],projectWatches:[],versions:[],groups:[],market:{series:[]}});
   if(url.pathname==='/api/notion-source')return send({available:false});
   if(url.pathname==='/api/cost-snapshots')return send({snapshots:[],tasks:[]});
   if(url.pathname==='/favicon.ico')return route.fulfill({status:204,body:''});
   throw Error('Unprepared API '+url.pathname);
  });
  const flow={width,role,passed:false};try{
   await page.goto(origin);await page.waitForFunction(()=>App.cloudSession.status().phase==='ready');await page.selectOption('#project-select',projectId);await navigate(page,'land');
   assert.equal(await page.locator('[data-inline-field^="land."]').count(),0);assert.equal(await page.locator('[data-action="land-input-open"]').count(),role==='editor'?1:0);
   if(role==='editor'){
    const before=await page.evaluate(()=>JSON.stringify(App.state));await page.getByRole('button',{name:'부지확보 수정',exact:true}).click();const formImage=path.join(out,'land-form-editor-'+width+'.png');await page.screenshot({path:formImage});result.screenshots.push(formImage);flow.landFields=await inspectLand(page);assert.equal(await page.evaluate(()=>App.formEditor.dirty()),false);await closeForm(page);assert.equal(await page.evaluate(()=>JSON.stringify(App.state)),before);assert.equal(writes.length,0);
    await page.getByRole('button',{name:'부지확보 수정',exact:true}).click();await page.locator('[name="spvName"]').fill('변경 가상 법인');await page.locator('#app-form button[type="submit"]').click();await page.locator('#app-dialog').waitFor({state:'hidden'});assert.equal(writes.length,1);assert.equal(state.projects.find(row=>row.id===projectId).land.spvName,'변경 가상 법인');assert.equal(state.projects.find(row=>row.id===projectId).land.purchaseRate,0);assert.equal(state.projects.find(row=>row.id===projectId).land.delayReason,null);assert.equal(state.projects.find(row=>row.id===projectId).land.legacyExtra,'원문 보존');
    await page.reload();await page.waitForFunction(()=>App.cloudSession.status().phase==='ready');await navigate(page,'land');assert((await page.locator('#content').innerText()).includes('변경 가상 법인'));
    const saved=JSON.stringify(state.projects.find(row=>row.id===projectId).land);failNext=true;await page.getByRole('button',{name:'부지확보 수정',exact:true}).click();await page.locator('[name="spvName"]').fill('저장실패 보존 초안');await page.locator('#app-form button[type="submit"]').click();await page.waitForFunction(()=>document.getElementById('form-error')?.textContent.trim());assert.equal(await page.locator('[name="spvName"]').inputValue(),'저장실패 보존 초안');assert.equal(JSON.stringify(state.projects.find(row=>row.id===projectId).land),saved);await closeForm(page,{dirty:true});
   }
   await navigate(page,'permits');assert.equal(await page.locator('[data-action="permit-type-select"]').count(),role==='editor'?1:0);assert.equal(await page.locator('.permit-core-table [data-inline-command="edit"]').count(),0);assert.equal(await page.locator('.permit-core-table [data-action="legal-edit"]').count(),role==='editor'?1:0);
   if(role==='editor'){
    await page.getByRole('button',{name:'인허가 선택·추가',exact:true}).click();await page.getByRole('tab',{name:'인허가 목록',exact:true}).click();assert.equal(await page.locator('[data-permit-choice-group][open]').count(),0);await page.getByRole('button',{name:'전체 항목',exact:true}).click();await page.getByRole('searchbox',{name:'항목 검색',exact:true}).fill('교통');assert.equal(await page.locator('[data-permit-choice-id="'+traffic+'"]').count(),0);assert((await page.locator('[data-permit-selection-empty]').innerText()).includes('이미 등록된 인허가입니다.'));await page.getByRole('searchbox',{name:'항목 검색',exact:true}).fill('');assert.equal(await page.locator('[data-permit-choice-group][open]').count(),0);
    const group=page.locator('[data-permit-choice-group="영향평가"]');if(await group.count()&&await group.isVisible()){await group.locator('summary').click();assert.equal(await group.getAttribute('open'),'');await page.getByRole('searchbox',{name:'항목 검색',exact:true}).fill('존재하지않는인허가');assert((await page.locator('[data-permit-selection-empty]').innerText()).includes('검색 결과가 없습니다.'));await page.getByRole('searchbox',{name:'항목 검색',exact:true}).fill('');assert.equal(await group.getAttribute('open'),'');}
    await closeForm(page);await page.getByRole('button',{name:'인허가 선택·추가',exact:true}).click();await page.getByRole('tab',{name:'인허가 목록',exact:true}).click();assert.equal(await page.locator('[data-permit-choice-group][open]').count(),0);assert.equal(await page.getByRole('searchbox',{name:'항목 검색',exact:true}).inputValue(),'');await closeForm(page);
    state.projects.find(row=>row.id===projectId).permits=[];
    await page.reload();await page.waitForFunction(()=>App.cloudSession.status().phase==='ready');await navigate(page,'permits');
    await page.getByRole('button',{name:'인허가 선택·추가',exact:true}).click();await page.getByRole('tab',{name:'인허가 목록',exact:true}).click();await page.getByRole('button',{name:'전체 항목',exact:true}).click();
    const foldedImage=path.join(out,'permit-selector-folded-'+width+'.png');await page.screenshot({path:foldedImage});result.screenshots.push(foldedImage);assert.equal(await page.locator('[data-permit-choice-group][open]').count(),0);
    await page.getByRole('searchbox',{name:'항목 검색',exact:true}).fill('교통');const trafficRow=page.locator('[data-permit-choice-id="'+traffic+'"]');assert(await trafficRow.isVisible());
    await page.getByRole('searchbox',{name:'항목 검색',exact:true}).fill('');
    const selectedNames=await page.locator('input[name^="pick-"]:checked').evaluateAll(nodes=>nodes.map(node=>node.name));for(const name of selectedNames){const checked=page.locator('input[name='+JSON.stringify(name)+']'),row=checked.locator('xpath=ancestor::details[1]');if(await row.count()&&!await checked.isVisible())await row.locator('summary').click();await checked.uncheck();}
    await page.getByRole('searchbox',{name:'항목 검색',exact:true}).fill('교통');await trafficRow.locator('input[type="checkbox"]').check();
    for(const [key,value]of Object.entries({agency:'가상 관할기관',plannedApplication:'2026-11-01',expected:'2027-01-02',sourcePath:'가상자료/신청.pdf'}))await page.locator('[name="choice__'+traffic+'__'+key+'"]').fill(value);
    await page.locator('[name="choice__'+traffic+'__reportCategory"]').selectOption('공사시행');const beforeAdd=writes.length;await page.locator('#app-form button[type="submit"]').click();await page.locator('#app-dialog').waitFor({state:'hidden'});assert.equal(writes.length,beforeAdd+1);
    const added=state.projects.find(row=>row.id===projectId).permits.filter(row=>!row.deletedAt);assert.equal(added.length,1);assert.equal(added[0].catalogId,traffic);assert.equal(added[0].name,'교통영향평가');assert.equal(added[0].reportCategory,'공사시행');
    await page.reload();await page.waitForFunction(()=>App.cloudSession.status().phase==='ready');await navigate(page,'permits');assert((await page.locator('.permit-core-table').innerText()).includes('교통영향평가'));
    await page.getByRole('button',{name:'인허가 선택·추가',exact:true}).click();await page.getByRole('tab',{name:'인허가 목록',exact:true}).click();await page.getByRole('button',{name:'전체 항목',exact:true}).click();await page.getByRole('searchbox',{name:'항목 검색',exact:true}).fill('교통');assert.equal(await page.locator('[data-permit-choice-id="'+traffic+'"]').count(),0);assert((await page.locator('[data-permit-selection-empty]').innerText()).includes('이미 등록된 인허가입니다.'));await closeForm(page);
   }
   const imagePath=path.join(out,'permit-'+role+'-'+width+'.png');await page.screenshot({path:imagePath});result.screenshots.push(imagePath);flow.inMemoryWrites=writes;flow.passed=true;
  }catch(error){flow.failure={name:error.name,message:error.message,stack:error.stack};const imagePath=path.join(out,'failure-'+role+'-'+width+'.png');await page.screenshot({path:imagePath});result.screenshots.push(imagePath);}
  result.flows.push(flow);await context.close();
 }
 assert(result.flows.every(x=>x.passed),'At least one browser flow failed.');assert.deepEqual(result.errors,[]);
}catch(error){result.failure={name:error.name,message:error.message,stack:error.stack};process.exitCode=1;}finally{await browser?.close();await fs.writeFile(path.join(out,'evidence.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({out,passed:result.flows.filter(x=>x.passed).length,failed:result.flows.filter(x=>!x.passed).length,failure:result.failure,flowFailures:result.flows.filter(x=>x.failure).map(x=>({width:x.width,role:x.role,...x.failure})),errors:result.errors}));}
