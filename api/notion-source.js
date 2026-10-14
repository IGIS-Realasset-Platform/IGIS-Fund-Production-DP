// 선택적 보충자료만 제공합니다. 핵심 플랫폼·기존 DB·Notion 원본을 수정하지 않습니다.
export function GET(request){
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
 const reply=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
 if(request?.method&&request.method!=='GET')return reply({available:false,error:'METHOD_NOT_ALLOWED'},405);
 const raw=process.env.DP_NOTION_SNAPSHOT_JSON;
 if(!raw||!raw.trim())return reply({available:false});
 try{
  if(new TextEncoder().encode(raw).length>1000000)throw Error('source-too-large');
  const source=JSON.parse(raw);
  if(source?.schemaVersion!=='notion-development-projects-v1'||source.source?.hasMore!==false||!Array.isArray(source.projects)||source.source.expectedCount!==source.projects.length||!Array.isArray(source.nonPersonValues)||source.nonPersonValues.length!==8)throw Error('source-invalid');
  const fields=['databaseId','dataSourceUrl','viewUrl','referenceUrl','queriedAt','expectedCount','hasMore'];
  const clean={schemaVersion:source.schemaVersion,source:Object.fromEntries(fields.filter(key=>key in source.source).map(key=>[key,source.source[key]])),nonPersonValues:source.nonPersonValues,projects:source.projects.map(project=>({pageId:project.pageId,sourceUrl:project.sourceUrl,name:project.name,vehicle:project.vehicle,classification:project.classification||'',sourceStatus:project.sourceStatus||'',manager:project.manager,teamLead:project.teamLead,professionals:(project.professionals||[]).map(row=>({slot:row.slot,raw:row.raw}))}))};
  return reply({available:true,source:clean});
 }catch{
  console.error('OPTIONAL_SOURCE_INVALID');
  return reply({available:false,error:'OPTIONAL_SOURCE_INVALID'},422);
 }
}
