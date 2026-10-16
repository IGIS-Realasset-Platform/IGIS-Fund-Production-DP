import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {verifyMailConfiguration} from './verify-mail-configuration.mjs';

// 핵심 플랫폼을 먼저 빌드합니다. Notion 보충자료는 런타임 API의 선택 입력입니다.
if(process.env.VERCEL!=='1')throw Error('Vercel 보호 배포용 빌드입니다. 로컬 검수는 build-deployment.mjs를 사용해 주세요.');
let approved;
try{approved=JSON.parse(await fs.readFile('deployment/approved-core.json','utf8'))}catch{approved=null}
const expected=process.env.DP_EXPECTED_HTML_SHA256||approved?.htmlSha256;
if(!/^[0-9a-f]{64}$/i.test(expected||''))throw Error('ARTIFACT_APPROVAL_MISSING: 검수한 최종 파일 지문이 없어 배포를 중단했습니다.');
const buildDir=path.resolve('.build/vercel-private'),htmlPath=path.join(buildDir,'index.html');
await fs.mkdir(buildDir,{recursive:true});
const result=spawnSync(process.execPath,['scripts/build-deployment.mjs','--cloud','--out',htmlPath,'--icons','src/assets/nav-icons.json'],{encoding:'utf8'});
if(result.error||result.status!==0)throw Error('CORE_BUILD_FAILED: 핵심 플랫폼의 전체 모듈 검사가 실패해 배포를 중단했습니다.');
const bytes=await fs.readFile(htmlPath),sha256=crypto.createHash('sha256').update(bytes).digest('hex');
if(expected.toLowerCase()!==sha256)throw Error('ARTIFACT_MISMATCH: 검수한 최종 화면과 배포 파일이 달라 배포를 중단했습니다.');
const mailConnection=await verifyMailConfiguration(process.env,{approvedHtmlSha256:expected,actualHtmlSha256:sha256});
console.log(JSON.stringify({status:'mail-configuration-check',...mailConnection,mailSent:false,applicationAuthenticationActive:false}));
await fs.mkdir('dist',{recursive:true});
await fs.copyFile(htmlPath,'dist/index.html');
console.log(JSON.stringify({status:'built-protected-cloud-platform',version:'0.11.2',htmlSha256:sha256,bytes:bytes.length,privateSourceInGit:false,sourceMode:'authenticated-optional-runtime-addon',notionRequiredForBuild:false,automaticNotionSync:false}));
