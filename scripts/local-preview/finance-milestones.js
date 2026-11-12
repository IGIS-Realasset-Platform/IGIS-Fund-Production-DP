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
export function milestoneRows(A,project){
 const nodes=new Map(A.companyCostProfile.managementNodes(project).map(node=>[node.companyProfileKey,node.id]));
 const costs=snapshot=>{
  const value=key=>nodes.has(key)?A.domain.modeValue(project,nodes.get(key),snapshot,'amount'):null;
  return {cost:snapshot?A.domain.modeValue(project,'total',snapshot,'amount'):A.total(project),
   land:value('land_purchase'),construction:value('construction'),interest:value('finance')};
 };
 const rows=A.domain.activeStages(project).map(snapshot=>{
  const extra=A.financeMilestones?.context(project,snapshot)||snapshot.financeContext||{};
  return {id:'snapshot:'+snapshot.id,snapshot,name:snapshot.label||'사업 단계',date:snapshot.date||extra.date||'',
   values:{funding:extra.funding??null,sale:extra.sale??null,duration:extra.duration??null,...costs(snapshot)},
   gfa:A.areas.forStage(project,snapshot)?.gfaTotal??null,periodEnd:extra.periodEnd||'',reason:extra.reason||'',
   notes:extra.notes||{},reasons:Object.entries(snapshot.reasons||{}).filter(([,text])=>typeof text==='string'&&text.trim()).map(([id,text])=>[snapshot.nodes?.find(node=>node.id===id)?.name,text])};
 });
 const meta=project.financeCurrentStage||{};
 rows.push({id:'current',name:meta.name||'최근 사업 단계',date:meta.date||'',
  values:{funding:A.contracts.financeCapitalTotals(project).total,sale:meta.sale??null,duration:projectDuration(project.basic),...costs(null)},
  gfa:A.areas.current(project).gfaTotal,periodEnd:project.basic?.periodEnd||'',reason:meta.reason||'',notes:meta.notes||{}});
 return rows;
}
export function installMilestoneCapture(A){
 if(A.financeMilestones)return;
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
    reason:project.financeCurrentStage?.reason,notes:project.financeCurrentStage?.notes,
   }:{});
   return '<fieldset class="full studio-milestone-fields"><legend>당시 조달·사업 지표</legend><div class="form-grid">'+
    A.field('financeFunding','총 조달규모 · 원',data.funding??'','number')+
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
   return {funding:amount(values.financeFunding,'총 조달규모'),sale:amount(values.financeSale,'매각 목표'),duration,periodEnd,reason,notes};
  },
 };
}

export function editCurrentMilestone(A,project){
 const before=JSON.stringify(project.financeCurrentStage||null),meta=project.financeCurrentStage||{};
 const fields=A.field('name','최근 단계명',meta.name||'')+A.field('date','기준일',meta.date||'','date')+
  A.field('reason','변경 사유·관련 이슈',meta.reason||'','textarea')+
  A.field('sale','매각 목표 · 원',meta.sale??'','number')+
  ['cost','funding','construction','interest'].map((key,i)=>A.field('note_'+key,['원가','조달규모','공사비','금융비'][i]+' 변경 사유',meta.notes?.[key]||'','textarea')).join('');
 A.form('최근 사업 단계 수정',fields,values=>{
  const owner=A.current();
  if(owner?.id!==project.id||JSON.stringify(owner.financeCurrentStage||null)!==before)throw Error('사업 또는 단계가 변경되었습니다. 입력값을 확인하고 다시 열어 주세요.');
  const name=String(values.name||'').trim(),date=values.date,reason=String(values.reason||'').trim();
  if(!name||name.length>80)throw Error('최근 단계명을 80자 이내로 입력해 주세요.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw Error('기준일을 입력해 주세요.');
  const previous=A.domain.activeStages(owner).at(-1);
  if(previous?.date&&date<previous.date)throw Error('최근 단계 기준일은 직전 단계보다 빠를 수 없습니다.');
  if(!reason||reason.length>1000)throw Error('변경 사유·관련 이슈를 1,000자 이내로 입력해 주세요.');
  const extra=A.financeMilestones.read({financeSale:values.sale,financeReason:reason,...Object.fromEntries(['cost','funding','construction','interest'].map(key=>['financeNote_'+key,values['note_'+key]]))});
  const next={name,date,reason,sale:extra.sale,notes:extra.notes};
  A.transaction(()=>{owner.financeCurrentStage=next;A.audit('UPDATE','financeCurrentStage',owner.id,meta,next,'최근 사업 단계 수정',{projectId:owner.id,view:'finance'});});
 },'저장');
}
