export function createReferenceRouter(runRequest){
 return async request=>{
  const url=new URL(request.url),isReference=url.pathname==='/api/reference-data',isComments=url.pathname==='/api/partner-comments',isArchives=url.pathname==='/api/report-archives',isDirectory=url.pathname==='/api/employee-directory';
  if(!isReference&&!isComments&&!isArchives&&!isDirectory)return Response.json({error:'NOT_FOUND'},{status:404});
  const selectors=url.searchParams.getAll('__reference_route');if(selectors.length>1)return Response.json({error:'INVALID_ROUTE'},{status:400});
  const selector=selectors[0];if(isComments&&selector&&selector!=='comments'||isArchives&&selector!==undefined&&selector!=='archives'||isDirectory&&selector!==undefined&&selector!=='employees')return Response.json({error:'INVALID_ROUTE'},{status:400});
  if(selector!==undefined&&!['reference','comments','archives','employees'].includes(selector))return Response.json({error:'NOT_FOUND'},{status:404});
  const action=isDirectory||selector==='employees'?'employeeDirectory':isArchives||selector==='archives'?'reportArchives':isComments||selector==='comments'?'partnerComments':'referenceData';if(request.method==='PATCH'&&action!=='reportArchives')return Response.json({error:'METHOD_NOT_ALLOWED'},{status:405});url.searchParams.delete('__reference_route');
  return runRequest(new Request(url,request),action);
 };
}
