import {currentCapitalSources,capitalSourceTotal,capitalSourceGroups} from './finance-capital.js';
import {stageFields} from './finance-stage-fields.js';
import {createStageDraft} from './finance-stage-editor-model.js';
import {renderStageTable,bindStageEditor,formatStageArea} from './finance-stage-editor-ui.js';
import {milestoneRows,installMilestoneCapture,underwritingBasis,costPerPyeong} from './finance-milestones.js';

const eok=100_000_000;
const groupColors=['var(--studio-capital-equity,#253985)','var(--studio-capital-debt,#426eaa)','#5886a2','#796ba4','#536b87','#815c84'];
const stageViews=new Map();
const stageFieldsByKey=new Map(stageFields.map(field=>[field.key,field]));
const summaryLabels={funding:'총 조달규모',land:'토지매입비'};
const amountOf=value=>{
 if(typeof value!=='number'&&(typeof value!=='string'||!value.trim()))return null;
 const amount=Number(value);
 return Number.isSafeInteger(amount)&&amount>=0?amount:null;
};
const totalOf=values=>values.length&&values.every(value=>value!==null)?values.reduce((sum,value)=>sum+value,0):null;

export function capitalGroups(project){return capitalSourceGroups(currentCapitalSources(project));}

function renderCapital(A,capital,summary,project,basis){
 const total=basis.values.funding,sources=basis.capitalSources||[];
 const groups=capitalSourceGroups(sources);
 const sum=kind=>capitalSourceTotal(sources.filter(row=>row.kind===kind));
 summary.innerHTML=[['총 조달규모',total],['자기자본',sum('equity')],['대출 약정',sum('debt')]].map(([label,value])=>'<div><span>'+label+'</span><b>'+(value==null?'—':A.money(value))+'</b></div>').join('');
 const detailButton=capital.querySelector('.panel-header button');
 detailButton.removeAttribute('data-action');
 const openCapitalDetails=()=>A.modal(basis.name+' · 조달 내역',A.table(['구분','트랜치','자금 제공자','약정·출자액'],sources.map(row=>[row.kind==='equity'?'출자':'대출',A.esc(row.tranche),A.esc(row.party),row.amount==null?'—':A.money(row.amount)])));
 detailButton.onclick=openCapitalDetails;
 const money=amount=>amount===null?'—':A.money(amount);
 const hasMissing=total===null||totalOf(groups.map(group=>group.total))!==total;
 const body=capital.querySelector('.panel-body');
 body.classList.add('studio-capital');
 body.replaceChildren();
 const chart=document.createElement('div');
 chart.className='studio-capital-chart';
 chart.innerHTML=`
  <div class="studio-capital-bar" role="group" aria-label="약정·출자 기준 조달 비중"${total>0&&!hasMissing?'':' hidden'}></div>
  ${hasMissing&&groups.length?'<p class="studio-finance-note">약정액 또는 출자액이 모두 확인되면 조달 비중을 표시합니다.</p>':''}
  ${!groups.length?'<p class="studio-finance-note">이 단계에 저장된 조달 내역이 없습니다.</p>':''}
  <div class="studio-capital-investment"><div class="studio-capital-totals"></div><div class="studio-capital-groups"></div></div>`;
 body.append(chart);
 const bar=chart.querySelector('.studio-capital-bar');
 const cards=chart.querySelector('.studio-capital-groups');
 chart.querySelector('.studio-capital-totals').append(summary);
 let selected=null,hovered=null,focused=null;
 const active=()=>hovered??focused??selected;
 function showGroup(){
  const index=active();
  bar.classList.toggle('is-filtered',index!==null);
  Array.from(bar.children).forEach(segment=>{
   const key=Number(segment.dataset.group);
   segment.classList.toggle('is-active',key===index);
   segment.setAttribute('aria-pressed',String(key===selected));
  });
  Array.from(cards.children).forEach((card,key)=>card.classList.toggle('is-active',key===index));
 }
 groups.forEach((group,index)=>{
  const color=groupColors[index%groupColors.length];
  if(!bar.hidden&&group.total>0){
   const share=group.total/total*100;
   const segment=document.createElement('button');
   segment.type='button';
   segment.dataset.group=String(index);
   segment.style.setProperty('--group-color',color);
   segment.style.setProperty('--group-width',share+'%');
   segment.setAttribute('aria-label',group.name+' '+A.num(share,1)+'% '+money(group.total));
   segment.innerHTML=`<strong>${A.esc(group.name)}</strong><span>${A.num(share,1)}%</span>`;
   segment.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){hovered=index;showGroup()}});
   segment.addEventListener('pointerleave',()=>{hovered=null;showGroup()});
   segment.addEventListener('focus',()=>{focused=index;showGroup()});
   segment.addEventListener('blur',()=>{focused=null;showGroup()});
   segment.addEventListener('click',()=>{selected=selected===index?null:index;showGroup()});
   segment.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    event.preventDefault();
    hovered=focused=selected=null;
    showGroup();
   });
   bar.append(segment);
  }
  const card=document.createElement('article');
  card.style.setProperty('--group-color',color);
  card.innerHTML=`<div class="studio-capital-group-title"><h4>${A.esc(group.name)}</h4><strong>${money(group.total)}</strong></div>
   <ol>${group.people.map(person=>`<li><div><span>${A.esc(person.name||'기관명 미입력')}</span><b>${money(person.amount)}</b></div></li>`).join('')}</ol>`;
  cards.append(card);
 });
 showGroup();
}

