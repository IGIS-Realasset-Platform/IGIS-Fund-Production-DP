import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeHarness} from './recovery-harness.mjs';

const modules=['core','cbs','vat','contracts','legal','permit-views','partners','setup','report-form','report','report-example','demo','audit-view','recovery-views','spec'];
const h=makeHarness({modules}),A=h.A,tests=[];
const test=(name,fn)=>tests.push([name,fn]);
A.partnerSeed=JSON.parse(fs.readFileSync('src/data/partner-source.json','utf8'));
A.marketSeed=JSON.parse(fs.readFileSync('src/data/market-source.json','utf8'));
for(const initialize of A.initializers)initialize(A.state);

test('REV114-04 상단 자료구분은 일반 문자열로 남고 badge 장식은 제거된다',()=>{
  A.render();const html=h.nodes.get('topbar').innerHTML,label=A.topbarContext().label;
  assert(html.includes(label));assert(!html.includes(`<span class="badge">${label}</span>`));assert(html.includes('topbar-context-label'));
});

test('REV114-04 업체 순위의 새 자료 수는 보존하되 badge 장식은 제거된다',()=>{
  const source=A.partnerSeed.groups.find(group=>group.rows.some(row=>row.online_update_mark?.added_count)),row=source.rows.find(row=>row.online_update_mark?.added_count),html=A.partners.rankingTable(source.key);
  assert(html.includes('새 자료 '+row.online_update_mark.added_count));assert(!html.includes('<span class="badge">새 자료'));
});

test('REV114-04 참여 원천과 가상 연락처 상태는 일반 문자열로 보존된다',()=>{
  const company=A.state.companyRegistry.find(item=>!item.deletedAt);assert(company);A.state.companyParticipations.push({id:'copy-participation',companyId:company.id,mode:'historical',projectName:'가상 과거사업',role:'시공',status:'완료',path:'공용/근거',deletedAt:null});A.state.companySalesLines.push({id:'copy-line',companyId:company.id,ourTeam:'개발팀',ourName:'가상 담당',theirTeam:'영업팀',theirName:'가상 상대',connection:'소개',status:'유효',sample:true,deletedAt:null});A.ui.partnerSelectedId=company.id;A.ui.tabs.company='directory';A.ui.partnerTab='participation';let html=A.partners.renderCompany();assert(html.includes('과거 참여 수기기록'));assert(!html.includes('<span class="badge">과거 참여 수기기록</span>'));A.ui.partnerTab='lines';html=A.partners.renderCompany();assert(html.includes('가상 연락처'));assert(!html.includes('<span class="badge">가상 연락처</span>'));
});

test('REV114-04 화면후 문자열 치환 우회를 제거하고 정적 설명을 숨은 패널로 옮기지 않는다',()=>{
  const source=fs.readFileSync('src/partners.js','utf8'),core=fs.readFileSync('src/core.js','utf8');assert(!source.includes('function cleanCopy('));for(const text of ['실제 사업비 증감, 면적 변경, 시장지수 변화는 각각 기록합니다.','원사이트 검색 결과입니다. 업체 관련성은 기사 원문에서 확인할 수 있습니다.','면적·공사범위·공동도급 지분이 확인된 자료만 비교에 사용할 수 있습니다.'])assert(!source.includes(text),text);assert(!core.includes('원본 저장키와 격리 원문은 보존되어 있습니다. 자동 합산하지 않았습니다.'));
  assert(core.includes("A.modal('격리된 중복·손상 자료'"));assert(core.includes("A.btn('전체 데이터 내려받기','export-data')"));
});

test('REV114-04 실제 오류·확인·빈상태·업무자료·공식근거는 보존된다',()=>{
  const core=fs.readFileSync('src/core.js','utf8'),partners=fs.readFileSync('src/partners.js','utf8'),vat=fs.readFileSync('src/vat.js','utf8'),setup=fs.readFileSync('src/setup.js','utf8'),audit=fs.readFileSync('src/audit-view.js','utf8');
  for(const text of ['저장하지 않은 변경','정말 삭제하시겠습니까?','현재 저장본을 덮어쓰지 않았습니다.'])assert(core.includes(text),text);
  // CENTER120-17: the source is no longer only the old public cache. Preserve
  // actual source-scoped empty/unknown states, not an obsolete literal string.
  for(const text of ['지수 · 기준연도 원문 미기재','관측값·출처'])assert(partners.includes(text),text);
  const sourceUrl='https://example.invalid/copy/source',renderAwards=fields=>{const f=makeHarness({modules:['core'],seed:{projects:[]}}),B=f.A;B.partnerSeed={groups:[{key:'cak-rows',source:'cak',meta:{title:'합성 원문',latest_year:2026},rows:[{company:'합성 업체',registration_no:'copy-exact',rank:1,...fields,recent_awards_source:{url:sourceUrl}}]}]};f.load('partners');B.partners.initialize(B.state);B.ui.partnerSelectedId=B.partners.rankingRows()[0].company.id;const before=JSON.stringify(B.state),html=B.partners.renderCompany();assert.equal(JSON.stringify(B.state),before,'읽기 전용 업무정보 출력');return html;};
  const empty=renderAwards({recent_awards:[],source_contracts:[]});assert(empty.includes('해당 자료에 수록된 수주·계약이 없습니다.'));assert(empty.includes(sourceUrl),'명시 빈 자료도 원문 링크 보존');
  const unknown=renderAwards({});assert(unknown.includes('수주·계약 자료를 확인하지 못했습니다.'));assert(!unknown.includes('수주 내역이 없습니다.'));assert(!unknown.includes('수주·계약이 없습니다.'));
  const raw=renderAwards({recent_awards:[{project:'명시 0원 원문',amount_krw:0,source_url:sourceUrl},{project:'금액 미제공 원문',amount_krw:null,source_url:sourceUrl}]});assert(raw.includes('명시 0원 원문')&&raw.includes('0억원'));assert(raw.includes('금액 미제공 원문')&&raw.includes('자료 없음'));assert(raw.includes(sourceUrl));
  for(const text of ['자료명을 입력해 주세요.','자료 기준일을 정확히 입력해 주세요.','후보 선택 필요'])assert(setup.includes(text),text);
  for(const text of ['검토 상태','법 제26조','원천 금액','미확정 세액'])assert(vat.includes(text),text);
  for(const text of ['변경 전','변경 후','사유','근거'])assert(audit.includes(text),text);
});

let passed=0,failed=0;for(const[name,fn]of tests){try{fn();passed++;console.log('PASS '+name)}catch(error){failed++;console.log('FAIL '+name+' :: '+error.message)}}console.log(JSON.stringify({passed,failed,total:tests.length,verification:'v0.10.14-copy-audit-owned-scope',browser:false}));if(failed)process.exitCode=1;
