import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {normalizeStakeholderCategory,groupStakeholderCompanies} from '../src/utils/stakeholderCategories.js';
import {normalizeStakeholder} from '../src/utils/stakeholderRegistration.js';
assert.equal(normalizeStakeholderCategory('투자자'),'LP');
assert.equal(normalizeStakeholderCategory('SI'),'SI(기업)');
assert.equal(normalizeStakeholderCategory('사업PM'),'사업PM');
assert.equal(normalizeStakeholder('신규 기업','담당자','SI').role_category,'SI(기업)');
const rows=[{id:'lp',company_name:'LP 기관',contact_name:'투자 담당',role_category:'LP'},{id:'loan',company_name:'대주 은행',contact_name:'대출 담당',role_category:'대주'},{id:'si',company_name:'전략 기업',contact_name:'기업 담당',role_category:'SI(기업)'}];
assert.deepEqual(groupStakeholderCompanies(rows,'SI(기업)','기업 담당').map(([name])=>name),['전략 기업']);
const db=`export const supabase={from(table){let filter=null;const q={select(){return q},in(key,values){filter=[key,values];return q},order(){return q},range(){return q},abortSignal(){return q},then(resolve){let data=table==='iota_stakeholder_master'?${JSON.stringify(rows)}:table==='iota_capital_stack'?[{vehicle_name:'427',phase:'Refinancing',tranche_type:'Equity',tranche_name:'보통주',institution_name:'출자 전용 기관',amount_krw_100m:100},{vehicle_name:'427',phase:'Refinancing',tranche_type:'Loan',tranche_name:'Tr.A',institution_name:'대출 전용 은행',amount_krw_100m:200}]:[];if(filter)data=data.filter(row=>filter[1].includes(row[filter[0]]));return Promise.resolve({data,error:null}).then(resolve)}};return q}};`;
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import StakeLp from './src/components/system/stakeholder/StakeLp.jsx';import Directory from './src/components/system/stakeholder/StakeholderDirectory.jsx';createRoot(document.getElementById('root')).render(window.category==='SI(기업)'?<Directory category={window.category}/>:<StakeLp category={window.category}/>);`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,format:'iife',platform:'browser',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'db-fixture',setup(b){b.onResolve({filter:/supabaseClient$/},()=>({path:'db',namespace:'stub'}));b.onLoad({filter:/.*/,namespace:'stub'},()=>({contents:db,loader:'js'}))}}]});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();page.setDefaultTimeout(7000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [category,company,contact] of [['LP','LP 기관','투자 담당'],['대주','대주 은행','대출 담당'],['SI(기업)','전략 기업','기업 담당']]){
  await page.goto('about:blank');await page.setContent('<div id="root"></div>');await page.evaluate(c=>window.category=c,category);await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.getByRole('heading',{name:category,exact:true}).waitFor();
  const directory=page.getByRole('region',{name:category+' 이해관계자'});
  await directory.getByRole('button').filter({hasText:company}).click();
  await directory.getByText(contact,{exact:true}).waitFor();
  assert.equal(await directory.getByText(category==='LP'?'대주 은행':'LP 기관',{exact:true}).count(),0);
  await directory.getByRole('searchbox').fill(contact);await directory.getByText(company,{exact:true}).waitFor();
  if(category==='LP') {await page.getByText('출자 전용 기관',{exact:true}).waitFor();assert.equal(await page.getByText('대출 전용 은행',{exact:true}).count(),0)}
  if(category==='대주') {await page.getByText('대출 전용 은행',{exact:true}).waitFor();assert.equal(await page.getByText('출자 전용 기관',{exact:true}).count(),0);assert.equal(await page.getByText('기타 이지스 마스터 투자자',{exact:true}).count(),0)}
 }
 assert.deepEqual(errors,[]);console.log('PASS: LP/lender/SI independent pages and DB filters; equity vs loan; contact expansion/search; legacy category compatibility.');
}finally{await browser.close()}
