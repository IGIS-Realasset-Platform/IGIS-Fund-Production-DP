export function createReferenceRouter(runRequest){
 return async request=>{
  const url=new URL(request.url),isReference=url.pathname==='/api/reference-data',isComments=url.pathname==='/api/partner-comments';
  if(!isReference&&!isComments)return Response.json({error:'NOT_FOUND'},{status:404});
  const selectors=url.searchParams.getAll('__reference_route');if(selectors.length>1)return Response.json({error:'INVALID_ROUTE'},{status:400});
  const selector=selectors[0];if(isComments&&selector&&selector!=='comments')return Response.json({error:'INVALID_ROUTE'},{status:400});
  if(selector!==undefined&&!['reference','comments'].includes(selector))return Response.json({error:'NOT_FOUND'},{status:404});
  const action=isComments||selector==='comments'?'partnerComments':'referenceData';url.searchParams.delete('__reference_route');
  return runRequest(new Request(url,request),action);
 };
}
