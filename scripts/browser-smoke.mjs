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
const expectedRelease='v18.0';
const expectedSW='kpcg-v18.2-theme-20260914';
const firstHero='/assets/kpcg_images_v1/470222578_552600794423862_3455318813895875629_n.jpg';
const sectionIds=['home','about','where-we-work','themes','programmes','policy','knowledge','news','events','multimedia','membership','opportunities','engage'];
const profiles=[{name:'desktop',viewport:{width:1440,height:900}},{name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}];
const releaseCritical=/\/(?:assets\/|manifest\.webmanifest(?:\?|$)|sw\.js(?:\?|$)|ip-guard\.(?:css|js)(?:\?|$)|legacy\.html(?:\?|$))/;

fs.mkdirSync(artifactDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
let releaseEvidence;
let failed=false;

const verifySource=async context=>{
  const response=await context.request.get(`${baseURL}/?qa=${Date.now()}`);
  if(response.status()!==200)throw new Error(`root returned ${response.status()}`);
  const source=await response.text();
  for(const marker of ['data-release="v18.0"','Climate governance that connects people, evidence and action.','property="og:image"','class="section-rail"','id="where-we-work"','id="engage"','/legacy.html#/cms/login']){
    if(!source.includes(marker))throw new Error(`v18 root source missing ${marker}`);
  }
  const legacy=await context.request.get(`${baseURL}/legacy.html?qa=${Date.now()}`);
  const legacySource=await legacy.text();
  if(legacy.status()!==200||!legacySource.includes('data-release="v17.0"')||!legacySource.includes('data-prerendered-home'))throw new Error('preserved v17 fallback is unavailable or invalid');
  const swResponse=await context.request.get(`${baseURL}/sw.js?qa=${Date.now()}`);
  const swText=await swResponse.text();
  if(swResponse.status()!==200||!swText.includes(`const RELEASE='${expectedSW}'`))throw new Error('live service worker release mismatch');
  const heroResponse=await context.request.get(`${baseURL}${firstHero}?qa=${Date.now()}`);
  const heroBytes=(await heroResponse.body()).length;
  if(heroResponse.status()!==200||heroBytes<40000)throw new Error(`first hero unavailable or too small: ${heroResponse.status()} / ${heroBytes}`);
  const guardResponses=await Promise.all(['css','js'].map(ext=>context.request.get(`${baseURL}/ip-guard.${ext}?qa=${Date.now()}`)));
  if(guardResponses.some(item=>item.status()!==200))throw new Error('site-wide theme/guard assets unavailable');
  return {rootStatus:response.status(),legacyStatus:legacy.status(),sourceVisibleContent:true,release:expectedRelease,legacyRelease:'v17.0',serviceWorkerRelease:expectedSW,guardAssets:guardResponses.map(item=>item.status()),firstHero:{path:firstHero,status:heroResponse.status(),bytes:heroBytes}};
};

const verifyBrowserCancelledAssets=async(context,failedRequests)=>{
  const verifiedAbortedRequests=[];const unresolvedFailedRequests=[];
  for(const failure of failedRequests){let verified=false;if(failure.error==='net::ERR_ABORTED'){try{const failedURL=new URL(failure.url);if(failedURL.origin===baseURL&&failedURL.pathname.startsWith('/assets/')){failedURL.searchParams.set('qa_abort_verify',String(Date.now()));const check=await context.request.get(failedURL.toString());const body=await check.body();const contentType=(check.headers()['content-type']||'').toLowerCase();if(check.status()===200&&body.length>=40000&&contentType.startsWith('image/')){verifiedAbortedRequests.push({...failure,verifiedStatus:check.status(),verifiedBytes:body.length,verifiedContentType:contentType});verified=true;}}}catch{}}if(!verified)unresolvedFailedRequests.push(failure);}
  return {verifiedAbortedRequests,unresolvedFailedRequests};
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

    const response=await page.goto(`${baseURL}/#home`,{waitUntil:'domcontentloaded',timeout:30000});
    if(!response||response.status()!==200)throw new Error(`${profile.name}: root ${response?.status()??'no response'}`);
    await page.waitForFunction(ids=>document.documentElement.dataset.release==='v18.0'&&ids.every(id=>Boolean(document.getElementById(id)))&&Boolean(document.querySelector('.kpcg-theme-toggle')),sectionIds,{timeout:30000});
    await page.waitForFunction(()=>document.querySelectorAll('#countyCloud a').length===47&&document.querySelectorAll('#themeList .theme-row').length===10&&document.querySelectorAll('#programmeStack .programme').length===8,null,{timeout:15000});

    const home=await page.evaluate(ids=>({
      hash:location.hash,
      release:document.documentElement.dataset.release||null,
      identity:/Kenya Platform for Climate Governance/i.test(document.body.innerText||''),
      sections:ids.filter(id=>Boolean(document.getElementById(id))).length,
      sectionRailLinks:document.querySelectorAll('.section-rail a[href^="#"]').length,
      topLevelPageRoutes:[...document.querySelectorAll('.section-rail a')].filter(a=>(a.getAttribute('href')||'').startsWith('/#/')).length,
      scrollHeight:document.documentElement.scrollHeight,
      viewportHeight:innerHeight,
      counties:document.querySelectorAll('#countyCloud a').length,
      themes:document.querySelectorAll('#themeList .theme-row').length,
      programmes:document.querySelectorAll('#programmeStack .programme').length,
      progress:Boolean(document.getElementById('scrollProgress')),
      themeToggle:Boolean(document.querySelector('.kpcg-theme-toggle'))
    }),sectionIds);
    if(home.release!==expectedRelease||!home.identity||home.sections!==sectionIds.length||home.sectionRailLinks<sectionIds.length||home.topLevelPageRoutes!==0||home.scrollHeight<home.viewportHeight*6||home.counties!==47||home.themes!==10||home.programmes!==8||!home.progress||!home.themeToggle)throw new Error(`${profile.name}: continuous-root contract failed ${JSON.stringify(home)}`);

    await page.locator('.section-rail a[href="#about"]').click();
    await page.waitForFunction(()=>location.hash==='#about'&&document.getElementById('about')?.getBoundingClientRect().top<180,null,{timeout:12000});
    const aboutJump=await page.evaluate(()=>({hash:location.hash,top:Math.round(document.getElementById('about').getBoundingClientRect().top),active:document.querySelector('.section-rail a.active')?.getAttribute('href')||''}));
    if(aboutJump.hash!=='#about'||aboutJump.top>180)throw new Error(`${profile.name}: anchor jump failed ${JSON.stringify(aboutJump)}`);

    await page.evaluate(()=>document.getElementById('knowledge')?.scrollIntoView({behavior:'auto'}));
    await page.waitForFunction(()=>location.hash==='#knowledge',null,{timeout:12000});
    const scrollSpy=await page.evaluate(()=>({hash:location.hash,active:document.querySelector('.section-rail a.active')?.getAttribute('href')||'',progress:parseFloat(document.getElementById('scrollProgress').style.width)||0}));
    if(scrollSpy.hash!=='#knowledge'||scrollSpy.active!=='#knowledge'||scrollSpy.progress<=0)throw new Error(`${profile.name}: scroll-spy/progress failed ${JSON.stringify(scrollSpy)}`);

    await page.evaluate(()=>document.getElementById('where-we-work')?.scrollIntoView({behavior:'auto'}));
    await page.locator('#regionTabs button[data-region="Coast"]').click();
    await page.waitForFunction(()=>document.querySelectorAll('#countyCloud a').length===6,null,{timeout:5000});
    const countyFilter=await page.evaluate(()=>({count:document.querySelectorAll('#countyCloud a').length,href:document.querySelector('#countyCloud a')?.getAttribute('href')||''}));
    if(countyFilter.count!==6||!countyFilter.href.startsWith('/legacy.html#/county/'))throw new Error(`${profile.name}: county region filter/detail handoff failed ${JSON.stringify(countyFilter)}`);

    await page.locator('#menuToggle').click();
    await page.waitForFunction(()=>document.getElementById('menuDialog')?.open===true,null,{timeout:5000});
    await page.locator('#menuClose').click();
    await page.waitForFunction(()=>document.getElementById('menuDialog')?.open===false,null,{timeout:5000});

    // Backwards compatibility: old top-level hashes become section anchors.
    const compat=await context.newPage();
    await compat.goto(`${baseURL}/#/about`,{waitUntil:'domcontentloaded',timeout:30000});
    await compat.waitForFunction(()=>location.hash==='#about'&&document.documentElement.dataset.release==='v18.0',null,{timeout:12000});
    const compatState=await compat.evaluate(()=>({path:location.pathname,hash:location.hash,about:Boolean(document.getElementById('about'))}));
    if(compatState.path!=='/'||compatState.hash!=='#about'||!compatState.about)throw new Error(`${profile.name}: old top-level route compatibility failed ${JSON.stringify(compatState)}`);
    await compat.close();

    // Detailed routes must remain operational through the preserved v17 application.
    const detail=await context.newPage();
    await detail.goto(`${baseURL}/#/article/article-1`,{waitUntil:'domcontentloaded',timeout:30000});
    await detail.waitForFunction(()=>location.pathname==='/legacy.html'&&location.hash==='#/article/article-1'&&document.documentElement.dataset.release==='v17.0',null,{timeout:18000});
    const detailState=await detail.evaluate(()=>({path:location.pathname,hash:location.hash,release:document.documentElement.dataset.release,body:(document.body.innerText||'').slice(0,500)}));
    if(detailState.release!=='v17.0'||detailState.path!=='/legacy.html')throw new Error(`${profile.name}: detailed-record fallback failed ${JSON.stringify(detailState)}`);
    await detail.close();

    const manifestResponse=await context.request.get(`${baseURL}/manifest.webmanifest`);
    const manifest=await manifestResponse.json();
    if(manifestResponse.status()!==200||manifest.start_url!=='/#home')throw new Error(`${profile.name}: manifest invalid`);
    const sw=await page.evaluate(async()=>{if(!('serviceWorker' in navigator))throw new Error('Service worker API unavailable');let reg=await navigator.serviceWorker.getRegistration('/');if(!reg)reg=await navigator.serviceWorker.register('/sw.js');const ready=await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('SW timeout')),30000))]);return {scope:ready.scope,active:ready.active?.scriptURL||null,state:ready.active?.state||null};});
    if(!sw.active?.endsWith('/sw.js')||sw.state!=='activated')throw new Error(`${profile.name}: service worker not active ${JSON.stringify(sw)}`);

    await page.goto(`${baseURL}/#home`,{waitUntil:'domcontentloaded',timeout:30000});
    await page.reload({waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:18000});
    await page.screenshot({path:path.join(artifactDir,`${productionMode?'production-':''}continuous-${profile.name}.png`),fullPage:true});

    const {verifiedAbortedRequests,unresolvedFailedRequests}=await verifyBrowserCancelledAssets(context,failedRequests);
    const timing=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return n?{domContentLoaded:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),transferSize:n.transferSize||0}:null;});
    if(pageErrors.length||unresolvedFailedRequests.length||badResponses.length)throw new Error(`${profile.name}: browser errors ${JSON.stringify({pageErrors,failedRequests:unresolvedFailedRequests,verifiedAbortedRequests,badResponses})}`);
    results.push({profile:profile.name,viewport:profile.viewport,httpStatus:response.status(),home,aboutJump,scrollSpy,countyFilter,compatState,detailState:{path:detailState.path,hash:detailState.hash,release:detailState.release},manifest:{startUrl:manifest.start_url},serviceWorker:sw,timing,pageErrors,failedRequests:unresolvedFailedRequests,verifiedAbortedRequests,badResponses,passed:true});
    await context.close();
  }
}catch(error){failed=true;results.push({passed:false,error:error.stack||String(error)});}finally{await browser.close();}

const summary={release:expectedRelease,legacyRelease:'v17.0',mode:productionMode?'production':'preview',commitSha,baseURL,generatedAt:new Date().toISOString(),releaseEvidence,desktopPassed:results.some(x=>x.profile==='desktop'&&x.passed),mobilePassed:results.some(x=>x.profile==='mobile'&&x.passed),passed:!failed&&results.every(x=>x.passed),results};
fs.writeFileSync(outputPath,JSON.stringify(summary,null,2)+'\n');
if(!summary.passed){console.error(`KPCG ${expectedRelease} browser smoke failed; see ${path.relative(root,outputPath)}`);process.exitCode=1}else console.log(`PASS KPCG ${expectedRelease} browser smoke: desktop + mobile continuous journey + old-route compatibility + v17 detailed-record fallback.`);