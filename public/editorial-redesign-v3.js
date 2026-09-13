/* KPCG Editorial Civic Redesign v3.0 — additive presentation layer.
   Preserves the existing prototype data, routes, CMS, search, filters and drill-downs. */
(() => {
  'use strict';
  const VERSION = 'v18.0-editorial-20260913';
  const IMAGES = {
    home:'/assets/kpcg_images_v1/470222578_552600794423862_3455318813895875629_n.jpg',
    about:'/assets/kpcg_images_v1/470226400_552600767757198_412466893504538283_n.jpg',
    about2:'/assets/kpcg_images_v1/470230681_552600891090519_1690716036763891279_n.jpg',
    where:'/assets/kpcg_images_v1/473800309_577076861976255_6720883598004670745_n.jpg',
    programme:'/assets/kpcg_images_v1/474034731_577835388567069_6309111983372585258_n.jpg'
  };

  const CSS = `
  html[data-kpcg-editorial="v18"]{--ed-green:#0b5139;--ed-deep:#082f24;--ed-ink:#17211d;--ed-cream:#f5f1e7;--ed-paper:#fffdf8;--ed-gold:#c4861a;--ed-rust:#a84a2a;--ed-line:#d8ded8}
  html[data-kpcg-editorial="v18"] body{background:var(--ed-paper);color:var(--ed-ink)}
  html[data-kpcg-editorial="v18"] .prototype-badge,
  html[data-kpcg-editorial="v18"] .demo-toggle{display:none!important}
  html[data-kpcg-editorial="v18"] .desktop-menu-more{display:none!important}
  html[data-kpcg-editorial="v18"] .site-header{background:rgba(255,253,248,.97);border-bottom:1px solid rgba(216,222,216,.9)}
  html[data-kpcg-editorial="v18"] .page-shell{padding-top:0}
  html[data-kpcg-editorial="v18"] .page-title,
  html[data-kpcg-editorial="v18"] .xp-title{font-size:clamp(2.5rem,5.7vw,4.9rem)!important;line-height:.98!important;letter-spacing:-.045em!important}
  html[data-kpcg-editorial="v18"] .xp-signal,
  html[data-kpcg-editorial="v18"] .climate-orbit{display:none!important}
  html[data-kpcg-editorial="v18"] .btn.secondary{color:var(--ed-green)!important;border-color:var(--ed-green)!important;background:#fff!important}
  html[data-kpcg-editorial="v18"] .btn.secondary:hover{background:#e8f1ec!important;color:#063726!important}
  html[data-kpcg-editorial="v18"] .xp-section.alt,
  html[data-kpcg-editorial="v18"] .section.alt{background:var(--ed-cream)!important}
  html[data-kpcg-editorial="v18"] .ed-hero{margin-inline:calc(50% - 50vw);width:100vw;overflow:hidden}
  html[data-kpcg-editorial="v18"] .ed-wrap{width:min(calc(100% - 40px),1280px);margin:auto}
  html[data-kpcg-editorial="v18"] .ed-kicker{font-size:.76rem;text-transform:uppercase;letter-spacing:.14em;font-weight:850;color:var(--ed-rust)}
  html[data-kpcg-editorial="v18"] .ed-title{font-size:clamp(2.45rem,5vw,4.8rem);line-height:.98;letter-spacing:-.05em;margin:.22em 0 .28em;max-width:14ch}
  html[data-kpcg-editorial="v18"] .ed-copy{font-size:clamp(1rem,1.65vw,1.24rem);line-height:1.65;color:#40514a;max-width:62ch}
  html[data-kpcg-editorial="v18"] .ed-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}
  html[data-kpcg-editorial="v18"] .ed-stat-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border-top:1px solid var(--ed-line);border-bottom:1px solid var(--ed-line);margin-top:30px}
  html[data-kpcg-editorial="v18"] .ed-stat{padding:17px 16px 17px 0;border-right:1px solid var(--ed-line)}
  html[data-kpcg-editorial="v18"] .ed-stat:last-child{border-right:0;padding-left:16px}
  html[data-kpcg-editorial="v18"] .ed-stat b{display:block;font-size:1.75rem;line-height:1;color:var(--ed-green);letter-spacing:-.04em}
  html[data-kpcg-editorial="v18"] .ed-stat span{display:block;font-size:.74rem;color:#68766f;margin-top:7px}
  html[data-kpcg-editorial="v18"] .ed-photo{position:relative;overflow:hidden;background:#dfe8e2}
  html[data-kpcg-editorial="v18"] .ed-photo img{width:100%;height:100%;object-fit:cover}
  html[data-kpcg-editorial="v18"] .ed-caption{position:absolute;left:16px;right:16px;bottom:16px;background:rgba(8,47,36,.88);color:#fff;padding:12px 14px;font-size:.78rem;backdrop-filter:blur(7px)}
  html[data-kpcg-editorial="v18"] .ed-factband{background:#fff!important;border-top:1px solid var(--ed-line)!important;border-bottom:1px solid var(--ed-line)!important;box-shadow:none!important}
  html[data-kpcg-editorial="v18"] .ed-factband .xp-metric{background:transparent!important;border-right:1px solid var(--ed-line)!important}
  html[data-kpcg-editorial="v18"] .ed-factband .xp-metric b{color:var(--ed-green)!important}

  html[data-kpcg-editorial="v18"] .ed-home{background:var(--ed-deep);color:#fff;padding:70px 0}
  html[data-kpcg-editorial="v18"] .ed-home-grid{display:grid;grid-template-columns:.92fr 1.08fr;min-height:570px;align-items:stretch}
  html[data-kpcg-editorial="v18"] .ed-home-copy{padding:54px 48px 54px 0;display:flex;flex-direction:column;justify-content:center}
  html[data-kpcg-editorial="v18"] .ed-home .ed-kicker{color:#e3bf73}
  html[data-kpcg-editorial="v18"] .ed-home .ed-title{max-width:11ch;font-size:clamp(3rem,6vw,5.7rem)}
  html[data-kpcg-editorial="v18"] .ed-home .ed-copy{color:#d7e5de}
  html[data-kpcg-editorial="v18"] .ed-home .ed-stat-row{border-color:rgba(255,255,255,.22)}
  html[data-kpcg-editorial="v18"] .ed-home .ed-stat{border-color:rgba(255,255,255,.18)}
  html[data-kpcg-editorial="v18"] .ed-home .ed-stat b{color:#fff}
  html[data-kpcg-editorial="v18"] .ed-home .ed-stat span{color:#c7d6cf}
  html[data-kpcg-editorial="v18"] .ed-home-visual{min-height:570px;clip-path:polygon(8% 0,100% 0,100% 100%,0 100%)}

  html[data-kpcg-editorial="v18"] .ed-about{background:#fff;padding:62px 0 72px}
  html[data-kpcg-editorial="v18"] .ed-about-grid{display:grid;grid-template-columns:1fr 1.02fr;gap:58px;align-items:center}
  html[data-kpcg-editorial="v18"] .ed-about .ed-title{max-width:11ch}
  html[data-kpcg-editorial="v18"] .ed-collage{display:grid;grid-template-columns:1.25fr .75fr;grid-template-rows:250px 210px;gap:10px;min-height:470px}
  html[data-kpcg-editorial="v18"] .ed-collage .ed-photo:first-child{grid-row:1/3}
  html[data-kpcg-editorial="v18"] .ed-collage-note{background:var(--ed-green);color:#fff;padding:22px;display:flex;flex-direction:column;justify-content:flex-end}
  html[data-kpcg-editorial="v18"] .ed-collage-note strong{font-size:1.45rem;line-height:1.05}

  html[data-kpcg-editorial="v18"] .ed-themes{background:var(--ed-cream);padding:62px 0 68px}
  html[data-kpcg-editorial="v18"] .ed-themes-head{display:grid;grid-template-columns:.85fr 1.15fr;gap:70px;align-items:end;margin-bottom:36px}
  html[data-kpcg-editorial="v18"] .ed-themes .ed-title{max-width:10ch;margin-bottom:0}
  html[data-kpcg-editorial="v18"] .ed-taxonomy{display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid #bcc8c0;border-left:1px solid #bcc8c0;background:#fff}
  html[data-kpcg-editorial="v18"] .ed-theme-cell{min-height:145px;padding:17px;border-right:1px solid #bcc8c0;border-bottom:1px solid #bcc8c0;display:flex;flex-direction:column;justify-content:space-between;transition:.2s}
  html[data-kpcg-editorial="v18"] .ed-theme-cell:hover{background:#e9f1ec;transform:translateY(-2px)}
  html[data-kpcg-editorial="v18"] .ed-theme-cell b{font-size:1.55rem;color:var(--ed-green)}
  html[data-kpcg-editorial="v18"] .ed-theme-cell span{font-size:.82rem;font-weight:760;line-height:1.25}

  html[data-kpcg-editorial="v18"] .ed-programmes{background:#fff;padding:60px 0 70px}
  html[data-kpcg-editorial="v18"] .ed-programmes-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:54px;align-items:stretch}
  html[data-kpcg-editorial="v18"] .ed-programmes .ed-title{max-width:9ch}
  html[data-kpcg-editorial="v18"] .ed-ledger{background:var(--ed-deep);color:#fff;padding:28px;display:grid;gap:0;align-content:start}
  html[data-kpcg-editorial="v18"] .ed-ledger-top{display:flex;justify-content:space-between;gap:20px;align-items:end;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.2)}
  html[data-kpcg-editorial="v18"] .ed-ledger-top strong{font-size:1.55rem}
  html[data-kpcg-editorial="v18"] .ed-ledger-row{display:grid;grid-template-columns:1fr auto;gap:16px;padding:17px 0;border-bottom:1px solid rgba(255,255,255,.15)}
  html[data-kpcg-editorial="v18"] .ed-ledger-row span{color:#d4e2db;font-size:.83rem}
  html[data-kpcg-editorial="v18"] .ed-ledger-row b{font-size:1.7rem}
  html[data-kpcg-editorial="v18"] .ed-programme-photo{height:155px;margin-top:22px;overflow:hidden;opacity:.92}
  html[data-kpcg-editorial="v18"] .ed-programme-photo img{width:100%;height:100%;object-fit:cover}

  html[data-kpcg-editorial="v18"] .ed-policy{background:#fff;padding:58px 0 68px;border-top:8px solid var(--ed-gold)}
  html[data-kpcg-editorial="v18"] .ed-policy-grid{display:grid;grid-template-columns:.72fr 1.28fr;gap:66px;align-items:start}
  html[data-kpcg-editorial="v18"] .ed-policy .ed-title{max-width:9ch}
  html[data-kpcg-editorial="v18"] .ed-process{counter-reset:stage;display:grid;grid-template-columns:repeat(7,1fr);border-top:1px solid #b9c4bd;margin-top:16px}
  html[data-kpcg-editorial="v18"] .ed-process-step{counter-increment:stage;position:relative;padding:28px 10px 14px 0;min-height:130px}
  html[data-kpcg-editorial="v18"] .ed-process-step:before{content:counter(stage,decimal-leading-zero);position:absolute;top:-14px;left:0;background:#fff;padding-right:9px;color:var(--ed-rust);font-size:.72rem;font-weight:850}
  html[data-kpcg-editorial="v18"] .ed-process-step strong{display:block;font-size:.82rem;line-height:1.2}
  html[data-kpcg-editorial="v18"] .ed-process-note{margin-top:22px;background:var(--ed-cream);padding:20px;border-left:4px solid var(--ed-green);font-size:.9rem}

  html[data-kpcg-editorial="v18"] .ed-knowledge{background:#f7f5ef;padding:55px 0 64px}
  html[data-kpcg-editorial="v18"] .ed-knowledge-grid{display:grid;grid-template-columns:.65fr 1.35fr;gap:64px;align-items:end}
  html[data-kpcg-editorial="v18"] .ed-knowledge .ed-title{max-width:9ch;font-size:clamp(2.8rem,5.4vw,5.1rem)}
  html[data-kpcg-editorial="v18"] .ed-search-shell{background:#fff;border:1px solid #bfc9c2;padding:18px;box-shadow:0 18px 44px rgba(13,48,35,.09)}
  html[data-kpcg-editorial="v18"] .ed-search-main{display:grid;grid-template-columns:1fr auto;gap:10px}
  html[data-kpcg-editorial="v18"] .ed-search-main input{min-height:58px;font-size:1.03rem;border-radius:2px}
  html[data-kpcg-editorial="v18"] .ed-search-main .btn{min-height:58px;border-radius:2px;padding-inline:24px}
  html[data-kpcg-editorial="v18"] .ed-search-types{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}
  html[data-kpcg-editorial="v18"] .ed-search-types a{font-size:.74rem;font-weight:760;border:1px solid #cbd3ce;padding:7px 9px;background:#fff}
  html[data-kpcg-editorial="v18"] .ed-evidence-note{margin-top:18px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  html[data-kpcg-editorial="v18"] .ed-evidence-note div{padding:15px;background:#e8efe9;font-size:.78rem}
  html[data-kpcg-editorial="v18"] .ed-evidence-note b{display:block;color:var(--ed-green);font-size:1.15rem}

  html[data-kpcg-editorial="v18"] .ed-where{background:var(--ed-deep);color:#fff;padding:62px 0 70px}
  html[data-kpcg-editorial="v18"] .ed-where-grid{display:grid;grid-template-columns:.78fr 1.22fr;gap:54px;align-items:stretch}
  html[data-kpcg-editorial="v18"] .ed-where .ed-kicker{color:#e4bd72}
  html[data-kpcg-editorial="v18"] .ed-where .ed-title{max-width:8ch}
  html[data-kpcg-editorial="v18"] .ed-where .ed-copy{color:#d5e2dc}
  html[data-kpcg-editorial="v18"] .ed-where-card{position:relative;min-height:430px;overflow:hidden}
  html[data-kpcg-editorial="v18"] .ed-where-card img{width:100%;height:100%;object-fit:cover}
  html[data-kpcg-editorial="v18"] .ed-where-overlay{position:absolute;inset:auto 0 0 0;padding:24px;background:linear-gradient(transparent,rgba(3,29,20,.94));display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:end}
  html[data-kpcg-editorial="v18"] .ed-where-overlay b{font-size:4.2rem;line-height:.85;letter-spacing:-.06em}
  html[data-kpcg-editorial="v18"] .ed-where-overlay span{font-size:.82rem;color:#d8e5de}

  @media(max-width:980px){
    html[data-kpcg-editorial="v18"] .ed-home-grid,
    html[data-kpcg-editorial="v18"] .ed-about-grid,
    html[data-kpcg-editorial="v18"] .ed-themes-head,
    html[data-kpcg-editorial="v18"] .ed-programmes-grid,
    html[data-kpcg-editorial="v18"] .ed-policy-grid,
    html[data-kpcg-editorial="v18"] .ed-knowledge-grid,
    html[data-kpcg-editorial="v18"] .ed-where-grid{grid-template-columns:1fr}
    html[data-kpcg-editorial="v18"] .ed-home-copy{padding-right:0}
    html[data-kpcg-editorial="v18"] .ed-home-visual{min-height:390px;clip-path:none}
    html[data-kpcg-editorial="v18"] .ed-taxonomy{grid-template-columns:repeat(2,1fr)}
    html[data-kpcg-editorial="v18"] .ed-process{grid-template-columns:repeat(2,1fr)}
    html[data-kpcg-editorial="v18"] .ed-stat-row{grid-template-columns:repeat(2,1fr)}
  }
  @media(max-width:640px){
    html[data-kpcg-editorial="v18"] .ed-wrap{width:min(calc(100% - 28px),1280px)}
    html[data-kpcg-editorial="v18"] .ed-hero{padding-block:42px}
    html[data-kpcg-editorial="v18"] .ed-title{font-size:clamp(2.2rem,12vw,3.35rem)}
    html[data-kpcg-editorial="v18"] .ed-home{padding-top:44px}
    html[data-kpcg-editorial="v18"] .ed-home .ed-title{font-size:clamp(2.7rem,14vw,4rem)}
    html[data-kpcg-editorial="v18"] .ed-collage{grid-template-columns:1fr;grid-template-rows:300px 190px auto}
    html[data-kpcg-editorial="v18"] .ed-collage .ed-photo:first-child{grid-row:auto}
    html[data-kpcg-editorial="v18"] .ed-taxonomy{grid-template-columns:1fr 1fr}
    html[data-kpcg-editorial="v18"] .ed-theme-cell{min-height:120px}
    html[data-kpcg-editorial="v18"] .ed-process{grid-template-columns:1fr}
    html[data-kpcg-editorial="v18"] .ed-process-step{min-height:78px;border-bottom:1px solid #d5ddd8}
    html[data-kpcg-editorial="v18"] .ed-search-main{grid-template-columns:1fr}
    html[data-kpcg-editorial="v18"] .ed-evidence-note{grid-template-columns:1fr}
    html[data-kpcg-editorial="v18"] .ed-stat-row{grid-template-columns:1fr 1fr}
    html[data-kpcg-editorial="v18"] .ed-where-card{min-height:330px}
  }`;

  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function statsFrom(hero){
    return [...hero.querySelectorAll('.xp-node')].map(n=>({value:(n.querySelector('b')?.textContent||'').trim(),label:(n.querySelector('span')?.textContent||'').trim()})).filter(x=>x.value||x.label).slice(0,4);
  }
  function statRow(stats){return stats.length?`<div class="ed-stat-row">${stats.map(x=>`<div class="ed-stat"><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join('')}</div>`:''}
  function actions(primaryHref,primaryLabel,secondaryHref,secondaryLabel){return `<div class="ed-actions"><a class="btn" href="${primaryHref}">${esc(primaryLabel)}</a><a class="btn secondary" href="${secondaryHref}">${esc(secondaryLabel)}</a></div>`}
  function route(){return (location.hash||'#/home').split('?')[0]}

  function homeHero(stats){return `<section class="ed-hero ed-home"><div class="ed-wrap ed-home-grid"><div class="ed-home-copy"><div class="ed-kicker">Kenya Platform for Climate Governance</div><h1 class="ed-title">Climate governance, seen through people, place and evidence.</h1><p class="ed-copy">Move from national priorities to counties, programmes, policy processes and the evidence behind them — through one connected civic platform.</p>${actions('#nationalPulse','Explore the national pulse','#/where-we-work','Explore Kenya')}${statRow(stats)}</div><div class="ed-photo ed-home-visual"><img src="${IMAGES.home}" alt="KPCG climate-governance engagement in Kenya"><div class="ed-caption">A national platform should feel inhabited: county realities, public participation, evidence and implementation remain visible together.</div></div></div></section>`}

  function aboutHero(stats){return `<section class="ed-hero ed-about"><div class="ed-wrap ed-about-grid"><div><div class="ed-kicker">About KPCG</div><h1 class="ed-title">A national civic institution built around climate justice and participation.</h1><p class="ed-copy">KPCG connects grassroots and civil-society actors, county realities, evidence and national policy processes. This page introduces the institution through its mandate, governance, people and public purpose.</p>${actions('#institutionalJourney','Explore the institutional journey','#/governance','Governance & Secretariat')}${statRow(stats)}</div><div class="ed-collage" aria-label="KPCG people and engagement"><div class="ed-photo"><img src="${IMAGES.about}" alt="KPCG stakeholder engagement"></div><div class="ed-photo"><img src="${IMAGES.about2}" alt="KPCG community and stakeholder participation"></div><div class="ed-collage-note"><span class="ed-kicker" style="color:#e4bd72">Institutional character</span><strong>People first. Evidence visible. Governance accountable.</strong></div></div></div></section>`}

  const themeLabels=['Adaptation & resilience','Mitigation','Climate finance','Technology & knowledge','Inclusive governance','Gender & youth','Locally led action','Just transition','Circular economy','Food systems'];
  function themesHero(){return `<section class="ed-hero ed-themes"><div class="ed-wrap"><div class="ed-themes-head"><div><div class="ed-kicker">Thematic work</div><h1 class="ed-title">Ten lenses into one climate-governance system.</h1></div><div><p class="ed-copy">Themes are gateways, not filing categories. Each lens opens into connected programmes, policy activity, evidence, events, members and county context.</p>${actions('#themeExplorer','Open thematic explorer','#/where-we-work','See county connections')}</div></div><div class="ed-taxonomy">${themeLabels.map((x,i)=>`<a class="ed-theme-cell" href="#themeExplorer"><b>${String(i+1).padStart(2,'0')}</b><span>${esc(x)}</span></a>`).join('')}</div></div></section>`}

  function programmesHero(stats){return `<section class="ed-hero ed-programmes"><div class="ed-wrap ed-programmes-grid"><div><div class="ed-kicker">Programmes & projects</div><h1 class="ed-title">From strategy to implementation on the ground.</h1><p class="ed-copy">Read the portfolio as implementation: programme status, projects, counties, themes, outputs and evidence — not as another marketing page.</p>${actions('#portfolioExplorer','Open portfolio explorer','#/where-we-work','View county reach')}</div><div class="ed-ledger"><div class="ed-ledger-top"><div><span class="ed-kicker" style="color:#e3bf73">Implementation portfolio</span><strong>Portfolio at a glance</strong></div><span>Live prototype relationships</span></div>${stats.map(x=>`<div class="ed-ledger-row"><span>${esc(x.label)}</span><b>${esc(x.value)}</b></div>`).join('')}<div class="ed-programme-photo"><img src="${IMAGES.programme}" alt="KPCG programme and stakeholder activity"></div></div></div></section>`}

  function policyHero(stats){const stages=['Evidence','Position','Consultation','Submission','Engagement','Decision','Follow-up'];return `<section class="ed-hero ed-policy"><div class="ed-wrap ed-policy-grid"><div><div class="ed-kicker">Policy & advocacy</div><h1 class="ed-title">Make the policy process visible.</h1><p class="ed-copy">Policy influence is a chronology of evidence, participation, submissions, institutional engagement and follow-through — not a pile of documents.</p>${actions('#policyStream','Open policy stream','#/knowledge','Trace supporting evidence')}${statRow(stats.slice(0,2))}</div><div><div class="ed-kicker">Policy pathway</div><div class="ed-process">${stages.map(s=>`<div class="ed-process-step"><strong>${s}</strong></div>`).join('')}</div><div class="ed-process-note"><strong>Design rule:</strong> every policy record should expose its stage, institution, theme, supporting evidence, programme relationship and outcome status where known.</div></div></div></section>`}

  function knowledgeHero(stats){return `<section class="ed-hero ed-knowledge"><div class="ed-wrap ed-knowledge-grid"><div><div class="ed-kicker">Knowledge Hub</div><h1 class="ed-title">Search evidence. Follow context.</h1><p class="ed-copy">A research and discovery workspace for reports, briefs, submissions, training materials, datasets and media — connected back to themes, counties, programmes and policy.</p></div><div class="ed-search-shell"><div class="ed-kicker">Evidence search</div><div class="ed-search-main"><input id="resourceSearch" type="search" placeholder="Search evidence, themes, counties or programmes" aria-label="Search resources"><button class="btn" type="button" data-focus-resource-search>Search evidence</button></div><div class="ed-search-types"><a href="#resourceResults">Reports</a><a href="#resourceResults">Policy briefs</a><a href="#resourceResults">Research</a><a href="#resourceResults">Toolkits</a><a href="#resourceResults">Datasets</a><a href="#resourceResults">Training</a></div><div class="ed-evidence-note">${stats.slice(0,3).map(x=>`<div><b>${esc(x.value)}</b>${esc(x.label)}</div>`).join('')}</div></div></div></section>`}

  function whereHero(){return `<section class="ed-hero ed-where"><div class="ed-wrap ed-where-grid"><div><div class="ed-kicker">Where we work</div><h1 class="ed-title">Kenya, county by county.</h1><p class="ed-copy">Geography is a primary navigation layer. Move from a county into its programmes, members, themes, evidence, policy activity and events.</p>${actions('#countyExplore','Open county explorer','#/themes','Explore thematic work')}</div><div class="ed-where-card"><img src="${IMAGES.where}" alt="KPCG county climate-governance activity in Kenya"><div class="ed-where-overlay"><b>47</b><span>counties form the national discovery framework, with map and list access kept equivalent for accessibility.</span></div></div></div></section>`}

  function redesign(){
    const app=document.querySelector('#app'); if(!app) return;
    document.documentElement.dataset.kpcgEditorial='v18';
    document.documentElement.dataset.kpcgEditorialBuild=VERSION;
    document.querySelectorAll('.prototype-badge,.demo-toggle').forEach(el=>el.style.setProperty('display','none','important'));
    const r=route();
    document.body.dataset.editorialRoute=r.replace('#/','')||'home';
    const hero=app.querySelector('.xp-hero');
    if(hero){
      const stats=statsFrom(hero); let html='';
      if(r==='#/home'||r==='#/') html=homeHero(stats);
      else if(r==='#/about') html=aboutHero(stats);
      else if(r==='#/themes') html=themesHero();
      else if(r==='#/programmes') html=programmesHero(stats);
      else if(r==='#/policy') html=policyHero(stats);
      else if(r==='#/knowledge') html=knowledgeHero(stats);
      else if(r==='#/where-we-work') html=whereHero();
      if(html) hero.outerHTML=html;
    }
    const strip=app.querySelector('.xp-metric-strip');
    if(strip) strip.classList.add('ed-factband');
    document.querySelectorAll('.desktop-menu-more').forEach(el=>el.setAttribute('aria-hidden','true'));
  }

  function boot(){
    if(!document.getElementById('kpcg-editorial-v18-style')){const style=document.createElement('style');style.id='kpcg-editorial-v18-style';style.textContent=CSS;document.head.appendChild(style)}
    redesign();
    const app=document.querySelector('#app');
    if(app){const observer=new MutationObserver(()=>requestAnimationFrame(redesign));observer.observe(app,{childList:true,subtree:true})}
    window.addEventListener('hashchange',()=>setTimeout(redesign,0));
    window.addEventListener('pageshow',()=>setTimeout(redesign,0));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
