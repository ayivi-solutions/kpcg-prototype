import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const publicDir=path.join(root,'public');
const htmlPath=path.join(publicDir,'index.html');
const strictAssets=process.argv.includes('--strict-assets');
const emitArtifacts=process.argv.includes('--emit-artifacts');
const commitSha=process.env.KPCG_COMMIT_SHA||process.env.GITHUB_HEAD_SHA||process.env.GITHUB_SHA||'unknown';
const release='v17.0';
const serviceWorkerRelease='kpcg-v17.1-rollback-20260914';
const qualityFloorBytes=40000;
const fail=message=>{throw new Error(message)};
const html=fs.readFileSync(htmlPath,'utf8');

if(fs.existsSync(path.join(publicDir,'app')))fail('Legacy runtime patch directory public/app must not exist in v17.');
for(const marker of ['data-release="v17.0"','data-prerendered-home','Kenya Platform for Climate Governance','property="og:title"','property="og:image"','twitter:card','motion-system.css','motion-system.js','Preview publishing workflow']){
  if(!html.includes(marker))fail(`Missing consolidated source marker: ${marker}`);
}
for(const legacy of ['KPCGApplyExperiencePatchV16','/app/part-','patch-v16-','Loading the interactive platform','featured-locally-led-action.webp','media-01-county-dialogue.webp']){
  if(html.includes(legacy))fail(`Retired runtime/illustrative marker remains: ${legacy}`);
}
if(!/<nav\b[\s\S]*?#\/where-we-work/i.test(html))fail('Source-visible navigation is missing.');
if(!/<h1[^>]*>[^<]*Climate governance/i.test(html))fail('Source-visible hero heading is missing.');

const extractJsonArray=name=>{
  const match=html.match(new RegExp(`const ${name}=(\\[[^;]+\\]);`));
  if(!match)fail(`Could not locate ${name}`);
  return JSON.parse(match[1]);
};
const hero=extractJsonArray('v16Media').map(item=>item.image);
const article=extractJsonArray('xpArticleImages');
const story=extractJsonArray('storyImages');
const resources=extractJsonArray('resourceImages');
const gallery=extractJsonArray('v17OfficialGalleryImages');
const themeMatch=html.match(/<article class="v16-theme-feature"><img src="([^"]+)"/);
if(!themeMatch)fail('Theme feature image not found.');
const theme=[themeMatch[1]];
const newsFeatureMatch=html.match(/editorial-feature[\s\S]{0,400}?<img src="([^"]+)"/);
if(!newsFeatureMatch)fail('News feature image not found.');
const newsFeature=[newsFeatureMatch[1]];
const semanticReal=[...new Set([...html.matchAll(/\/assets\/real\/[A-Za-z0-9_.-]+\.jpg/g)].map(m=>m[0]))];

if(hero.length<12)fail(`Hero requires at least 12 real images; found ${hero.length}.`);
if(new Set(hero).size!==hero.length)fail('Hero contains duplicate image paths.');
if(article.length<20)fail(`Article pool is too small: ${article.length}.`);
if(resources.length<10)fail(`Resource pool is too small: ${resources.length}.`);
if(gallery.length<100)fail(`Multimedia/Gallery pool must contain at least 100 distinct official images; found ${gallery.length}.`);
if(new Set(gallery).size!==gallery.length)fail('Multimedia/Gallery contains duplicate paths.');

const primaryPools={hero,article,story,resources,theme,newsFeature};
const ownership=new Map();
for(const [pool,images] of Object.entries(primaryPools)){
  for(const image of images){
    if(!image.startsWith('/assets/kpcg_images_'))fail(`${pool} uses a non-KPCG raw image: ${image}`);
    if(ownership.has(image))fail(`Cross-section image repetition: ${image} appears in ${ownership.get(image)} and ${pool}`);
    ownership.set(image,pool);
  }
}
for(const image of gallery){
  if(ownership.has(image))fail(`Gallery repeats a section-specific image: ${image} (${ownership.get(image)}).`);
  ownership.set(image,'gallery');
}
for(const image of semanticReal){
  if(ownership.has(image))fail(`Semantic media path repeats another pool: ${image}.`);
  ownership.set(image,'semantic-media');
}

