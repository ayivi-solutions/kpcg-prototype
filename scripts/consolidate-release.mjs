import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=process.env.KPCG_ROOT?path.resolve(process.env.KPCG_ROOT):path.resolve(__dirname,'..');
const publicDir=path.join(root,'public');
const output=process.env.KPCG_CONSOLIDATION_OUTPUT||path.join(publicDir,'index.html');
const RELEASE='v17.0';
const RELEASE_DATE='2026-09-13';

const heroImages=[
'/assets/kpcg_images_v1/470222578_552600794423862_3455318813895875629_n.jpg',
'/assets/kpcg_images_v1/470232140_552589741091634_3143116903051371304_n.jpg',
'/assets/kpcg_images_v1/473704333_577076685309606_1163308341272710257_n.jpg',
'/assets/kpcg_images_v1/474042888_579005955116679_7288417292791950586_n.jpg',
'/assets/kpcg_images_v1/475768994_590104027340205_8390248202778175268_n.jpg',
'/assets/kpcg_images_v1/476092631_591448190539122_119294618599312159_n.jpg',
'/assets/kpcg_images_v1/476224430_590104047340203_4227323325860647064_n.jpg',
'/assets/kpcg_images_v1/476235248_592949197055688_4239028996356062592_n.jpg',
'/assets/kpcg_images_v1/476261667_590102927340315_5062102053401438998_n.jpg',
'/assets/kpcg_images_v1/476432395_592948747055733_2473084454176913460_n.jpg',
'/assets/kpcg_images_v1/477322032_595679050116036_95010206918971162_n.jpg',
'/assets/kpcg_images_v2/479702178_596848713332403_6519543839931421034_n.jpg',
'/assets/kpcg_images_v2/740012442_1004309622586308_5055587982188708710_n.jpg',
'/assets/kpcg_images_v2/759881140_1024640733886530_1717732910021262797_n.jpg',
'/assets/kpcg_images_v2/771013285_1036647529352517_2334182043645063905_n.jpg'
];
const articleImages=[
'/assets/kpcg_images_v1/470226400_552600767757198_412466893504538283_n.jpg','/assets/kpcg_images_v1/470230681_552600891090519_1690716036763891279_n.jpg','/assets/kpcg_images_v1/473800309_577076861976255_6720883598004670745_n.jpg','/assets/kpcg_images_v1/474034731_577835388567069_6309111983372585258_n.jpg','/assets/kpcg_images_v1/474035480_577834905233784_708229285298045919_n.jpg','/assets/kpcg_images_v1/474063656_577076555309619_1751195938827776861_n.jpg','/assets/kpcg_images_v1/474068633_577835391900402_8001261414037119014_n.jpg','/assets/kpcg_images_v1/474397178_577076755309599_5824508035104301842_n.jpg','/assets/kpcg_images_v1/474459350_577076675309607_4170825055196275925_n.jpg','/assets/kpcg_images_v1/474502145_579006015116673_5459015329317996814_n.jpg','/assets/kpcg_images_v1/474505280_579006295116645_1839962367228776197_n.jpg','/assets/kpcg_images_v1/475860190_590104054006869_757062416223765832_n.jpg','/assets/kpcg_images_v1/475870920_590104080673533_279686655289676494_n.jpg','/assets/kpcg_images_v1/475882599_590104050673536_6983741261700860234_n.jpg','/assets/kpcg_images_v1/475889621_590103197340288_6982520135132039931_n.jpg','/assets/kpcg_images_v1/475907955_590103190673622_2790990653979959837_n.jpg','/assets/kpcg_images_v1/475981226_590740700609871_6185181679141121649_n.jpg','/assets/kpcg_images_v1/476001010_591442180539723_2707680987843682460_n.jpg','/assets/kpcg_images_v1/476069776_590754170608524_7222965778349996666_n.jpg','/assets/kpcg_images_v1/476083021_590103194006955_3841066044871961065_n.jpg','/assets/kpcg_images_v1/476099694_591448203872454_6958083000123652384_n.jpg','/assets/kpcg_images_v1/476104570_591442110539730_6309380959507145902_n.jpg','/assets/kpcg_images_v1/476142339_590733110610630_2295648343239945574_n.jpg','/assets/kpcg_images_v1/476162072_590740787276529_1778286776323878991_n.jpg'
];
const storyImages=['/assets/kpcg_images_v1/476334223_592949193722355_6097732609893112343_n.jpg','/assets/kpcg_images_v1/476350355_591442170539724_6384835230155292527_n.jpg','/assets/kpcg_images_v1/476359228_592948797055728_7810306339319567454_n.jpg'];
const resourceImages=['/assets/kpcg_images_v1/476370453_591442487206359_5940510842357310023_n.jpg','/assets/kpcg_images_v1/476425647_592948893722385_1043661788601124837_n.jpg','/assets/kpcg_images_v1/476439222_592949223722352_8063486970493055805_n.jpg','/assets/kpcg_images_v1/476459668_592948840389057_2931419559670009722_n.jpg','/assets/kpcg_images_v1/476666799_591448187205789_3284348189651446149_n.jpg','/assets/kpcg_images_v1/476673723_591448217205786_8047811742351604334_n.jpg','/assets/kpcg_images_v1/476790150_592391337111474_6105967022048126979_n.jpg','/assets/kpcg_images_v1/476824014_592006633816611_8356680770253314628_n.jpg','/assets/kpcg_images_v1/477025278_596109076739700_2873144415034443894_n.jpg','/assets/kpcg_images_v1/477078853_595673416783266_1541215805281946234_n.jpg','/assets/kpcg_images_v1/477731862_595685720115369_3247782645554189670_n.jpg','/assets/kpcg_images_v2/477739600_595679196782688_7191873352273798302_n.jpg'];
const themeFeature='/assets/kpcg_images_v2/750785224_1017143037969633_5493859491549383586_n.jpg';

