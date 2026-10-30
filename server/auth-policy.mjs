export const PASSWORD_POLICY=Object.freeze({minLength:8,maxLength:15});
export const LOGIN_PASSWORD_POLICY=Object.freeze({minLength:8,maxLength:128});
export const SESSION_POLICY=Object.freeze({defaultSeconds:28800,rememberedSeconds:604800});
export function companyEmail(raw){
 if(typeof raw!=='string')throw Error('회사 이메일을 입력해 주세요.');
 const email=raw.trim().toLowerCase(),parts=email.split('@');
 if(parts.length!==2||parts[1]!=='igisam.com'||parts[0].length<1||parts[0].length>64||email.length>254||!/^[a-z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[a-z0-9!#$%&'*+\-/=?^_`{|}~]+)*$/.test(parts[0]))throw Error('@igisam.com 회사 이메일을 입력해 주세요.');
 return email;
}
export function normalizeAllowedEmails(value){
 if(!Array.isArray(value)||value.length===0||value.length>500)throw Error('AUTH_POLICY_INVALID');
 const normalized=value.map(companyEmail);if(new Set(normalized).size!==normalized.length)throw Error('AUTH_POLICY_INVALID');
 return Object.freeze(normalized);
}
export function parseAllowedEmails(raw){
 if(typeof raw!=='string'||!raw.trim()||Buffer.byteLength(raw)>100000)throw Error('AUTH_POLICY_INVALID');
 const text=raw.trim();return normalizeAllowedEmails(text.startsWith('[')?JSON.parse(text):text.split(','));
}
export function parseSampleViewerEmails(raw){
 if(raw===undefined||raw===null||typeof raw==='string'&&!raw.trim())return Object.freeze([]);
 if(typeof raw!=='string'||Buffer.byteLength(raw)>100000)throw Error('AUTH_POLICY_INVALID');
 const value=raw.trim(),rows=value.startsWith('[')?JSON.parse(value):value.split(',');
 if(Array.isArray(rows)&&rows.length===0)return Object.freeze([]);
 return normalizeAllowedEmails(rows);
}
export function isSampleViewerEmail(email,emails=[]){return Array.isArray(emails)&&emails.includes(String(email||'').trim().toLowerCase());}
export function authAccessCounts(config){const regular=config.regularAllowedEmails||config.allowedEmails||[],sample=config.sampleViewerEmails||[];return{regularCount:regular.length,sampleCount:sample.length,unionCount:config.allowedEmails.length,overlapCount:regular.filter(v=>sample.includes(v)).length};}
export const validPassword=value=>typeof value==='string'&&value.length>=PASSWORD_POLICY.minLength&&value.length<=PASSWORD_POLICY.maxLength;
export const validLoginPassword=value=>typeof value==='string'&&value.length>=LOGIN_PASSWORD_POLICY.minLength&&value.length<=LOGIN_PASSWORD_POLICY.maxLength;
