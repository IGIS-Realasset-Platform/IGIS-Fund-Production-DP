import {execFileSync} from 'node:child_process';
import {cp, mkdir, readdir, rm, readFile} from 'node:fs/promises';
import {resolve, join} from 'node:path';

const [builtArg, checkoutArg] = process.argv.slice(2);
if (!builtArg || !checkoutArg) throw Error('Usage: publish.mjs <built-review> <shared-site-checkout>');
const built = resolve(builtArg), checkout = resolve(checkoutArg);
const relative = 'public/idm-review', destination = join(checkout, relative);
const git = (...args) => execFileSync('git', ['-C', checkout, ...args], {encoding:'utf8'}).trim();
if (!/github\.com[:/]IGIS-Realasset-Platform\/IGIS-Fund-Production-DP(?:\.git)?$/.test(git('remote','get-url','origin'))) throw Error('Unexpected publishing repository');
if (git('branch','--show-current') !== 'main' || git('status','--porcelain')) throw Error('Publishing requires a clean main checkout');
const manifest = JSON.parse(await readFile(join(built, 'review-version.json'), 'utf8'));
if (!manifest.sourceCommit || manifest.sourceCommit !== process.env.GITHUB_SHA) throw Error('Review package does not match the pushed commit');
async function regularTree(dir) {
  for (const entry of await readdir(dir, {withFileTypes:true})) {
    if (entry.isDirectory()) await regularTree(join(dir,entry.name));
    else if (!entry.isFile()) throw Error('Review package must contain only ordinary files');
  }
}
await regularTree(built);
// This disposable CI checkout is changed only under the existing review directory.
await rm(destination, {recursive:true, force:true});
await mkdir(destination, {recursive:true});
await cp(built, destination, {recursive:true});
git('add','-A','--',relative);
const changed = git('diff','--cached','--name-only').split('\n').filter(Boolean);
if (changed.some(path => !path.startsWith(relative+'/'))) throw Error('Changes outside the review directory are forbidden');
if (!changed.length) { console.log('The shared review package is already current.'); process.exit(0); }
git('config','user.name','IDM review deployment');
git('config','user.email','41898282+github-actions[bot]@users.noreply.github.com');
git('commit','-m',`Update IDM review from ${manifest.sourceCommit.slice(0,12)}`);
for (let attempt=0; attempt<3; attempt++) {
  try { git('push','origin','HEAD:main'); console.log('Updated https://iotaseoul.cloud/idm-review/; GitHub Pages build follows.'); break; }
  catch(error) { if(attempt===2) throw error; git('pull','--rebase','origin','main'); }
}
