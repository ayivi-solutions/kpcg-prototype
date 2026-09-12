import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
const releaseCritical=/\/(?:app\/|assets\/|manifest\.webmanifest(?:\?|$)|sw\.js(?:\?|$))/;
const assetQualityFloorBytes=40000;
const expectedAssets={
  '/assets/leader-governance.webp':'03545aa2952c229c29ca6f05b7a4a6146af4e4b53948d842233f9af1c908b170',
  '/assets/leader-programme.webp':'5563d21ea2b16c83368b8cc94581a7167c7523ce1f495af4f82dc8900e2a3e25',
  '/assets/leader-secretariat.webp':'87fc297f3ee3ccd9d6bbb2d1ac8cfaa743fc2d4e540ce0721d481b180afc0306',
  '/assets/real/featured-community-tree-action.jpg':'1cef51ee7cf36c4e8b06c85c79b55d54b9fe9c7b62369148cab6dfbfc38ffb4a',
  '/assets/real/county-dialogue-community.jpg':'7350285813dcc19829fe2a857842a6c969e4923bd79824fe688b616fa0ddadbd',
  '/assets/real/community-tree-planting.jpg':'3b79f06e15e9ad4752981b72d964b754cc00013179d048d0e6ce9cbe0e9a13fc',
  '/assets/real/media-interview-kpcg-01.jpg':'2bad040b08d3ea4d4c7fb1c5ba4edee95433d90501eba1e0d07790bccb69c6d5',
  '/assets/real/ccde-action-plan.jpg':'b822fc84aa933cd7890ffe2c5e708aa2ae8be1f3293456948f844375eaaafecd',
  '/assets/real/community-consultation.jpg':'3ae7168c6e6909cc884144cd43f3403fd2fb862a86c931cf7b30da763388d44e',
  '/assets/real/tree-planting-community.jpg':'ac5694c3033d3eb38249e11a85252a5960263804f82e37f60fc13d7fdc4effe3',
  '/assets/real/media-interview-kpcg-02.jpg':'fb94f8dd06b5614b46b1af13ba80cbb68f513c791431abdaa067f573b92eb073',
  '/assets/real/climate-finance-tracking.jpg':'4030cfd6f1e84cd63cd9712411e58e193b8a1977629d0267b580efebcf2b827c',
  '/assets/real/stakeholder-workshop.jpg':'6dfda1a6c460292cdc686af5c5a73ded19ee83a6768fda51c158f921a39f27b8',
  '/assets/real/school-seedlings.jpg':'e3a800cc0d80c8961e48b0131bee42a43d4d9cf3bb52a41c92ee4006029501cf',
  '/assets/real/media-interview-tv.jpg':'86536a979525034e5bbe5ee4ed05c745a0d8f569e994bb0ed173d0074c59a835',
  '/assets/real/indigenous-climate-study.jpg':'6a82c36a0c0589906c0b6a0018f540b402b9f9b96934f40f965aa6a52591c4b1'
};
const representativeImages=[
  '/assets/real/featured-community-tree-action.jpg',
  '/assets/leader-governance.webp',
  '/assets/real/county-dialogue-community.jpg',
  '/assets/real/ccde-action-plan.jpg'
];
const profiles=[
  {name:'desktop',viewport:{width:1440,height:900},isMobile:false},
  {name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}
];

const waitForApplication=page=>page.waitForFunction(()=>{
  const text=(document.body?.innerText||'').trim();
  const nav=document.querySelector('nav,[role="navigation"]');
  return text.length>500&&nav&&!/Loading the interactive platform/i.test(text);
},null,{timeout:30000});

