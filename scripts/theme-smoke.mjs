import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const artifactDir=path.join(root,'artifacts');
const baseURL=(process.env.KPCG_PREVIEW_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
const productionMode=process.env.KPCG_PRODUCTION_MODE==='1';
const prefix=productionMode?'production-':'';
const outputPath=path.join(artifactDir,`${prefix}theme-smoke-summary.json`);
fs.mkdirSync(artifactDir,{recursive:true});

const browser=await chromium.launch({headless:true});
const summary={release:'v18.0',themeContract:'v18.2',mode:productionMode?'production':'preview',baseURL,passed:false,checks:{},pageErrors:[],generatedAt:null};

const waitTheme=async(page,expected)=>{
  await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme&&document.documentElement.dataset.themeContract==='v18.2',expected,{timeout:20000});
  await page.waitForSelector('.kpcg-theme-toggle',{state:'visible',timeout:15000});
};

const rgbIsVeryLight=value=>{
  const m=String(value||'').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if(!m)return false;
  return Number(m[1])>235&&Number(m[2])>235&&Number(m[3])>235;
};

const currentSnapshot=async page=>page.evaluate(()=>{
  const css=selector=>{const el=document.querySelector(selector);if(!el)return null;const s=getComputedStyle(el);return {background:s.backgroundColor,color:s.color,border:s.borderColor};};
  const button=document.querySelector('.kpcg-theme-toggle');
  return {
    theme:document.documentElement.dataset.theme,
    contract:document.documentElement.dataset.themeContract||null,
    stored:localStorage.getItem('kpcg-theme'),
    themeColor:document.querySelector('meta[name="theme-color"]')?.getAttribute('content')||'',
    colorScheme:document.querySelector('meta[name="color-scheme"]')?.getAttribute('content')||'',
    toggle:{
      glyph:button?.querySelector('.kpcg-theme-glyph')?.textContent||'',
      mode:button?.dataset.themeMode||'',
      pressed:button?.getAttribute('aria-pressed')||'',
      label:button?.getAttribute('aria-label')||'',
      title:button?.getAttribute('title')||''
    },
    surfaces:{
      body:css('body'),header:css('.site-header'),rail:css('.section-rail'),about:css('#about'),themes:css('.themes'),
      programme:css('.programme'),knowledge:css('.knowledge'),resource:css('.resource'),news:css('.news'),story:css('.story'),
      membership:css('.membership'),opportunities:css('.opportunities'),engageForm:css('.engage-form')
    },
    guard:window.__AYIVI_IP_GUARD__||null
  };
});

const legacySnapshot=async page=>page.evaluate(()=>{
  const css=selector=>{const el=document.querySelector(selector);if(!el)return null;const s=getComputedStyle(el);return {background:s.backgroundColor,color:s.color,border:s.borderColor};};
  const button=document.querySelector('.kpcg-theme-toggle');
  return {
    theme:document.documentElement.dataset.theme,
    contract:document.documentElement.dataset.themeContract||null,
    stored:localStorage.getItem('kpcg-theme'),
    toggle:{glyph:button?.querySelector('.kpcg-theme-glyph')?.textContent||'',mode:button?.dataset.themeMode||'',pressed:button?.getAttribute('aria-pressed')||'',label:button?.getAttribute('aria-label')||''},
    surfaces:{
      body:css('body'),header:css('.site-header'),metricStrip:css('.xp-metric-strip'),metric:css('.xp-metric'),
      mapPanel:css('.map-panel'),mapControl:css('.map-controls button'),bottomNav:css('.bottom-nav'),section:css('.v16-section')
    }
  };
});

const changedSurfaceCount=(light,dark)=>Object.keys(dark).filter(key=>light[key]&&dark[key]&&light[key].background!==dark[key].background).length;

