import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const publicDir=path.join(root,'public');
const indexPath=path.join(publicDir,'index.html');
let html=fs.readFileSync(indexPath,'utf8');

const featuredNews='/assets/kpcg_images_v2/740686260_1004309009253036_8967287854072328032_n.jpg';
const extractJsonArray=name=>{
  const match=html.match(new RegExp(`const ${name}=(\\[[^;]+\\]);`));
  if(!match)throw new Error(`Could not locate ${name}`);
  return JSON.parse(match[1]);
};
const resolveAsset=assetPath=>path.join(publicDir,assetPath.replace(/^\//,''));
const hashAsset=assetPath=>{
  const full=resolveAsset(assetPath);
  if(!fs.existsSync(full))throw new Error(`Missing media asset: ${assetPath}`);
  return crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
};

html=html.replace('/assets/real/featured-community-tree-action.jpg',featuredNews);
html=html.replace('Explore grouped galleries and individual photo, video and audio stories with captions, credits and accessible fallbacks. Visuals on this demonstration site are illustrative.','Explore KPCG-owned photographs and grouped media with captions, credits and accessible fallbacks. Prototype metadata remains clearly identified where event-specific context has not yet been verified.');
html=html.replace("<p class=\"tiny\">${esc(m.credit)} · ${fmtDate(m.date)}</p>","<p class=\"tiny\">${esc(m.credit)}${m.date?` · ${fmtDate(m.date)}`:''}</p>");
html=html.replace('<div class="v16-hero-actions"><a class="btn" href="#/where-we-work">Explore Kenya</a><a class="btn secondary" href="#/knowledge">Discover knowledge</a></div>','<div class="v16-hero-actions"><a class="btn" href="#/where-we-work">Explore Kenya</a><a class="btn secondary" href="#/knowledge">Discover knowledge</a><a class="btn secondary" href="#/cms/login">Preview publishing workflow</a></div>');
html=html.replace('<div class="v16-final-actions"><a class="btn" href="#/engage">Engage with KPCG</a><a class="btn secondary" href="#/membership">Membership</a></div>','<div class="v16-final-actions"><a class="btn" href="#/engage">Engage with KPCG</a><a class="btn secondary" href="#/membership">Membership</a><a class="btn secondary" href="#/cms/login">CMS workflow demo</a></div>');
html=html.replace('<meta name="description" content="Kenya Platform for Climate Governance — interactive digital platform prototype.">','<meta name="description" content="Kenya Platform for Climate Governance — county climate action, evidence, programmes, policy, news, events and participation across Kenya.">');
html=html.replace('<meta property="og:title" content="KPCG Digital Platform — Prototype">','<meta property="og:title" content="Kenya Platform for Climate Governance">');
html=html.replace('<meta property="og:description" content="A mobile-first national climate governance discovery, evidence and engagement platform prototype.">','<meta property="og:description" content="Explore county climate governance, evidence, programmes, policy activity, events and public participation across Kenya.">');
html=html.replace('<title>KPCG Digital Platform — Prototype</title>','<title>Kenya Platform for Climate Governance</title>');

const hero=extractJsonArray('v16Media').map(item=>item.image);
const article=extractJsonArray('xpArticleImages');
const story=extractJsonArray('storyImages');
const resources=extractJsonArray('resourceImages');
const themeMatch=html.match(/<article class="v16-theme-feature"><img src="([^"]+)"/);
if(!themeMatch)throw new Error('Theme feature image not found');
const semanticReal=[...new Set([...html.matchAll(/\/assets\/real\/[A-Za-z0-9_.-]+\.jpg/g)].map(match=>match[0]))];
const reserved=[...hero,...article,...story,...resources,themeMatch[1],featuredNews,...semanticReal];
const reservedHashes=new Map();
for(const assetPath of reserved){
  const hash=hashAsset(assetPath);
  const prior=reservedHashes.get(hash);
  if(prior&&prior!==assetPath)throw new Error(`Section-specific visual duplicate: ${assetPath} is identical to ${prior}`);
  reservedHashes.set(hash,assetPath);
}

const galleryMatch=html.match(/const v17OfficialGalleryImages=(\[[^;]+\]);/);
if(!galleryMatch)throw new Error('Official gallery array not found');
const galleryCandidates=JSON.parse(galleryMatch[1]);
const galleryHashes=new Set();
const gallery=[];
let removed=0;
for(const assetPath of galleryCandidates){
  const full=resolveAsset(assetPath);
  if(!fs.existsSync(full)||fs.statSync(full).size<40000){removed++;continue;}
  const hash=hashAsset(assetPath);
  if(reservedHashes.has(hash)||galleryHashes.has(hash)){removed++;continue;}
  galleryHashes.add(hash);
  gallery.push(assetPath);
}
if(gallery.length<100)throw new Error(`Content deduplication left only ${gallery.length} gallery images; minimum is 100.`);
html=html.replace(galleryMatch[0],`const v17OfficialGalleryImages=${JSON.stringify(gallery)};`);

fs.writeFileSync(indexPath,html,'utf8');
console.log(`Finalized v17 experience: ${gallery.length} content-unique official-gallery images; removed ${removed} duplicate/low-quality candidates; ${hero.length} hero slides.`);
