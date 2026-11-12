// Install a local presentation layer. Use the normal app
// routes and actions; no project objects, saved settings or edit fields are written.
import {decoratePortfolio,formatDisplayDates,positionLocalTooltip,registerChartTooltip} from './portfolio.js';
import {decorateCostDetail} from './cost-detail.js';
import {decoratePermits} from './permits.js';

const screens={
 'portfolio':{view:'portfolio',tab:'',title:'전체 프로젝트 현황',decorate:decoratePortfolio},
 'overview':{view:'overview',tab:'',decorate:decorateOverview},
 'cost-overview':{view:'cost',tab:'overview',decorate:decorateCostOverview},
 'cost-detail':{view:'cost',tab:'detail',decorate:decorateCostDetail},
 'cost-benchmark':{view:'cost',tab:'benchmark',decorate:decorateCostBenchmark},
 'permits':{view:'permit',tab:'permits',decorate:decoratePermits},
 'finance':{view:'finance',tab:'loans',decorate:decorateFinanceScreen},
 'feed':{view:'feed',tab:'',title:'논의·협업 Feed',decorate:()=>{}},
};
const content=document.getElementById('content');
const mainScroll=document.querySelector('.main-scroll');
function decorateFinanceScreen(app,container,project){
 const panel=container.querySelector('.dp-finance');
 if(!panel)return;
 import('./finance-overview.js').then(({decorateFinancing})=>{
  if(panel.isConnected)decorateFinancing(app,container,project);
 }).catch(error=>console.warn('파이낸싱 보조 화면을 불러오지 못했습니다.',error));
}
App.localPreviewLoanEditing=true;
App.costPaymentOverview=project=>project.asOf&&project.asOf>App.today?project.asOf:App.today;
App.on('studio-contract-amounts',()=>{
 const project=App.current();
 if(!project)return;
 const asOf=App.costPaymentOverview(project);
 const {amount,records}=App.contracts.contractAmountSources(project,asOf);
 const included=records.filter(row=>row.amount!==0);
 const costNames=new Map((project.cbs||[]).map(row=>[row.id,row.name]));
 const originalCosts=new Map((project.costs||[]).map(row=>[row.id,row]));
 const won=value=>value.toLocaleString('ko-KR')+'원';
 const rows=included.map(row=>{
  const original=originalCosts.get(row.opening?.sourceCostId);
  const importedSource=original?.contract===row.amount?original.source:null;
  return [
   App.esc(original?.name||row.opening?.sourceName||costNames.get(row.cbsId)||'원가항목 미확인'),
   App.esc(won(row.amount)),
   App.esc(row.opening?(importedSource||row.opening.source||'이관 자료'):'계약 원장 · '+row.contract.name),
   App.esc(row.asOf||'미확인'),
  ];
 });
 const dates=[...new Set(included.filter(row=>row.opening).map(row=>row.asOf||'미확인'))];
 const total='<p><strong>계약금액 '+App.esc(amount==null?'미확인':won(amount))+'</strong> · '+included.length+'건'+
  (dates.length===1?' · 이관 기준일 '+App.esc(dates[0]):'')+'</p>';
 const openingOnly=included.length>0&&included.every(row=>row.opening);
 const contract=project.id==='TEST-20261016-A'&&openingOnly
  ? (project.contracts||[]).find(row=>row.id==='9r0zksn4'&&!row.deletedAt&&row.status==='체결')
  : null;
 const referenceTotal=contract&&App.contracts.revisionAt(contract,asOf)?.total;
 const note=Number.isFinite(referenceTotal)?'<p>원장 참고 · '+App.esc(contract.name)+' '+App.esc(won(referenceTotal))+' · 이관 합계와 별도 표시</p>':'';
 App.modal('계약금액 산출 근거',total+note+App.table(['원가항목','계약금액 (원)','출처','이관 기준일 / 계약일'],rows));
});
App.on('studio-payment-list',()=>{
 const project=App.current();
 if(project)showPaymentList(project.id);
});
App.on('studio-payment-contract',button=>{
 const project=App.current();
 if(!project||button.dataset.projectId!==project.id)return;
 App.contracts.showContract(button.dataset.id,{tab:'payment',returnTo:()=>showPaymentList(project.id)});
});

