import assert from 'node:assert/strict';
export const APPROVED_SAMPLE_IDS=['TEST-20261016-A','TEST-20261016-B','TEST-20261016-C'];
const batchId='20261021-sample-completion-v1',copy=structuredClone;
const blank=v=>v===null||v===undefined||v===''||v==='미확인';
const putMissing=(target,values)=>{for(const[k,v]of Object.entries(values))if(blank(target[k]))target[k]=v;};
export function completeApprovedSamples(state,{permitPack=null,clock='2026-10-21T05:00:00Z'}={}){
 assert(state&&Array.isArray(state.projects),'사업 자료가 필요합니다.');
 assert.deepEqual(state.projects.map(p=>p.id).sort(),APPROVED_SAMPLE_IDS,'정확한 승인 샘플3개만 보완할 수 있습니다.');
 for(const p of state.projects){assert(p.testData?.kind==='user-approved-html-fixture'&&p.testData.batchId==='20261016-abc','승인 샘플 원본 표식이 필요합니다.');assert(state.entities?.find(e=>e.id===p.entityId)?.sample===true,'실제 법인 자료는 샘플로 채울 수 없습니다.');}
 if(permitPack){assert(Array.isArray(permitPack.projects));for(const p of permitPack.projects){assert(APPROVED_SAMPLE_IDS.includes(p.id));assert(Object.keys(p).every(k=>['id','permits','permitConditions'].includes(k)),'인허가 샘플팩은 다른 원장을 덮을 수 없습니다.');}}
 const out=copy(state);
 for(const p of out.projects){
  if(p.sampleCompletion?.batchId===batchId)continue;
  const label=p.name,path='샘플자료/'+label+'/',entity=out.entities.find(e=>e.id===p.entityId);
  putMissing(entity,{representativeName:'샘플 대표자 '+label,legalForm:'주식회사',businessRegistration:'000-00-00000',office:p.location+' 샘플 사무실',phone:'02-0000-0000',registrationNumber:'샘플-2026-'+label,registrationDate:'2024-06-20',agency:label==='B'?'경기도': '서울특별시',agencyContactName:'샘플 기관 담당자',agencyContactPhone:'02-0000-0000',lastChangeReportDate:'2026-08-20',capital:500000000,professionals:5,evidencePath:path+'개발업/샘플 등록증.pdf',manager:'샘플 자산관리회사',managerOffice:'서울특별시 샘플 사무실',managerPhone:'02-0000-0000',contractPath:path+'개발업/샘플 업무위탁계약.pdf'});
  if(entity.status==='검토 중'||blank(entity.status))entity.status='등록 완료';
  entity.professionalRecords=entity.professionalRecords||[];
  const count=Number.isInteger(entity.professionals)&&entity.professionals>=0?Math.min(entity.professionals,20):5;
  if(entity.professionalRecords.length===0){
   for(let i=0;i<count+1;i++){
    const retired=i===count,record={id:'sample-professional-'+label+'-'+(i+1),name:'샘플 전문인력 '+label+(i+1),company:entity.manager,qualification:'',career:'',preEducationDate:'2024-05-10',recentTrainingDate:'2026-05-10',employmentStatus:retired?'퇴사':'재직',registrationStatus:retired?'등록 명단 제외':'등록 명단 반영',employmentStartDate:'2024-01-02',employmentEndDate:retired?'2026-07-31':'',registrationStartDate:'2024-06-20',registrationEndDate:retired?'2026-07-31':'',evidencePath:path+'개발업/샘플 전문인력 '+(i+1)+'.pdf',sample:true,sampleBatchId:batchId,createdAt:clock,updatedAt:clock};
    if(retired)Object.assign(record,{deletedAt:'2026-07-31T00:00:00Z',restoreState:{employmentStatus:'재직',registrationStatus:'등록 명단 반영',employmentEndDate:'',registrationEndDate:''}});
    entity.professionalRecords.push(record);
   }
  }
  const contractId='sample-completion-contract-'+label,cbs=(p.cbs||[]).find(r=>!r.deletedAt&&r.name==='건축설계')||(p.cbs||[]).find(r=>!r.deletedAt&&r.parentId&&!(p.cbs||[]).some(c=>!c.deletedAt&&c.parentId===r.id)&&typeof r.current==='number');
  assert(cbs,'샘플 계약을 연결할 기존 비용이 필요합니다.');
  p.contracts=p.contracts||[];
  if(!p.contracts.some(c=>c.id===contractId)){
   const allocations=amount=>[{cbsId:cbs.id,amount}],obligationId=contractId+'-obligation-1',paymentId=contractId+'-payment-1';
   const revision=(n,net,date,note)=>({id:contractId+'-revision-'+n,revision:n,date,net,vat:net/10,total:net*11/10,costAmount:net,file:path+'계약/샘플 계약 '+n+'.pdf',note,allocations:allocations(net),sample:true});
   p.contracts.push({id:contractId,name:'샘플 설계 추가용역 계약',type:'용역',date:'2026-07-01',period:'2026-07~2026-12',counterparty:'샘플 설계회사',status:'체결',file:path+'계약/샘플 계약 2.pdf',amount:1320000,cbsId:cbs.id,costItem:cbs.name,proposalNumber:'SAMPLE-'+label+'-001',schemaVersion:3,sample:true,sampleBatchId:batchId,revisions:[revision(1,1000000,'2026-07-01','샘플 원계약'),revision(2,1200000,'2026-08-01','샘플 과업 추가 +200,000원')],certifications:[{id:contractId+'-certification-1',date:'2026-08-10',amount:330000,costAmount:300000,allocations:allocations(300000),note:'샘플 기성 확인',sourcePath:path+'기성/샘플 기성확인서.pdf',sample:true}],obligations:[{id:obligationId,label:'샘플 1차 확정금',kind:'선급금',confirmedAmount:220000,confirmedAt:'2026-08-10',sourcePath:path+'지급/샘플 지급조건.pdf',sample:true},{id:contractId+'-obligation-2',label:'샘플 2차 확정금',kind:'기성금',confirmedAmount:330000,confirmedAt:'2026-08-20',sourcePath:path+'지급/샘플 지급조건.pdf',sample:true}],payments:[{id:paymentId,date:'2026-08-20',amount:220000,costAmount:200000,allocations:allocations(200000),obligationId,proposalNumber:'SAMPLE-'+label+'-PAY-001',sourcePath:path+'지급/샘플 지급증빙.pdf',note:'가상 지급 예시·실제 출금 아님',sample:true}],paymentCoverage:{status:'confirmed',asOf:'2026-08-31',sourcePath:path+'지급/샘플 대사표.xlsx',reviewedAt:'2026-08-31',paid:220000,paymentIds:[paymentId]},paymentReviews:[{id:contractId+'-review-1',status:'confirmed',asOf:'2026-08-31',sourcePath:path+'지급/샘플 대사표.xlsx',paid:220000,paymentIds:[paymentId],sample:true}]});
   p.contracts.at(-1).summary={
    purpose:'가상 프로젝트 '+label+'의 설계 변경 검토 및 추가 도면 작성 예시입니다.',
    payment:['선급금 220,000원과 1차 기성금 330,000원은 부가세를 포함한 가상 확정 지급조건입니다.','잔여 대가는 최종 성과품 검수 후 계약 잔액 범위에서 지급하는 예시입니다.'],
    includes:['기존 설계의 변경 영향 검토','추가 도면과 변경 내역서 작성'],
    excludes:['별도 시공계약의 실제 공사','원계약에 포함되지 않은 추가 조사'],
    responsibilities:['수급자는 발주자가 확인한 변경 범위의 도면과 검토 기록을 제출합니다.'],
    guarantees:['성과품 오류의 보완 책임을 둔 가상 조항입니다. 실제 보증서 발급을 뜻하지 않습니다.'],
    termination:['미이행 과업은 서면 보완 요청 후 계약상 해지 절차를 진행하는 가상 예시입니다.'],
    changes:[{date:'2026-08-01',title:'추가 설계 과업 반영',detail:'공급가액 1,000,000원에서 1,200,000원으로 변경한 가상 예시입니다. 기존 사업비에는 자동 가산하지 않습니다.'}],
    sources:[{clause:'샘플 계약 제1조 · 목적',text:'설계 변경 검토와 추가 도면 작성의 가상 과업입니다.'},{clause:'샘플 계약 제4조 · 대금',text:'모든 금액·조항·경로는 기능 검수용이며 실제 체결·지급 사실을 뜻하지 않습니다.'}]
   };
  }
  p.vatRecords=p.vatRecords||[];const vatId='sample-completion-vat-'+label;if(!p.vatRecords.some(r=>r.id===vatId))p.vatRecords.push({id:vatId,kind:'contract',sourceId:contractId,version:1,supersedesId:null,mode:'evidence',asOf:'2026-08-31',transactionType:'taxable',attribution:'building',deduction:'deductible',reviewStatus:'reviewed',amountBasis:'gross',net:1200000,vat:120000,gross:1320000,sourcePath:path+'세무/가상 세금계산서.pdf',reviewer:'샘플 세무 담당자',taxpayer:entity.name,period:'2026년 제2기(가상 예시)',sourceSnapshot:{name:'샘플 설계 추가용역 계약',value:1320000},note:'신규 가상 계약만의 공제 검토 예시·기존 불공제VAT/사업비 미반영',createdAt:clock,sample:true,sampleBatchId:batchId});
  p.documents=p.documents||[];const documentId='sample-completion-document-'+label;if(!p.documents.some(d=>d.id===documentId))p.documents.push({id:documentId,title:'샘플 보완자료 안내',category:'검토자료',number:'SAMPLE-'+label+'-DOC-001',date:'2026-08-31',issuer:'샘플 프로젝트 담당팀',recipient:'샘플 검토자',location:path+'안내/샘플자료 안내.pdf',related:'이 명칭과 경로는 가상 예시이며 실제 제출·송금·허가·직원 자격을 뜻하지 않습니다.',status:'보관',revision:'1',sample:true,sampleBatchId:batchId});
  p.loanEvents=p.loanEvents||[];for(const loan of p.loans||[]){const id='sample-initial-loan-'+loan.id;if(!p.loanEvents.some(e=>e.id===id))p.loanEvents.push({id,loanId:loan.id,date:loan.start||'2025-06-01',kind:'약정 추가',before:null,after:copy(loan),note:'기존 가상 약정의 최초등록 예시·실제 거래 아님',sourcePath:path+'금융/샘플 약정서.pdf',sample:true,sampleBatchId:batchId});}
  const permit=permitPack?.projects.find(q=>q.id===p.id);if(permit){if(permit.permits)p.permits=copy(permit.permits);if(permit.permitConditions)p.permitConditions=copy(permit.permitConditions);}
  p.sampleCompletion={batchId,fictional:true,completedAt:clock,source:'사용자 승인 A·B·C 샘플 보완',covered:['등록정보','전문인력·퇴사이력','계약변경·기성·확정조건·지급·대사','문서','대출이력',...(permit?['검토의견·조치계획·근거자료·조건·회차']:[])],notFabricated:['공식 법령 개정','실제 직원 자격','메일·비밀번호','실제 송금·서명·제출','자연 예약·분기 도래','외부기관의 미제공 자료']};
 }
 return out;
}
