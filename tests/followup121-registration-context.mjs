import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';

const checks=[],sha=x=>crypto.createHash('sha256').update(x).digest('hex'),clone=x=>JSON.parse(JSON.stringify(x));
const person=(id='person-1')=>({id,name:'가상 검수인력',company:'가상 검수회사',qualification:'가상 자격 예시',career:'가상 경력 원본',preEducationDate:'2026-01-10',recentTrainingDate:'2026-05-10',employmentStatus:'재직',registrationStatus:'등록 명단 반영',employmentStartDate:'2026-01-01',employmentEndDate:'',registrationStartDate:'2026-01-15',registrationEndDate:'',evidencePath:'가상/증빙.pdf',createdAt:'2026-10-01T00:00:00Z',deletedAt:null});
function fixture(){
 const h=makeHarness({seed:{projects:[],entities:[]},modules:['core','legal','permit-views']}),A=h.A;
 const e={id:'entity-1',name:'가상 법인1',businessRegistration:'000-00-00000',corporationRegistration:'110111-1234567',legalForm:'일반법인',route:'일반법인',status:'검토 중',capital:0,professionals:2,office:'가상 사무실',professionalRecords:[person(),{...person('person-retired'),name:'가상 퇴사 인력',employmentStatus:'퇴사',registrationStatus:'등록 명단 제외',deletedAt:'2026-10-10T00:00:00Z',restoreState:{employmentStatus:'재직',registrationStatus:'등록 명단 반영',employmentEndDate:'',registrationEndDate:''}}]},other={...clone(e),id:'entity-2',name:'가상 법인2',professionalRecords:[]};
 const p={id:'project-a',name:'A',entityId:e.id,basic:{operator:e.name},cbs:[{id:'cost-a',current:123}],contracts:[],loans:[]},q={...clone(p),id:'project-b',name:'B',entityId:other.id};A.state.projects=[p,q];A.state.entities=[e,other];A.ui.projectId=p.id;
 let form;const audit=[];A.audit=(...v)=>audit.push(v);A.form=(title,fields,submit,label,options)=>{form={title,fields,submit,label,options};};
 const click=(action,data={})=>{const button={dataset:{action,...data}};for(const listener of h.listeners.click||[])listener({target:{closest:s=>s==='[data-action]'?button:null},preventDefault(){}});assert(form,'실제 등록 handler가 폼을 열어야 합니다.');return form;};
 return {...h,A,p,q,e,other,audit,click,get form(){return form;}};
}
function open(h,flow){
 const row=h.e.professionalRecords[0],retired=h.e.professionalRecords[1];
 if(flow==='등록정보'){h.click('legal-entity-edit');return {values:{...clone(h.e),office:'가상 수정 사무실'},record:null};}
 if(flow==='인력 추가'){h.click('legal-professional-add');return {values:{...person('new'),name:'가상 신규 인력'},record:null};}
 if(flow==='인력 수정'){h.click('legal-professional-edit',{id:row.id});return {values:{...clone(row),career:'가상 수정 경력'},record:row};}
 if(flow==='퇴사'){h.click('legal-professional-retire',{id:row.id});return {values:{employmentEndDate:'2026-10-20',registrationEndDate:'2026-10-20'},record:row};}
 h.click('legal-professional-restore',{id:retired.id});return {values:{},record:retired};
}
function check(name,fn){try{fn();checks.push({name,pass:true});}catch(error){checks.push({name,pass:false,error:error.message});}}
const flows=['등록정보','인력 추가','인력 수정','퇴사','복구'];
for(const flow of flows)for(const mutation of ['사업 전환','사업 삭제','법인 연결 교체','법인 삭제','동일ID 법인 원본 교체'])check(flow+' / '+mutation+' 저장 전 차단·입력/감사 불변',()=>{
 const h=fixture(),{A,p,q,e}=h,{values}=open(h,flow),raw=JSON.stringify(values);
 if(mutation==='사업 전환')A.ui.projectId=q.id;
 if(mutation==='사업 삭제')p.deletedAt='2026-10-21';
 if(mutation==='법인 연결 교체')p.entityId=h.other.id;
 if(mutation==='법인 삭제')A.state.entities=A.state.entities.filter(v=>v.id!==e.id);
 if(mutation==='동일ID 법인 원본 교체')A.state.entities[0]={...clone(e),businessRegistration:'111-11-11111',name:'다른 가상 법인'};
 const before=JSON.stringify(A.state);assert.throws(()=>h.form.submit(values),error=>!!error.fieldErrors?.name);assert.equal(JSON.stringify(A.state),before);assert.equal(JSON.stringify(values),raw);assert.equal(h.audit.length,0);
});
for(const flow of ['인력 수정','퇴사','복구'])for(const mutation of ['기록 삭제','동일ID 기록 교체'])check(flow+' / '+mutation+'를 신규 추가/기존값 덮기로 바꾸지 않음',()=>{
 const h=fixture(),{values,record}=open(h,flow);if(mutation==='기록 삭제')h.e.professionalRecords=h.e.professionalRecords.filter(r=>r.id!==record.id);else{const index=h.e.professionalRecords.findIndex(r=>r.id===record.id);h.e.professionalRecords[index]={...clone(record),career:'외부에서 교체된 가상 원본',createdAt:'2026-10-21T01:00:00Z'};}const before=JSON.stringify(h.A.state);assert.throws(()=>h.form.submit(values),error=>!!error.fieldErrors?.name);assert.equal(JSON.stringify(h.A.state),before);assert.equal(h.audit.length,0);
});
for(const flow of flows)check(flow+' / 동일 내용 사업·법인 재조회 허용·현재 객체에 저장',()=>{
 const h=fixture(),{values,record}=open(h,flow),old=h.e,fresh=clone(h.e);h.A.state.projects[0]=clone(h.p);h.A.state.entities[0]=fresh;assert.doesNotThrow(()=>h.form.submit(values));assert.equal(h.audit.length,1);if(flow==='등록정보'){assert.equal(fresh.office,'가상 수정 사무실');assert.equal(old.office,'가상 사무실');}else if(flow==='인력 추가'){assert.equal(fresh.professionalRecords.length,3);assert.equal(old.professionalRecords.length,2);}else if(flow==='인력 수정'){assert.equal(fresh.professionalRecords.find(r=>r.id===record.id).career,'가상 수정 경력');assert.equal(old.professionalRecords[0].career,'가상 경력 원본');}else if(flow==='퇴사'){assert(fresh.professionalRecords.find(r=>r.id===record.id).deletedAt);assert.equal(old.professionalRecords[0].deletedAt,null);}else{assert.equal(fresh.professionalRecords.find(r=>r.id===record.id).deletedAt,null);assert(old.professionalRecords[1].deletedAt);}
});
for(const flow of flows)check(flow+' / 무관 메모·다른 비용·다른 인력 변경 허용',()=>{
 const h=fixture(),{values}=open(h,flow);h.p.notes='무관한 메모';h.p.cbs[0].current=124;h.q.notes='다른 사업 메모';h.e.professionalRecords.push(person('unrelated-person'));assert.doesNotThrow(()=>h.form.submit(values));assert.equal(h.audit.length,1);assert.equal(h.p.cbs[0].current,124);assert(h.e.professionalRecords.some(r=>r.id==='unrelated-person'&&r.career==='가상 경력 원본'));
});
for(const selected of ['A','B'])check('동일 법인 공유 사업 '+selected+'에서 정상 편집·단일 법인 원장 유지',()=>{
 const h=fixture();h.q.entityId=h.e.id;if(selected==='B')h.A.ui.projectId=h.q.id;h.click('legal-professional-edit',{id:'person-1'});assert.doesNotThrow(()=>h.form.submit({...person(),career:'공유 법인 수정'}));assert.equal(h.e.professionalRecords[0].career,'공유 법인 수정');assert.equal(h.A.state.entities.filter(e=>e.id===h.e.id).length,1);assert(h.A.legal.ui.registration(h.p).includes('공유 법인 수정'));assert(h.A.legal.ui.registration(h.q).includes('공유 법인 수정'));assert.equal(h.audit.length,1);
});
for(const flow of flows)check(flow+' / 폼을 연 뒤 편집 권한 회수는 차단',()=>{
 const h=fixture(),{values}=open(h,flow);h.A.cloudMode=true;h.A.cloudPersistence.capabilities=()=>({manageAccess:false});h.A.cloudPersistence.projectRoles=()=>({[h.p.id]:'viewer'});const before=JSON.stringify(h.A.state);assert.throws(()=>h.form.submit(values),error=>!!error.fieldErrors?.name);assert.equal(JSON.stringify(h.A.state),before);assert.equal(h.audit.length,0);
});
for(const flow of flows)check(flow+' / 사업·법인 비활성은 저장 전 차단',()=>{for(const kind of ['사업','법인']){const h=fixture(),{values}=open(h,flow);(kind==='사업'?h.p:h.e).active=false;const before=JSON.stringify(h.A.state);assert.throws(()=>h.form.submit(values),error=>!!error.fieldErrors?.name);assert.equal(JSON.stringify(h.A.state),before);assert.equal(h.audit.length,0);}});
for(const flow of ['인력 수정','퇴사'])check(flow+' / 열린 뒤 soft-delete된 기록은 차단',()=>{const h=fixture(),{values,record}=open(h,flow);record.deletedAt='2026-10-21T01:00:00Z';const before=JSON.stringify(h.A.state);assert.throws(()=>h.form.submit(values),error=>!!error.fieldErrors?.name);assert.equal(JSON.stringify(h.A.state),before);assert.equal(h.audit.length,0);});
check('등록정보 / 다른 창에서 바뀐 실제 편집 필드를 덮어쓰지 않음',()=>{const h=fixture(),{values}=open(h,'등록정보');h.e.office='다른 창에서 바꾼 가상 사무실';const before=JSON.stringify(h.A.state);assert.throws(()=>h.form.submit(values),error=>!!error.fieldErrors?.name);assert.equal(JSON.stringify(h.A.state),before);assert.equal(h.audit.length,0);});
check('복구 / 퇴사 전 상태가 바뀐 경우 오래된 복구를 차단',()=>{const h=fixture(),{values,record}=open(h,'복구');record.restoreState.registrationStatus='검토 중';const before=JSON.stringify(h.A.state);assert.throws(()=>h.form.submit(values),error=>!!error.fieldErrors?.name);assert.equal(JSON.stringify(h.A.state),before);assert.equal(h.audit.length,0);});
for(const role of ['editor','approver','admin'])check('현재 '+role+'는 기존 권한 범위의 정상 저장 허용',()=>{const h=fixture(),{values}=open(h,'인력 수정');h.A.cloudMode=true;h.A.cloudPersistence.capabilities=()=>({manageAccess:role==='admin'});h.A.cloudPersistence.projectRoles=()=>({[h.p.id]:role==='admin'?'viewer':role});assert.doesNotThrow(()=>h.form.submit(values));assert.equal(h.audit.length,1);});
const result={suite:'followup121-registration-context',sourceSha256:sha(fs.readFileSync('src/legal.js')),checks,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,total:checks.length,scope:'공개 UI handler의 실제 제출 callback을 합성 원본으로 실행. 실제 브라우저/DB 검수와 별도.',browser:false,database:false};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(result.failed)process.exitCode=1;
