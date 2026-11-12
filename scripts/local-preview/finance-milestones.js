import {stageFields} from './finance-stage-fields.js';
import {currentCapitalSources,capitalSourceTotal,validateCapitalSources} from './finance-capital.js';
export const underwritingBasis=rows=>rows.find(row=>row.snapshot?.kind==='underwriting')||null;
export function costPerPyeong(row){
 const cost=row?.values?.cost,area=row?.gfa;
 return Number.isFinite(cost)&&cost>=0&&Number.isFinite(area)&&area>0
  ? cost/area*3.305785/10000:null;
}
// A milestone is a dated cost snapshot with its own financing context.
// The live milestone only names the current ledger; it never rewrites costs.
export function projectDuration({periodStart,periodEnd}={}){
 const month=value=>{
  const match=/^(\d{4})-(0[1-9]|1[0-2])(?:-\d{2})?$/.exec(value||'');
  return match?Number(match[1])*12+Number(match[2]):null;
 };
 const start=month(periodStart),end=month(periodEnd);
 return start!==null&&end!==null&&end>=start?end-start:null;
}
export function endingMonth(start,duration){
 const match=/^(\d{4})-(0[1-9]|1[0-2])$/.exec(start||'');
 if(!match||!Number.isInteger(duration)||duration<0)return '';
 const month=Number(match[1])*12+Number(match[2])-1+duration;
 return String(Math.floor(month/12)).padStart(4,'0')+'-'+String(month%12+1).padStart(2,'0');
}
export function milestoneRows(A,project){
 const nodes=new Map(A.companyCostProfile.managementNodes(project).map(node=>[node.companyProfileKey,node.id]));
 const costs=snapshot=>{
  const value=key=>nodes.has(key)?A.domain.modeValue(project,nodes.get(key),snapshot,'amount'):null;
  return {cost:snapshot?A.domain.modeValue(project,'total',snapshot,'amount'):A.total(project),
   land:value('land_purchase'),construction:value('construction'),interest:value('finance')};
 };
 const rows=A.domain.activeStages(project).map(snapshot=>{
  const extra=A.financeMilestones?.context(project,snapshot)||snapshot.financeContext||{};
  const frozen=extra.captureVersion===1;
  const area=frozen?extra.gfa:A.areas.forStage(project,snapshot)?.gfaTotal??null,reference=frozen?{}:project.financeReferenceFacts||{};
  const gfaReference=area===null&&reference.gfaTotal!=null;
  const derivedEnd=frozen?'':endingMonth(reference.periodStart,extra.duration);
  const periodEndReference=!extra.periodEnd&&!!derivedEnd;
  return {id:'snapshot:'+snapshot.id,snapshot,name:snapshot.label||'사업 단계',date:snapshot.date||extra.date||'',
   capitalSources:extra.capitalSources||null,
   values:frozen?structuredClone(extra.linkedValues):{funding:extra.capitalSources?capitalSourceTotal(extra.capitalSources):extra.funding??null,sale:extra.sale??null,duration:extra.duration??null,...costs(snapshot)},
   gfa:area??reference.gfaTotal??null,gfaReference,periodEnd:extra.periodEnd||derivedEnd,periodEndReference,reason:extra.reason||'',
   notes:extra.notes||{},reasons:Object.entries(snapshot.reasons||{}).filter(([,text])=>typeof text==='string'&&text.trim()).map(([id,text])=>[snapshot.nodes?.find(node=>node.id===id)?.name,text])};
 });
 const meta=project.financeCurrentStage||{};
 rows.push({id:'current',capitalSources:currentCapitalSources(project),name:meta.name||'최근 사업 단계',date:meta.date||'',
  values:{funding:A.contracts.financeCapitalTotals(project).total,sale:meta.sale??null,duration:projectDuration(project.basic),...costs(null)},
  gfa:A.areas.current(project).gfaTotal,periodEnd:project.basic?.periodEnd||'',reason:meta.reason||'',notes:meta.notes||{}});
 return rows;
}
export function installMilestoneCapture(A){
 if(A.financeMilestones)return;
 A.on('finance-stage-info',button=>{
  const owner=A.current();if(!owner)return;
  const id=button.dataset.id;
  const basis=milestoneRows(A,owner).find(row=>id==='current'?row.id==='current':row.snapshot?.id===id);
  if(!basis)return A.toast('수정할 단계가 없습니다.');
  editMilestoneInfo(A,owner,basis);
 });
 const amount=(raw,label)=>{
  if(raw==null||String(raw).trim()==='')return null;
  const number=Number(raw);
  if(!Number.isSafeInteger(number)||number<0)throw Error(label+'은 0 이상의 원 단위 정수로 입력해 주세요.');
  return number;
 };
 const underwritingReferences=new Map();
 A.financeMilestones={
  setUnderwritingReference(projectId,record){
   if(record?.id==='example-1'&&record.sample)underwritingReferences.set(projectId,record);
   else underwritingReferences.delete(projectId);
  },
  context(project,snapshot){
   if(snapshot.financeContext)return snapshot.financeContext;
   if(snapshot.kind!=='underwriting'&&snapshot.controlEventType!=='underwriting')return {};
   const record=underwritingReferences.get(project.id);
   if(!record)return {};
   return {funding:record.values.funding??null,sale:record.values.sale??null,duration:record.values.duration??null,
    date:record.date,reason:record.reason,notes:Object.fromEntries(['funding','sale','duration'].filter(key=>record.notes?.[key]).map(key=>[key,record.notes[key]]))};
  },
  fields(project,draft){
   const linked=A.financeMilestones.context(project,draft);
   const saved=draft.financeContext||(Object.keys(linked).length?linked:null);
   const data=saved||(draft.captureMode==='current'?{
    funding:A.contracts.financeCapitalTotals(project).total,sale:project.financeCurrentStage?.sale,
    duration:projectDuration(project.basic),periodEnd:project.basic?.periodEnd,
    reason:project.financeCurrentStage?.reason,notes:project.financeCurrentStage?.notes,capitalSources:currentCapitalSources(project),
   }:{});
   const sources=data.capitalSources||[];
   const capital=sources.length?'<div class="full"><input type="hidden" name="financeCapitalCount" value="'+sources.length+'">'+A.table(['구분','트랜치','자금 제공자','약정·출자액 · 원'],sources.map((row,i)=>['<input type="hidden" name="capitalRole_'+i+'" value="'+A.esc(row.role||'')+'"><input type="hidden" name="capitalId_'+i+'" value="'+A.esc(row.id)+'"><input type="hidden" name="capitalKind_'+i+'" value="'+A.esc(row.kind)+'">'+(row.kind==='equity'?'출자':'대출'),'<input aria-label="트랜치" name="capitalTranche_'+i+'" value="'+A.esc(row.tranche)+'">','<input aria-label="자금 제공자" name="capitalParty_'+i+'" value="'+A.esc(row.party)+'">','<input aria-label="약정·출자액" type="number" name="capitalAmount_'+i+'" value="'+A.esc(row.amount??'')+'">']))+'</div>':'';
   return '<fieldset class="full studio-milestone-fields"><legend>당시 조달·사업 지표</legend><div class="form-grid">'+
    A.field('financeFunding','총 조달규모 · 원',data.funding??'','number')+capital+
    A.field('financeSale','매각 목표 · 원',data.sale??'','number')+
    A.field('financeDuration','개발기간 · 개월',data.duration??'','number')+
    A.field('financePeriodEnd','사업 종료 예정 · 연월',data.periodEnd||'','month')+
    A.field('financeReason','변경 사유·관련 이슈',data.reason||'','textarea')+
    ['cost','funding','construction','interest'].map((key,i)=>A.field('financeNote_'+key,['원가','조달규모','공사비','금융비'][i]+' 변경 사유',data.notes?.[key]||'','textarea')).join('')+'</div></fieldset>';
  },
  read(values){
   const duration=amount(values.financeDuration,'개발기간');
   if(duration!==null&&duration>1200)throw Error('개발기간을 확인해 주세요.');
   const periodEnd=String(values.financePeriodEnd||'');
   if(periodEnd&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodEnd))throw Error('사업 종료 예정 연월을 확인해 주세요.');
   const reason=String(values.financeReason||'').trim();
   if(reason.length>1000)throw Error('변경 사유는 1,000자 이내로 입력해 주세요.');
   const notes=Object.fromEntries(['cost','funding','construction','interest'].map(key=>[key,String(values['financeNote_'+key]||'').trim()]));
   if(Object.values(notes).some(text=>text.length>500))throw Error('지표별 사유는 500자 이내로 입력해 주세요.');
   const funding=amount(values.financeFunding,'총 조달규모');
   let capitalSources;
   const count=Number(values.financeCapitalCount||0);
   if(!Number.isInteger(count)||count<0||count>100)throw Error('조달 구성 개수를 확인해 주세요.');
   if(count){capitalSources=validateCapitalSources(Array.from({length:count},(_,i)=>({id:values['capitalId_'+i],kind:values['capitalKind_'+i],tranche:values['capitalTranche_'+i],party:values['capitalParty_'+i],role:values['capitalRole_'+i]||'',amount:amount(values['capitalAmount_'+i],'약정·출자액')})));if(capitalSourceTotal(capitalSources)!==funding)throw Error('총 조달규모를 자금 제공자별 약정·출자액 합계와 맞춰 주세요.');}
   return {...(capitalSources?{capitalSources}:{}),funding,sale:amount(values.financeSale,'매각 목표'),duration,periodEnd,reason,notes};
  },
 };
}

