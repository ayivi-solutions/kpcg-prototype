import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const ref=path.join(root,'production-reference');
const read=p=>fs.readFileSync(path.join(ref,p),'utf8');
const requireText=(file,markers)=>{
  const text=read(file);
  for(const marker of markers){
    if(!text.includes(marker))throw new Error(`${file} missing production-reference marker: ${marker}`);
  }
};

const pkg=JSON.parse(read('package.json'));
const requiredDeps=['next','react','react-dom','payload','@payloadcms/next','@payloadcms/db-postgres','@payloadcms/richtext-lexical'];
for(const dep of requiredDeps){
  if(!pkg.dependencies?.[dep])throw new Error(`production-reference/package.json missing ${dep}`);
}
if(!String(pkg.dependencies.next).startsWith('16.'))throw new Error('Production reference must use the committed Next.js 16 line.');
if(!String(pkg.dependencies.payload).startsWith('3.'))throw new Error('Production reference must use Payload CMS 3.x.');
requireText('src/payload.config.ts',['postgresAdapter','DATABASE_URI','PAYLOAD_SECRET','collections: [Users, Media, Pages]']);
requireText('src/collections/Pages.ts',['versions:','drafts:','schedulePublish: true',"_status: { equals: 'published' }"]);
requireText('src/collections/Media.ts',["slug: 'media'",'mimeTypes','alt']);
requireText('src/collections/Users.ts',["slug: 'users'",'auth: true','administrator']);
requireText('src/app/(public)/page.tsx',['getPayload','force-dynamic',"collection: 'pages'","slug: { equals: 'home' }","_status: { equals: 'published' }"]);
const env=read('.env.example');
if(!env.includes('postgresql://')||!env.includes('PAYLOAD_SECRET='))throw new Error('Production reference environment contract is incomplete.');
if(/PAYLOAD_SECRET=(?!replace-with)/.test(env))throw new Error('Production reference must not contain a real Payload secret.');
console.log(`PASS production reference: Next.js ${pkg.dependencies.next}, Payload ${pkg.dependencies.payload}, PostgreSQL adapter, authenticated editorial workflow, published-only SSR query.`);
