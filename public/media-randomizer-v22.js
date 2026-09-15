(() => {
  'use strict';
  const VERSION='22.0.0';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  let poolPromise;

  const route=()=>(location.hash||'#/home').replace(/^#\/?/,'').split('/')[0]||'home';

  function randomIndex(max){
    if(max<=1)return 0;
    if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%max}
    return Math.floor(Math.random()*max);
  }
  function sample(items,count){
    const pool=[...items],out=[];
    while(pool.length&&out.length<count){const i=randomIndex(pool.length);out.push(pool.splice(i,1)[0])}
    return out;
  }
  function imagePool(){
    if(!poolPromise)poolPromise=fetch('/data/image-pool.json',{cache:'no-store'})
      .then(r=>r.ok?r.json():Promise.reject(new Error(`image pool ${r.status}`)))
      .then(data=>Array.isArray(data.images)?data.images:[])
      .catch(()=>[]);
    return poolPromise;
  }

  function replaceAfterReady(img,src,alt){
    if(!img||!src||img.dataset.kpcgRandomized===VERSION)return;
    img.dataset.kpcgRandomized=VERSION;
    const swap=()=>{
      const preload=new Image();
      preload.onload=()=>{if(img.isConnected){img.src=src;if(alt)img.alt=alt}};
      preload.src=src;
    };
    if(img.complete&&img.naturalWidth>0)swap();
    else img.addEventListener('load',swap,{once:true});
  }

  async function randomizeHome(){
    if(route()!=='home')return;
    const root=$('[data-v16-hero]');
    if(!root||root.dataset.kpcgRandomized===VERSION)return;
    const images=await imagePool();
    if(!images.length||!root.isConnected)return;
    const slides=$$('[data-v16-hero-slide] img',root);
    if(slides.length<2)return;
    const picks=sample(images,slides.length-1);
    slides.slice(1).forEach((img,i)=>{
      const src=picks[i%picks.length];
      img.setAttribute('data-src',src);
      img.removeAttribute('src');
      img.dataset.kpcgRandomized=VERSION;
    });
    root.dataset.kpcgRandomized=VERSION;
  }

  async function randomizeGenericPageImages(){
    const key=route();
    if(key==='home'||['news','events','multimedia'].includes(key))return;
    const page=$('.page-shell');
    if(!page||page.dataset.kpcgGenericMedia===VERSION)return;
    const images=await imagePool();
    if(!images.length||!page.isConnected)return;
    const targets=$$('.ed-hero .ed-photo img,.ed-where-card img,.ed-programme-photo img',page)
      .filter(img=>!img.closest('.leadership-thumb,.article-x,.resource-x,.event-x,.media-card'));
    const picks=sample(images,targets.length);
    targets.forEach((img,i)=>replaceAfterReady(img,picks[i],'KPCG field and stakeholder activity in Kenya'));
    page.dataset.kpcgGenericMedia=VERSION;
  }

  async function fillArchiveStrip(){
    const strip=$('[data-kpcg-random-media-strip]');
    if(!strip||strip.dataset.kpcgMediaFilled===VERSION)return;
    const images=await imagePool();
    if(!images.length||!strip.isConnected)return;
    const picks=sample(images,3);
    $$('img',strip).forEach((img,i)=>{img.src=picks[i%picks.length];img.alt='KPCG documentary image from the platform media archive';img.loading='lazy'});
    const count=$('[data-kpcg-image-count]',strip);if(count)count.textContent=images.length.toLocaleString();
    strip.dataset.kpcgMediaFilled=VERSION;
  }

  async function apply(){
    await Promise.all([randomizeHome(),randomizeGenericPageImages(),fillArchiveStrip()]);
  }

  let frame=0;
  function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;apply()})}
  function start(){apply();new MutationObserver(schedule).observe($('#app')||document.body,{subtree:true,childList:true});addEventListener('hashchange',()=>setTimeout(schedule,0));addEventListener('pageshow',schedule)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
