import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const __filename=fileURLToPath(import.meta.url),__dirname=path.dirname(__filename),root=path.resolve(__dirname,'..'),publicDir=path.join(root,'public');
const baseURL=(process.env.KPCG_PREVIEW_URL||'http://127.0.0.1:8787').replace(/\/$/,'');
const productionMode=process.env.KPCG_PRODUCTION_MODE==='1',artifactDir=path.join(root,'artifacts'),outputPath=path.join(artifactDir,productionMode?'production-ip-hardening-summary.json':'ip-hardening-summary.json');
fs.mkdirSync(artifactDir,{recursive:true});
for(const f of ['ip-guard.js','ip-guard.css','_headers'])if(!fs.existsSync(path.join(publicDir,f)))throw new Error(`Missing public/${f}`);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]),files=walk(publicDir),maps=files.filter(f=>f.endsWith('.map'));
if(maps.length)throw new Error(`Source maps deployed: ${maps.map(f=>path.relative(root,f)).join(', ')}`);
for(const f of files.filter(f=>/\.(?:html|js|css)$/i.test(f)))if(/sourceMappingURL\s*=/.test(fs.readFileSync(f,'utf8')))throw new Error(`sourceMappingURL exposed in ${path.relative(root,f)}`);
const ht=fs.readFileSync(path.join(publicDir,'_headers'),'utf8');
for(const m of ['X-Frame-Options: DENY','X-Content-Type-Options: nosniff','Content-Security-Policy:',"frame-ancestors 'none'",'Cross-Origin-Resource-Policy: same-origin','Permissions-Policy:'])if(!ht.includes(m))throw new Error(`Missing header control: ${m}`);
const browser=await chromium.launch({headless:true});let summary;
try{
 const context=await browser.newContext({viewport:{width:1280,height:800}}),r=await context.request.get(`${baseURL}/?ipqa=${Date.now()}`);
 if(r.status()!==200)throw new Error(`Root returned ${r.status()}`);const source=await r.text(),h=r.headers();
 if(!source.includes('/ip-guard.js?v=18.1')||!source.includes('/ip-guard.css?v=18.1')||!source.includes('Proprietary evaluation prototype'))throw new Error('v18 root IP-guard wiring missing.');
 if((h['x-frame-options']||'').toUpperCase()!=='DENY'||(h['x-content-type-options']||'').toLowerCase()!=='nosniff'||(h['cross-origin-resource-policy']||'').toLowerCase()!=='same-origin')throw new Error('Required security response headers missing.');
 const csp=h['content-security-policy']||'';if(!csp.includes("frame-ancestors 'none'")||!csp.includes("object-src 'none'"))throw new Error(`CSP incomplete: ${csp}`);
 const page=await context.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));await page.goto(`${baseURL}/#home`,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>window.__AYIVI_IP_GUARD__?.authorized===true&&document.querySelector('.ayivi-ip-watermark')&&document.documentElement.dataset.release==='v18.0',null,{timeout:15000});
 const controls=await page.evaluate(()=>{const fire=(t,type,init={})=>{const e=type==='keydown'?new KeyboardEvent(type,{bubbles:true,cancelable:true,...init}):new Event(type,{bubbles:true,cancelable:true});t.dispatchEvent(e);return e.defaultPrevented};const input=document.createElement('input');document.body.appendChild(input);const o={guard:window.__AYIVI_IP_GUARD__,rootClass:document.documentElement.classList.contains('ayivi-ip-protected'),watermark:Boolean(document.querySelector('.ayivi-ip-watermark')),bodyCopy:fire(document.body,'copy'),bodyContext:fire(document.body,'contextmenu'),bodySelect:fire(document.body,'selectstart'),inputCopy:fire(input,'copy'),ctrlU:fire(document.body,'keydown',{key:'u',ctrlKey:true}),f12:fire(document.body,'keydown',{key:'F12'}),bodyStyle:getComputedStyle(document.body).userSelect,inputStyle:getComputedStyle(input).userSelect};input.remove();return o;});
 for(const k of ['bodyCopy','bodyContext','bodySelect','ctrlU','f12'])if(!controls[k])throw new Error(`${k} not blocked.`);if(controls.inputCopy)throw new Error('Editable-field copy was blocked.');if(!controls.rootClass||!controls.watermark||controls.bodyStyle!=='none'||!['text','auto'].includes(controls.inputStyle))throw new Error(`Selection/watermark guard failed: ${JSON.stringify(controls)}`);if(pageErrors.length)throw new Error(`Browser errors: ${pageErrors.join(' | ')}`);
 summary={release:'v18.0',mode:productionMode?'production':'preview',baseURL,passed:true,sourceMaps:0,headers:{xFrameOptions:h['x-frame-options'],xContentTypeOptions:h['x-content-type-options'],crossOriginResourcePolicy:h['cross-origin-resource-policy'],contentSecurityPolicy:csp,permissionsPolicy:h['permissions-policy']},controls,pageErrors,generatedAt:new Date().toISOString()};await context.close();
}catch(error){summary={release:'v18.0',mode:productionMode?'production':'preview',baseURL,passed:false,error:error.stack||String(error),generatedAt:new Date().toISOString()};process.exitCode=1;}finally{await browser.close();}
fs.writeFileSync(outputPath,JSON.stringify(summary,null,2)+'\n');console.log(`${summary.passed?'PASS':'FAIL'} KPCG v18 IP hardening: ${path.relative(root,outputPath)}`);