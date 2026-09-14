import {mkdir, writeFile, readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const PIN='9469f09';
const EXPECTED={
  0:{count:1,size:38021,sha256:'8a72402762f497a960d1bcdeb1fd67a2d9f9a82c84eca9809da24c75c86b5c1b'},
  1:{count:47,size:117417,sha256:'87f950eb66a3da3dafb9503f436bb4e191bbd69e1c4762c38794c6e1534edb97'},
  2:{count:290,size:278455,sha256:'810fbc7c87984079658743b2de7363a94b37fa87ed0e1d310ca84e851b497eae'},
  3:{count:1452,size:618648,sha256:'fb85188bfefd0895d6401490aaa1d6244fdcd26999c1a0ea4d84e9536a7bff0e'}
};
const root=path.resolve('public/data/admin');
const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');
await mkdir(root,{recursive:true});

for(const level of [0,1,2,3]){
  const expected=EXPECTED[level];
  const url=`https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/${PIN}/releaseData/gbOpen/KEN/ADM${level}/geoBoundaries-KEN-ADM${level}_simplified.topojson`;
  const response=await fetch(url,{headers:{'user-agent':'KPCG-boundary-sync/17.2'}});
  if(!response.ok) throw new Error(`ADM${level} download failed: ${response.status} ${response.statusText}`);
  const raw=Buffer.from(await response.arrayBuffer());
  const actualSha=sha256(raw);
  if(raw.length!==expected.size) throw new Error(`ADM${level} byte-size mismatch: expected ${expected.size}, received ${raw.length}`);
  if(actualSha!==expected.sha256) throw new Error(`ADM${level} SHA-256 mismatch: expected ${expected.sha256}, received ${actualSha}`);
  const topo=JSON.parse(raw.toString('utf8'));
  const object=topo.objects[Object.keys(topo.objects)[0]];
  const count=object?.geometries?.length ?? 0;
  if(count!==expected.count) throw new Error(`ADM${level} count mismatch: expected ${expected.count}, received ${count}`);
  if(object.geometries.some(g=>g.properties?.shapeType!==`ADM${level}`)) throw new Error(`ADM${level} shapeType validation failed`);
  await writeFile(path.join(root,`adm${level}.topo.json`),raw);
  console.log(`ADM${level}: ${count} units · ${raw.length} bytes · ${actualSha.slice(0,12)}… · geoBoundaries ${PIN}`);
}

const hierarchy=JSON.parse(await readFile(path.join(root,'hierarchy-index.json'),'utf8'));
if(hierarchy.counts.ADM1!==47||hierarchy.counts.ADM2!==290||hierarchy.counts.ADM3!==1452) throw new Error('Derived hierarchy counts do not match evidence set');
console.log('Administrative boundary assets synchronized bit-for-bit with the user-supplied evidence archives.');