const read=relative=>fs.readFileSync(path.join(publicDir,relative),'utf8').trim();
const gunzipB64=encoded=>zlib.gunzipSync(Buffer.from(encoded.replace(/\s+/g,''),'base64')).toString('utf8');
const evalPatch=(files,fnName)=>{const sandbox={console,window:{},globalThis:null,setTimeout,clearTimeout};sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(gunzipB64(files.map(read).join('')),sandbox,{timeout:5000});const fn=sandbox.window?.[fnName]??sandbox[fnName];if(typeof fn!=='function')throw new Error(`Missing ${fnName}`);return fn};
const reconstruct=()=>{let html=gunzipB64(['app/part-01.txt','app/part-02.txt','app/part-03.txt','app/part-04.txt','app/part-05.txt'].map(read).join(''));for(const [files,fn] of [[['app/patch-v11.txt'],'KPCGApplyPatch'],[['app/patch-v12.txt'],'KPCGApplyImagePatch'],[['app/patch-v13.txt'],'KPCGApplyPatchV13'],[['app/patch-v15-01.txt','app/patch-v15-02.txt','app/patch-v15-03.txt','app/patch-v15-04.txt'],'KPCGApplyExperienceRedesignV15'],[['app/patch-v16-01.txt','app/patch-v16-02.txt'],'KPCGApplyExperiencePatchV16'],[['app/patch-v16-2-real-imagery.txt'],'KPCGApplyRealImageryV162']])html=evalPatch(files,fn)(html);return html};
const mustReplace=(html,pattern,replacement,label)=>{const next=html.replace(pattern,replacement);if(next===html)throw new Error(`Consolidation marker not found: ${label}`);return next};

