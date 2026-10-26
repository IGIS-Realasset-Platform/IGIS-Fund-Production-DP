import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
const h=makeHarness({modules:['core','legal','law-monitor'],costTaxonomyV4:true}),A=h.A;
const check=(name,fn)=>{fn();console.log('PASS '+name);};
check('supplementary law tools belong to the page-header right-hand area without duplicate search',()=>{assert.equal(typeof A.pageHeaderActions?.law,'function');A.ui.tabs.law='recent';const html=A.pageHeaderActions.law();for(const action of ['law-watch-open','law-server-refresh'])assert.match(html,new RegExp('data-action="'+action+'"'));assert.doesNotMatch(html,/law-search-open/);A.ui.tabs.law='search';assert.equal(A.pageHeaderActions.law(),'');});
check('law body keeps its list and tabs without duplicate source-status tool rows',()=>{A.ui.tabs.law='recent';const html=A.lawMonitor.render();assert.doesNotMatch(html,/자료 기준일|일일 법령 확인:|law-search-open|law-watch-open|law-server-refresh/);assert.match(html,/legal-law-filter/);assert.match(html,/하위 메뉴/);});
// UX124-04 replaces the old collection-progress badge with business tools only.
check('unfetched cloud header does not expose collection operation status',()=>{A.cloudMode=true;A.ui.tabs.law='recent';const html=A.pageHeaderActions.law();assert.doesNotMatch(html,/불러오는 중|마지막 성공|자동 확인 전|law-header-status|law-search-open/);assert.match(html,/law-watch-open/);});
console.log(JSON.stringify({passed:3,serverWrites:0}));
