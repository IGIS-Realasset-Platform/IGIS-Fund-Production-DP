import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join,dirname,relative} from 'node:path';
const directory=resolve(process.argv[2]||'dist/review');
const read=name=>readFile(join(directory,name));
const version=JSON.parse(await read('review-version.json'));
assert.match(version.sourceCommit,/^[a-f0-9]{40}$/);
assert.match(version.seedHash,/^[a-f0-9]{64}$/);
assert(Number.isSafeInteger(version.workspaceRevision));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const actual=[];
for(const name of await readdir(directory,{recursive:true})){
 let bytes;try{bytes=await read(name);}catch(e){if(e.code==='EISDIR')continue;throw e;}actual.push(name);
 if(name==='review-version.json')continue;
 assert(version.files[name],'미등록 배포 파일: '+name);
 assert.equal(hash(bytes),version.files[name].sha256,'배포파일 지문: '+name);assert.equal(bytes.length,version.files[name].bytes);
 if(/\.(js|html|json|css)$/.test(name))assert.doesNotMatch(bytes.toString(),/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|github_pat_[\w_]{30,}|gh[pousr]_[\w]{32,}/,'비밀키 포함: '+name);
 if(name.endsWith('.js'))for(const match of bytes.toString().matchAll(/(?:from\s*|import\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g)){
  const target=relative(directory,resolve(directory,dirname(name),match[2]));assert(!target.startsWith('..'),'모듈 경로 이탈');assert(version.files[target],name+' 의 모듈 누락: '+match[2]);
 }
}
assert.equal(actual.length,Object.keys(version.files).length+1);
for(const name of ['index.html','review-config.js','review-client.js','studio.js','finance-overview.js','finance-capital.js','finance-stage-fields.js','finance-milestones.js','finance-stage-editor-ui.js','finance-stage-editor-model.js','local-account-photo.png','work-feed/account-avatar.png','review-data/access-screen-capture.json','review-data/stakeholders.json'])assert(version.files[name],name);
const workspace=await read('review-data/workspace.json');assert.equal(hash(workspace),version.workspaceSha256);
const state=JSON.parse(workspace);assert.equal(state.projects.filter(p=>!p.deletedAt).length,3);
assert.deepEqual(state.projects.map(p=>p.id),['TEST-20261016-A','TEST-20261016-B','TEST-20261016-C']);
assert.equal(JSON.parse(await read('review-data/workspace-context.json')).revision,version.workspaceRevision);
assert.equal(hash(await read('local-account-photo.png')),hash(await read('work-feed/account-avatar.png')));
assert((await read('work-feed/app.js')).toString().includes('igis-review-feed-'+version.seedHash));
assert(!(await read('studio.js')).toString().includes("frame.src='/work-feed/'"));
assert(!(await read('studio.js')).toString().includes("photo.src='/local-account-photo.png'"));
assert((await read('index.html')).toString().includes('./review-config.js'));
assert(JSON.parse(await read('review-data/stakeholders.json')).stakeholders.length>0);
console.log(JSON.stringify({verified:true,revision:version.workspaceRevision,sourceCommit:version.sourceCommit,seedHash:version.seedHash,files:actual.length}));
