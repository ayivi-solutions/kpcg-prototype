const RELEASE='kpcg-v17.0-theme-20260914';
const CACHE=`kpcg-${RELEASE}`;
const APP_SHELL=[
  '/',
  '/manifest.webmanifest',
  '/motion-system.css',
  '/motion-system.js',
  '/ip-guard.css',
  '/ip-guard.js',
  '/editorial-redesign-v3.js',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/assets/kpcg-logo.webp',
  '/assets/kpcg-social-card.jpg',
  '/assets/kpcg_images_v1/470222578_552600794423862_3455318813895875629_n.jpg'
];
const SHELL_PATHS=new Set(APP_SHELL);

async function precache(){
  const cache=await caches.open(CACHE);
  for(const url of APP_SHELL){
    const response=await fetch(new Request(url,{cache:'reload'}));
    if(!response.ok)throw new Error(`KPCG precache failed: ${url} returned ${response.status}`);
    await cache.put(url,response.clone());
  }
  await self.skipWaiting();
}

self.addEventListener('install',event=>{
  event.waitUntil(precache());
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

const networkFirst=async request=>{
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request);
    if(response&&response.ok)await cache.put(request,response.clone());
    return response;
  }catch(error){
    const cached=await cache.match(request,{ignoreSearch:true});
    if(cached)return cached;
    throw error;
  }
};

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith(networkFirst(request).catch(async()=>{
      const cache=await caches.open(CACHE);
      return (await cache.match('/'))||Response.error();
    }));
    return;
  }

  if(SHELL_PATHS.has(url.pathname)||url.pathname.startsWith('/assets/')){
    event.respondWith(networkFirst(request));
  }
});
