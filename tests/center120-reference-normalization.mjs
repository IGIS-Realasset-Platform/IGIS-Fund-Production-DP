import assert from 'node:assert/strict';
import {normalizePortalReference} from '../scripts/normalize-portal-reference.mjs';

const ids=['cak','cm','etis-all','etis-con','kacem'];
const fixture=()=>({checkedAt:'2026-10-20T05:05:57.907Z',source:'https://raportal.vercel.app/03.%20Construction%20Board/index.html',groups:ids.map((id,index)=>({id,title:id==='cm'?'KISCON/CM능력공시 2024년 용역형 CM 실적 상위 30':id==='kacem'?'KACEM 2026년 3/4분기 수주실적 상위 30':'2025 상위 30',caption:'단위: 백만원.',sourceLinks:[{label:'원문',url:'https://example.invalid/?GONGSI_YEAR=2025'}],rows:Array.from({length:30},(_,i)=>({name:'동명업체 '+i,sourceRowId:id+'-detail-'+(i+1),cells:[{field:'rank',value:String(i+1)},{field:'previous_rank',value:i===0?'-':'0'},{field:'amount_million_krw',value:i===0?'—':'0'},{field:'registration_no',value:'R-'+index+'-'+i}],details:[],feeds:[],officialComments:[],unitCostLinks:[],unitCostText:''}))})),market:{text:'\n2026.08\n138.74\nYoY +5.98%\n',links:[]}});
const input=fixture(),output=normalizePortalReference(input);
assert.equal(output.groups.length,5);assert.equal(Object.keys(output.companies).length,150);
assert.equal(output.groups[1].meta.latest_year,'2024');assert.equal(output.groups[1].meta.announcement_year,'2025');assert.equal(output.groups[4].meta.latest_label,'2026년 3분기');
assert.equal(output.groups[0].rows[0].amount_million_krw,null);assert.equal(output.groups[0].rows[1].amount_million_krw,0);assert.equal(output.groups[0].rows[0].previous_rank,null);assert.equal(output.groups[0].rows[1].previous_rank,0);
assert.notEqual(output.groups[0].rows[0].companyKey,output.groups[1].rows[0].companyKey,'동명이름을 출처별 업체로 임의 병합하면 안 됩니다.');
assert.equal(output.market.series[0].points[0].period,'2026-08');assert.equal(output.market.series[0].points[0].value,138.74);
const broken=fixture();broken.groups[0].rows[0].feeds=[{items:[{links:'[MaxDepth]'}]}];assert.throws(()=>normalizePortalReference(broken),/깊이 제한/);
const duplicate=fixture();duplicate.groups[0].rows[1].cells[0].value='1';assert.throws(()=>normalizePortalReference(duplicate),/순위/);
const short=fixture();short.groups[4].rows.pop();assert.throws(()=>normalizePortalReference(short),/30개/);
const unknown=fixture();unknown.groups[0].rows[0].details=[{label:'등록번호',value:'R-0-0'}];unknown.groups[0].rows[0].unitCostText='확인 근거\n최근 5년 · 1건\n2026.09.15 · DART 원문 · 연면적\n확인 사업\n발주자\nHighOpenDART\n총액1,880억원\n연면적100,537.7㎡\n평단가618.3만원/평';unknown.groups[0].rows[0].unitCostLinks=[{label:'원문',url:'https://example.invalid/contract'}];
const unit=Object.values(normalizePortalReference(unknown).companies)[0].row.unit_cost_records[0];assert.equal(unit.amount_krw,188000000000);assert.equal(unit.floor_area_m2,100537.7);assert.equal(unit.unit_cost_krw_per_py,6183000);assert.equal(unit.source_url,'https://example.invalid/contract');
console.log('PASS CENTER120-03 normalization: 5 groups/150 identities, unknown vs zero, source dates, no name merge, incomplete extraction refusal, source unit-cost records');
