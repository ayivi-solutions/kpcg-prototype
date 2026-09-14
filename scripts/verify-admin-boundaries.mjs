import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const root=path.resolve('public/data/admin');
const expected={ADM0:1,ADM1:47,ADM2:290,ADM3:1452};
const manifest=JSON.parse(await readFile(path.join(root,'provenance.json'),'utf8'));
const hierarchy=JSON.parse(await readFile(path.join(root,'hierarchy-index.json'),'utf8'));
const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');

const decoded=[];
for(let level=0;level<=3;level++){
  const key=`ADM${level}`;
  const file=path.join(root,`adm${level}.topo.json`);
  const raw=await readFile(file);
  const actualSha=sha256(raw);
  const topo=JSON.parse(raw);
  const object=topo.objects?.[Object.keys(topo.objects||{})[0]];
  const geometries=object?.geometries||[];
  if(geometries.length!==expected[key]) throw new Error(`${key}: expected ${expected[key]} units, found ${geometries.length}`);
  const ids=geometries.map(g=>g.properties?.shapeID);
  if(ids.some(id=>!id)) throw new Error(`${key}: missing shapeID`);
  if(new Set(ids).size!==ids.length) throw new Error(`${key}: duplicate shapeID`);
  if(geometries.some(g=>g.properties?.shapeType!==key)) throw new Error(`${key}: shapeType mismatch`);
  const provenance=manifest.levels?.[key];
  if(!provenance) throw new Error(`${key}: provenance missing`);
  if(provenance.admUnitCount!==expected[key]) throw new Error(`${key}: provenance count mismatch`);
  if(provenance.runtimeAssetSha256!==actualSha) throw new Error(`${key}: runtime asset checksum mismatch`);
  decoded[level]={ids,names:geometries.map(g=>g.properties?.shapeName||'')};
  console.log(`${key}: ${geometries.length} units · ${raw.length} bytes · ${actualSha.slice(0,12)}…`);
}
if(hierarchy.counts.ADM0!==1||hierarchy.counts.ADM1!==47||hierarchy.counts.ADM2!==290||hierarchy.counts.ADM3!==1452) throw new Error('Hierarchy count contract failed');
if(hierarchy.parentIndex.ADM2.length!==290||hierarchy.parentIndex.ADM3.length!==1452) throw new Error('Hierarchy parent-index lengths failed');
if(hierarchy.parentIndex.ADM2.some(i=>!Number.isInteger(i)||i<0||i>=47)) throw new Error('ADM2 parent index out of range');
if(hierarchy.parentIndex.ADM3.some(i=>!Number.isInteger(i)||i<0||i>=290)) throw new Error('ADM3 parent index out of range');
const countyChildren=Array.from({length:47},(_,i)=>hierarchy.parentIndex.ADM2.filter(p=>p===i).length);
const subChildren=Array.from({length:290},(_,i)=>hierarchy.parentIndex.ADM3.filter(p=>p===i).length);
if(countyChildren.some(n=>n<1)) throw new Error('At least one county has no ADM2 child');
if(subChildren.some(n=>n<1)) throw new Error('At least one sub-county has no ADM3 child');
const hierarchySha=sha256(await readFile(path.join(root,'hierarchy-index.json')));
if(manifest.hierarchy?.sha256!==hierarchySha) throw new Error('Hierarchy checksum mismatch');
console.log(`Hierarchy: 47 counties → 290 sub-counties → 1,452 wards · ${hierarchySha.slice(0,12)}…`);
console.log(`Spatial fallback evidence: ${(hierarchy.fallbackSpatialMatches?.ADM3_to_ADM2||[]).join(', ')||'none'}`);
console.log('PASS KPCG ADM0→ADM3 evidence and hierarchy verification.');
