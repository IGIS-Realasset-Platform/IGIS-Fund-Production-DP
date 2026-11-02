// Pure normalization of independently provided source observations. This does
// not fetch/verify external bodies, resolve original contracts or calculate cost.
const own=(value,key)=>Object.hasOwn(value,key),origin='https://dart.fss.or.kr',hash=/^[a-f0-9]{64}$/;
export class ProvidedDartObservationError extends Error{
 constructor(code){super(code);this.name='ProvidedDartObservationError';this.code=code;}
}
const fail=code=>{throw new ProvidedDartObservationError(code);};
function record(value,code){
 if(value===null||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))fail(code);
 for(const[key,descriptor]of Object.entries(Object.getOwnPropertyDescriptors(value)))if(descriptor.get||descriptor.set||['__proto__','prototype','constructor'].includes(key))fail(code);
 return value;
}
function sourceText(value,max,code){if(typeof value!=='string'||value.length>max||!value.isWellFormed()||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))fail(code);return value;}
function text(value,max,code){sourceText(value,max,code);if(!value.trim())fail(code);return value;}
function list(value,limit,code){
 if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype||value.length>limit)fail(code);
 for(const key of Reflect.ownKeys(value)){const d=Object.getOwnPropertyDescriptor(value,key);if(typeof key!=='string'||key!=='length'&&(!/^(?:0|[1-9]\d*)$/.test(key)||Number(key)>=value.length)||d.get||d.set)fail(code);}
 for(let i=0;i<value.length;i++)if(!own(value,i))fail(code);return value;
}
function id(value,code){text(value,500,code);if(value!==value.trim()||/[\r\n\t]/.test(value))fail(code);return value;}
function date(value,code,nullable=false){if(nullable&&value===null)return null;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))fail(code);const d=new Date(value+'T00:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==value)fail(code);return value;}
function observedAt(value){const code='INVALID_PROVIDED_DART_INPUT';if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)||!Number.isFinite(Date.parse(value)))fail(code);date(value.slice(0,10),code);return value;}
function receipt(value,code){if(typeof value!=='string'||!/^\d{14}$/.test(value))fail(code);date(value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8),code);return value;}
function publicUrl(value,pathname,keys,code){
 if(typeof value!=='string')fail(code);let url;try{url=new URL(value);}catch{fail(code);}
 if(url.origin!==origin||url.username||url.password||url.port||url.hash||url.pathname!==pathname)fail(code);
 const actual=[...url.searchParams.keys()];if(actual.length!==keys.length||new Set(actual).size!==actual.length||actual.some(k=>!keys.includes(k)))fail(code);return url;
}
function mainUrl(value,code){const url=publicUrl(value,'/dsaf001/main.do',['rcpNo'],code);return{url:url.href,receipt:receipt(url.searchParams.get('rcpNo'),code)};}
function popupUrl(value,corpCode,code){const url=publicUrl(value,'/dsae001/selectPopup.ax',['selectKey'],code);if(url.searchParams.get('selectKey')!==corpCode)fail(code);return url.href;}
function viewerUrl(value,expectedReceipt,code){const url=publicUrl(value,'/report/viewer.do',['rcpNo','dcmNo','eleId','offset','length','dtd'],code);if(url.searchParams.get('rcpNo')!==expectedReceipt||!['dcmNo','eleId','offset','length'].every(k=>/^\d{1,12}$/.test(url.searchParams.get(k)))||!['HTML','dart3.xsd'].includes(url.searchParams.get('dtd')))fail(code);return url.href;}
function row(value,code){if(!Number.isSafeInteger(value)||value<0||value>100000)fail(code);return value;}
const vatValue=value=>['included','excluded','unconfirmed',null].includes(value);
function amount(value,{reported=false,whole=false}={}){
 const code='INVALID_PROVIDED_DART_AMOUNT';record(value,code);if(!own(value,'raw')||!own(value,'value')||value.currency!=='KRW'||!vatValue(value.vat)||!['whole_construction_contract','issuer_contract_share','unconfirmed'].includes(value.scope)||whole&&value.scope!=='whole_construction_contract')fail(code);
 if(value.raw===null||value.value===null){if(value.raw!==null||value.value!==null)fail(code);}
 else{if(typeof value.raw!=='string'||!/^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)(?:\.0+)?$/.test(value.raw)||!Number.isSafeInteger(value.value)||value.value<0||BigInt(value.raw.replaceAll(',','').split('.')[0])!==BigInt(value.value))fail(code);}
 const out={raw:value.raw,value:value.value,currency:value.currency,scope:value.scope,vat:value.vat,evidenceRow:row(value.evidenceRow,code)};
 if(reported){if(!own(value,'issuerSharePercent')||value.issuerSharePercent!==null&&(!Number.isFinite(value.issuerSharePercent)||value.issuerSharePercent<0||value.issuerSharePercent>100))fail(code);out.issuerSharePercent=value.issuerSharePercent;}
 return out;
}
function area(value){
 const code='INVALID_PROVIDED_DART_AREA';record(value,code);if(!own(value,'raw')||!own(value,'decimalText')||value.unit!=='m2'||value.basis!=='gross_floor_area'||!['whole_named_project','whole_construction_contract','issuer_contract_share','unconfirmed'].includes(value.scope))fail(code);
 if(value.raw===null||value.decimalText===null){if(value.raw!==null||value.decimalText!==null)fail(code);}
 else if(typeof value.raw!=='string'||typeof value.decimalText!=='string'||value.raw.length>48||!/^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)(?:\.\d{1,6})?$/.test(value.raw)||value.raw.replaceAll(',','')!==value.decimalText)fail(code);
 return{raw:value.raw,decimalText:value.decimalText,unit:value.unit,basis:value.basis,scope:value.scope,evidenceRow:row(value.evidenceRow,code)};
}
function normalizeIdentity(value){
 const code='INVALID_PROVIDED_DART_IDENTITY';record(value,code);const companyKey=id(value.companyKey,code),sourceRowId=id(value.sourceRowId,code),issuerName=text(value.issuerName,160,code),corpCode=value.dartCorpCode;
 if(typeof corpCode!=='string'||!/^\d{8}$/.test(corpCode)||/^0+$/.test(corpCode)||value.issuerIdentityVerified!==true)fail(code);list(value.sourceLegalIdentity,3,code);if(value.sourceLegalIdentity.length<2)fail(code);
 const e=record(value.evidence,code),popup=popupUrl(e.companyPopupUrl,corpCode,code);if(!hash.test(e.bodySha256||''))fail(code);list(e.receiptAnchors,200,code);if(!e.receiptAnchors.length)fail(code);
 const anchors=new Map();for(const anchor of e.receiptAnchors){record(anchor,code);const key=receipt(anchor.receipt,code),source=mainUrl(anchor.sourceUrl,code);if(source.receipt!==key||anchors.has(key))fail(code);anchors.set(key,{receipt:key,sourceUrl:source.url});}
 const namespaces=new Set(),identities=value.sourceLegalIdentity.map(entry=>{record(entry,code);const lengths={'dart-corp-code':8,'kr-business-registration':10,'kr-corporation-registration':13},length=lengths[entry.namespace];if(!length||namespaces.has(entry.namespace)||entry.verified!==true||typeof entry.value!=='string'||!new RegExp('^\\d{'+length+'}$').test(entry.value)||/^0+$/.test(entry.value))fail(code);namespaces.add(entry.namespace);
  let source;if(entry.namespace==='dart-corp-code'){if(entry.value!==corpCode)fail(code);const main=mainUrl(entry.sourceUrl,code);if(!anchors.has(main.receipt))fail(code);source=main.url;}else source=popupUrl(entry.sourceUrl,corpCode,code);
  return{namespace:entry.namespace,value:entry.value,sourceUrl:source,verified:true};});
 if(!namespaces.has('dart-corp-code')||![...namespaces].some(n=>n!=='dart-corp-code'))fail(code);
 const evidence={companyPopupUrl:popup,bodySha256:e.bodySha256,publicCompanyNameRow:row(e.publicCompanyNameRow,code),receiptAnchors:[...anchors.values()]};
 if(namespaces.has('kr-business-registration'))evidence.businessRegistrationRow=row(e.businessRegistrationRow,code);if(namespaces.has('kr-corporation-registration'))evidence.corporationRegistrationRow=row(e.corporationRegistrationRow,code);
 return{dto:{companyKey,sourceRowId,issuerName,dartCorpCode:corpCode,issuerIdentityVerified:true,sourceLegalIdentity:identities,evidence},anchors};
}
function evidence(value,key){
 const code='INVALID_PROVIDED_DART_EVIDENCE';record(value,code);if(!hash.test(value.rawBodySha256||''))fail(code);
 const out={receiptUrl:mainUrl(value.receiptUrl,'INVALID_PROVIDED_DART_RECEIPT_LINK').url,sourceUrl:viewerUrl(value.sourceUrl,key,'INVALID_PROVIDED_DART_RECEIPT_LINK'),rawBodySha256:value.rawBodySha256,contractDateRow:row(value.contractDateRow,code),titleRow:row(value.titleRow,code),notesRow:row(value.notesRow,code),notesText:text(value.notesText,20000,code)};
 if(own(value,'correctionTableRows')){list(value.correctionTableRows,100,code);out.correctionTableRows=value.correctionTableRows.map(entry=>{record(entry,code);list(entry.cells,20,code);if(!entry.cells.length)fail(code);return{row:row(entry.row,code),cells:entry.cells.map(cell=>sourceText(cell,20000,code))};});}
 return out;
}
function unitEligibility(observation){
 const reasons=['ORIGINAL_CONTRACT_ID_UNCONFIRMED'],a=observation.currentReportedAmount,g=observation.grossFloorArea;
 if(!['contract','amendment'].includes(observation.eventType))reasons.push('NOT_ACTIVE_CONSTRUCTION_CONTRACT');
 if(a.value===null)reasons.push('AMOUNT_MISSING');else if(a.value===0)reasons.push('AMOUNT_NOT_POSITIVE');
 if(g.decimalText===null)reasons.push('AREA_MISSING');else if(BigInt(g.decimalText.replace('.',''))===0n)reasons.push('AREA_NOT_POSITIVE');
 if(a.scope==='issuer_contract_share'&&['whole_named_project','whole_construction_contract'].includes(g.scope))reasons.push('ISSUER_SHARE_AND_WHOLE_AREA');
 else if(a.scope!==g.scope||a.scope!=='whole_construction_contract')reasons.push('AMOUNT_AREA_SCOPE_UNCONFIRMED');
 if(a.issuerSharePercent===null)reasons.push('ISSUER_SHARE_UNCONFIRMED');else if(a.issuerSharePercent!==100)reasons.push('PARTIAL_ISSUER_SHARE_REQUIRES_REVIEW');
 if(!['included','excluded'].includes(a.vat))reasons.push('VAT_UNCONFIRMED');
 return{eligible:false,reasons};
}
/** Display composition key only. Never use this as an original-contract ID. */
export function providedDartObservationKey(sourceUrl){return 'dart-receipt:'+mainUrl(sourceUrl,'INVALID_PROVIDED_DART_SOURCE_URL').receipt;}
export function normalizeProvidedDartObservations(input){
 const code='INVALID_PROVIDED_DART_INPUT';record(input,code);const at=observedAt(input.at);list(input.sourceIssuerIdentities,200,code);list(input.publicContractObservations,200,code);
 const issuers=new Map();for(const value of input.sourceIssuerIdentities){const normalized=normalizeIdentity(value),key=normalized.dto.companyKey;if(issuers.has(key))fail('INVALID_PROVIDED_DART_DUPLICATE');issuers.set(key,normalized);}
 const seen=new Set(),observations=input.publicContractObservations.map(value=>{
  record(value,'INVALID_PROVIDED_DART_OBSERVATION');const company=issuers.get(value.companyKey);if(!company||value.sourceRowId!==company.dto.sourceRowId||value.issuerCorpCode!==company.dto.dartCorpCode)fail('INVALID_PROVIDED_DART_COMPANY_LINK');
  const key=receipt(value.receiptNo,'INVALID_PROVIDED_DART_RECEIPT_LINK');if(value.sourceEventId!=='dart-contract:'+key||!company.anchors.has(key))fail('INVALID_PROVIDED_DART_RECEIPT_LINK');
  if(seen.has(key))fail('INVALID_PROVIDED_DART_DUPLICATE');seen.add(key);const source=evidence(value.sourceEvidence,key);if(mainUrl(source.receiptUrl,'INVALID_PROVIDED_DART_RECEIPT_LINK').receipt!==key)fail('INVALID_PROVIDED_DART_RECEIPT_LINK');
  const sourceDisclosureDate=date(value.sourceDisclosureDate,'INVALID_PROVIDED_DART_DATE');if(sourceDisclosureDate!==key.slice(0,4)+'-'+key.slice(4,6)+'-'+key.slice(6,8))fail('INVALID_PROVIDED_DART_DATE');const contractDate=date(value.contractDate,'INVALID_PROVIDED_DART_DATE',true);
  if(!own(value,'canonicalOriginalContractId')||value.canonicalOriginalContractId!==null)fail('INVALID_PROVIDED_DART_CANONICAL_ID');
  if(!['contract','amendment','cancellation'].includes(value.eventType))fail('INVALID_PROVIDED_DART_OBSERVATION');if(!own(value,'explicitWholeContractAmount'))fail('INVALID_PROVIDED_DART_AMOUNT');
  const out={status:'source_observation',observationKey:'dart-receipt:'+key,sourceEventId:value.sourceEventId,receiptNo:key,companyKey:company.dto.companyKey,sourceRowId:company.dto.sourceRowId,issuerCorpCode:company.dto.dartCorpCode,sourceDisclosureDate,contractDate,eventType:value.eventType,projectTitle:text(value.projectTitle,1000,'INVALID_PROVIDED_DART_OBSERVATION'),canonicalOriginalContractId:null,currentReportedAmount:amount(value.currentReportedAmount,{reported:true}),explicitWholeContractAmount:value.explicitWholeContractAmount===null?null:amount(value.explicitWholeContractAmount,{whole:true}),grossFloorArea:area(value.grossFloorArea),sourceEvidence:source};
  if(own(value,'legacyDateClaim'))out.legacyDateClaim=date(value.legacyDateClaim,'INVALID_PROVIDED_DART_DATE',true);
  out.unitCostEligibility=unitEligibility(out);return out;
 });
 return{version:1,at,provenanceScope:'input-consistency-only',independentSourceVerificationPerformed:false,issuerIdentities:[...issuers.values()].map(x=>x.dto),observations};
}
