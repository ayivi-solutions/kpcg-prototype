import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const artifactDir=path.join(root,'artifacts');
const baseURL=(process.env.KPCG_PREVIEW_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
fs.mkdirSync(artifactDir,{recursive:true});
const output=path.join(artifactDir,'admin-map-smoke-summary.json');
const browser=await chromium.launch({headless:true});
let summary;

try{
  const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'allow'});
  const hierarchyResponse=await context.request.get(`${baseURL}/data/admin/hierarchy-index.json`);
  if(hierarchyResponse.status()!==200)throw new Error(`hierarchy returned ${hierarchyResponse.status()}`);
  const hierarchy=await hierarchyResponse.json();
  const counts=hierarchy.counts||{};
  if(counts.ADM0!==1||counts.ADM1!==47||counts.ADM2!==290||counts.ADM3!==1452)throw new Error(`hierarchy counts mismatch: ${JSON.stringify(counts)}`);

  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${baseURL}/#/where-we-work`,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('.map-panel[data-admin-enhanced="17.2-adm3"] .ashape',{timeout:25000});
  await page.waitForFunction(()=>document.querySelectorAll('.kpcg-adm .admin-unit-label').length===47,null,{timeout:12000});

  const state=()=>page.evaluate(()=>({
    level:document.querySelector('.kpcg-adm .lvl')?.textContent||'',
    shapes:document.querySelectorAll('.kpcg-adm .ashape').length,
    selected:document.querySelectorAll('.kpcg-adm .ashape.sel').length,
    labels:document.querySelectorAll('.kpcg-adm .admin-unit-label').length,
    centreLabels:document.querySelectorAll('.kpcg-adm .admin-centre-label').length,
    labelText:[...document.querySelectorAll('.kpcg-adm .admin-unit-label')].map(x=>x.textContent.trim()).filter(Boolean),
    centreText:[...document.querySelectorAll('.kpcg-adm .admin-centre-label')].map(x=>x.textContent.trim()).filter(Boolean),
    summary:document.querySelector('.kpcg-adm .asum')?.innerText||''
  }));

  let adm1=await state();
  if(!/ADM1/.test(adm1.level)||adm1.shapes!==47||adm1.labels!==47)throw new Error(`ADM1 state/labels failed ${JSON.stringify(adm1)}`);
  if(!adm1.centreLabels||!adm1.centreText.some(x=>/county HQ|national capital/i.test(x)))throw new Error(`ADM1 administrative-centre labels missing ${JSON.stringify(adm1.centreText.slice(0,8))}`);

  const activateFirst=async()=>{
    const shape=page.locator('.kpcg-adm .ashape').first();
    await shape.focus();
    await shape.press('Enter');
  };

  await activateFirst();
  await page.waitForFunction(()=>/ADM2/.test(document.querySelector('.kpcg-adm .lvl')?.textContent||'')&&document.querySelectorAll('.kpcg-adm .ashape').length>0,null,{timeout:12000});
  await page.waitForFunction(()=>document.querySelectorAll('.kpcg-adm .admin-unit-label').length===document.querySelectorAll('.kpcg-adm .ashape').length,null,{timeout:12000});
  const adm2=await state();
  if(adm2.labels!==adm2.shapes||adm2.labelText.length!==adm2.shapes)throw new Error(`ADM2 labels failed ${JSON.stringify(adm2)}`);

  await activateFirst();
  await page.waitForFunction(()=>/ADM3/.test(document.querySelector('.kpcg-adm .lvl')?.textContent||'')&&document.querySelectorAll('.kpcg-adm .ashape').length>0,null,{timeout:12000});
  await page.waitForFunction(()=>document.querySelectorAll('.kpcg-adm .admin-unit-label').length===document.querySelectorAll('.kpcg-adm .ashape').length,null,{timeout:12000});
  const adm3=await state();
  if(adm3.labels!==adm3.shapes||adm3.labelText.length!==adm3.shapes)throw new Error(`ADM3 labels failed ${JSON.stringify(adm3)}`);

  await activateFirst();
  await page.waitForFunction(()=>document.querySelectorAll('.kpcg-adm .ashape.sel').length===1,null,{timeout:5000});
  const ward=await state();
  if(ward.selected!==1||!/selected\./i.test(ward.summary))throw new Error(`ADM3 ward selection failed ${JSON.stringify(ward)}`);

  await page.locator('.kpcg-adm [data-back="0"]').click();
  await page.waitForFunction(()=>/ADM0/.test(document.querySelector('.kpcg-adm .lvl')?.textContent||'')&&document.querySelectorAll('.kpcg-adm .ashape').length===1,null,{timeout:12000});
  await page.waitForFunction(()=>document.querySelectorAll('.kpcg-adm .admin-unit-label').length===1,null,{timeout:12000});
  const adm0=await state();
  if(adm0.labels!==1||!adm0.labelText.some(x=>/Kenya/i.test(x)))throw new Error(`ADM0 country label failed ${JSON.stringify(adm0)}`);
  if(adm1.centreText.some(x=>/national capital/i.test(x))&&!adm0.centreText.some(x=>/national capital/i.test(x)))throw new Error(`ADM0 national-capital label failed ${JSON.stringify(adm0.centreText)}`);

  await activateFirst();
  await page.waitForFunction(()=>/ADM1/.test(document.querySelector('.kpcg-adm .lvl')?.textContent||'')&&document.querySelectorAll('.kpcg-adm .ashape').length===47,null,{timeout:12000});
  await page.waitForFunction(()=>document.querySelectorAll('.kpcg-adm .admin-unit-label').length===47,null,{timeout:12000});
  const roundTrip=await state();
  await page.screenshot({path:path.join(artifactDir,'admin-map-adm1.png'),fullPage:false});

  if(errors.length)throw new Error(`page errors: ${errors.join(' | ')}`);
  summary={baseURL,hierarchy:counts,adm0,adm1,adm2,adm3,wardSelected:true,labelsVerified:true,centreLabelsVerified:adm1.centreLabels>0,roundTripADM0toADM1:roundTrip.shapes===47,errors,passed:true};
  await context.close();
}catch(error){
  summary={baseURL,passed:false,error:error.stack||String(error)};
  process.exitCode=1;
}finally{
  await browser.close();
}

fs.writeFileSync(output,JSON.stringify(summary,null,2)+'\n');
console.log(`${summary.passed?'PASS':'FAIL'} KPCG ADM0->ADM3 browser smoke: ${path.relative(root,output)}`);
