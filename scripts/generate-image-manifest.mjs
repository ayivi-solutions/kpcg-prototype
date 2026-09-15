import { readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ASSETS = path.join(ROOT, 'public', 'assets');
const OUT = path.join(ROOT, 'public', 'data', 'image-manifest.json');
const IMAGE_RE = /\.(?:avif|gif|jpe?g|png|webp)$/i;

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
const images = [...new Set(files.map(file => '/' + path.relative(path.join(ROOT, 'public'), file).split(path.sep).join('/')))].sort();

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify({ schemaVersion: 1, count: images.length, images }, null, 2) + '\n');
console.log(`Generated ${path.relative(ROOT, OUT)} with ${images.length} KPCG images from ${imageFolders.length} source folders.`);
