(() => {
  'use strict';
  const V='19.0.2';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const route=()=>(location.hash||'#/home').replace(/^#\/?/,'').split('/')[0]||'home';
  let sectionIO=null,frame=0;

  function css(){
    if($('link[data-x19-css]'))return;
    const l=document.createElement('link');
    l.rel='stylesheet';l.href=`/experience-v19.css?v=${V}`;l.dataset.x19Css=V;document.head.append(l);
  }
  function button(label,text,handler){
    const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',label);b.textContent=text;if(handler)b.addEventListener('click',handler);return b;
  }
  function chrome(){
    if(!$('.x19-section-nav')){const n=document.createElement('nav');n.className='x19-section-nav';n.hidden=true;n.setAttribute('aria-label','On this page');document.body.append(n)}
    $$('.x19-dock').forEach(node=>node.remove());
    document.body.classList.remove('x19-focus');
    localStorage.removeItem('kpcg-x19-focus');
  }
  function routeState(){
    document.documentElement.classList.add('x19-ready');document.body.classList.add('x19-experience');document.documentElement.dataset.x19Route=route();
    document.body.classList.remove('x19-route-enter');void document.body.offsetWidth;document.body.classList.add('x19-route-enter');
    setTimeout(()=>document.body.classList.remove('x19-route-enter'),760);
  }
  function physics(root=document){
    $$('.card,.map-panel,.chart,.editorial-feature,.dash-panel,.v16-story,.v16-theme-feature,.theme-stage,.resource-x,.policy-x,.programme-x,.event-x',root).forEach(el=>{
      if(el.dataset.x19Surface)return;el.dataset.x19Surface='1';el.classList.add('x19-surface');
      if(reduced.matches||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
      el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect();el.style.setProperty('--x19-x',`${((e.clientX-b.left)/b.width*100).toFixed(1)}%`);el.style.setProperty('--x19-y',`${((e.clientY-b.top)/b.height*100).toFixed(1)}%`)})
    })
  }
  function sectionNav(){
    const nav=$('.x19-section-nav');if(!nav)return;sectionIO?.disconnect();nav.replaceChildren();
    const hs=$$('main h2').filter(h=>h.offsetParent!==null&&(h.textContent||'').trim().length>1).slice(0,8);
    if(hs.length<2||innerWidth<1180){nav.hidden=true;return}nav.hidden=false;
    hs.forEach((h,i)=>{if(!h.id)h.id=`x19-section-${i}`;nav.append(button((h.textContent||'').trim().slice(0,48),'',()=>h.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'})))});
    const bs=$$('button',nav);sectionIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const i=hs.indexOf(e.target);bs.forEach((b,n)=>b.classList.toggle('active',n===i))}}),{rootMargin:'-28% 0px -58% 0px'});hs.forEach(h=>sectionIO.observe(h));bs[0]?.classList.add('active')
  }
  function rail(el,autoplay=false){
    if(!el||el.dataset.x19Rail)return;el.dataset.x19Rail='1';el.classList.add('x19-rail-track');
    const shell=document.createElement('div');shell.className='x19-rail-shell';el.before(shell);shell.append(el);
    const head=document.createElement('div');head.className='x19-rail-head';
    [-1,1].forEach(dir=>head.append(button(dir<0?'Previous items':'Next items',dir<0?'←':'→',()=>el.scrollBy({left:dir*el.clientWidth*.82,behavior:reduced.matches?'auto':'smooth'}))));shell.prepend(head);
    if(autoplay&&!reduced.matches){const id=setInterval(()=>{if(document.visibilityState!=='visible'||!el.isConnected)return;const end=el.scrollLeft+el.clientWidth>=el.scrollWidth-12;el.scrollTo({left:end?0:el.scrollLeft+el.clientWidth*.72,behavior:'smooth'})},6200);el.addEventListener('pointerenter',()=>clearInterval(id),{once:true})}
  }
  function knowledge(){
    const r=$('#resourceResults');if(!r||r.dataset.x19Views)return;r.dataset.x19Views='1';r.classList.add('x19-list-view');
    const bar=document.createElement('div');bar.className='x19-viewbar';const label=document.createElement('strong');label.textContent='Evidence workspace';const controls=document.createElement('div');
    ['list','grid'].forEach(v=>{const b=button(`${v} view`,v[0].toUpperCase()+v.slice(1),()=>{r.classList.toggle('x19-list-view',v==='list');r.classList.toggle('x19-grid-view',v==='grid');$$('button',controls).forEach(x=>x.classList.toggle('active',x===b));localStorage.setItem('kpcg-x19-resource-view',v)});b.dataset.view=v;if(v==='list')b.classList.add('active');controls.append(b)});bar.append(label,controls);r.before(bar);if(localStorage.getItem('kpcg-x19-resource-view')==='grid')$('[data-view="grid"]',bar)?.click()
  }
  function mapGuide(){
    $$('.map-panel.kpcg-adm').forEach(p=>{if($('.x19-map-guide',p))return;const g=document.createElement('div');g.className='x19-map-guide';g.setAttribute('aria-hidden','true');['ADM0 Kenya','ADM1 Counties','ADM2 Sub-counties','ADM3 Wards'].forEach((t,i)=>{if(i){const line=document.createElement('i');g.append(line)}const s=document.createElement('span');s.textContent=t;g.append(s)});p.append(g);
      const update=()=>{const n=Number((($('.lvl',p)?.textContent||'').match(/ADM(\d)/)||[])[1]||1);$$('span',g).forEach((s,i)=>s.classList.toggle('active',i===n))};update();new MutationObserver(update).observe(p,{subtree:true,childList:true,characterData:true})
    })
  }
  function enhance(){
    const r=route();
    if(r==='themes')$('.page-shell .grid.three')?.setAttribute('data-x19-mode','bento');
    if(r==='programmes')rail($('#programmeResults'));
    if(r==='knowledge')knowledge();
    if(r==='news'){const s=$('.article-stream');if(s?.children.length>5)s.dataset.x19Mode='newsroom'}
    if(r==='events'){const x=$('.event-stage')||$('.page-shell .grid.three');if(x?.children.length>3)rail(x)}
    if(r==='multimedia'){const x=$('.media-grid')||$('.page-shell .grid.three');if(x)x.dataset.x19Mode='reel'}
    if(r==='home')$$('.v16-agenda,.article-stream,.resource-list').forEach((x,i)=>{if(x.children.length>4&&i<2)rail(x,i===0)});
  }
  function refresh(){chrome();physics();enhance();mapGuide();sectionNav()}
  function apply(){routeState();refresh()}
  function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;refresh()})}
  function start(){css();chrome();apply();new MutationObserver(schedule).observe($('#app')||document.body,{subtree:true,childList:true});addEventListener('hashchange',()=>setTimeout(apply,0));addEventListener('resize',()=>{clearTimeout(window.__x19Resize);window.__x19Resize=setTimeout(sectionNav,160)},{passive:true});window.KPCGExperience=Object.freeze({version:V,refresh})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
