import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startPreview} from '../scripts/local-preview/server.mjs';

const directory=await mkdtemp(join(tmpdir(),'igis-finance-test-'));
const original=JSON.stringify({sourceLoad:{kind:'test'},projects:[
 {id:'TEST-20261016-A',loans:[{id:'loan',commitment:90000000000}],cbs:[{id:'cost',amount:450000000000}]},
 {id:'TEST-20261016-B'}, {id:'new-project'},
]});
const originalFile=join(directory,'original-workspace.json');
await writeFile(originalFile,original);
let server;
async function start(){
 server=await startPreview({port:0,directory});
 return 'http://127.0.0.1:'+server.address().port;
}
function close(){return new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
try {
 let origin=await start();
 const request=(project='TEST-20261016-A',change)=>fetch(origin+'/api/local-finance-stages?projectId='+project,change?{
  method:'PUT',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(change),
 }:undefined);
 const list=async project=>{
  const response=await request(project);
  assert.equal(response.status,200,'파이낸싱 단계 조회 API가 있어야 합니다');
  return (await response.json()).stages;
 };
 const workspace=async()=>await (await fetch(origin+'/api/workspace')).json();
 const before=await workspace();
 const seed=await list();
 assert.ok(seed.length>=2&&seed.every(stage=>stage.sample));
 assert.ok(seed.some(stage=>stage.notes.construction));
 assert.deepEqual(await list('new-project'),[]);
 assert.equal((await request('unknown')).status,404);
 const record={name:'설계 조정',date:'2026-09-15',reason:'구조 보강',values:{cost:0,land:null,construction:20000000000},notes:{construction:'내진 설계 반영'}};
 assert.equal((await request(undefined,{operation:'create',record:{...record,date:'2026-02-30'}})).status,422);
 assert.equal((await request(undefined,{operation:'create',record:{...record,values:{cost:'0'}}})).status,422);
 const createdResponse=await request(undefined,{operation:'create',record});
 assert.equal(createdResponse.status,201);
 const {stage}=await createdResponse.json();
 assert.equal(stage.sample,false);
 assert.equal(stage.values.cost,0);
 assert.equal(stage.values.land,null);
 assert.equal(stage.notes.construction,'내진 설계 반영');
 const update={operation:'update',id:stage.id,revision:stage.revision,record:{...record,name:'설계 확정'}};
 assert.equal((await request('TEST-20261016-B',update)).status,404);
 assert.equal((await request(undefined,update)).status,200);
 assert.equal((await request(undefined,update)).status,409);
 const current=(await list()).find(row=>row.id===stage.id);
 assert.equal(current.name,'설계 확정');
 assert.equal(current.revision,stage.revision+1);
 assert.deepEqual(await workspace(),before);
 await close();
 origin=await start();
 assert.deepEqual((await list()).find(row=>row.id===stage.id),current);
 for(const row of await list()){
  assert.equal((await request(undefined,{operation:'delete',id:row.id,revision:row.revision})).status,200);
 }
 await close();
 origin=await start();
 assert.deepEqual(await list(),[],'삭제한 예시 단계가 다시 나타나면 안 됩니다');
 assert.ok((await list('TEST-20261016-B')).length>=2);
 assert.deepEqual(await workspace(),before);
 assert.equal(await readFile(originalFile,'utf8'),original);
 console.log('LOCAL-UI-154 단계 등록·수정·삭제, 재시작, 프로젝트 격리, 원본 보존 확인');
} finally {
 if(server?.listening)await close();
 await rm(directory,{recursive:true,force:true});
}
