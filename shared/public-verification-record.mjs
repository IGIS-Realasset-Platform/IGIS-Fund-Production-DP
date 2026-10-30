// Public release records retain measured results while excluding account setup
// and private chat approval metadata. This module handles metadata only.
export function publicVerificationRecord(record){
 const result=structuredClone(record);
 result.securityFormalReport={status:'formal-verification-pending',sealedReportGenerated:false,notSubstitutedByProductTests:true};
 const refresh=result.externalDependencyRefresh;
 result.externalDependencyRefresh=refresh&&typeof refresh==='object'?Object.fromEntries(['status','returnedAdvisories','scope','evidence','priorAuditNotInheritedAsCurrent'].filter(key=>Object.hasOwn(refresh,key)).map(key=>[key,refresh[key]])):{status:'fresh-external-advisory-check-not-executed',priorAuditNotInheritedAsCurrent:true};
 return result;
}
