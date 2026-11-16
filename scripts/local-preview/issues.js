// Shared issue presentation for the local review; writes use the existing form/audit transaction.
export const liveIssues = project => (project.issues || []).filter(x => !x.deletedAt && x.active !== false);
export function issueRows(projects) {
  return projects.filter(p => !p.deletedAt && p.active !== false && !p.isExample)
    .flatMap(project => liveIssues(project).map(issue => ({project, issue})))
    .sort((a,b) => String(b.issue.date || '').replaceAll('.','-').localeCompare(String(a.issue.date || '').replaceAll('.','-')));
}
export function scheduleDirection(issue) {
  if (['increase','decrease','none'].includes(issue.scheduleImpactDirection)) return issue.scheduleImpactDirection;
  const text=String(issue.scheduleImpact || '').trim();
  if (/^(없음|영향\s*없음|0\s*일)$/.test(text)) return 'none';
  if (/단축|감소|앞당|^[−-]/.test(text)) return 'decrease';
  if (/지연|연장|증가|^\+|^(?:(?:예상|약)\s*)?\d+(\.\d+)?\s*(?:일|개월|월|년)$/.test(text)) return 'increase';
  return '';
}
export function issueInitial(issue = {}, today = '') {
  const n=issue.costImpact, known=n!==null && n!==undefined && n!=='' && Number.isFinite(Number(n));
  return {date:issue.date || today,title:issue.title || '',current:issue.current || '',
    costImpact:known ? String(Math.abs(Number(n))) : '',costDirection:known ? Number(n)>0?'increase':Number(n)<0?'decrease':'none':'',
    scheduleImpact:issue.scheduleImpact || '',scheduleImpactDirection:scheduleDirection(issue)};
}
export function issueChanges(values, initial, original = {}, parseMoney = Number) {
  const next={...original}, errors={};
  const changed=k=>String(values[k]??'')!==String(initial[k]??'');
  for(const key of ['date','title','current','scheduleImpact']) {
    if(!changed(key))continue;
    const raw=String(values[key]??'');
    if(key==='title'&&!raw.trim())errors.title='현안을 입력해 주세요.';
    if(key==='date'&&raw&&(!/^\d{4}-\d{2}-\d{2}$/.test(raw)||!Number.isFinite(Date.parse(raw))||new Date(raw+'T00:00:00Z').toISOString().slice(0,10)!==raw))errors.date='올바른 날짜를 입력해 주세요.';
    next[key]=key==='title'?raw.trim():raw;
  }
  if(changed('costImpact')||changed('costDirection')) {
    const raw=String(values.costImpact??'').trim(),direction=values.costDirection;
    if(direction==='none')next.costImpact=0;
    else if(raw==='')next.costImpact=null;
    else try {
      const amount=parseMoney(raw);
      if(!Number.isFinite(amount)||amount<0)throw Error('금액은 0 이상의 숫자로 입력해 주세요.');
      if(amount>0&&!['increase','decrease'].includes(direction))throw Error('증가 또는 감소를 선택해 주세요.');
      next.costImpact=direction==='decrease'?-amount:amount;
    }catch(e){errors.costImpact=e.message;}
  }
  if(changed('scheduleImpactDirection')) {
    if(!['increase','decrease','none',''].includes(values.scheduleImpactDirection))errors.scheduleImpactDirection='일정 영향 방향을 선택해 주세요.';
    else next.scheduleImpactDirection=values.scheduleImpactDirection;
  }
  if(changed('scheduleImpact') && String(values.scheduleImpact||'').trim() && !values.scheduleImpactDirection)errors.scheduleImpactDirection='일정 영향 방향을 선택해 주세요.';
  if(changed('scheduleImpact')||changed('scheduleImpactDirection')) {
    const text=String(values.scheduleImpact||'').trim(),none=/^(없음|영향\s*없음|0\s*(?:일|개월))$/.test(text);
    if(values.scheduleImpactDirection==='none') {
      if(changed('scheduleImpact')&&text&&!none)errors.scheduleImpactDirection='내용에 맞게 지연 또는 단축을 선택해 주세요.';
      else next.scheduleImpact='없음';
    } else if(['increase','decrease'].includes(values.scheduleImpactDirection)&&(!text||none))errors.scheduleImpact='지연 또는 단축 내용을 입력해 주세요.';
  }
  if(Object.keys(errors).length) {const error=new Error('입력값을 확인해 주세요.');error.fields=errors;throw error;}
  return next;
}
function impact(A,issue,type) {
  if(type==='cost') {
    const raw=issue.costImpact;
    if(raw==null||raw===''||!Number.isFinite(Number(raw)))return '—';
    const value=Number(raw),direction=value>0?'increase':value<0?'decrease':'';
    return `<span class="issue-impact ${direction}">${value>0?'+':value<0?'−':''}${A.esc(A.money(Math.abs(value)))}</span>`;
  }
  const direction=scheduleDirection(issue),text=String(issue.scheduleImpact||'');
  return `<span class="issue-impact ${direction==='none'?'':direction}">${direction==='increase'?'+ ':direction==='decrease'?'− ':''}${A.esc(text.replace(/^[+−-]\s*/,''))||'—'}</span>`;
}
export function renderIssues(A, rows, {home=false, expanded=new Set()}={}) {
  const E=A.esc,heads=home?['프로젝트','현안','진행내용','원가영향','일정영향','발생일']:['현안','진행내용','원가영향','일정영향','발생일',''];
  const kinds=home?['project','title','progress','cost','schedule','date']:['title','progress','cost','schedule','date','actions'];
  return `<div class="table-wrap"><table class="dense-table studio-issues ${home?'is-home':''}"><colgroup>${kinds.map(k=>`<col class="issue-col-${k}">`).join('')}</colgroup><thead><tr>${heads.map((h,i)=>`<th class="issue-${kinds[i]}">${h}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(({project:p,issue:x})=>{
    const key=JSON.stringify([p.id,x.id]),open=expanded.has(key),canEdit=A.canEditProject(p.id)&&p.active!==false&&!p.deletedAt;
    const attrs=`data-issue-key="${E(key)}"`,id='issue-detail-'+encodeURIComponent(p.id+'-'+x.id);
    return `<tr class="issue-summary" ${attrs} tabindex="0" aria-expanded="${open}" aria-controls="${E(id)}" aria-label="${E(x.title)} 진행내용 ${open?'접기':'펼치기'}">${home?`<td class="issue-project">${E(p.name)}</td>`:''}<td class="issue-title">${E(x.title)}</td><td class="issue-progress"><span class="issue-preview">${E(x.current)||'—'}</span><span class="issue-chevron" aria-hidden="true">${open?'⌃':'⌄'}</span></td><td class="issue-cost">${impact(A,x,'cost')}</td><td class="issue-schedule">${impact(A,x,'schedule')}</td><td class="issue-date">${E(String(x.date||'—').replaceAll('-','.'))}</td>${!home?`<td class="issue-actions">${canEdit?A.btn('수정','issue-edit',{id:x.id,projectId:p.id},'text')+A.btn('삭제','issue-delete',{id:x.id},'text'):''}</td>`:''}</tr><tr class="issue-detail" id="${E(id)}" ${open?'':'hidden'}><td colspan="${home?3:heads.length}"><div class="issue-detail-layout"><div class="issue-full-progress">${E(x.current)||'등록된 진행내용이 없습니다.'}</div></div></td>${home?`<td colspan="3" class="issue-detail-action">${A.btn('자세히보기','go',{view:'overview',projectId:p.id},'issue-view-project')}</td>`:''}</tr>`;
  }).join(''):`<tr><td colspan="${heads.length}">등록된 현안이 없습니다.</td></tr>`}</tbody></table></div>`;
}
const states=new Map();
const issuePanels=new WeakMap(),dismissDocuments=new WeakSet();
function setIssueExpanded(row,state,open){
 const key=row.dataset.issueKey;
 if(open)state.expanded.add(key);else state.expanded.delete(key);
 row.setAttribute('aria-expanded',String(open));
 row.setAttribute('aria-label',row.getAttribute('aria-label').replace(/접기|펼치기$/,open?'접기':'펼치기'));
 row.nextElementSibling.hidden=!open;
 row.querySelector('.issue-chevron').textContent=open?'⌃':'⌄';
}
function installIssueDismissal(doc){
 if(dismissDocuments.has(doc))return;
 dismissDocuments.add(doc);
 doc.addEventListener('click',event=>{
  for(const row of doc.querySelectorAll('.studio-issues .issue-summary[aria-expanded="true"]')){
   if(row.contains(event.target)||row.nextElementSibling.contains(event.target))continue;
   const state=issuePanels.get(row.closest('.panel'));
   if(state)setIssueExpanded(row,state,false);
  }
 },true);
}
function wirePanel(panel,state) {
  issuePanels.set(panel,state);
  installIssueDismissal(panel.ownerDocument);
  panel.addEventListener('click',e=>{
    const more=e.target.closest('[data-issue-more]');
    if(more){const previous=state.limit;state.limit+=10;state.paint();(panel.querySelectorAll('.issue-summary')[previous]||panel.querySelector('[data-issue-more]'))?.focus();return;}
    if(e.target.closest('button,a,input,select,textarea'))return;
    const row=e.target.closest('.issue-summary');if(!row)return;
    const key=row.dataset.issueKey,open=!state.expanded.has(key);
    setIssueExpanded(row,state,open);
  });
  panel.addEventListener('keydown',e=>{if(e.target.matches('.issue-summary')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.click();}});
}
export function decorateIssues(A,content,project=null) {
  const home=!project,key=home?'home':project.id;
  let state=states.get(key);if(!state){state={limit:5,expanded:new Set()};states.set(key,state);}
  let panel;
  if(home) {
    if(content.querySelector('[data-issues-home]'))return;
    content.insertAdjacentHTML('beforeend',A.panel('프로젝트별 주요현황','').replace('<section class="panel">','<section class="panel" data-issues-home>'));
    panel=content.querySelector('[data-issues-home]');
  } else {
    panel=content.querySelector('[data-action="issue-add"]')?.closest('.panel') || [...content.querySelectorAll('.panel')].find(p=>p.querySelector('h2')?.textContent.includes('주요 현안'));
    if(!panel||panel.dataset.issuesReady)return;
    panel.dataset.issuesReady='true';
    panel.querySelector('h2').textContent='주요 현안 관리';
    const add=panel.querySelector('[data-action="issue-add"]');if(add)add.textContent='+ 현안 등록';
  }
  state.paint=()=>{
    const rows=issueRows(home?A.state.projects:[project]),shown=home?rows.slice(0,state.limit):rows;
    panel.querySelector('.panel-body').innerHTML=renderIssues(A,shown,{home,expanded:state.expanded})+(home&&rows.length>shown.length?`<div class="issue-more-wrap"><button type="button" class="btn" data-issue-more>펼쳐보기</button></div>`:'');
  };
  state.paint();wirePanel(panel,state);
}
export function installIssueForms(A) {
  function open(button,adding) {
    const projectId=button?.dataset.projectId||A.current()?.id,id=button?.dataset.id;
    const owner=()=>{const found=A.state.projects.filter(p=>p.id===projectId&&!p.deletedAt&&p.active!==false);return found.length===1&&A.ui.projectId===projectId&&A.current()?.id===projectId&&A.canEditProject(projectId)?found[0]:null;};
    const p=owner(),matches=p&&id?liveIssues(p).filter(x=>x.id===id):[],original=adding?{}:matches.length===1?matches[0]:null;
    if(!p||!original)return A.toast('현재 사업의 현안과 수정 권한을 확인해 주세요.');
    const snapshot=JSON.stringify(original),initial=issueInitial(original,adding?A.today:'');
    const directions=[{value:'',label:'선택해 주세요'},{value:'increase',label:'증가 (+)'},{value:'decrease',label:'감소 (−)'},{value:'none',label:'영향 없음'}];
    const schedules=directions.map(x=>({...x,label:x.value==='increase'?'지연 (+)':x.value==='decrease'?'단축 (−)':x.label}));
    const fields=A.field('date','발생일',initial.date,'date')+A.field('title','현안',initial.title)+A.field('current','진행내용',initial.current,'textarea')+A.field('costDirection','원가 영향 방향',initial.costDirection,'select',directions)+A.field('costImpact','원가 영향 금액 (원)',initial.costImpact,'number')+A.field('scheduleImpactDirection','일정 영향 방향',initial.scheduleImpactDirection,'select',schedules)+A.field('scheduleImpact','일정 영향 내용',initial.scheduleImpact);
    return A.form(adding?'현안 등록':'현안 수정',fields,v=>{
      const current=owner(),targets=current&&id?liveIssues(current).filter(x=>x.id===id):[],target=adding?{}:targets.length===1?targets[0]:null;
      if(!current||!target||(!adding&&JSON.stringify(target)!==snapshot))throw A.inputError({title:'사업·현안 또는 수정 권한이 변경되어 저장하지 않았습니다. 다시 열어 주세요.'});
      if(!String(v.title||'').trim())throw A.inputError({title:'현안을 입력해 주세요.'});
      let next;try{next=issueChanges(v,adding?{}:initial,target,raw=>A.parseInlineValue('money',raw,1));}catch(e){throw A.inputError(e.fields||{title:e.message});}
      if(!adding&&JSON.stringify(target)===JSON.stringify(next))return false;
      const before=adding?null:A.clone(target);
      if(adding){next.id=A.uid('issue');current.issues=current.issues||[];current.issues.push(next);}else Object.assign(target,next);
      A.audit(adding?'CREATE':'UPDATE','issue',adding?next.id:id,before,adding?next:target,`${current.id} 현안 ${adding?'등록':'변경'}`,{view:'overview',projectId});
      return true;
    },adding?'등록':'변경사항 저장',{initialValues:initial,baselineValues:initial,draftContext:'issue:'+projectId+':'+(adding?'new':id)});
  }
  A.on('issue-add',b=>open(b,true));A.on('issue-edit',b=>open(b,false));
}