const fieldDisplay=(A,value,unit)=>value==null?'—':unit?A.num(value)+'개월':A.money(value);
function displayDate(date){return date.replaceAll('-','.');}
function costUnitDisplay(A,row,key='cost'){
 const value=costPerPyeong({...row,values:{cost:row.values[key]}});
 return `<span class="studio-stage-unit-cost">${value===null?'평당 —':A.num(Math.round(value))+'만원/평'}</span>`;
}
function comparisonDisplay(A,value,unit,key){
 if(value==null)return '—';
 return unit?fieldDisplay(A,value,unit):new Intl.NumberFormat('ko-KR',{maximumFractionDigits:1}).format(value/eok)+'억원';
}
function durationComparison(A,baseline,stage){
 const period=row=>row.values.duration==null?'—':A.num(row.values.duration)+'M';
 const column=row=>`<div><b>${period(row)}</b><span>${A.esc(row.name)}</span><time${row.date?` datetime="${A.esc(row.date)}"`:''}>${/^\d{4}-\d{2}(?:-\d{2})?$/.test(row.date||'')?A.esc(row.date.slice(0,7).replace('-','.')):'—'}</time></div>`;
 return `<article class="studio-stage-pair" data-stage-field="duration"><h4>개발기간</h4><div class="studio-stage-values">${baseline?column(baseline)+'<span aria-hidden="true">→</span>':''}${column(stage)}</div></article>`;
}
function stageComparison(A,field,baseline,stage){
 if(baseline?.id===stage.id)baseline=null;
 const {key,label,unit}=field;
 if(key==='duration')return durationComparison(A,baseline,stage);
 const value=stage.values[key],initial=baseline?.values[key];
 const delta=value==null||initial==null?null:value-initial;
 const compare=!!baseline;
 return `<article class="studio-stage-pair" data-stage-field="${key}"><h4>${summaryLabels[key]||label}</h4>
  <div class="studio-stage-values">
   ${compare?`<div><span>${A.esc(baseline.name)}</span>${['cost','construction','interest'].includes(key)?costUnitDisplay(A,baseline,key):''}<b>${comparisonDisplay(A,initial,unit,key)}</b></div><span aria-hidden="true">→</span>`:''}
   <div><span>${A.esc(stage.name)}</span>${['cost','construction','interest'].includes(key)?costUnitDisplay(A,stage,key):''}<b>${comparisonDisplay(A,value,unit,key)}</b></div>
  </div>
  ${compare&&delta!==null?`<small class="${delta>0?'studio-stage-up':delta<0?'studio-stage-down':''}">${(delta>0?'+':delta<0?'−':'')+comparisonDisplay(A,Math.abs(delta),unit,key)}</small>`:''}
 </article>`;
}
// Animate only presentation: the selected stage and its stored values never change.
function stageMetricPositions(body){
 return new Map([...body.querySelectorAll('[data-stage-field]')].map(pair=>[
  pair.dataset.stageField,[...pair.querySelectorAll('.studio-stage-values > div')].map(column=>({rect:column.getBoundingClientRect(),text:column.textContent}))
 ]));
}
function animateStageMetrics(body,previous,entry){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return [];
 const animations=[];
 const play=(element,frames,delay=0)=>animations.push(element.animate(frames,{
  id:'studio-stage-metric',duration:400,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'
 }));
 for(const pair of body.querySelectorAll('[data-stage-field]')){
  const columns=[...pair.querySelectorAll('.studio-stage-values > div')];
  const old=previous.get(pair.dataset.stageField)||[];
  const first=columns[0],last=columns.at(-1);
  if(!first)continue;
  const compared=columns.length>1;
  if(compared&&(entry||old.length===1)){
   const target=first.getBoundingClientRect();
   const start=old[0]?.rect;
   // A standalone amount is right-aligned; keep its exact starting edge.
   const dx=entry?(pair.dataset.stageField==='duration'?0:last.getBoundingClientRect().right-target.right):(start.right-target.right);
   const dy=entry?0:start.bottom-target.bottom;
   play(first,[{transform:`translate(${dx}px, ${dy}px)`},{transform:'translate(0px, 0px)'}],entry?160:0);
   const amount=first.querySelector('b');
   play(amount,[{color:getComputedStyle(last.querySelector('b')).color},{color:getComputedStyle(amount).color}],entry?160:0);
  }else if(!compared&&old.length>1){
   const target=first.getBoundingClientRect(),start=old[0].rect;
   play(first,[{transform:`translate(${start.right-target.right}px, ${start.bottom-target.bottom}px)`,opacity:.65},{transform:'translate(0px, 0px)',opacity:1}]);
  }
  if(compared&&(entry||old.length!==columns.length||old.at(-1)?.text!==last.textContent)){
   play(last,[{opacity:0,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0px)'}],entry?280:80);
   for(const extra of pair.querySelectorAll('.studio-stage-values > span, :scope > small'))play(extra,[{opacity:0},{opacity:1}],entry?280:80);
  }
 }
 return animations;
}
export function decorateFinancing(A,content,project){
 const root=content.querySelector('.dp-finance');
 const summary=root?.querySelector(':scope > .recovery-summary');
 const capital=root?.querySelector('.panel-header [data-action="finance-capital-detail"]')?.closest('.panel');
 if(!summary||!capital||!project)return;
 const stagePanel=document.createElement('section');
 stagePanel.className='panel studio-finance-stages';
 stagePanel.innerHTML=`<div class="panel-header"><div class="panel-title"><h3>개발 단계별 핵심 지표</h3></div></div>
  <div class="panel-body studio-stage-body"></div>`;
 const stageGroup=document.createElement('div');
 stageGroup.className='studio-finance-stage-group';
 stageGroup.setAttribute('role','group');
 stageGroup.setAttribute('aria-label','선택 단계별 핵심지표와 조달구조');
 root.insertBefore(stageGroup,capital);
 stageGroup.append(stagePanel,capital);
 const body=stagePanel.querySelector('.studio-stage-body');
 const liveHeadings=[...root.querySelectorAll('.table-toolbar-left')].filter(el=>['대출현황','출자자'].includes(el.textContent.trim())).map(el=>({el:el.querySelector('strong')||el,title:el.textContent.trim()}));
 const url='/api/local-finance-stages?'+new URLSearchParams({projectId:project.id});
 installMilestoneCapture(A);
 let costBases=milestoneRows(A,project);
 let current=costBases.at(-1);
 let stages=[];
 if(!stageViews.has(project.id))stageViews.set(project.id,{detailsOpen:false});
 const view=stageViews.get(project.id);
 const selectedBasis=()=>costBases.find(basis=>basis.id===view.basisId)||current;
 let detailsAnimation=null;
 let metricAnimations=[];
 function render({motion=false}={}){
  const previous=motion?stageMetricPositions(body):new Map();
  for(const animation of metricAnimations)animation.cancel();
  metricAnimations=[];
  detailsAnimation?.cancel();detailsAnimation=null;
  const basis=selectedBasis();
  renderCapital(A,capital,summary,project,basis);
  for(const {el,title}of liveHeadings)el.textContent=basis.snapshot?title+' · '+current.name:title;
  const baseline=underwritingBasis(costBases);
  const gfa=basis.gfa;
  const periodEnd=basis.periodEnd;
  body.innerHTML=`
   <div class="studio-milestone-toolbar"><div class="studio-stage-navigation"><div class="studio-stage-selector" role="group" aria-label="사업비 비교 기준 선택">
    ${costBases.map(row=>`<button type="button" aria-pressed="${row===basis}" data-cost-basis="${A.esc(row.id)}">
     ${row.date?`<span>${A.esc(displayDate(row.date))}</span>`:''}<strong>${A.esc(row.name)}${row.id==='current'&&costBases.some(other=>other.snapshot&&other.name===row.name)?' · 현재':''}</strong></button>`).join('')}
   </div>
   <button type="button" class="btn studio-stage-summary-toggle" data-stage-action="details" aria-controls="studio-stage-table" aria-expanded="${view.detailsOpen}">
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 10h18M9 10v10"/></svg><span>단계별 핵심 지표 요약표</span><svg class="studio-stage-summary-chevron" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
   </button></div>
   <div class="studio-stage-actions"><button type="button" class="btn" data-milestone-add${view.editor?.pending?' disabled':''}>단계 추가</button></div></div>
   <div class="studio-stage-comparison">
     <div class="studio-stage-project">
      <div class="studio-stage-facts">
       <div><span>사업 준공 시점</span><b>${A.esc(periodEnd?displayDate(periodEnd):'—')}</b></div>
       <div><span>연면적</span><b>${formatStageArea(A,gfa,0)}</b><small class="studio-stage-area-m2">${gfa==null?'—':A.num(gfa,2)+'㎡'}</small></div>
      </div>
      ${stageComparison(A,stageFieldsByKey.get('duration'),baseline,basis)}
     </div>
     <div class="studio-stage-comparison-grid">
      ${stageComparison(A,stageFieldsByKey.get('cost'),baseline,basis)}
      ${stageComparison(A,stageFieldsByKey.get('funding'),baseline,basis)}
      ${['construction','interest'].map(key=>stageComparison(A,stageFieldsByKey.get(key),baseline,basis)).join('')}
     </div>

   </div>
   <div id="studio-stage-table" class="table-wrap studio-stage-table" role="region" aria-label="개발 단계별 비교표 스크롤" tabindex="0"${view.detailsOpen?'':' hidden inert'}>
    ${renderStageTable(A,project,costBases,basis,view.editor)}

   </div>`;
  if(motion)metricAnimations=animateStageMetrics(body,previous,motion==='entry');
  bindStageEditor(A,stagePanel,project,view,{
   render,
   refresh:()=>{costBases=milestoneRows(A,project);current=costBases.at(-1);render();},
   current:()=>current,
   rows:()=>costBases
  });
 }
 async function load(){
  const response=await fetch(url);
  if(!response.ok)throw Error('개발 단계 기록을 불러오지 못했습니다.');
  stages=(await response.json()).stages;
  const before=JSON.stringify(costBases);
  A.financeMilestones.setUnderwritingReference(project.id,stages.find(row=>row.id==='example-1'&&row.sample));
  costBases=milestoneRows(A,project);
  current=costBases.at(-1);
  if(stagePanel.isConnected&&JSON.stringify(costBases)!==before)render({motion:true});
 }
 function loadOrRetry(){
  load().catch(()=>{
   // Keep the already-rendered linked values when the optional reference is unavailable.
  });
 }
 stagePanel.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.hasAttribute('data-milestone-add')){
   try{if(!view.editor)view.editor=createStageDraft(A,project,{kind:'create'});}catch(error){A.toast(error.message);return;}
   view.detailsOpen=true;render();
   const input=body.querySelector('[data-stage-editor] [data-stage-input="name"]');
   input?.scrollIntoView({block:'center',inline:'end'});input?.focus({preventScroll:true});return;
  }
  if(button.dataset.costBasis){
   if(button.dataset.costBasis===selectedBasis().id)return;
   view.basisId=button.dataset.costBasis;
   const group=button.parentElement;
   const selector='[data-cost-basis]';
   const scroll=group.scrollLeft;
   const tableScroll=body.querySelector('.studio-stage-table').scrollLeft;
   render({motion:true});
   body.querySelector('.studio-stage-table').scrollLeft=tableScroll;
   const selected=body.querySelector(selector+'[aria-pressed="true"]');
   selected.parentElement.scrollLeft=scroll;
   selected.focus({preventScroll:true});
   return;
  }
  const operation=button.dataset.stageAction;
  if(operation==='details'){
   if(view.editor&&view.detailsOpen){A.toast('입력 중인 단계를 저장하거나 취소해 주세요.');return;}
   view.detailsOpen=!view.detailsOpen;
   button.setAttribute('aria-expanded',String(view.detailsOpen));
   const table=body.querySelector('.studio-stage-table'),opening=view.detailsOpen;
   const startHeight=table.hidden?0:table.getBoundingClientRect().height;
   const startOpacity=table.hidden?0:Number(getComputedStyle(table).opacity);
   const startMargin=table.hidden?0:parseFloat(getComputedStyle(table).marginTop);
   detailsAnimation?.cancel();detailsAnimation=null;
   table.hidden=false;table.inert=!opening;
   const finish=()=>{table.hidden=!opening;table.style.removeProperty('overflow');};
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
   const fullHeight=table.getBoundingClientRect().height;
   table.style.overflow='hidden';
   const animation=table.animate([
    {height:startHeight+'px',opacity:startOpacity,marginTop:startMargin+'px'},
    {height:(opening?fullHeight:0)+'px',opacity:opening?1:0,marginTop:opening?'10px':'0px'}
   ],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'});
   detailsAnimation=animation;
   animation.onfinish=()=>{if(detailsAnimation!==animation)return;detailsAnimation=null;finish();};
   return;
  }

 });
 render({motion:'entry'});
 loadOrRetry();
}
