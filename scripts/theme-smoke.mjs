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
const summary={release:'v18.0',mode:productionMode?'production':'preview',baseURL,passed:false,checks:{},pageErrors:[],generatedAt:null};
const waitTheme=async(page,expected)=>{await page.waitForFunction(theme=>document.documentElement.dataset.theme===theme,expected,{timeout:15000});await page.waitForSelector('.kpcg-theme-toggle',{state:'visible',timeout:15000});};
const snapshot=async page=>page.evaluate(()=>({theme:document.documentElement.dataset.theme,stored:localStorage.getItem('kpcg-theme'),themeColor:document.querySelector('meta[name="theme-color"]')?.getAttribute('content')||'',colorScheme:document.querySelector('meta[name="color-scheme"]')?.getAttribute('content')||'',bodyBackground:getComputedStyle(document.body).backgroundColor,toggle:{pressed:document.querySelector('.kpcg-theme-toggle')?.getAttribute('aria-pressed')||'',label:document.querySelector('.kpcg-theme-toggle')?.getAttribute('aria-label')||'',title:document.querySelector('.kpcg-theme-toggle')?.getAttribute('title')||''},guard:window.__AYIVI_IP_GUARD__||null}));

try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light'});
  const page=await context.newPage();page.on('pageerror',e=>summary.pageErrors.push(e.message));
  await page.goto(`${baseURL}/#home`,{waitUntil:'domcontentloaded',timeout:30000});
  await page.evaluate(()=>localStorage.removeItem('kpcg-theme'));await page.reload({waitUntil:'domcontentloaded',timeout:30000});await waitTheme(page,'light');
  const initial=await snapshot(page);if(initial.theme!=='light'||initial.toggle.pressed!=='false'||!/night mode/i.test(initial.toggle.label))throw new Error(`System-light baseline failed: ${JSON.stringify(initial)}`);summary.checks.systemLight=initial;
  await page.screenshot({path:path.join(artifactDir,`${prefix}theme-light-home.png`),fullPage:true});
  await page.locator('.kpcg-theme-toggle').click();await waitTheme(page,'dark');const dark=await snapshot(page);if(dark.stored!=='dark'||dark.themeColor.toLowerCase()!=='#0b1210'||dark.toggle.pressed!=='true'||!/day mode/i.test(dark.toggle.label))throw new Error(`Dark toggle failed: ${JSON.stringify(dark)}`);summary.checks.manualDark=dark;
  await page.screenshot({path:path.join(artifactDir,`${prefix}theme-dark-home.png`),fullPage:true});
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});await waitTheme(page,'dark');const persisted=await snapshot(page);if(persisted.stored!=='dark')throw new Error(`Dark persistence failed: ${JSON.stringify(persisted)}`);summary.checks.persistence=persisted;

  await page.goto(`${baseURL}/#/about`,{waitUntil:'domcontentloaded',timeout:30000});await waitTheme(page,'dark');await page.waitForFunction(()=>location.hash==='#about'&&Boolean(document.querySelector('#about .body-copy')),null,{timeout:15000});
  const routeState=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,toggle:Boolean(document.querySelector('.kpcg-theme-toggle')),hash:location.hash,aboutBackground:getComputedStyle(document.querySelector('#about')).backgroundColor,copyColor:getComputedStyle(document.querySelector('#about .body-copy')).color}));
  if(routeState.theme!=='dark'||!routeState.toggle||routeState.hash!=='#about'||routeState.aboutBackground==='rgb(255, 255, 255)')throw new Error(`Dark continuous-section route compatibility failed: ${JSON.stringify(routeState)}`);summary.checks.routeContinuity=routeState;
  await page.locator('.kpcg-theme-toggle').click();await waitTheme(page,'light');const lightAgain=await snapshot(page);if(lightAgain.stored!=='light'||lightAgain.themeColor.toLowerCase()!=='#0b5139')throw new Error(`Return-to-light failed: ${JSON.stringify(lightAgain)}`);summary.checks.returnToLight=lightAgain;await context.close();

  const darkContext=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark'});const darkPage=await darkContext.newPage();darkPage.on('pageerror',e=>summary.pageErrors.push(e.message));await darkPage.goto(`${baseURL}/#home`,{waitUntil:'domcontentloaded',timeout:30000});await darkPage.evaluate(()=>localStorage.removeItem('kpcg-theme'));await darkPage.reload({waitUntil:'domcontentloaded',timeout:30000});await waitTheme(darkPage,'dark');const systemDark=await snapshot(darkPage);if(systemDark.stored!==null||systemDark.theme!=='dark')throw new Error(`System-dark baseline failed: ${JSON.stringify(systemDark)}`);summary.checks.systemDark=systemDark;await darkContext.close();
  if(summary.pageErrors.length)throw new Error(`Browser errors: ${summary.pageErrors.join(' | ')}`);summary.passed=true;
}catch(error){summary.error=error.stack||String(error);process.exitCode=1;}finally{summary.generatedAt=new Date().toISOString();await browser.close();fs.writeFileSync(outputPath,JSON.stringify(summary,null,2)+'\n');console.log(`${summary.passed?'PASS':'FAIL'} KPCG v18 day/night theme QA: ${path.relative(root,outputPath)}`);}