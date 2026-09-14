import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const artifactDir=path.join(root,'artifacts');
const baseURL=(process.env.KPCG_PREVIEW_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
const expectedCache='kpcg-kpcg-v17.0-theme-20260914';
const outputPath=path.join(artifactDir,'service-worker-cache-summary.json');
fs.mkdirSync(artifactDir,{recursive:true});

const browser=await chromium.launch({headless:true});
let summary;
try{
  const context=await browser.newContext({serviceWorkers:'allow'});
  const page=await context.newPage();
  const response=await page.goto(`${baseURL}/#/home`,{waitUntil:'domcontentloaded',timeout:30000});
  if(!response||response.status()!==200)throw new Error(`root returned ${response?.status()??'no response'}`);
  await page.waitForFunction(()=>document.documentElement.dataset.release==='v17.0'&&Boolean(document.querySelector('nav,[role="navigation"]')),null,{timeout:30000});
  const registration=await page.evaluate(async()=>{
    let reg=await navigator.serviceWorker.getRegistration('/');
    if(!reg)reg=await navigator.serviceWorker.register('/sw.js');
    const ready=await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('service worker ready timeout')),30000))
    ]);
    return {scope:ready.scope,activeScript:ready.active?.scriptURL||null,state:ready.active?.state||null};
  });
  if(!registration.activeScript?.endsWith('/sw.js')||registration.state!=='activated')throw new Error(`service worker is not activated: ${JSON.stringify(registration)}`);
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:15000});
  const cacheKeys=await page.evaluate(()=>caches.keys());
  const staleCaches=cacheKeys.filter(key=>key!==expectedCache);
  const expectedCachePresent=cacheKeys.includes(expectedCache);
  if(!expectedCachePresent)throw new Error(`expected service-worker cache is missing: ${expectedCache}`);
  if(staleCaches.length)throw new Error(`stale service-worker caches remain: ${staleCaches.join(', ')}`);
  const shell=await page.evaluate(async expected=>{
    const cache=await caches.open(expected);
    const keys=(await cache.keys()).map(r=>new URL(r.url).pathname);
    const required=['/','/manifest.webmanifest','/motion-system.css','/motion-system.js','/ip-guard.css','/ip-guard.js','/editorial-redesign-v3.js'];
    return {keys,missing:required.filter(path=>!keys.includes(path))};
  },expectedCache);
  if(shell.missing.length)throw new Error(`theme/motion shell assets missing from cache: ${shell.missing.join(', ')}`);
  summary={release:'v17.0',baseURL,registration,expectedCache,cacheKeys,staleCaches,expectedCachePresent,shell,passed:true};
  await context.close();
}catch(error){summary={release:'v17.0',baseURL,expectedCache,passed:false,error:error.stack||String(error)};process.exitCode=1;}finally{await browser.close();}
fs.writeFileSync(outputPath,JSON.stringify(summary,null,2)+'\n');
console.log(`${summary.passed?'PASS':'FAIL'} KPCG v17 service-worker cache retirement: ${path.relative(root,outputPath)}`);
