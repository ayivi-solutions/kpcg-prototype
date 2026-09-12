const RELEASE='kpcg-v16.1-20260912';
const CACHE=`kpcg-${RELEASE}`;
const APP_SHELL=[
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/app/part-01.txt',
  '/app/part-02.txt',
  '/app/part-03.txt',
  '/app/part-04.txt',
  '/app/part-05.txt',
  '/app/patch-v11.txt?v=11',
  '/app/patch-v12.txt?v=12',
  '/app/patch-v13.txt?v=13',
  '/app/patch-v15-01.txt?v=15',
  '/app/patch-v15-02.txt?v=15',
  '/app/patch-v15-03.txt?v=15',
  '/app/patch-v15-04.txt?v=15',
  '/app/patch-v16-01.txt?v=16',
  '/app/patch-v16-02.txt?v=16',
  '/assets/kpcg-logo.webp'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(APP_SHELL))
      .then(()=>self.skipWaiting())
  );
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
    const cached=await cache.match(request,{ignoreSearch:false});
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
    event.respondWith(
      networkFirst(request).catch(async()=>{
        const cache=await caches.open(CACHE);
        return (await cache.match('/index.html')) || Response.error();
      })
    );
    return;
  }

  if(url.pathname.startsWith('/app/') || url.pathname==='/index.html' || url.pathname==='/manifest.webmanifest'){
    event.respondWith(networkFirst(request));
    return;
  }

  if(url.pathname.startsWith('/assets/')){
    event.respondWith(networkFirst(request));
  }
});
