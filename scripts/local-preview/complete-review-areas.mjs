// Explicit local dummy-data correction; never invoked during application boot.
const copy=x=>JSON.parse(JSON.stringify(x));
const plans={A:['2024-06-01',63500,12400],B:['2024-07-01',40005,7812],C:['2024-05-01',133350,26040]};
export function completeReviewAreas(A,p){
 const key=p.id.replace('TEST-20261016-',''),plan=plans[key];
 if(!plan||p.id!=='TEST-20261016-'+key)throw Error('로컬 더미 사업만 보완할 수 있습니다.');
 if(p.localReviewAreas177)return false;
 const originals=copy(p),stages=A.domain.activeStages(p);
 if(stages.length!==2)throw Error('기존 단계 구성을 확인해 주세요.');
 p.localReviewAreas177={original:originals,reason:'사용자 승인 더미 면적·기준일 보완'};
 const area=(old,date)=>({...A.areas.normalize(old),gfaTotal:old.gfaTotal??plan[1],acquisitionLandArea:old.acquisitionLandArea??plan[2],date:old.date||date,source:old.source||'로컬 검토용 더미 면적',id:A.uid('area-review'),snapshotOnly:true});
 for(const s of stages){
  s.date=s.date||s.financeContext?.date||plan[0];
  const next=area(A.areas.forStage(p,s),s.date);
  p.areaVersions.push(copy(next));s.area=copy(next);s.areaVersionId=next.id;s.areaRecoveryVersion=1;
 }
 const current=A.areas.current(p);
 if(current.acquisitionLandArea==null||current.gfaTotal==null){
  const next=area(current,p.asOf);delete next.snapshotOnly;p.areaVersions.push(next);p.currentAreaVersionId=next.id;
  p.building.acquisitionLandArea=next.acquisitionLandArea;
 }
 return true;
}
