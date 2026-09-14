import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const publicDir=path.join(root,'public');
const rootHtmlPath=path.join(publicDir,'index.html');
const legacyHtmlPath=path.join(publicDir,'legacy.html');
const strictAssets=process.argv.includes('--strict-assets');
const emitArtifacts=process.argv.includes('--emit-artifacts');
const commitSha=process.env.KPCG_COMMIT_SHA||process.env.GITHUB_HEAD_SHA||process.env.GITHUB_SHA||'unknown';
const release='v18.0';
const legacyRelease='v17.0';
const serviceWorkerRelease='kpcg-v18.2-theme-20260914';
const qualityFloorBytes=40000;
const fail=message=>{throw new Error(message)};
const html=fs.readFileSync(rootHtmlPath,'utf8');
const legacyHtml=fs.readFileSync(legacyHtmlPath,'utf8');

// v18 continuous root: source-visible, scroll-first and backwards compatible.
for(const marker of [
  'data-release="v18.0"','Climate governance that connects people, evidence and action.',
  'property="og:title"','property="og:image"','twitter:card','twitter:image:alt',
  'scroll-behavior:smooth','IntersectionObserver','class="section-rail"','/legacy.html#/cms/login'
]) if(!html.includes(marker))fail(`Missing v18 continuous-root marker: ${marker}`);

