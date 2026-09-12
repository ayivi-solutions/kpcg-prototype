import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const artifactDir=path.join(root,'artifacts');
const baseURL=(process.env.KPCG_PREVIEW_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
const expectedCache='kpcg-kpcg-v16.1-20260912';
const outputPath=path.join(artifactDir,'service-worker-cache-summary.json');
fs.mkdirSync(artifactDir,{recursive:true});

const browser=await chromium.launch({headless:true});
let summary;
try{
  const context=await browser.newContext({serviceWorkers:'allow'});
  const page=await context.newPage();
  const response=await page.goto(`${baseURL}/#/home`,{waitUntil:'domcontentloaded',timeout:30000});
  if(!response||response.status()!==200)throw new Error(`root returned ${response?.status()??'no response'}`);
  await page.waitForFunction(()=>Boolean(document.querySelector('nav,[role="navigation"]')),null,{timeout:30000});
  const registration=await page.evaluate(async()=>{
    const ready=await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('service worker ready timeout')),15000))
    ]);
    return {scope:ready.scope,activeScript:ready.active?.scriptURL||null};
  });
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:15000});
  const cacheKeys=await page.evaluate(()=>caches.keys());
  const staleCaches=cacheKeys.filter(key=>key!==expectedCache);
  const expectedCachePresent=cacheKeys.includes(expectedCache);
  if(!expectedCachePresent)throw new Error(`expected service-worker cache is missing: ${expectedCache}`);
  if(staleCaches.length)throw new Error(`stale service-worker caches remain: ${staleCaches.join(', ')}`);
  summary={release:'v16.1',baseURL,registration,expectedCache,cacheKeys,staleCaches,expectedCachePresent,passed:true};
  await context.close();
}catch(error){
  summary={release:'v16.1',baseURL,expectedCache,passed:false,error:error.stack||error.message||String(error)};
  process.exitCode=1;
}finally{
  await browser.close();
}
fs.writeFileSync(outputPath,`${JSON.stringify(summary,null,2)}\n`,'utf8');
console.log(`${summary.passed?'PASS':'FAIL'} KPCG service-worker cache retirement: ${path.relative(root,outputPath)}`);
