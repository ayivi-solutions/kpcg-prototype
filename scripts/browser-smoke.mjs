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
  '/assets/featured-locally-led-action.webp':'8f145f0bbd12e6ea704cbda20f985b5baf472eb6080d9a7fd8dc674e93ade2a3',
  '/assets/leader-governance.webp':'03545aa2952c229c29ca6f05b7a4a6146af4e4b53948d842233f9af1c908b170',
  '/assets/leader-programme.webp':'5563d21ea2b16c83368b8cc94581a7167c7523ce1f495af4f82dc8900e2a3e25',
  '/assets/leader-secretariat.webp':'87fc297f3ee3ccd9d6bbb2d1ac8cfaa743fc2d4e540ce0721d481b180afc0306',
  '/assets/media-01-county-dialogue.webp':'49beaca189cc3b07d9deca572d77b3dc1f41d91d630b178faeb2711469c5e4e0',
  '/assets/media-02-community-adaptation.webp':'2a4d45b8b8bc13e87afe69577d7c6adc1854983ebbb71768376e8c01fd16d4bc',
  '/assets/media-03-governance-interview.webp':'b9e6f6e3026deff096718cac6b18ce6431e15081facfad61fff40ed8f7ced2b2',
  '/assets/media-04-evidence-cover.webp':'3f3ec874832c5343a279103faea221d7e51b2ba6e05510c2486b615f687b23f5',
  '/assets/media-05-county-dialogue.webp':'dc14b3dc9ee8109c3eaf5d104dd80df3c08c84878d9f351daa28edaeacedb028',
  '/assets/media-06-community-adaptation.webp':'e6be1ca1dcf5172e20b7a9dbe97c5462ad0305a905dbb1ac7af9f3d8bf3cc541',
  '/assets/media-07-governance-interview.webp':'167c7660719de9d81fd258a3e78ad64d44cdfdd430d53fa517f3ca901bfed1d6',
  '/assets/media-08-evidence-cover.webp':'49f49217da20c8466d3ee4aa9f7c1c8ff5db8d09acf38536840b933f0bc32f58',
  '/assets/media-09-county-dialogue.webp':'1fd97c430fc26708cf9d0a89aa0d5f0a06e4a7f39039e37c57a76c999fd920b1',
  '/assets/media-10-community-adaptation.webp':'2940c76123a0565124039b32c22af10d15655202edcaf83543b9129d0f6455a4',
  '/assets/media-11-governance-interview.webp':'0ca6bf260cead485b9f254bdb1d0b0f35b3bd008018e28751b7fbab10a7f9388',
  '/assets/media-12-evidence-cover.webp':'3d72852d37d6b2a474924dc892739a6aff5576b34b9196934888f0218696e28e'
};
const representativeImages=[
  '/assets/featured-locally-led-action.webp',
  '/assets/leader-governance.webp',
  '/assets/media-01-county-dialogue.webp',
  '/assets/media-04-evidence-cover.webp'
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
  for(const marker of ['KPCGApplyExperiencePatchV16','patch-v16-02.txt?v=16','FETCH_TIMEOUT_MS']){
    if(!loader.includes(marker))throw new Error(`release bytes: loader missing ${marker}`);
  }

  const swResponse=await context.request.get(`${baseURL}/sw.js?qa=${Date.now()}`);
  if(swResponse.status()!==200)throw new Error(`release bytes: sw.js returned ${swResponse.status()}`);
  const swText=await swResponse.text();
  if(!swText.includes('kpcg-v16.1-20260912'))throw new Error('release bytes: live service worker is not v16.1-20260912');

  const fragments=[];
  for(const fragment of ['/app/patch-v16-01.txt?v=16','/app/patch-v16-02.txt?v=16']){
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

  return {rootStatus:rootResponse.status(),loaderMarkersValid:true,serviceWorkerRelease:'kpcg-v16.1-20260912',v16Fragments:fragments,assets};
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
      const v16Markers=['featured-locally-led-action.webp','leader-governance.webp','media-01-county-dialogue.webp','media-04-evidence-cover.webp'];
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
    if(!domChecks.hasV16Marker)throw new Error(`${profile.name}: v16 identifying asset markers missing`);

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
    if(imageResults.some(image=>!image.loaded))throw new Error(`${profile.name}: representative repaired image failed to load`);

    const reloadResponse=await page.reload({waitUntil:'domcontentloaded',timeout:30000});
    if(!reloadResponse||reloadResponse.status()!==200)throw new Error(`${profile.name}: hard refresh returned ${reloadResponse?.status()??'no response'}`);
    await waitForApplication(page);
    const serviceWorkerControlledSecondVisit=await page.evaluate(()=>Boolean(navigator.serviceWorker?.controller));
    if(!serviceWorkerControlledSecondVisit)throw new Error(`${profile.name}: second visit is not controlled by the service worker`);

    const routeCandidates=domChecks.hashRoutes.filter(route=>route!=='#/home').slice(0,4);
    const testedRoutes=['#/home'];
    for(const route of routeCandidates){
      const routeResponse=await page.goto(`${baseURL}/${route}`,{waitUntil:'domcontentloaded',timeout:30000});
      if(!routeResponse||routeResponse.status()!==200)throw new Error(`${profile.name}: route ${route} returned ${routeResponse?.status()??'no response'}`);
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

const summary={release:'v16.1',mode:productionMode?'production':'preview',commitSha,baseURL,generatedAt:new Date().toISOString(),releaseEvidence,desktopPassed:results.some(result=>result.profile==='desktop'&&result.passed),mobilePassed:results.some(result=>result.profile==='mobile'&&result.passed),passed:!failed&&results.every(result=>result.passed),results};
fs.writeFileSync(outputPath,`${JSON.stringify(summary,null,2)}\n`,'utf8');
if(!summary.passed){
  console.error(`KPCG ${productionMode?'production ':' '}browser smoke failed; see ${path.relative(root,outputPath)}`);
  process.exitCode=1;
}else{
  console.log(`PASS KPCG ${productionMode?'production ':' '}browser smoke: desktop + mobile; ${path.relative(root,outputPath)}`);
}
