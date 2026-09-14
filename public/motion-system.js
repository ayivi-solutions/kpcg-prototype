(() => {
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const itemSelector=[
    '.page-shell > .container > *','.xp-section > .container > *','.section > .container > *',
    '.section-head','.xp-section-head','.v16-section-head','.page-title','.xp-title','.ed-title','.section-title',
    '.lede','.grid > *','.portfolio-rail > *','.article-stream > *','.resource-list > *',
    '.policy-stream > *','.v16-pulse-item','.v16-brief','.v16-theme-link','.v16-story',
    '.v16-agenda-item','.metric','.cms-kpi','.chart','.table-wrap','.map-panel','.county-list',
    '.editorial-feature','.detail-aside','.article-body','.filter-panel','.form-actions'
  ].join(',');
  const cardSelector='.card,.programme-x,.article-x,.resource-x,.policy-x,.event-x,.v16-story,.v16-brief,.metric,.cms-kpi';
  let observer;

  const visible=el=>{
    el.classList.add('motion-visible');
    observer?.unobserve(el);
  };

  function buildObserver(){
    observer?.disconnect();
    if(reduced.matches||!('IntersectionObserver' in window)){observer=null;return}
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting)visible(entry.target);
    }),{threshold:.08,rootMargin:'0px 0px -7% 0px'});
  }

  function classify(el,index){
    if(el.classList.contains('motion-item'))return;
    el.classList.add('motion-item');
    el.style.setProperty('--motion-order',String(Math.min(index%8,7)));
    if(el.matches('.detail-aside,.county-list'))el.dataset.motion='right';
    else if(el.matches('.article-body,.filter-panel'))el.dataset.motion='left';
    else if(el.matches('.chart,.map-panel,.editorial-feature,.table-wrap'))el.dataset.motion='scale';
    if(el.matches('.page-title,.xp-title,.ed-title,.section-title'))el.classList.add('motion-heading');
    const rect=el.getBoundingClientRect();
    if(reduced.matches||rect.top<innerHeight*.92)visible(el);else observer?.observe(el);
  }

  function prepareImages(root){
    root.querySelectorAll('img').forEach(img=>{
      if(img.classList.contains('motion-image'))return;
      img.classList.add('motion-image');
      img.parentElement?.classList.add('motion-image-wrap');
      if(img.complete)img.classList.add('motion-image-ready');
      else img.addEventListener('load',()=>img.classList.add('motion-image-ready'),{once:true});
    });
    root.querySelectorAll('.ed-photo img,.xp-detail-hero img,.v16-theme-feature img,.editorial-feature img').forEach(img=>img.classList.add('motion-parallax'));
  }

  function prepareCards(root){
    root.querySelectorAll(cardSelector).forEach(card=>{
      if(card.classList.contains('motion-card'))return;
      card.classList.add('motion-card');
      if(!matchMedia('(hover:hover) and (pointer:fine)').matches||reduced.matches)return;
      card.addEventListener('pointermove',event=>{
        const box=card.getBoundingClientRect();
        const x=(event.clientX-box.left)/box.width-.5;
        const y=(event.clientY-box.top)/box.height-.5;
        card.style.setProperty('--tilt-x',`${(-y*4).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y',`${(x*5).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave',()=>{
        card.style.setProperty('--tilt-x','0deg');
        card.style.setProperty('--tilt-y','0deg');
      });
    });
  }

  function prepareMenu(root){
    root.querySelectorAll('.menu-list').forEach(menu=>[...menu.children].forEach((item,index)=>item.style.setProperty('--motion-order',String(index))));
    root.querySelectorAll('.county-shape').forEach((shape,index)=>shape.style.setProperty('--county-order',String(index)));
  }

  function prepare(root=document){
    if(reduced.matches){root.querySelectorAll(itemSelector).forEach(visible)}
    else root.querySelectorAll(itemSelector).forEach(classify);
    prepareImages(root);
    prepareCards(root);
    prepareMenu(root);
  }

  function routeEnter(){
    document.body.classList.remove('motion-route-leaving');
    document.body.classList.add('motion-route-entering');
    requestAnimationFrame(()=>prepare(document));
    setTimeout(()=>document.body.classList.remove('motion-route-entering'),760);
  }

  function updateScrollEffects(){
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    document.documentElement.style.setProperty('--scroll-progress',String(Math.min(1,scrollY/max)));
    if(reduced.matches)return;
    document.querySelectorAll('.motion-parallax').forEach(img=>{
      const rect=img.parentElement.getBoundingClientRect();
      if(rect.bottom<0||rect.top>innerHeight)return;
      const offset=Math.max(-18,Math.min(18,(innerHeight/2-(rect.top+rect.height/2))*.035));
      img.style.setProperty('--motion-parallax-y',`${offset.toFixed(1)}px`);
    });
  }

  let scrollFrame=0;
  addEventListener('scroll',()=>{
    if(scrollFrame)return;
    scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;updateScrollEffects()});
  },{passive:true});

  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduced.matches)return;
    const trigger=event.target.closest('a[href^="#/"],[data-route^="#/"]');
    if(!trigger||trigger.target==='_blank')return;
    const route=trigger.dataset.route||trigger.getAttribute('href');
    if(!route||route===location.hash)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    document.body.classList.add('motion-route-leaving');
    setTimeout(()=>{location.hash=route.slice(1);},150);
  },true);

  const mutation=new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)prepare(node);
  });

  function start(){
    document.body.classList.add('motion-ready');
    const progress=document.createElement('div');
    progress.className='motion-progress';
    progress.setAttribute('aria-hidden','true');
    document.body.prepend(progress);
    buildObserver();
    prepare(document);
    mutation.observe(document.body,{childList:true,subtree:true});
    updateScrollEffects();
    routeEnter();
  }

  reduced.addEventListener('change',()=>{buildObserver();prepare(document);updateScrollEffects()});
  addEventListener('hashchange',routeEnter);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
