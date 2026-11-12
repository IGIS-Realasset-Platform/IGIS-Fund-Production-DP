// Optional browser regression for the local design screens. Never attaches to a
// running user workspace. Set PLAYWRIGHT_MODULE and CHROMIUM_EXECUTABLE if needed.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createSampleState} from './support/local-design-fixture.mjs';
import {startPreview} from '../scripts/local-preview/server.mjs';

const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir=await mkdtemp(join(tmpdir(),'local-design-screens-'));
let browser,server;
try {
 const sample=createSampleState();
 const fallingCosts=sample.projects[1].cbs;
 const land=fallingCosts.find(row=>row.costTypeId==='land_purchase');
 const direct=fallingCosts.find(row=>row.costTypeId==='direct_main');
 land.current=land.initial-100000000;
 direct.initial=0;
 direct.current=0;
 const [office]=sample.projects;
 const costAudit={projectId:office.id,entity:'cbs',idRef:office.cbs[0].id,action:'UPDATE',field:'current'};
 sample.auditEvents.push(
  {...costAudit,id:'local-audit-up',at:'2026-11-02T05:00:00Z',actor:'editor@example.test',before:120000001,after:130000001},
  {...costAudit,id:'local-audit-down',at:'2026-11-01T05:00:00Z',actor:'unknown@example.test',before:120000001,after:120000000,reason:'기록된 테스트 사유'}
 );
 await writeFile(join(dir,'access-screen-capture.json'),JSON.stringify({
  people:[['테스트 담당자','editor@example.test','테스트 조직','사용',[],[]]],projects:[office.name]
 }),{flag:'wx',mode:0o600});
 await writeFile(join(dir,'original-workspace.json'), JSON.stringify(sample), {flag:'wx',mode:0o600});
 server=await startPreview({port:0,directory:dir});
 const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined});
 const context=await browser.newContext({viewport:{width:1440,height:920}}),page=await context.newPage(),errors=[],leaks=[];
 page.setDefaultTimeout(5000);
 await context.route('**/*',r=>{
  const url=new URL(r.request().url());
  if(url.origin!==base&&!['data:','blob:'].includes(url.protocol)||r.request().method()==='PUT'){
   leaks.push(r.request().method()+' '+url.pathname);return r.abort();
  }
  return r.continue();
 });
 page.on('pageerror',err=>errors.push(err.message));
 const workspace=async()=> (await context.request.get(base+'/api/workspace')).json();
 const original=await workspace();
 const expectCursor=async(selector,expected)=>{
  const actual=await page.locator(selector).first().evaluate(el=>getComputedStyle(el).cursor);
  assert.equal(actual,expected,selector);
 };
 const expectTopRowPadding=async(table)=>{
  const values=await page.locator(table+' thead tr:first-child > *').evaluateAll(cells=>cells.map(cell=>getComputedStyle(cell).paddingTop));
  assert.deepEqual([...new Set(values)],['10px'],table);
 };
 const open=async(key,title)=>{
  await page.goto(base+'/?screen='+key);
  const main=page.locator('#content[data-local-screen="'+key+'"]');
  const heading=main.locator('.page-heading h1');
  await heading.waitFor();
  assert.equal(await heading.evaluate(element=>getComputedStyle(element).fontSize),'28px');
  if(key==='portfolio')assert.equal(await heading.innerText(),title);
  else {
   const chooser=main.getByRole('combobox',{name:'프로젝트 업무 메뉴'});
   assert.equal(await chooser.locator('option:checked').innerText(),title);
   assert.equal(await chooser.evaluate(element=>getComputedStyle(element).fontSize),'28px');
  }
  assert.equal(await page.locator('.studio-bar,#studio-tools').count(),0);
 };
 await open('portfolio','전체 프로젝트 현황');
 await page.getByRole('heading',{name:'프로젝트 목록',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'검색조건 초기화',exact:true}).count(),1);
 await page.getByRole('button',{name:'+ 프로젝트 추가',exact:true}).click();
 const registration=page.getByRole('dialog',{name:'프로젝트 등록'});
 assert.deepEqual(await registration.evaluate(dialog=>{
  const read=(selector,property)=>getComputedStyle(dialog.querySelector(selector))[property];
  return ['.dialog-head','.dialog-body','#app-form>.dialog-foot'].map(selector=>read(selector,'paddingLeft'))
   .concat(['.dp-registration-fields','.dp-registration-evidence>.form-grid'].map(selector=>read(selector,'columnGap')));
 }),['28px','28px','28px','24px','24px']);
 await registration.getByRole('button',{name:'취소',exact:true}).click();
 await registration.waitFor({state:'hidden'});
 const portfolioSurface=await page.evaluate(()=>{
  const list=document.querySelector('.pf-list-card'),chart=document.querySelector('[data-portfolio-chart]');
  const toolbar=list.querySelector('.table-toolbar'),wrap=list.querySelector('.table-wrap');
  const header=getComputedStyle(wrap.querySelector('th'),'::after'),row=getComputedStyle(wrap.querySelector('td'));
  const surface=getComputedStyle(wrap),chartRow=getComputedStyle(chart.querySelector('.portfolio-cost-row'));
  const rect=el=>el.getBoundingClientRect(),style=getComputedStyle(toolbar);
  return {headers:[list,chart].map(panel=>rect(panel.querySelector('.panel-header')).height),
   columnHeadingPadding:[...wrap.querySelectorAll('thead th')].map(cell=>[getComputedStyle(cell).paddingTop,getComputedStyle(cell).paddingBottom]),
   top:style.paddingTop,bottom:style.paddingBottom,tableGap:rect(wrap).top-rect(toolbar).bottom,
   perimeter:surface.borderWidth,toolbarDivider:style.borderBottomWidth,headingDivider:parseFloat(header.height)*new DOMMatrix(header.transform).d,rowDivider:row.borderBottomWidth,
   headingColor:header.backgroundColor,
   headingBackground:getComputedStyle(wrap.querySelector('th')).backgroundColor,
   sharedBackground:[surface,row].every(item=>item.backgroundColor===chartRow.backgroundColor)};
 });
 assert.deepEqual(portfolioSurface,{headers:[58,58],top:'10px',bottom:'10px',tableGap:0,
  columnHeadingPadding:Array.from({length:9},()=>['10px','8px']),
  perimeter:'0px',toolbarDivider:'0px',headingDivider:0.5,rowDivider:'1px',headingColor:'rgb(225, 228, 234)',
  headingBackground:'rgb(238, 240, 243)',sharedBackground:true});
 const costSubline=await page.locator('.portfolio-table td[data-pf-label="현재 사업비"] .cell-sub').first().evaluate(element=>{
  const style=getComputedStyle(element);
  const primary=getComputedStyle(element.previousElementSibling);
  return [style.fontSize,primary.fontSize,style.marginBlockStart,style.fontVariantNumeric,primary.fontVariantNumeric];
 });
 assert.deepEqual(costSubline,['12px','14px','-1px','proportional-nums','proportional-nums']);
 const titleOffsets=await page.evaluate(()=>{
  const left=selector=>document.querySelector(selector).getBoundingClientRect().left;
  return [left('.pf-list-card h2')-left('.pf-list-card .table-wrap'),
   left('[data-portfolio-chart] h2')-left('.portfolio-cost-list')];
 });
 assert.ok(titleOffsets.every(offset=>Math.abs(offset)<0.5),'portfolio titles align to the outside edges of their table and chart');
 const portfolioTextStarts=await page.evaluate(()=>{
  const selectors=['#portfolioSearch','.portfolio-table th:first-child','.portfolio-table td:first-child button',
   '.pf-cost-legend i','.portfolio-cost-row > .table-link'];
  return selectors.map(selector=>{
   const element=document.querySelector(selector),style=getComputedStyle(element);
   return element.getBoundingClientRect().left+parseFloat(style.paddingLeft)+parseFloat(style.borderLeftWidth);
  });
 });
 assert.ok(portfolioTextStarts.every(start=>Math.abs(start-portfolioTextStarts[0])<0.5),'portfolio text shares a left edge across the list and chart');
 await page.waitForFunction(()=>{
  const type=document.querySelector('.portfolio-table th[data-pf-label="사업유형"]');
  const start=type.getBoundingClientRect().left+parseFloat(getComputedStyle(type).paddingLeft);
  const marks=document.querySelectorAll('.portfolio-axis-ticks,.portfolio-cost-track');
  return marks.length>1&&[...marks].every(element=>Math.abs(element.getBoundingClientRect().left-start)<0.5);
 });
 assert.deepEqual(await page.locator('.pf-cost-legend > span').allTextContents(),['최초 언더라이팅','현재 사업비','상승','하락 (단위: 억원)']);
 assert.equal(await page.locator('.pf-cost-legend .pf-cost-unit').evaluate(el=>getComputedStyle(el).fontSize),'12px');
 const axisLabels=await page.locator('.portfolio-cost-axis').evaluate(axis=>{
  const rowTop=axis.nextElementSibling.firstElementChild.getBoundingClientRect().top;
  return [...axis.querySelectorAll('.portfolio-axis-ticks>span,:scope > .num')].map(label=>
   [getComputedStyle(label).fontSize,rowTop-label.getBoundingClientRect().bottom]);
 });
 assert.ok(axisLabels.length>2&&axisLabels.every(([size,gap])=>size==='13px'&&Math.abs(gap-5)<0.5));
 const gridlinesMatch=await page.locator('.portfolio-cost-list').evaluate(list=>{
  const axis=list.previousElementSibling.querySelector('.portfolio-axis-ticks');
  const ticks=[...axis.children],lines=[...list.querySelectorAll('.pf-cost-gridline')];
  const track=axis.getBoundingClientRect();
  return ticks.length>0&&lines.length===ticks.length&&lines.every((line,index)=>{
   const x=track.left+track.width*parseFloat(ticks[index].style.left)/100;
   return Math.abs(line.getBoundingClientRect().left-x)<0.5&&getComputedStyle(line).borderLeftStyle==='dashed';
  });
 });
 assert.ok(gridlinesMatch,'vertical guides use the visible axis tick positions');
 assert.deepEqual(await page.locator('.pf-cost-delta').allTextContents(),['+20억원','−1억원']);
 assert.deepEqual(await page.locator('.portfolio-current-marker').evaluateAll(marks=>marks.map(mark=>[mark.dataset.pfSymbol,getComputedStyle(mark,'::before').width])),[['increase','9px'],['decrease','9px']]);
 const chartProject=page.locator('.portfolio-cost-row>.table-link').first();
 await chartProject.hover();
 assert.equal(await chartProject.evaluate(link=>getComputedStyle(link).textDecorationLine),'none');
 await page.locator('.portfolio-cost-row .num').first().hover();
 await page.locator('#dp-chart-tooltip:visible').waitFor();
 const tipPosition=await page.evaluate(()=>{
  const tip=document.getElementById('dp-chart-tooltip').getBoundingClientRect();
  const track=document.querySelector('.portfolio-cost-track').getBoundingClientRect();
  return {leftOffset:tip.left-track.left,gap:track.top-tip.bottom};
 });
 assert.ok(Math.abs(tipPosition.leftOffset)<0.5&&Math.abs(tipPosition.gap-5)<0.5,'the whole chart row anchors the tooltip at the start of its track');
 const chartTip=page.getByRole('tooltip');
 assert.deepEqual(await chartTip.locator('dt').allTextContents(),['최초 언더라이팅','현재 사업비','평당 총사업비']);
 assert.equal(await chartTip.locator('dd').count(),3);
 assert.deepEqual(await chartTip.evaluate(el=>{
  const title=el.querySelector('.studio-tooltip-title'),details=el.querySelector('.studio-chart-tip-details');
  return [getComputedStyle(title).fontWeight,Math.round(details.getBoundingClientRect().top-title.getBoundingClientRect().bottom)];
 }),['700',0]);
 assert.deepEqual(await chartTip.evaluate(el=>{
  const style=getComputedStyle(el);
  return [style.backgroundColor,style.borderTopWidth,style.borderTopColor];
 }),['rgb(255, 255, 255)','4px','rgb(37, 57, 133)']);
 await page.keyboard.press('Escape');
 await chartTip.waitFor({state:'hidden'});
 assert.equal(await page.locator('[data-pf-summary]').count(),0);
 await page.setViewportSize({width:1920,height:920});
 const checkContentFrame=async()=>{
  const frame=await page.evaluate(()=>{
   const rect=selector=>document.querySelector(selector).getBoundingClientRect();
   const card=rect('#content > .panel');
   return {width:rect('#content').width,left:card.left-rect('#project-select').left,right:card.right-rect('.topbar-context-label').right};
  });
  assert.equal(frame.width,1280);
  assert.ok(Math.abs(frame.left)<0.5&&Math.abs(frame.right)<0.5,'header controls align to both card edges');
 };
 await checkContentFrame();
 await page.getByRole('button',{name:'메뉴 접기',exact:true}).click();
 const rail=page.locator('#sidebar');
 await rail.getByRole('button',{name:'메뉴 펼치기',exact:true}).waitFor();
 await page.waitForFunction(()=>document.getElementById('sidebar').getBoundingClientRect().width===56);
 assert.equal(await rail.locator('.nav-btn').count(),12);
 assert.equal(await rail.locator('[data-view="law"] + [data-view="feed"]').count(),1);
 const firstMenu=rail.getByRole('button',{name:'전체 프로젝트 현황',exact:true});
 await firstMenu.focus();
 const railTip=page.locator('.studio-rail-tooltip');
 await railTip.waitFor({state:'visible'});
 assert.equal(await railTip.innerText(),'전체 프로젝트 현황');
 assert.equal(await railTip.evaluate(el=>getComputedStyle(el).borderTopWidth),'4px');
 await page.keyboard.press('Escape');
 await railTip.waitFor({state:'hidden'});
 await checkContentFrame();
 await page.getByRole('button',{name:'메뉴 펼치기',exact:true}).click();
 await page.setViewportSize({width:1440,height:920});
 await expectCursor('#project-select','pointer');
 await expectCursor('#portfolioType','pointer');
 await expectCursor('#portfolioSearch','text');
 await expectCursor('.portfolio-table .table-resize-handle','col-resize');
 const select=page.locator('#project-select');
 await select.focus();
 assert.equal(await select.evaluate(el=>getComputedStyle(el).boxShadow),'rgb(37, 57, 133) 0px 0px 0px 4px inset');
 await page.locator('#portfolioSearch').focus();
 assert.equal(await select.evaluate(el=>getComputedStyle(el).boxShadow),'none');
 assert.equal(await page.locator('#portfolioSearch').evaluate(el=>getComputedStyle(el).boxShadow),'rgb(37, 57, 133) 0px 0px 0px 4px inset');
 await page.locator('#portfolioSearch').fill('잔솔');
 await page.waitForFunction(()=>document.querySelectorAll('.portfolio-table tbody tr').length===1);
 assert.ok((await page.locator('.portfolio-table tbody').innerText()).includes('잔솔'));
 await open('cost-overview','원가 관리');
 const costLayout=await page.locator('#content').evaluate(root=>{
  const rect=selector=>root.querySelector(selector).getBoundingClientRect();
  const nav=rect('.subtabs'),active=rect('.subtabs .active');
  const kpi=rect('.cost-kpi-row'),drivers=rect('.cost-driver-panel');
  const waterfall=rect('.cost-left-stack > .panel:first-child');
  const execution=rect('.cost-left-stack > .panel:last-child');
  const composition=rect('.cost-composition-panel');
  return {edges:[nav.left-kpi.left,nav.right-kpi.right,nav.bottom-active.bottom,execution.bottom-composition.bottom],
   gaps:[kpi.top-nav.bottom,drivers.top-kpi.bottom,waterfall.top-drivers.bottom,execution.top-waterfall.bottom],
   metrics:[...root.querySelectorAll('.studio-execution-metrics > div')].map(item=>({
    label:item.querySelector('dt').textContent,value:item.querySelector('dd').textContent,
    padding:getComputedStyle(item).paddingInlineStart})),
   metricGap:getComputedStyle(root.querySelector('.studio-execution-metrics')).gap,
   activeLine:getComputedStyle(root.querySelector('.subtabs .active')).borderBottomWidth};
 });
 assert.ok(costLayout.edges.every(offset=>Math.abs(offset)<0.5));
 assert.deepEqual(costLayout.gaps.map(Math.round),[12,18,18,18]);
 assert.equal(costLayout.activeLine,'4px');
 assert.deepEqual(costLayout.metrics.map(item=>item.label),['계약금액','기성금액','지급금액','미지급금']);
 assert.ok(costLayout.metrics.every(item=>item.padding==='11px'));
 assert.equal(costLayout.metricGap,'18px');
 assert.deepEqual(costLayout.metrics.slice(2).map(item=>item.value),['자료 미확보','자료 미확보']);
 await page.getByRole('button',{name:'증감요인 전체 보기'}).click();
 await page.getByRole('heading',{name:'원가 증감요인',exact:true}).waitFor();
 await page.keyboard.press('Escape');
 await page.locator('#app-dialog').waitFor({state:'hidden'});
 const costSegment=page.locator('.cbs-stack-bar [data-action="cbs-group-details"]').first();
 await costSegment.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await costSegment.hover();
 await chartTip.waitFor({state:'visible'});
 assert.deepEqual(await chartTip.locator('dt').allTextContents(),['금액','사업비 구성비','연면적 기준']);
 assert.deepEqual(await chartTip.evaluate(el=>{
  const style=getComputedStyle(el);
  return [style.backgroundColor,style.borderTopWidth,style.borderTopColor,style.borderTopLeftRadius];
 }),['rgb(255, 255, 255)','4px','rgb(37, 57, 133)','12px']);
 const barBounds=await costSegment.boundingBox(),tipBounds=await chartTip.boundingBox();
 const pointer=await chartTip.evaluate(el=>({side:el.dataset.pointer,
  x:el.getBoundingClientRect().left+el.clientLeft+parseFloat(getComputedStyle(el,'::after').left)}));
 assert.equal(pointer.side,'bottom');
 assert.ok(Math.abs(barBounds.y-tipBounds.y-tipBounds.height-5)<0.5);
 assert.ok(Math.abs(pointer.x-barBounds.x-barBounds.width/2)<0.5);
 await page.getByRole('heading',{name:'사업비·자금조달 구조',exact:true}).hover();
 await chartTip.waitFor({state:'hidden'});
 const fundingLegend=page.locator('.cbs-stack-legend [data-action="cbs-funding-details"]').first();
 await fundingLegend.focus();
 await chartTip.waitFor({state:'visible'});
 assert.deepEqual(await chartTip.locator('dt').allTextContents(),['금액','실제 조달 구성비','연면적 기준']);
 await page.keyboard.press('Escape');
 await chartTip.waitFor({state:'hidden'});
 await open('cost-detail','원가 관리');
 await expectTopRowPadding('.cost-dense-table');
 await page.locator('[data-action="cbs-catalog-open"]').click();
 await expectTopRowPadding('#app-dialog .cbs-catalog-table');
 await page.keyboard.press('Escape');
 await page.locator('#app-dialog').waitFor({state:'hidden'});
 const sideProject=rail.getByRole('combobox',{name:'왼쪽 프로젝트 선택',exact:true});
 const topProject=page.getByRole('combobox',{name:'프로젝트',exact:true});
 const initialProject=await topProject.inputValue();
 await sideProject.selectOption('LOCAL-HOUSING');
 assert.equal(await topProject.inputValue(),'LOCAL-HOUSING');
 assert.equal(await page.locator('#content .subtabs .active').innerText(),'세부 사업비');
 await topProject.selectOption(initialProject);
 assert.equal(await sideProject.inputValue(),initialProject);
 assert.equal(await page.locator('#content .subtabs .active').innerText(),'세부 사업비');
 await sideProject.selectOption('LOCAL-HOUSING');
 await expectCursor('.cost-drag-handle','grab');
 await page.locator('[data-testid="cost-total"] .ld-cost-note').first().waitFor();
 await page.locator('#costSearch').fill('일치하지 않는 샘플 이름');
 await page.locator('.ld-cost-search-empty').waitFor();
 await firstMenu.click();
 await sideProject.selectOption(initialProject);
 assert.equal(await rail.locator('.nav-btn.active').getAttribute('data-view'),'overview');
 assert.equal(await topProject.inputValue(),initialProject);
 const overview=page.locator('#content[data-local-screen="overview"]');
 const overviewSummary=overview.locator('.studio-overview-basic > summary');
 const overviewEdit=overview.getByRole('button',{name:'사업개요 수정',exact:true});
 await overviewEdit.waitFor();
 const overviewLayout=await overview.evaluate(content=>{
  const rect=selector=>content.querySelector(selector).getBoundingClientRect();
  const facts=content.querySelector('.dp-project-facts');
  const list=content.querySelector('.studio-overview-permits');
  return {
   headingGap:getComputedStyle(content.querySelector('.project-context')).marginBlockEnd,
   metaAlign:getComputedStyle(content.querySelector('.page-heading .meta')).textAlign,
   metaRight:rect('.page-heading .meta').right-rect('.project-context').right,
   metaBaseline:getComputedStyle(content.querySelector('.page-heading')).alignItems,
   titleHeight:rect('.studio-overview-basic > summary').height,
   editOffset:rect('.studio-overview-basic > [data-action="overview-basic-edit"]').right-rect('.dp-project-facts').right,
   table:getComputedStyle(facts).backgroundColor,
   factColors:['dt','dd'].map(tag=>[...new Set([...facts.querySelectorAll(tag)].map(cell=>getComputedStyle(cell).backgroundColor))]),
   factPadding:[...facts.children].slice(0,6).map(cell=>getComputedStyle(cell).paddingTop),
   cardLinks:[...content.querySelectorAll('.panel-header>.inline>.btn.text[data-action="go"]')].map(link=>{
    const body=link.closest('.panel').querySelector(':scope>.panel-body');
    const style=getComputedStyle(link);
    const textEnd=link.getBoundingClientRect().right-parseFloat(style.paddingRight)-parseFloat(style.borderRightWidth);
    return body.getBoundingClientRect().right-parseFloat(getComputedStyle(body).paddingRight)-textEnd;
   }),
   pair:[...content.querySelectorAll('.dp-overview-row > .panel')].map(card=>card.getBoundingClientRect().height),
   permits:[list.childElementCount,list.scrollHeight-list.clientHeight]
  };
 });
 assert.equal(overviewLayout.headingGap,'12px');
 assert.equal(overviewLayout.metaAlign,'right');
 assert.ok(Math.abs(overviewLayout.metaRight)<0.5);
 assert.equal(overviewLayout.metaBaseline,'last baseline');
 assert.equal(overviewLayout.titleHeight,58);
 assert.ok(Math.abs(overviewLayout.editOffset)<0.5);
 assert.equal(overviewLayout.table,'rgb(246, 247, 249)');
 assert.deepEqual(overviewLayout.factColors,[['rgb(246, 247, 249)'],['rgb(250, 250, 251)']]);
 assert.deepEqual(overviewLayout.factPadding,['10px','10px','10px','10px','8px','8px']);
 assert.equal(overviewLayout.cardLinks.length,4);
 assert.ok(overviewLayout.cardLinks.every(offset=>Math.abs(offset)<0.5));
 const issueCard=overview.locator('.panel').filter({has:page.getByRole('heading',{name:'주요 현안 관리',exact:true})});
 assert.equal(await issueCard.getByRole('button',{name:'+ 현안 등록',exact:true}).count(),1);
 assert.equal(await issueCard.evaluate(card=>{
  const top=card.querySelector('.table-wrap').getBoundingClientRect().top;
  return top-card.querySelector('.panel-header').getBoundingClientRect().bottom;
 }),18);
 assert.equal(overviewLayout.pair.length,2);
 assert.equal(overviewLayout.pair[0],overviewLayout.pair[1]);
 assert.deepEqual(overviewLayout.permits,[1,0]);
 await overviewSummary.press('Enter');
 await overviewEdit.waitFor({state:'hidden'});
 await overviewSummary.press('Enter');
 await overviewEdit.waitFor();
 const checkHistory=async scope=>{
  const table=scope.locator('.dp-cost-history-table');
  assert.equal(await table.locator('.cell-sub').count(),0);
  assert.match(await table.locator('td.increase').innerText(),/^▲ /);
  assert.match(await table.locator('td.decrease').innerText(),/^▼ /);
  assert.equal(await table.getByText('현재 사업비 조정',{exact:true}).count(),1);
  assert.equal(await table.getByText('기록된 테스트 사유',{exact:true}).count(),1);
  const actor=table.getByText('테스트 담당자',{exact:true});
  await actor.waitFor();
  await actor.focus();
  assert.equal(await page.getByRole('tooltip').innerText(),'editor@example.test');
  assert.equal(await table.getByText('이름 미확인',{exact:true}).count(),1);
  assert.ok(await table.locator('[data-tip="120,000,001원"]').count());
  assert.equal(await table.locator('thead th').nth(5).innerText(),'일자');
  const day=table.locator('td:nth-child(6)').first();
  assert.equal(await day.innerText(),'2026-11-02');
  assert.equal(await day.locator('[data-tip]').getAttribute('data-tip'),'2026-11-02 14:00');
 };
 await checkHistory(overview);
 await overview.getByRole('button',{name:'전체 이력',exact:true}).click();
 const fullHistory=page.getByRole('dialog',{name:'전체 원가 변경이력'});
 await checkHistory(fullHistory);
 await page.keyboard.press('Escape');
 await fullHistory.waitFor({state:'hidden'});
 await firstMenu.click();
 await topProject.selectOption('LOCAL-HOUSING');
 assert.equal(await rail.locator('.nav-btn.active').getAttribute('data-view'),'portfolio');
 assert.equal(await sideProject.inputValue(),'LOCAL-HOUSING');
 await open('permits','인허가·사업관리');
 await page.getByRole('combobox',{name:'프로젝트',exact:true}).selectOption('LOCAL-HOUSING');
 await expectTopRowPadding('.permit-core-table');
 // LOCAL-UI-09: the redundant banner is gone; original table details remain.
 assert.equal(await page.locator('.lp-permit-focus').count(),0);
 await page.locator('.permit-core-table [data-action="permit-record-detail"]').first().click();
 await page.locator('#app-dialog[open]').waitFor();await page.keyboard.press('Escape');
 await page.locator('[data-action="permit-layout"][data-layout="map"]').click();
 await expectTopRowPadding('.permit-map-table');
 await page.locator('[data-action="permit-layout"][data-layout="list"]').click();
 await page.locator('.lp-dates').first().waitFor();
 if(await page.evaluate(()=>CSS.supports('appearance:base-select'))){
  await page.getByRole('button',{name:'+ 직접 입력',exact:true}).click();
  const dialog=page.locator('#app-dialog[open]');
  const field=dialog.locator('select:enabled').first();
  await field.click();
  await dialog.locator('select:open').waitFor();
  await page.keyboard.press('Escape');
  await dialog.locator('select:open').waitFor({state:'hidden'});
  assert.equal(await dialog.count(),1,'Escape closes the select before the dialog');
  await page.keyboard.press('Escape');
  await dialog.waitFor({state:'hidden'});
 }
 await rail.locator('.nav-btn[data-view="spec"]').click();
 await page.getByRole('button',{name:'SDD',exact:true}).click();
 assert.match(await page.locator('pre.spec-json').first().evaluate(el=>getComputedStyle(el).fontFamily),/^Inter,/);
 await page.getByRole('button',{name:'전체 JSON',exact:true}).click();
 assert.match(await page.locator('textarea.spec-json').evaluate(el=>getComputedStyle(el).fontFamily),/^Inter,/);
 await rail.locator('.nav-btn[data-view="report"]').click();
 await page.locator('[data-action="report-editor-toggle"]').click();
 for(const selector of ['.report-edit-page-counter','.report-edit-page .official-form-table .cell-editable']){
  assert.match(await page.locator(selector).first().evaluate(el=>getComputedStyle(el).fontFamily),/^Inter,/);
 }
 await page.getByRole('button',{name:'설립일 수정',exact:true}).first().click();
 const reportDate=page.locator('.report-edit-page input[type="date"].cell-edit-input');
 assert.match(await reportDate.evaluate(el=>getComputedStyle(el).fontFamily),/^Inter,/);
 await page.locator('.report-popup-cell').getByRole('button',{name:'취소',exact:true}).click();
 await reportDate.waitFor({state:'hidden'});
 assert.ok(await page.evaluate(async()=>{
  await document.fonts.ready;
  return [...document.fonts].some(font=>font.family==='Inter'&&font.status==='loaded');
 }));
 await page.emulateMedia({media:'print'});
 assert.match(await page.locator('.report-edit-page .official-form-table').first().evaluate(el=>getComputedStyle(el).fontFamily),/^Pretendard,/);
 await page.emulateMedia({media:'screen'});
 await page.setViewportSize({width:390,height:844});
 await open('cost-detail','원가 관리');
 await page.getByRole('button',{name:'원가현황',exact:true}).click();
 await page.locator('#content[data-local-screen="cost-overview"] .studio-execution-metrics').waitFor();
 assert.deepEqual(await workspace(),original);
 assert.deepEqual(errors,[]);assert.deepEqual(leaks,[]);
 console.log('PASS: local screens, overview layout, mobile navigation, search and detail, no workspace writes');
} finally {
 await browser?.close();
 if(server)await new Promise(resolve=>server.close(resolve));
 await rm(dir,{recursive:true,force:true});
}