const sectionIds=['home','about','where-we-work','themes','programmes','policy','knowledge','news','events','multimedia','membership','opportunities','engage'];
for(const id of sectionIds)if(!new RegExp(`<section\\s+id="${id}"[^>]*class="[^"]*scroll-section`).test(html))fail(`Continuous root missing section: ${id}`);
if(!/<nav class="section-rail"[\s\S]*?href="#about"[\s\S]*?href="#engage"/i.test(html))fail('Continuous section navigation is missing anchor coverage.');
if(/class="section-rail"[\s\S]{0,3000}?href="\/#\//i.test(html))fail('Continuous section rail still contains page-style hash routes.');
if(!/const topRouteMap=\{[^;]+#\/about[^;]+#\/where-we-work[^;]+#\/engage[^;]+\}/.test(html))fail('Legacy top-level hash compatibility map is missing.');
if(!html.includes("location.replace('/legacy.html'+initialHash)"))fail('Detailed legacy-route fallback is missing.');
if(!/<h1[^>]*id="home-title"[^>]*>[^<]*Climate governance/i.test(html))fail('Source-visible v18 hero heading is missing.');
if(Buffer.byteLength(html,'utf8')<35000)fail(`Continuous root unexpectedly small: ${Buffer.byteLength(html,'utf8')} bytes.`);

const usedRootImages=[...new Set([...html.matchAll(/(\/assets\/(?:kpcg_images_v[12]\/[A-Za-z0-9_.-]+\.jpg|real\/[A-Za-z0-9_.-]+\.jpg))/g)].map(m=>m[1]))];
if(usedRootImages.length<12)fail(`Continuous root needs at least 12 distinct editorial images; found ${usedRootImages.length}.`);
const rootHashes=new Map();
const rootAssetResults=[];
for(const image of usedRootImages){
  const full=path.join(publicDir,image.replace(/^\//,''));
  if(!fs.existsSync(full))fail(`Missing v18 root image: ${image}`);
  const bytes=fs.statSync(full).size;
  const sha256=crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
  const duplicate=rootHashes.get(sha256);
  if(duplicate)fail(`v18 root repeats identical visual content: ${image} and ${duplicate}.`);
  rootHashes.set(sha256,image);
  const passed=bytes>=qualityFloorBytes;
  rootAssetResults.push({path:image,bytes,sha256,passed});
  if(strictAssets&&!passed)fail(`${image} is below the ${qualityFloorBytes}-byte quality floor (${bytes}).`);
}

// Preserve every substantive v17 consolidated-source integrity and visual-quality gate
// against the byte-for-byte legacy fallback rather than deleting those safeguards.
if(!fs.existsSync(legacyHtmlPath))fail('Preserved v17 public/legacy.html is missing.');
if(fs.existsSync(path.join(publicDir,'app')))fail('Legacy runtime patch directory public/app must not exist.');
for(const marker of ['data-release="v17.0"','data-prerendered-home','Kenya Platform for Climate Governance','property="og:title"','property="og:image"','twitter:card','motion-system.css','motion-system.js','Preview publishing workflow']){
  if(!legacyHtml.includes(marker))fail(`Preserved v17 missing consolidated source marker: ${marker}`);
}
for(const retired of ['KPCGApplyExperiencePatchV16','/app/part-','patch-v16-','Loading the interactive platform','featured-locally-led-action.webp','media-01-county-dialogue.webp']){
  if(legacyHtml.includes(retired))fail(`Retired runtime/illustrative marker remains in v17 fallback: ${retired}`);
}
if(!/<nav\b[\s\S]*?#\/where-we-work/i.test(legacyHtml))fail('Preserved v17 source-visible navigation is missing.');
if(!/<h1[^>]*>[^<]*Climate governance/i.test(legacyHtml))fail('Preserved v17 source-visible hero heading is missing.');

const extractJsonArray=(name,source=legacyHtml)=>{
  const match=source.match(new RegExp(`const ${name}=(\\[[^;]+\\]);`));
  if(!match)fail(`Could not locate ${name} in preserved v17.`);
  return JSON.parse(match[1]);
};
const hero=extractJsonArray('v16Media').map(item=>item.image);
const article=extractJsonArray('xpArticleImages');
const story=extractJsonArray('storyImages');
const resources=extractJsonArray('resourceImages');
const gallery=extractJsonArray('v17OfficialGalleryImages');
const themeMatch=legacyHtml.match(/<article class="v16-theme-feature"><img src="([^"]+)"/);
if(!themeMatch)fail('Preserved v17 theme feature image not found.');
const theme=[themeMatch[1]];
const newsFeatureMatch=legacyHtml.match(/editorial-feature[\s\S]{0,400}?<img src="([^"]+)"/);
if(!newsFeatureMatch)fail('Preserved v17 news feature image not found.');
const newsFeature=[newsFeatureMatch[1]];
const semanticReal=[...new Set([...legacyHtml.matchAll(/\/assets\/real\/[A-Za-z0-9_.-]+\.jpg/g)].map(m=>m[0]))];
if(hero.length<12)fail(`Preserved v17 hero requires at least 12 real images; found ${hero.length}.`);
if(new Set(hero).size!==hero.length)fail('Preserved v17 hero contains duplicate image paths.');
if(article.length<20)fail(`Preserved v17 article pool is too small: ${article.length}.`);
if(resources.length<10)fail(`Preserved v17 resource pool is too small: ${resources.length}.`);
if(gallery.length<100)fail(`Preserved v17 gallery pool must contain at least 100 distinct official images; found ${gallery.length}.`);
if(new Set(gallery).size!==gallery.length)fail('Preserved v17 gallery contains duplicate paths.');

const primaryPools={hero,article,story,resources,theme,newsFeature};
const ownership=new Map();
for(const [pool,images] of Object.entries(primaryPools))for(const image of images){
  if(!image.startsWith('/assets/kpcg_images_'))fail(`Preserved v17 ${pool} uses non-KPCG raw image: ${image}`);
  if(ownership.has(image))fail(`Preserved v17 cross-section image repetition: ${image} appears in ${ownership.get(image)} and ${pool}`);
  ownership.set(image,pool);
}
for(const image of gallery){if(ownership.has(image))fail(`Preserved v17 gallery repeats ${image} (${ownership.get(image)}).`);ownership.set(image,'gallery');}
for(const image of semanticReal){if(ownership.has(image))fail(`Preserved v17 semantic media repeats ${image}.`);ownership.set(image,'semantic-media');}

const legacyAssetResults=[];
const contentHashes=new Map();
for(const [image,pool] of ownership){
  const full=path.join(publicDir,image.replace(/^\//,''));
  if(!fs.existsSync(full))fail(`Missing preserved v17 ${pool} image: ${image}`);
  const bytes=fs.statSync(full).size;
  const sha256=crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
  const existing=contentHashes.get(sha256);
  if(existing)fail(`Preserved v17 visual duplicate by content: ${image} (${pool}) is identical to ${existing.image} (${existing.pool}).`);
  contentHashes.set(sha256,{image,pool});
  const passed=bytes>=qualityFloorBytes;
  legacyAssetResults.push({path:image,pool,bytes,sha256,passed});
  if(strictAssets&&!passed)fail(`${image} is below the ${qualityFloorBytes}-byte v17 quality floor (${bytes}).`);
}
if(!legacyHtml.includes('data-src="${s.image}"'))fail('Preserved v17 hero lazy-load markup is missing.');
if(!legacyHtml.includes('load((i+1)%slides.length)'))fail('Preserved v17 hero next-slide preloading is missing.');
const legacyImagePaths=[...new Set([...legacyHtml.matchAll(/(\/assets\/(?:kpcg_images_v[12]\/[A-Za-z0-9_.-]+\.jpg|real\/[A-Za-z0-9_.-]+\.jpg))/g)].map(m=>m[1]))];
if(legacyImagePaths.length<140)fail(`Preserved v17 source image diversity is too low: ${legacyImagePaths.length}.`);
const legacyBytes=Buffer.byteLength(legacyHtml,'utf8');
if(legacyBytes<300000)fail(`Preserved v17 consolidated document unexpectedly small: ${legacyBytes} bytes.`);

const manifest=JSON.parse(fs.readFileSync(path.join(publicDir,'manifest.webmanifest'),'utf8'));
if(manifest.start_url!=='/#home')fail(`Unexpected v18 manifest start_url: ${manifest.start_url}`);
const sw=fs.readFileSync(path.join(publicDir,'sw.js'),'utf8');
if(!sw.includes(`const RELEASE='${serviceWorkerRelease}'`))fail(`Service worker release is not ${serviceWorkerRelease}.`);
if(!sw.includes("'/legacy.html'"))fail('Service worker does not preserve the legacy fallback in its shell.');
if(/\/app\//.test(sw))fail('Service worker still references retired /app/ fragments.');

const rootSha256=crypto.createHash('sha256').update(html).digest('hex');
const legacySha256=crypto.createHash('sha256').update(legacyHtml).digest('hex');
if(emitArtifacts){
  const artifactDir=path.join(root,'artifacts');
  fs.mkdirSync(artifactDir,{recursive:true});
  fs.writeFileSync(path.join(artifactDir,'kpcg-v18-continuous-root.html'),html,'utf8');
  fs.writeFileSync(path.join(artifactDir,'kpcg-v17-legacy-fallback.html'),legacyHtml,'utf8');
  const summary={release,legacyRelease,commitSha,architecture:'v18 continuous public root + preserved v17 detailed-record fallback',root:{bytes:Buffer.byteLength(html,'utf8'),sha256:rootSha256,sections:sectionIds,officialEditorialImages:usedRootImages.length,assets:rootAssetResults},legacy:{bytes:legacyBytes,sha256:legacySha256,hero:hero.length,gallery:gallery.length,sourceImageDiversity:legacyImagePaths.length,activeImages:ownership.size,assets:legacyAssetResults},manifest:{startUrl:manifest.start_url},serviceWorker:{release:serviceWorkerRelease},generatedAt:new Date().toISOString()};
  fs.writeFileSync(path.join(artifactDir,'acceptance-summary.json'),JSON.stringify(summary,null,2)+'\n');
}
console.log(`PASS KPCG ${release}: ${sectionIds.length}-section continuous root; preserved ${legacyRelease} integrity; ${usedRootImages.length} root editorial images; ${gallery.length} legacy gallery images.`);