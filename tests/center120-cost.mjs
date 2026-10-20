import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';

const modules=['core','cbs','contracts','legal','permit-views','setup','report-form','report','demo','cbs-purpose','cbs-model-v0118','cost-company-profile','cost-order','cost-coding'];
const boot=()=>{const h=makeHarness({modules:['core','cbs','demo','cbs-purpose'],costTaxonomyV4:true});for(const name of ['cbs-model-v0118','cost-company-profile','cost-order','xlsx-export','setup'])h.load(name);for(const init of h.A.initializers)init(h.A.state);h.A.ui.projectId='YD427';return h;};
const checks=[];
const check=(name,run)=>{try{run();checks.push({name,pass:true});console.log('PASS '+name)}catch(error){checks.push({name,pass:false,error:error.message});console.error('FAIL '+name+': '+error.message)}};

check('CENTER120-05 묶음 이력은 첫 원장이 아닌 전체 구성원과 동일 사건을 한 번 조회한다',()=>{
 const {A}=boot(),p=A.current(),group=A.companyCostProfile.managementNodes(p).find(row=>row.companyDisplayOnly&&row.managementIds?.length>1);assert(group,'다중 구성원 묶음 fixture');
 const at='2026-10-20T00:10:00.000Z',entries=group.managementIds.map((id,i)=>({id:'event-'+i,projectId:p.id,idRef:id,entity:'cbs',action:'UPDATE',at,after:{current:100+i}}));A.state.auditEvents.push(...entries,entries[1]);
 const events=A.domain.costHistory(p,group.id);assert(entries.every(item=>events.some(event=>event.id===item.id)));assert.equal(events.filter(event=>event.id==='event-1').length,1);
 const html=A.renderCostDetail(p);assert(html.includes('data-id="'+group.id+'"'),'묶음 버튼이 묶음 ID를 전달');
 assert.equal(A.domain.costHistoryTimestamp(at),'2026-10-20 09:10');
});

check('CENTER120-05 분할 표시묶음은 같은 원장의 다른 분류 원자료 이력을 끌어오지 않는다',()=>{
 const {A}=boot(),p=A.current(),nodes=A.companyCostProfile.managementNodes(p),group=nodes.find(node=>node.companyPartitionedActual&&node.sourceIds?.length&&nodes.some(other=>other.companyManagementRow&&other.id!==node.id&&other.managementIds?.some(ownerId=>node.managementIds.includes(ownerId))&&other.sourceIds?.some(id=>!node.sourceIds.includes(id))));assert(group,'다른 원자료를 공유하는 분할표시 fixture');const included=group.sourceIds[0],other=nodes.find(node=>node.companyManagementRow&&node.id!==group.id&&node.managementIds?.some(ownerId=>group.managementIds.includes(ownerId))&&node.sourceIds?.some(id=>!group.sourceIds.includes(id))),outsideId=other.sourceIds.find(id=>!group.sourceIds.includes(id));assert(outsideId);A.state.auditEvents.push({id:'inside-partition',projectId:p.id,idRef:included,entity:'cbs',action:'UPDATE',at:'2026-10-20T00:00:00Z'},{id:'outside-partition',projectId:p.id,idRef:outsideId,entity:'cbs',action:'UPDATE',at:'2026-10-20T00:00:00Z'});const events=A.domain.costHistory(p,group.id);assert(events.some(event=>event.id==='inside-partition'));assert(!events.some(event=>event.id==='outside-partition'));
});

check('CENTER120-06 등록 뒤 동일 프리셋 명시 재적용은 저장·감사·모드 수정이 없다',()=>{
 const h=boot(),{A}=h,p=A.current(),preset=A.costUsePresets.definitions().find(item=>A.costUsePresets.preview(p,item.id).ensureTargetIds.length);assert(preset);const selectedTargetIds=[A.costUsePresets.preview(p,preset.id).ensureTargetIds[0]];A.costUsePresets.apply(p,preset.id,{mode:'explicit',selectedTargetIds});p.costUsePreset.mode='registration';const before=JSON.stringify(A.state);let writes=0;const old=h.context.localStorage.setItem;h.context.localStorage.setItem=(...args)=>{writes++;return old(...args)};
 const result=A.costUsePresets.apply(p,preset.id,{mode:'explicit',selectedTargetIds});assert.equal(result.changed,false);assert.equal(writes,0);assert.equal(JSON.stringify(A.state),before);
});

check('CENTER120-06 용도 미리보기는 조건부 후보를 직접 선택하며 미선택은 금액·항목을 생성하지 않는다',()=>{
 const {A}=boot(),p=A.current(),before=JSON.stringify(A.state);const preview=A.costUsePresets.preview(p,'hotel',{conditions:{independentProcurement:false,payer:'unknown'}});assert(Array.isArray(preview.candidates));assert(preview.candidates.every(item=>item.selected===false));
 const result=A.costUsePresets.apply(p,'hotel',{selectedTargetIds:[]});assert.equal(result.changed,false);assert.equal(JSON.stringify(A.state),before);
});

check('CENTER120-06 임대·분양·운영 후보를 구분하고 기존 닫힌 마스터만 사용한다',()=>{
 const {A}=boot(),p=A.current(),before=JSON.stringify(A.state),lease=A.costUsePresets.preview(p,'office',{businessMode:'lease'}),sale=A.costUsePresets.preview(p,'office',{businessMode:'sale'});assert(lease.targetIds.includes('corp_lease'));assert(!lease.targetIds.includes('corp_sales_agency'));assert(sale.targetIds.includes('corp_sales_agency'));assert(!sale.targetIds.includes('corp_lease'));for(const definition of A.costUsePresets.definitions())for(const id of A.costUsePresets.preview(p,definition.id).targetIds)assert.equal(A.costTypeMaster.entry(id)?.newSelectable,true);assert.equal(JSON.stringify(A.state),before);
});

check('CENTER120-06 실제 배포 realMode 신규등록은 공통37만 만들고 선택비용을 자동 추가하지 않는다',()=>{
 const h=boot(),{A}=h;A.realMode=true;const p=A.projectRegistration.register({id:'QA_CENTER_REAL',name:'검사',type:'호텔',location:'격리 위치',operator:'격리 법인',manager:'QA',gfaTotal:'1000',siteArea:'500',acquisitionLandArea:'500',evidenceSource:'격리 자료',evidenceLocation:'가상 시트',evidenceAsOf:'2026-10-20',evidencePath:'격리/경로'},'',{navigate:false});assert.equal(p.cbs.filter(row=>row.managementAccount).length,37);assert(!p.cbs.some(row=>A.costCoding.resolve(p,row.id)?.costTypeId==='opening_preparation'));assert(p.cbs.every(row=>row.current===null&&row.initial===null));assert.equal(A.total(p),null);
});

console.log(JSON.stringify({suite:'center120-cost',passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,checks}));if(checks.some(x=>!x.pass))process.exitCode=1;
