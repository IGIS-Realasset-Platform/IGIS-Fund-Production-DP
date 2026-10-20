import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const SOURCE='https://raportal.vercel.app/03.%20Construction%20Board/index.html';
const GROUPS={cak:'cak-rows',cm:'cm-rows','etis-all':'etis-overall_rows','etis-con':'etis-construction_rows',kacem:'kacem-rows'};
const INDEX_IDS={'건물건설 및 건축보수':'kosis-building-repair','주거용건물':'kosis-residential','비주거용건물':'kosis-nonresidential','토목건설':'kosis-civil'};
const clone=x=>JSON.parse(JSON.stringify(x));
const num=v=>{const text=String(v??'').replaceAll(',','').trim();return /^[+-]?\d+(?:\.\d+)?$/.test(text)?Number(text):null;};
const count=(text,pattern)=>{const match=String(text||'').match(pattern);return match?Number(match[1]):null;};
const period=v=>String(v||'').replaceAll('.','-');

/** Adds only fields observed in the source's rendered components/templates.
 * Original financial records, source-specific identity and existing official notes remain unchanged.
 */
export function enrichPortalMigration(reference,raw,observation,legacy=null){
 if(reference?.source!==SOURCE||raw?.source!==SOURCE||observation?.source!==SOURCE)throw Error('원사이트 출처가 일치하지 않습니다.');
 if(!Array.isArray(observation.companies)||observation.companies.length!==150||!Number.isFinite(Date.parse(observation.checkedAt)))throw Error('150개 업체의 이관 관측과 확인시각이 필요합니다.');
 const observed=new Map();for(const c of observation.companies){if(!c.sourceRowId||observed.has(c.sourceRowId))throw Error('원사이트 행 식별값이 비었거나 중복됐습니다.');observed.set(c.sourceRowId,c);}
 const result=clone(reference),used=new Set(),legacyRows=new Map();
 if(legacy){if(legacy.source!==SOURCE||!Array.isArray(legacy.companies)||legacy.companies.length!==150)throw Error('기존 댓글 원문의 출처·행수를 확인해 주세요.');for(const row of legacy.companies){if(!row.sourceRowId||legacyRows.has(row.sourceRowId)||!Array.isArray(row.items))throw Error('기존 댓글 행 식별값을 확인해 주세요.');legacyRows.set(row.sourceRowId,row);}}
 for(const group of raw.groups||[]){const target=result.groups.find(g=>g.key===GROUPS[group.id]);if(!target||target.rows.length!==group.rows.length)throw Error('원사이트 분야·행수가 바뀌었습니다.');
  for(const original of group.rows){const details=observed.get(original.sourceRowId),rank=num(original.cells.find(c=>c.field==='rank')?.value),row=target.rows.find(r=>r.rank===rank);if(!details||!row||row.company!==original.name||used.has(original.sourceRowId))throw Error('원사이트 행 연결이 불명확합니다.');used.add(original.sourceRowId);
   const company=result.companies[row.companyKey];if(!company||company.companyKey!==row.companyKey)throw Error('업체 상세 식별값을 확인해 주세요.');
   const key=details.sourceCommentKey;if(typeof key!=='string'||!key.startsWith('company-comment:')||!key.slice(16).trim()||key!==original.companyKey)throw Error('명시된 원사이트 댓글 공통키가 일치하지 않습니다.');
   row.sourceCommentKey=key;company.sourceCommentKey=key;
   if(legacy){const previous=legacyRows.get(original.sourceRowId);if(!previous||previous.sourceCommentKey!==key)throw Error('기존 댓글의 원사이트 공통키가 다릅니다.');company.legacyOnlineComments=previous.items.map(item=>{if(item.sourceId!==null||item.createdAt!==null||item.datePrecision!=='display-minute-only'||typeof item.body!=='string')throw Error('기존 댓글의 정밀도·원문을 확인해 주세요.');return clone(item);});company.legacyCommentsCheckedAt=legacy.checkedAt;}
   if(details.update){if(details.update.label!=='UPDATE'||!String(details.update.description||'').trim())throw Error('새 원문 표시의 근거 문구가 없습니다.');row.online_update_mark={label:details.update.label,description:details.update.description};company.row.online_update_mark=clone(row.online_update_mark);}
   company.row.sourceCommentKey=key;
   const defs=(details.unitDefinitions||[]).flat().map(d=>({label:String(d.label||''),value:String(d.value||'')})),definition=label=>defs.find(d=>d.label===label)?.value;
   const fromDefinition=label=>{const v=definition(label);if(v==null)return null;const m=v.match(/^(\d+)건$/);if(!m)throw Error('단가 검토 건수의 원문 형식이 다릅니다.');return Number(m[1]);};
   const trusted=count(details.unitSummary,/신뢰\s*(\d+)건/),calculated=count(details.unitSummary,/계산\s*(\d+)건/),buttonCalculated=count(details.unitButton,/계산\s*(\d+)건/),buttonTrusted=count(details.unitButton,/확인\s*(\d+)건/);if(calculated==null||trusted==null||(buttonCalculated!=null?buttonCalculated!==calculated:buttonTrusted!==trusted))throw Error('단가 계산·신뢰 건수가 서로 다릅니다.');
   company.unitCostSummary={trustedCount:trusted,calculatedCount:calculated,missingAreaCount:count(details.unitButton,/면적 미확인\s*(\d+)건/),reviewedCount:fromDefinition('검토 수주'),ineligibleCount:fromDefinition('면적단가 부적합')};
   company.unitCostDefinitions=defs;company.unitCostSourceCheckedAt=observation.checkedAt;
   // The source template is the same popup that opens from its button, not a second ledger.
   company.unitCostText=String(details.unitText||'');company.unitCostLinks=(details.unitLinks||[]).map(l=>({label:String(l.text||''),url:String(l.href||'')})).filter(l=>/^https?:\/\//.test(l.url));
  }
 }
 if(used.size!==150)throw Error('대조하지 않은 업체가 있습니다.');
 const indices=observation.market?.detailedIndices;if(!Array.isArray(indices)||indices.length!==4)throw Error('원사이트 세부지수4개가 필요합니다.');
 const ids=new Set(),kosis=result.market.series.find(s=>s.id==='kosis-construction');
 result.market.detailedIndices=indices.map(item=>{const sourceText=String(item.title||''),label=String(item.text||'').split('\n')[0].trim(),id=INDEX_IDS[label],m=sourceText.match(/최근값:\s*(20\d{2}\.\d{2})\s+([\d,.]+)\s+YoY\s+([+-]?[\d.]+)%/);if(!id||ids.has(id)||!m||!sourceText.includes('2020년 연평균=100'))throw Error('세부지수의 이름·기준월·증감 정의를 확인해 주세요.');ids.add(id);return{id,label,period:period(m[1]),value:num(m[2]),yoy:num(m[3]),base:'2020년 연평균=100',unit:'지수',source_name:'KOSIS/한국건설기술연구원',source_url:kosis?.source_url||'',sourceText,checkedAt:observation.checkedAt};});
 const anchorText=String(indices[0].title||''),base=anchorText.match(/단가 앵커:\s*(?:국토부 기본형건축비\s*)?(20\d{2}\.\d{2}\.\d{2})\s*·\s*([\d,.]+)만원\/㎡\s*·\s*([\d,.]+)만원\/평/),supply=anchorText.match(/공급면적 참고:\s*([\d,.]+)만원\/3\.3㎡/),molit=result.market.series.find(s=>s.id==='molit-base-building');
 if(anchorText.includes('단가 앵커:')&&!base)throw Error('원문 단가 앵커를 해석하지 못했습니다. 누락한 채 통과하지 않습니다.');
 result.market.unitAnchors=[];
 if(base){result.market.unitAnchors.push({id:'molit-source-anchor-m2',label:'기준연도 단가 앵커',period:period(base[1]),value:num(base[2]),unit:'만원/㎡',areaBasis:'원사이트 기본형건축비 기준',sourceText:anchorText,source_url:molit?.source_url||''},{id:'molit-source-anchor-py',label:'기준연도 단가 앵커',period:period(base[1]),value:num(base[3]),unit:'만원/평',areaBasis:'원사이트 평 환산 표기',sourceText:anchorText,source_url:molit?.source_url||''});}
 if(supply)result.market.unitAnchors.push({id:'source-supply-area-reference',label:'공급면적 참고',period:null,value:num(supply[1]),unit:'만원/3.3㎡',areaBasis:'공급면적 참고값·별도 적용일 미제공',sourceText:anchorText,source_url:SOURCE});
 result.market.companyUnitCosts=result.groups.flatMap(group=>group.rows.flatMap(row=>(result.companies[row.companyKey].row.unit_cost_records||[]).map(record=>({...clone(record),companyKey:row.companyKey,companyName:row.company,sourceGroupKey:group.key}))));
 result.market.sourceRunClock=observation.market.sourceClock||null;result.market.migrationCheckedAt=observation.checkedAt;
 result.version='raportal-dom-20261020-v3';result.checkedAt=observation.checkedAt;
 return result;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [baseFile,rawFile,observationFile,outFile,legacyFile]=process.argv.slice(2);if(!outFile)throw Error('입력은 기존 정규화본·기존 원문·이관 관측·출력경로·기존댓글(선택) 순서입니다.');const out=path.resolve(outFile);if(!out.startsWith(path.resolve('.build')+path.sep))throw Error('출력은 .build 안에 보존합니다.');if(await fs.stat(out).catch(()=>null))throw Error('이전 근거를 덮어쓰지 않습니다.');
 const [base,raw,observation]=await Promise.all([baseFile,rawFile,observationFile].map(async f=>JSON.parse(await fs.readFile(f,'utf8')))),legacy=legacyFile?JSON.parse(await fs.readFile(legacyFile,'utf8')):null;const result=enrichPortalMigration(base,raw,observation,legacy);
 await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,JSON.stringify(result));console.log(JSON.stringify({version:result.version,companies:Object.keys(result.companies).length,sourceCommentKeys:new Set(Object.values(result.companies).map(c=>c.sourceCommentKey)).size,detailedIndices:result.market.detailedIndices.length,unitAnchors:result.market.unitAnchors.length,sourceWrites:0,checkedAt:result.checkedAt}));
}
