import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
const h=makeHarness({modules:['core','legal','law-monitor'],costTaxonomyV4:true}),A=h.A;
const check=(name,fn)=>{fn();console.log('PASS '+name);};
check('supplementary law tools belong to the page-header right-hand area',()=>{assert.equal(typeof A.pageHeaderActions?.law,'function');const html=A.pageHeaderActions.law();for(const action of ['law-search-open','law-watch-open','law-server-refresh'])assert.match(html,new RegExp('data-action="'+action+'"'));});
check('law body keeps its list and tabs without duplicate source-status tool rows',()=>{const html=A.lawMonitor.render();assert.doesNotMatch(html,/자료 기준일|일일 법령 확인:|law-search-open|law-watch-open|law-server-refresh/);assert.match(html,/legal-law-filter/);assert.match(html,/하위 메뉴/);});
// UX124-04 replaces the old collection-progress badge with business tools only.
check('unfetched cloud header does not expose collection operation status',()=>{A.cloudMode=true;const html=A.pageHeaderActions.law();assert.doesNotMatch(html,/불러오는 중|마지막 성공|자동 확인 전|law-header-status/);assert.match(html,/law-search-open/);});
console.log(JSON.stringify({passed:3,serverWrites:0}));