function showPaymentList(projectId){
 const project=App.current();
 if(!project||project.id!==projectId){App.closeModal({userInitiated:true});return;}
 const active=rows=>(rows||[]).filter(row=>!row.deletedAt);
 const contracts=active(project.contracts).filter(contract=>App.contracts.latest(contract));
 const count=contract=>active(contract.payments).length;
 contracts.sort((a,b)=>count(b)-count(a));
 const rows=contracts.map(contract=>[
  App.btn(contract.name,'studio-payment-contract',{id:contract.id,projectId},'text'),
  App.esc(contract.counterparty||'—'),
  count(contract)+'건',
 ]);
 const asOf=App.costPaymentOverview(project);
 const explanation='<p class="studio-payment-period">원가현황 반영 기준일 '+App.esc(asOf)+
  ' · 이관 기준일까지의 지급은 기초 누계에 포함됩니다.</p>';
 const footer=App.canEditProject(projectId)?App.btn('계약 추가','contract-add'):'';
 App.modal('계약별 지급 내역',explanation+App.table(['계약','상대방','지급 기록'],rows),footer);
}
let feedHost;
// Keep the board mounted during shell-only renders, including sidebar motion.
App.register('feed',()=>'');
function syncFeed() {
 const open=App.ui.view==='feed';
 const url=new URL(location.href);
 let leftFeed=false;
 if(open){
  url.searchParams.set('screen','feed');
  if(!feedHost&&mainScroll){
   feedHost=document.createElement('div');
   feedHost.className='content studio-feed-host';
   const frame=document.createElement('iframe');
   frame.title=screens.feed.title;
   frame.src=new URL('./work-feed/',import.meta.url);
   feedHost.append(frame);
   mainScroll.append(feedHost);
  }
  const frame=feedHost?.querySelector('iframe');
  if(frame){
   const options=document.getElementById('project-select')?.options||[];
   const projects=JSON.stringify(Array.from(options,option=>[option.value,option.text]));
   if(frame.dataset.feedProjects!==projects)frame.dataset.feedProjects=projects;
  }
 }else if(url.searchParams.get('screen')==='feed'&&feedHost){
  leftFeed=true;
  for(const key of ['screen','logId','commentId'])url.searchParams.delete(key);
 }
 if(feedHost)feedHost.hidden=!open;
 if(url.href!==location.href)window.history.replaceState(window.history.state,'',url);
 if(leftFeed)feedHost.querySelector('iframe')?.contentWindow?.dispatchEvent(new PopStateEvent('popstate'));
}
if(mainScroll){
 const syncScrollbarGutter=()=>{
  const gutter=mainScroll.offsetWidth-mainScroll.clientWidth;
  mainScroll.parentElement.style.setProperty('--studio-scrollbar-gutter',`${gutter}px`);
 };
 syncScrollbarGutter();
 if(typeof ResizeObserver==='function')new ResizeObserver(syncScrollbarGutter).observe(mainScroll);
}
// Read-only tables from the C106 access screen (a7abe01, src/admin-settings.js).
const accessTabs=[['people','회원별'],['organizations','조직별'],['projects','프로젝트 담당']];
let accessCapture,accessLoading;
function loadAccessCapture(){
 accessLoading??=fetch('/api/local-access-preview').then(response=>response.ok?response.json():null).catch(()=>null).then(data=>{
  accessCapture=data;
  if(App.ui.view==='settings')App.render();
  for(const label of document.querySelectorAll('.studio-history-actor'))label.textContent=historyActorName(label.dataset.tip);
 });
}
App.tabContracts.settings=accessTabs.map(([key])=>key);
App.register('settings',()=>{
 const nav=App.tabs('settings',accessTabs);
 if(accessCapture===undefined){
  loadAccessCapture();
  return nav+App.empty('권한 목록을 불러오는 중입니다.');
 }
 if(!accessCapture)return nav+App.empty('권한 관리 화면의 로컬 자료를 확인할 수 없습니다.');
 const {people,projects}=accessCapture;
 const tab=App.ui.tabs.settings||'people';
 const list=items=>items.length?`<div class="admin-project-list">${items.map(item=>`<span>${App.esc(item)}</span>`).join('')}</div>`:'없음';
 let panel;
 if(tab==='people'){
  const rows=people.map(([name,email,organization,status,roles,notifications])=>[
   ...[name,email,organization,status].map(App.esc),
   '<strong class="admin-account-role">관리자</strong>'+list(roles),list(notifications),
  ]);
  panel=App.panel('회원별 권한',App.table(['이름','이메일','소속 조직','사용','현재 권한','알림 프로젝트'],rows),'<button class="btn" type="button" disabled>+ 회원 추가</button>');
 }else if(tab==='organizations'){
  const counts=new Map();
  for(const [,,organization] of people)counts.set(organization,(counts.get(organization)||0)+1);
  panel=App.panel('조직별 공통 권한',App.table(['조직명','조직장','구성원','공통 프로젝트 권한','알림 범위'],[...counts].map(([name,count])=>[App.esc(name),'—',`${count}명`,'—','—'])));
 }else{
  panel=App.panel('프로젝트 담당',App.table(['프로젝트','담당자','책임자','개발솔루션센터','기획추진센터'],projects.map(name=>[App.esc(name),'—','—','—','—'])));
 }
 const scope=tab==='people'?'첨부 화면 기준 · 읽기 전용':'첨부 화면 기준 · — 표시는 미확인';
 return `${nav}<div class="admin-settings"><p class="local-access-scope">${scope}</p>${panel}</div>`;
});

function historyActorName(email){
 const address=email.toLowerCase();
 if(address==='reviewer@example.invalid')return '샘플 검토자';
 return accessCapture?.people?.find(([,memberEmail])=>memberEmail?.toLowerCase()===address)?.[0]||'이름 미확인';
}

function historyTooltip(cell,text){
 const label=document.createElement('span');
 label.dataset.tip=text;
 label.tabIndex=0;
 label.append(...cell.childNodes);
 cell.append(label);
 return label;
}

function historyReason(field,direction,value){
 if(direction)return field&&field!=='추가 정보'?field+' 조정':'금액 조정';
 if(field==='예산 상태')return value==='active'?'예산 항목 활성화':'예산 상태 변경';
 if(field==='추가 정보')return '항목 정보 갱신';
 return field||'사유 미기록';
}

const renderCostHistory=App.auditPresentation?.renderCostHistory;
if(renderCostHistory)App.auditPresentation.renderCostHistory=(events,options)=>{
 const template=document.createElement('template');
 template.innerHTML=renderCostHistory(events,{...options,compact:true});
 const dateHeading=template.content.querySelector('.dp-cost-history-table thead th:nth-child(6)');
 if(dateHeading){
  dateHeading.firstChild.textContent='일자';
  dateHeading.querySelector('.table-resize-handle')?.setAttribute('aria-label','일자 열 너비 조절');
 }
 for(const row of template.content.querySelectorAll('.dp-cost-history-table tbody tr')){
  if(row.cells.length!==7)continue;
  const [item,before,after,delta,reason,date,actor]=row.cells;
  const field=item.querySelector('.cell-sub')?.textContent.trim();
  const change=delta.textContent.trim().match(/^(증가|감소) (.+)$/);
  for(const cell of [item,before,after,reason]){
   const notes=[...cell.querySelectorAll('.cell-sub')];
   const tip=notes.map(note=>note.textContent.trim());
   for(const note of notes)note.remove();
   if(cell===reason&&cell.textContent.trim()==='—'){
    cell.textContent=historyReason(field,change,after.textContent.trim());
    if(cell.textContent!=='사유 미기록')tip.unshift('기록된 사유가 없어 변경 유형을 표시합니다.');
   }
   if(tip.length)historyTooltip(cell,tip.join('\n'));
  }
  if(change){
   const increase=change[1]==='증가';
   const symbol=document.createElement('span');
   symbol.setAttribute('role','img');
   symbol.setAttribute('aria-label',change[1]);
   symbol.textContent=increase?'▲':'▼';
   delta.classList.add(increase?'increase':'decrease');
   delta.replaceChildren(symbol,' '+change[2]);
  }
  const timestamp=date.textContent.trim();
  const day=timestamp.match(/^(\d{4}-\d{2}-\d{2})[ T]\d{2}:\d{2}/)?.[1];
  if(day){
   date.textContent=day;
   historyTooltip(date,timestamp);
  }
  const email=actor.textContent.trim();
  if(/^[^@\s]+@[^@\s]+$/.test(email)){
   actor.textContent=historyActorName(email);
   historyTooltip(actor,email).className='studio-history-actor';
   if(accessCapture===undefined&&email.toLowerCase()!=='reviewer@example.invalid')loadAccessCapture();
  }
 }
 return template.innerHTML;
};

