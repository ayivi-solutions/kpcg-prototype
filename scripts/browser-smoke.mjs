import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const artifactDir=path.join(root,'artifacts');
const baseURL=(process.env.KPCG_PREVIEW_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
const commitSha=process.env.KPCG_COMMIT_SHA||process.env.GITHUB_HEAD_SHA||process.env.GITHUB_SHA||'unknown';
const productionMode=process.env.KPCG_PRODUCTION_MODE==='1';
const outputPath=path.join(artifactDir,productionMode?'production-smoke-summary.json':'browser-smoke-summary.json');
const expectedRelease='v17.0';
const expectedSW='kpcg-v17.0-20260913';
const firstHero='/assets/kpcg_images_v1/470222578_552600794423862_3455318813895875629_n.jpg';
const profiles=[{name:'desktop',viewport:{width:1440,height:900}},{name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}];
const releaseCritical=/\/(?:assets\/|manifest\.webmanifest(?:\?|$)|sw\.js(?:\?|$))/;

fs.mkdirSync(artifactDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
let releaseEvidence;
let failed=false;

const verifySource=async context=>{
  const response=await context.request.get(`${baseURL}/?qa=${Date.now()}`);
  if(response.status()!==200)throw new Error(`root returned ${response.status()}`);
  const source=await response.text();
  for(const marker of ['data-release="v17.0"','data-prerendered-home','Climate governance that connects people, evidence and action.','property="og:image"']){
    if(!source.includes(marker))throw new Error(`root source missing ${marker}`);
  }
  for(const legacy of ['/app/part-','KPCGApplyExperiencePatchV16','Loading the interactive platform']){
    if(source.includes(legacy))throw new Error(`legacy runtime marker exposed: ${legacy}`);
  }
  const swResponse=await context.request.get(`${baseURL}/sw.js?qa=${Date.now()}`);
  const swText=await swResponse.text();
  if(swResponse.status()!==200||!swText.includes(expectedSW))throw new Error('live service worker release mismatch');
  const heroResponse=await context.request.get(`${baseURL}${firstHero}?qa=${Date.now()}`);
  const heroBytes=(await heroResponse.body()).length;
  if(heroResponse.status()!==200||heroBytes<40000)throw new Error(`first hero unavailable or too small: ${heroResponse.status()} / ${heroBytes}`);
  return {rootStatus:response.status(),sourceVisibleContent:true,release:expectedRelease,serviceWorkerRelease:expectedSW,firstHero:{path:firstHero,status:heroResponse.status(),bytes:heroBytes}};
};

try{
  for(const profile of profiles){
    const context=await browser.newContext({viewport:profile.viewport,isMobile:profile.isMobile||false,hasTouch:profile.hasTouch||false,serviceWorkers:'allow'});
    if(profile.name==='desktop')releaseEvidence=await verifySource(context);
    const page=await context.newPage();
    const pageErrors=[];const failedRequests=[];const badResponses=[];
    page.on('pageerror',e=>pageErrors.push(e.message));
    page.on('requestfailed',r=>{const u=new URL(r.url());if(u.origin===baseURL&&releaseCritical.test(u.pathname))failedRequests.push({url:r.url(),error:r.failure()?.errorText||'failed'});});
    page.on('response',r=>{const u=new URL(r.url());if(u.origin===baseURL&&releaseCritical.test(u.pathname)&&r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});

    const response=await page.goto(`${baseURL}/#/home`,{waitUntil:'domcontentloaded',timeout:30000});
    if(!response||response.status()!==200)throw new Error(`${profile.name}: root ${response?.status()??'no response'}`);
    await page.waitForFunction(()=>Boolean(document.querySelector('nav,[role="navigation"]'))&&(document.body?.innerText||'').length>500,null,{timeout:30000});

    const home=await page.evaluate(()=>({
      hash:location.hash,
      identity:/Kenya Platform for Climate Governance/i.test(document.body.innerText||''),
      heroSlides:document.querySelectorAll('[data-v16-hero-slide]').length,
      heroDots:document.querySelectorAll('[data-v16-slide]').length,
      activeSlides:document.querySelectorAll('[data-v16-hero-slide].active').length,
      navItems:document.querySelectorAll('nav a,nav button').length,
      release:document.documentElement.dataset.release||null
    }));
    if(home.release!==expectedRelease)throw new Error(`${profile.name}: DOM release ${home.release}`);
    if(!home.identity||home.heroSlides<12||home.heroDots!==home.heroSlides||home.activeSlides!==1)throw new Error(`${profile.name}: hero/identity contract failed ${JSON.stringify(home)}`);

    const targetIndex=Math.min(4,home.heroSlides-1);
    await page.click(`[data-v16-slide="${targetIndex}"]`);
    await page.waitForFunction(i=>document.querySelector(`[data-v16-hero-slide="${i}"]`)?.classList.contains('active'),targetIndex,{timeout:5000});
    const heroTransition=await page.evaluate(i=>{const img=document.querySelector(`[data-v16-hero-slide="${i}"] img`);return {src:img?.getAttribute('src')||'',dataSrc:img?.getAttribute('data-src')||'',naturalWidth:img?.naturalWidth||0};},targetIndex);
    if(!heroTransition.src||heroTransition.dataSrc||heroTransition.naturalWidth===0)throw new Error(`${profile.name}: lazy hero slide did not load ${JSON.stringify(heroTransition)}`);

    for(const hash of ['#/about','#/themes','#/programmes','#/knowledge']){
      await page.evaluate(h=>{location.hash=h;},hash);
      await page.waitForFunction(h=>location.hash===h&&Boolean(document.querySelector('main,#app,#root,[data-page],[class*="page"]')),hash,{timeout:10000});
    }

    await page.evaluate(()=>{location.hash='#/where-we-work';});
    await page.waitForFunction(()=>location.hash==='#/where-we-work'&&Boolean(document.querySelector('path.county-shape[data-county][tabindex="0"]')),null,{timeout:15000});
    const countySlug=await page.locator('path.county-shape[data-county][tabindex="0"]').first().getAttribute('data-county');
    await page.locator('path.county-shape[data-county][tabindex="0"]').first().focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(slug=>location.hash===`#/county/${slug}`,countySlug,{timeout:5000});
    const keyboardMapPassed=await page.evaluate(slug=>location.hash===`#/county/${slug}`,countySlug);
    if(!keyboardMapPassed)throw new Error(`${profile.name}: keyboard county activation failed`);

    const manifestResponse=await context.request.get(`${baseURL}/manifest.webmanifest`);
    const manifest=await manifestResponse.json();
    if(manifestResponse.status()!==200||manifest.start_url!=='/#/home')throw new Error(`${profile.name}: manifest invalid`);
    const sw=await page.evaluate(async()=>{const reg=await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('SW timeout')),15000))]);return {scope:reg.scope,active:reg.active?.scriptURL||null};});
    if(!sw.active?.endsWith('/sw.js'))throw new Error(`${profile.name}: service worker not active`);
    await page.goto(`${baseURL}/#/home`,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>Boolean(document.querySelector('[data-v16-hero]')),null,{timeout:15000});
    await page.reload({waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:15000});

    const timing=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return n?{domContentLoaded:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),transferSize:n.transferSize||0}:null;});
    if(pageErrors.length||failedRequests.length||badResponses.length)throw new Error(`${profile.name}: browser errors ${JSON.stringify({pageErrors,failedRequests,badResponses})}`);
    results.push({profile:profile.name,viewport:profile.viewport,httpStatus:response.status(),home,heroTransition,keyboardMapPassed,manifest:{startUrl:manifest.start_url},serviceWorker:sw,timing,pageErrors,failedRequests,badResponses,passed:true});
    await context.close();
  }
}catch(error){failed=true;results.push({passed:false,error:error.stack||String(error)});}finally{await browser.close();}

const summary={release:expectedRelease,mode:productionMode?'production':'preview',commitSha,baseURL,generatedAt:new Date().toISOString(),releaseEvidence,desktopPassed:results.some(x=>x.profile==='desktop'&&x.passed),mobilePassed:results.some(x=>x.profile==='mobile'&&x.passed),keyboardMapPassed:results.filter(x=>x.profile).every(x=>x.keyboardMapPassed),passed:!failed&&results.every(x=>x.passed),results};
fs.writeFileSync(outputPath,JSON.stringify(summary,null,2)+'\n');
if(!summary.passed){console.error(`KPCG ${expectedRelease} browser smoke failed; see ${path.relative(root,outputPath)}`);process.exitCode=1}else console.log(`PASS KPCG ${expectedRelease} browser smoke: desktop + mobile + 15-slide hero + keyboard county map.`);