let html=reconstruct();
html=html.replace('<html lang="en">',`<html lang="en" data-release="${RELEASE}" data-build-date="${RELEASE_DATE}">`);
const meta=`\n<meta name="robots" content="index,follow">\n<meta property="og:type" content="website">\n<meta property="og:title" content="Kenya Platform for Climate Governance">\n<meta property="og:description" content="Explore county climate governance, evidence, programmes, policy activity, events and public participation across Kenya.">\n<meta property="og:url" content="https://kpcg.ayivisolutions.com/">\n<meta property="og:image" content="https://kpcg.ayivisolutions.com${heroImages[0]}">\n<meta name="twitter:card" content="summary_large_image">\n<link rel="preload" as="image" href="${heroImages[0]}" fetchpriority="high">`;
html=mustReplace(html,'</head>',`${meta}\n</head>`,'head metadata');
html=mustReplace(html,/const xpArticleImages=\[[\s\S]*?\];/,`const xpArticleImages=${JSON.stringify(articleImages)};`,'article image pool');
html=mustReplace(html,/const v16Media=\[[\s\S]*?\];/,`const v16Media=${JSON.stringify(heroImages.map((image,i)=>({image,label:`KPCG highlight ${i+1}`})))};`,'hero image pool');
html=mustReplace(html,/const storyImages=\[[^\]]+\];/,`const storyImages=${JSON.stringify(storyImages)};`,'story image pool');
html=mustReplace(html,/const resourceCover=r=>[^;]+;/,`const resourceImages=${JSON.stringify(resourceImages)};const resourceCover=r=>resourceImages[Math.max(0,resources.indexOf(r))%resourceImages.length];`,'resource image pool');
html=mustReplace(html,'<article class="v16-theme-feature"><img src="/assets/real/community-tree-planting.jpg"','<article class="v16-theme-feature"><img src="'+themeFeature+'"','theme feature');
html=html.replace("media.forEach(m=>{m.credit='Demonstration media'});","media.forEach(m=>{m.credit='KPCG official media'});");
html=mustReplace(html,'<div class="v16-hero-media">${v16Media.map((s,i)=>`<div class="v16-hero-slide ${i===0?\'active\':\'\'}" data-v16-hero-slide="${i}"><img src="${s.image}" alt="" fetchpriority="${i===0?\'high\':\'auto\'}"></div>`).join(\'\')}</div>', '<div class="v16-hero-media">${v16Media.map((s,i)=>`<div class="v16-hero-slide ${i===0?\'active\':\'\'}" data-v16-hero-slide="${i}"><img ${i===0?`src="${s.image}"`:`data-src="${s.image}"`} alt="" fetchpriority="${i===0?\'high\':\'low\'}" decoding="async"></div>`).join(\'\')}</div>', 'lazy hero markup');
html=mustReplace(html,/function v16SetHero\(index\)\{[\s\S]*?\}\nfunction v16StartHero/,`function v16SetHero(index){const root=document.querySelector('[data-v16-hero]');if(!root)return;const slides=[...root.querySelectorAll('[data-v16-hero-slide]')],dots=[...root.querySelectorAll('[data-v16-slide]')];if(!slides.length)return;const i=((index%slides.length)+slides.length)%slides.length;const load=n=>{const img=slides[n]?.querySelector('img[data-src]');if(img){img.src=img.dataset.src;img.removeAttribute('data-src')}};load(i);load((i+1)%slides.length);slides.forEach((el,n)=>el.classList.toggle('active',n===i));dots.forEach((el,n)=>{el.classList.toggle('active',n===i);el.setAttribute('aria-current',n===i?'true':'false')});root.dataset.index=i}\nfunction v16StartHero`,'hero controller');
html=html.replace('.v16-hero-nav{position:absolute;right:max(22px,calc((100vw - 1200px)/2));bottom:54px;z-index:3;display:flex;gap:8px}', '.v16-hero-nav{position:absolute;right:max(22px,calc((100vw - 1200px)/2));bottom:54px;z-index:3;display:flex;gap:5px;max-width:min(720px,calc(100vw - 44px));overflow-x:auto;padding:6px 0;scrollbar-width:none}.v16-hero-nav::-webkit-scrollbar{display:none}');
html=html.replace('.v16-hero-dot{width:44px;height:5px;', '.v16-hero-dot{width:18px;min-width:18px;height:5px;');
html=html.replace('.v16-hero-dot.active{width:78px;', '.v16-hero-dot.active{width:46px;min-width:46px;');
const fallback=`<main id="main" class="prerendered-home" data-prerendered-home aria-label="KPCG homepage"><header style="padding:24px;max-width:1200px;margin:auto"><nav aria-label="Primary navigation"><a href="#/home">Home</a> · <a href="#/about">About</a> · <a href="#/where-we-work">Where We Work</a> · <a href="#/themes">Thematic Work</a> · <a href="#/programmes">Programmes & Projects</a> · <a href="#/knowledge">Knowledge Hub</a> · <a href="#/news">News & Insights</a> · <a href="#/events">Events</a> · <a href="#/multimedia">Multimedia</a> · <a href="#/engage">Engage</a></nav></header><section style="padding:72px 24px;max-width:1200px;margin:auto"><p>Kenya Platform for Climate Governance</p><h1>Climate governance that connects people, evidence and action.</h1><p>Explore county realities, climate priorities, knowledge and policy engagement through one national public platform.</p><p><a href="#/where-we-work">Explore Kenya</a> · <a href="#/knowledge">Discover knowledge</a></p><img src="${heroImages[0]}" alt="KPCG climate-governance activity" width="1200" height="675" style="max-width:100%;height:auto"></section><section style="padding:24px;max-width:1200px;margin:auto"><h2>Explore the platform</h2><p>Discover all 47 counties, thematic priorities, programmes and projects, policy and advocacy, evidence resources, news, events, multimedia, membership and opportunities.</p></section></main>`;
html=mustReplace(html,'<div id="app"></div>',`<div id="app">${fallback}</div>`,'pre-rendered app snapshot');
html=html.replace('<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"KPCG Digital Platform Prototype","description":"Illustrative prototype — not a factual KPCG publication."}</script>', '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Kenya Platform for Climate Governance","url":"https://kpcg.ayivisolutions.com/","description":"Public prototype demonstrating county climate governance, evidence, programmes, policy activity, events and participation pathways across Kenya."}</script>');
html=html.replace('Prototype Demo','Prototype');
fs.writeFileSync(output,html,'utf8');
console.log(`Consolidated ${RELEASE}: ${Buffer.byteLength(html).toLocaleString()} bytes; ${heroImages.length} hero images; ${articleImages.length} article images; ${resourceImages.length} resource images.`);
