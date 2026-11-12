import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {copyFile, mkdtemp, rm} from 'node:fs/promises';
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
 {name:'자기자본',total:0,people:[{name:'출자자',amount:0,role:undefined}]},
 {name:'Tr.A',total:600,people:[{name:'대주 A',amount:500,role:'선순위'},{name:'대주 B',amount:100,role:'선순위'}]},
 {name:'본PF · 후순위',total:null,people:[{name:'대주 C',amount:null,role:''}]},
]);

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const directory=await mkdtemp(join(tmpdir(),'igis-finance-browser-'));
let server,browser;
try{
 await copyFile(new URL('../.build/local-preview/original-workspace.json',import.meta.url),join(directory,'original-workspace.json'));
 server=await startPreview({port:0,directory});
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:950}});
 const page=await context.newPage();
 const errors=[],external=[],workspaceWrites=[];
 page.setDefaultTimeout(7500);
 page.on('pageerror',error=>errors.push(error.message));
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin&&!['data:','blob:'].includes(url.protocol)){
   external.push(url.hostname);return route.abort();
  }
  if(url.pathname==='/api/workspace'&&route.request().method()!=='GET'){
   workspaceWrites.push(url.pathname);return route.abort();
  }
  return route.continue();
 });
 await page.goto(origin+'/?screen=cost-overview');
 const costKpi=page.getByTestId('cost-kpi-row');
 const initialCost=await costKpi.locator('.cost-kpi-cell').filter({hasText:'언더라이팅 예산'}).locator('.cost-kpi-value').innerText();
 const currentCost=await costKpi.locator('.cost-kpi-cell').filter({hasText:'최종 예상사업비'}).locator('.cost-kpi-value').innerText();
 assert.equal(initialCost,'5,123억원');
 assert.notEqual(currentCost,'5,248억원');
 await page.goto(origin+'/?screen=finance');
 const workspace=await (await context.request.get(origin+'/api/workspace')).json();
 const main=page.locator('#content[data-local-screen="finance"]');
 const stage=main.locator('.studio-finance-stages');
 const structure=main.locator('.studio-capital');
 const options=stage.locator('[data-stage-id]');
 await options.nth(2).waitFor().catch(async error=>{
  console.error(await page.locator('#content').evaluate(el=>({screen:el.dataset.localScreen,text:el.innerText.slice(0,900)})),errors);
  throw error;
 });
 const linkedCost=stage.locator('.studio-stage-metrics > div').filter({hasText:'준공추정원가'});
 assert.equal(await linkedCost.locator('b').innerText(),currentCost);
 const compare=stage.locator('.studio-stage-comparison');
 const details=stage.getByRole('button',{name:'핵심 지표 보기'});
 const table=stage.getByRole('table',{name:'개발 단계별 핵심 지표 비교'});
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
 await volume.getByRole('button',{name:'원가',exact:true}).click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),currentCost);
 const costComparison=compare.getByRole('heading',{name:'원가',exact:true}).locator('..');
 assert.deepEqual(await costComparison.locator('.studio-stage-values b').allTextContents(),[initialCost,currentCost]);
 await details.click();
 assert.equal(await table.getByRole('columnheader').count(),4);
 assert.match(await table.getByRole('row',{name:/^공사비/}).innerText(),/교통 개선시설/);
 assert.match(await table.getByRole('row',{name:/^변경 사유·관련 이슈/}).innerText(),/교통영향평가 보완/);
 assert.equal(await table.locator('thead [data-selected="true"]').count(),1);
 assert.ok(await stage.evaluate(el=>el.closest('.dp-finance').textContent.indexOf('개발 단계별 핵심 지표')<el.closest('.dp-finance').textContent.indexOf('대출현황')));
 assert.equal(await stage.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(255, 255, 255)');
 await options.first().click();
 assert.equal(await stage.locator('[data-volume-value]').innerText(),currentCost);
 assert.equal(await table.getByRole('columnheader').count(),4);
 assert.equal(await table.getByRole('columnheader',{name:/최초 언더라이팅/}).getAttribute('data-selected'),'true');
 assert.equal(await linkedCost.locator('b').innerText(),currentCost);
 await stage.getByRole('button',{name:'핵심 지표 닫기'}).click();
 assert.equal(await table.isVisible(),false);
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
 await page.getByRole('dialog',{name:'자금구성'}).waitFor();
 await page.keyboard.press('Escape');

 const add=stage.getByRole('button',{name:'+ 단계 추가'});
 await add.click();
 let dialog=page.getByRole('dialog',{name:'개발 단계 추가'});
 await dialog.getByRole('textbox',{name:'단계명'}).fill('시공계획 변경');
 await dialog.locator('[name=date]').fill('2026-11-12');
 await dialog.getByRole('textbox',{name:'변경 사유·관련 이슈'}).fill('공사 일정 재검토');
 await dialog.getByRole('textbox',{name:'원가 (억원)',exact:true}).fill('0');
 await dialog.getByRole('textbox',{name:'공사비 (억원)',exact:true}).fill('3190.25');
 await dialog.getByRole('textbox',{name:'공사비 변경 사유',exact:true}).fill('기초 보강');
 await dialog.getByRole('button',{name:'저장',exact:true}).click();
 await dialog.waitFor({state:'hidden'});
 assert.equal(await linkedCost.locator('b').innerText(),currentCost);
 assert.match(await table.getByRole('row',{name:/^단계별 원가/}).locator('td[data-selected="true"]').innerText(),/^0억원$/m);
 assert.match(await table.getByRole('row',{name:/^공사비/}).innerText(),/3,190\.25억원.*기초 보강/s);
 await page.reload();
 await stage.getByRole('button',{name:/시공계획 변경/}).waitFor();
 await stage.getByRole('button',{name:'수정',exact:true}).click();
 dialog=page.getByRole('dialog',{name:'개발 단계 수정'});
 await dialog.getByRole('textbox',{name:'단계명'}).fill('저장하지 않을 이름');
 await page.keyboard.press('Escape');
 await dialog.waitFor({state:'hidden'});
 assert.equal(await stage.getByRole('button',{name:/저장하지 않을 이름/}).count(),0);
 assert.equal(await stage.getByRole('button',{name:'수정',exact:true}).evaluate(el=>el===document.activeElement),true);
 await stage.getByRole('button',{name:'수정',exact:true}).click();
 await dialog.getByRole('textbox',{name:'단계명'}).fill('시공계획 확정');
 await dialog.getByRole('button',{name:'저장',exact:true}).click();
 await dialog.waitFor({state:'hidden'});
 await stage.getByRole('button',{name:/시공계획 확정/}).waitFor();
 await page.locator('#project-select').selectOption('TEST-20261016-B');
 await stage.getByRole('button',{name:/사업성 재검토/}).waitFor();
 assert.equal(await stage.getByRole('button',{name:/시공계획 확정/}).count(),0);
 await page.locator('#project-select').selectOption('TEST-20261016-A');
 await stage.getByRole('button',{name:/시공계획 확정/}).waitFor();
 await stage.getByRole('button',{name:'삭제',exact:true}).click();
 dialog=page.getByRole('dialog',{name:'개발 단계 삭제'});
 await dialog.getByRole('button',{name:'삭제',exact:true}).click();
 await dialog.waitFor({state:'hidden'});
 assert.equal(await stage.getByRole('button',{name:/시공계획 확정/}).count(),0);
 assert.equal(await main.locator('.table-toolbar-left').getByText('대출현황',{exact:true}).count(),1);
 assert.deepEqual(await (await context.request.get(origin+'/api/workspace')).json(),workspace);
 await page.route('**/finance-overview.js',route=>route.fulfill({status:404,body:'missing'}));
 await page.reload();
 await main.locator('.table-toolbar-left').getByText('대출현황',{exact:true}).waitFor();
 assert.equal(await page.locator('#sidebar [data-view="finance"] svg').count(),1);
 assert.equal(await page.locator('#sidebar-project-select').count(),1);
 assert.equal(await page.locator('#sidebar-profile').isVisible(),true);
 assert.deepEqual(errors,[]);
 assert.deepEqual(external,[]);
 assert.deepEqual(workspaceWrites,[]);
 console.log('LOCAL-UI-154 실제 브라우저에서 단계 저장·취소·프로젝트 전환, 조달 막대, 파이낸싱 파일 장애 시 왼쪽 메뉴 보존 확인');
}finally{
 if(browser)await browser.close();
 if(server?.listening)await new Promise(resolve=>server.close(resolve));
 await rm(directory,{recursive:true,force:true});
}
