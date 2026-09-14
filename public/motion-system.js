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
  const tickerUpdates=[
    ['#/news','KPCG stories, field updates and climate-governance insights'],
    ['#/where-we-work','Explore climate action and governance across all 47 counties'],
    ['#/knowledge','Climate Intelligence connects evidence, policy and WHO/UN indicator frameworks'],
    ['#/programmes','Follow KPCG programmes, projects and county-level implementation'],
    ['#/events','Track KPCG events, dialogues and public-participation opportunities'],
    ['#/opportunities','See current calls, grants, consultancies, jobs and learning opportunities']
  ];
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

  function ensureTickerStyles(){
    if(document.querySelector('style[data-kpcg-ticker-styles]'))return;
    const style=document.createElement('style');
    style.dataset.kpcgTickerStyles='1';
    style.textContent=`
      .kpcg-news-ticker{
        --ticker-height:38px;
        display:grid;
        grid-template-columns:auto minmax(0,1fr);
        min-height:var(--ticker-height);
        background:#063726;
        color:#fff;
        border-top:1px solid rgba(255,255,255,.10);
        border-bottom:1px solid rgba(0,0,0,.18);
        overflow:hidden;
        position:relative;
        isolation:isolate;
      }
      .kpcg-ticker-label{
        position:relative;
        z-index:2;
        min-height:var(--ticker-height);
        display:flex;
        align-items:center;
        gap:8px;
        padding:0 16px;
        background:#a84a2a;
        color:#fff;
        font-size:.7rem;
        line-height:1;
        font-weight:900;
        letter-spacing:.11em;
        text-transform:uppercase;
        white-space:nowrap;
        box-shadow:8px 0 18px rgba(0,0,0,.12);
      }
      .kpcg-ticker-dot{
        width:7px;
        height:7px;
        border-radius:50%;
        background:#f0ce83;
        box-shadow:0 0 0 5px rgba(240,206,131,.14);
        animation:kpcgTickerPulse 2s ease-in-out infinite;
        flex:0 0 auto;
      }
      .kpcg-ticker-viewport{
        min-width:0;
        overflow:hidden;
        display:flex;
        align-items:center;
        mask-image:linear-gradient(90deg,transparent 0,#000 22px,#000 calc(100% - 22px),transparent 100%);
        -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 22px,#000 calc(100% - 22px),transparent 100%);
      }
      .kpcg-ticker-track{
        display:flex;
        align-items:stretch;
        width:max-content;
        min-width:max-content;
        will-change:transform;
        animation:kpcgTickerScroll 52s linear infinite;
      }
      .kpcg-ticker-set{
        display:flex;
        align-items:stretch;
        flex:0 0 auto;
      }
      .kpcg-ticker-item{
        min-height:var(--ticker-height);
        display:inline-flex;
        align-items:center;
        gap:26px;
        padding:0 0 0 26px;
        color:#f7fbf8;
        font-size:.78rem;
        line-height:1.2;
        font-weight:720;
        white-space:nowrap;
        text-decoration:none;
        transition:background-color .18s ease,color .18s ease;
      }
      .kpcg-ticker-item::after{
        content:"◆";
        font-size:.42rem;
        color:#f0ce83;
        opacity:.72;
      }
      .kpcg-ticker-item:hover,
      .kpcg-ticker-item:focus-visible{
        color:#f0ce83;
        background:rgba(255,255,255,.055);
      }
      .kpcg-news-ticker:hover .kpcg-ticker-track,
      .kpcg-news-ticker:focus-within .kpcg-ticker-track{
        animation-play-state:paused;
      }
      @keyframes kpcgTickerScroll{
        from{transform:translate3d(0,0,0)}
        to{transform:translate3d(-50%,0,0)}
      }
      @keyframes kpcgTickerPulse{
        50%{box-shadow:0 0 0 9px rgba(240,206,131,0)}
      }
      @media(max-width:640px){
        .kpcg-news-ticker{--ticker-height:36px}
        .kpcg-ticker-label{padding:0 11px;font-size:.62rem;letter-spacing:.085em}
        .kpcg-ticker-label-text{font-size:0}
        .kpcg-ticker-label-text::after{content:"LATEST";font-size:.62rem}
        .kpcg-ticker-item{padding-left:20px;gap:20px;font-size:.74rem}
        .kpcg-ticker-track{animation-duration:44s}
      }
      @media(prefers-reduced-motion:reduce){
        .kpcg-ticker-dot{animation:none}
        .kpcg-ticker-viewport{overflow-x:auto;mask-image:none;-webkit-mask-image:none;scrollbar-width:thin}
        .kpcg-ticker-track{animation:none}
        .kpcg-ticker-set[aria-hidden="true"]{display:none}
      }
    `;
    document.head.appendChild(style);
  }

  function buildTickerSet(hidden=false){
    const set=document.createElement('div');
    set.className='kpcg-ticker-set';
    if(hidden)set.setAttribute('aria-hidden','true');
    tickerUpdates.forEach(([href,text])=>{
      const link=document.createElement('a');
      link.className='kpcg-ticker-item';
      link.href=href;
      link.textContent=text;
      if(hidden)link.tabIndex=-1;
      set.appendChild(link);
    });
    return set;
  }

  function ensureTicker(){
    const header=document.querySelector('.site-header');
    if(!header)return;
    if(header.querySelector('.kpcg-news-ticker'))return;
    ensureTickerStyles();
    const ticker=document.createElement('div');
    ticker.className='kpcg-news-ticker';
    ticker.setAttribute('role','region');
    ticker.setAttribute('aria-label','Latest KPCG updates');

    const label=document.createElement('div');
    label.className='kpcg-ticker-label';
    const dot=document.createElement('span');
    dot.className='kpcg-ticker-dot';
    dot.setAttribute('aria-hidden','true');
    const labelText=document.createElement('span');
    labelText.className='kpcg-ticker-label-text';
    labelText.textContent='KPCG Latest';
    label.append(dot,labelText);

    const viewport=document.createElement('div');
    viewport.className='kpcg-ticker-viewport';
    const track=document.createElement('div');
    track.className='kpcg-ticker-track';
    track.setAttribute('aria-live','off');
    track.append(buildTickerSet(false),buildTickerSet(true));
    viewport.appendChild(track);
    ticker.append(label,viewport);
    header.appendChild(ticker);
  }

  function prepare(root=document){
    if(reduced.matches){root.querySelectorAll(itemSelector).forEach(visible)}
    else root.querySelectorAll(itemSelector).forEach(classify);
    prepareImages(root);
    prepareCards(root);
    prepareMenu(root);
    ensureTicker();
  }

  function routeEnter(){
    document.body.classList.remove('motion-route-leaving');
    document.body.classList.add('motion-route-entering');
    requestAnimationFrame(()=>{
      prepare(document);
      ensureTicker();
    });
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
    let shouldEnsureTicker=false;
    for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1){prepare(node);shouldEnsureTicker=true}
    if(shouldEnsureTicker)ensureTicker();
  });

  function start(){
    document.body.classList.add('motion-ready');
    const progress=document.createElement('div');
    progress.className='motion-progress';
    progress.setAttribute('aria-hidden','true');
    document.body.prepend(progress);
    buildObserver();
    prepare(document);
    ensureTicker();
    mutation.observe(document.body,{childList:true,subtree:true});
    updateScrollEffects();
    routeEnter();
  }

  reduced.addEventListener('change',()=>{buildObserver();prepare(document);updateScrollEffects()});
  addEventListener('hashchange',routeEnter);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

// Administrative hierarchy extension. Kept separate from the core app so the
// supplied geoBoundaries evidence can evolve without rebuilding the SPA bundle.
(() => {
  if(document.querySelector('script[data-kpcg-admin-map]'))return;
  const script=document.createElement('script');
  script.src='/admin-map-v17.js?v=19.0.0';
  script.defer=true;
  script.dataset.kpcgAdminMap='17.2-adm3';
  document.head.appendChild(script);
})();
