import {stageFields} from './finance-stage-fields.js';

const eok=100_000_000;
const groupColors=['#253985','#426eaa','#5886a2','#796ba4','#536b87','#815c84'];
const amountOf=value=>{
 if(typeof value!=='number'&&(typeof value!=='string'||!value.trim()))return null;
 const amount=Number(value);
 return Number.isSafeInteger(amount)&&amount>=0?amount:null;
};
const totalOf=values=>values.length&&values.every(value=>value!==null)?values.reduce((sum,value)=>sum+value,0):null;

export function capitalGroups(project){
 const groups=new Map();
 function add(key,name,person,amount,role){
  if(!groups.has(key))groups.set(key,{name,people:[]});
  groups.get(key).people.push({name:person,amount:amountOf(amount),role});
 }
 for(const equity of project.equities||[]){
  if(!equity.deletedAt)add('equity','자기자본',equity.company,equity.amount,equity.purpose);
 }
 for(const loan of project.loans||[]){
  if(loan.deletedAt)continue;
  const tranche=String(loan.trancheName||loan.tranche||'').trim();
  const group=[loan.type,loan.rank].filter(Boolean).join(' · ')||'구분 미입력';
  add(tranche?'tranche:'+tranche:'loan:'+group,tranche||group,loan.institution,loan.commitment,tranche?group:'');
 }
 return [...groups.values()].map(group=>({...group,total:totalOf(group.people.map(person=>person.amount))}));
}

