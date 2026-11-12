import {randomUUID} from 'node:crypto';
import {closeSync,openSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {stageFields} from './finance-stage-fields.js';

const samples=[
 ['TEST-20261016-A',[
  ['최초 언더라이팅','2024-06-01',[3050,5123,934.62,3104.76,410,6050,72],'토지 매입과 기본 설계 가정을 반영한 최초 사업성 검토입니다.'],
  ['기본설계 검토','2025-06-30',[3120,5163.8,971.08,3126.05,418,6130,74],'토지 매입 조건과 기본설계가 변경되어 원가를 다시 검토했습니다.',{land:'편입 필지 매입 조건을 반영했습니다.',construction:'지하층 흙막이 보강과 외장 사양을 반영했습니다.',cost:'토지 추가 매입과 공사 범위 확대분을 반영했습니다.'}],
  ['인허가 보완','2026-10-31',[3200,5248,971.08,3180,445,6220,78],'교통영향평가 보완과 착공 일정 조정을 반영했습니다.',{construction:'교통 개선시설과 진출입로 공사 범위가 추가되었습니다.',interest:'착공 일정 조정으로 이자 산정 기간이 늘었습니다.',cost:'추가 공사와 금융비 증가분을 반영했습니다.'}],
 ]],
 ['TEST-20261016-B',[
  ['최초 언더라이팅','2024-07-01',[1921.5,3227.49,615,1850,260,3710,48],'물류시설 규모와 진입 동선을 가정해 사업성을 검토했습니다.'],
  ['사업성 재검토','2026-10-31',[1880,3077.49,615,1720,240,3650,48],'물류동 규모를 조정하고 구조 공법을 재검토했습니다.',{construction:'물류동 연면적 축소와 구조 공법 변경을 반영했습니다.',cost:'공사 범위 축소와 금융비 절감분을 반영했습니다.'}],
 ]],
 ['TEST-20261016-C',[
  ['최초 언더라이팅','2024-05-01',[6405,10758.3,2560,5950,850,13020,84],'기본계획 기준으로 토지와 복합시설 개발비를 추정했습니다.'],
  ['공사계획 확정','2026-10-31',[6600,10958.3,2560,6090,910,13200,88],'복합시설 공사계획과 준공 일정을 구체화했습니다.',{construction:'공용부 사양과 설비 공사 범위를 확대했습니다.',cost:'공사 범위 확대와 일정 변경에 따른 금융비를 반영했습니다.'}],
 ]],
];

function validate(record){
 if(!record||typeof record!=='object')return null;
 const name=typeof record.name==='string'?record.name.trim():'';
 const reason=typeof record.reason==='string'?record.reason.trim():'';
 const date=record.date;
 if(!name||name.length>80||!reason||reason.length>1000||typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
 const time=new Date(date+'T00:00:00Z');
 if(!Number.isFinite(+time)||time.toISOString().slice(0,10)!==date||date.startsWith('0000'))return null;
 const values={},notes={};
 for(const {key,unit} of stageFields){
  const value=record.values?.[key]??null;
  const note=record.notes?.[key]??'';
  if(value!==null&&(!Number.isSafeInteger(value)||value<0||(unit&&value>1200)))return null;
  if(typeof note!=='string'||note.length>500)return null;
  values[key]=value;
  if(note.trim())notes[key]=note.trim();
 }
 return {name,date,reason,values,notes};
}

export function openFinanceStageStore(file,projectIds){
 closeSync(openSync(file,'a',0o600));
 const db=new DatabaseSync(file);
 db.exec(`
  PRAGMA busy_timeout=5000;
  CREATE TABLE IF NOT EXISTS finance_stages (
   project_id TEXT NOT NULL,
   id TEXT NOT NULL,
   revision INTEGER NOT NULL DEFAULT 1,
   sample INTEGER NOT NULL DEFAULT 0,
   stage_date TEXT NOT NULL,
   data TEXT NOT NULL,
   PRIMARY KEY (project_id,id)
  );
  CREATE TABLE IF NOT EXISTS finance_stage_seed (project_id TEXT PRIMARY KEY);
 `);
 const listRows=db.prepare('SELECT * FROM finance_stages WHERE project_id=? ORDER BY stage_date,rowid');
 const find=db.prepare('SELECT * FROM finance_stages WHERE project_id=? AND id=?');
 const insert=db.prepare('INSERT INTO finance_stages (project_id,id,sample,stage_date,data) VALUES (?,?,?,?,?)');
 const replace=db.prepare('UPDATE finance_stages SET stage_date=?,data=?,revision=revision+1 WHERE project_id=? AND id=? AND revision=?');
 const remove=db.prepare('DELETE FROM finance_stages WHERE project_id=? AND id=? AND revision=?');
 const seed=db.prepare('INSERT OR IGNORE INTO finance_stage_seed (project_id) VALUES (?)');
 db.exec('BEGIN IMMEDIATE');
 try{
  for(const [projectId,rows] of samples){
   if(!projectIds.has(projectId)||!seed.run(projectId).changes)continue;
   rows.forEach(([name,date,amounts,reason,notes={}],index)=>{
    const values=Object.fromEntries(stageFields.map(({key,unit},i)=>[key,unit?amounts[i]:Math.round(amounts[i]*1e8)]));
    insert.run(projectId,'example-'+(index+1),1,date,JSON.stringify({name,date,reason,values,notes}));
   });
  }
  db.exec('COMMIT');
 }catch(error){
  db.exec('ROLLBACK');
  db.close();
  throw error;
 }
 const decode=row=>({id:row.id,revision:row.revision,sample:Boolean(row.sample),...JSON.parse(row.data)});
 return {
  list:projectId=>listRows.all(projectId).map(decode),
  change(projectId,message){
   const {operation,id,revision,record}=message||{};
   if(!['create','update','delete'].includes(operation))return [422,{error:'INVALID_OPERATION'}];
   const stage=operation==='delete'?null:validate(record);
   if(operation!=='delete'&&!stage)return [422,{error:'INVALID_STAGE'}];
   if(operation==='create'){
    const newId=randomUUID();
    insert.run(projectId,newId,0,stage.date,JSON.stringify(stage));
    return [201,{stage:decode(find.get(projectId,newId))}];
   }
   if(typeof id!=='string'||!Number.isSafeInteger(revision)||revision<1)return [422,{error:'INVALID_STAGE_REVISION'}];
   const result=operation==='update'?
    replace.run(stage.date,JSON.stringify(stage),projectId,id,revision):
    remove.run(projectId,id,revision);
   if(!result.changes)return find.get(projectId,id)?[409,{error:'REVISION_CONFLICT'}]:[404,{error:'STAGE_NOT_FOUND'}];
   return [200,operation==='update'?{stage:decode(find.get(projectId,id))}:{deleted:true}];
  },
  close:()=>db.close(),
 };
}