try{
  /* Current v18 continuous public experience. */
  const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light'});
  const page=await context.newPage();
  page.on('pageerror',e=>summary.pageErrors.push(`current: ${e.message}`));
  await page.goto(`${baseURL}/#home`,{waitUntil:'domcontentloaded',timeout:30000});
  await page.evaluate(()=>localStorage.removeItem('kpcg-theme'));
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await waitTheme(page,'light');
  await page.waitForFunction(()=>document.querySelectorAll('#themeList .theme-row').length===10&&document.querySelectorAll('#programmeStack .programme').length===8,null,{timeout:15000});

  const initial=await currentSnapshot(page);
  if(initial.theme!=='light'||initial.contract!=='v18.2'||initial.toggle.mode!=='light'||initial.toggle.pressed!=='false'||initial.toggle.glyph!=='☀︎'||!/switch to night mode/i.test(initial.toggle.label)){
    throw new Error(`Day-state semantics failed: ${JSON.stringify(initial.toggle)}`);
  }
  summary.checks.currentDay=initial;
  await page.screenshot({path:path.join(artifactDir,`${prefix}theme-current-day.png`),fullPage:true});

  await page.locator('.kpcg-theme-toggle').click();
  await waitTheme(page,'dark');
  const dark=await currentSnapshot(page);
  const changed=changedSurfaceCount(initial.surfaces,dark.surfaces);
  const wronglyLight=Object.entries(dark.surfaces).filter(([,value])=>value&&rgbIsVeryLight(value.background)).map(([key])=>key);
  if(dark.stored!=='dark'||dark.themeColor.toLowerCase()!=='#0b1210'||dark.toggle.mode!=='dark'||dark.toggle.pressed!=='true'||dark.toggle.glyph!=='☾'||!/switch to day mode/i.test(dark.toggle.label)){
    throw new Error(`Night-state semantics failed: ${JSON.stringify(dark.toggle)}`);
  }
  if(changed<9)throw new Error(`Night mode is still only partial: only ${changed} current-page surfaces changed. ${JSON.stringify({day:initial.surfaces,night:dark.surfaces})}`);
  if(wronglyLight.length)throw new Error(`Night mode still exposes light surfaces: ${wronglyLight.join(', ')}`);
  summary.checks.currentNight={...dark,changedSurfaceCount:changed,wronglyLight};
  await page.screenshot({path:path.join(artifactDir,`${prefix}theme-current-night.png`),fullPage:true});

  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await waitTheme(page,'dark');
  const persisted=await currentSnapshot(page);
  if(persisted.stored!=='dark'||persisted.toggle.glyph!=='☾')throw new Error(`Night persistence failed: ${JSON.stringify(persisted.toggle)}`);
  summary.checks.persistence=persisted;
  await context.close();

  /* Retained v17 detailed-record experience: specifically cover the surfaces
     visible in the reported screenshots — metrics, map/control shell and mobile nav. */
  const legacyContext=await browser.newContext({viewport:{width:390,height:844},colorScheme:'light'});
  const legacyPage=await legacyContext.newPage();
  legacyPage.on('pageerror',e=>summary.pageErrors.push(`legacy: ${e.message}`));
  await legacyPage.goto(`${baseURL}/legacy.html#/home`,{waitUntil:'domcontentloaded',timeout:30000});
  await legacyPage.evaluate(()=>localStorage.setItem('kpcg-theme','light'));
  await legacyPage.reload({waitUntil:'domcontentloaded',timeout:30000});
  await waitTheme(legacyPage,'light');
  await legacyPage.waitForFunction(()=>Boolean(document.querySelector('.bottom-nav'))&&Boolean(document.querySelector('.xp-metric-strip')),null,{timeout:20000});
  const legacyLight=await legacySnapshot(legacyPage);
  summary.checks.legacyDay=legacyLight;
  await legacyPage.screenshot({path:path.join(artifactDir,`${prefix}theme-legacy-day.png`),fullPage:true});

  await legacyPage.locator('.kpcg-theme-toggle').click();
  await waitTheme(legacyPage,'dark');
  const legacyDark=await legacySnapshot(legacyPage);
  const legacyChanged=changedSurfaceCount(legacyLight.surfaces,legacyDark.surfaces);
  const legacyWronglyLight=Object.entries(legacyDark.surfaces).filter(([,value])=>value&&rgbIsVeryLight(value.background)).map(([key])=>key);
  if(legacyDark.toggle.mode!=='dark'||legacyDark.toggle.glyph!=='☾'||legacyDark.stored!=='dark')throw new Error(`Legacy night-state semantics failed: ${JSON.stringify(legacyDark.toggle)}`);
  if(legacyChanged<4)throw new Error(`Legacy detailed-record theme remains partial: ${legacyChanged} tracked surfaces changed. ${JSON.stringify({day:legacyLight.surfaces,night:legacyDark.surfaces})}`);
  if(legacyWronglyLight.length)throw new Error(`Legacy night mode still exposes light surfaces: ${legacyWronglyLight.join(', ')}`);
  summary.checks.legacyNight={...legacyDark,changedSurfaceCount:legacyChanged,wronglyLight:legacyWronglyLight};
  await legacyPage.screenshot({path:path.join(artifactDir,`${prefix}theme-legacy-night.png`),fullPage:true});
  await legacyContext.close();

  /* System-dark fallback must work when no manual preference exists. */
  const systemContext=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark'});
  const systemPage=await systemContext.newPage();
  systemPage.on('pageerror',e=>summary.pageErrors.push(`system-dark: ${e.message}`));
  await systemPage.goto(`${baseURL}/#home`,{waitUntil:'domcontentloaded',timeout:30000});
  await systemPage.evaluate(()=>localStorage.removeItem('kpcg-theme'));
  await systemPage.reload({waitUntil:'domcontentloaded',timeout:30000});
  await waitTheme(systemPage,'dark');
  const systemDark=await currentSnapshot(systemPage);
  if(systemDark.stored!==null||systemDark.theme!=='dark'||systemDark.toggle.glyph!=='☾')throw new Error(`System-dark baseline failed: ${JSON.stringify(systemDark.toggle)}`);
  summary.checks.systemDark=systemDark;
  await systemContext.close();

  if(summary.pageErrors.length)throw new Error(`Browser errors: ${summary.pageErrors.join(' | ')}`);
  summary.passed=true;
}catch(error){
  summary.error=error.stack||String(error);
  process.exitCode=1;
}finally{
  summary.generatedAt=new Date().toISOString();
  await browser.close();
  fs.writeFileSync(outputPath,JSON.stringify(summary,null,2)+'\n');
  console.log(`${summary.passed?'PASS':'FAIL'} KPCG v18 / theme v18.2 day-night QA: ${path.relative(root,outputPath)}`);
}
