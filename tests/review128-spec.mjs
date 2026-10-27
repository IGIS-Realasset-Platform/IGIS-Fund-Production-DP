import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
import {permitDomainBundle} from '../scripts/permit-domain-bundle.mjs';
const json=p=>JSON.parse(fs.readFileSync(p,'utf8')),host=x=>JSON.parse(JSON.stringify(x));
const ids=['NAV128-01','LAW128-02','NTF128-03','RPT128-04'];
function fixture(inject=true){
 const h=makeHarness({modules:[],seed:{projects:[]},costTaxonomyV4:true}),deployment=json('src/data/deployment-status-cloud-v0111.json');
 Object.assign(h.context,{APP_RUNTIME:{mode:'real',persistence:'cloud',version:deployment.version,storageKey:'synthetic-review128-spec',cloudOrigin:'https://spec.invalid'},DEPLOYMENT_STATUS_V0111:deployment,LAW_SOURCE_V0110:json('src/data/law-source-v0110.json'),CENTER120_FIX_LEDGER:json('docs/center-20261020-fix-ledger.json'),LEGACY_ICONS:{},URL,URLSearchParams,fetch:async()=>{throw Error('No network in spec test')}});
 for(const [key,p]of [['FOLLOWUP121_FIX_LEDGER','followup-20261021-fix-ledger'],['UX122_FIX_LEDGER','ux-20261022-fix-ledger'],['AUTO123_FIX_LEDGER','recheck-20261022-ledger'],['CONTINUATION124_FIX_LEDGER','continuation-20261023-ledger'],['PURPOSE125_FIX_LEDGER','purpose-20261023-ledger'],['REVIEW126_FIX_LEDGER','review-20261026-ledger'],['SEARCH127_FIX_LEDGER','review-20261026-search127-ledger']])h.context[key]=json('docs/'+p+'.json');
 if(inject)h.context.REVIEW128_FIX_LEDGER=json('docs/review-20261027-ledger.json');
 for(let n=106;n<=133;n++)h.context['V'+String(n).padStart(4,'0')+'_FIX_LEDGER']=json('docs/v'+String(n).padStart(4,'0')+'-fix-ledger.json');
 const modules=JSON.parse(fs.readFileSync('scripts/build-deployment.mjs','utf8').match(/const modules=(\[[^\n;]+\])/)[1].replaceAll("'",'"'));
 for(const name of modules){h.load(name);if(name==='core')vm.runInContext(permitDomainBundle(),h.context);}
 const A=vm.runInContext('App',h.context);A.installCloudPersistence({workspaceId:'synthetic',revision:0,scope:'spec-only',capabilities:{viewPlatformSpec:true,createProject:false,manageAccess:false},projectRoles:{},commit:async()=>{throw Error('No writes in spec')}});return {...h,A};
}
const checks=[],test=(name,fn)=>{try{fn();checks.push({name,status:'pass'})}catch(e){checks.push({name,status:'fail',message:e.message})}},h=fixture(),s=h.A.spec,before=JSON.stringify(h.A.state);
test('current four user requests are exact, unaccepted build snapshot',()=>{assert.deepEqual(host(s.requirementLedger.requestIds),ids);assert.equal(s.requirementLedger.count,4);assert.equal(s.review128.summary.completed,0);assert(s.requirements.every(x=>!x.verified));});
test('previous127 two requests preserved as history rather than current scope',()=>{assert.equal(s.legacyReferences.beforeReview128.requirementLedger.count,2);assert.equal(s.search127.items.length,2);for(const id of ids)assert.equal(s.currentFunctionalRequirements.filter(x=>x.id===id).length,1);});
test('owner overview and functions disclose latest4 without invented pass',()=>{h.A.go('spec','overview');assert(h.nodes.get('content').innerHTML.includes('이번 추가4요구'));h.A.go('spec','functions');for(const id of ids)assert(h.nodes.get('content').innerHTML.includes(id));});
test('legal search contract is API list, explicit watch write and existing daily input',()=>{const x=s.currentFeatureContracts.officialLegalSearch;assert.equal(x.mode,'api-results');assert.equal(x.searchEndpoint,'/api/law-search');assert.equal(x.addEndpoint,'/api/law-watch');assert.equal(x.searchWrites,false);assert.equal(x.explicitAddRequired,true);assert.equal(x.dailyInput,'development_project_platform.law_watchlist');assert.equal(x.allNationwideLawsAlreadyWatched,false);});
test('sidebar location and initial inbox read contracts are explicit',()=>{assert.equal(s.currentFeatureContracts.navigation.sidebarControl.expandedLocation,'sidebar-header');assert.equal(s.currentFeatureContracts.navigation.sidebarControl.collapsedLocation,'topbar');assert.equal(s.currentFeatureContracts.notifications.initialLoad,'authenticated-nonblocking');assert.equal(s.currentFeatureContracts.notifications.personalStateOnly,true);});
test('report layout preserves document versus platform and print boundary',()=>{assert.equal(s.currentFeatureContracts.reportWorkspace.legalTemplateChanged,false);assert.equal(s.currentFeatureContracts.reportWorkspace.savedReportsPreserved,true);assert.equal(s.currentFeatureContracts.reportWorkspace.platformApplySeparate,true);assert.equal(JSON.stringify(h.A.state),before);});
test('absence of128 preserves127 contract and original2 scope',()=>{const old=fixture(false).A.spec;assert.equal(old.review128,undefined);assert.equal(old.requirementLedger.count,2);assert.equal(old.currentFeatureContracts.officialLegalSearch.databaseWrites,0);});
console.log(JSON.stringify({suite:'review128-spec',passed:checks.filter(x=>x.status==='pass').length,failed:checks.filter(x=>x.status==='fail').length,checks,actualBrowser:false,actualDatabase:false}));if(checks.some(x=>x.status==='fail'))process.exitCode=1;
