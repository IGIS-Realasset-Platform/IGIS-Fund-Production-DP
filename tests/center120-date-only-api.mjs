import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {snapshotMetadata,taskMetadata} from '../server/center-services.mjs';
const row={id:'test',project_id:'P',kind:'event',label:'검사',as_of_date:new Date(2026,9,20),due_date:new Date(2026,11,31),workspace_revision:29,captured_at:'2026-10-20T12:18:00.123456Z',created_at:'2026-10-20T12:18:00.123456Z'},before=structuredClone(row);
assert.equal(snapshotMetadata(row).asOfDate,'2026-10-20');assert.equal(taskMetadata(row).dueDate,'2026-12-31');assert.equal(snapshotMetadata(row).capturedAt,row.captured_at);assert.deepEqual(row,before);
let passed=4;
for(const timezone of ['UTC','Asia/Seoul','America/Los_Angeles']){
 const script="import assert from 'node:assert/strict';import{snapshotMetadata,taskMetadata}from './server/center-services.mjs';const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;assert(process.env.TZ==='UTC'?['UTC','Etc/UTC'].includes(zone):zone===process.env.TZ,'requested timezone must actually be active');const v=new Date(2026,9,20),d=snapshotMetadata({as_of_date:v,workspace_revision:1}).asOfDate;assert.equal(d,'2026-10-20');assert.equal(JSON.parse(JSON.stringify({d})).d,'2026-10-20');assert.equal(taskMetadata({due_date:new Date(2026,11,31)}).dueDate,'2026-12-31');";
 const r=spawnSync(process.execPath,['--input-type=module','-e',script],{env:{...process.env,TZ:timezone},encoding:'utf8',windowsHide:true});assert.equal(r.status,0,timezone+' '+r.stderr);passed++;
}
for(const invalid of [new Date(NaN),null,undefined,0,'2026-02-30','2026-10-20T00:00:00.000Z']){const error=e=>e.status===500&&e.code==='CALENDAR_DATE_READ_FAILED'&&/날짜|기준일/.test(e.message);assert.throws(()=>snapshotMetadata({...row,as_of_date:invalid}),error);assert.throws(()=>taskMetadata({...row,due_date:invalid}),error);passed+=2;}
assert.equal(snapshotMetadata({...row,as_of_date:'2024-02-29'}).asOfDate,'2024-02-29');passed++;
console.log(JSON.stringify({suite:'center120-date-only-api',passed,scope:'actual JS Date/string API DTO, process timezones and serialization; no DB writes; instants untouched'}));
