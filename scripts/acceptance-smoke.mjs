import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const publicDir=path.join(root,'public');
const read=relative=>fs.readFileSync(path.join(publicDir,relative),'utf8').trim();

const gunzipB64=encoded=>zlib.gunzipSync(Buffer.from(encoded.replace(/\s+/g,''),'base64')).toString('utf8');

const validateHtml=(candidate,previous,label)=>{
  if(typeof candidate!=='string')throw new Error(`${label}: non-string document`);
  const html=candidate.trim();
  const previousLength=typeof previous==='string'?previous.length:0;
  const minLength=Math.max(12000,previousLength?Math.floor(previousLength*.55):0);
  if(html.length<minLength)throw new Error(`${label}: unexpectedly small document (${html.length} chars; minimum ${minLength})`);
  if(!/<(?:!doctype|html|body)\b/i.test(html))throw new Error(`${label}: missing document markup`);
  if(!/(KPCG|Kenya Platform for Climate Governance)/i.test(html))throw new Error(`${label}: missing KPCG identity`);
  if(!/(<main\b|id=["'](?:app|root)["']|data-page=|class=["'][^"']*(?:app|shell|page))/i.test(html))throw new Error(`${label}: missing application shell sentinel`);
  return candidate;
};

const evaluatePatch=(files,fnName,label)=>{
  const encoded=files.map(read).join('');
  const source=gunzipB64(encoded);
  const sandbox={console,window:{},globalThis:null,setTimeout,clearTimeout};
  sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(source,sandbox,{filename:`${label}.js`,timeout:5000});
  const fn=sandbox.window?.[fnName] ?? sandbox[fnName];
  if(typeof fn!=='function')throw new Error(`${label}: expected ${fnName} to be exported`);
  return fn;
};

const apply=(html,files,fnName,label)=>{
  const fn=evaluatePatch(files,fnName,label);
  const next=fn(html);
  return validateHtml(next,html,label);
};

const expectedFiles=[
  'index.html','manifest.webmanifest','sw.js','assets/kpcg-logo.webp',
  'app/part-01.txt','app/part-02.txt','app/part-03.txt','app/part-04.txt','app/part-05.txt',
  'app/patch-v11.txt','app/patch-v12.txt','app/patch-v13.txt',
  'app/patch-v15-01.txt','app/patch-v15-02.txt','app/patch-v15-03.txt','app/patch-v15-04.txt',
  'app/patch-v16-01.txt','app/patch-v16-02.txt'
];
for(const relative of expectedFiles){
  const full=path.join(publicDir,relative);
  if(!fs.existsSync(full))throw new Error(`Missing required release asset: ${relative}`);
  if(fs.statSync(full).size===0)throw new Error(`Empty required release asset: ${relative}`);
}

const visualAssets=[
  'assets/featured-locally-led-action.webp',
  'assets/leader-governance.webp',
  'assets/leader-programme.webp',
  'assets/leader-secretariat.webp',
  'assets/media-01-county-dialogue.webp',
  'assets/media-02-community-adaptation.webp',
  'assets/media-03-governance-interview.webp',
  'assets/media-04-evidence-cover.webp',
  'assets/media-05-county-dialogue.webp',
  'assets/media-06-community-adaptation.webp',
  'assets/media-07-governance-interview.webp',
  'assets/media-08-evidence-cover.webp',
  'assets/media-09-county-dialogue.webp',
  'assets/media-10-community-adaptation.webp',
  'assets/media-11-governance-interview.webp',
  'assets/media-12-evidence-cover.webp'
];
for(const relative of visualAssets){
  const full=path.join(publicDir,relative);
  if(!fs.existsSync(full))throw new Error(`Missing public visual asset: ${relative}`);
  const bytes=fs.statSync(full).size;
  if(bytes<40000)throw new Error(`Public visual asset is still thumbnail-grade: ${relative} (${bytes} bytes)`);
}
console.log(`PASS public visual asset quality floor: ${visualAssets.length} assets`);

const index=read('index.html');
for(const marker of ['patch-v13.txt?v=13','patch-v15-04.txt?v=15','patch-v16-02.txt?v=16','KPCGApplyExperiencePatchV16','FETCH_TIMEOUT_MS','validateHtml']){
  if(!index.includes(marker))throw new Error(`Loader is missing required release marker: ${marker}`);
}

let html=gunzipB64(['app/part-01.txt','app/part-02.txt','app/part-03.txt','app/part-04.txt','app/part-05.txt'].map(read).join(''));
html=validateHtml(html,null,'base application');
const stages=[
  [['app/patch-v11.txt'],'KPCGApplyPatch','v11 interface'],
  [['app/patch-v12.txt'],'KPCGApplyImagePatch','v12 imagery'],
  [['app/patch-v13.txt'],'KPCGApplyPatchV13','v13 acceptance'],
  [['app/patch-v15-01.txt','app/patch-v15-02.txt','app/patch-v15-03.txt','app/patch-v15-04.txt'],'KPCGApplyExperienceRedesignV15','v15 validated experience'],
  [['app/patch-v16-01.txt','app/patch-v16-02.txt'],'KPCGApplyExperiencePatchV16','v16 public experience']
];
for(const [files,fn,label] of stages){
  html=apply(html,files,fn,label);
  console.log(`PASS ${label}: ${html.length.toLocaleString()} chars`);
}

const sw=read('sw.js');
if(!sw.includes('kpcg-v16.1-20260912'))throw new Error('Service worker cache release is not v16.1-20260912');
for(const marker of ['patch-v13.txt?v=13','patch-v15-04.txt?v=15','patch-v16-02.txt?v=16']){
  if(!sw.includes(marker))throw new Error(`Service worker does not cache release asset ${marker}`);
}

const manifest=JSON.parse(read('manifest.webmanifest'));
if(manifest.start_url!=='/#/home')throw new Error(`Unexpected manifest start_url: ${manifest.start_url}`);
if(!Array.isArray(manifest.icons)||manifest.icons.length===0)throw new Error('Manifest has no install icon');

console.log(`PASS final v16 acceptance document: ${html.length.toLocaleString()} chars`);
console.log('KPCG v16.1 acceptance smoke test passed.');
