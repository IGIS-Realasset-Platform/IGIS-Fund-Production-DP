import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';

const modules=['core','cbs','contracts','legal','permit-views','report-form','report','demo','cbs-purpose','cbs-model-v0118','cost-company-profile','cost-order','cost-coding'];
const checks=[],check=async(name,run)=>{try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}};
const fixture=()=>{const h=makeHarness({modules,costTaxonomyV4:true}),A=h.A;for(const init of A.initializers)init(A.state);const p=A.state.projects.find(row=>row.id==='YD427');A.ui.projectId=p.id;return{...h,A,p}};
const click=(h,action,data={})=>h.listeners.click[0]({target:{closest:selector=>selector==='[data-action]'?{dataset:{action,...data}}:null},preventDefault(){}});
const dialog=h=>h.nodes.get('app-dialog').innerHTML||'';
const protectedState=(A,p)=>JSON.stringify({cbs:p.cbs,coding:p.costCoding,stages:p.costStages,contracts:p.contracts,vat:[p.vatRecords,p.vatApplications,p.vatReconciliations],audit:A.state.auditEvents});
function formValues(row){return{costTypeId:'',name:row.name,applicability:row.applicability||'미확인',includedInId:row.includedInId||'',assetAttribution:row.assetAttribution||'미확인',procurementScope:row.procurementScope||'미확인'}}
function attachRenderedForm(h,values,html){
 const form=h.nodes.get('app-form'),names=[...html.matchAll(/<(?:input|select|textarea)\b[^>]*name="([^"]+)"/g)].map(match=>match[1]),controls=new Map(),dialogNode=h.nodes.get('app-dialog'),originalGet=h.document.getElementById.bind(h.document);let dialogHtml=dialogNode.innerHTML,formPresent=true;
 Object.defineProperty(dialogNode,'innerHTML',{configurable:true,get(){return dialogHtml},set(value){dialogHtml=String(value);formPresent=dialogHtml.includes('id="app-form"')}});h.document.getElementById=id=>id==='app-form'?(formPresent?form:null):originalGet(id);
 const make=(name,value)=>({name,value:value??'',type:'text',checked:true,dataset:{},closest(selector){return selector==='#app-form'?form:null},setAttribute(){},removeAttribute(){},focus(){}});for(const name of names)controls.set(name,make(name,values[name]??''));form.querySelectorAll=selector=>selector==='input,select,textarea'?[...controls.values()]:[];form.querySelector=()=>null;const dispatch=(kind,target)=>{for(const listener of h.listeners[kind]||[])listener({target})};
 return{names,control:name=>controls.get(name),set(name,value){const target=controls.get(name);assert(target,name);target.value=value;dispatch('input',target)}};
}
function openRename(h,row,{parent=false}={}){if(parent)click(h,'cbs-config',{id:row.id});click(h,'cbs-rename',{id:row.id});const html=dialog(h),snapshot=h.A.formEditor.snapshot(),dom=attachRenderedForm(h,{...formValues(row),...(snapshot?.values||{})},html);return{html,dom,baseline:snapshot.baseline}}
function rows(p){const nonRetypable=p.cbs.find(row=>row.id==='YD427:management:design_main'&&!row.deletedAt),retypable=p.cbs.find(row=>!row.deletedAt&&row.parentId&&row.name==='토지매입비');assert(nonRetypable,'설계비 관리행');assert(retypable,'토지매입비');return{nonRetypable,retypable}}

await check('REV133-01 비용유형 수정 가능·불가능 폼은 렌더키와 baseline키가 같고 무수정 닫기가 깨끗하다',()=>{
 for(const kind of ['retypable','nonRetypable'])for(const trigger of ['X','Escape']){const h=fixture(),{A,p}=h,row=rows(p)[kind],before=protectedState(A,p),{html,dom,baseline}=openRename(h,row),rendered=dom.names.slice().sort(),baselineKeys=Object.keys(baseline).sort();if(kind==='retypable')assert(html.includes('name="costTypeId"'));else assert(!html.includes('name="costTypeId"'));assert.deepEqual(baselineKeys,rendered,kind+' baseline/rendered keys');assert.equal(A.formEditor.dirty(),false,kind+' initial clean');A.formEditor.requestClose();assert.equal(A.pendingDraftScope(),null,kind+' '+trigger+' 무수정 경고 없음');assert.equal(protectedState(A,p),before,kind+' '+trigger+' 원장 불변');}
});

await check('REV133-01 실제 변경은 dirty·보관·재개되고 원장은 저장 전 바뀌지 않는다',()=>{
 const h=fixture(),{A,p}=h,row=rows(p).nonRetypable,before=protectedState(A,p),opened=openRename(h,row);assert.equal(A.formEditor.dirty(),false);opened.dom.set('name','설계비 초안 변경');assert.equal(A.formEditor.dirty(),true);A.formEditor.requestClose();assert.equal(A.pendingDraftScope(),'form');assert.equal(A.formEditor.snapshot()?.values.name,'설계비 초안 변경');A.resolveDraft('close');assert.equal(protectedState(A,p),before);const reopened=openRename(h,row);assert.equal(A.formEditor.snapshot().values.name,'설계비 초안 변경');assert.equal(reopened.dom.control('name').value,'설계비 초안 변경');
});

await check('REV133-01 메타데이터 저장실패는 원장·감사 원복과 입력 초안을 유지한다',()=>{
 const h=fixture(),{A,p}=h,row=rows(p).nonRetypable,before=protectedState(A,p),opened=openRename(h,row);opened.dom.set('name','실패 초안 설계비');h.setWriteFailure(true);assert.equal(A.formEditor.submit(),false);h.setWriteFailure(false);assert.equal(protectedState(A,p),before);assert.equal(A.formEditor.snapshot().values.name,'실패 초안 설계비');
});

// 2026-10-22 latest approval retires the technical-information parent itself.
// Clean close and protected data remain required; recreating that parent does not.
await check('REV133-01 직접 이름수정은 깨끗하게 닫히고 폐기된 설명 부모를 부활시키지 않는다',()=>{
 const h=fixture(),{A,p}=h,row=rows(p).retypable,before=protectedState(A,p),originalForm=A.form;let formOptions=null;A.form=(...args)=>{formOptions=args[4]||{};return originalForm(...args)};openRename(h,row,{parent:true});A.form=originalForm;assert.equal(formOptions.returnTo,undefined,'폐기된 config 부모 연결 없음');assert.equal(A.formEditor.dirty(),false);assert.equal(A.formEditor.requestClose(),true);assert.equal(A.formEditor.snapshot(),null,'직접 수정 form session 종료');assert.equal(h.nodes.get('app-dialog').open,false,'본문으로 종료');assert(!dialog(h).includes('분류 기준·원자료'),'설명창 부활 없음');assert.equal(protectedState(A,p),before,'닫기 후 원금액·분류·계약·VAT·감사 보존');
});

const failed=checks.filter(item=>item.status==='failed'),result={suite:'v0133-form-baseline',passed:checks.length-failed.length,failed:failed.length,total:checks.length,checks,browser:false,userDataAccessed:false};console.log(JSON.stringify(result));if(failed.length)process.exitCode=1;
