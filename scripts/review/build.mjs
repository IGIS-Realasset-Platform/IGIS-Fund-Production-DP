import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,copyFile,readdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const args=process.argv.slice(2),option=name=>{const n=args.indexOf(name);return n<0?null:args[n+1];};
const output=resolve(option('--out')||join(root,'dist/review'));
const data=join(root,'deployment/review-data'),studio=join(root,'scripts/local-preview');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>readFile(path,'utf8');
const manifest=JSON.parse(await read(join(data,'manifest.json')));
if(Number(process.versions.node.split('.')[0])!==24)throw Error('정적 검토본은 Node 24로 빌드해 주세요.');
for(const[name,expected]of Object.entries(manifest.files)){
 const bytes=await readFile(join(data,name));if(hash(bytes)!==expected.sha256||bytes.length!==expected.bytes)throw Error('승인 스냅샷 지문 불일치: '+name);
}
if(hash(JSON.stringify(manifest.files))!==manifest.seedHash)throw Error('스냅샷 manifest 지문 불일치');
if(!manifest.feed?.sourceFiles||hash(JSON.stringify(manifest.feed.sourceFiles))!==manifest.feed.sourceFingerprint)throw Error('Feed 소스 지문이 없습니다. 승인 자료를 다시 캡처해 주세요.');
for(const[name,expected]of Object.entries(manifest.feed.sourceFiles)){
 if(!name.startsWith('scripts/local-preview/feed/')||name.includes('..'))throw Error('Feed 소스 경로가 잘못됐습니다.');
 if(hash(await readFile(join(root,name)))!==expected)throw Error('Feed 소스와 고정 번들이 다릅니다. 로컬 Feed 재빌드/캡처 필요: '+name);
}
const context=JSON.parse(await read(join(data,'workspace-context.json')));
const sourceCommit=process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
await mkdir(join(root,'.build'),{recursive:true});
const work=await mkdtemp(join(root,'.build/review-package-'));
await mkdir(output,{recursive:true});await mkdir(join(output,'review-data'),{recursive:true});await mkdir(join(output,'work-feed'),{recursive:true});
try{
 const generated=join(work,'platform.html');
 execFileSync(process.execPath,['scripts/build-deployment.mjs','--cloud','--local-qa','--out',generated,'--icons','src/assets/nav-icons.json'],{cwd:root,stdio:'pipe'});
 const csp="default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob:; frame-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'";
 const meta='<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="'+csp+'">';
 const html=(await read(generated)).replace('<head>','<head>'+meta).replace('<title>','<title>로컬 디자인 작업실 · ')
  .replace('</head>','<link rel="stylesheet" href="./design.css"><script src="./review-config.js"></script><script src="./review-client.js"></script></head>')
  .replace(/<\/body><\/html>$/,'<script type="module" src="./studio.js"></script></body></html>');
 await writeFile(join(output,'index.html'),html);await writeFile(join(output,'.nojekyll'),'');
 const config={...context,seedHash:manifest.seedHash};
 await writeFile(join(output,'review-config.js'),'window.__IDM_REVIEW__='+JSON.stringify(config).replaceAll('<','\\u003c')+';\n');
 await copyFile(join(root,'scripts/review/review-client.js'),join(output,'review-client.js'));
 for(const name of Object.keys(manifest.files).filter(name=>name.endsWith('.json')))await copyFile(join(data,name),join(output,'review-data',name));
 await copyFile(join(data,'account-photo.png'),join(output,'local-account-photo.png'));
 for(const name of (await readdir(studio)).filter(name=>/\.(?:js|css|woff2)$/.test(name)||name==='Inter-OFL.txt')){
  if(name.endsWith('.woff2')||name==='Inter-OFL.txt'){await copyFile(join(studio,name),join(output,name));continue;}
  let text=await read(join(studio,name));
  if(name.endsWith('.css'))text=text.replaceAll("url('/InterVariable.woff2')","url('./InterVariable.woff2')");
  if(name==='studio.js')text=text.replace("frame.src='/work-feed/'","frame.src=new URL('./work-feed/',import.meta.url).href").replace("photo.src='/local-account-photo.png'","photo.src=new URL('./local-account-photo.png',import.meta.url).href");
  await writeFile(join(output,name),text);
 }
 await writeFile(join(output,'work-feed/index.html'),(await read(join(studio,'feed/index.html'))).replace('<head>','<head>'+meta+'<script src="../review-config.js"></script><script src="../review-client.js"></script>').replaceAll('"/work-feed/','"./'));
 await writeFile(join(output,'work-feed/theme.css'),(await read(join(studio,'feed/theme.css'))).replaceAll("url('/InterVariable.woff2')","url('../InterVariable.woff2')"));
 await copyFile(join(studio,'feed/default_avatar.svg'),join(output,'work-feed/default_avatar.svg'));
 await copyFile(join(data,'account-photo.png'),join(output,'work-feed/account-avatar.png'));
 let feed=await read(join(data,'feed/app.js'));
 if(!feed.includes('igis-design-work-feed'))throw Error('Feed 저장소 버전 연결을 확인해 주세요.');
 feed=feed.replaceAll('igis-design-work-feed','igis-review-feed-'+manifest.seedHash)
  .replaceAll('"/work-feed/default_avatar.svg"','"./default_avatar.svg"').replaceAll('"/work-feed/account-avatar"','"./account-avatar.png"');
 await writeFile(join(output,'work-feed/app.js'),feed);await copyFile(join(data,'feed/app.css'),join(output,'work-feed/app.css'));
 const files={};for(const name of (await readdir(output,{recursive:true})).sort()){
  if(name==='review-version.json')continue;
  let bytes;try{bytes=await readFile(join(output,name));}catch(error){if(error.code==='EISDIR')continue;throw error;}
  files[name]={sha256:hash(bytes),bytes:bytes.length};
 }
 await writeFile(join(output,'review-version.json'),JSON.stringify({schemaVersion:1,sourceCommit,seedHash:manifest.seedHash,workspaceRevision:manifest.revision,workspaceSha256:manifest.workspaceSha256,feed:manifest.feed,files},null,2)+'\n');
 console.log(JSON.stringify({output,sourceCommit,seedHash:manifest.seedHash,revision:manifest.revision,files:Object.keys(files).length}));
}finally{await rm(work,{recursive:true,force:true});}
