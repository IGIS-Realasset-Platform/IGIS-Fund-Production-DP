// Remove only transport/copy whitespace outside an ASCII credential. Do not
// unwrap quotes/prefixes, fold Unicode, decode repeatedly, or alter the env.
export function trimProviderCredentialWhitespace(value){return typeof value==='string'?value.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g,''):value;}
export function normalizeDartApiKey(value){const normalized=trimProviderCredentialWhitespace(value);if(typeof normalized!=='string'||!/^[A-Za-z0-9]{40}$/.test(normalized))throw Error('INVALID_DART_API_KEY');return normalized;}
export function normalizeG2bServiceKey(value){const invalid=()=>{throw Object.assign(Error('INVALID_G2B_SERVICE_KEY'),{code:'INVALID_G2B_SERVICE_KEY'});};if(typeof value!=='string'||value.length>6144||!value.isWellFormed())invalid();value=trimProviderCredentialWhitespace(value);let normalized;try{normalized=value.includes('%')?decodeURIComponent(value):value;}catch{invalid();}if(normalized.length<10||normalized.length>2048||!/^[A-Za-z0-9+/_-]+={0,2}$/.test(normalized))invalid();return normalized;}

/** Invalid-only diagnostics: no credential text, fragments, lengths or hashes. */
export function providerCredentialFormat(value,provider){
 const string=typeof value==='string',trimmed=string?trimProviderCredentialWhitespace(value):'',percent=string&&trimmed.includes('%');let candidate=trimmed,decoded=false,malformedPercent=percent&&/%(?![0-9a-f]{2})/i.test(trimmed);
 if(provider==='g2b'&&percent&&trimmed.length<=6144){try{candidate=decodeURIComponent(trimmed);decoded=true;}catch{malformedPercent=true;}}
 const quoted=v=>/^['"]|['"]$/.test(v),prefix=v=>/^(?:(?:DP_DART_API_KEY|DP_G2B_SERVICE_KEY|crtfc_key|servicekey)\s*=|Bearer\s)/i.test(v);
 return{valueType:value===null?'null':typeof value,wrongLength:!string||(provider==='dart'?candidate.length!==40:trimmed.length>6144||candidate.length<10||candidate.length>2048),outerWhitespace:string&&trimmed!==value,quoted:string&&(quoted(trimmed)||quoted(candidate)),assignmentPrefix:string&&(prefix(trimmed)||prefix(candidate)),percentEncoded:percent,malformedPercent,remainingPercentAfterDecode:decoded&&candidate.includes('%'),controlCharacters:string&&/[\u0000-\u001f\u007f]/.test(trimmed+candidate),nonAscii:string&&/[^\u0000-\u007f]/.test(trimmed+candidate),wellFormed:string&&value.isWellFormed(),wrongCharacters:!string||!(provider==='dart'?/^[A-Za-z0-9]+$/:/^[A-Za-z0-9+/_-]+={0,2}$/).test(candidate)};
}
