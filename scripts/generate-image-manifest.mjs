import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ASSETS = path.join(ROOT, 'public', 'assets');
const OUT_DIR = path.join(ROOT, 'public', 'data');
const CONTEXT_MANIFEST = path.join(OUT_DIR, 'image-manifest.json');
const RANDOM_POOL = path.join(OUT_DIR, 'image-pool.json');
const IMAGE_RE = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const QUALITY_FLOOR_BYTES = 40000;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile() && IMAGE_RE.test(entry.name)) files.push(full);
  }
  return files;
}

const assetEntries = await readdir(ASSETS, { withFileTypes: true });
const imageFolders = assetEntries
  .filter(entry => entry.isDirectory() && /^kpcg_images(?:_|$)/i.test(entry.name))
  .map(entry => path.join(ASSETS, entry.name));

if (!imageFolders.length) throw new Error('No KPCG image folders were found under public/assets.');

const files = (await Promise.all(imageFolders.map(walk))).flat();
const qualified = [];
for (const file of files) {
  const info = await stat(file);
  if (info.size >= QUALITY_FLOOR_BYTES) qualified.push(file);
}
const images = [...new Set(qualified.map(file => '/' + path.relative(path.join(ROOT, 'public'), file).split(path.sep).join('/')))].sort();

await mkdir(OUT_DIR, { recursive: true });
await writeFile(CONTEXT_MANIFEST, JSON.stringify({
  schemaVersion: 2,
  qualityFloorBytes: QUALITY_FLOOR_BYTES,
  count: images.length,
  images: [],
  note: 'The context layer does not eagerly replace images. Random slideshow media is supplied by image-pool.json.'
}, null, 2) + '\n');
await writeFile(RANDOM_POOL, JSON.stringify({ schemaVersion: 2, qualityFloorBytes: QUALITY_FLOOR_BYTES, count: images.length, images }, null, 2) + '\n');
console.log(`Generated KPCG random image pool with ${images.length} quality-qualified images from ${imageFolders.length} source folders.`);
