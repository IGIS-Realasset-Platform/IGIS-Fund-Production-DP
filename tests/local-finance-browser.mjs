import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {copyFile, mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startPreview} from '../scripts/local-preview/server.mjs';
import {capitalGroups} from '../scripts/local-preview/finance-overview.js';

assert.deepEqual(capitalGroups({loans:[
 {institution:'대주 A',tranche:'Tr.A',rank:'선순위',commitment:500},
 {institution:'대주 B',trancheName:'Tr.A',rank:'선순위',commitment:'100'},
 {institution:'대주 C',type:'본PF',rank:'후순위',commitment:''},
 {institution:'삭제 대주',type:'브릿지론',deletedAt:'2026-01-01',commitment:10},
],equities:[{company:'출자자',amount:0}]}),[
 {name:'자기자본',total:0,people:[{name:'출자자',amount:0,role:''}]},
 {name:'Tr.A',total:600,people:[{name:'대주 A',amount:500,role:'선순위'},{name:'대주 B',amount:100,role:'선순위'}]},
 {name:'본PF · 후순위',total:null,people:[{name:'대주 C',amount:null,role:'후순위'}]},
]);

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const directory=await mkdtemp(join(tmpdir(),'igis-finance-browser-'));
const sourceFile=new URL('../.build/local-preview/original-workspace.json',import.meta.url);
const sourceBytes=await readFile(sourceFile);
let server,browser;
try{
 await copyFile(sourceFile,join(directory,'original-workspace.json'));
 server=await startPreview({port:0,directory});
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:950}});
 const page=await context.newPage();
 const errors=[],external=[],workspaceWrites=[],legacyWrites=[];
 let allowWorkspaceWrite=false,failWorkspaceWrite=false;
 page.setDefaultTimeout(7500);
 page.on('pageerror',error=>errors.push(error.message));
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin&&!['data:','blob:'].includes(url.protocol)){
   external.push(url.hostname);return route.abort();
  }
  if(url.pathname==='/api/local-finance-stages'&&route.request().method()!=='GET'){legacyWrites.push(url.pathname);return route.abort();}
  if(url.pathname==='/api/workspace'&&route.request().method()!=='GET'){
   workspaceWrites.push(url.pathname);
   if(!allowWorkspaceWrite)return route.abort();
   if(failWorkspaceWrite)return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'TEST_SAVE_FAILURE'})});
  }
  return route.continue();
 });
 await page.goto(origin+'/?screen=cost-overview');
 const costKpi=page.getByTestId('cost-kpi-row');
 const initialCost=await costKpi.locator('.cost-kpi-cell').filter({hasText:'언더라이팅 예산'}).locator('.cost-kpi-value').innerText();
 const currentCost=await costKpi.locator('.cost-kpi-cell').filter({hasText:'최종 예상사업비'}).locator('.cost-kpi-value').innerText();
 const costByLabel=label=>page.locator('.cbs-composition-row').filter({has:page.getByText(label,{exact:true})}).getAttribute('data-tip').then(tip=>tip.split('\n')[1]);
 const currentConstruction=await costByLabel('공사비');
 const currentInterest=await costByLabel('금융비용');
 assert.equal(initialCost,'5,123억원');
 assert.notEqual(currentCost,'5,248억원');
 await page.goto(origin+'/?screen=finance');
 const workspace=await (await context.request.get(origin+'/api/workspace')).json();
 const main=page.locator('#content[data-local-screen="finance"]');
 const stage=main.locator('.studio-finance-stages');
 const structure=main.locator('.studio-capital');
 const basis=stage.getByRole('group',{name:'사업비 비교 기준 선택'});
 await basis.getByRole('button',{name:'최근 사업 단계',exact:true}).waitFor().catch(async error=>{
  console.error(await page.locator('#content').evaluate(el=>({screen:el.dataset.localScreen,text:el.innerText.slice(0,900)})),errors);
  throw error;
 });
 const linkedCost=stage.locator('.studio-stage-metrics > div').filter({hasText:/^원가/});
 const upperFunding=stage.locator('.studio-stage-metrics > div').filter({hasText:'총 조달규모'}).locator('b');
 const lowerFunding=structure.locator('.recovery-summary > div').filter({hasText:'총 조달규모'}).locator('b');
 assert.equal(await stage.locator('[data-volume-label]').innerText(),'총 조달규모');
 assert.equal(await stage.locator('[data-volume-value]').innerText(),'3,050억원');
 assert.equal(await upperFunding.innerText(),'3,050억원');
 assert.equal(await lowerFunding.innerText(),'3,050억원');
 assert.equal(await linkedCost.locator('b').innerText(),currentCost);
 const compare=stage.locator('.studio-stage-comparison');
 const details=stage.locator('[data-stage-action="details"]');
 const linkedTable=stage.getByRole('table',{name:'원가관리 비교 기준'});
 const readLegacy=async id=>{
  const response=await context.request.get(origin+'/api/local-finance-stages?'+new URLSearchParams({projectId:id}));
  assert.equal(response.status(),200);return response.json();
 };
 const legacyBefore=Object.fromEntries(await Promise.all(['TEST-20261016-A','TEST-20261016-B','TEST-20261016-C'].map(async id=>[id,await readLegacy(id)])));
 assert.deepEqual(legacyBefore['TEST-20261016-A'].stages.map(row=>row.name),['최초 언더라이팅','기본설계 검토','인허가 보완']);
 assert.equal(legacyBefore['TEST-20261016-A'].stages[0].values.funding,305000000000);
 assert.equal(legacyBefore['TEST-20261016-A'].stages[0].values.sale,605000000000);
 assert.equal(legacyBefore['TEST-20261016-A'].stages[0].values.duration,72);
 assert.equal(await stage.locator('.studio-legacy-stages,[data-stage-id],[data-stage-action="create"],[data-stage-action="update"],[data-stage-action="delete"]').count(),0,'LOCAL-UI-169: 이전 별도 기록 UI와 편집 진입 제거');
 assert.equal(await stage.getByText('이전 별도 단계 기록',{exact:true}).count(),0);
 assert.equal(await details.getAttribute('aria-expanded'),'false');
 assert.equal(await stage.getByText('변경 사유·관련 이슈',{exact:true}).isVisible(),false);
 assert.equal(await stage.getByText(/교통 개선시설/).isVisible(),false);
 assert.ok(await stage.evaluate(el=>el.querySelector('.studio-stage-selector').getBoundingClientRect().bottom<=el.querySelector('.studio-stage-volume').getBoundingClientRect().top));
 assert.ok(await compare.evaluate(el=>{
  const box=el.getBoundingClientRect();
  const trigger=el.querySelector('button').getBoundingClientRect();
  const cards=[...el.querySelectorAll('.studio-stage-comparison-grid article')].map(card=>card.getBoundingClientRect());
  return box.width===trigger.width&&box.height===trigger.height&&cards.length===4
   &&cards[0].top===cards[1].top&&cards[2].top===cards[3].top&&cards[0].left===cards[2].left;
 }));
 const volume=stage.getByRole('group',{name:'사업 규모 지표 선택'});
 await volume.getByRole('button',{name:'공사비',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),currentConstruction);
 await volume.getByRole('button',{name:'금융비',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),currentInterest);
 await volume.getByRole('button',{name:'매각 목표',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),'—');
 await volume.getByRole('button',{name:'총 조달규모',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),'3,050억원');
 await volume.getByRole('button',{name:'원가',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),currentCost);
 const costComparison=compare.getByRole('heading',{name:'원가',exact:true}).locator('..');
 assert.deepEqual(await costComparison.locator('.studio-stage-values b').allTextContents(),[initialCost,currentCost]);
 await basis.getByRole('button',{name:/최초 언더라이팅/}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),initialCost);
 assert.equal(await upperFunding.innerText(),'3,050억원','기존 최초 단계에 저장한 조달규모를 누락하면 안 됩니다');
 await volume.getByRole('button',{name:'매각 목표',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),'6,050억원');
 assert.match(await compare.getByRole('heading',{name:'개발기간',exact:true}).locator('..').innerText(),/72개월/);
 await volume.getByRole('button',{name:'원가',exact:true}).click();
 assert.equal(await lowerFunding.innerText(),'3,050억원');
 assert.deepEqual(await costComparison.locator('.studio-stage-values b').allTextContents(),[initialCost,initialCost],'LOCAL-UI-168: 최초 단계도 원본처럼 동일한 두 칸 배치를 유지');
 assert.equal(await structure.locator('.studio-capital-bar').isVisible(),false,'과거 구성 미입력에 현재 조달 막대를 재사용하면 안 됩니다');
 assert.equal(await structure.locator('.studio-capital-groups article').count(),0);
 await basis.getByRole('button',{name:'최근 사업 단계',exact:true}).click();
 await details.click();
 await linkedTable.waitFor();
 assert.equal(await linkedTable.locator('tbody tr').first().getByRole('rowheader').innerText(),'연면적','LOCAL-UI-169: 연면적을 핵심지표 첫 행에 표시');
 const gfaText=await linkedTable.getByRole('row',{name:/^연면적/}).locator('td[data-selected="true"]').innerText();
 assert.match(gfaText,/평/);assert.doesNotMatch(gfaText,/㎡/);
 assert.ok(Math.abs(Number(gfaText.match(/[\d,.]+/)[0].replaceAll(',',''))-63500/3.305785)<=0.5,'기존 연면적을 평 단위로만 변환');
 assert.equal(await linkedTable.getByRole('rowheader',{name:'사업 준공 시점',exact:true}).count(),1);
 assert.equal(await linkedTable.getByRole('rowheader',{name:'사업 종료 예정',exact:true}).count(),0);
 assert.ok(await linkedTable.evaluate(el=>getComputedStyle(el.querySelector('thead th'),'::after').backgroundColor===getComputedStyle(el.querySelector('tbody th')).borderBottomColor),'LOCAL-UI-171: 제목행과 항목행 구분선 색 일치');
 assert.ok(await stage.evaluate(el=>el.closest('.dp-finance').textContent.indexOf('개발 단계별 핵심 지표')<el.closest('.dp-finance').textContent.indexOf('대출현황')));
 assert.equal(await stage.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
 assert.equal(await linkedCost.locator('b').innerText(),currentCost);
 assert.equal(await upperFunding.innerText(),'3,050억원');
 await stage.getByRole('button',{name:'핵심 지표 닫기'}).click();
 assert.equal(await linkedTable.isVisible(),false);
 await details.click();

 const bar=structure.getByRole('group',{name:'약정·출자 기준 조달 비중'});
 const equity=bar.getByRole('button',{name:/^자기자본/});
 const lender=bar.getByRole('button',{name:/^본PF/});
 assert.equal(await bar.getByRole('button').count(),3);
 assert.equal(await bar.evaluate(el=>el.getBoundingClientRect().height),60);
 assert.match(await structure.locator('.recovery-summary').innerText(),/3,050억원/);
 await lender.hover();
 assert.equal(await structure.locator('article:visible').count(),3);
 assert.match(await structure.locator('article.is-active').innerText(),/B보험/);
 assert.equal(await equity.evaluate(el=>el.classList.contains('is-active')),false);
 await stage.getByRole('heading',{name:'개발 단계별 핵심 지표'}).hover();
 assert.equal(await structure.locator('article:visible').count(),3);
 assert.equal(await structure.locator('article.is-active').count(),0);
 await equity.focus();
 assert.match(await structure.locator('article.is-active').innerText(),/자기자본/);
 await equity.press('Space');
 assert.equal(await equity.getAttribute('aria-pressed'),'true');
 await equity.press('Escape');
 assert.equal(await structure.locator('article:visible').count(),3);
 await main.getByRole('button',{name:'조달 내역 보기'}).click();
 const capitalDialog=page.getByRole('dialog',{name:'최근 사업 단계 · 조달 내역'});
 await capitalDialog.waitFor();
 assert.deepEqual(await capitalDialog.getByRole('columnheader').allTextContents(),['구분','트랜치','자금 제공자','약정·출자액']);
 assert.equal(await capitalDialog.locator('tbody tr').count(),4);
 await page.keyboard.press('Escape');

 // Legacy records remain a read-only UW source; only native stages appear in the UI.
 await page.reload();
 await basis.getByRole('button',{name:'최근 사업 단계',exact:true}).waitFor();
 assert.equal(await stage.getByText('이전 별도 단계 기록',{exact:true}).count(),0);
 assert.deepEqual(await readLegacy('TEST-20261016-A'),legacyBefore['TEST-20261016-A']);
 await page.locator('#project-select').selectOption('TEST-20261016-B');
 await basis.getByRole('button',{name:'최근 사업 단계',exact:true}).waitFor();
 assert.equal(await basis.getByRole('button',{name:/기본설계 검토|인허가 보완|사업성 재검토/}).count(),0);
 assert.deepEqual(await readLegacy('TEST-20261016-B'),legacyBefore['TEST-20261016-B']);
 await page.locator('#project-select').selectOption('TEST-20261016-C');
 await basis.getByRole('button',{name:'최근 사업 단계',exact:true}).waitFor();
 assert.equal(await upperFunding.innerText(),'6,405억원');
 assert.equal(await lowerFunding.innerText(),'6,405억원');
 assert.deepEqual(await readLegacy('TEST-20261016-C'),legacyBefore['TEST-20261016-C']);
 await page.locator('#project-select').selectOption('TEST-20261016-A');
 await basis.getByRole('button',{name:'최근 사업 단계',exact:true}).waitFor();
 assert.equal(await main.locator('.table-toolbar-left').getByText('대출현황',{exact:true}).count(),1);
 assert.deepEqual(await (await context.request.get(origin+'/api/workspace')).json(),workspace);
 assert.deepEqual(workspaceWrites,[]);

 allowWorkspaceWrite=true;
 const readWorkspace=async()=>await (await context.request.get(origin+'/api/workspace')).json();
 const projectA=record=>record.state.projects.find(project=>project.id==='TEST-20261016-A');
 async function saveForm(){
  const saved=page.waitForResponse(response=>response.url().endsWith('/api/workspace')&&response.request().method()==='PUT');
  await page.locator('#app-form').getByRole('button',{name:/^(저장|시점 저장)$/}).click();
  const response=await saved;
  assert.equal(response.ok(),true);
  await page.locator('#app-form').waitFor({state:'hidden'});
 }
 // Native stage creation must persist cost and financing together, leaving current ledgers unchanged.
 await page.goto(origin+'/?screen=cost-detail');
 await page.locator('[data-action="stage-open"]').click();
 await page.locator('#app-form [name="label"]').fill('중간 사업비 검토');
 await page.locator('#app-form [name="date"]').fill('2026-09-10');
 await page.getByRole('button',{name:'금액·면적 입력',exact:true}).click();
 await page.locator('#app-form [name="reportedTotal"]').fill('500000000000');
 await page.locator('#app-form [name="financeFunding"]').fill('280000000000');
 await page.locator('#app-form [name="financeSale"]').fill('0');
 await page.locator('#app-form [name="financeDuration"]').fill('60');
 await page.locator('#app-form [name="financePeriodEnd"]').fill('2029-09');
 await page.locator('#app-form [name="financeReason"]').fill('설계 조정과 대주 협의');
 await page.locator('#app-form [name="financeNote_funding"]').fill('당시 약정 계획 2800억원');
 await saveForm();
 const captured=await readWorkspace();
 const snapshot=projectA(captured).costStages.find(row=>row.label==='중간 사업비 검토');
 assert.ok(snapshot);
 assert.deepEqual(snapshot.financeContext,{funding:280000000000,sale:0,duration:60,periodEnd:'2029-09',reason:'설계 조정과 대주 협의',notes:{cost:'',funding:'당시 약정 계획 2800억원',construction:'',interest:''}});
 assert.deepEqual(projectA(captured).cbs,projectA(workspace).cbs);
 assert.deepEqual(projectA(captured).loans,projectA(workspace).loans);
 assert.equal(captured.revision,workspace.revision+1,'원가와 당시 조달 지표는 한 번에 저장해야 합니다');
 await page.goto(origin+'/?screen=finance');
 await basis.getByRole('button',{name:/중간 사업비 검토/}).click();
 await volume.getByRole('button',{name:'원가',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),'5,000억원');
 assert.deepEqual(await costComparison.locator('.studio-stage-values b').allTextContents(),[initialCost,'5,000억원']);
 assert.equal(await upperFunding.innerText(),'2,800억원');
 assert.equal(await lowerFunding.innerText(),'2,800억원');
 assert.equal(await structure.locator('.studio-capital-bar').isVisible(),false);
 assert.equal(await structure.locator('.studio-capital-groups article').count(),0);
 assert.match(await compare.locator('.studio-stage-facts').innerText(),/2029\.09/);
 assert.match(await compare.getByRole('heading',{name:'개발기간',exact:true}).locator('..').innerText(),/60개월/);
 await volume.getByRole('button',{name:'매각 목표',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),'0억원');
 await details.click();
 const selectedValue=label=>linkedTable.getByRole('row',{name:new RegExp('^'+label)}).locator('td[data-selected="true"]');
 assert.match(await selectedValue('원가').innerText(),/^5,000억원/m);
 assert.match(await selectedValue('총 조달규모').innerText(),/당시 약정 계획 2800억원/);
 assert.match(await selectedValue('증감 사유').innerText(),/설계 조정과 대주 협의/);
 await basis.getByRole('button',{name:'최근 사업 단계',exact:true}).click();
 await volume.getByRole('button',{name:'원가',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),currentCost);
 assert.deepEqual(await costComparison.locator('.studio-stage-values b').allTextContents(),[initialCost,currentCost],'LOCAL-UI-161: 현재도 최초UW와 비교');
 assert.equal(await costComparison.locator('.studio-stage-values > div').first().locator('span').first().innerText(),'최초 언더라이팅');
 // Original isolated fixture has no historical GFA: never borrow current GFA.
 assert.deepEqual(await costComparison.locator('.studio-stage-unit-cost').allTextContents(),['평당 —','2,671만원/평']);
 assert.equal(await selectedValue('원가').locator('small').first().innerText(),'+7.8억원');
 // LOCAL-UI-167 replaces the modal with editing in the comparison column.
 const currentEditor=stage.locator('[data-stage-inline-edit="current"]');
 await currentEditor.click();
 await stage.locator('[data-stage-input="name"]').fill('취소할 단계');
 await stage.locator('[data-stage-cancel]').click();
 assert.deepEqual(await readWorkspace(),captured);
 await currentEditor.click();
 await stage.locator('[data-stage-input="name"]').fill('본PF 1차');
 await stage.locator('[data-stage-input="date"]').fill('2024-01-01');
 await stage.locator('[data-stage-input="reason"]').fill('본PF 조건 합의');
 await stage.locator('[data-stage-commit]').click();
 await stage.locator('.studio-stage-error:not([hidden])').waitFor();
 assert.equal(await stage.locator('[data-stage-input="name"]').inputValue(),'본PF 1차');
 assert.deepEqual(await readWorkspace(),captured);
 await stage.locator('[data-stage-input="date"]').fill('2026-11-12');
 await stage.locator('[data-stage-note="funding"]').fill('본PF 대주 협의 반영');
 await stage.locator('[data-stage-commit]').click();
 await stage.locator('[data-stage-commit]').waitFor({state:'hidden'});
 await basis.getByRole('button',{name:/본PF 1차/}).waitFor();
 const renamed=await readWorkspace();
 assert.equal(projectA(renamed).financeCurrentStage.name,'본PF 1차');
 assert.deepEqual(projectA(renamed).costStages,projectA(captured).costStages);
 assert.deepEqual(projectA(renamed).cbs,projectA(captured).cbs);
 await page.reload();
 await basis.getByRole('button',{name:/본PF 1차/}).waitFor();
 await volume.getByRole('button',{name:'매각 목표',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),'—','기존 매각목표 누락을 정보 수정이 변경하지 않음');
 // Capture a distinct historical capital structure through the native stage form.
 // All edits use this test's temporary workspace; source commitments remain intact.
 await page.goto(origin+'/?screen=cost-detail');
 await page.locator('[data-action="stage-open"]').click();
 await page.locator('#app-form [name="label"]').fill('조달구성 확정');
 await page.locator('#app-form [name="date"]').fill(await page.evaluate(()=>App.today));
 await page.locator('#app-form [name="capture"]').selectOption('current');
 await page.getByRole('button',{name:'금액·면적 입력',exact:true}).click();
 await page.locator('#app-form [name="financeCapitalCount"]').waitFor({state:'attached'});
 const sourceIds=await page.locator('#app-form [name^="capitalId_"]').evaluateAll(nodes=>nodes.map(node=>({id:node.value,index:node.name.split('_')[1]})));
 assert.equal(sourceIds.length,4);
 const originalLoanId=projectA(workspace).loans[0].id;
 const capturedLoan=sourceIds.find(row=>row.id==='loan:'+originalLoanId);
 assert.ok(capturedLoan);
 await page.locator('#app-form [name="capitalParty_'+capturedLoan.index+'"]').fill('당시 브릿지 투자자');
 await page.locator('#app-form [name="capitalTranche_'+capturedLoan.index+'"]').fill('Bridge 당시');
 await page.locator('#app-form [name="capitalAmount_'+capturedLoan.index+'"]').fill('65000000000');
 await page.locator('#app-form [name="financeFunding"]').fill('280000000000');
 await page.locator('#app-form [name="financeReason"]').fill('당시 투자자별 조달 계획');
 await saveForm();
 const withCapital=await readWorkspace();
 const capitalSnapshot=projectA(withCapital).costStages.find(row=>row.label==='조달구성 확정');
 assert.equal(capitalSnapshot.financeContext.capitalSources.length,4);
 assert.equal(capitalSnapshot.financeContext.capitalSources.reduce((sum,row)=>sum+row.amount,0),280000000000);
 assert.deepEqual(projectA(withCapital).loans,projectA(workspace).loans);
 await page.goto(origin+'/?screen=finance');
 await basis.getByRole('button',{name:/조달구성 확정/}).click();
 assert.equal(await upperFunding.innerText(),'2,800억원');
 assert.equal(await lowerFunding.innerText(),'2,800억원');
 assert.equal(await bar.getByRole('button').count(),3);
 assert.match(await structure.locator('.studio-capital-groups').innerText(),/당시 브릿지 투자자/);
 assert.doesNotMatch(await structure.locator('.studio-capital-groups').innerText(),/A은행/);
 await main.getByRole('button',{name:'조달 내역 보기'}).click();
 const historicalCapital=page.getByRole('dialog',{name:'조달구성 확정 · 조달 내역'});
 await historicalCapital.waitFor();
 assert.match(await historicalCapital.innerText(),/당시 브릿지 투자자/);
 assert.match(await historicalCapital.innerText(),/650억원/);
 await page.keyboard.press('Escape');
 await basis.getByRole('button',{name:/본PF 1차/}).click();
 assert.equal(await upperFunding.innerText(),'3,050억원');
 assert.equal(await lowerFunding.innerText(),'3,050억원');
 assert.match(await structure.locator('.studio-capital-groups').innerText(),/A은행/);
 // The existing loan editor changes the live total only, never the captured financing context.
 await main.locator('[data-action="loan-detail"]').first().click();
 await page.getByRole('dialog').locator('[data-action="loan-edit"]').click();
 const loanForm=page.locator('#app-form');
 const oldCommitment=Number(await loanForm.locator('[name="commitment"]').inputValue());
 await loanForm.locator('[name="commitment"]').fill(String(oldCommitment+10000000000));
 await loanForm.locator('[name="note"]').fill('현재 약정 100억원 증액');
 await saveForm();
 if(await page.getByRole('dialog').count())await page.keyboard.press('Escape');
 await page.reload();
 assert.equal(await upperFunding.innerText(),'3,150억원');
 assert.equal(await lowerFunding.innerText(),'3,150억원');
 assert.equal(await linkedCost.locator('b').innerText(),currentCost);
 const loanChanged=await readWorkspace();
 assert.deepEqual(projectA(loanChanged).costStages,projectA(withCapital).costStages);
 await basis.getByRole('button',{name:/조달구성 확정/}).click();
 assert.equal(await upperFunding.innerText(),'2,800억원');
 assert.equal(await lowerFunding.innerText(),'2,800억원');
 assert.match(await structure.locator('.studio-capital-groups').innerText(),/당시 브릿지 투자자/);
 assert.match(await structure.locator('.studio-capital-groups').innerText(),/650억원/);
 await basis.getByRole('button',{name:/중간 사업비 검토/}).click();
 assert.equal(await upperFunding.innerText(),'2,800억원');
 assert.equal(await linkedCost.locator('b').innerText(),'5,000억원');
 assert.equal(await lowerFunding.innerText(),'2,800억원');
 assert.equal(await structure.locator('.studio-capital-bar').isVisible(),false);
 await page.locator('#project-select').selectOption('TEST-20261016-B');
 await basis.getByRole('button',{name:'최근 사업 단계',exact:true}).waitFor();
 assert.equal(await basis.getByRole('button',{name:/중간 사업비 검토|본PF 1차/}).count(),0);
 await page.locator('#project-select').selectOption('TEST-20261016-A');
 await basis.getByRole('button',{name:/본PF 1차/}).click();
 assert.equal(await upperFunding.innerText(),'3,150억원');
 // Simulated server refusal retains the inline column and persistent records.
 if(!await currentEditor.isVisible())await stage.locator('[data-stage-action=details]').click();
 await currentEditor.click();
 await stage.locator('[data-stage-input=name]').fill('저장 실패 단계');
 failWorkspaceWrite=true;
 const rejected=page.waitForResponse(response=>response.url().endsWith('/api/workspace')&&response.status()===503);
 await stage.locator('[data-stage-commit]').click();
 await rejected;
 await stage.locator('.studio-stage-error:not([hidden])').waitFor();
 assert.equal(await stage.locator('[data-stage-input=name]').inputValue(),'저장 실패 단계');
 assert.deepEqual(await readWorkspace(),loanChanged);
 failWorkspaceWrite=false;
 await stage.locator('[data-stage-cancel]').click();
 assert.equal(await basis.getByRole('button',{name:/저장 실패 단계/}).count(),0);

 await page.route('**/finance-overview.js',route=>route.fulfill({status:404,body:'missing'}));
 await page.reload();
 await main.locator('.table-toolbar-left').getByText('대출현황',{exact:true}).waitFor();
 assert.equal(await page.locator('#sidebar [data-view="finance"] svg').count(),1);
 assert.equal(await page.locator('#sidebar-project-select').count(),1);
 assert.equal(await page.locator('#sidebar-profile').isVisible(),true);
 for(const [id,records]of Object.entries(legacyBefore))assert.deepEqual(await readLegacy(id),records,'기존 UW 원천 기록은 native 저장 후에도 불변');
 assert.deepEqual(legacyWrites,[]);
 assert.deepEqual(await readFile(sourceFile),sourceBytes);
 assert.deepEqual(errors,[]);
 assert.deepEqual(external,[]);
 assert.deepEqual(workspaceWrites,Array(5).fill('/api/workspace'));
 console.log('LOCAL-UI-158 선택단계별 조달내역·합계·트랜치/투자자·과거불변 및 LOCAL-UI-155 단계별 전체지표·최초UW 고정 비교·평당 원가·현재조달 연동·취소/실패·프로젝트 격리 및 LOCAL-UI-169 별도기록 UI 제거·기존 API 불변·연면적 평/첫행·준공명칭·헤더바탕 확인');
}finally{
 if(browser)await browser.close();
 if(server?.listening)await new Promise(resolve=>server.close(resolve));
 await rm(directory,{recursive:true,force:true});
}
