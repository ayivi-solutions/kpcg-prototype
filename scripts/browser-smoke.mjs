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
const outputPath=path.join(artifactDir,'browser-smoke-summary.json');
const releaseCritical=/\/(?:app\/|assets\/|manifest\.webmanifest(?:\?|$)|sw\.js(?:\?|$))/;
const repairedImages=[
  '/assets/featured-locally-led-action.webp',
  '/assets/leader-governance.webp',
  '/assets/media-01-county-dialogue.webp',
  '/assets/media-04-evidence-cover.webp'
];
const profiles=[
  {name:'desktop',viewport:{width:1440,height:900},isMobile:false},
  {name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}
];

fs.mkdirSync(artifactDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
let failed=false;

try{
  for(const profile of profiles){
    const context=await browser.newContext({viewport:profile.viewport,isMobile:profile.isMobile,hasTouch:profile.hasTouch??false,serviceWorkers:'allow'});
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

    await page.waitForFunction(()=>{
      const text=(document.body?.innerText||'').trim();
      const nav=document.querySelector('nav,[role="navigation"]');
      return text.length>500&&nav&&!/Loading the interactive platform/i.test(text);
    },null,{timeout:30000});

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
        currentHash:location.hash
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
    }))),repairedImages);
    if(imageResults.some(image=>!image.loaded))throw new Error(`${profile.name}: representative repaired image failed to load`);

    await page.waitForTimeout(500);
    if(pageErrors.length)throw new Error(`${profile.name}: uncaught page errors: ${pageErrors.join(' | ')}`);
    if(failedRequests.length)throw new Error(`${profile.name}: failed release-critical requests: ${JSON.stringify(failedRequests)}`);
    if(badResponses.length)throw new Error(`${profile.name}: release-critical HTTP errors: ${JSON.stringify(badResponses)}`);

    results.push({profile:profile.name,viewport:profile.viewport,httpStatus:response.status(),...domChecks,manifest:{reachable:true,startUrl:manifest.start_url},serviceWorker:sw,representativeImages:imageResults,pageErrors,failedRequests,badResponses,passed:true});
    await context.close();
  }
}catch(error){
  failed=true;
  results.push({passed:false,error:error.stack||error.message||String(error)});
}finally{
  await browser.close();
}

const summary={release:'v16.1',commitSha,previewURL:baseURL,generatedAt:new Date().toISOString(),desktopPassed:results.some(result=>result.profile==='desktop'&&result.passed),mobilePassed:results.some(result=>result.profile==='mobile'&&result.passed),passed:!failed&&results.every(result=>result.passed),results};
fs.writeFileSync(outputPath,`${JSON.stringify(summary,null,2)}\n`,'utf8');
if(!summary.passed){
  console.error(`KPCG browser smoke failed; see ${path.relative(root,outputPath)}`);
  process.exitCode=1;
}else{
  console.log(`PASS KPCG browser smoke: desktop + mobile; ${path.relative(root,outputPath)}`);
}
