// Fixed, independent C93 source fixtures. Never read mutable release worktree files.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

export const reportControlCommit='5a0dc9ff92d9d7429f820773b1d4e13eb1e310a9';
const root=fileURLToPath(new URL('../',import.meta.url)),repository=path.join(root,'.build/github-release-20261014');
const expected={
 'src/report.js':'9fabe1adb195b87a3d72fed276bd73e9ece5f39504397a6b4987229079aee4ac',
 'src/report-form.js':'e3b65cfddfd5d4b3ce84a4c88c6e18bad15179e0a58d00f905485999da4b6891'
};
const cache=new Map();
export function readReportControl(file){
 if(!Object.hasOwn(expected,file))throw Error('QA_REPORT_CONTROL_PATH: only the two approved C93 report modules are allowed.');
 if(cache.has(file))return cache.get(file);
 const value=execFileSync('git',['-C',repository,'show',reportControlCommit+':'+file],{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024});
 const actual=createHash('sha256').update(value).digest('hex');
 if(actual!==expected[file])throw Error('QA_REPORT_CONTROL_MISMATCH: independent C93 source does not match its approved hash.');
 cache.set(file,value);return value;
}
