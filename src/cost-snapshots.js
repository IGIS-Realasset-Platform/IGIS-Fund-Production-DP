(function(A,fetcher){
 'use strict';
 const endpoint='/api/cost-snapshots',cache=new Map(),pending=new Set(),esc=A.esc,clone=value=>JSON.parse(JSON.stringify(value));let generation=0,draft=null,modalContext=null;
 const kinds={quarterly:'분기 기록',event:'주요시점 기록',approvedBudget:'승인예산'};
 function snapshotModal(title,body,footer=''){A.modal(title,'<div data-cost-snapshot-view>'+body+'</div>',footer);}
 const active=projectId=>A.current()?.id===projectId;
 const currentProject=id=>{const p=A.state.projects.find(row=>row.id===id);if(!p||!active(id))throw Error('프로젝트가 변경되었습니다. 현재 프로젝트에서 다시 열어 주세요.');return p;};
 const format=value=>value==null?'—':Math.round(value/1000000).toLocaleString('ko-KR');
 const timestamp=value=>A.domain.costHistoryTimestamp?.(value)||String(value||'—');
 const cloud=()=>A.cloudPersistence?.enabled?.()===true;
 const canApprove=projectId=>A.cloudPersistence?.capabilities?.().manageAccess===true||A.cloudPersistence?.projectRoles?.()[projectId]==='approver';
 const canWrite=projectId=>canApprove(projectId)||A.cloudPersistence?.projectRoles?.()[projectId]==='editor';
 async function request(query='',options={}){if(!cloud())throw Error('시점 기록은 중앙 DB에 연결된 화면에서 사용할 수 있습니다.');let response;try{response=await fetcher(endpoint+query,{credentials:'same-origin',cache:'no-store',...options,headers:{'Content-Type':'application/json',...(options.headers||{})},...(options.body?{body:JSON.stringify(options.body)}:{})});}catch{throw Error('시점 기록을 불러오지 못했습니다. 연결 상태를 확인해 주세요.');}let data;try{data=await response.json();}catch{throw Error('시점 기록 응답을 확인하지 못했습니다.');}if(!response.ok){const error=Error(data.message||({401:'로그인이 만료되었습니다. 다시 로그인해 주세요.',403:'이 사업의 시점 기록을 저장할 권한이 없습니다.',409:'다른 사용자가 사업자료를 변경했습니다. 현재 입력을 유지하고 최신 자료를 다시 불러와 주세요.',422:'입력값을 확인해 주세요.'}[response.status])||'시점 기록을 처리하지 못했습니다.');error.status=response.status;error.code=data.error;throw error;}return data;}
 async function list(projectId){const data=await request('?projectId='+encodeURIComponent(projectId));if(!Array.isArray(data.snapshots)||!Array.isArray(data.tasks)||data.snapshots.some(row=>!row.id||row.projectId!==projectId||!kinds[row.kind])||data.tasks.some(task=>!task.id||task.projectId!==projectId||!/^\d{4}-Q[1-4]$/.test(task.quarterKey||'')))throw Error('시점 기록 목록을 확인하지 못했습니다.');cache.set(projectId,{snapshots:clone(data.snapshots),tasks:clone(data.tasks)});return clone(data);}
 async function detail(projectId,id){const data=await request('?projectId='+encodeURIComponent(projectId)+'&id='+encodeURIComponent(id));if(!data.snapshot?.metadata?.id||!data.snapshot.payload?.project)throw Error('저장된 사업비 본문을 확인하지 못했습니다.');if(data.snapshot.metadata.id!==id||data.snapshot.metadata.projectId!==projectId||data.snapshot.payload.project.id!==projectId)throw Error('다른 사업의 시점 기록은 열 수 없습니다.');return data.snapshot;}
 function comparisonIds(oldBy,newBy){
  const ids=[...newBy.keys()],original=[...oldBy.values()],rowFor=id=>newBy.get(id)||oldBy.get(id);
  for(let index=0;index<original.length;index++){
   const row=original[index];if(newBy.has(row.id))continue;
   const isSibling=item=>item.parentId===row.parentId&&ids.includes(item.id)&&rowFor(item.id)?.parentId===row.parentId;
   const previous=original.slice(0,index).reverse().find(isSibling),next=original.slice(index+1).find(isSibling);let at;
   if(previous){at=ids.indexOf(previous.id)+1;const level=rowFor(previous.id)?.level??0;while(at<ids.length&&(rowFor(ids[at])?.level??0)>level)at++;}
   else if(next)at=ids.indexOf(next.id);
   else if(row.parentId&&ids.includes(row.parentId))at=ids.indexOf(row.parentId)+1;
   else at=ids.length;
   ids.splice(at,0,row.id);
  }
  return ids;
 }
 function comparisonEvents(p,historical,id){
  const result=[],references=new Set(),identifiers=new Set();
  for(const event of [...(A.domain.costHistory?.(p,id)||[]),...(A.domain.costHistory?.(historical,id)||[])]){
   const key=typeof event?.id==='string'&&event.id.length>0&&event.id.length<=200&&event.id.trim()===event.id&&!/[\u0000-\u001f\u007f]/.test(event.id)?event.id:null;
   if(references.has(event)||key&&identifiers.has(key))continue;
   references.add(event);if(key)identifiers.add(key);result.push(event);
  }
  return result;
 }
 function alignEmptyManagement(historical,p,oldRows,newRows){
  const validId=value=>typeof value==='string'&&value.length>0&&value.length<=200&&value.trim()===value&&!/[\u0000-\u001f\u007f]/.test(value);
  const identity=row=>{const target=validId(row.companyTaxonomyTargetId)&&A.costTaxonomy?.target?.(row.companyTaxonomyTargetId);return row.kind==='cost'&&(row.companyManagementGroup||row.companySingleActual)&&target?.role==='budget-cost'&&validId(row.id)&&validId(row.parentId)&&validId(row.companyProfileKey)&&validId(target.finalId)&&row.companyProfileKey===target.finalId?JSON.stringify([row.parentId,row.companyProfileKey,target.finalId]):null;},oldIds=new Set(oldRows.map(row=>row.id)),before=new Map((historical.cbs||[]).filter(row=>!row.deletedAt).map(row=>[row.id,row])),after=new Map((p.cbs||[]).filter(row=>!row.deletedAt).map(row=>[row.id,row]));
  const confirmedTarget=(project,id)=>{const binding=A.costCoding?.resolve?.(project,id);return binding?.costTypeMappingStatus==='confirmed'?A.costTaxonomy?.targetForType?.(binding)?.finalId:null;};
  return oldRows.map(row=>{
   const key=identity(row);if(!key||oldRows.filter(item=>identity(item)===key).length!==1)return row;
   const candidates=newRows.filter(item=>identity(item)===key);if(candidates.length!==1)return row;const current=candidates[0];if(!current.companySingleActual||!current.id||oldIds.has(current.id))return row;
   const node=A.companyCostProfile?.resolve?.(historical,row.id),previous=before.get(current.id),live=after.get(current.id),value=row.values?.find(item=>item.columnId==='current')?.rawWon;
   if(!node?.companyManagementGroup||!node.companyDisplayOnly||!node.empty||node.managementIds?.length||node.sourceIds?.length||value!==null)return row;
   if(!previous?.managementAccount||!live?.managementAccount||!validId(previous.id)||!validId(previous.parentId)||previous.id!==live.id||previous.parentId!==live.parentId||previous.budgetState!=='template'||previous.current!==null||previous.initial!=null||previous.reportedCurrentTotal!=null||previous.costBreakdown)return row;
   if((historical.cbs||[]).some(item=>item.parentId===previous.id&&!item.deletedAt)||(p.cbs||[]).some(item=>item.parentId===live.id&&!item.deletedAt)&&!live.costBreakdown)return row;
   if(confirmedTarget(historical,previous.id)!==row.companyTaxonomyTargetId||confirmedTarget(p,live.id)!==row.companyTaxonomyTargetId)return row;
   return{...row,id:current.id};
  });
 }
 function comparisonRows(snapshot,p){const historical=snapshot?.payload?.project;if(!historical||!historical.id||!p.id||historical.id!==p.id)throw Error('같은 사업의 기록을 선택해 주세요.');
  // Use the same explicitly visible hierarchy as the user's table/export:
  // permit/levy details and optional breakdowns, never hidden archival raw rows.
  const old=A.domain.costExcelProjection(historical,{mode:'amount',detail:'display'}),now=A.domain.costExcelProjection(p,{mode:'amount',detail:'display'}),oldBy=new Map(alignEmptyManagement(historical,p,old.rows,now.rows).filter(row=>row.kind!=='area').map(row=>[row.id,row])),newBy=new Map(now.rows.filter(row=>row.kind!=='area').map(row=>[row.id,row])),amount=row=>row?.values.find(value=>value.columnId==='current')?.rawWon??null,ids=comparisonIds(oldBy,newBy),captured=Date.parse(snapshot.metadata?.capturedAt||'');return ids.map(id=>{const a=oldBy.get(id),b=newBy.get(id),before=amount(a),after=amount(b),scopeNodes=[A.companyCostProfile?.resolve?.(p,id),A.companyCostProfile?.resolve?.(historical,id)].filter(Boolean),members=new Set([id,...scopeNodes.flatMap(node=>[...(node.managementIds||[]),...(node.sourceIds||[])])]),contracts=[...new Map([...(historical.contracts||[]),...(p.contracts||[])].filter(contract=>[contract.cbsId,contract.costItemId,...(contract.cbsIds||[]),...(contract.allocations||[]).map(item=>item.cbsId),...(contract.revisions||[]).flatMap(revision=>(revision.allocations||[]).map(item=>item.cbsId))].some(key=>key&&members.has(key))).map(contract=>[contract.id,contract])).values()],events=Number.isFinite(captured)?comparisonEvents(p,historical,id).filter(event=>Date.parse(event.at)>captured):[],reasons=[...new Set(events.map(event=>event.reason||event.after?.reason||event.after?.note||'').filter(Boolean))];return{id,level:b?.level??a?.level??0,kind:b?.kind||a?.kind,role:b?.role||a?.role,profileKey:b?.companyProfileKey||a?.companyProfileKey||'',name:b?.name||a?.name||id,categoryName:b?.categoryName||a?.categoryName||'',before,after,delta:before===null||after===null?null:after-before,state:!a?'추가':!b?'제외':before!==after?'금액 변경':'유지',reason:reasons.join(' / '),contracts:contracts.map(contract=>contract.name||contract.title||contract.id).join(', ')};});}
 function comparison(snapshot,p){const run=()=>{const scope=A.companyCostProfile?.beginRead?.(p);try{A.companyCostProfile?.managementNodes?.(p);return comparisonRows(snapshot,p);}finally{A.companyCostProfile?.endRead?.(scope);}};return A.costReadScope?A.costReadScope(run):run();}
 function comparisonRowClass(row){return row.kind==='total'?'cost-snapshot-total':row.role==='root-subtotal'?'cost-snapshot-root':['direct','indirect'].includes(row.profileKey)?'cost-snapshot-branch':'';}
 function latestApproved(records){
  const approved=records.filter(item=>item.kind==='approvedBudget'&&item.id),byId=new Map(),groups=new Map();
  for(const item of approved){if(byId.has(item.id)&&JSON.stringify(byId.get(item.id))!==JSON.stringify(item))return null;byId.set(item.id,item);}
  for(const item of byId.values()){
   let root=item;const path=new Set();
   while(root.correctsId){if(path.has(root.id))return null;path.add(root.id);const parent=byId.get(root.correctsId);if(!parent)return null;root=parent;}
   if(!groups.has(root.id))groups.set(root.id,{root,items:[]});groups.get(root.id).items.push(item);
  }
  const revisionOrder=(a,b)=>Number(a.version||0)-Number(b.version||0)||String(a.capturedAt||'').localeCompare(String(b.capturedAt||'')),candidates=[];
  for(const group of groups.values()){
   const replaced=new Set(group.items.map(item=>item.correctsId).filter(Boolean)),leaves=group.items.filter(item=>!replaced.has(item.id)).sort(revisionOrder),latest=leaves.at(-1);if(!latest)return null;
   if(leaves.length>1&&revisionOrder(leaves.at(-2),latest)===0)return null;
   let dated=latest;while(dated&&!dateValue(dated.asOfDate))dated=dated.correctsId?byId.get(dated.correctsId):null;
   candidates.push({latest,root:group.root,asOfDate:dated?.asOfDate||''});
  }
  if(candidates.length<=1)return candidates[0]?.latest||null;
  // Unknown business dates cannot be inferred from when an old record was captured.
  if(candidates.some(item=>!item.asOfDate))return null;
  candidates.sort((a,b)=>a.asOfDate.localeCompare(b.asOfDate)||revisionOrder(a.root,b.root));
  const latest=candidates.at(-1),previous=candidates.at(-2);
  if(previous&&previous.asOfDate===latest.asOfDate&&revisionOrder(previous.root,latest.root)===0)return null;
  return latest.latest;
 }
 function exportComparison(snapshot,p,{download=true}={}){if(!A.costExcel?.buildXlsx)throw Error('엑셀 내보내기를 준비하지 못했습니다.');const rows=comparison(snapshot,p),metadata=snapshot.metadata,cell=(value,style='default',numberFormat=null)=>({value,style,...(numberFormat?{numberFormat,type:'number'}:{})}),model={title:'사업비 시점 비교',sheets:[{name:'시점 비교',columns:[24,40,22,22,22,12,34,34],freeze:{rows:3,columns:2},rows:[{cells:[cell(metadata.label),cell('자료 기준일 '+metadata.asOfDate),cell('확인시각 '+timestamp(metadata.capturedAt))]},{cells:[cell('단위: 백만원')]},{cells:['대분류','원가항목','저장 당시','현재 준공추정원가','증감','변경','사유','관련 계약'].map(text=>cell(text,'header'))},...rows.map(row=>({cells:[cell(row.categoryName),cell(row.name),cell(row.before,'default','#,##0,,'),cell(row.after,'default','#,##0,,'),cell(row.delta,'default','#,##0,,'),cell(row.state),cell(row.reason),cell(row.contracts)]}))]}]},bytes=A.costExcel.buildXlsx(model),name=(p.id+'_사업비_시점비교.xlsx').replace(/[<>:"/\\|?*]/g,'_');if(download)A.download(name,bytes,A.costExcel.mime);return{model,bytes,name};}
 function metadataRow(meta,p){return[esc(kinds[meta.kind]||meta.kind),esc(meta.label||''),esc(meta.asOfDate||'—'),esc(timestamp(meta.capturedAt)),esc(meta.quarterKey||'—'),String(meta.version||1),A.btn('비교 보기','cost-snapshot-detail',{projectId:p.id,id:meta.id})+(canWrite(p.id)&&(meta.kind!=='approvedBudget'||canApprove(p.id))?A.btn('정정','cost-snapshot-correct',{projectId:p.id,id:meta.id}):'')];}
 function renderList(p,data,error=''){const tasks=data.tasks.filter(task=>!task.completedAt),approved=latestApproved(data.snapshots),body=(error?'<p class="field-error" role="alert">'+esc(error)+'</p>':'')+(tasks.length?'<section class="cost-snapshot-tasks"><h3>분기 확인</h3>'+A.table(['분기','확인 예정일',''],tasks.map(task=>[esc(task.quarterKey),esc(task.dueDate||'—'),canWrite(p.id)?A.btn('분기 기록 저장','cost-snapshot-new',{projectId:p.id,kind:'quarterly',quarterKey:task.quarterKey}):'']))+'</section>':'')+(approved?'<div class="table-toolbar"><strong>최근 승인예산: '+esc(approved.label)+'</strong>'+A.btn('최근 승인예산 비교','cost-snapshot-detail',{projectId:p.id,id:approved.id})+'</div>':'')+A.table(['구분','기록명','자료 기준일','확인시각','분기','버전',''],data.snapshots.map(meta=>metadataRow(meta,p)));snapshotModal('사업비 시점 기록',body,(canWrite(p.id)?A.btn('주요시점 기록 저장','cost-snapshot-new',{projectId:p.id,kind:'event'}):'')+(canApprove(p.id)?A.btn('승인예산 저장','cost-snapshot-new',{projectId:p.id,kind:'approvedBudget'}):''));}
 async function open(projectId=A.current()?.id){const p=currentProject(projectId),token=++generation;draft=null;modalContext={projectId,view:'list'};snapshotModal('사업비 시점 기록','<p role="status">시점 기록을 불러오고 있습니다.</p>');try{const data=await list(projectId);if(token===generation&&active(projectId)&&modalContext?.view==='list')renderList(p,data);}catch(error){if(token===generation&&active(projectId))snapshotModal('사업비 시점 기록','<p class="field-error" role="alert">'+esc(error.message)+'</p>',A.btn('다시 불러오기','cost-snapshots-open',{projectId}));}}
 function dateValue(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))return false;const date=new Date(value+'T00:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;}
 function newDraft(p,options={}){const kind=options.kind||'event';if(!kinds[kind])throw Error('기록 종류를 확인해 주세요.');if(!canWrite(p.id)||kind==='approvedBudget'&&!canApprove(p.id))throw Error('이 기록을 저장할 권한이 없습니다.');return{projectId:p.id,requestId:crypto.randomUUID(),kind,quarterKey:options.quarterKey||'',asOfDate:options.asOfDate||A.today||new Date().toISOString().slice(0,10),label:options.label||'',reason:'',...(options.correctsId?{correctsId:options.correctsId}:{})};}
 function renderDraft(error=''){if(!draft||!active(draft.projectId))return;modalContext={projectId:draft.projectId,view:'draft'};const field=(name,label,type='text')=>'<label class="field full"><span>'+label+' <b aria-label="필수">*</b></span><input name="snapshot-'+name+'" type="'+type+'" value="'+esc(draft[name]||'')+'" required></label>';snapshotModal((draft.correctsId?'정정 · ':'')+kinds[draft.kind],(error?'<p class="field-error" role="alert">'+esc(error)+'</p>':'')+'<div class="form-grid">'+(draft.quarterKey?'<p class="full">'+esc(draft.quarterKey)+'</p>':'')+field('label','기록명')+field('asOfDate','자료 기준일','date')+field('reason','확인·변경 사유')+'</div>',A.btn('취소','cost-snapshot-cancel',{projectId:draft.projectId})+A.btn('현재 사업비 기록 저장','cost-snapshot-save',{projectId:draft.projectId},'primary'));}
 function readDraft(){if(!draft)return;for(const key of ['label','asOfDate','reason']){const input=document.querySelector?.('#app-dialog [name="snapshot-'+key+'"]');if(input)draft[key]=input.value;}}
 async function save(input=draft){const value=clone(input||{}),p=currentProject(value.projectId);if(!canWrite(p.id)||value.kind==='approvedBudget'&&!canApprove(p.id))throw Error('이 기록을 저장할 권한이 없습니다.');if(!dateValue(value.asOfDate)||!String(value.label||'').trim()||!String(value.reason||'').trim())throw Error('기록명·자료 기준일·사유를 모두 입력해 주세요.');if(pending.has(p.id))throw Error('시점 기록을 저장하고 있습니다.');pending.add(p.id);try{if(A.cloudPersistence.pending())await A.cloudPersistence.wait();currentProject(p.id);const result=await request('',{method:'POST',body:{...value,expectedRevision:A.cloudPersistence.revision()}}),meta=result.snapshot?.metadata;if(!meta?.id||meta.projectId!==p.id||meta.kind!==value.kind)throw Error('저장된 시점 기록의 응답을 확인하지 못했습니다. 같은 입력으로 다시 확인해 주세요.');return result;}finally{pending.delete(p.id);}}
 async function showDetail(projectId,id){const p=currentProject(projectId),token=++generation;modalContext={projectId,view:'detail'};snapshotModal('사업비 시점 비교','<p role="status">저장된 사업비를 불러오고 있습니다.</p>');try{const snapshot=await detail(projectId,id);if(token!==generation||!active(projectId))return;const rows=comparison(snapshot,currentProject(projectId)),meta=snapshot.metadata;snapshotModal(meta.label+' · 현재 사업비 비교',A.table(['구분','내용'],[['기록 종류',esc(kinds[meta.kind])],['자료 기준일',esc(meta.asOfDate)],['확인시각',esc(timestamp(meta.capturedAt))],['사유',esc(meta.reason||'—')]])+A.table(['원가항목','저장 당시','현재 준공추정원가','증감','변경','사유','관련 계약'],rows.map(row=>['<span class="cost-snapshot-name" style="padding-left:'+Math.max(0,row.level*16)+'px">'+esc(row.name)+'</span>','<span class="num">'+format(row.before)+'</span>','<span class="num">'+format(row.after)+'</span>','<span class="num">'+format(row.delta)+'</span>',esc(row.state),esc(row.reason),esc(row.contracts)]),'cost-snapshot-compare',{rowAttrs:index=>({class:comparisonRowClass(rows[index])})}),A.btn('목록으로','cost-snapshots-open',{projectId})+A.btn('비교 엑셀 내려받기','cost-snapshot-export',{projectId,id}));}catch(error){if(token===generation&&active(projectId))snapshotModal('사업비 시점 비교','<p class="field-error" role="alert">'+esc(error.message)+'</p>',A.btn('목록으로','cost-snapshots-open',{projectId}));}}
 function requestClose(){if(!modalContext||!document.querySelector?.('#app-dialog [data-cost-snapshot-view]'))return false;const context=modalContext;if(pending.has(context.projectId)){A.toast('시점 기록을 저장하고 있습니다.');return true;}if(!active(context.projectId)||context.view==='list'){++generation;modalContext=null;draft=null;return false;}draft=null;const data=cache.get(context.projectId);++generation;modalContext={projectId:context.projectId,view:'list'};if(data)renderList(currentProject(context.projectId),data);else open(context.projectId);return true;}
 A.on('cost-snapshots-open',button=>open(button?.dataset?.projectId||A.current()?.id));
 A.on('cost-snapshot-new',button=>{try{draft=newDraft(currentProject(button.dataset.projectId),button.dataset);renderDraft();}catch(error){A.toast(error.message);}});
 A.on('cost-snapshot-cancel',button=>{draft=null;return open(button.dataset.projectId);});
 A.on('cost-snapshot-save',async button=>{if(button.disabled)return;readDraft();button.disabled=true;const projectId=draft?.projectId;try{await save();draft=null;if(active(projectId)){await open(projectId);A.toast('사업비 시점 기록을 저장했습니다.');}}catch(error){if(active(projectId))renderDraft(error.message);}finally{button.disabled=false;}});
 A.on('cost-snapshot-detail',button=>showDetail(button.dataset.projectId,button.dataset.id));
 A.on('cost-snapshot-correct',async button=>{const projectId=button.dataset.projectId,token=++generation;try{const snapshot=await detail(projectId,button.dataset.id);if(token!==generation||!active(projectId))return;const meta=snapshot.metadata;draft=newDraft(currentProject(projectId),{kind:meta.kind,quarterKey:meta.quarterKey,label:meta.label,asOfDate:meta.asOfDate,correctsId:meta.id});renderDraft();}catch(error){A.toast(error.message);}});
 A.on('cost-snapshot-export',async button=>{if(button.disabled)return;button.disabled=true;try{const p=currentProject(button.dataset.projectId),snapshot=await detail(p.id,button.dataset.id);if(active(p.id))exportComparison(snapshot,currentProject(p.id));}catch(error){A.toast(error.message);}finally{button.disabled=false;}});
 A.costSnapshots=Object.freeze({list,detail,comparison,exportComparison,save,open,dateValue,newDraft,requestClose,latestApproved,pending:projectId=>pending.has(projectId)});
})(App,typeof fetch==='function'?fetch.bind(globalThis):async()=>{throw Error('fetch unavailable');});
