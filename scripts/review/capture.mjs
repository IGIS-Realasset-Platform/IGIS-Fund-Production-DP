// Explicitly capture the approved local review. Never called by CI or by build.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const arg=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const directory=resolve(arg('--local')||join(root,'.build/local-preview'));
const output=resolve(arg('--out')||join(root,'deployment/review-data'));
const origin=new URL(arg('--origin')||'http://127.0.0.1:4178');
if(origin.hostname!=='127.0.0.1'||origin.protocol!=='http:')throw Error('로컬 작업실 주소만 캡처할 수 있습니다.');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const feedSources={};
for(const name of (await readdir(join(root,'scripts/local-preview/feed'),{recursive:true})).sort()){
 let bytes;try{bytes=await readFile(join(root,'scripts/local-preview/feed',name));}catch(error){if(error.code==='EISDIR')continue;throw error;}
 feedSources['scripts/local-preview/feed/'+name]=hash(bytes);
}
const sourceFingerprint=hash(JSON.stringify(feedSources));
const bundleHash=hash(await readFile(join(directory,'work-feed/app.js')));
let previous;try{previous=JSON.parse(await readFile(join(output,'manifest.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
if(previous?.feed.sourceFingerprint&&previous.feed.sourceFingerprint!==sourceFingerprint&&previous.files['feed/app.js'].sha256===bundleHash)throw Error('Feed 소스가 변경됐지만 번들은 그대로입니다. 로컬 Feed를 재빌드한 뒤 캡처해 주세요.');
const baseline=await readFile(join(directory,'original-workspace.json'));
const digest=hash(baseline),recordFile=join(directory,'edits-'+digest+'.json');
const recordBytes=await readFile(recordFile),record=JSON.parse(recordBytes);
const get=async path=>{const response=await fetch(new URL(path,origin),{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(path+': '+response.status);return response.json();};
const [live,session,stakeholders]=await Promise.all([get('/api/workspace'),get('/api/session'),get('/api/work-feed/stakeholders')]);
if(live.revision!==record.revision||JSON.stringify(live.state)!==JSON.stringify(record.state))throw Error('서버와 현재 저장파일이 다릅니다. 실행 중인 작업실을 확인해 주세요.');
if(stakeholders.stale)throw Error('공용 주소록의 최신 조회를 확인하지 못했습니다.');
const db=new DatabaseSync(join(directory,'finance-stages-'+digest+'.sqlite'),{readOnly:true});
const financing={};try{for(const row of db.prepare('SELECT * FROM finance_stages ORDER BY stage_date,rowid').all())(financing[row.project_id]??=[]).push({id:row.id,revision:row.revision,sample:Boolean(row.sample),...JSON.parse(row.data)});}finally{db.close();}
await mkdir(output,{recursive:true});await mkdir(join(output,'feed'),{recursive:true});
const files={};
async function save(name,bytes){await writeFile(join(output,name),bytes);files[name]={sha256:hash(bytes),bytes:Buffer.byteLength(bytes)};}
for(const[name,value]of Object.entries({'workspace.json':record.state,'finance-stages.json':financing,'stakeholders.json':stakeholders,'session.json':session,'workspace-context.json':{revision:record.revision,user:live.user,capabilities:live.capabilities,projectRoles:live.projectRoles}}))await save(name,JSON.stringify(value));
for(const [from,to]of [['partners-reference.json','partners-reference.json'],['market-reference.json','market-reference.json'],['access-screen-capture.json','access-screen-capture.json'],['account-photo.png','account-photo.png'],['work-feed-seed.mjs','feed/seed.mjs'],['work-feed/app.js','feed/app.js'],['work-feed/app.css','feed/app.css']])await save(to,await readFile(join(directory,from)));
if(!(await readFile(recordFile)).equals(recordBytes))throw Error('캡처 중 작업실 자료가 변경됐습니다. 다시 캡처해 주세요.');
const seedHash=hash(JSON.stringify(files));
await writeFile(join(output,'manifest.json'),JSON.stringify({schemaVersion:1,revision:record.revision,baselineSha256:digest,workspaceSha256:files['workspace.json'].sha256,seedHash,files,feed:{mode:'verified-local-bundle',sourceFingerprint,sourceFiles:feedSources,seed:'feed/seed.mjs',note:'현재 작업실 번들·seed를 그대로 고정. 원본 Feed 빌드로 재생성 후 다시 캡처. 로컬 Feed 소스 지문 변경 시 빌드 거절. 브라우저 IndexedDB의 개인 편집은 이 파일 스냅샷에 포함되지 않음.'}},null,2)+'\n');
console.log(JSON.stringify({revision:record.revision,seedHash,projects:record.state.projects.length,stakeholders:stakeholders.stakeholders.length,files:Object.keys(files).length}));
