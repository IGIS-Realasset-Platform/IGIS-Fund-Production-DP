import assert from 'node:assert/strict';
import * as domain from '../shared/permit-domain.mjs';
const prior={id:'P-A',name:'기존 인허가',group:'건축·심의',agency:'',stage:'미신청',plannedApplication:'2026-10-01',expected:'2026-11-01',sourcePath:'',actionItems:[]};
const next={...prior,stage:'신청',application:'2026-10-20',rounds:[{id:'round-new',kind:'application',date:'2026-10-20',sourcePath:'공유폴더/신청',note:''}]};
const state=row=>({projects:[{id:'P1',permits:[row]}]}),checks=[];
try{const result=domain.validatePermitChanges(state(prior),state(next));assert.equal(result.valid,true,JSON.stringify(result.errors));checks.push({id:'ROUND-LEGACY-PARENT',classification:'existing-product-flow',passed:true});}catch(e){checks.push({id:'ROUND-LEGACY-PARENT',classification:'existing-product-flow',passed:false,error:e.message});}
checks.push({id:'ROUND-SHARED-ENTRY',classification:'new-helper-availability-not-product-red',passed:typeof domain.validatePermitRoundChange==='function'});
console.log(JSON.stringify({suite:'center120-round-append-baseline',checks}));if(checks.some(c=>!c.passed))process.exitCode=1;
