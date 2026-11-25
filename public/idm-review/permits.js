// Local presentation only. The original list, filter buttons and event targets stay mounted.
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// Keep the original resize handles, column order and table-width storage key.
function renameColumn(th, title) {
  if (!th) return;
  const label = [...th.childNodes].find(n => n.nodeType === 3);
  if (label) label.textContent = title;
  th.querySelector('[role="separator"]')?.setAttribute('aria-label', title + ' 열 너비 조절');
}

function pair(cell, firstLabel, firstDate, secondLabel, secondDate) {
  if (!cell || cell.querySelector('.lp-dates')) return;
  const list = element('dl', 'lp-dates');
  for (const [label, value, original] of [[firstLabel, firstDate, false], [secondLabel, secondDate, true]]) {
    const group = element('div'), dt = element('dt', '', label), dd = element('dd');
    if (original) dd.append(...cell.childNodes);
    else dd.textContent = value || '—';
    if (!value) {
      dd.className = 'lp-date-empty';
      dd.setAttribute('aria-label', label + ' 기록 없음');
    }
    group.append(dt, dd); list.append(group);
  }
  cell.append(list);
}

export function decoratePermits(A, content, p) {
  const workspace = content.querySelector('[data-permit-workspace]');
  if (!workspace || !p || workspace.dataset.localPermitDecorated) return;
  workspace.dataset.localPermitDecorated = 'true';
  const heading = workspace.querySelector('.permit-workspace-heading');
  if (!heading) return;
  const title = heading.querySelector('h2');
  if (title) title.textContent = '등록 인허가';
  const records = (p.permits || []).filter(r => !r.deletedAt);
  const table = workspace.querySelector('.permit-core-table');
  if (!table) return;
  const heads = [...table.tHead.rows[0].cells];
  const at = label => heads.findIndex(th => th.firstChild?.textContent.trim() === label);
  const plan = at('목표 완료일'), actual = at('승인일'), stage = at('상태');
  const visible = [], byId = new Map(records.map(r => [r.id,r]));
  for (const row of table.tBodies[0].rows) {
    const button = row.querySelector('[data-action="permit-record-detail"]');
    if (!button) continue;
    const record = byId.get(button.dataset.id);
    if (!record) continue;
    visible.push(record);
    if (row.cells[stage]) row.cells[stage].dataset.lpPermitStatus = A.permitViews.permitBucket(record);
    pair(row.cells[plan], '계획 신청', record.plannedApplication, '목표 완료', record.expected);
    pair(row.cells[actual], '실제 신청', record.application, '승인', record.approval);
  }
  renameColumn(heads[plan],'계획 일정');
  renameColumn(heads[actual],'실제 일정');
  if (!visible.length && records.length) {
    const empty = table.querySelector('.empty');
    if (empty) empty.textContent = '선택한 상태의 인허가가 없습니다.';
  }
}

// Derive the next payment from live records; never manufacture a remaining instalment.
export function landNextAction(p, today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())) {
  const contracts=(p.landContracts||[]).filter(x=>!x.deletedAt);
  const payments=(p.landPaymentSchedule||[]).filter(x=>!x.deletedAt);
  const date=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
  const amount=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
  if(!contracts.length)return {kind:'empty',title:'등록된 토지매매계약이 없습니다'};
  const byId=new Map(contracts.map(x=>[x.id,x]));
  const linked=payments.filter(x=>byId.has(x.contractId));
  const pending=linked.filter(x=>x.paid!==true&&date(x.plannedDate)).sort((a,b)=>a.plannedDate.localeCompare(b.plannedDate));
  if(pending.length){
    const row=pending[0],days=Math.round((Date.parse(row.plannedDate)-Date.parse(today))/86400000);
    return {paymentId:row.id,kind:days<0?'overdue':days===0?'today':'upcoming',title:byId.get(row.contractId).name||'토지매매계약',category:row.category||'지급 회차',amount:amount(row.amount)?row.amount:null,date:row.plannedDate,days};
  }
  const uncertain=linked.find(x=>x.paid!==true||!date(x.actualDate)||x.actualDate>today||!amount(x.amount));
  if(uncertain)return {kind:'check',title:'지급내역 확인',detail:byId.get(uncertain.contractId).name+' · '+(uncertain.category||'지급 회차')+'의 지급일·금액·완료 여부를 확인해 주세요.'};
  for(const contract of contracts){
    const rows=linked.filter(x=>x.contractId===contract.id);
    if(!rows.length||!amount(contract.amount)||rows.reduce((s,x)=>s+x.amount,0)!==contract.amount)
      return {kind:'check',title:'지급회차 확인',detail:(contract.name||'토지매매계약')+'의 계약금액과 등록된 지급회차를 확인해 주세요.'};
  }
  if(payments.some(x=>!byId.has(x.contractId)))return {kind:'check',title:'지급회차의 계약 연결 확인',detail:'계약이 연결되지 않은 지급회차가 있습니다.'};
  return {kind:'complete',title:'토지대금 지급 완료'};
}

