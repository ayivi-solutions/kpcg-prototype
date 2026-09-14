(() => {
  'use strict';
  const VERSION='17.2-adm3';
  const EXPERIENCE='19.0.0';
  const slugs=new Map();
  const norm=value=>String(value??'').toLowerCase().normalize('NFKD').replace(/[\u2018\u2019']/g,'').replace(/\bcity\b|\bcounty\b/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const shapeName=shape=>{
    const raw=shape.querySelector('title')?.textContent||shape.parentElement?.querySelector('title')?.textContent||shape.getAttribute('aria-label')||'';
    return raw.split(/\s+(?:—|-|·)\s+|\s+county:/i)[0].trim();
  };
  const capture=(root=document)=>{
    root.querySelectorAll?.('.map-panel .county-shape[data-county]').forEach(shape=>{
      const name=shapeName(shape),slug=shape.dataset.county;
      if(name&&slug)slugs.set(norm(name),slug);
    });
  };
  const annotate=(root=document)=>{
    root.querySelectorAll?.(`.map-panel[data-admin-enhanced="${VERSION}"] .county-shape:not([data-county])`).forEach(shape=>{
      const name=shapeName(shape),key=norm(name),slug=slugs.get(key)||key.replace(/\s+/g,'-');
      if(slug)shape.dataset.county=slug;
    });
  };
  const loadExperience=()=>{
    if(document.querySelector('script[data-kpcg-experience]'))return;
    const script=document.createElement('script');
    script.src=`/experience-v19.js?v=${EXPERIENCE}`;
    script.defer=true;
    script.dataset.kpcgExperience=EXPERIENCE;
    script.onerror=()=>console.warn('[KPCG UX] experience layer failed to load');
    document.head.appendChild(script);
  };
  const install=()=>{
    loadExperience();
    capture();
    annotate();
    const observer=new MutationObserver(records=>{
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType!==1)continue;
          capture(node);
          annotate(node);
        }
      }
      requestAnimationFrame(()=>annotate());
    });
    observer.observe(document.body,{subtree:true,childList:true});
    if(document.querySelector('script[data-kpcg-admin-core]'))return;
    const core=document.createElement('script');
    core.src='/admin-map-core-v17.js?v=19.0.0';
    core.defer=true;
    core.dataset.kpcgAdminCore=VERSION;
    core.addEventListener('load',()=>requestAnimationFrame(()=>annotate()));
    core.onerror=()=>console.warn('[KPCG ADM] administrative map core failed to load');
    document.head.appendChild(core);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