const verifyReleaseBytes=async context=>{
  const rootResponse=await context.request.get(`${baseURL}/`);
  if(rootResponse.status()!==200)throw new Error(`release bytes: root returned ${rootResponse.status()}`);
  const loader=await rootResponse.text();
  for(const marker of ['KPCGApplyExperiencePatchV16','KPCGApplyRealImageryV162','patch-v16-2-real-imagery.txt?v=162','FETCH_TIMEOUT_MS']){
    if(!loader.includes(marker))throw new Error(`release bytes: loader missing ${marker}`);
  }

  const swResponse=await context.request.get(`${baseURL}/sw.js?qa=${Date.now()}`);
  if(swResponse.status()!==200)throw new Error(`release bytes: sw.js returned ${swResponse.status()}`);
  const swText=await swResponse.text();
  if(!swText.includes('kpcg-v16.2-20260912'))throw new Error('release bytes: live service worker is not v16.2-20260912');

  const fragments=[];
  for(const fragment of ['/app/patch-v16-01.txt?v=16','/app/patch-v16-02.txt?v=16','/app/patch-v16-2-real-imagery.txt?v=162']){
    const response=await context.request.get(`${baseURL}${fragment}`);
    const body=await response.body();
    if(response.status()!==200||body.length===0)throw new Error(`release bytes: ${fragment} is unavailable`);
    fragments.push({path:fragment,status:response.status(),bytes:body.length});
  }

  const assets=[];
  for(const [assetPath,expectedSha256] of Object.entries(expectedAssets)){
    const response=await context.request.get(`${baseURL}${assetPath}?qa=${Date.now()}`);
    const body=await response.body();
    const sha256=crypto.createHash('sha256').update(body).digest('hex');
    const passed=response.status()===200&&body.length>=assetQualityFloorBytes&&sha256===expectedSha256;
    assets.push({path:assetPath,status:response.status(),bytes:body.length,sha256,expectedSha256,passed});
    if(!passed)throw new Error(`release bytes: ${assetPath} failed size/checksum validation (${response.status()}, ${body.length} bytes, ${sha256})`);
  }

  return {rootStatus:rootResponse.status(),loaderMarkersValid:true,serviceWorkerRelease:'kpcg-v16.2-20260912',v16Fragments:fragments,assets};
};

