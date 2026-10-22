import assert from 'node:assert/strict';
import {validateWorkspaceState,mergeWorkspaceState} from '../server/cloud-storage.mjs';
import masterV3 from '../src/data/cost-type-master-v3.json' with {type:'json'};
const copy=structuredClone,checks=[];
const valid={version:'0.12.1',projects:[{id:'P1',cbs:[{id:'root',parentId:null,current:null},{id:'parent',parentId:'root',current:100,costBreakdown:{version:1,childIds:['a','b'],activatedFromAmount:100,activatedAt:'2026-10-21T00:00:00Z',reason:'확인된 원계약과 변경내역 분리',sourcePath:'샘플 근거'}},{id:'a',parentId:'parent',current:105,breakdownParentId:'parent',breakdownInputMode:'catalog'},{id:'b',parentId:'parent',current:-5,breakdownParentId:'parent',breakdownInputMode:'direct'}]}]};
function test(name,fn){try{fn();checks.push({name,passed:true})}catch(e){checks.push({name,passed:false,error:e.message})}}
test('원계약105+VE감액-5 상세와 기존 원금액100은 저장 가능',()=>assert.doesNotThrow(()=>validateWorkspaceState(copy(valid))));
test('전환 이후 추가변경은 상위 과거 원문100과 같지 않아도 저장 가능',()=>{const x=copy(valid);x.projects[0].cbs[2].current=110;assert.doesNotThrow(()=>validateWorkspaceState(x));});
for(const [name,change]of [
 ['하위ID 중복',r=>r[1].costBreakdown.childIds.push('a')],
 ['존재하지 않는 하위',r=>r[1].costBreakdown.childIds.push('missing')],
 ['하위의 다른 부모',r=>r[2].parentId='root'],
 ['포함 하위 삭제',r=>r[2].deletedAt='2026-10-21'],
 ['상위 자기포함',r=>r[1].costBreakdown.childIds.push('parent')],
 ['부모가 모르는 하위',r=>r[1].costBreakdown.childIds=['a']],
 ['코드없는 입력방식',r=>r[2].breakdownInputMode='untyped'],
 ['안전하지 않은 원금액',r=>r[1].costBreakdown.activatedFromAmount=1.5],
 ['사유없음',r=>r[1].costBreakdown.reason=''],
 ['전환일 잘못됨',r=>r[1].costBreakdown.activatedAt='not-date']
])test(name+'는 중앙 저장 경계에서 거절',()=>{const x=copy(valid);change(x.projects[0].cbs);assert.throws(()=>validateWorkspaceState(x),e=>e.code==='INVALID_COST_BREAKDOWN');});
test('기존 분해 미사용 사업은 동일하게 저장 가능',()=>assert.doesNotThrow(()=>validateWorkspaceState({projects:[{id:'P0',cbs:[{id:'ordinary',parentId:null,current:null}]}]})));
const link=id=>({recordId:id,costTypeId:'land_purchase',costTypeCode:'IGIS-COST:land_purchase',masterVersion:'company-cbs-v4',costTypeMappingStatus:'confirmed',reason:'독립 합성 비용분류',method:'selected'});
function transition(priorAmount=100){const after=copy(valid),p=after.projects[0];p.costCoding={version:1,masterVersion:'company-cbs-v4',currentByRecordId:{parent:link('parent'),a:link('a'),b:{...link('b'),method:'breakdown-inherit'}},historicalByStageId:{}};p.cbs[1].current=priorAmount;p.cbs[1].costBreakdown.activatedFromAmount=priorAmount;const before=copy(after);before.projects[0].cbs=before.projects[0].cbs.slice(0,2);delete before.projects[0].cbs[1].costBreakdown;delete before.projects[0].costCoding.currentByRecordId.a;delete before.projects[0].costCoding.currentByRecordId.b;return{before,after};}
const merge=({before,after})=>mergeWorkspaceState(before,after,{isAdmin:true,canCreateProject:true,projects:{}},{email:'qa@igisam.com'});
test('중앙 merge: 최초100→105-5 전환은 원자료 변경 없이 허용',()=>{const x=transition();assert.doesNotThrow(()=>merge(x));assert.equal(x.before.projects[0].cbs[1].current,100);});
test('중앙 merge: 초기 템플릿 null→123+미입력은 임의 잔액 없이 허용',()=>{const x=transition(null);x.before.projects[0].cbs[1].budgetState='template';x.after.projects[0].cbs[1].budgetState='template';x.after.projects[0].cbs[2].current=123;x.after.projects[0].cbs[3].current=null;assert.doesNotThrow(()=>merge(x));});
test('중앙 merge: 최초100→105+5 불일치는 화면 우회 요청도 거절',()=>{const x=transition();x.after.projects[0].cbs[3].current=5;assert.throws(()=>merge(x),e=>e.code==='INVALID_COST_BREAKDOWN');});
test('중앙 merge: 최초 원금액 표식을99로 위조하면 거절',()=>{const x=transition();x.after.projects[0].cbs[1].costBreakdown.activatedFromAmount=99;assert.throws(()=>merge(x),e=>e.code==='INVALID_COST_BREAKDOWN');});
test('중앙 merge: 최초100의 일부 상세 미입력도 거절',()=>{const x=transition();x.after.projects[0].cbs[3].current=null;assert.throws(()=>merge(x),e=>e.code==='INVALID_COST_BREAKDOWN');});
test('중앙 merge: 전환 후 정상 증액110-5는 과거100과 달라도 허용',()=>{const x=transition();x.before=copy(x.after);x.after.projects[0].cbs[2].current=110;assert.doesNotThrow(()=>merge(x));});
test('중앙 merge: 새 세부 금액은 표준 코드가 없으면 거절',()=>{const x=transition();delete x.after.projects[0].costCoding.currentByRecordId.a;assert.throws(()=>merge(x),e=>e.status===400);});
test('중앙 merge: 새 하위 코드를 가짜 신규유형으로 바꾸면 거절',()=>{const x=transition();x.after.projects[0].costCoding.currentByRecordId.a.costTypeId='made_up_type';assert.throws(()=>merge(x),e=>e.status===400);});
test('중앙 merge: 확인된0과 미입력을 구분해 최초0 전환도 정확 합계 검사',()=>{const x=transition(0);x.after.projects[0].cbs[2].current=5;x.after.projects[0].cbs[3].current=-5;assert.doesNotThrow(()=>merge(x));x.after.projects[0].cbs[3].current=null;assert.throws(()=>merge(x),e=>e.code==='INVALID_COST_BREAKDOWN');});
for(const [key,value]of [['activatedFromAmount',99],['reason','바꾼 최초 사유'],['activatedAt','2026-10-20T00:00:00Z'],['sourcePath','바꾼 최초 근거']])test(`중앙 merge: 전환 후 최초 ${key} 기록 변경은 거절`,()=>{const x=transition();x.before=copy(x.after);x.after.projects[0].cbs[1].costBreakdown[key]=value;assert.throws(()=>merge(x),e=>e.code==='INVALID_COST_BREAKDOWN');});
test('중앙 merge: 전환 후 상위 원금액 덮어쓰기는 거절',()=>{const x=transition();x.before=copy(x.after);x.after.projects[0].cbs[1].current=999;assert.throws(()=>merge(x),e=>e.code==='INVALID_COST_BREAKDOWN');});
test('중앙 merge: 정확히 확정된 기존 표준 유형을 상속한 직접내역은 허용',()=>{const x=transition(),entry=masterV3.entries.find(e=>e.id==='ct_land_purchase');assert(entry);for(const state of [x.before,x.after]){const p=state.projects[0];p.costCoding.masterVersion=masterV3.version;for(const [id,binding]of Object.entries(p.costCoding.currentByRecordId))Object.assign(binding,{masterVersion:masterV3.version,costTypeId:entry.id,costTypeCode:entry.code,method:id==='parent'?'selected':'breakdown-inherit'});}assert.doesNotThrow(()=>merge(x));});
test('중앙 merge: 다른 기존 부모 코드를 상속했다고 주장한 내역은 거절',()=>{const x=transition(),entry=masterV3.entries.find(e=>e.id==='ct_land_purchase');const p=x.after.projects[0];p.costCoding.currentByRecordId.a={...link('a'),masterVersion:masterV3.version,costTypeId:entry.id,costTypeCode:entry.code,method:'breakdown-inherit'};assert.throws(()=>merge(x),e=>e.status===400);});
function managedSource(detailAmount){const x=transition(null);for(const state of [x.before,x.after]){const p=state.projects[0];Object.assign(p.cbs[1],{companyManagedTotal:true,companyManagedSourceIds:['old-source']});p.cbs.push({id:'old-source',parentId:'parent',current:null,currentAmountMode:'reported-total',reportedCurrentTotal:100},{id:'old-detail',parentId:'old-source',current:detailAmount});p.costCoding.currentByRecordId['old-source']=link('old-source');p.costCoding.currentByRecordId['old-detail']=link('old-detail');}return x;}
test('중앙 merge: 기존 확인총액100과 상세110이 어긋나면 상위null을100으로 승격하지 않음',()=>assert.doesNotThrow(()=>merge(managedSource(110))));
test('중앙 merge: 기존 상세 미입력은 확인총액이 있어도 상위null을 유지',()=>assert.doesNotThrow(()=>merge(managedSource(null))));
test('중앙 merge: 확인된 같은범위 상세100이면 상위null 원문과 별개 실제100 기준으로 전환',()=>{const x=managedSource(100);x.after.projects[0].cbs[1].costBreakdown.activatedFromAmount=100;assert.doesNotThrow(()=>merge(x));x.after.projects[0].cbs[1].costBreakdown.activatedFromAmount=null;assert.throws(()=>merge(x),e=>e.code==='INVALID_COST_BREAKDOWN');});
console.log(JSON.stringify({suite:'followup121-cost-breakdown-server',passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length,checks}));if(checks.some(x=>!x.passed))process.exitCode=1;
