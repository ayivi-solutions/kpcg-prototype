import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const indexPath=path.join(root,'public','index.html');
let html=fs.readFileSync(indexPath,'utf8');

const duplicateRawCopies=new Set([
  '/assets/kpcg_images_v1/470305474_530610333305906_6257499081113245301_n.jpg',
  '/assets/kpcg_images_v1/473816799_577834978567110_5052328436552605799_n.jpg',
  '/assets/kpcg_images_v1/475836156_590104030673538_3621752505024195995_n.jpg',
  '/assets/kpcg_images_v1/476223196_590104060673535_2828371275507644777_n.jpg',
  '/assets/kpcg_images_v1/476273072_590104074006867_7461863812541552296_n.jpg',
  '/assets/kpcg_images_v2/477762497_595685350115406_8637726608981233409_n.jpg',
  '/assets/kpcg_images_v2/477787274_596427563374518_7442286428548239111_n.jpg',
  '/assets/kpcg_images_v2/478440386_595685546782053_6362227960948175611_n.jpg',
  '/assets/kpcg_images_v2/718250719_977528735264397_2443165737903585008_n.jpg',
  '/assets/kpcg_images_v2/719813233_984396727910931_6862410891493389853_n.jpg',
  '/assets/kpcg_images_v2/721624950_984396684577602_7588856141146360880_n.jpg',
  '/assets/kpcg_images_v2/727543090_993616446988959_4341306700127752012_n.jpg'
]);
const featuredNews='/assets/kpcg_images_v2/740686260_1004309009253036_8967287854072328032_n.jpg';

const galleryMatch=html.match(/const v17OfficialGalleryImages=(\[[^;]+\]);/);
if(!galleryMatch)throw new Error('Official gallery array not found');
const gallery=JSON.parse(galleryMatch[1]).filter(path=>!duplicateRawCopies.has(path)&&path!==featuredNews);
html=html.replace(galleryMatch[0],`const v17OfficialGalleryImages=${JSON.stringify(gallery)};`);

html=html.replace('/assets/real/featured-community-tree-action.jpg',featuredNews);
html=html.replace('Explore grouped galleries and individual photo, video and audio stories with captions, credits and accessible fallbacks. Visuals on this demonstration site are illustrative.','Explore KPCG-owned photographs and grouped media with captions, credits and accessible fallbacks. Prototype metadata remains clearly identified where event-specific context has not yet been verified.');
html=html.replace("<p class=\"tiny\">${esc(m.credit)} · ${fmtDate(m.date)}</p>","<p class=\"tiny\">${esc(m.credit)}${m.date?` · ${fmtDate(m.date)}`:''}</p>");
html=html.replace('<div class="v16-hero-actions"><a class="btn" href="#/where-we-work">Explore Kenya</a><a class="btn secondary" href="#/knowledge">Discover knowledge</a></div>','<div class="v16-hero-actions"><a class="btn" href="#/where-we-work">Explore Kenya</a><a class="btn secondary" href="#/knowledge">Discover knowledge</a><a class="btn secondary" href="#/cms/login">Preview publishing workflow</a></div>');
html=html.replace('<div class="v16-final-actions"><a class="btn" href="#/engage">Engage with KPCG</a><a class="btn secondary" href="#/membership">Membership</a></div>','<div class="v16-final-actions"><a class="btn" href="#/engage">Engage with KPCG</a><a class="btn secondary" href="#/membership">Membership</a><a class="btn secondary" href="#/cms/login">CMS workflow demo</a></div>');

html=html.replace('<meta name="description" content="Kenya Platform for Climate Governance — interactive digital platform prototype.">','<meta name="description" content="Kenya Platform for Climate Governance — county climate action, evidence, programmes, policy, news, events and participation across Kenya.">');
html=html.replace('<meta property="og:title" content="KPCG Digital Platform — Prototype">','<meta property="og:title" content="Kenya Platform for Climate Governance">');
html=html.replace('<meta property="og:description" content="A mobile-first national climate governance discovery, evidence and engagement platform prototype.">','<meta property="og:description" content="Explore county climate governance, evidence, programmes, policy activity, events and public participation across Kenya.">');
html=html.replace('<title>KPCG Digital Platform — Prototype</title>','<title>Kenya Platform for Climate Governance</title>');

fs.writeFileSync(indexPath,html,'utf8');
console.log(`Finalized v17 experience: ${gallery.length} unique official-gallery images plus section-specific pools and 15 hero slides.`);
