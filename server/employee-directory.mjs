import {WorkspaceError,readWorkspaceAccess} from './cloud-storage.mjs';

const DIRECTORY='development_project_platform.employee_directory',WORKSPACE='development_project_platform.platform_workspace';
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key),object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const key=value=>typeof value==='string'&&value.length>0&&value.length<=200&&value.trim()===value&&!/[\u0000-\u001f\u007f]/.test(value);
const text=value=>typeof value==='string'&&value.length>0&&value.length<=300&&value.trim()===value&&value.isWellFormed()&&!/[\u0000-\u001f\u007f]/.test(value);
const email=value=>value===null?null:typeof value==='string'&&value.length<=254&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value.trim())?value.trim().toLowerCase():undefined;
const fail=(status,code,message)=>{throw new WorkspaceError(status,code,message);};
const invalid=()=>fail(422,'INVALID_MANAGER_REFERENCE','담당자 목록에서 이름과 이메일을 다시 확인해 선택해 주세요.');
const unavailable=()=>fail(503,'EMPLOYEE_DIRECTORY_UNAVAILABLE','담당자 목록을 불러오지 못했습니다. 입력값을 유지하고 다시 시도해 주세요.');
const json=body=>Response.json(body,{headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff'}});
function employee(row){
 if(!object(row)||!key(row.employee_id)||!text(row.name)||!own(row,'email'))unavailable();
 const raw=row.email===null||row.email===undefined||typeof row.email==='string'&&!row.email.trim()?null:row.email,mail=email(raw);if(mail===undefined)unavailable();
 return{employeeId:row.employee_id,name:row.name,email:mail};
}
function employees(rows){
 if(!Array.isArray(rows)||rows.length>10000)unavailable();const seen=new Set();
 return rows.map(row=>{const value=employee(row);if(seen.has(value.employeeId))unavailable();seen.add(value.employeeId);return value;});
}
function reference(value){if(!object(value)||Object.keys(value).some(k=>!['employeeId','name','email'].includes(k))||!key(value.employeeId)||!text(value.name)||!own(value,'email')||email(value.email)===undefined||value.email!==email(value.email))invalid();return value;}
function sameReference(a,b){return a===b||object(a)&&object(b)&&JSON.stringify(Object.keys(a).sort().map(k=>[k,a[k]]))===JSON.stringify(Object.keys(b).sort().map(k=>[k,b[k]]));}

// Same transaction as workspace save. Existing references are historical values:
// only a deliberate new/changed link is rechecked against the current directory.
export async function validateProjectManagerReferences(client,current,next){
 const old=new Map((current.projects||[]).map(p=>[p.id,p])),pending=[];
 for(const project of next.projects||[]){const value=project.basic?.managerRef,previous=old.get(project.id)?.basic?.managerRef;if(sameReference(value,previous)||value===undefined||value===null)continue;pending.push(reference(value));}
 if(!pending.length)return;
 const ids=[...new Set(pending.map(v=>v.employeeId))];let result;try{result=await client.query('SELECT employee_id,name,email FROM '+DIRECTORY+' WHERE employee_id = ANY($1::text[])',[ids]);}catch{unavailable();}
 const byId=new Map(employees(result.rows).map(v=>[v.employeeId,v]));
 for(const value of pending){const actual=byId.get(value.employeeId);if(!actual||actual.name!==value.name||actual.email!==value.email)invalid();}
}

export function createEmployeeDirectoryHandler({withTransaction,origin,accessPolicy=readWorkspaceAccess}={}){
 if(typeof withTransaction!=='function'||typeof origin!=='string'||!origin)throw TypeError('담당자 목록의 인증 연결이 필요합니다.');
 return async request=>{
  if(request.headers.has('origin')&&request.headers.get('origin')!==origin)fail(403,'ORIGIN_NOT_ALLOWED','허용된 화면에서 다시 요청해 주세요.');
  if(request.method!=='GET')return Response.json({error:'METHOD_NOT_ALLOWED'},{status:405,headers:{allow:'GET','cache-control':'private, no-store'}});
  const params=new URL(request.url).searchParams,keys=[...params.keys()];if(new Set(keys).size!==keys.length||keys.some(k=>k!=='projectId')||params.has('projectId')&&!key(params.get('projectId')))fail(422,'INVALID_DIRECTORY_QUERY','담당자를 연결할 사업을 확인해 주세요.');
  const projectId=params.get('projectId');
  return withTransaction(request,async(client,session)=>{
   if(!key(session?.userId))fail(401,'AUTH_REQUIRED','로그인해 주세요.');const access=await accessPolicy(client,session);
   if(!access.isAdmin&&(!projectId||!['editor','approver'].includes(access.projects?.[projectId])))fail(403,'WORKSPACE_FORBIDDEN','담당자를 연결할 권한이 없습니다.');
   if(projectId){const found=await client.query("SELECT p->>'id' AS project_id FROM "+WORKSPACE+" w CROSS JOIN LATERAL jsonb_array_elements(w.state->'projects') p WHERE w.workspace_id='platform' AND p->>'id'=$1 AND COALESCE(p->>'deletedAt','')='' AND COALESCE(p->>'active','true')<>'false'",[projectId]);if(found.rows.length!==1)fail(404,'PROJECT_NOT_FOUND','사업을 찾을 수 없습니다.');}
   let result;try{result=await client.query('SELECT employee_id,name,email FROM '+DIRECTORY+' ORDER BY name,employee_id LIMIT 10001');}catch{unavailable();}
   const values=employees(result.rows);return json({source:'orgdb.employee_profiles',employees:values,count:values.length});
  });
 };
}
