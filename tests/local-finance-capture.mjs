import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {copyFile,mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startPreview} from '../scripts/local-preview/server.mjs';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const directory=await mkdtemp(join(tmpdir(),'igis-finance-capture-'));
const sourceFile=new URL('../.build/local-preview/original-workspace.json',import.meta.url);
const sourceBytes=await readFile(sourceFile);
const projectId='TEST-20261016-A';
const fixtureProject=JSON.parse(sourceBytes).projects.find(project=>project.id===projectId);
const fixtureLeaves=fixtureProject.cbs.filter(row=>!row.deletedAt&&!fixtureProject.cbs.some(child=>!child.deletedAt&&child.parentId===row.id));
const fixtureCost=fixtureLeaves.reduce((sum,row)=>sum+(row.current??0),0);
assert.equal(fixtureCost,513080000000,'원본 격리자료의 말단 원가 독립 합산');
let server,browser;
try{
 await copyFile(sourceFile,join(directory,'original-workspace.json'));
 server=await startPreview({port:0,directory});
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:950}});
 const page=await context.newPage();
 page.setDefaultTimeout(7000);
 const errors=[],external=[],writes=[];
 let refuseSave=false;
 page.on('pageerror',error=>errors.push(error.message));
 await context.route('**/*',route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin!==origin&&!['data:','blob:'].includes(url.protocol)){
   external.push(url.hostname);return route.abort();
  }
  if(url.pathname==='/api/workspace'&&request.method()==='PUT'){
   writes.push(request.postDataJSON());
   if(refuseSave)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'TEST_SAVE_REFUSED'})});
  }
  return route.continue();
 });
 const workspace=async()=>await (await context.request.get(origin+'/api/workspace')).json();
 const owner=record=>record.state.projects.find(project=>project.id===projectId);
 const stageById=(record,id)=>owner(record).costStages.find(stage=>stage.id===id);
 const nativeForm=page.locator('#app-form');
 const section=page.locator('.studio-finance-stages');
 const toolbar=section.locator('.studio-milestone-toolbar');
 const saveButton=toolbar.locator('[data-milestone-save]');
 const editButton=toolbar.locator('[data-milestone-edit]');
 const basis=section.getByRole('group',{name:'사업비 비교 기준 선택'});
 async function submit(){
  const response=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/workspace'&&response.request().method()==='PUT');
  await nativeForm.locator('[type="submit"]').click();
  assert.equal((await response).ok(),true);
  await nativeForm.waitFor({state:'hidden'});
 }
 async function cancel(){
  await nativeForm.getByRole('button',{name:'취소',exact:true}).click();
  const discard=page.getByRole('button',{name:'저장하지 않고 닫기',exact:true});
  if(await discard.isVisible())await discard.click();
  await nativeForm.waitFor({state:'hidden'});
 }
 function numericSnapshot(stage){
  const context=stage.financeContext;
  return structuredClone({values:stage.values,nodes:stage.nodes,reportedTotal:stage.reportedTotal,
   area:stage.area,areaVersionId:stage.areaVersionId,linkedValues:context.linkedValues,
   funding:context.funding,sale:context.sale,duration:context.duration,gfa:context.gfa,
   periodEnd:context.periodEnd,capitalSources:context.capitalSources});
 }
 await page.goto(origin+'/?screen=finance');
 await section.waitFor();
 await page.waitForFunction(()=>!!globalThis.document.querySelector('.studio-finance-stages [data-cost-basis="current"]'));
 // RED target: the previous implementation has only stage-open, which asks for numbers.
 assert.equal(await saveButton.count(),1,'현재 연결값을 숫자 재입력 없이 저장하는 전용 버튼이 필요합니다');
 await saveButton.waitFor();
 const before=await workspace();
 const today=await page.evaluate(()=>App.today);
 await saveButton.click();
 await nativeForm.locator('[name="name"]').fill('금융검사 저장본');
 assert.equal(await nativeForm.locator('[name="date"]').inputValue(),today);
 assert.equal(await nativeForm.locator('[name="date"]').getAttribute('readonly'),'');
 await nativeForm.locator('[name="reason"]').fill('현재 연결자료 그대로 보관');
 for(const key of ['cost','funding','land','construction','interest','sale','duration']){
  await nativeForm.locator('[name="note_'+key+'"]').fill(key+' 검토 설명');
 }
 assert.equal(await nativeForm.locator('input[type="number"]').count(),0);
 assert.equal(await nativeForm.locator('[name="financeFunding"],[name="reportedTotal"],[name^="phaseAmount_"]').count(),0);
 await submit();
 const captured=await workspace();
 assert.equal(captured.revision,before.revision+1);
 const added=owner(captured).costStages.filter(row=>!owner(before).costStages.some(old=>old.id===row.id));
 assert.equal(added.length,1,'한 번 저장할 때 시점 한 개만 생성');
 const saved=added[0],savedId=saved.id;
 assert.equal(saved.kind,'custom');
 assert.equal(saved.label,'금융검사 저장본');
 assert.equal(saved.financeContext.captureVersion,1);
 assert.deepEqual(Object.keys(saved.financeContext.linkedValues).sort(),['construction','cost','duration','funding','interest','land','sale']);
 assert.equal(saved.financeContext.linkedValues.cost,fixtureCost);
 assert.equal(saved.financeContext.linkedValues.funding,305000000000);
 assert.equal(saved.financeContext.linkedValues.duration,72);
 assert.equal(saved.financeContext.linkedValues.sale,null);
 assert.equal(saved.financeContext.gfa,63500);
 assert.equal(saved.financeContext.periodEnd,'2030-06');
 assert.equal(saved.financeContext.capitalSources.length,4);
 assert.equal(saved.financeContext.capitalSources.reduce((sum,row)=>sum+row.amount,0),305000000000);
 assert.deepEqual(owner(captured).cbs,owner(before).cbs);
 assert.deepEqual(owner(captured).loans,owner(before).loans);
 assert.deepEqual(owner(captured).equities,owner(before).equities);
 assert.equal(owner(captured).currentAreaVersionId,owner(before).currentAreaVersionId);
 assert.deepEqual(owner(captured).costStages.filter(row=>row.id!==savedId),owner(before).costStages);
 assert.equal(await basis.locator('[data-cost-basis="snapshot:'+savedId+'"]').getAttribute('aria-pressed'),'true');
 const frozen=numericSnapshot(saved);
 const savedDisplay=await section.locator('.studio-stage-volume,.studio-stage-comparison').allTextContents();
 const savedCapital=await page.locator('.studio-capital-groups').innerText();

 // Editing the selected snapshot's information must not expose or replace numbers.
 await editButton.click();
 assert.equal(await nativeForm.locator('[name="name"]').inputValue(),'금융검사 저장본');
 assert.equal(await nativeForm.locator('input[type="number"]').count(),0);
 await nativeForm.locator('[name="name"]').fill('금융검사 이름 수정');
 await nativeForm.locator('[name="reason"]').fill('설명만 수정');
 await submit();
 const renamed=await workspace();
 assert.equal(owner(renamed).costStages.length,owner(captured).costStages.length);
 assert.equal(stageById(renamed,savedId).label,'금융검사 이름 수정');
 assert.deepEqual(numericSnapshot(stageById(renamed,savedId)),frozen);

 // Simulate an independent source update via the isolated workspace API.
 const next=structuredClone(renamed.state),changed=next.projects.find(project=>project.id===projectId);
 changed.loans[0].commitment+=10000000000;
 changed.loans[0].institution='변경된 현재 대주';
 changed.equities[0].company='변경된 현재 출자자';
 changed.basic.periodEnd='2032-06';
 changed.financeCurrentStage={...(changed.financeCurrentStage||{}),sale:700000000000};
 const area=changed.areaVersions.find(row=>row.id===changed.currentAreaVersionId);
 area.gfaTotal=73500;changed.building.gfaTotal=73500;
 const currentLeaf=changed.cbs.find(row=>!row.deletedAt&&Number.isSafeInteger(row.current)&&row.current>0&&!changed.cbs.some(child=>child.parentId===row.id));
 assert.ok(currentLeaf);currentLeaf.current+=100000000;
 const updated=await context.request.put(origin+'/api/workspace',{headers:{Origin:origin},data:{workspaceId:renamed.workspaceId,baseRevision:renamed.revision,requestId:'capture-test-source-change',state:next}});
 assert.equal(updated.ok(),true);
 await page.reload();
 await basis.locator('[data-cost-basis="snapshot:'+savedId+'"]').click();
 assert.deepEqual(numericSnapshot(stageById(await workspace(),savedId)),frozen);
 const unchanged=await section.locator('.studio-stage-volume,.studio-stage-comparison').allTextContents();
 assert.deepEqual(unchanged.map(text=>text.replaceAll('금융검사 이름 수정','금융검사 저장본')),savedDisplay);
 assert.equal(await page.locator('.studio-capital-groups').innerText(),savedCapital);
 await basis.locator('[data-cost-basis="current"]').click();
 assert.match(await section.locator('.studio-stage-volume').innerText(),/3,150억원/);
 assert.match(await section.locator('.studio-stage-facts').innerText(),/73,500㎡/);
 assert.match(await page.locator('.studio-capital-groups').innerText(),/변경된 현재 대주/);
 await basis.locator('[data-cost-basis="snapshot:'+savedId+'"]').click();

 const beforeCancel=await workspace();
 await editButton.click();
 await nativeForm.locator('[name="name"]').fill('취소할 이름');
 await cancel();
 assert.deepEqual(await workspace(),beforeCancel);
 await editButton.click();
 await nativeForm.locator('[name="name"]').fill('저장 실패 이름');
 refuseSave=true;
 const refusal=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/workspace'&&response.status()===503);
 await nativeForm.locator('[type="submit"]').click();
 await refusal;
 await nativeForm.locator('[name="name"]').waitFor();
 assert.equal(await nativeForm.locator('[name="name"]').inputValue(),'저장 실패 이름');
 assert.deepEqual(await workspace(),beforeCancel);
 refuseSave=false;
 await cancel();

 // Adversarial in-memory changes while a form is open must never turn an edit into an add.
 for(const race of ['project-change','deleted-target']){
  await page.reload();
  await basis.locator('[data-cost-basis="snapshot:'+savedId+'"]').click();
  await editButton.click();
  await nativeForm.locator('[name="name"]').fill('차단할 변경');
  await page.evaluate(({race,projectId,savedId})=>{
   if(race==='project-change')App.ui.projectId=App.state.projects.find(project=>project.id!==projectId).id;
   else{const owner=App.state.projects.find(project=>project.id===projectId);owner.costStages=owner.costStages.filter(row=>row.id!==savedId);}
  },{race,projectId,savedId});
  const writeCount=writes.length;
  await nativeForm.locator('[type="submit"]').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('#app-form .field-error,#app-form [role="alert"],.dialog-body .error')].some(node=>node.textContent.trim()));
  assert.equal(await nativeForm.locator('[name="name"]').inputValue(),'차단할 변경');
  assert.equal(writes.length,writeCount);
  assert.deepEqual(await workspace(),beforeCancel);
 }
 assert.deepEqual(errors,[]);
 assert.deepEqual(external,[]);
 assert.deepEqual(await readFile(sourceFile),sourceBytes);
 console.log('LOCAL-UI-164 현재 단계 단일저장·선택단계 메타수정·숫자/면적/기간/투자자 고정·취소/실패/대상변경 차단 통과');
}finally{
 if(browser)await browser.close();
 if(server?.listening)await new Promise(resolve=>server.close(resolve));
 await rm(directory,{recursive:true,force:true});
}