const lastUpdate='Last Update 2026.11.10';
App.topbarContext=()=>({prefix:'',date:'',label:lastUpdate});
const stamp=document.querySelector('.topbar-context-label');
if(stamp)stamp.textContent=lastUpdate;

let lastHeader=null;
const requestedKey=new URL(location.href).searchParams.get('screen');
const linkedPage=Object.hasOwn(screens,requestedKey)?screens[requestedKey]:null;
let initialPage=history.state?.studioPage||linkedPage;

function rememberPage(){
 const {view,tabs,projectId}=App.ui;
 const tab=tabs[view]||'';
 const previous=history.state?.studioPage;
 if(previous?.view===view&&previous.tab===tab&&previous.projectId===projectId)return;
 history.replaceState({...history.state,studioPage:{view,tab,projectId}},'');
}

function restorePage(page){
 const available=[...document.querySelectorAll('#sidebar .nav-btn')].some(button=>button.dataset.view===page.view);
 if(!available)return false;
 const tab=App.tabContracts[page.view]?.includes(page.tab)?page.tab:'';
 const projectId=App.state.projects.some(project=>project.id===page.projectId)?page.projectId:'';
 // Direct links retain mobile sidebar behavior. Reloads retain the sidebar setting.
 return App.go(page.view,tab,projectId,{fromSidebar:page===linkedPage});
}
const navSymbols={
 project:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h1m4 0h1m-6 4h1m4 0h1m-5 9v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4"/>',
 portfolio:'<path class="nav-icon-fill" d="m3.5 10.5 7.2-6.1a2 2 0 0 1 2.6 0l7.2 6.1H19V18a2 2 0 0 1-2 2h-2.8v-4a2.2 2.2 0 0 0-4.4 0v4H7a2 2 0 0 1-2-2v-7.5Z"/>',
 overview:'<circle cx="12" cy="12" r="8.5"/><path class="nav-icon-fill" d="m15.8 8.2-2.1 5.5-5.5 2.1 2.1-5.5 5.5-2.1Z"/>',
 cost:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8.5 8h7m-7 4h1m5 0h1m-7 4.5h1m5 0h1"/>',
 finance:'<path d="M20 10V8.5A2.5 2.5 0 0 0 17.5 6H6a2.5 2.5 0 0 0 0 5h11.5m-14-2.5v8A2.5 2.5 0 0 0 6 19h11.5a2.5 2.5 0 0 0 2.5-2.5V16"/><path class="nav-icon-fill" d="M17 11h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3a2 2 0 1 1 0-4Z"/>',
 permit:'<path d="M8 5H6.5A2.5 2.5 0 0 0 4 7.5v11A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 17.5 5H16m-7.5 8 2.3 2.4 4.7-5"/><rect class="nav-icon-fill" x="8" y="3" width="8" height="4" rx="2"/>',
 document:'<path d="M8 6H5.5A2.5 2.5 0 0 0 3 8.5v9A2.5 2.5 0 0 0 5.5 20H14a2 2 0 0 0 2-2v-1"/><rect x="8" y="3" width="13" height="14" rx="3"/><path d="M12 8h5m-5 4h4"/>',
 report:'<rect x="4.5" y="3" width="15" height="18" rx="3"/><path d="M8.5 16v-3m3.5 3V8m3.5 8v-5"/>',
 company:'<path d="M5 14v-1.5a7 7 0 0 1 14 0V14m-7-8.5v4m-3-3.2v4m6-4v4"/><rect class="nav-icon-fill" x="3" y="14" width="18" height="4" rx="2"/>',
 law:'<path d="M12 3v17m-4 0h8M5 7h14M6 7l-3 6h6L6 7Zm12 0-3 6h6l-3-6ZM3 13a3 3 0 0 0 6 0m6 0a3 3 0 0 0 6 0"/>',
 feed:'<path d="M15 15h-4.5L6 18v-3a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3Z"/><path d="M18 8h.5a2.5 2.5 0 0 1 2.5 2.5V15a3 3 0 0 1-3 3v2l-3.5-2h-3M7 9.5h.1m3.4 0h.1m3.4 0h.1"/>',
 spec:'<path d="M12 6.5a7 7 0 0 0-8-1.2v13a7 7 0 0 1 8 1.2 7 7 0 0 1 8-1.2v-13a7 7 0 0 0-8 1.2v13"/><path d="M7 9h1.5M7 13h1.5m7-4H17m-1.5 4H17"/>',
 settings:'<path d="M12 3 5 6v5c0 4.8 2.7 7.8 7 10 4.3-2.2 7-5.2 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
 alert:'<path d="M18 9.5a6 6 0 0 0-12 0c0 3.8-.9 5.1-2 6.5a1 1 0 0 0 .8 1.5h14.4A1 1 0 0 0 20 16c-1.1-1.4-2-2.7-2-6.5Zm-8 11h4"/>',
};

function addNavIcon(button,symbol){
 if(!symbol||button.querySelector('.local-nav-icon'))return;
 const icon=document.createElement('span');
 icon.className='local-nav-icon';
 icon.setAttribute('aria-hidden','true');
 icon.innerHTML=`<svg viewBox="0 0 24 24" focusable="false">${symbol}</svg>`;
 button.prepend(icon);
}

function decorateNotificationIcon(){
 const trigger=document.querySelector('#sidebar .notification-trigger');
 if(trigger)addNavIcon(trigger,navSymbols.alert);
}

