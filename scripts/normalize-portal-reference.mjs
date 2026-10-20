import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const groups={cak:{key:'cak-rows',source:'cak'},cm:{key:'cm-rows',source:'cm'},'etis-all':{key:'etis-overall_rows',source:'etis'},'etis-con':{key:'etis-construction_rows',source:'etis'},kacem:{key:'kacem-rows',source:'kacem'}};
const number=value=>{const text=String(value??'').trim();return /^-?\d[\d,]*(?:\.\d+)?$/.test(text)?Number(text.replaceAll(',','')):null};
const links=value=>Array.isArray(value)?value.filter(x=>x&&/^https?:\/\//i.test(x.url||'')).map(x=>({label:String(x.label||''),url:x.url})):[];
const detailMap=row=>Object.fromEntries((row.details||[]).map(x=>[x.label,x.value]));
const split=value=>String(value||'').split('\n').map(x=>x.trim()).filter(Boolean);

function feedItem(item,kind){
 const lines=split(item.text),first=lines[0]||'',date=first.match(/\b(20\d{2})[.\-/](\d{2})[.\-/](\d{2})\b/),firstLink=links(item.links)[0],at=date?`${date[1]}-${date[2]}-${date[3]}`:'';
 if(kind==='awards'){const amount=lines.find(x=>/^금액/.test(x))?.match(/^금액\s*([\d,.]+)\s*억원/);return {date:at,project:lines[1]||'',client:lines[2]&&!/^금액/.test(lines[2])?lines[2]:'',amount_krw:amount?number(amount[1])*1e8:null,source_name:firstLink?.label||lines.at(-1)||'',source_url:firstLink?.url||'',sourceText:item.text,links:links(item.links)}}
 return {published:at,title:lines[1]||'',source:first.split('·').slice(1).join('·').trim(),summary:lines.slice(2).join('\n'),url:firstLink?.url||'',sourceText:item.text,links:links(item.links)};
}
function unitCostRecords(rawRow){
 if(Array.isArray(rawRow.unitCostRecords))return rawRow.unitCostRecords;
 const evidence=String(rawRow.unitCostText||'').split('확인 근거')[1]||'',records=[...evidence.matchAll(/(20\d{2}\.\d{2}\.\d{2})\s*·[^\n]+\n\s*([^\n]+)\n\s*([^\n]+)\n\s*(High|Medium)[^\n]*\n\s*총액\s*([\d,.]+)억원\s*\n\s*연면적\s*([\d,.]+)㎡\s*\n\s*평단가\s*([\d,.]+)만원\/평/g)],evidenceLinks=links(rawRow.unitCostLinks),recordLinks=evidenceLinks.length>=records.length?evidenceLinks.slice(-records.length):[];
 return records.map((m,i)=>({date:m[1].replaceAll('.','-'),year:Number(m[1].slice(0,4)),project:m[2].trim(),client:m[3].trim(),confidence:m[4],amount_krw:number(m[5])*1e8,floor_area_m2:number(m[6]),unit_cost_krw_per_py:number(m[7])*10000,source_name:recordLinks[i]?.label||'',source_url:recordLinks[i]?.url||''}));
}
function marketData(raw,checkedAt){
 const text=String(raw?.text||''),sourceLinks=links(raw?.links),url=label=>sourceLinks.find(x=>x.label.includes(label))?.url||'',point=(period,value,unit)=>({period:period.replaceAll('.','-'),value:number(value),updated_at:checkedAt,status:'원사이트 수록값',unit});
 const kosis=[...text.matchAll(/(?:^|\n)\s*(20\d{2}\.\d{2})\s*\n\s*([\d,.]+)\s*\n\s*YoY\s*([+-]?[\d.]+)%/g)].map(m=>({...point(m[1],m[2],'지수'),yoy:number(m[3])}));
 const molit=[...text.matchAll(/(?:^|\n)\s*(20\d{2}\.\d{2}\.\d{2})\s*\n\s*([\d,.]+)만원\/㎡\s*\n\s*직전\s*([+-]?[\d.]+)%/g)].map(m=>point(m[1],m[2],'만원/㎡'));
 const g2b=[...text.matchAll(/(?:^|\n)\s*(20\d{2}\.\d{2})\s*\n\s*([\d,.]+)억원\s*\n\s*(\d+)건/g)].map(m=>({...point(m[1],m[2],'억원'),count:number(m[3])}));
 const make=(id,label,unit,frequency,sourceName,sourceUrl,points)=>({id,label,unit,frequency,source_name:sourceName,source_url:sourceUrl,points});
 return {generatedAt:checkedAt,sourceUrl:'https://raportal.vercel.app/03.%20Construction%20Board/index.html',series:[make('kosis-construction','건설공사비지수','지수 · 2020년 평균=100','월','KOSIS/한국건설기술연구원',url('KOSIS'),kosis),make('molit-base-building','기본형건축비','만원/㎡','고시','국토교통부',url('국토교통부'),molit),make('g2b-contracts','나라장터 계약액','억원','월','나라장터 계약정보',url('나라장터'),g2b)].filter(x=>x.points.length),links:sourceLinks,sourceText:text};
}

export function normalizePortalReference(raw){
 if(!raw||typeof raw!=='object'||!Array.isArray(raw.groups)||raw.groups.length!==5||!Number.isFinite(Date.parse(raw.checkedAt)))throw Error('원사이트 5개 분야와 확인시각을 확인해 주세요.');
 if(JSON.stringify(raw).includes('[MaxDepth]'))throw Error('원사이트 추출 결과에 깊이 제한으로 누락된 값이 있습니다. 재수집해 주세요.');
 const companies={},seenGroups=new Set(),seenKeys=new Set(),normalized=[];
 for(const group of raw.groups){const descriptor=groups[group.id];if(!descriptor||seenGroups.has(group.id)||!Array.isArray(group.rows)||group.rows.length!==30)throw Error('분야별 30개 원행이 필요합니다.');seenGroups.add(group.id);
  const title=String(group.title||''),year=title.match(/(20\d{2})년?/)?.[1]||'',quarter=title.match(/(\d)\/4분기/)?.[1],basis=group.caption?.match(/조회 기준:\s*(\d{4})\/(\d{2})\/(\d{2})/),version=quarter?`${year}년 ${quarter}분기`:year;
  const meta={title,latest_year:year,latest_label:version,basis_date:basis?`${basis[1]}-${basis[2]}-${basis[3]}`:version,source_url:links(group.sourceLinks)[0]?.url||raw.source,caption:group.caption||'',headers:group.headers||[]};
  if(group.id==='cm')meta.announcement_year=links(group.sourceLinks)[0]?.url.match(/GONGSI_YEAR=(\d{4})/)?.[1]||'';
  const ranks=new Set();const rows=group.rows.map(rawRow=>{const cells=Object.fromEntries((rawRow.cells||[]).map(x=>[x.field,x.value])),details=detailMap(rawRow),rank=number(cells.rank);if(!Number.isInteger(rank)||rank<1||rank>30||ranks.has(rank)||!rawRow.name||!rawRow.sourceRowId)throw Error('업체 원행의 순위·이름·식별값을 확인해 주세요.');ranks.add(rank);
   const registration=String(cells.registration_no||details['등록번호']||details['신고번호']||'').trim(),sourceRowId=`${descriptor.key}:${version}:${registration||rawRow.sourceRowId}`,companyKey=registration?`${group.id}:registration:${registration}`:`${group.id}:${version}:${rawRow.sourceRowId}`;
   if(seenKeys.has(companyKey))throw Error('같은 출처의 업체 식별값이 중복되었습니다.');seenKeys.add(companyKey);
   const row={companyKey,sourceRowId,company:rawRow.name,rank,previous_rank:number(cells.previous_rank),rank_change:String(cells.rank_change||'—'),registration_no:registration||null,region:cells.region||details['지역']||null,representative:cells.representative||details['대표자']||null};
   for(const [field,value]of Object.entries(cells))if(field==='people'||field==='count'||field==='total_count'||/_amount_(?:million|100m)_krw$/.test(field)||field==='amount_million_krw')row[field]=number(value);
   if(details['용역형 CM 누계(백만원)']!==undefined)row.total_service_cm_amount_million_krw=number(details['용역형 CM 누계(백만원)']);
   for(const [label,field]of [['민간 감리 금액(억원)','private_supervision_amount_100m_krw'],['민간 다중이용 금액(억원)','private_multiuse_amount_100m_krw'],['민간 CM 금액(억원)','private_cm_amount_100m_krw']])if(details[label]!==undefined)row[field]=number(details[label]);
   const credit=cells.credit_rating_label||details['신용등급'];if(credit&&!['—','-','미확인'].includes(credit))row.credit_rating_representative={raw:String(credit),product:'unknown'};
   const awards=(rawRow.feeds||[]).find(x=>x.title?.includes('수주/계약')),news=(rawRow.feeds||[]).find(x=>x.title?.includes('기사/전략'));
   companies[companyKey]={companyKey,sourceRowId,source:raw.source,checkedAt:raw.checkedAt,fields:rawRow.details||[],row:{...row,recent_awards:(awards?.items||[]).map(x=>feedItem(x,'awards')),related_articles:(news?.items||[]).map(x=>feedItem(x,'news')),unit_cost_records:unitCostRecords(rawRow)},officialComments:(rawRow.officialComments||[]).map(x=>({author:String(x.author||''),body:String(x.body||''),meta:String(x.meta||''),source:raw.source})),unitCostText:rawRow.unitCostText||'',unitCostLinks:links(rawRow.unitCostLinks)};
   return row;
  });normalized.push({...descriptor,meta,rows});
 }
 return {version:'raportal-dom-20261020-v1',checkedAt:raw.checkedAt,source:raw.source,groups:normalized,market:marketData(raw.market,raw.checkedAt),companies};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const input=process.argv[2],output=process.argv[3];if(!input||!output)throw Error('사용법: node scripts/normalize-portal-reference.mjs 원본.json .build/출력.json');const resolved=path.resolve(output),boundary=path.resolve('.build')+path.sep;if(!resolved.startsWith(boundary))throw Error('원사이트 기준자료 출력은 이 작업공간의 .build 안에만 저장합니다.');const raw=JSON.parse(await fs.readFile(input,'utf8')),result=normalizePortalReference(raw);await fs.mkdir(path.dirname(resolved),{recursive:true});await fs.writeFile(resolved,JSON.stringify(result));console.log(JSON.stringify({groups:result.groups.map(g=>({key:g.key,rows:g.rows.length,basis:g.meta.basis_date})),companies:Object.keys(result.companies).length,marketSeries:result.market.series.map(s=>({id:s.id,points:s.points.length})),checkedAt:result.checkedAt}));}