const infoLabel=field=>({funding:'총 조달규모',land:'토지매입비'}[field.key]||field.label);
function readStageInfo(values){
 const name=String(values.name||'').trim(),date=String(values.date||''),reason=String(values.reason||'').trim();
 if(!name||name.length>80)throw Error('단계명을 80자 이내로 입력해 주세요.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw Error('기준일을 확인해 주세요.');
 if(!reason||reason.length>1000)throw Error('변경 사유·관련 이슈를 1,000자 이내로 입력해 주세요.');
 const notes=Object.fromEntries(stageFields.map(({key})=>[key,String(values['note_'+key]||'').trim()]));
 if(Object.values(notes).some(text=>text.length>500))throw Error('지표별 설명은 500자 이내로 입력해 주세요.');
 return {name,date,reason,notes};
}
function infoFields(A,meta,{capture=false}={}){
 return A.field('name','단계명',meta.name||'')+
  (capture?'<div class="field"><label for="milestone-save-date">기준일</label><input id="milestone-save-date" name="date" type="date" value="'+A.esc(A.today)+'" readonly></div>':A.field('date','기준일',meta.date||A.today,'date'))+
  A.field('reason','변경 사유·관련 이슈',meta.reason||'','textarea')+
  '<fieldset class="full studio-milestone-fields"><legend>핵심지표 설명</legend><div class="form-grid">'+stageFields.map(field=>A.field('note_'+field.key,infoLabel(field)+' 설명',meta.notes?.[field.key]||'','textarea')).join('')+'</div></fieldset>';
}
function writableOwner(A,id){
 const owner=A.current();
 if(owner?.id!==id||owner.deletedAt||owner.active===false||!A.canEditProject(id))throw Error('사업이나 수정 권한이 변경되어 저장하지 않았습니다. 입력값을 확인해 주세요.');
 return owner;
}
export function captureCurrentMilestone(A,project,onSaved=()=>{}){
 const linked=structuredClone(milestoneRows(A,project).at(-1));
 const opened=JSON.stringify(project);
 const values=stageFields.map(field=>[infoLabel(field),linked.values[field.key]==null?'—':field.unit?A.num(linked.values[field.key])+'개월':A.money(linked.values[field.key])]);
 values.push(['연면적',linked.gfa==null?'—':A.num(linked.gfa)+'㎡'],['사업 종료 예정',linked.periodEnd?A.esc(linked.periodEnd.replaceAll('-','.')):'—']);
 const sources=linked.capitalSources||[];
 const preview='<div class="full studio-milestone-preview">'+A.table(['저장할 핵심지표','현재 연결값'],values)+A.table(['구분','트랜치','자금 제공자','약정·출자액'],sources.map(row=>[row.kind==='equity'?'출자':'대출',A.esc(row.tranche),A.esc(row.party),row.amount==null?'—':A.money(row.amount)]))+'</div>';
 return A.form('현재 단계 저장',infoFields(A,{...linked,name:''},{capture:true})+preview,raw=>{
  const owner=writableOwner(A,project.id),info=readStageInfo(raw);
  if(info.date!==A.today)throw Error('현재 연결값은 오늘 기준으로 저장해 주세요.');
  if(JSON.stringify(owner)!==opened)throw Error('연결된 자료가 변경되었습니다. 입력 내용을 보관한 뒤 다시 열어 최신값을 확인해 주세요.');
  let id;
  A.transaction(()=>{
   const draft=A.domain.snapshot(owner,'custom',info.name,info.date,structuredClone(A.areas.current(owner)),'');
   draft.captureMode='current';draft.detailLevel='detail';
   draft.financeContext={captureVersion:1,capturedAt:new Date().toISOString(),linkedValues:structuredClone(linked.values),gfa:linked.gfa??null,periodEnd:linked.periodEnd||'',funding:linked.values.funding,sale:linked.values.sale,duration:linked.values.duration,capitalSources:structuredClone(sources),reason:info.reason,notes:info.notes};
   A.domain.finalizeStage(owner,draft,A.domain.baseline(owner));id=draft.id;
  });
  onSaved(id);
 },'현재 단계 저장',{draftContext:'finance-capture:'+project.id});
}
export function editMilestoneInfo(A,project,basis,options={}){
 const snapshotId=basis?.snapshot?.id;
 const existing=snapshotId?project.costStages.find(row=>row.id===snapshotId):project.financeCurrentStage||{};
 if(snapshotId&&!existing)throw Error('수정할 단계가 없습니다.');
 const before=JSON.stringify(existing);
 const meta=snapshotId?{...existing.financeContext,name:existing.label,date:existing.date}:existing;
 return A.form('단계 정보 수정',infoFields(A,meta),raw=>{
  const owner=writableOwner(A,project.id),info=readStageInfo(raw);
  const target=snapshotId?owner.costStages.find(row=>row.id===snapshotId&&!row.deletedAt):owner.financeCurrentStage||{};
  if(!target||JSON.stringify(target)!==before||snapshotId&&!A.domain.activeStages(owner).some(row=>row.id===snapshotId))throw Error('단계가 변경되었거나 삭제되었습니다. 입력값을 확인하고 다시 열어 주세요.');
  if(!snapshotId){const previous=A.domain.activeStages(owner).at(-1);if(previous?.date&&info.date<previous.date)throw Error('최근 단계 기준일은 직전 단계보다 빠를 수 없습니다.');}
  A.transaction(()=>{
   const old=structuredClone(target);
   if(snapshotId){target.label=info.name;target.businessStageType=info.name;target.date=info.date;target.financeContext={...A.financeMilestones.context(owner,target),reason:info.reason,notes:info.notes};}
   else owner.financeCurrentStage={...target,...info};
   A.audit('UPDATE',snapshotId?'costStageInfo':'financeCurrentStage',snapshotId||owner.id,old,snapshotId?structuredClone(target):owner.financeCurrentStage,'단계 정보 수정',{projectId:owner.id,view:'finance'});
  });
 },'저장',{...options,draftContext:'finance-info:'+project.id+':'+(snapshotId||'current')});
}
// Existing consumers can retain the current-stage entry without numeric fields.
export function editCurrentMilestone(A,project){return editMilestoneInfo(A,project,null);}
