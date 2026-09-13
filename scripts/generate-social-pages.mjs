import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicDir=path.join(root,'public');
const check=process.argv.includes('--check');
const base='https://kpcg.ayivisolutions.com';
const image=base+'/assets/kpcg-social-card.jpg';
const imageAlt='KPCG — climate governance that connects people, evidence and action';
const pages={
  about:['About KPCG','Discover KPCG’s institutional identity, governance, leadership and partner ecosystem.'],
  governance:['Governance & Leadership','Explore the governance and leadership model presented for the Kenya Platform for Climate Governance.'],
  'where-we-work':['Where We Work','Explore all 47 Kenyan counties through an administrative map and connected climate-governance activity.'],
  themes:['Thematic Work','Explore climate themes and their connected programmes, policy, evidence and counties.'],
  programmes:['Programmes & Projects','Discover programmes and projects connected to counties, themes, partners and evidence.'],
  policy:['Policy & Advocacy','Explore policy engagements, submissions, communiqués, position papers and negotiation updates.'],
  knowledge:['Knowledge Hub','Search KPCG reports, briefs, research, toolkits, datasets and other evidence resources.'],
  news:['News & Insights','Read KPCG news, analysis, commentary, member stories and field updates.'],
  events:['Events & Coverage','Discover upcoming, live, ongoing and concluded climate-governance events and coverage.'],
  multimedia:['Multimedia Centre','Browse KPCG photo galleries, video, audio interviews and multimedia collections.'],
  membership:['Membership','Explore the KPCG membership pathway and submit an expression of interest.'],
  members:['Member Directory','Browse public member profiles by county and climate theme.'],
  opportunities:['Opportunities','Discover calls, consultancies, jobs, grants, training and member opportunities.'],
  engage:['Engage with KPCG','Contact KPCG, submit a story or resource, enquire about partnership, or subscribe for updates.'],
  privacy:['Privacy','Read the privacy information for the KPCG evaluation prototype.'],
  terms:['Terms of Use','Read the terms of use for the KPCG evaluation prototype.'],
  accessibility:['Accessibility','Read the accessibility statement for the KPCG evaluation prototype.']
};
const esc=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');

function documentFor(slug,title,description){
  const fullTitle=title.includes('KPCG')?title:`${title} — KPCG`;
  const url=`${base}/${slug}/`;
  const destination=`/#/${slug}`;
  return `<!doctype html>
<html lang="en-KE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0b5139">
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index,follow">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_KE">
<meta property="og:site_name" content="Kenya Platform for Climate Governance">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${imageAlt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${imageAlt}">
<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<title>${esc(fullTitle)}</title>
<script>location.replace('${destination}')</script>
</head>
<body><p>Continue to <a href="${destination}">${esc(fullTitle)}</a>.</p></body>
</html>
`;
}

let failures=0;
for(const [slug,[title,description]] of Object.entries(pages)){
  const target=path.join(publicDir,slug,'index.html');
  const expected=documentFor(slug,title,description);
  if(check){
    if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==expected){
      console.error(`OUTDATED ${path.relative(root,target)}`);
      failures++;
    }
  }else{
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.writeFileSync(target,expected,'utf8');
  }
}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><changefreq>weekly</changefreq></url>
${Object.keys(pages).map(slug=>`  <url><loc>${base}/${slug}/</loc><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>
`;
const sitemapTarget=path.join(publicDir,'sitemap.xml');
if(check){
  if(!fs.existsSync(sitemapTarget)||fs.readFileSync(sitemapTarget,'utf8')!==sitemap){
    console.error('OUTDATED public/sitemap.xml');
    failures++;
  }
  const index=fs.readFileSync(path.join(publicDir,'index.html'),'utf8');
  const required=[
    'property="og:site_name"','property="og:image:width"','property="og:image:height"',
    'property="og:image:alt"','name="twitter:title"','name="twitter:description"',
    'name="twitter:image"','name="twitter:image:alt"','rel="icon"','rel="apple-touch-icon"',
    'type="application/ld+json"'
  ];
  for(const marker of required)if(!index.includes(marker)){console.error(`MISSING index marker: ${marker}`);failures++}
  for(const asset of ['favicon.ico','favicon-16x16.png','favicon-32x32.png','apple-touch-icon.png','icon-192.png','icon-512.png','assets/kpcg-social-card.jpg']){
    if(!fs.existsSync(path.join(publicDir,asset))){console.error(`MISSING public/${asset}`);failures++}
  }
}else{
  fs.writeFileSync(sitemapTarget,sitemap,'utf8');
}
if(failures)process.exit(1);
console.log(`${check?'PASS':'GENERATED'} ${Object.keys(pages).length} social entry pages.`);
