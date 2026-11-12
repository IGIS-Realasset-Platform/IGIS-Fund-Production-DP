// LOCAL-UI-175. Explicit, one-time correction of the user-authorized local B/C
// dummy projects. Never run during boot, on production, or for other projects.
import {milestoneRows,endingMonth} from './finance-milestones.js';
import {capitalSourceTotal} from './finance-capital.js';
const clone=x=>JSON.parse(JSON.stringify(x)),E=100000000;
const plans={
 'TEST-20261016-B':{uwDate:'2024-07-01',duration:[48,60,78],equity:[[250,200],[340,260]],debt:[[950],[850,250],[900,328.5]],financeIncrease:15,midFinance:5,midConstruction:8},
 'TEST-20261016-C':{uwDate:'2024-05-01',duration:[84,90,96],equity:[[850,650],[1080,820]],debt:[[2900],[2900,800],[3000,1095]],financeIncrease:50,midFinance:15,midConstruction:25}
};
export function completeReviewFinancing(A,p){
 const plan=plans[p.id];if(!plan||A.current()?.id!==p.id)throw Error('로컬 검토 사업을 확인해 주세요.');
 if(p.localReviewFinancing175)return {changed:false};
 const original=clone(p),uw=A.domain.underwriting(p),rows=milestoneRows(A,p);
 if(!uw||A.domain.activeStages(p).length!==1||p.financeCurrentStage)throw Error('단계 자료가 변경되어 자동 정리하지 않았습니다.');
 const first=rows[0],current=rows.at(-1),loans=p.loans.filter(x=>!x.deletedAt),equities=p.equities.filter(x=>!x.deletedAt);
 if(loans.length!==2||equities.length!==2)throw Error('조달 원장을 다시 확인해 주세요.');
 const leaf=name=>p.cbs.find(n=>n.name===name&&!n.companyProfileKey&&!n.deletedAt);
 const land=leaf('토지매입비'),interest=leaf('본PF 이자'),construction=leaf('골조공사');
 if(!land||!interest||!construction||![first.values.land,first.values.interest,uw.values[construction.id],A.amount(p,interest.id),current.gfa].every(Number.isFinite))throw Error('연결 원금액이 없습니다.');
 const sources=index=>[
  ...equities.map((row,i)=>({id:'equity:'+row.id,kind:'equity',tranche:'자기자본',party:row.company,role:row.purpose||'',amount:plan.equity[index][i]*E})),
  ...plan.debt[index].map((amount,i)=>({id:'loan:'+loans[i].id,kind:'debt',tranche:index===0?'브릿지론 · 선순위':i===0?'Tr.A · 선순위':'Tr.B · 후순위',party:loans[i].institution,role:i===0?'선순위':'후순위',amount:amount*E}))
 ];
 const context=index=>({gfa:current.gfa,duration:plan.duration[index],periodEnd:endingMonth(p.basic.periodStart,plan.duration[index]),capitalSources:sources(index),funding:capitalSourceTotal(sources(index)),reason:index===0?'토지 최초 매입 및 개발계획 수립, 브릿지 조달 기준':'인허가 보완과 공사계획 구체화에 따른 브릿지 차환 및 자본 확충',notes:{land:'최초 토지매입금액 유지',construction:index===0?'최초 공사계획 기준':'구조·시공계획 보완에 따른 공사비 증가',interest:index===0?'최초 개발기간 기준':'인허가 보완 기간의 금융비 반영',duration:index===0?'최초 개발일정':'인허가 보완 및 착공 일정 조정',funding:index===0?'출자 및 브릿지 약정':'기존 브릿지 차환과 선·후순위 조달',cost:index===0?'최초 사업비 기준':'공사비와 금융비 증가분 반영'}});
 A.transaction(()=>{
  p.localReviewFinancing175={version:1,original,reason:'사용자 승인: 용인·용산도 서울 중구와 같은 단계별 로컬 더미 자료 정리'};
  const initial=clone(uw);initial.id=A.uid('stage');initial.supersedesId=uw.id;initial.date=plan.uwDate;initial.financeContext=context(0);initial.areas=clone(A.areas.current(p));
  A.domain.finalizeStage(p,initial,uw);
  const middle=clone(uw);middle.id=A.uid('stage');delete middle.supersedesId;middle.kind='custom';middle.controlEventType=null;middle.label='1차 리파이낸싱';middle.businessStageType=middle.label;middle.date='2025-06-30';middle.financeContext=context(1);middle.areas=clone(A.areas.current(p));
  middle.values[construction.id]+=plan.midConstruction*E;middle.values[interest.id]+=plan.midFinance*E;
  middle.reasons={...middle.reasons,[construction.id]:'구조·시공계획 보완',[interest.id]:'브릿지 차환 및 사업기간 연장'};
  A.domain.finalizeStage(p,middle,initial,middle.reasons);
  A.domain.saveCost(p,land.id,first.values.land);
  A.domain.saveCost(p,interest.id,A.amount(p,interest.id)+(first.values.interest+plan.financeIncrease*E-current.values.interest));
  loans.forEach((loan,i)=>Object.assign(loan,{type:'본PF',rank:i===0?'선순위':'후순위',tranche:i===0?'Tr.A · 선순위':'Tr.B · 후순위',trancheName:i===0?'Tr.A · 선순위':'Tr.B · 후순위',commitment:plan.debt[2][i]*E,start:'2026-11-12',maturity:p.id.endsWith('B')?'2031-03-31':'2032-09-30',finalMaturity:p.id.endsWith('B')?'2031-03-31':'2032-09-30'}));
  p.basic.periodEnd=endingMonth(p.basic.periodStart,plan.duration[2]);
  p.financeCurrentStage={name:'본PF 1차',date:'2026-11-12',reason:'본PF 전환으로 브릿지를 차환하고 공사·금융비 및 준공일정을 갱신',notes:{land:'최초 토지매입금액 유지',cost:'최초 대비 공사·금융비 변경 반영',construction:'확정 시공계획 및 공사 범위 반영',interest:'본PF 조달 및 연장된 사업기간 금융비 반영',duration:'공사 일정 조정에 따른 준공시점 변경',funding:'브릿지 차환 후 본PF 선·후순위 약정 및 출자'}};
  A.audit('CORRECT','financeReview',p.id,original,{stages:['최초UW','1차 리파이낸싱','본PF 1차']},'사용자 승인 로컬 더미 단계자료 정리',{projectId:p.id,view:'finance'});
  const result=milestoneRows(A,p);
  if(result.length!==3||result.at(-1).values.funding!==current.values.funding||result.some(r=>r.values.land!==first.values.land))throw Error('단계 합계 또는 토지·조달 보존 검사 실패');
  if(!(result[0].values.cost<result[1].values.cost&&result[1].values.cost<result[2].values.cost))throw Error('단계별 사업비 순서 검사 실패');
 });
 return {changed:true,rows:milestoneRows(A,p).map(({name,date,values,gfa,periodEnd,capitalSources})=>({name,date,values,gfa,periodEnd,capitalSources}))};
}
