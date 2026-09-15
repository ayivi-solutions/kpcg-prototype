(() => {
  'use strict';

  const VERSION = '21.0.0';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const THEMES = [
    ['Adaptation & resilience', 'climate-adaptation-resilience'],
    ['Mitigation', 'climate-mitigation'],
    ['Climate finance', 'climate-finance'],
    ['Technology & knowledge', 'technology-knowledge-management'],
    ['Gender, youth & marginalised groups', 'gender-youth-marginalised-groups'],
    ['Locally led climate action', 'locally-led-climate-action'],
    ['Just transition', 'just-transition'],
    ['Circular economy', 'circular-economy'],
    ['Food systems', 'food-systems'],
    ['Environmental stewardship', 'environmental-stewardship']
  ];

  const CONTEXT = {
    about: {
      kicker: 'Institutional context',
      title: 'What KPCG exists to connect',
      intro: [
        'KPCG was established in 2018 as the designated national platform of the Pan African Climate Justice Alliance in Kenya. It is a membership platform for civil-society actors working across climate change, environmental governance and sustainable development.',
        'Its role is wider than organisational visibility. KPCG provides a national space for coordination, knowledge exchange, policy engagement, capacity strengthening and collective advocacy, linking community and county realities with national policy processes and wider African climate-justice agendas.'
      ],
      pillars: [
        ['A broad membership ecosystem', 'Grassroots and community-based organisations, faith-based organisations, women- and youth-led organisations, research and academia, marginalised and Indigenous communities, professional networks and other climate-action actors.'],
        ['County-to-national connection', 'Local experience, county priorities and community evidence should be able to travel into national policy and advocacy processes without losing geographic or institutional context.'],
        ['Evidence and accountability', 'Knowledge products, public participation, policy positions and programme learning should remain connected so users can see what informs a decision and what follows from it.'],
        ['Collective climate justice action', 'The platform should make collaboration, inclusion, public participation and accountability visible rather than presenting KPCG as a conventional brochure website.']
      ],
      links: [['Where KPCG works', '#/where-we-work'], ['Thematic work', '#/themes'], ['Membership', '#/membership'], ['Knowledge Hub', '#/knowledge']]
    },
    'where-we-work': {
      kicker: 'Devolved climate governance',
      title: 'Geography is part of the governance model',
      intro: [
        'KPCG works across Kenya’s 47 counties through regional and county-level networks, thematic working groups, partnerships and programme interventions. The county layer is therefore not a decorative map: it is the principal route from national climate priorities into place-specific risks, institutions, participation and implementation.',
        'A useful county view should allow a visitor to move from local priorities into programmes, projects, member organisations, evidence, stories, news and events, and then back upward into the relevant theme and national policy process.'
      ],
      pillars: [
        ['County priorities', 'Surface the climate risks, development pressures and locally identified priorities that shape action in each county.'],
        ['Programme and member activity', 'Show which programmes, projects and public member initiatives are connected to a county instead of treating geography as a static profile.'],
        ['Evidence by place', 'Attach reports, datasets, stories and policy material to the geography they describe so users can distinguish national evidence from local evidence.'],
        ['Participation and accountability', 'Make county events, consultation pathways, public updates and locally led action discoverable alongside implementation records.']
      ],
      links: [['Explore themes', '#/themes'], ['Programmes & projects', '#/programmes'], ['Member directory', '#/members'], ['Evidence library', '#/knowledge']]
    },
    themes: {
      kicker: 'Thematic architecture',
      title: 'Themes organise relationships, not just labels',
      intro: [
        'The KPCG TOR describes a portfolio spanning adaptation and resilience, mitigation, climate finance, technology and knowledge management, inclusive climate governance, gender and youth inclusion, locally led climate action, just transition, circular economy, food systems, environmental stewardship and emerging priorities.',
        'For this ten-lens prototype, inclusive governance is treated as a cross-cutting rule across every theme, especially participation, representation, transparency and accountability, rather than duplicated as a separate filing category. Each lens should open into programmes, policy, evidence, events, members and counties.'
      ],
      pillars: [
        ['Issue framing', 'Each theme explains the governance problem, affected people and places, strategic priorities and the questions evidence should help answer.'],
        ['Implementation', 'Programme and project records show how a thematic priority becomes funded activity, outputs and results.'],
        ['Policy and evidence', 'Policy records and Knowledge Hub resources remain linked to the same theme so users can trace the evidence behind positions and advocacy.'],
        ['County and member action', 'The same theme can be explored spatially and through public member initiatives, avoiding isolated silos.']
      ],
      links: [['Programmes', '#/programmes'], ['Policy & advocacy', '#/policy'], ['Knowledge Hub', '#/knowledge'], ['County explorer', '#/where-we-work']]
    },
    programmes: {
      kicker: 'Implementation context',
      title: 'A programme record should explain how strategy becomes action',
      intro: [
        'Programmes and projects are the implementation layer of the platform. Their value is not the number of cards displayed, but the ability to explain purpose, geography, partners, duration, outputs, results and the evidence produced through implementation.',
        'The KPCG platform model therefore connects each programme to its themes and counties, then exposes related projects, resources, policy activity, stories and media without duplicating the same content across multiple pages.'
      ],
      pillars: [
        ['Purpose and design', 'State the problem being addressed, objectives, intended participants or beneficiaries, implementation logic and duration.'],
        ['Geography and partnership', 'Identify the counties, member actors, government or civil-society partners and other delivery relationships relevant to the work.'],
        ['Outputs and results', 'Separate activities and outputs from observed results, and clearly mark prototype values where verified programme data are not yet available.'],
        ['Learning trail', 'Connect programme evidence, stories, policy engagement, event records and multimedia so implementation leaves an accessible institutional memory.']
      ],
      links: [['Thematic work', '#/themes'], ['County explorer', '#/where-we-work'], ['Knowledge Hub', '#/knowledge'], ['Policy & advocacy', '#/policy']]
    },
    policy: {
      kicker: 'Policy and advocacy context',
      title: 'Policy influence is a process with evidence and follow-through',
      intro: [
        'The policy area is designed to hold policy engagements, submissions, communiqués, position papers, negotiation updates and campaigns as structured records rather than loose PDF links.',
        'A credible record should show the institution or process involved, the issue and theme, the evidence used, the programme relationship where relevant, the stage of engagement and subsequent follow-up. That turns advocacy into a traceable public chronology.'
      ],
      pillars: [
        ['Evidence', 'Link the research, county experience, member input and public-interest evidence that shaped the policy position.'],
        ['Participation', 'Record consultation and stakeholder pathways so the origin of a position is more visible.'],
        ['Institutional process', 'Show where the engagement sits: consultation, submission, negotiation, decision, implementation or follow-up.'],
        ['Outcome status', 'Distinguish activity from influence. Where outcomes are known, record them; where they are not, avoid implying success.']
      ],
      links: [['Supporting evidence', '#/knowledge'], ['Programmes', '#/programmes'], ['News & insights', '#/news'], ['Themes', '#/themes']]
    },
    knowledge: {
      kicker: 'Knowledge and evidence context',
      title: 'The Knowledge Hub is a discovery system, not a document dump',
      intro: [
        'KPCG’s digital ambition includes a searchable knowledge space for publications, reports, policy briefs, communiqués, submissions, training materials, media products and other resources. The prototype expands that into reports, briefs, manuals, research, toolkits, presentations, newsletters, datasets and external links.',
        'Every resource should carry enough metadata to answer basic trust questions: what is it, when was it published, which version is current, which theme and county does it concern, which programme produced or uses it, and what related policy or editorial material provides context.'
      ],
      pillars: [
        ['Findability', 'Search, filters, result counts and sorting should help users narrow evidence by type, theme, county, year, programme and format.'],
        ['Traceability', 'Version history, publication metadata and relationships make it possible to understand whether a resource is current and where it belongs.'],
        ['Policy connection', 'Resources should connect directly to policy engagements and programme activity so evidence can be followed into public decision-making.'],
        ['Accessible reuse', 'Previews, summaries, captions, alternative formats and clear downloads make evidence usable by more than specialist audiences.']
      ],
      links: [['Policy & advocacy', '#/policy'], ['Thematic work', '#/themes'], ['County explorer', '#/where-we-work'], ['News & insights', '#/news']]
    },
    news: {
      kicker: 'Editorial context',
      title: 'Stories should point readers back to evidence, place and action',
      intro: [
        'News and Insights is the editorial layer for news, analysis, commentary, member stories, field updates and press content. Its job is to make KPCG’s work understandable without separating narrative from the programme, county, theme or evidence that gives the story meaning.',
        'Long-form articles should therefore expose authorship, date, reading time and related records, allowing a reader to move from a story into source material or implementation context rather than reaching a dead end.'
      ],
      pillars: [
        ['News', 'Timely institutional and programme developments with clear dates and source context.'],
        ['Analysis and commentary', 'Interpretive material that distinguishes evidence from opinion and makes authorship visible.'],
        ['Member and field stories', 'Ground national climate-governance conversations in county and community experience.'],
        ['Evidence pathways', 'Related resources, themes, programmes and counties remain one click away from the article.']
      ],
      links: [['Knowledge Hub', '#/knowledge'], ['Programmes', '#/programmes'], ['Events', '#/events'], ['Member directory', '#/members']]
    },
    events: {
      kicker: 'Convening and coverage context',
      title: 'An event should remain useful before, during and after it happens',
      intro: [
        'KPCG convenings are spaces for coordination, evidence exchange, public participation, learning and policy engagement. The event system therefore treats each event as a living record with an explicit status: upcoming, live, ongoing or concluded.',
        'Before the event, users need purpose, agenda, speakers and location. During it, timestamped updates and resources provide live context. After it, the same record becomes an archive connecting coverage, evidence, policy activity and media.'
      ],
      pillars: [
        ['Before', 'Publish purpose, agenda, participation information, venue or online access and related background evidence.'],
        ['During', 'Use a clear live state, current session, timestamped updates and new resources without autoplaying media.'],
        ['After', 'Retain conclusions, coverage, gallery, resources and related policy activity rather than deleting or flattening the event.'],
        ['Connection', 'Tie the event to counties, themes and programmes so convening activity remains part of the wider governance graph.']
      ],
      links: [['Knowledge Hub', '#/knowledge'], ['Policy & advocacy', '#/policy'], ['Multimedia', '#/multimedia'], ['Engage', '#/engage']]
    },
    multimedia: {
      kicker: 'Documentary media context',
      title: 'Media should carry story, provenance and accessibility',
      intro: [
        'KPCG’s image archive is documentary material, not decoration. Photo galleries, video and audio should preserve captions, credits, dates, collection membership and related programme or event context wherever those facts are known.',
        'The public media experience should support browsing and storytelling while the administrative workflow protects rights information, alt text, transcripts and reuse metadata.'
      ],
      pillars: [
        ['Photo galleries', 'Curate coherent collections around activities, places or events instead of presenting an undifferentiated image wall.'],
        ['Video and interviews', 'Provide context, captions or transcripts and avoid autoplay.'],
        ['Rights and credits', 'Keep source, credit and usage information attached to the asset through editorial reuse.'],
        ['Relational use', 'A media item may appear in an event, story, programme or resource while retaining one canonical metadata record.']
      ],
      links: [['News & insights', '#/news'], ['Events', '#/events'], ['Programmes', '#/programmes'], ['Knowledge Hub', '#/knowledge']]
    },
    membership: {
      kicker: 'Membership context',
      title: 'Membership is the human network behind the platform',
      intro: [
        'KPCG is a national membership platform whose constituency spans grassroots and community-based organisations, faith-based organisations, women- and youth-led organisations, research and academia, organisations representing marginalised and Indigenous communities, professional networks and other climate-action stakeholders.',
        'The public experience should explain why organisations join, who can participate and what members gain, while the application workflow protects personal information and makes clear that submission of interest is not automatic approval.'
      ],
      pillars: [
        ['Why join', 'Coordination, shared learning, policy engagement, visibility of member action and opportunities for collective advocacy.'],
        ['Who participates', 'A diverse civil-society and knowledge ecosystem rather than one organisational category.'],
        ['Public profile versus private application', 'Only approved organisation-level information belongs in the public directory; contact persons, review notes and private application data remain protected.'],
        ['Thematic and county connection', 'Member profiles become more useful when visitors can discover organisations by geography, issue and public activity.']
      ],
      links: [['Member directory', '#/members'], ['Thematic work', '#/themes'], ['County explorer', '#/where-we-work'], ['Engage', '#/engage']]
    },
    members: {
      kicker: 'Member network context',
      title: 'Public profiles should reveal participation without exposing private data',
      intro: [
        'The Member Directory demonstrates how approved public organisation profiles can be discovered by county, theme and activity. It is intentionally separate from the private membership application and review record.',
        'A public profile should help users understand where an organisation works, the themes it engages with and the activities it has chosen to make public, while personal contact details and internal notes remain outside the public surface.'
      ],
      pillars: [
        ['Organisation identity', 'Use the organisation name and an approved public profile as the primary public record.'],
        ['County context', 'Allow discovery by place without publishing unnecessary personal information.'],
        ['Thematic participation', 'Connect member organisations to the issue areas in which they publicly work.'],
        ['Public activities', 'Surface approved initiatives, stories or events so membership is visible as action, not only a directory listing.']
      ],
      links: [['Membership', '#/membership'], ['County explorer', '#/where-we-work'], ['Themes', '#/themes'], ['News & insights', '#/news']]
    },
    opportunities: {
      kicker: 'Opportunity context',
      title: 'Calls and opportunities need a visible lifecycle',
      intro: [
        'The opportunities area brings calls, consultancies, jobs, grants, training and member opportunities into one searchable public surface. Deadlines and status need to be explicit so users can distinguish active opportunities from historical records.',
        'Expired items should move to closed or archived status rather than disappearing. This creates a useful institutional trail while preventing users from mistaking an old call for a current one.'
      ],
      pillars: [
        ['Deadline clarity', 'Show deadline, time remaining and closing-soon states prominently.'],
        ['Eligibility', 'Explain who can apply and point users to the authoritative notice before application.'],
        ['Status continuity', 'Open, closing soon, closed and archived states remain visible and filterable.'],
        ['Member relevance', 'Where appropriate, connect opportunities to themes, counties or member audiences.']
      ],
      links: [['Membership', '#/membership'], ['Engage', '#/engage'], ['News & insights', '#/news'], ['Saved items', '#/saved']]
    },
    engage: {
      kicker: 'Participation context',
      title: 'Different forms of engagement need different routes',
      intro: [
        'The engagement hub brings contact, partnership enquiries, newsletter subscription, story submission, resource submission and social channels into one place without forcing every interaction through a generic contact form.',
        'Each route should make purpose, required information, privacy handling and the expected next step clear. Submission forms need validation, consent where relevant, attachment controls and honest success states.'
      ],
      pillars: [
        ['Contact', 'General institutional enquiries with a clear response route.'],
        ['Partnership', 'Structured enquiries for programme, research, policy or development collaboration.'],
        ['Contribute knowledge', 'Submit a story or resource for editorial review without implying automatic publication.'],
        ['Stay connected', 'Newsletter and social pathways support ongoing public communication.']
      ],
      links: [['Membership', '#/membership'], ['Knowledge Hub', '#/knowledge'], ['News & insights', '#/news'], ['Opportunities', '#/opportunities']]
    }
  };

  let manifestPromise;

  function routeParts() {
    return (location.hash || '#/home').replace(/^#\/?/, '').split('/').filter(Boolean);
  }

  function routeKey() {
    const p = routeParts();
    return p[0] || 'home';
  }

  function ensureCss() {
    if ($('link[data-kpcg-context-css]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/content-enrichment-v21.css?v=${VERSION}`;
    link.dataset.kpcgContextCss = VERSION;
    document.head.append(link);
  }

  function removeObstructingDock() {
    $$('.x19-dock').forEach(node => node.remove());
  }

  function randomIndex(max) {
    if (max <= 1) return 0;
    if (globalThis.crypto?.getRandomValues) {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function sample(items, count) {
    const pool = [...items];
    const out = [];
    while (pool.length && out.length < count) {
      const i = randomIndex(pool.length);
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }

  async function imageManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch('/data/image-manifest.json', { cache: 'no-store' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error(`Image manifest ${r.status}`)))
        .then(data => Array.isArray(data.images) ? data.images : [])
        .catch(() => []);
    }
    return manifestPromise;
  }

  function setImage(img, src, alt) {
    if (!img || !src) return;
    img.removeAttribute('data-src');
    img.src = src;
    if (alt && (!img.alt || /^KPCG climate-governance activity$/i.test(img.alt))) img.alt = alt;
  }

  async function randomiseVisualMedia() {
    const images = await imageManifest();
    if (!images.length) return;
    const key = routeKey();

    if (key === 'home') {
      const slides = $$('.v16-hero-slide img');
      const picks = sample(images, Math.max(slides.length, 1));
      slides.forEach((img, i) => setImage(img, picks[i % picks.length], 'KPCG climate-governance activity in Kenya'));
      const editorialHome = $('.ed-home-visual img');
      if (editorialHome) setImage(editorialHome, sample(images, 1)[0], 'KPCG climate-governance activity in Kenya');
    }

    if (['about', 'where-we-work', 'themes', 'programmes', 'policy', 'knowledge', 'membership', 'members', 'opportunities', 'engage'].includes(key)) {
      const generic = $$('.ed-hero .ed-photo img, .ed-where-card img, .ed-programme-photo img')
        .filter(img => !img.closest('.leadership-thumb,.article-x,.resource-x,.event-x,.media-card'));
      const picks = sample(images, generic.length);
      generic.forEach((img, i) => setImage(img, picks[i], 'KPCG field and stakeholder activity in Kenya'));
    }

    const strip = $('[data-kpcg-random-media-strip]');
    if (strip) {
      const picks = sample(images, 3);
      $$('img', strip).forEach((img, i) => setImage(img, picks[i], 'KPCG documentary image from the platform media archive'));
      const count = $('[data-kpcg-image-count]', strip);
      if (count) count.textContent = images.length.toLocaleString();
    }
  }

  function harmoniseThemeTaxonomy() {
    if (routeKey() !== 'themes') return;
    const cells = $$('.ed-theme-cell');
    if (!cells.length) return;
    cells.slice(0, THEMES.length).forEach((cell, i) => {
      const [label, slug] = THEMES[i];
      const text = $('span', cell);
      if (text) text.textContent = label;
      cell.href = `#/theme/${slug}`;
      cell.setAttribute('aria-label', `Open ${label}`);
    });
  }

  function pageSection(data) {
    const section = document.createElement('section');
    section.className = 'kpcg-context-v21';
    section.dataset.kpcgContextV21 = routeKey();
    section.innerHTML = `
      <div class="container">
        <div class="kpcg-context-heading">
          <div>
            <div class="eyebrow">${data.kicker}</div>
            <h2>${data.title}</h2>
          </div>
          <div class="kpcg-context-intro">
            ${data.intro.map(p => `<p>${p}</p>`).join('')}
            <p class="kpcg-source-note">Source basis: KPCG Website Development TOR and the controlled prototype information architecture. Illustrative programme counts and unverified impact values remain prototype data.</p>
          </div>
        </div>
        <div class="kpcg-context-grid">
          ${data.pillars.map(([title, body], i) => `<article><span>${String(i + 1).padStart(2, '0')}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}
        </div>
        <div class="kpcg-context-connect">
          <div><div class="eyebrow">Continue through the system</div><strong>Related KPCG pathways</strong></div>
          <nav aria-label="Related KPCG pathways">${data.links.map(([label, href]) => `<a href="${href}">${label}<span>→</span></a>`).join('')}</nav>
        </div>
        <div class="kpcg-random-media" data-kpcg-random-media-strip>
          <div class="kpcg-random-media-copy">
            <div class="eyebrow">KPCG media archive</div>
            <h3>Documentary images rotate from the full project image library.</h3>
            <p>General page imagery is intentionally randomised from <strong data-kpcg-image-count>the available</strong> KPCG archive images. News, event and update imagery remains tied to its specific content record.</p>
          </div>
          <figure><img alt="KPCG documentary image from the platform media archive" loading="lazy"></figure>
          <figure><img alt="KPCG documentary image from the platform media archive" loading="lazy"></figure>
          <figure><img alt="KPCG documentary image from the platform media archive" loading="lazy"></figure>
        </div>
      </div>`;
    return section;
  }

  function insertionAnchor() {
    const shell = $('.page-shell');
    if (!shell) return null;
    const hero = $('.ed-hero,.xp-hero,.detail-hero', shell);
    if (hero) {
      const directSection = hero.closest('.ed-hero,.xp-hero,.detail-hero');
      if (directSection?.parentElement === shell) return directSection;
      const container = hero.closest('.container');
      if (container?.parentElement === shell) return container;
    }
    const firstContainer = $('.page-shell > .container');
    return firstContainer || shell.firstElementChild;
  }

  function enrichTopLevelPage() {
    const key = routeKey();
    const data = CONTEXT[key];
    if (!data || $('[data-kpcg-context-v21]')) return;
    const anchor = insertionAnchor();
    if (!anchor?.parentElement) return;
    anchor.insertAdjacentElement('afterend', pageSection(data));
  }

  function enrichCountyPage() {
    const parts = routeParts();
    if (parts[0] !== 'county' || $('[data-kpcg-county-context-v21]')) return;
    const page = $('.page-shell');
    if (!page) return;
    const title = $('.detail-hero h1,.page-title', page)?.textContent?.trim() || 'this county';
    const section = document.createElement('section');
    section.className = 'kpcg-county-context-v21';
    section.dataset.kpcgCountyContextV21 = parts[1] || '';
    section.innerHTML = `<div class="container"><div class="eyebrow">How to read this county view</div><h2>${title}: from local climate reality to the national platform</h2><p>This county workspace is designed to connect local priorities with programmes and projects, public member activity, evidence, stories, events and the relevant thematic and policy context. Prototype activity values demonstrate the relationship model and should not be read as verified KPCG performance statistics.</p><div class="kpcg-county-path"><span>County priorities</span><b>→</b><span>Programmes & projects</span><b>→</b><span>Evidence & stories</span><b>→</b><span>Themes & policy</span></div></div>`;
    const hero = $('.detail-hero', page);
    (hero || $('.page-shell > .container'))?.insertAdjacentElement('afterend', section);
  }

  async function apply() {
    ensureCss();
    removeObstructingDock();
    harmoniseThemeTaxonomy();
    enrichTopLevelPage();
    enrichCountyPage();
    await randomiseVisualMedia();
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  function start() {
    ensureCss();
    apply();
    new MutationObserver(records => {
      if (records.some(r => [...r.addedNodes].some(n => n.nodeType === 1 && (n.matches?.('.x19-dock,#app,main,.page-shell') || n.querySelector?.('.x19-dock,.page-shell'))))) schedule();
    }).observe(document.body, { childList: true, subtree: true });
    addEventListener('hashchange', () => setTimeout(schedule, 0));
    addEventListener('pageshow', schedule);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
