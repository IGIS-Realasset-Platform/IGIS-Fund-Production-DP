// REVIEW132 independent regression orchestration. No product or external data writes.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);
const self='review132-qa-regression.mjs';
const excludedArtifacts=[{file:'center120-report-pdf-acceptance.mjs',reason:'Actual PDF/result/signature arguments required; separate artifact gate.'}];
const helperOnly=new Set(['review131-permit-intake-harness.mjs','review132-qa-report-control.mjs',self]);
const current=fs.readdirSync('tests').filter(name=>/^(?:center|followup12[123]-|continuation12[45]-|review126-|search127-|review128-|review129-|review13[012]-)/.test(name)&&name.endsWith('.mjs')&&!name.includes('browser')&&!helperOnly.has(name)&&!excludedArtifacts.some(s=>s.file===name));
const previous=['cloud-auth','cloud-auth-runtime','auth112-server','auth112-runtime','auth112-password-length','auth112-resend-race','auth112-legal-hydration','auth114-session','auth114-independent','cloud-storage','cloud-storage-runtime','cloud-storage-schema','cloud-session','cloud-session-independent','cloud-session-auth112','cloud-session-auth114','cloud-report-notion','cloud-notion-source','cloud-html-fixtures','cloud-font-assets','perf115-workspace-runtime','perf115-frontend','perf115-independent','v0132-company-flow'];
const focus=new Set(['review130-cost-merge-scope','review130-cost-merge-server','review130-cost-detail-source-copy','review130-cost-binding-inheritance','review130-cost-copy-history','followup121-cost-breakdown-server','followup121-cost-linked-contract-vat','followup121-report-cost-breakdown','center120-vat-owned-reconciliation','continuation125-cost-excel-tree','continuation125-cost-history','review130-report-access','review130-report-archive-routing','review130-report-archive-runtime','review130-report-archive-server','review130-report-archives','review130-report-rate-link','review129-report-retained-values','cloud-storage','cloud-storage-runtime','cloud-session-independent','cloud-session-auth114','review131-permit-conditions-server']);
let files=[...new Set([...current,...previous.map(name=>name+'.mjs')])].sort();
const focused=process.argv.includes('--focus');
if(focused)files=files.filter(file=>file.startsWith('review132-')||focus.has(file.slice(0,-4)));
if(process.argv.includes('--list')){console.log(JSON.stringify({mode:focused?'focused':'full-current-logical',files:files.map(file=>'tests/'+file),count:files.length,excludedArtifacts},null,2));process.exit(0);}
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function pins(){const result={};function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else result[file.replaceAll('\\','/')]=sha(file);}}for(const dir of ['src','server','api','shared','database','tests'])walk(dir);for(const file of ['package.json','package-lock.json','scripts/build-deployment.mjs','scripts/verify-center120.mjs','vercel.json'])result[file]=sha(file);return result;}
const startedAt=new Date().toISOString(),before=pins(),results=[];
for(const file of files){
 const args=['tests/'+file];
 if(file==='review130-cost-merge-server.mjs')args.push('--generated-fixtures');
 const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024,timeout:180000});
 const output=String(r.stdout||'')+String(r.stderr||'')+(r.error?'\n'+r.error.message:'');
 const preparation=/ERR_MODULE_NOT_FOUND|Cannot find module|ENOENT|SyntaxError:|Synthetic fixture generation failed/.test(output);
 const status=r.status===0?'passed':preparation?'preparation-blocked':'failed';
 results.push({file:'tests/'+file,args:args.slice(1),status,exitCode:r.status,output});
 console.log((status==='passed'?'PASS ':status==='failed'?'FAIL ':'BLOCKED ')+file);
 if(status!=='passed')console.log(output.slice(-3000));
}
const after=pins(),sourceChangedDuringRun=Object.keys({...before,...after}).filter(file=>before[file]!==after[file]);
const counts={passed:results.filter(x=>x.status==='passed').length,failed:results.filter(x=>x.status==='failed').length,preparationBlocked:results.filter(x=>x.status==='preparation-blocked').length};
const report={suite:'review132-qa-regression',mode:focused?'focused':'full-current-logical',startedAt,finishedAt:new Date().toISOString(),nodeVersion:process.version,root,counts,sourcePins:after,sourceChangedDuringRun,validSingleFinalSource:sourceChangedDuringRun.length===0,excludedArtifacts,checks:results,browserExecuted:false,actualDatabaseCalls:0,actualExternalCalls:0,fullPlatformAccepted:false};
const out='docs/review132-qa-'+(focused?'focused':'full')+'-'+startedAt.replaceAll(':','-')+'.json';
fs.writeFileSync(out,JSON.stringify(report,null,2));
console.log(JSON.stringify({out,...counts,sourceChangedDuringRun}));
if(counts.failed||counts.preparationBlocked||sourceChangedDuringRun.length)process.exitCode=1;