const assetResults=[];
const contentHashes=new Map();
for(const [image,pool] of ownership){
  const full=path.join(publicDir,image.replace(/^\//,''));
  if(!fs.existsSync(full))fail(`Missing ${pool} image: ${image}`);
  const bytes=fs.statSync(full).size;
  const fileBytes=fs.readFileSync(full);
  const sha256=crypto.createHash('sha256').update(fileBytes).digest('hex');
  const existing=contentHashes.get(sha256);
  if(existing)fail(`Visual duplicate by content: ${image} (${pool}) is identical to ${existing.image} (${existing.pool}).`);
  contentHashes.set(sha256,{image,pool});
  const passed=bytes>=qualityFloorBytes;
  assetResults.push({path:image,pool,bytes,sha256,passed});
  if(strictAssets&&!passed)fail(`${image} is below the ${qualityFloorBytes}-byte quality floor (${bytes}).`);
}

if(!html.includes('data-src="${s.image}"'))fail('Hero lazy-load markup is missing.');
if(!html.includes('load((i+1)%slides.length)'))fail('Hero next-slide preloading is missing.');
const manifest=JSON.parse(fs.readFileSync(path.join(publicDir,'manifest.webmanifest'),'utf8'));
if(manifest.start_url!=='/#/home')fail(`Unexpected manifest start_url: ${manifest.start_url}`);
const sw=fs.readFileSync(path.join(publicDir,'sw.js'),'utf8');
if(!sw.includes(serviceWorkerRelease))fail(`Service worker release is not ${serviceWorkerRelease}.`);
if(/\/app\//.test(sw))fail('Service worker still references legacy /app/ fragments.');

const sourceImagePaths=[...new Set([...html.matchAll(/(\/assets\/(?:kpcg_images_v[12]\/[A-Za-z0-9_.-]+\.jpg|real\/[A-Za-z0-9_.-]+\.jpg))/g)].map(m=>m[1]))];
if(sourceImagePaths.length<140)fail(`Source image diversity is too low: ${sourceImagePaths.length} unique official/real images.`);
const finalBytes=Buffer.byteLength(html,'utf8');
const htmlSha256=crypto.createHash('sha256').update(html).digest('hex');
if(finalBytes<300000)fail(`Consolidated document unexpectedly small: ${finalBytes} bytes.`);

if(emitArtifacts){
  const artifactDir=path.join(root,'artifacts');
  fs.mkdirSync(artifactDir,{recursive:true});
  fs.writeFileSync(path.join(artifactDir,'kpcg-v17-final.html'),html,'utf8');
  const summary={release,commitSha,architecture:'single consolidated source-visible application document',runtimePatchChain:false,sourceVisibleContent:true,finalHtmlBytes:finalBytes,finalHtmlSha256:htmlSha256,hero:{count:hero.length,unique:new Set(hero).size,eagerCount:1,lazyCount:hero.length-1},imagePools:{article:article.length,story:story.length,resources:resources.length,theme:theme.length,newsFeature:newsFeature.length,gallery:gallery.length,semanticMedia:semanticReal.length,totalActive:ownership.size},visualContentHashesUnique:contentHashes.size===ownership.size,sourceImageDiversity:sourceImagePaths.length,assetQuality:{strict:strictAssets,floorBytes:qualityFloorBytes,checked:assetResults.length,passed:assetResults.every(a=>a.passed),assets:assetResults},manifest:{startUrl:manifest.start_url},serviceWorker:{release:serviceWorkerRelease},generatedAt:new Date().toISOString()};
  fs.writeFileSync(path.join(artifactDir,'acceptance-summary.json'),JSON.stringify(summary,null,2)+'\n');
}
console.log(`PASS KPCG ${release}: consolidated source; ${hero.length} hero slides; ${gallery.length} gallery images; ${ownership.size} active images unique by content.`);