function renderCapital(A,capital,summary,project){
 const groups=capitalGroups(project);
 const total=totalOf(groups.map(group=>group.total));
 const money=amount=>amount===null?'—':A.money(amount);
 const loanCount=(project.loans||[]).filter(row=>!row.deletedAt).length;
 const equityCount=(project.equities||[]).filter(row=>!row.deletedAt).length;
 const hasMissing=groups.some(group=>group.total===null)||!loanCount||!equityCount;
 const body=capital.querySelector('.panel-body');
 body.classList.add('studio-capital');
 body.replaceChildren(summary);
 const chart=document.createElement('div');
 chart.className='studio-capital-chart';
 chart.innerHTML=`
  ${total>0&&!hasMissing?'<p class="studio-capital-caption">대출 약정액·출자액 기준</p>':''}
  <div class="studio-capital-bar" role="group" aria-label="약정·출자 기준 조달 비중"${total>0&&!hasMissing?'':' hidden'}></div>
  ${hasMissing&&groups.length?'<p class="studio-finance-note">약정액 또는 출자액이 모두 확인되면 조달 비중을 표시합니다.</p>':''}
  ${!groups.length?'<p class="studio-finance-note">등록된 대출·출자 내역이 없습니다.</p>':''}
  <div class="studio-capital-groups"></div>`;
 body.append(chart);
 const bar=chart.querySelector('.studio-capital-bar');
 const cards=chart.querySelector('.studio-capital-groups');
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
  Array.from(cards.children).forEach((card,key)=>{card.hidden=index!==null&&key!==index});
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
   if(share>=9)segment.innerHTML=`<strong>${A.esc(group.name)}</strong><span>${A.num(share,1)}%</span>`;
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
   <ul>${group.people.map(person=>`<li><span>${A.esc(person.name||'기관명 미입력')}${person.role?`<small>${A.esc(person.role)}</small>`:''}</span><b>${money(person.amount)}</b></li>`).join('')}</ul>`;
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
 renderCapital(A,capital,summary,project);
 const stagePanel=document.createElement('section');
 stagePanel.className='panel studio-finance-stages';
 stagePanel.innerHTML=`<div class="panel-header"><div class="panel-title"><h3>개발 단계별 핵심 지표</h3></div>
  <div class="inline studio-card-actions"><button class="btn primary studio-card-add" type="button" data-stage-action="create" disabled>+ 단계 추가</button></div></div>
  <div class="panel-body studio-stage-body"><p class="studio-finance-note" role="status">개발 단계 기록을 불러오는 중입니다.</p></div>`;
 root.insertBefore(stagePanel,capital);
 const body=stagePanel.querySelector('.studio-stage-body');
 const add=stagePanel.querySelector('[data-stage-action="create"]');
 const url='/api/local-finance-stages?'+new URLSearchParams({projectId:project.id});
 let stages=[],selectedId;
 function render(){
  add.disabled=false;
  const stage=stages.find(row=>row.id===selectedId)||stages.at(-1);
  selectedId=stage?.id;
  if(!stage){
   body.innerHTML='<p class="studio-finance-note">등록된 개발 단계가 없습니다.</p>';
   return;
  }
  const previous=stages[stages.indexOf(stage)-1];
  body.innerHTML=`
   <div class="studio-stage-selector" role="group" aria-label="개발 단계 선택">
    ${stages.map(row=>`<button type="button" aria-pressed="${row===stage}" data-stage-id="${A.esc(row.id)}">
     <span>${displayDate(row.date)}</span><strong>${A.esc(row.name)}</strong>${row.sample?'<small>예시</small>':''}</button>`).join('')}
   </div>
   <div class="studio-stage-metrics">${stageFields.slice(0,3).map(({key,label})=>{
    const amount=stage.values[key],prior=previous?.values[key],delta=amount!=null&&prior!=null?amount-prior:0;
    return `<div><span>${label}</span><b>${fieldDisplay(A,amount)}</b>${previous?`<small class="${delta>0?'studio-stage-up':delta<0?'studio-stage-down':''}">${changeText(A,amount,prior)}</small>`:''}</div>`;
   }).join('')}</div>
   <div class="studio-stage-context">
    <div><h4>변경 사유·관련 이슈</h4><p>${A.esc(stage.reason)}</p></div>
    <div class="studio-stage-actions"><button type="button" class="btn" data-stage-action="update">수정</button><button type="button" class="btn" data-stage-action="delete">삭제</button></div>
   </div>
   <div class="table-wrap studio-stage-table" role="region" aria-label="개발 단계별 핵심 지표 비교" tabindex="0">
    <table class="dense-table">
     <thead><tr><th scope="col">지표</th>${previous?`<th scope="col">${A.esc(previous.name)}</th>`:''}
      <th scope="col">${A.esc(stage.name)}</th>${previous?'<th scope="col">직전 단계 대비</th>':''}<th scope="col">지표별 사유</th></tr></thead>
     <tbody>${stageFields.map(({key,label,unit})=>{
      const amount=stage.values[key],prior=previous?.values[key],delta=amount!=null&&prior!=null?amount-prior:0;
      return `<tr><th scope="row">${label}</th>${previous?`<td>${fieldDisplay(A,prior,unit)}</td>`:''}
       <td><strong>${fieldDisplay(A,amount,unit)}</strong></td>${previous?`<td class="${delta>0?'studio-stage-up':delta<0?'studio-stage-down':''}">${changeText(A,amount,prior,unit)}</td>`:''}
       <td>${A.esc(stage.notes[key]||'—')}</td></tr>`;
     }).join('')}</tbody>
    </table>
   </div>`;
 }
 async function load(){
  const response=await fetch(url);
  if(!response.ok)throw Error('개발 단계 기록을 불러오지 못했습니다.');
  stages=(await response.json()).stages;
  if(stagePanel.isConnected)render();
 }
 function loadOrRetry(){
  load().catch(()=>{
   if(stagePanel.isConnected)body.innerHTML='<p class="studio-finance-note" role="status">개발 단계 기록을 불러오지 못했습니다. <button type="button" class="btn" data-stage-action="retry">다시 불러오기</button></p>';
  });
 }
 stagePanel.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.dataset.stageId){
   selectedId=button.dataset.stageId;
   render();
   Array.from(body.querySelectorAll('[data-stage-id]')).find(item=>item.dataset.stageId===selectedId)?.focus({preventScroll:true});
   return;
  }
  const operation=button.dataset.stageAction;
  if(operation==='retry'){loadOrRetry();return}
  if(!operation)return;
  const stage=operation==='create'?null:stages.find(row=>row.id===selectedId);
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
   selectedId=result.stage?.id||previous?.id||stages[0]?.id;
   if(stagePanel.isConnected)render();
  },button,()=>{
   const selector=operation==='update'?'[data-stage-action="update"]':'[aria-pressed="true"][data-stage-id]';
   (stagePanel.querySelector(selector)||add).focus({preventScroll:true});
  });
 });
 loadOrRetry();
}
