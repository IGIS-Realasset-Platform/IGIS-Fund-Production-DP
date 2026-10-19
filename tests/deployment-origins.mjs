import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const preview='https://development-project-platform-preview-git-preview-b5dda7-igisra.vercel.app',production='https://igis-development-project-platform.vercel.app';
const destination=path.resolve('.build/deployment-origins-'+process.pid);await fs.mkdir(destination,{recursive:true});
const checks=[];async function check(name,run){try{await run();checks.push({name,status:'passed'})}catch(error){checks.push({name,status:'failed',error:error.message})}}
async function build(name,args=[]){const out=path.join(destination,name+'.html'),result=spawnSync(process.execPath,['scripts/build-deployment.mjs','--cloud','--out',out,'--icons','src/assets/nav-icons.json',...args],{encoding:'utf8'});let runtime=null;if(result.status===0){const html=await fs.readFile(out,'utf8'),match=html.match(/const APP_RUNTIME=([^;]+);/);assert(match,'actual generated runtime required');runtime=JSON.parse(match[1]);}return {status:result.status,runtime}}
await check('default Preview canonical unchanged',async()=>assert.equal((await build('preview')).runtime.cloudOrigin,preview));
await check('explicit Production canonical does not point to Preview',async()=>assert.equal((await build('production',['--cloud-origin',production])).runtime.cloudOrigin,production));
await check('unapproved origin is rejected rather than ignored',async()=>assert.notEqual((await build('unapproved',['--cloud-origin','https://unapproved.example.invalid'])).status,0));
await check('origin with path is rejected',async()=>assert.notEqual((await build('path',['--cloud-origin',production+'/signup'])).status,0));
await check('local QA may not be combined with a deployed origin',async()=>assert.notEqual((await build('mixed',['--local-qa','--cloud-origin',production])).status,0));
const failed=checks.filter(c=>c.status==='failed').length;console.log(JSON.stringify({suite:'deployment-origins',passed:checks.length-failed,failed,actualGeneratedHtml:true,realNetwork:false,checks}));if(failed)process.exitCode=1;