export function decorateLand(A,content,p) {
  const panel=content.querySelector('[data-action="land-input-open"]')?.closest('.panel')||[...content.querySelectorAll('.panel')].find(x=>x.querySelector('h2')?.textContent==='부지확보');
  if(!panel||panel.classList.contains('lp-land-panel'))return;
  const original=panel.querySelector('table');if(!original)return;
  const cells=new Map([...original.querySelectorAll('tbody tr')].map(row=>[row.cells[0]?.textContent.trim(),row.cells[1]]));
  const table=element('table','lp-land-summary');table.setAttribute('aria-label','부지확보');
  const cols=document.createElement('colgroup');for(const width of ['16%','34%','16%','34%']){const col=document.createElement('col');col.style.width=width;cols.append(col)}table.append(cols);
  const body=document.createElement('tbody');table.append(body);
  const pairs=[['토지 확보 방식','매입률 (%)'],['권원 확보','권원 지연'],['지연사유','지연내용'],['협약체결일','협약당사자'],['법인명'],['법인 유형','법인 설립일']];
  for(const labels of pairs){const row=document.createElement('tr');for(const label of labels){const th=element('th','',label);th.scope='row';const td=cells.get(label)||element('td','','—');if(labels.length===1)td.colSpan=3;row.append(th,td)}body.append(row)}
  // Replace the old two-column wrapper, including its resize metadata, but retain cell actions.
  const wrapper=original.closest('.table-wrap')||original;
  wrapper.replaceWith(table);panel.classList.add('lp-land-panel');
  const next=landNextAction(p);
  const note=element('button','lp-land-next');note.dataset.status=next.kind;note.type='button';
  note.dataset.action='studio-land-payments';note.dataset.projectId=p.id;
  note.setAttribute('aria-label','토지대금 지급현황 전체 내역 보기');
  installLandPayments(A);
  note.append(element('span','lp-land-next-label','토지대금 지급현황'));
  const detail=element('span','lp-land-next-content');detail.append(element('strong','',next.title));
  if(next.category){const line=element('span','lp-land-next-payment');line.append(element('span','',next.category),element('strong','',next.amount===null?'금액 미입력':A.money(next.amount)),element('span','',next.date.replaceAll('-','.')));detail.append(line)}
  if(next.detail)detail.append(element('span','lp-land-next-description',next.detail));
  note.append(detail);
  if(next.days!=null)note.append(element('span','lp-land-next-due',next.days<0?Math.abs(next.days)+'일 경과':next.days===0?'오늘 지급 예정':'D-'+next.days));
  note.append(element('span','lp-land-next-edit-label','전체 내역 보기 ›'));
  panel.querySelector('.panel-body').append(note);
}

const landToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const landValidDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function landPaymentGroups(p,today=landToday()) {
  const contracts=(p.landContracts||[]).filter(x=>!x.deletedAt&&x.active!==false);
  const payments=(p.landPaymentSchedule||[]).filter(x=>!x.deletedAt&&x.active!==false);
  const make=(contract,rows)=>{
    const next=contract?landNextAction({landContracts:[contract],landPaymentSchedule:rows},today):null;
    return {id:contract?.id||'',name:contract?.name||'계약 연결 확인',amount:contract?.amount??null,next,
      rows:rows.slice().sort((a,b)=>(landValidDate(a.plannedDate)?a.plannedDate:'9999').localeCompare(landValidDate(b.plannedDate)?b.plannedDate:'9999')).map(record=>{
        const days=landValidDate(record.plannedDate)?Math.round((Date.parse(record.plannedDate)-Date.parse(today))/86400000):null;
        const complete=record.paid===true&&landValidDate(record.actualDate)&&record.actualDate<=today;
        const status=complete?'지급 완료':record.paid===true?'실제 지급일 확인':days==null?'예정일 미입력':days<0?Math.abs(days)+'일 경과':days===0?'오늘 지급 예정':'D-'+days;
        return {record,current:!!next?.paymentId&&next.paymentId===record.id,complete,status,tone:complete?'complete':record.paid===true||days==null?'check':days<0?'overdue':'pending'};
      })};
  };
  const groups=contracts.map(c=>make(c,payments.filter(x=>x.contractId===c.id)));
  const orphan=payments.filter(x=>!contracts.some(c=>c.id===x.contractId));if(orphan.length)groups.push(make(null,orphan));
  return groups;
}

function openLandPayments(A,projectId,scroll=0) {
  const p=A.current();if(!p||p.id!==projectId||p.deletedAt||p.active===false||!A.canUseView('permit')){A.closeModal({userInitiated:true});return;}
  const E=A.esc,groups=landPaymentGroups(p),editable=A.canEditProject(p.id);
  const money=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0?A.money(value):'—';
  const date=value=>landValidDate(value)?E(value.replaceAll('-','.')):'—';
  const html=groups.map(group=>{
    const rows=group.rows.map(({record:r,current,complete,status,tone},i)=>`<tr class="${current?'lp-payment-current':''}" ${current?'aria-current="step"':''}>
      <td><span class="lp-payment-step ${complete?'is-complete':''}">${complete?'✓':i+1}</span><span class="lp-payment-name">${E(r.category||'회차명 미입력')}${current?'<small>현재 처리할 회차</small>':''}</span></td>
      <td class="lp-payment-money">${money(r.amount)}</td><td>${date(r.plannedDate)}</td><td>${date(r.actualDate)}</td>
      <td><span class="lp-payment-status ${tone}">${E(status)}</span></td>
      <td>${editable?A.btn('수정','studio-land-payment-edit',{id:r.id,projectId},'quiet'):''}</td></tr>`).join('');
    return `<section class="lp-payment-contract"><header><h3>${E(group.name)}</h3><span>${group.next?.kind==='complete'?'<strong>전체 지급 완료</strong>':''}${group.amount!=null?' 계약금액 '+money(group.amount):''}</span></header>
    ${rows?`<div class="lp-payment-table-wrap"><table class="lp-payment-table"><colgroup><col style="width:29%"><col style="width:18%"><col style="width:14%"><col style="width:14%"><col style="width:17%"><col style="width:8%"></colgroup><thead><tr><th>지급회차</th><th class="lp-payment-money">금액</th><th>예정일</th><th>실제 지급일</th><th>지급 상태</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p class="lp-payment-empty">등록된 지급회차가 없습니다.</p>'}
    ${group.next?.kind==='check'?`<p class="lp-payment-warning">${E(group.next.detail||group.next.title)}</p>`:''}</section>`;
  }).join('');
  A.modal('토지대금 지급현황',`<div class="lp-payment-dialog" data-land-payment-project="${E(projectId)}">${html||'<p class="lp-payment-empty">등록된 토지매매계약과 지급회차가 없습니다.</p>'}</div>`);
  const body=document.querySelector('#app-dialog .dialog-body');if(body)body.scrollTop=scroll;
}
function installLandPayments(A) {
  if(A.hasAction('studio-land-payments'))return;
  A.on('studio-land-payments',button=>openLandPayments(A,button.dataset.projectId));
  A.on('studio-land-payment-edit',button=>{
    const projectId=button.dataset.projectId,scroll=document.querySelector('#app-dialog .dialog-body')?.scrollTop||0;
    A.legal.openLandPaymentEditor(projectId,button.dataset.id,{returnTo:()=>openLandPayments(A,projectId,scroll)});
  });
}
