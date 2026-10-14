(function(A){
 'use strict';
 const DAY=86400000,missing=x=>x===null||x===undefined||typeof x==='string'&&!x.trim();
 const finite=x=>!missing(x)&&Number.isFinite(Number(x));
 const number=x=>finite(x)?Number(x):null;
 const extent=values=>{const list=(values||[]).filter(finite).map(Number);return list.length?[Math.min(...list),Math.max(...list)]:[null,null];};
 function niceStep(span,count){const raw=span/Math.max(1,count-1),power=10**Math.floor(Math.log10(raw||1)),fraction=raw/power;return([1,2,2.5,5,10].find(x=>x>=fraction)||10)*power;}
 function numericScale(values,options={}){
  const bounds=extent(values),fixedMin=number(options.min),fixedMax=number(options.max),count=Math.max(2,Math.min(12,Math.round(options.tickCount||5)));
  if(bounds[0]===null&&fixedMin===null&&fixedMax===null)return{valid:false,min:null,max:null,ticks:[],step:null,ratio:()=>null};
  let min=fixedMin??bounds[0]??0,max=fixedMax??bounds[1]??min;
  if(min>max)[min,max]=[max,min];
  if(options.includeZero){min=Math.min(0,min);max=Math.max(0,max);}
  if(min===max){const delta=Math.abs(min)*.1||1;min=options.includeZero&&min===0?0:min-delta;max+=delta;}
  else{const padding=Math.max(0,Number(options.padding??.12))*(max-min);if(fixedMin===null&&!(options.includeZero&&min===0))min-=padding;if(fixedMax===null&&!(options.includeZero&&max===0))max+=padding;}
  if(options.nonNegative&&bounds[0]>=0)min=Math.max(0,min);
  const step=niceStep(max-min,count),round=x=>Number(x.toPrecision(13));
  if(fixedMin===null)min=round(Math.floor(min/step)*step);if(fixedMax===null)max=round(Math.ceil(max/step)*step);
  if(options.nonNegative&&bounds[0]>=0)min=Math.max(0,min);
  if(!(max>min))max=min+step;
  const ticks=[];for(let x=Math.ceil((min-Number.EPSILON)/step)*step,i=0;x<=max+step*1e-8&&i<100;i++,x+=step)ticks.push(round(x));
  // Preserve bound labels without placing an almost-identical tick beside them.
  const interior=ticks.filter(x=>x>min+step*.4&&x<max-step*.4);ticks.length=0;ticks.push(min,...interior,max);
  return{valid:true,min,max,ticks,step,ratio:value=>finite(value)?(Number(value)-min)/(max-min):null};
 }
 function timestamp(value){if(missing(value))return null;if(typeof value==='number')return Number.isFinite(value)?value:null;if(value instanceof Date)return Number.isFinite(value.getTime())?value.getTime():null;const raw=String(value),date=/^\d{4}-\d{2}$/.test(raw)?raw+'-01':raw;const n=Date.parse(date.length===10?date+'T00:00:00Z':date);if(!Number.isFinite(n))return null;if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&new Date(n).toISOString().slice(0,10)!==date)return null;return n;}
 function dateScale(values,options={}){
  const list=(values||[]).map(timestamp).filter(x=>x!==null),specifiedMin=timestamp(options.min),specifiedMax=timestamp(options.max);
  if(!list.length&&specifiedMin===null&&specifiedMax===null)return{valid:false,min:null,max:null,ticks:[],stepDays:null,ratio:()=>null};
  let min=specifiedMin??Math.min(...list),max=specifiedMax??Math.max(...list);if(!Number.isFinite(min))min=max;if(!Number.isFinite(max))max=min;if(min>max)[min,max]=[max,min];
  const pad=Number(options.padDays||0)*DAY;if(min===max){min-=15*DAY;max+=15*DAY;}else{if(specifiedMin===null)min-=pad;if(specifiedMax===null)max+=pad;}
  const count=Math.max(2,Math.min(12,Math.round(options.tickCount||5))),ticks=[];for(let i=0;i<count;i++){const day=new Date(min+(max-min)*i/(count-1)).toISOString().slice(0,10);if(!ticks.includes(day))ticks.push(day);}
  return{valid:true,min,max,ticks,stepDays:(max-min)/DAY/(count-1),ratio:value=>{const n=timestamp(value);return n===null?null:(n-min)/(max-min);}};
 }
 const dateTicks=(valuesOrScale,options={})=>Array.isArray(valuesOrScale)?dateScale(valuesOrScale,options).ticks:valuesOrScale?.ticks||[];
 A.charts={...(A.charts||{}),numericScale,numericDomain:numericScale,dateScale,timeDomain:dateScale,dateTicks,extent,timestamp};
})(App);
