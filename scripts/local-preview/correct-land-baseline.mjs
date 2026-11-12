// Explicit LOCAL-UI-170 correction of the Seoul local review copy. Never runs automatically.
export function correctReviewLandBaseline(A,p){
 const copy=x=>JSON.parse(JSON.stringify(x)),nodeId='c-1-xu5ckpud';
 if(p.id!=='TEST-20261016-A'||A.current()?.id!==p.id)throw Error('정정 대상 사업을 확인해 주세요.');
 const uw=A.domain.underwriting(p),target=uw?.values?.[nodeId];
 if(target!==93461540000)throw Error('최초 토지매입비가 변경되었습니다. 다시 확인해 주세요.');
 const active=A.domain.activeStages(p),refi=active.find(s=>s.label==='1차 리파이낸싱');
 if(!refi||![target,95661540000].includes(refi.values[nodeId])||![target,97107690000].includes(A.amount(p,nodeId)))throw Error('검토본 금액이 변경되었습니다. 다시 확인해 주세요.');
 if(refi.values[nodeId]===target&&A.amount(p,nodeId)===target)return {changed:false};
 const oldTotal=A.total(p),oldAmount=A.amount(p,nodeId),oldMeta=copy(p.financeCurrentStage);
 let correctionId=null;
 A.transaction(()=>{
  if(refi.values[nodeId]!==target){
   const draft=copy(refi);draft.id=A.uid('stage');draft.supersedesId=refi.id;draft.createdAt=new Date().toISOString();
   draft.values[nodeId]=target;draft.reasons={...draft.reasons,[nodeId]:'최초 매입금액 유지: 단계별 임의 증액 정정'};
   draft.financeContext={...draft.financeContext,reason:'브릿지 차환. 출자 300억원·대출 약정 400억원 확대. 토지매입비는 최초 매입금액 유지.',notes:{...draft.financeContext?.notes,cost:'최초 원가 유지',land:'최초 매입금액 유지'}};
   A.domain.finalizeStage(p,draft,A.domain.underwriting(p),draft.reasons);correctionId=draft.id;
  }
  if(A.amount(p,nodeId)!==target)A.domain.saveCost(p,nodeId,target);
  p.financeCurrentStage.notes={...p.financeCurrentStage.notes,cost:'공사·금융비 변경 반영',land:'최초 매입금액 유지'};
  A.audit('CORRECT','financeCurrentStage',p.id,oldMeta,copy(p.financeCurrentStage),'사용자 지시: 토지매입비 최초 매입금액 유지',{projectId:p.id,view:'finance'});
  if(A.total(p)!==oldTotal-(oldAmount-target))throw Error('토지매입비 정정 후 원가합계를 확인해 주세요.');
 });
 return {changed:true,target,oldAmount,oldTotal,total:A.total(p),correctionId};
}