function decorateAccountPreview(){
 const profile=document.getElementById('sidebar-profile');
 if(!profile?.hidden)return;
 const email='reviewer@example.invalid';
 profile.className='studio-account';
 profile.setAttribute('role','group');
 profile.setAttribute('aria-label','로컬 계정 미리보기');
 profile.innerHTML=`<span class="studio-account-avatar" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><img alt="" hidden></span>
 <span class="studio-account-details"><strong>샘플 검토자</strong><small title="${App.esc(email)}">${App.esc(email)}</small></span>
 <svg class="studio-account-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 4 4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
 const photo=profile.querySelector('img');
 photo.addEventListener('load',()=>{photo.hidden=false},{once:true});
 photo.src=new URL('./work-feed/default_avatar.svg',import.meta.url);
 profile.hidden=false;
}

const projectMenus={overview:'프로젝트 개요',cost:'원가 관리',finance:'파이낸싱',permit:'인허가·사업관리',document:'계약·문서',report:'국토부 보고서'};
const projectViews=Object.keys(projectMenus);

function organizeNavigation(nav,topbarSelect){
 if(!topbarSelect||nav.querySelector('.studio-project-nav'))return;
 const buttons=new Map([...nav.querySelectorAll('.nav-btn')].map(button=>[button.dataset.view,button]));
 for(const [view,name] of Object.entries({portfolio:screens.portfolio.title,...projectMenus,law:'법령 변경 내역'})){
  const label=buttons.get(view)?.querySelector('.nav-text');
  if(label)label.textContent=name;
 }
 nav.setAttribute('aria-label','업무 메뉴');
 const group=document.createElement('div');
 group.className='studio-project-nav';
 group.setAttribute('role','group');
 group.setAttribute('aria-label','선택한 프로젝트 메뉴');
 const select=topbarSelect.cloneNode(true);
 select.id='sidebar-project-select';
 select.className='studio-project-select';
 select.value=topbarSelect.value;
 select.title=select.selectedOptions[0]?.textContent||'';
 select.setAttribute('aria-label','왼쪽 프로젝트 선택');
 if(CSS.supports('appearance:base-select')){
  const display=document.createElement('button');
  display.type='button';
  display.append(document.createElement('selectedcontent'));
  select.prepend(display);
 }
 select.addEventListener('change',()=>{
  const next=select.value;
  const restoreFocus=document.activeElement===select;
  select.value=topbarSelect.value;
  const current=App.ui.view;
  const withinProject=projectViews.includes(current);
  App.go(withinProject?current:'overview',withinProject?App.ui.tabs[current]||'':'',next,{fromSidebar:!withinProject});
  if(restoreFocus&&!select.isConnected)document.getElementById(select.id)?.focus({preventScroll:true});
 });
 const picker=document.createElement('div');
 picker.className='studio-project-picker';
 addNavIcon(picker,navSymbols.project);
 picker.append(select);
 group.append(picker);
 for(const view of projectViews){
  if(buttons.has(view))group.append(buttons.get(view));
 }
 const portfolio=buttons.get('portfolio');
 if(portfolio)portfolio.after(group);else nav.prepend(group);
 const admin=document.createElement('nav');
 admin.className='studio-admin-nav';
 admin.setAttribute('aria-label','관리 메뉴');
 for(const view of ['spec','settings']){
  if(buttons.has(view))admin.append(buttons.get(view));
 }
 if(admin.childElementCount)nav.after(admin);
}

function decorateNavigation(){
 const brand=document.querySelector('#sidebar .brand-name');
 if(brand)brand.textContent='IDM 개발사업관리';
 const nav=document.querySelector('#sidebar .nav');
 const law=nav?.querySelector?.('[data-view="law"]');
 if(law?.insertAdjacentHTML&&!nav.querySelector('[data-view="feed"]')){
  const active=App.ui.view==='feed'?' active':'';
  law.insertAdjacentHTML('afterend',`<button type="button" class="nav-btn${active}" data-action="go" data-view="feed"><span class="nav-text">${screens.feed.title}</span></button>`);
 }
 if(nav&&!(nav.parentElement||nav).querySelector('[data-view="settings"]')){
  const active=App.ui.view==='settings'?' active':'';
  nav.insertAdjacentHTML('beforeend',`<button type="button" class="nav-btn${active}" data-action="go" data-view="settings"><span class="nav-text">권한 관리</span></button>`);
 }
 if(nav)organizeNavigation(nav,document.getElementById('project-select'));
 for(const button of document.querySelectorAll('#sidebar .nav-btn')){
  const label=button.querySelector('.nav-text');
  button.setAttribute('aria-label',label.textContent);
  button.removeAttribute('title');
  if(button.classList.contains('active'))button.setAttribute('aria-current','page');
  addNavIcon(button,navSymbols[button.dataset.view]);
 }
 decorateNotificationIcon();
 decorateAccountPreview();
 return nav;
}
const renderNavigation=App.render;
App.render=(...args)=>{
 const nav=document.querySelector('#sidebar .nav');
 const scroll=nav?.scrollTop;
 const result=renderNavigation(...args);
 const currentNav=decorateNavigation();
 syncFeed();
 if(scroll&&currentNav)currentNav.scrollTop=scroll;
 if(App.ui.view==='feed')currentNav?.querySelector?.('[data-view="feed"]')?.scrollIntoView?.({block:'nearest'});
 return result;
};
decorateNavigation();
// Notifications can replace their sidebar section without rendering the app.
new MutationObserver(decorateNotificationIcon).observe(document.getElementById('sidebar'),{childList:true});

function installRailTooltips(){
 const sidebar=document.getElementById('sidebar');
 if(!sidebar?.addEventListener)return;
 const tip=document.createElement('div');
 tip.className='studio-rail-tooltip';
 tip.setAttribute('aria-hidden','true');
 tip.hidden=true;
 document.body.append(tip);
 const selector='.nav-btn, .notification-trigger';
 const hide=()=>{tip.hidden=true};
 function show(event){
  if(event.pointerType==='touch'||!sidebar.closest('.studio-icon-rail'))return;
  const button=event.target.closest?.(selector);
  if(!button)return;
  tip.textContent=button.matches('.notification-trigger')?'알림':button.getAttribute('aria-label');
  tip.hidden=false;
  positionLocalTooltip(tip,button.getBoundingClientRect());
 }
 sidebar.addEventListener('pointerover',show);
 sidebar.addEventListener('focusin',show);
 sidebar.addEventListener('pointerout',event=>{
  const button=event.target.closest?.(selector);
  if(button&&!button.contains(event.relatedTarget))hide();
 });
 sidebar.addEventListener('focusout',hide);
 sidebar.addEventListener('scroll',hide,true);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')hide()});
 window.addEventListener('resize',hide);
 new MutationObserver(hide).observe(sidebar,{childList:true});
}
installRailTooltips();

function decorateProjectHeading(heading,project,view){
 const menu=document.createElement('select');
 menu.id='project-menu-select';
 menu.className='studio-heading-select';
 menu.setAttribute('aria-label','프로젝트 업무 메뉴');
 for(const [key,label] of Object.entries(projectMenus)){
  const option=document.createElement('option');
  option.value=key;
  option.textContent=label;
  menu.append(option);
 }
 menu.value=view;
 menu.addEventListener('change',()=>{
  const next=menu.value;
  const restoreFocus=document.activeElement===menu;
  menu.value=view;
  App.go(next);
  if(restoreFocus&&!menu.isConnected)queueMicrotask(()=>document.getElementById(menu.id)?.focus({preventScroll:true}));
 });
 const prefix=document.createElement('span');
 prefix.className='studio-heading-menu';
 const arrow=document.createElement('span');
 arrow.className='studio-heading-arrow';
 arrow.setAttribute('aria-hidden','true');
 arrow.innerHTML='<svg width="12" height="12" viewBox="0 0 12 12" fill="none" focusable="false"><path d="m4 2 4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 prefix.append(menu,arrow);
 const name=document.createElement('span');
 name.className='studio-heading-project';
 name.textContent=project.name;
 heading.classList.add('studio-project-heading');
 heading.setAttribute('aria-label',`${projectMenus[view]} → ${project.name}`);
 heading.replaceChildren(prefix,name);
 const meta=heading.parentElement.querySelector('.meta');
 if(meta)meta.textContent=[project.type,project.location].filter(Boolean).join(' · ');
}

function decorateOverview(_app, content, project){
 const issueAdd=content.querySelector('button[data-action="issue-add"]');
 const issueHeading=issueAdd?.closest('.panel-header')?.querySelector('.panel-title h2');
 if(issueHeading){
  issueHeading.textContent='주요 현안 관리';
  issueAdd.textContent='+ 현안 등록';
 }
 content.querySelector('[data-table-col-resize][aria-label="현안 열 너비 조절"]')
  ?.closest('table')?.classList.add('studio-issue-table');
 const facts=content.querySelector('.dp-project-facts-frame');
 const details=facts?.closest('details');
 const edit=facts?.querySelector('[data-action="overview-basic-edit"]');
 if(details){
  details.classList.add('studio-overview-basic');
  if(edit){
   const toolbar=edit.closest('.table-toolbar');
   details.querySelector('summary').after(edit);
   toolbar?.remove();
  }
 }
 const body=content.querySelector('.dp-overview-row > .panel:last-child > .panel-body');
 const buttons=[...(body?.querySelectorAll(':scope > .dp-permit-mini-row')||[])];
 if(!buttons.length)return;
 const list=document.createElement('nav');
 list.className='studio-overview-permits';
 list.setAttribute('aria-label','인허가 목록');
 body.append(list);
 list.append(...buttons);
 const permits=(project.permits||[]).filter(permit=>!permit.deletedAt);
 for(const permit of permits.slice(buttons.length)){
  const button=buttons[0].cloneNode(true);
  const date=permit.approval||permit.expected||'—';
  button.children[0].textContent=permit.name||permit.category||'';
  button.children[1].textContent=permit.stage||'';
  button.children[2].textContent=date;
  button.dataset.tip=[permit.agency||'',permit.detail||permit.name||'',(permit.approval?'실제 승인일: ':'계획 완료일: ')+date].join('\n');
  list.append(button);
 }
 if(permits.length>5)list.tabIndex=0;
}

function decorateCostOverview(_app, content){
 const linkContractAmount=value=>{
  if(!value)return;
  const label=value.textContent;
  value.innerHTML=App.btn(label,'studio-contract-amounts',{},'text studio-contract-amount');
  value.firstElementChild.setAttribute('aria-label','계약금액 '+label+' 산출 근거 보기');
 };
 const kpiLabels=[...content.querySelectorAll('.cost-kpi-label')];
 const contractKpi=kpiLabels.find(label=>label.textContent==='계약금액');
 if(contractKpi){
  const cell=contractKpi.closest('.cost-kpi-cell');
  cell.querySelector('.cost-kpi-meta').textContent='계약기준';
  linkContractAmount(cell.querySelector('.cost-kpi-value'));
 }
 const paidCell=kpiLabels.find(label=>label.textContent==='지급금액')?.closest('.cost-kpi-cell');
 const summaryPanel=content.querySelector('.cost-left-stack > .panel:nth-child(2)');
 const summaryTable=summaryPanel?.querySelector('.table-wrap');
 if(summaryTable){
  const labels=Array.from(summaryTable.querySelectorAll('thead th'),cell=>cell.textContent.trim());
  const values=Array.from(summaryTable.querySelectorAll('tbody td'),cell=>cell.textContent.trim());
  if(labels.length===4&&values.length===labels.length){
   const unavailable='자료 미확보';
   // A legacy balance can exist without a complete project payment total.
   const paidUnavailable=values[labels.indexOf('지급금액')]===unavailable;
   const list=document.createElement('dl');
   list.className='studio-execution-metrics';
   labels.forEach((label,index)=>{
    const metric=document.createElement('div');
    const term=document.createElement('dt');
    const value=document.createElement('dd');
    term.textContent=label;
    value.textContent=label==='미지급금'&&paidUnavailable?unavailable:values[index];
    if(value.textContent===unavailable)value.className='muted';
    if(label==='계약금액')linkContractAmount(value);
    metric.append(term,value);
    list.append(metric);
   });
   summaryTable.replaceWith(list);
   paidCell?.remove();
   summaryPanel.querySelector('.panel-header')?.insertAdjacentHTML(
    'beforeend',App.btn('지급 내역 보기','studio-payment-list',{},'text studio-payment-link')
   );
  }
 }

 const accent='var(--studio-accent)';
 const palette=['#7186a4',accent,'#a2b1c5','#837b9d','#8ba5ba','#a7a0b5','#8195a3','#b3a2a8','#8d95ae','#a0abb8'];
 const colors=new Map();
 content.querySelectorAll('.cbs-composition-row').forEach((row,index)=>{
  const color=palette[index%palette.length];
  colors.set(row.dataset.id,color);
  row.querySelector('.cbs-composition-track > i').style.backgroundColor=color;
  const amount=row.querySelector('.num').firstChild;
  if(amount?.nodeType!==Node.TEXT_NODE)return;
  const parts=amount.textContent.split(/(\d[\d,.]*)/);
  amount.replaceWith(...parts.map((part,i)=>{
   if(i%2===0)return part;
   const number=document.createElement('b');
   number.textContent=part;
   return number;
  }));
 });
 const fundingColors={equity:accent,bridge:'#8098b1',pf:'#a4b3c9',other:'#837b9d',gap:'#e4eaf5'};
 content.querySelectorAll('.cbs-stack-column [data-id]').forEach(mark=>{
  const color=mark.dataset.action==='cbs-group-details'?colors.get(mark.dataset.id):fundingColors[mark.dataset.id];
  if(!color)return;
  const swatch=mark.querySelector('i')||mark;
  swatch.style.backgroundColor=color;
  if(swatch===mark)mark.style.color=color===accent?'#fff':'#111114';
 });

 const tooltipLabels=['금액','사업비 구성비','실제 조달 구성비','연면적 기준'];
 const segments=new Map(Array.from(content.querySelectorAll('.cbs-stack-segment'),segment=>[
  segment.dataset.action+':'+segment.dataset.id,segment
 ]));
 for(const owner of content.querySelectorAll('.cbs-funding-structure [data-tip]')){
  const [title,...lines]=owner.dataset.tip.split('\n');
  if(!lines.length){
   registerChartTooltip(owner,{title:owner.textContent.trim()||'초과조달',amounts:[],note:title});
   continue;
  }
  const amounts=lines.slice(0,3).flatMap(line=>{
   const label=tooltipLabels.find(label=>line.startsWith(label+' '));
   return label?[[label,line.slice(label.length+1)]]:[];
  });
  const note=lines.slice(3).join('\n').replace(/^포함:\s*/,'');
  const pointerTarget=segments.get(owner.dataset.action+':'+owner.dataset.id);
  registerChartTooltip(owner,{title,amounts,note,noteLabel:'포함 내역',pointerTarget});
 }

 const axisBreak=content.querySelector('.wf-axis-break-slot > span');
 if(axisBreak)axisBreak.textContent='≈';
 const waterfallLabels=Array.from(content.querySelectorAll('.wf-category-row > span'),label=>label.textContent);
 const waterfallMarks=content.querySelectorAll('.wf-mark[data-tip]');
 waterfallMarks.forEach((mark,index)=>{
  const title=waterfallLabels[index];
  const [summary,...changes]=mark.dataset.tip.split('\n');
  if(!title||!summary.startsWith(title+' '))return;
  const amounts=[['금액',summary.slice(title.length+1)]];
  for(const change of changes){
   const separator=change.search(/ [▲▼] /);
   amounts.push(separator<0?['내역',change]:[change.slice(0,separator),change.slice(separator+1)]);
  }
  registerChartTooltip(mark,{title,amounts,pointerTarget:mark.querySelector('rect:not(.wf-hit)')});
 });
}

function decorateCostBenchmark(app, content, project){
 const peerTitle=content.querySelector('.dp-market > .table-panel .table-toolbar-left > strong');
 if(peerTitle){
  const heading=document.createElement('h3');
  heading.textContent=peerTitle.textContent;
  peerTitle.parentElement.classList.add('panel-title');
  peerTitle.replaceWith(heading);
 }
 decorateMarketTrends(app,content);
 const plot=content.querySelector('.benchmark-plot');
 const axis=plot?.querySelector('.benchmark-axis');
 if(!axis||!project)return;
 const {selected,current,scale,reference}=app.partners.benchmarkMetrics(project);
 const rows=plot.querySelectorAll('.benchmark-row');
 const rangeIndex=reference?1:0;
 const currentRow=rows[rangeIndex+(selected.length?1:0)];
 currentRow.classList.add('benchmark-current-row');
 axis.after(currentRow);
 const grid=document.createElement('div');
 grid.className='benchmark-grid';
 grid.setAttribute('aria-hidden','true');
 const guides=document.createElement('div');
 grid.append(guides);
 plot.append(grid);
 scale.ticks.forEach((tick,index)=>{
  const line=document.createElement('span');
  line.className='benchmark-gridline';
  if(index===0||index===scale.ticks.length-1)line.classList.add('benchmark-gridline-edge');
  line.style.left=scale.ratio(tick)*100+'%';
  guides.append(line);
 });

 const summary=document.createElement('div');
 summary.className='benchmark-summary';
 plot.before(summary);
 if(!selected.length){
  summary.textContent='비교에 포함된 유사사업이 없습니다.';
  return;
 }
 rows[rangeIndex].remove();
 const units=selected.map(row=>Number(row.unit));
 const min=Math.min(...units), max=Math.max(...units);
 const mean=units.reduce((sum,value)=>sum+value,0)/units.length;
 for(const [name,value] of [['min',min],['max',max],['mean',mean]]){
  plot.style.setProperty('--benchmark-'+name,scale.ratio(value)*100+'%');
 }
 plot.classList.add('has-peer-range');
 const meanLabel=document.createElement('span');
 meanLabel.className='benchmark-mean-label';
 meanLabel.setAttribute('aria-hidden','true');
 meanLabel.textContent=`평균 ${app.num(mean,1)}`;
 axis.querySelector('.benchmark-scale-v080').append(meanLabel);
 const stats=document.createElement('span');
 stats.className='benchmark-peer-summary';
 stats.textContent=`유사사업 ${units.length}건 · ${app.num(min,1)}~${app.num(max,1)}만원/평`;
 const average=document.createElement('span');
 average.className='benchmark-average-summary';
 average.textContent=`평균 ${app.num(mean,1)}만원/평`;
 summary.append(stats,average);
 if(!Number.isFinite(current))return;

 const difference=current-mean;
 const direction=difference>0?' 높음':difference<0?' 낮음':'';
 const percent=mean>0?` (${difference>0?'+':''}${app.num(difference/mean*100,1)}%)`:' (증감률 산정 불가)';
 const delta=document.createElement('strong');
 delta.className='benchmark-average-delta';
 delta.textContent=`평균 대비 ${app.num(Math.abs(difference),1)}만원/평${direction}${percent}`;
 summary.append(delta);
}

function decorateMarketTrends(app,content){
 const disclosure=content.querySelector('details[data-market-details]');
 if(!disclosure)return;
 // The reference loader uses this state to redraw when its first request settles.
 app.ui.marketOpen=true;
 const card=document.createElement('section');
 card.id=disclosure.id;
 card.className=disclosure.className;
 const header=document.createElement('div');
 header.className='panel-header';
 const title=document.createElement('div');
 title.className='panel-title';
 const heading=disclosure.querySelector('h3');
 heading.id='market-trends-title';
 title.append(heading);
 header.append(title);
 const body=disclosure.querySelector('.panel-body');
 card.setAttribute('aria-labelledby',heading.id);
 card.append(header,body);
 disclosure.replaceWith(card);

 const filters=body.querySelector('.dp-market-filters');
 const versions=body.querySelector('.dp-market-versions');
 if(!filters||!versions)return;
 const comparison=versions.nextElementSibling;
 const series=filters.querySelector('#market-series-select');
 const start=filters.querySelector('#market-start');
 const end=filters.querySelector('#market-end');
 const startVersion=versions.querySelector('#market-start-version');
 const endVersion=versions.querySelector('#market-end-version');
 const compare=filters.querySelector('[data-action="market-compare"]');
 const result=app.partners.compareIndex(series.value,start.value,end.value,startVersion.value,endVersion.value);

 const toolbar=document.createElement('div');
 toolbar.className='studio-market-filters';
 filters.replaceWith(toolbar);
 toolbar.append(series.closest('label'));
 for(const [month,version] of [[start,startVersion],[end,endVersion]]){
  const group=document.createElement('div');
  group.className='studio-market-period';
  group.append(month.closest('label'),version.closest('label'));
  toolbar.append(group);
 }
 toolbar.append(compare);
 versions.remove();
 if(result.ok){
  const summary=document.createElement('dl');
  summary.className='studio-market-comparison';
  const change=app.num(result.change,2);
  const sign=result.change>0?'+':'';
  const entries=[
   ['기준월',app.num(result.start.value,2),start.value,''],
   ['비교월',app.num(result.end.value,2),end.value,'is-current'],
   ['기준월 대비',`${sign}${change}%`,'',result.change>0?'increase':result.change<0?'decrease':''],
  ];
  for(const [label,value,period,variant] of entries){
   const metric=document.createElement('div');
   metric.className='studio-market-metric';
   if(variant)metric.classList.add(variant);
   const term=document.createElement('dt');
   term.textContent=label;
   if(period){
    const date=document.createElement('time');
    date.dateTime=period;
    date.textContent=period.replaceAll('-','.');
    term.append(' ',date);
   }
   const amount=document.createElement('dd');
   amount.textContent=value;
   metric.append(term,amount);
   summary.append(metric);
  }
  comparison.remove();
  body.prepend(summary);
 }

 const chart=body.querySelector('.dp-market-series-chart');
 body.lastElementChild.classList.add('studio-market-sources');
 if(!chart)return;
 const figure=document.createElement('figure');
 figure.className='studio-market-figure';
 const caption=document.createElement('figcaption');
 const unit=chart.nextElementSibling;
 caption.textContent=unit.textContent;
 unit.remove();
 const scroller=document.createElement('div');
 scroller.className='studio-market-chart';
 chart.before(figure);
 figure.append(caption,scroller);
 scroller.append(chart);
 const points=chart.querySelectorAll('circle');
 points[0]?.classList.add('studio-market-endpoint');
 points[points.length-1]?.classList.add('studio-market-endpoint','is-current');
 decorateMarketPlot(chart);
}

function decorateMarketPlot(chart){
 const grid=[...chart.querySelectorAll('line')];
 if(!grid.length)return;
 const baseline=Math.max(...grid.map(line=>line.y1.baseVal.value));
 for(const label of chart.querySelectorAll('text')){
  if(label.y.baseVal.getItem(0).value>baseline+12)label.classList.add('studio-market-axis-date');
 }

 // Each source path represents a continuous interval. Leave missing intervals clear.
 const areas=[...chart.querySelectorAll('path')].map(path=>{
  const start=path.getPointAtLength(0);
  const end=path.getPointAtLength(path.getTotalLength());
  return `M ${start.x} ${baseline} V ${start.y} L ${end.x} ${end.y} V ${baseline} Z`;
 });
 if(!areas.length)return;
 const svg=tag=>document.createElementNS(chart.namespaceURI,tag);
 const gradient=svg('linearGradient');
 gradient.id='studio-market-area-gradient';
 gradient.setAttribute('x2','0');
 gradient.setAttribute('y2','1');
 for(const [offset,opacity] of [['0','0.17'],['1','0.02']]){
  const stop=svg('stop');
  stop.setAttribute('offset',offset);
  stop.setAttribute('stop-opacity',opacity);
  gradient.append(stop);
 }
 const definitions=svg('defs');
 definitions.append(gradient);
 const area=svg('path');
 area.classList.add('studio-market-area');
 area.setAttribute('d',areas.join(' '));
 area.setAttribute('aria-hidden','true');
 chart.prepend(definitions,area);
}

function decorateCardActions(content){
 const libraryTitle=content.querySelector('.document-list > .library-title');
 if(libraryTitle){
  const tools=libraryTitle.nextElementSibling?.querySelector(':scope > .table-toolbar-right');
  if(tools?.querySelector('.btn.create')){
   const header=document.createElement('div');
   header.className='panel-header';
   libraryTitle.before(header);
   header.append(libraryTitle,tools);
  }
 }
 const headers=content.querySelectorAll('.panel-header, .panel-head, .panel > .table-toolbar, .table-panel > .table-toolbar, .permit-workspace-heading');
 for(const header of headers){
  const title=header.querySelector(':scope > :is(h2,h3,h4,strong), :scope > :is(.panel-title,.table-toolbar-left) > :is(h2,h3,h4,strong)');
  if(!title)continue;
  const additions=[...header.querySelectorAll('button.btn')].filter(button=>
   button.classList.contains('create')||/(?:추가|등록)$/.test(button.textContent.trim()));
  if(!additions.length)continue;

  // Reuse the header's action group and keep visual and keyboard order equal.
  const actionGroup=header.querySelector(':scope > :is(.table-toolbar-right,.inline,.permit-workspace-tools)')||document.createElement('div');
  const directActions=[...header.children].filter(element=>element.matches('button.btn')&&!additions.includes(element));
  actionGroup.classList.add('studio-card-actions');
  for(const button of additions)button.classList.add('studio-card-add');
  actionGroup.append(...directActions,...additions);
  if(header.lastElementChild!==actionGroup)header.append(actionGroup);
 }
}

function update(){
 const heading=content.querySelector(':scope > :is(.page-header,.project-context) h1');
 if(!heading||heading===lastHeader||(App.cloudMode&&!App.cloudPersistence.booted()))return;
 lastHeader=heading;
 if(initialPage){
  const page=initialPage;initialPage=null;
  if(restorePage(page))return;
 }
 rememberPage();
 if(App.ui.view==='settings'){
  heading.textContent='권한 관리';
  heading.parentElement.querySelector('.meta')?.remove();
 }
 if(App.ui.view==='law')heading.textContent='법령 변경 내역';
 const project=projectViews.includes(App.ui.view)?App.current():null;
 if(project)decorateProjectHeading(heading,project,App.ui.view);
 const match=Object.entries(screens).find(([,s])=>s.view===App.ui.view&&(!s.tab||s.tab===App.ui.tabs[s.view]));
 if(!match){delete content.dataset.localScreen;decorateCardActions(content);return}
 const [key,screen]=match;content.dataset.localScreen=key;
 if(screen.title)heading.textContent=screen.title;
 screen.decorate(App,content,project||App.current());
 decorateCardActions(content);
}
new MutationObserver(update).observe(content,{childList:true});
update();

function installDisplayDates() {
 if(!document.body||typeof document.createTreeWalker!=='function')return;
 const displayRoot='#app, dialog, #toast, #dp-chart-tooltip';
 const originalText='script, style, template, pre, code, samp, input, textarea, option:not([value]), [contenteditable]:not([contenteditable="false"]), .library-origin-path, .contract-origin-path, .official-form-table, .report-edit-table';
 const format=node=>{
  if(!/\d{4}-\d{2}-\d{2}/.test(node.data))return;
  const parent=node.parentElement;
  if(!parent?.closest(displayRoot)||parent.closest(originalText))return;
  const next=formatDisplayDates(node.data);
  if(next!==node.data)node.data=next;
 };
 const formatTree=node=>{
  if(node.nodeType===3){format(node);return;}
  if(node.nodeType!==1||node.closest(originalText))return;
  const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
  while(walker.nextNode())format(walker.currentNode);
 };
 formatTree(document.body);
 new MutationObserver(records=>{
  for(const record of records){
   if(record.type==='characterData')format(record.target);
   else for(const node of record.addedNodes)formatTree(node);
  }
 }).observe(document.body,{childList:true,characterData:true,subtree:true});
}
installDisplayDates();

// Let the browser close the open choice list before the app handles dialog Escape.
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&!event.isComposing&&document.querySelector('.dp-dialog[open] select:is(:open)')){
  event.stopPropagation();
 }
},true);

document.addEventListener('click',e=>{
 const a=e.target.closest?.('a[href]');
 if(a&&/^https?:$/.test(a.protocol)&&a.origin!==location.origin){
  e.preventDefault();e.stopImmediatePropagation();App.toast('외부 링크는 로컬 작업실에서 열지 않습니다.');
 }
},true);

// LOCAL-SIDEBAR-MOTION:START
// Desktop keeps the real navigation in a narrow rail. Mobile keeps the overlay motion.
function installSidebarMotion(A, doc=document) {
 const app=doc.getElementById('app'),view=doc.defaultView;
 if(!app?.classList || typeof A.render!=='function' || A.render.localSidebarMotion)return;
 const original=A.render, motions=new Set(), ghosts=new Set();
 const reduced=view?.matchMedia?.('(prefers-reduced-motion: reduce)');
 const mobile=view?.matchMedia?.('(max-width:760px)');
 function syncRail(){
  const sidebar=doc.getElementById('sidebar');
  const collapsed=app.classList.contains('sidebar-collapsed');
  const compact=collapsed&&!mobile?.matches;
  app.classList.toggle('studio-icon-rail',compact);
  if(!collapsed||!sidebar)return;
  const toggle=doc.querySelector('[data-action="sidebar-toggle"][aria-expanded="false"]');
  const host=compact?sidebar.querySelector('.brand'):doc.querySelector('#topbar .topbar-left');
  const restoreFocus=toggle===doc.activeElement||(!compact&&sidebar.contains(doc.activeElement));
  sidebar.hidden=!compact;
  if(toggle&&host&&toggle.parentElement!==host)host.prepend(toggle);
  if(restoreFocus)toggle?.focus({preventScroll:true});
 }
 const cancel=()=>{
  for(const motion of [...motions])motion.cancel();
  motions.clear();for(const ghost of ghosts)ghost.remove();ghosts.clear();
 };
 function animate(node,frames,ghost=null){
  if(typeof node?.animate!=='function'){ghost?.remove();if(ghost)ghosts.delete(ghost);return;}
  const motion=node.animate(frames,{duration:180,easing:'cubic-bezier(.2,.7,.2,1)'});
  motions.add(motion);
  const finish=()=>{motions.delete(motion);if(ghost){ghost.remove();ghosts.delete(ghost);}};
  motion.onfinish=finish;motion.oncancel=finish;
 }
 function renderWithSidebarMotion(...args){
  // Cancel earlier frames before measuring stable layout, including rapid toggles.
  cancel();
  const sidebar=doc.getElementById('sidebar');
  const wasClosed=app.classList.contains('sidebar-collapsed'),nextClosed=!!A.ui.sidebarCollapsed;
  const changing=mobile?.matches&&wasClosed!==nextClosed&&!reduced?.matches&&typeof sidebar?.animate==='function';
  const oldSidebar=changing&&!wasClosed?sidebar.getBoundingClientRect():null;
  const ghost=oldSidebar&&oldSidebar.width>0&&!sidebar.hidden?sidebar.cloneNode(true):null;
  const focusedMenu=app.classList.contains('studio-icon-rail')?doc.activeElement?.closest?.('#sidebar .nav-btn'):null;
  const result=original.apply(this,args);
  syncRail();
  if(focusedMenu&&!focusedMenu.isConnected&&app.classList.contains('studio-icon-rail')){
   const replacement=[...sidebar.querySelectorAll('.nav-btn')].find(button=>button.dataset.view===focusedMenu.dataset.view);
   replacement?.focus({preventScroll:true});
  }
  // Deferred renders must not display a transition until core actually changes state.
  if(!changing||app.classList.contains('sidebar-collapsed')===wasClosed)return result;
  try {
   if(ghost){
    ghost.hidden=false;ghost.inert=true;ghost.setAttribute('inert','');ghost.setAttribute('aria-hidden','true');
    for(const el of [ghost,...ghost.querySelectorAll('*')]){
     for(const name of ['id','name','for','aria-controls','aria-labelledby','aria-describedby','data-action','href','autofocus'])el.removeAttribute(name);
     if(el!==ghost)el.setAttribute('tabindex','-1');
    }
    ghost.classList.add('local-sidebar-ghost');
    Object.assign(ghost.style,{position:'fixed',left:oldSidebar.left+'px',top:oldSidebar.top+'px',width:oldSidebar.width+'px',height:oldSidebar.height+'px',margin:'0',zIndex:'30',pointerEvents:'none',overflow:'hidden'});
    app.append(ghost);ghosts.add(ghost);
    animate(ghost,[{transform:'translateX(0)',opacity:1},{transform:'translateX(-100%)',opacity:0}],ghost);
   }else if(!nextClosed){
    animate(sidebar,[{transform:'translateX(-100%)',opacity:0},{transform:'translateX(0)',opacity:1}]);
   }
  }catch{
   // An unavailable animation API must never interfere with a normal app action.
   cancel();
  }
  return result;
 }
 renderWithSidebarMotion.localSidebarMotion=true;A.render=renderWithSidebarMotion;
 app.classList.add('studio-rail-ready');
 syncRail();
 mobile?.addEventListener?.('change',()=>{cancel();syncRail()});
 reduced?.addEventListener?.('change',cancel);
 view?.addEventListener?.('resize',cancel);
}
// LOCAL-SIDEBAR-MOTION:END
installSidebarMotion(App);