fs.mkdirSync(artifactDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
let failed=false;
let releaseEvidence=null;

try{
  for(const profile of profiles){
    const context=await browser.newContext({viewport:profile.viewport,isMobile:profile.isMobile,hasTouch:profile.hasTouch??false,serviceWorkers:'allow'});
    if(profile.name==='desktop')releaseEvidence=await verifyReleaseBytes(context);
    const page=await context.newPage();
    const pageErrors=[];
    const failedRequests=[];
    const badResponses=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    page.on('requestfailed',request=>{
      const url=new URL(request.url());
      if(url.origin===baseURL&&releaseCritical.test(url.pathname))failedRequests.push({url:request.url(),error:request.failure()?.errorText||'request failed'});
    });
    page.on('response',response=>{
      const url=new URL(response.url());
      if(url.origin===baseURL&&releaseCritical.test(url.pathname)&&response.status()>=400)badResponses.push({url:response.url(),status:response.status()});
    });

    const response=await page.goto(`${baseURL}/#/home`,{waitUntil:'domcontentloaded',timeout:30000});
    if(!response||response.status()!==200)throw new Error(`${profile.name}: root returned ${response?.status()??'no response'}`);
    await waitForApplication(page);

    const domChecks=await page.evaluate(()=>{
      const html=document.documentElement.outerHTML;
      const text=(document.body?.innerText||'').trim();
      const nav=document.querySelector('nav,[role="navigation"]');
      const main=document.querySelector('main,#app,#root,[data-page],[class*="shell"],[class*="page"]');
      const v16Markers=['featured-community-tree-action.jpg','leader-governance.webp','county-dialogue-community.jpg','ccde-action-plan.jpg'];
      return {
        bodyTextLength:text.length,
        hasIdentity:/KPCG|Kenya Platform for Climate Governance/i.test(`${text}\n${html}`),
        hasPrimaryNavigation:Boolean(nav),
        navigationItems:nav?nav.querySelectorAll('a,button,[role="link"],[role="button"]').length:0,
        hasMainShell:Boolean(main),
        hasV16Marker:v16Markers.some(marker=>html.includes(marker)),
        currentHash:location.hash,
        hashRoutes:[...new Set([...document.querySelectorAll('a[href^="#/"]')].map(link=>link.getAttribute('href')).filter(Boolean))]
      };
    });
    if(domChecks.currentHash!=='#/home'&&!domChecks.currentHash.startsWith('#/home?'))throw new Error(`${profile.name}: #/home did not remain active (${domChecks.currentHash})`);
    if(!domChecks.hasIdentity)throw new Error(`${profile.name}: KPCG identity missing after loader reconstruction`);
    if(!domChecks.hasPrimaryNavigation||domChecks.navigationItems<2)throw new Error(`${profile.name}: primary navigation did not render`);
    if(!domChecks.hasMainShell)throw new Error(`${profile.name}: main content shell missing`);
    if(!domChecks.hasV16Marker)throw new Error(`${profile.name}: v16.2 identifying asset markers missing`);

    const manifestResponse=await context.request.get(`${baseURL}/manifest.webmanifest`);
    if(manifestResponse.status()!==200)throw new Error(`${profile.name}: manifest returned ${manifestResponse.status()}`);
    const manifest=await manifestResponse.json();
    if(manifest.start_url!=='/#/home')throw new Error(`${profile.name}: manifest start_url is ${manifest.start_url}`);

    const sw=await page.evaluate(async()=>{
      if(!('serviceWorker' in navigator))return {supported:false};
      const registration=await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_,reject)=>setTimeout(()=>reject(new Error('service worker ready timeout')),15000))
      ]);
      return {
        supported:true,
        scope:registration.scope,
        activeScript:registration.active?.scriptURL||null,
        installingScript:registration.installing?.scriptURL||null,
        waitingScript:registration.waiting?.scriptURL||null
      };
    });
    if(!sw.supported||![sw.activeScript,sw.installingScript,sw.waitingScript].filter(Boolean).some(url=>url.endsWith('/sw.js')))throw new Error(`${profile.name}: service worker did not register /sw.js`);

    const imageResults=await page.evaluate(async paths=>Promise.all(paths.map(path=>new Promise(resolve=>{
      const image=new Image();
      image.onload=()=>resolve({path,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,loaded:image.naturalWidth>0});
      image.onerror=()=>resolve({path,naturalWidth:0,naturalHeight:0,loaded:false});
      image.src=`${path}?qa=${Date.now()}`;
    }))),representativeImages);
    if(imageResults.some(image=>!image.loaded))throw new Error(`${profile.name}: representative KPCG image failed to load`);

    const reloadResponse=await page.reload({waitUntil:'domcontentloaded',timeout:30000});
    if(!reloadResponse||reloadResponse.status()!==200)throw new Error(`${profile.name}: hard refresh returned ${reloadResponse?.status()??'no response'}`);
    await waitForApplication(page);
    const serviceWorkerControlledSecondVisit=await page.evaluate(()=>Boolean(navigator.serviceWorker?.controller));
    if(!serviceWorkerControlledSecondVisit)throw new Error(`${profile.name}: second visit is not controlled by the service worker`);

    const routeCandidates=domChecks.hashRoutes.filter(route=>route!=='#/home').slice(0,4);
    const testedRoutes=['#/home'];
    for(const route of routeCandidates){
      await page.evaluate(targetHash=>{location.hash=targetHash;},route);
      await page.waitForFunction(expectedHash=>location.hash===expectedHash,route,{timeout:5000});
      await page.waitForFunction(()=>Boolean(document.querySelector('main,#app,#root,[data-page],[class*="shell"],[class*="page"]'))&&(document.body?.innerText||'').trim().length>100,null,{timeout:15000});
      testedRoutes.push(route);
    }

    await page.waitForTimeout(500);
    if(pageErrors.length)throw new Error(`${profile.name}: uncaught page errors: ${pageErrors.join(' | ')}`);
    if(failedRequests.length)throw new Error(`${profile.name}: failed release-critical requests: ${JSON.stringify(failedRequests)}`);
    if(badResponses.length)throw new Error(`${profile.name}: release-critical HTTP errors: ${JSON.stringify(badResponses)}`);

    results.push({profile:profile.name,viewport:profile.viewport,httpStatus:response.status(),...domChecks,manifest:{reachable:true,startUrl:manifest.start_url},serviceWorker:sw,hardRefreshPassed:true,serviceWorkerControlledSecondVisit,testedRoutes,representativeImages:imageResults,pageErrors,failedRequests,badResponses,passed:true});
    await context.close();
  }
}catch(error){
  failed=true;
  results.push({passed:false,error:error.stack||error.message||String(error)});
}finally{
  await browser.close();
}

const summary={release:'v16.2',mode:productionMode?'production':'preview',commitSha,baseURL,generatedAt:new Date().toISOString(),releaseEvidence,desktopPassed:results.some(result=>result.profile==='desktop'&&result.passed),mobilePassed:results.some(result=>result.profile==='mobile'&&result.passed),passed:!failed&&results.every(result=>result.passed),results};
fs.writeFileSync(outputPath,`${JSON.stringify(summary,null,2)}\n`,'utf8');
if(!summary.passed){
  console.error(`KPCG ${productionMode?'production ':' '}browser smoke failed; see ${path.relative(root,outputPath)}`);
  process.exitCode=1;
}else{
  console.log(`PASS KPCG ${productionMode?'production ':' '}browser smoke: desktop + mobile; ${path.relative(root,outputPath)}`);
}
