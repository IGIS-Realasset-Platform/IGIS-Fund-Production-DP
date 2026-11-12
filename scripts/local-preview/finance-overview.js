import {currentCapitalSources,capitalSourceTotal,capitalSourceGroups} from './finance-capital.js';
import {stageFields} from './finance-stage-fields.js';
import {createStageDraft} from './finance-stage-editor-model.js';
import {renderStageTable,bindStageEditor} from './finance-stage-editor-ui.js';
import {milestoneRows,installMilestoneCapture,underwritingBasis,costPerPyeong} from './finance-milestones.js';

const eok=100_000_000;
const groupColors=['#253985','#426eaa','#5886a2','#796ba4','#536b87','#815c84'];
const stageViews=new Map();
const stageFieldsByKey=new Map(stageFields.map(field=>[field.key,field]));
const volumeKeys=['funding','cost','sale','land','construction','interest'];
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
  ${total>0&&!hasMissing?`<p class="studio-capital-caption">${A.esc(basis.name)} · ${basis.snapshot?'당시 약정·출자 기준':'대출 약정액·출자액 기준'}</p>`:''}
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
   <ol>${group.people.map(person=>`<li><div><span>${A.esc(person.name||'기관명 미입력')}${person.role?`<small>${A.esc(person.role)}</small>`:''}</span><b>${money(person.amount)}</b></div></li>`).join('')}</ol>`;
  cards.append(card);
 });
 showGroup();
}

const fieldDisplay=(A,value,unit)=>value==null?'—':unit?A.num(value)+'개월':A.money(value);
function changeText(A,value,previous,unit){
 if(value==null||previous==null)return '—';
 const delta=value-previous;
 return (delta>0?'+':delta<0?'−':'')+fieldDisplay(A,Math.abs(delta),unit);
}
function displayDate(date){return date.replaceAll('-','.');}
function costUnitDisplay(A,row){
 const value=costPerPyeong(row);
 return `<span class="studio-stage-unit-cost">${value===null?'평당 —':A.num(Math.round(value))+'만원/평'}</span>`;
}
function comparisonDisplay(A,value,unit,key){
 if(value==null)return '—';
 return key==='construction'?new Intl.NumberFormat('ko-KR',{minimumFractionDigits:1,maximumFractionDigits:1}).format(value/eok)+'억원':fieldDisplay(A,value,unit);
}
function stageComparison(A,field,baseline,stage){
 const {key,label,unit}=field;
 const value=stage.values[key],initial=baseline?.values[key];
 const delta=value==null||initial==null?null:value-initial;
 const compare=!!baseline;
 return `<article class="studio-stage-pair" data-stage-field="${key}"><h4>${summaryLabels[key]||label}</h4>
  <div class="studio-stage-values">
   ${compare?`<div><span>${A.esc(baseline.name)}</span>${key==='cost'?costUnitDisplay(A,baseline):''}<b>${comparisonDisplay(A,initial,unit,key)}</b></div><span aria-hidden="true">→</span>`:''}
   <div><span>${A.esc(stage.name)}</span>${key==='cost'?costUnitDisplay(A,stage):''}<b>${comparisonDisplay(A,value,unit,key)}</b></div>
  </div>
  ${compare&&delta!==null?`<small class="${delta>0?'studio-stage-up':delta<0?'studio-stage-down':''}">${key==='construction'?(delta>0?'+':delta<0?'−':'')+comparisonDisplay(A,Math.abs(delta),unit,key):changeText(A,value,initial,unit)}</small>`:''}
 </article>`;
}
function toInput(amount,unit){return amount==null?'':String(unit?amount:amount/eok);}
function fromInput(raw,unit){
 const value=String(raw).trim();
 if(!value)return null;
 if(!(unit?/^\d+$/:/^\d+(?:\.\d{1,8})?$/).test(value))return NaN;
 if(unit)return Number(value);
 const [whole,fraction='']=value.split('.');
 return Number(whole)*eok+Number(fraction.padEnd(8,'0'));
}

function stageDialog(A,stage,operation,commit,origin,restore){
 const deleting=operation==='delete';
 const editing=operation==='update';
 const title=deleting?'개발 단계 삭제':editing?'개발 단계 수정':'개발 단계 추가';
 const dialog=document.createElement('dialog');
 dialog.className='dp-dialog studio-stage-dialog';
 dialog.setAttribute('aria-labelledby','studio-stage-dialog-title');
 dialog.innerHTML=`<div class="dialog-head"><h2 id="studio-stage-dialog-title">${title}</h2><button type="button" class="btn" data-stage-close>닫기</button></div>
  <form method="dialog" class="studio-stage-form">
   <div class="dialog-body">${deleting?`<p><strong>${A.esc(stage.name)}</strong> 단계 기록을 삭제하시겠습니까?</p>`:`
    <div class="studio-stage-form-head">
     <label>단계명<input name="name" required maxlength="80" value="${A.esc(stage?.name||'')}"></label>
     <label>기준일<input name="date" type="date" required value="${A.esc(stage?.date||'')}"></label>
    </div>
    <label>변경 사유·관련 이슈<textarea name="reason" required maxlength="1000" rows="3">${A.esc(stage?.reason||'')}</textarea></label>
    <div class="studio-stage-input-grid"><b>지표</b><b>금액·기간</b><b>지표별 사유</b>
    ${stageFields.map(({key,label,unit})=>`<label for="studio-stage-${key}">${label}</label>
     <div><input id="studio-stage-${key}" name="${key}" inputmode="${unit?'numeric':'decimal'}" value="${A.esc(toInput(stage?.values[key],unit))}" aria-label="${label} (${unit||'억원'})"><span>${unit||'억원'}</span></div>
     <input name="${key}-note" maxlength="500" value="${A.esc(stage?.notes[key]||'')}" aria-label="${label} 변경 사유">
    `).join('')}
    </div>`}
    <p class="studio-stage-error" role="alert" hidden></p>
   </div>
   <div class="dialog-foot"><button type="button" class="btn" data-stage-close>취소</button><button type="submit" class="btn primary">${deleting?'삭제':'저장'}</button></div>
  </form>`;
 const form=dialog.querySelector('form');
 const error=dialog.querySelector('.studio-stage-error');
 const buttons=dialog.querySelectorAll('button');
 let pending=false;
 let saved=false;
 function showError(message){
  error.textContent=message;
  error.hidden=false;
  error.scrollIntoView({block:'nearest'});
 }
 for(const button of dialog.querySelectorAll('[data-stage-close]'))button.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('cancel',event=>{if(pending)event.preventDefault()});
 dialog.addEventListener('close',()=>{
  dialog.remove();
  if(saved)restore();
  else if(origin.isConnected)origin.focus({preventScroll:true});
 },{once:true});
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(pending)return;
  error.hidden=true;
  const change={operation,id:stage?.id,revision:stage?.revision};
  if(!deleting){
   const data=new FormData(form);
   const values={},notes={};
   for(const {key,label,unit} of stageFields){
    const amount=fromInput(data.get(key),unit);
    if(amount!==null&&(!Number.isSafeInteger(amount)||(unit&&amount>1200))){
     showError(label+'의 입력값을 확인해 주세요.');
     form.elements.namedItem(key).focus();
     return;
    }
    values[key]=amount;
    notes[key]=data.get(key+'-note');
   }
   change.record={name:data.get('name'),date:data.get('date'),reason:data.get('reason'),values,notes};
  }
  pending=true;
  buttons.forEach(button=>{button.disabled=true});
  try{
   await commit(change);
   saved=true;
   dialog.close();
  }catch(failure){showError(failure.message)}
  finally{
   pending=false;
   buttons.forEach(button=>{button.disabled=false});
  }
 });
 document.body.append(dialog);
 dialog.showModal();
 (deleting?dialog.querySelector('.dialog-foot button'):form.elements.namedItem('name')).focus();
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
 const summaryLabel=field=>summaryLabels[field.key]||field.label;
 const summaryValue=(field,basis)=>fieldDisplay(A,basis.values[field.key]);
 let stages=[],recordsState='loading';
 if(!stageViews.has(project.id))stageViews.set(project.id,{selectedId:null,detailsOpen:false,volume:'funding'});
 const view=stageViews.get(project.id);
 const selectedBasis=()=>costBases.find(basis=>basis.id===view.basisId)||current;
 function render(){
  const stage=stages.find(row=>row.id===view.selectedId)||stages.at(-1);
  view.selectedId=stage?.id;
  const basis=selectedBasis();
  renderCapital(A,capital,summary,project,basis);
  for(const {el,title}of liveHeadings)el.textContent=basis.snapshot?title+' · '+current.name:title;
  const baseline=underwritingBasis(costBases);
  const gfa=basis.gfa;
  const periodEnd=basis.periodEnd;
  const volume=stageFieldsByKey.get(view.volume);
  body.innerHTML=`
   <div class="studio-milestone-toolbar"><div class="studio-stage-selector" role="group" aria-label="사업비 비교 기준 선택">
    ${costBases.map(row=>`<button type="button" aria-pressed="${row===basis}" data-cost-basis="${A.esc(row.id)}">
     ${row.date?`<span>${A.esc(displayDate(row.date))}</span>`:''}<strong>${A.esc(row.name)}${row.id==='current'&&costBases.some(other=>other.snapshot&&other.name===row.name)?' · 현재':''}</strong></button>`).join('')}
   </div>
   <div class="studio-stage-actions"><button type="button" class="btn" data-milestone-add${view.editor?.pending?' disabled':''}>단계 추가</button></div></div>
   <div class="studio-stage-volume">
    <div class="studio-stage-volume-main">
     <span data-volume-label>${summaryLabel(volume,basis)}</span>
     <b data-volume-value>${summaryValue(volume,basis)}</b>
     <div class="studio-stage-volume-picker" role="group" aria-label="사업 규모 지표 선택">
      ${volumeKeys.map(key=>`<button type="button" data-volume-key="${key}" aria-pressed="${key===volume.key}">${summaryLabels[key]||stageFieldsByKey.get(key).label}</button>`).join('')}
     </div>
    </div>
    <div class="studio-stage-metrics">${stageFields.slice(0,3).map(field=>
     `<div><h4>${summaryLabel(field,basis)}</h4><b>${summaryValue(field,basis)}</b></div>`).join('')}</div>
   </div>
   <div class="studio-stage-comparison">
     <div class="studio-stage-project">
      <div class="studio-stage-facts">
       <div><span>사업 종료 예정</span><b>${A.esc(periodEnd?displayDate(periodEnd):'—')}</b>${basis.periodEndReference?'<small>시작월·개발기간 기준</small>':''}</div>
       <div><span>연면적</span><b>${gfa==null||gfa===''?'—':A.num(gfa)+'㎡'}</b>${basis.gfaReference?'<small>사업개요 기준</small>':''}</div>
      </div>
      ${stageComparison(A,stageFieldsByKey.get('duration'),baseline,basis)}
     </div>
     <div class="studio-stage-comparison-grid">
      ${stageComparison(A,stageFieldsByKey.get('cost'),baseline,basis)}
      ${stageComparison(A,stageFieldsByKey.get('funding'),baseline,basis)}
      ${['construction','interest'].map(key=>stageComparison(A,stageFieldsByKey.get(key),baseline,basis)).join('')}
     </div>
     <button type="button" class="studio-stage-reveal" data-stage-action="details" aria-controls="studio-stage-table" aria-expanded="${view.detailsOpen}">
      <span>${view.detailsOpen?'핵심 지표 닫기':'핵심 지표 보기'}</span>
     </button>
   </div>
   <div id="studio-stage-table" class="table-wrap studio-stage-table" role="region" aria-label="개발 단계별 비교표 스크롤" tabindex="0"${view.detailsOpen?'':' hidden'}>
    ${renderStageTable(A,project,costBases,basis,view.editor)}
    <details class="studio-legacy-stages"${view.legacyOpen?' open':''}><summary>이전 별도 단계 기록</summary>
    <div class="studio-stage-controls">
     ${stage?`<div class="studio-stage-selector" role="group" aria-label="저장된 단계 기록 선택">
      ${stages.map(row=>`<button type="button" aria-pressed="${row===stage}" data-stage-id="${A.esc(row.id)}">
       <span>${displayDate(row.date)}</span><strong>${A.esc(row.name)}</strong>${row.sample?'<small>예시</small>':''}</button>`).join('')}
     </div>`:''}
     <div class="studio-stage-actions">${stage?'<button type="button" class="btn" data-stage-action="update">수정</button><button type="button" class="btn" data-stage-action="delete">삭제</button>':''}<button class="btn primary" type="button" data-stage-action="create"${recordsState==='ready'?'':' disabled'}>+ 단계 추가</button></div>
    </div>
    ${stage?`
    <table class="dense-table" aria-label="개발 단계별 핵심 지표 비교">
     <thead><tr><th scope="col">별도 단계 기록</th>${stages.map(row=>`<th scope="col" data-selected="${row===stage}">${A.esc(row.name)}<small>${displayDate(row.date)}${row.sample?' · 예시':''}</small></th>`).join('')}</tr></thead>
     <tbody>${stageFields.map(({key,label,unit})=>`<tr><th scope="row">${key==='cost'?'단계별 원가':key==='funding'?'단계별 조달 계획액':label}</th>
      ${stages.map(row=>`<td data-selected="${row===stage}"><strong>${fieldDisplay(A,row.values[key],unit)}</strong>${row.notes[key]?`<small>${A.esc(row.notes[key])}</small>`:''}</td>`).join('')}</tr>`).join('')}
      <tr><th scope="row">변경 사유·관련 이슈</th>${stages.map(row=>`<td data-selected="${row===stage}">${A.esc(row.reason)}</td>`).join('')}</tr>
     </tbody>
    </table>`:`<p class="studio-finance-note" role="status">${recordsState==='loading'?'개발 단계 기록을 불러오는 중입니다.':recordsState==='error'?'개발 단계 기록을 불러오지 못했습니다. <button type="button" class="btn" data-stage-action="retry">다시 불러오기</button>':'등록된 개발 단계가 없습니다.'}</p>`}
    </details>
   </div>`;
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
  A.financeMilestones.setUnderwritingReference(project.id,stages.find(row=>row.id==='example-1'&&row.sample));
  costBases=milestoneRows(A,project);
  current=costBases.at(-1);
  recordsState='ready';
  if(stagePanel.isConnected)render();
 }
 function loadOrRetry(){
  load().catch(()=>{
   recordsState='error';
   if(stagePanel.isConnected)render();
  });
 }
 stagePanel.addEventListener('toggle',event=>{
  if(event.target.matches('.studio-legacy-stages')&&event.target.isConnected)view.legacyOpen=event.target.open;
 },true);
 stagePanel.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.hasAttribute('data-milestone-add')){
   try{if(!view.editor)view.editor=createStageDraft(A,project,{kind:'create'});}catch(error){A.toast(error.message);return;}
   view.detailsOpen=true;render();
   const input=body.querySelector('[data-stage-editor] [data-stage-input="name"]');
   input?.scrollIntoView({block:'center',inline:'end'});input?.focus({preventScroll:true});return;
  }
  if(button.dataset.volumeKey){
   view.volume=button.dataset.volumeKey;
   const field=stageFieldsByKey.get(view.volume);
   const basis=selectedBasis();
   body.querySelector('[data-volume-label]').textContent=summaryLabel(field,basis);
   body.querySelector('[data-volume-value]').textContent=summaryValue(field,basis);
   for(const item of body.querySelectorAll('[data-volume-key]'))item.setAttribute('aria-pressed',String(item===button));
   return;
  }
  if(button.dataset.costBasis||button.dataset.stageId){
   const key=button.dataset.costBasis?'basisId':'selectedId';
   view[key]=button.dataset.costBasis||button.dataset.stageId;
   const group=button.parentElement;
   const selector=button.dataset.costBasis?'[data-cost-basis]':'[data-stage-id]';
   const scroll=group.scrollLeft;
   const tableScroll=body.querySelector('.studio-stage-table').scrollLeft;
   render();
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
   button.firstElementChild.textContent=view.detailsOpen?'핵심 지표 닫기':'핵심 지표 보기';
   body.querySelector('.studio-stage-table').hidden=!view.detailsOpen;
   return;
  }
  if(operation==='retry'){loadOrRetry();return}
  if(!operation)return;
  const stage=operation==='create'?null:stages.find(row=>row.id===view.selectedId);
  if(operation!=='create'&&!stage)return;
  stageDialog(A,stage,operation,async change=>{
   if(!stagePanel.isConnected||A.current()?.id!==project.id)throw Error('선택한 프로젝트가 바뀌었습니다. 창을 닫고 다시 열어 주세요.');
   const response=await fetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(change)});
   const result=await response.json();
   if(response.status===409||response.status===404){
    await load().catch(()=>{});
    throw Error('이 기록이 다른 곳에서 변경되었습니다. 입력한 내용은 이 창에 남아 있습니다. 최신 기록을 확인한 뒤 다시 시도해 주세요.');
   }
   if(!response.ok)throw Error(response.status===422?'단계명, 기준일, 금액과 변경 사유를 확인해 주세요.':'기록을 저장하지 못했습니다. 다시 시도해 주세요.');
   const previous=stages[stages.indexOf(stage)-1];
   stages=result.stages;
   view.selectedId=result.stage?.id||previous?.id||stages[0]?.id;
   if(stagePanel.isConnected)render();
  },button,()=>{
   const selector=operation==='update'?'[data-stage-action="update"]':'[aria-pressed="true"][data-stage-id]';
   (stagePanel.querySelector(selector)||stagePanel.querySelector('[data-stage-action="create"]')).focus({preventScroll:true});
  });
 });
 render();
 loadOrRetry();
}
