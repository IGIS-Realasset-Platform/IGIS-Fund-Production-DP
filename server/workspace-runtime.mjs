import {readAuthConfiguration,unavailableResponse} from './email-auth.mjs';
import {loadProductionDrivers,boundAuthenticationService,databaseConnectionOptions} from './email-auth-runtime.mjs';
import {createWorkspaceHandlers,WorkspaceError,workspaceErrorResponse} from './cloud-storage.mjs';
import {readOptionalSource} from './notion-source.mjs';
import {createCenterHandlers} from './center-services.mjs';
import {createPartnerCommentsHandler} from './partner-comments.mjs';

export function createWorkspaceRuntime({environment=()=>process.env,loadDrivers=loadProductionDrivers,createService=boundAuthenticationService,createHandlers=createWorkspaceHandlers,optionalSource=readOptionalSource}={}){
 return async function runWorkspaceRequest(request,action){
  let client;
  try{
   const config=readAuthConfiguration(environment());databaseConnectionOptions(config.databaseUrl,config.databaseCa);
   const withTransaction=async(source,operation)=>{
    const drivers=await loadDrivers(config);client=await drivers.pool.connect();
    try{
    await client.query('BEGIN');await client.query('SET LOCAL search_path = pg_catalog, development_project_platform');await client.query("SET LOCAL statement_timeout = '10s'");
    const service=await createService(config,drivers,client),headers=new Headers();
    if(source.headers.has('cookie'))headers.set('cookie',source.headers.get('cookie'));
    if(source.headers.has('origin'))headers.set('origin',source.headers.get('origin'));
    for(const name of ['x-vercel-forwarded-for','x-forwarded-for','x-real-ip','user-agent'])if(source.headers.has(name))headers.set(name,source.headers.get(name));
    const sessionResponse=await service.handle(new Request(config.origin+'/api/session',{headers}),'session');
    if(!sessionResponse.ok){
     let code;if(sessionResponse.status===403)try{code=(await sessionResponse.json())?.error;}catch{}
     if(code==='EMAIL_NOT_ALLOWED')throw new WorkspaceError(403,'EMAIL_NOT_ALLOWED','이용이 허용된 이메일을 확인해 주세요.');
     throw new WorkspaceError(sessionResponse.status>=500?503:401,'AUTH_REQUIRED','로그인 상태를 확인할 수 없습니다. 다시 로그인해 주세요.');
    }
    const identity=await sessionResponse.json();if(identity.authenticated!==true||!identity.userId)throw new WorkspaceError(401,'AUTH_REQUIRED','로그인해 주세요.');
    const response=await operation(client,{userId:identity.userId,email:identity.email});
    if(response.status>=400){await client.query('ROLLBACK');return response;}
    await client.query('COMMIT');
    for(const cookie of sessionResponse.headers.getSetCookie())response.headers.append('set-cookie',cookie);
    return response;
    }catch(error){try{await client.query('ROLLBACK')}catch{}throw error;}
    finally{client.release();client=null;}
   };
   if(action==='notionSource'){
    if(request.method!=='GET')return Response.json({error:'METHOD_NOT_ALLOWED'},{status:405});
    if(request.headers.has('origin')&&request.headers.get('origin')!==config.origin)throw new WorkspaceError(403,'ORIGIN_NOT_ALLOWED','허용된 화면에서 다시 요청해 주세요.');
    return await withTransaction(request,async(client,user)=>{const result=await client.query('SELECT 1 FROM development_project_platform.platform_admins WHERE user_id=$1',[user.userId]);if(!result.rows.length)throw new WorkspaceError(403,'WORKSPACE_FORBIDDEN','보충자료를 조회할 권한이 없습니다.');return optionalSource(request);});
   }
   if(action==='partnerComments')return await createPartnerCommentsHandler({withTransaction,origin:config.origin})(request);
   const handlers=['notifications','referenceData','costSnapshots','lawSearch','lawDetail','lawWatch','lawRegional'].includes(action)?createCenterHandlers({withTransaction,origin:config.origin}):createHandlers({withTransaction,origin:config.origin});
   if(!['workspace','projectAccess','notifications','referenceData','costSnapshots','lawSearch','lawDetail','lawWatch','lawRegional'].includes(action))return Response.json({error:'NOT_FOUND'},{status:404});
   return await handlers[action](request);
  }catch(error){if(client)try{await client.query('ROLLBACK')}catch{}if(error instanceof WorkspaceError&&error.status<500)return workspaceErrorResponse(error);return unavailableResponse();}
  finally{if(client)client.release();}
 };
}
export const runWorkspaceRequest=createWorkspaceRuntime();
