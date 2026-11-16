import {capitalSourceGroups,capitalSourceTotal} from './finance-capital.js';
import {stageFields} from './finance-stage-fields.js';
import {createStageDraft,commitStageDraft,previewStageDraft} from './finance-stage-editor-model.js';
import {underwritingBasis,costPerPyeong} from './finance-milestones.js';
const areaFactor=3.305785;
export const formatStageArea=(A,value,digits=2)=>value==null?'—':A.num(Number(value)/areaFactor,digits)+'평';
const areaInputValue=value=>value==null?'':Number((Number(value)/areaFactor).toFixed(4));
// Sale data remains in stored snapshots; it is no longer a user-facing financing metric.
const visibleStageFields=stageFields.filter(field=>field.key!=='sale');
const labels={funding:'총 조달규모',land:'토지매입비'};
const display=(A,v,key)=>v==null?'—':key==='duration'?A.num(v)+'개월':A.money(v);
const deltaText=(A,value,base,key)=>value==null||base==null||value===base?'':`(${value>base?'+':'−'}${display(A,Math.abs(value-base),key)})`;
function linkedDetailHTML(A,row,key){
 const d=row.linkedDetails||{};
 if(key==='debt'){
  if(!Array.isArray(row.capitalSources))return '<strong>—</strong>';
  const sources=row.capitalSources.filter(s=>s.kind==='debt'),total=sources.length?capitalSourceTotal(sources):0;
  return `<strong>${display(A,total,key)}</strong>`+capitalSourceGroups(sources).map(g=>`<small>${A.esc(g.name)} ${display(A,g.total,key)}</small>`).join('');
 }
 if(key==='constructionStart')return `<strong>${d.constructionStart?A.esc(d.constructionStart.replaceAll('-','.'))+(d.constructionStartPlanned?' (예정)':''):'—'}</strong>`;
 if(key==='contractUnit'){const v=d.contractConstruction;return `<strong>${v==null||!(row.gfa>0)?'—':A.num(v/row.gfa*areaFactor/10000,1)+'만원/평'}</strong>`;}
 return `<strong>${display(A,d[key],key)}</strong>`;
}
const input=(A,key,label,value,type='text')=>`<label class="studio-stage-input-label">${label}<input data-stage-input="${key}" aria-label="${label}" type="${type}" value="${A.esc(value??'')}"${type==='number'?` min="0" step="${key==='gfa'?'any':'1'}"`:''}></label>`;
const liveProject=(A,p)=>A.current()?.id===p.id?A.current():p;
const safePreview=(A,p,draft)=>{try{return previewStageDraft(A,liveProject(A,p),draft)}catch{return {values:draft.values,gfa:draft.gfa,periodEnd:draft.periodEnd}}};
function sourcesEditor(A,draft,key){
 const rows=draft.sources?.[key]||[];
 if(!rows.length)return '';
 return `<details class="studio-stage-source-editor" data-stage-sources="${key}"><summary>구성 금액 수정</summary><div><span class="studio-stage-source-unit">단위: 원</span>${rows.map(row=>`<label>${A.esc(row.name)}${row.readOnly?`<strong>${row.value==null?'—':A.money(row.value)}</strong><small>${A.esc(row.readOnlyReason||'세부사업비에서 수정')}</small>`:`<input type="number" min="0" step="1" data-source-id="${A.esc(row.id)}" data-source-kind="${key==='funding'?'funding':'cost'}" aria-label="${A.esc(row.name)} · 원" value="${A.esc(row.value??'')}">`}</label>`).join('')}</div></details>`;
}
export function renderStageTable(A,project,rows,selected,draft){
 const baseline=underwritingBasis(rows),preview=draft?safePreview(A,project,draft):null;
 const editableCurrent=draft&&(draft.kind==='create'||draft.basisId==='current');
 const columns=rows.map(row=>({row,editor:!!draft&&draft.kind==='edit'&&draft.basisId===row.id}));
 if(draft?.kind==='create')columns.push({row:{id:'draft',name:'새 단계',...preview},editor:true});
 const cellAttrs=column=>`${column.editor?' data-stage-editor':''} data-selected="${column.editor||column.row===selected}"`;
 const head=column=>column.editor?input(A,'name','단계명',draft.name)+input(A,'date','기준일',draft.date,'date'):`<div class="studio-stage-column-heading"><strong>${A.esc(column.row.name)}</strong><button class="btn" type="button" data-stage-inline-edit="${A.esc(column.row.id)}"${draft?' disabled':''}>수정</button></div>${column.row.date?`<small>${A.esc(column.row.date.replaceAll('-','.'))}</small>`:''}`;
 const metric=(column,field)=>{
  const {key}=field,row=column.row,value=column.editor?preview.values[key]:row.values[key];
  const base=baseline?.values[key];
  let html=`<strong${column.editor?` data-draft-value="${key}"`:''}>${display(A,value,key)}</strong>`;
  const change=baseline&&row!==baseline?deltaText(A,value,base,key):'';
  html+=`<span class="studio-stage-inline-delta"${column.editor?` data-draft-delta="${key}"`:''}>${change?' '+change:''}</span>`;
  if(key==='cost'){const price=costPerPyeong(column.editor?preview:row);html+=`<span class="studio-stage-unit-cost"${column.editor?' data-draft-per-pyeong':''}>${price==null?'평당 —':A.num(Math.round(price))+'만원/평'}</span>`;}

  if(column.editor){
   if(editableCurrent){if(key==='duration')html+='<small>사업 준공 시점에 따라 계산</small>';else html+=sourcesEditor(A,draft,key);}
   html+=`<textarea data-stage-note="${key}" aria-label="${labels[key]||field.label} 설명" rows="2" maxlength="500" placeholder="${labels[key]||field.label} 설명">${A.esc(draft.notes?.[key]||'')}</textarea>`;
  }else if(row.notes?.[key])html+=`<small>${A.esc(row.notes[key])}</small>`;
  return html;
 };
 const linkedRows=items=>items.map(([key,label])=>`<tr data-linked-metric="${key}"><th scope="row">${label}</th>${columns.map(col=>`<td${cellAttrs(col)}${col.editor?` data-draft-linked="${key}"`:''}>${linkedDetailHTML(A,col.editor?preview:col.row,key)}</td>`).join('')}</tr>`).join('');
 const afterField={funding:[['debt','대출 구조 (약정 총액)']],land:[['acquisition','자산매입 비용 (매입·명도·권리보상)']],construction:[['directConstruction','직접공사비 총액'],['contractUnit','평당 도급공사비']]};
 return `<table class="dense-table studio-cost-bases" aria-label="원가관리 비교 기준" style="min-width:${140+columns.reduce((sum,col)=>sum+(col.editor?320:220),0)}px">
 <colgroup><col style="width:140px">${columns.map(col=>`<col${col.editor?' style="width:320px"':''}>`).join('')}</colgroup>
 <thead><tr><th scope="col">핵심 지표</th>${columns.map(col=>`<th scope="col"${cellAttrs(col)}>${head(col)}</th>`).join('')}</tr></thead>
 <tbody>
 <tr><th scope="row">연면적</th>${columns.map(col=>`<td${cellAttrs(col)}>${col.editor&&editableCurrent?input(A,'gfa','연면적 · 평',areaInputValue(draft.gfa),'number'):`<strong>${formatStageArea(A,col.row.gfa)}</strong>`}</td>`).join('')}</tr>
 ${visibleStageFields.map(field=>`<tr><th scope="row">${labels[field.key]||field.label}</th>${columns.map(col=>`<td${cellAttrs(col)}>${metric(col,field)}</td>`).join('')}</tr>${linkedRows(afterField[field.key]||[])}`).join('')}

 ${linkedRows([['constructionStart','본공사 착공 시점']])}
 <tr><th scope="row">사업 준공 시점</th>${columns.map(col=>`<td${cellAttrs(col)}>${col.editor&&editableCurrent?input(A,'periodEnd','사업 준공 시점',draft.periodEnd,'month'):`<strong>${col.row.periodEnd?A.esc(col.row.periodEnd.replaceAll('-','.')):'—'}</strong>`}</td>`).join('')}</tr>
 <tr><th scope="row">증감 사유</th>${columns.map(col=>`<td${cellAttrs(col)}>${col.editor?`<textarea data-stage-input="reason" aria-label="변경 사유·관련 이슈" rows="3" maxlength="1000" placeholder="변경 사유·관련 이슈">${A.esc(draft.reason||'')}</textarea>`:A.esc(col.row.reason||'—')+(col.row.reasons||[]).map(([name,reason])=>`<small>${A.esc(name?name+' · '+reason:reason)}</small>`).join('')}</td>`).join('')}</tr>
 ${draft?`<tr class="studio-stage-editor-actions"><th></th>${columns.map(col=>`<td${cellAttrs(col)}>${col.editor?`<p class="studio-stage-error" role="alert"${draft.error?'':' hidden'}>${A.esc(draft.error||'')}</p><div><button type="button" class="btn" data-stage-cancel>취소</button><button type="button" class="btn primary" data-stage-commit>저장</button></div>`:''}</td>`).join('')}</tr>`:''}
 </tbody></table>`;
}
export function bindStageEditor(A,panel,project,view,hooks){
 const table=panel.querySelector('.studio-cost-bases');if(!table)return;
 if(view.editor?.pending)for(const node of table.querySelectorAll('[data-stage-editor] :is(button,input,textarea)'))node.disabled=true;
 const refreshPreview=()=>{
  try{const preview=previewStageDraft(A,liveProject(A,project),view.editor);for(const node of table.querySelectorAll('[data-draft-value]'))node.textContent=display(A,preview.values[node.dataset.draftValue],node.dataset.draftValue);for(const node of table.querySelectorAll('[data-draft-linked]'))node.innerHTML=linkedDetailHTML(A,preview,node.dataset.draftLinked);const baseline=underwritingBasis(hooks.rows());for(const node of table.querySelectorAll('[data-draft-delta]')){const key=node.dataset.draftDelta;const change=baseline?.id===view.editor.basisId?'':deltaText(A,preview.values[key],baseline?.values[key],key);node.textContent=change?' '+change:'';}const price=costPerPyeong(preview),unit=table.querySelector('[data-draft-per-pyeong]');if(unit)unit.textContent=price==null?'평당 —':A.num(Math.round(price))+'만원/평';}
  catch{/* Keep the entered invalid value for submit validation. */}
 };
 table.addEventListener('input',event=>{
  const draft=view.editor,target=event.target;if(!draft||draft.pending)return;
  if(target.dataset.stageNote)draft.notes[target.dataset.stageNote]=target.value;
  if(target.dataset.stageInput){const key=target.dataset.stageInput;if(key==='gfa')draft.gfa=target.value.trim()===''?'':Number((Number(target.value)*areaFactor).toFixed(8));else draft[key]=target.value;}
  if(target.dataset.sourceId){
   const id=target.dataset.sourceId,kind=target.dataset.sourceKind;
   for(const [key,rows]of Object.entries(draft.sources)){if((key==='funding')!==(kind==='funding'))continue;for(const row of rows)if(row.id===id)row.value=target.value;}
   for(const node of table.querySelectorAll('[data-source-id]'))if(node!==target&&node.dataset.sourceId===id&&node.dataset.sourceKind===kind)node.value=target.value;
  }
  draft.error='';refreshPreview();
 });
 table.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  if(!button.matches('[data-stage-inline-edit],[data-stage-cancel],[data-stage-commit]'))return;
  event.stopPropagation();
  if(button.hasAttribute('data-stage-inline-edit')){
   if(view.editor)return;
   try{view.editor=createStageDraft(A,project,{kind:'edit',basis:hooks.rows().find(row=>row.id===button.dataset.stageInlineEdit)});view.detailsOpen=true;hooks.render();panel.querySelector('[data-stage-editor] [data-stage-input="name"]')?.focus({preventScroll:true});}catch(error){A.toast(error.message);}return;
  }
  if(button.hasAttribute('data-stage-cancel')){if(view.editor?.pending)return;view.editor=null;hooks.refresh();panel.querySelector('[data-milestone-add]')?.focus({preventScroll:true});return;}
  const draft=view.editor;if(!draft||draft.pending)return;
  draft.pending=true;
  for(const node of table.querySelectorAll('[data-stage-editor] :is(button,input,textarea,summary)')){if('disabled'in node)node.disabled=true;}
  try{
   const result=commitStageDraft(A,liveProject(A,project),draft);
   await A.cloudPersistence?.wait();
   view.editor=null;view.basisId=result.basisId;view.detailsOpen=true;if(panel.isConnected)hooks.refresh();else A.render();
   panel.querySelector(`[data-cost-basis="${CSS.escape(result.basisId)}"]`)?.focus({preventScroll:true});
  }catch(error){draft.error=error.message;draft.pending=false;if(panel.isConnected)hooks.render();else A.render();const errorNode=document.querySelector('.studio-cost-bases .studio-stage-error');errorNode?.scrollIntoView({block:'nearest'});}
  finally{draft.pending=false;}
 });
}
