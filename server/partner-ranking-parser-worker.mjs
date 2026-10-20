import {parentPort,workerData} from 'node:worker_threads';

const fail=code=>{throw Error(code);};
function zipEnvelope(b){
 if(b.length<22||b.readUInt32LE(0)!==0x04034b50)fail('INVALID_RANKING_XLSX');
 let end=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(b.readUInt32LE(i)===0x06054b50){end=i;break;}
 if(end<0||b.readUInt16LE(end+4)||b.readUInt16LE(end+6)||b.readUInt16LE(end+8)!==b.readUInt16LE(end+10))fail('INVALID_RANKING_ZIP');
 const count=b.readUInt16LE(end+10),size=b.readUInt32LE(end+12),start=b.readUInt32LE(end+16);if(count<1||count>3000||start+size>end||start+size>b.length)fail('SOURCE_DOCUMENT_LIMIT');let p=start,total=0,seen=new Set();
 for(let i=0;i<count;i++){if(p+46>b.length||b.readUInt32LE(p)!==0x02014b50)fail('INVALID_RANKING_ZIP');const flags=b.readUInt16LE(p+8),packed=b.readUInt32LE(p+20),unpacked=b.readUInt32LE(p+24),nameLength=b.readUInt16LE(p+28),extra=b.readUInt16LE(p+30),comment=b.readUInt16LE(p+32),name=b.subarray(p+46,p+46+nameLength).toString('utf8');if(flags&1||!nameLength||p+46+nameLength+extra+comment>start+size||unpacked===0xffffffff||packed===0xffffffff||unpacked>16*1024*1024||(packed===0&&unpacked>0)||packed&&unpacked/packed>250||name.startsWith('/')||name.includes('..')||name.includes('\\')||seen.has(name))fail('SOURCE_DOCUMENT_LIMIT');seen.add(name);total+=unpacked;if(total>64*1024*1024)fail('SOURCE_DOCUMENT_LIMIT');p+=46+nameLength+extra+comment;}
 if(p!==start+size||!seen.has('xl/workbook.xml'))fail('INVALID_RANKING_XLSX');
}
try{
 const {format,maxPages,maxRows}=workerData,b=Buffer.from(workerData.bytes);let value,chars=0,cells=0;
 if(format==='xlsx'){
  zipEnvelope(b);const {default:readExcelFile}=await import('read-excel-file/node');value=await readExcelFile(b,{trim:false});if(!Array.isArray(value)||value.length<1||value.length>20)fail('SOURCE_DOCUMENT_LIMIT');let rows=0;for(const sheet of value){if(!Array.isArray(sheet.data))fail('INVALID_RANKING_XLSX');rows+=sheet.data.length;if(rows>maxRows)fail('SOURCE_DOCUMENT_LIMIT');for(const row of sheet.data){if(!Array.isArray(row))fail('INVALID_RANKING_XLSX');cells+=row.length;if(cells>600000)fail('SOURCE_DOCUMENT_LIMIT');for(const item of row)if(typeof item==='string'){chars+=item.length;if(chars>8000000)fail('SOURCE_DOCUMENT_LIMIT');}}}
 }else if(format==='pdf'){
  if(b.subarray(0,5).toString()!=='%PDF-')fail('INVALID_RANKING_PDF');const {default:PDFParser}=await import('pdf2json'),parser=new PDFParser();const data=await new Promise((resolve,reject)=>{parser.once('pdfParser_dataError',e=>reject(Error('INVALID_RANKING_PDF')));parser.once('pdfParser_dataReady',resolve);parser.parseBuffer(b);});if(!Array.isArray(data.Pages)||!data.Pages.length||data.Pages.length>maxPages)fail('SOURCE_DOCUMENT_LIMIT');value={Pages:data.Pages.map(page=>({Width:page.Width,Height:page.Height,Texts:(page.Texts||[]).map(t=>{if(++cells>400000||!Number.isFinite(t.x)||!Number.isFinite(t.y))fail('SOURCE_DOCUMENT_LIMIT');let text;try{text=(t.R||[]).map(r=>decodeURIComponent(r.T)).join('');}catch{fail('INVALID_RANKING_PDF_TEXT');}chars+=text.length;if(chars>8000000)fail('SOURCE_DOCUMENT_LIMIT');return{x:t.x,y:t.y,text};})}))};
 }else fail('INVALID_RANKING_FORMAT');
 parentPort.postMessage({ok:true,value});
}catch(error){parentPort.postMessage({ok:false,error:/^(?:INVALID_|SOURCE_)[A-Z0-9_]+$/.test(error?.message||'')?error.message:'SOURCE_DOCUMENT_PARSE_FAILED'});}
