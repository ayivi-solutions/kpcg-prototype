import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const publicDir=path.join(root,'public');
const indexPath=path.join(publicDir,'index.html');
let html=fs.readFileSync(indexPath,'utf8');

const folders=['assets/kpcg_images_v1','assets/kpcg_images_v2'];
const all=folders.flatMap(folder=>fs.readdirSync(path.join(publicDir,folder))
  .filter(name=>/\.jpe?g$/i.test(name))
  .map(name=>({path:`/${folder}/${name}`,bytes:fs.statSync(path.join(publicDir,folder,name)).size})))
  .sort((a,b)=>a.path.localeCompare(b.path));
const alreadyUsed=new Set([...html.matchAll(/\/assets\/kpcg_images_v[12]\/[A-Za-z0-9_.-]+\.jpg/g)].map(m=>m[0]));
const gallery=all.filter(item=>item.bytes>=40000&&!alreadyUsed.has(item.path));
if(gallery.length<90)throw new Error(`Expected at least 90 unused quality KPCG images; found ${gallery.length}`);
const galleryPaths=gallery.map(x=>x.path);
const marker='const v16Media=';
if(!html.includes(marker))throw new Error('Could not locate v16Media insertion point');
const injection=`const v17OfficialGalleryImages=${JSON.stringify(galleryPaths)};\nmedia.push(...v17OfficialGalleryImages.map((image,i)=>({id:\`official-kpcg-\${String(i+1).padStart(3,'0')}\`,type:'Image',title:\`KPCG official media \${String(i+1).padStart(3,'0')}\`,credit:'KPCG official Facebook media',alt:'KPCG climate-governance activity and event photograph',size:'Official media',uses:1,image})));\n`;
html=html.replace(marker,injection+marker);
fs.writeFileSync(indexPath,html,'utf8');
console.log(`Added ${gallery.length} unique KPCG photographs to Multimedia/Gallery; ${alreadyUsed.size} section-specific images remain reserved.`);
