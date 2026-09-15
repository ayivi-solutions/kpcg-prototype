(() => {
  'use strict';

  const CONTENT = {
    'climate-adaptation-resilience': {
      sectionTitle: 'Building resilience before climate shocks become development losses',
      overview: [
        'Adaptation in Kenya is not a single project category. It is the practice of putting climate risk into public planning, budgets, infrastructure, services and community decisions before droughts, floods, heat, water stress and ecosystem decline become deeper social and economic losses.',
        'This thematic lens should connect national adaptation commitments with county and ward realities. It should help users follow how risk information becomes priorities, how priorities become financed interventions and whether those interventions actually reduce vulnerability for communities, livelihoods and ecosystems.'
      ],
      priorities: [
        ['Climate-risk informed planning', 'Integrate current and future climate risk into county plans, annual development plans, public investment decisions, infrastructure design and service continuity.'],
        ['Water, drought and flood resilience', 'Strengthen catchment protection, water storage, drought preparedness, flood-risk management, early warning and resilient basic services.'],
        ['Resilient livelihoods and social protection', 'Support climate-resilient agriculture, pastoral systems, enterprises and safety nets, with particular attention to ASALs, informal settlements and climate-sensitive livelihoods.'],
        ['Ecosystem-based adaptation', 'Use forests, wetlands, rangelands, mangroves, watersheds and other ecosystems as resilience infrastructure while protecting biodiversity and community rights.']
      ],
      anchors: [
        ['Climate Change Act, 2016', 'National legal framework for Kenya’s climate response and institutional coordination.'],
        ['Kenya National Adaptation Plan 2015–2030', 'Long-term national adaptation priorities and sectoral resilience direction.'],
        ['Kenya’s Second NDC 2031–2035', 'Updated national adaptation and mitigation commitments, including inclusion, technology and finance.'],
        ['Financing Locally-Led Climate Action (FLLoCA)', 'County-facing mechanism for locally prioritised climate resilience, planning, financing and accountability.']
      ],
      questions: [
        'Are county climate-risk assessments current, spatially specific and actually used in planning and budgeting?',
        'Are adaptation resources reaching locally prioritised interventions and vulnerable populations?',
        'Are women, young people, persons with disabilities and marginalised communities influencing priorities rather than only attending consultations?',
        'Are interventions measured for resilience outcomes and avoided losses, not only expenditure and activity counts?'
      ],
      signal: ['47 counties', 'Climate resilience has to work through Kenya’s devolved system, linking national policy with county and community action.']
    },

    'climate-mitigation': {
      sectionTitle: 'Cutting emissions while protecting development, affordability and equity',
      overview: [
        'Kenya’s mitigation challenge is to reduce greenhouse-gas emissions without narrowing development options, energy access, mobility, food security or decent-work opportunities. The strongest pathway is therefore a development pathway that makes low-emission choices more productive, affordable and inclusive.',
        'The thematic lens should connect national targets to the sectors and places where implementation occurs: electricity, clean cooking, transport, industry, buildings, waste, agriculture, forestry and land use. It should also expose the data, safeguards and distributional consequences behind mitigation claims.'
      ],
      priorities: [
        ['Clean and efficient energy', 'Expand renewable energy, energy efficiency, reliable grids and productive use of clean power while keeping affordability and access visible.'],
        ['Clean cooking and low-carbon mobility', 'Accelerate cleaner household energy and transport systems in ways that reduce pollution, fuel costs and inequality.'],
        ['Forests, land and agricultural emissions', 'Protect carbon sinks, reduce land degradation and support climate-smart land management without weakening community tenure or food security.'],
        ['Waste, methane and industrial efficiency', 'Reduce avoidable emissions through material efficiency, methane management, cleaner production and circular-economy approaches.']
      ],
      anchors: [
        ['Kenya’s Second NDC 2031–2035', 'Kenya’s current international climate commitment and the principal reference for the 2035 mitigation ambition.'],
        ['Climate Change Act, 2016', 'Provides the national legal and institutional framework for low-carbon, climate-resilient development.'],
        ['National Climate Change Action Plan', 'Translates national climate policy into priority actions, institutions and implementation responsibilities.'],
        ['Carbon-market governance', 'Where carbon finance is used, environmental integrity, community rights, benefit sharing and transparent accounting remain central governance questions.']
      ],
      questions: [
        'Are claimed emission reductions measurable, additional, transparent and independently verifiable?',
        'Who gains and who bears the cost of low-carbon transitions in energy, transport, land use and industry?',
        'Are community rights, land tenure and benefit-sharing arrangements protected in carbon and nature-based projects?',
        'Can county-level activity be connected to national inventories, targets and monitoring systems?'
      ],
      signal: ['35%', 'Kenya’s Second NDC sets a 2035 greenhouse-gas abatement target of 35% relative to the projected business-as-usual pathway.']
    },

    'climate-finance': {
      sectionTitle: 'Following climate money from commitment to local result',
      overview: [
        'Climate finance is not only about how much money is announced. Governance quality depends on who can access finance, how allocations are made, how quickly funds are absorbed, what safeguards apply, what reaches local priorities and whether expenditure produces measurable resilience or mitigation outcomes.',
        'Kenya’s devolved system makes this especially important. The platform should help users move between national commitments, county climate budgets, locally led finance, project pipelines, disbursements, implementation evidence and public accountability.'
      ],
      priorities: [
        ['County climate budgeting', 'Make climate allocations, budget tags, county climate funds and expenditure pathways understandable and comparable.'],
        ['Access and project readiness', 'Strengthen the pipeline from community priorities and county plans to bankable, safeguard-compliant projects capable of attracting public, concessional or private finance.'],
        ['Transparency and accountability', 'Track commitments, approvals, disbursements, expenditure, beneficiaries, procurement and results with clear public metadata.'],
        ['Locally led and inclusive finance', 'Assess whether finance reaches community priorities, women- and youth-led organisations, vulnerable groups and locally accountable institutions.']
      ],
      anchors: [
        ['Climate Change Act, 2016', 'Establishes the national climate-governance framework within which climate finance is mobilised and used.'],
        ['Kenya’s Second NDC 2031–2035', 'Links implementation ambition to domestic and international finance, technology and capacity needs.'],
        ['Financing Locally-Led Climate Action (FLLoCA)', 'A major public programme connecting national systems with county and community climate investments.'],
        ['County planning and budgeting systems', 'CIDPs, annual development plans and county budgets are critical places where climate priorities become funded public action.']
      ],
      questions: [
        'What was committed, approved, disbursed, spent and completed, and on what timeline?',
        'Which counties, sectors and population groups are receiving climate finance, and where are the gaps?',
        'How much finance is reaching adaptation, mitigation and cross-cutting priorities, and with what results?',
        'Can citizens trace a climate-financed intervention from budget line to location, implementing entity and outcome?'
      ],
      signal: ['Finance → results', 'The key accountability chain is commitment, allocation, disbursement, expenditure, output and measurable climate outcome.']
    },

    'technology-knowledge-management': {
      sectionTitle: 'Turning climate data and knowledge into decisions people can use',
      overview: [
        'A climate-governance knowledge system should do more than accumulate reports. It should connect observations, forecasts, research, policy evidence, programme learning, local experience and Indigenous knowledge to the decisions being made by national institutions, counties, communities, businesses and civil-society actors.',
        'Technology matters when it improves access, timeliness, interoperability and accountability. The platform should therefore make evidence searchable and reusable while also showing provenance, version, geography, uncertainty and the decision context for which information is useful.'
      ],
      priorities: [
        ['Climate services and early warning', 'Translate forecasts, risk information and alerts into actionable information for counties, sectors and communities.'],
        ['Open and interoperable evidence', 'Use consistent metadata, geographic references, versioning and machine-readable structures so climate data can be combined rather than trapped in silos.'],
        ['Knowledge translation and learning', 'Convert technical evidence into briefs, tools, visualisations, local-language communication and practical learning products for different audiences.'],
        ['Innovation with safeguards', 'Support appropriate digital tools, remote sensing, AI and other emerging technologies while addressing privacy, bias, exclusion, maintenance and institutional capacity.']
      ],
      anchors: [
        ['Kenya’s Second NDC 2031–2035', 'Recognises technology, innovation, capacity and knowledge as enabling conditions for climate implementation.'],
        ['Climate Change Act, 2016', 'Provides the institutional basis for climate information, coordination and evidence-informed action.'],
        ['National and county climate-information systems', 'Climate services become valuable when national science is translated into sector and county decisions.'],
        ['KPCG Knowledge Hub model', 'The digital platform can connect resources to themes, counties, programmes, policy processes and public-facing stories instead of storing files in isolation.']
      ],
      questions: [
        'Is the evidence decision-ready, geographically specific and understandable to the intended audience?',
        'Can users see source, publication date, version, methodology and uncertainty before relying on a resource?',
        'Are local and Indigenous knowledge systems represented alongside formal research and administrative data?',
        'Do digital tools expand participation, or do connectivity, language, disability and data-literacy barriers create new exclusion?'
      ],
      signal: ['Evidence → decision', 'The useful unit is not a document in a repository but a traceable connection between evidence, place, decision and action.']
    },

    'gender-youth-marginalised-groups': {
      sectionTitle: 'Moving inclusion from attendance lists to decision-making power',
      overview: [
        'Climate impacts are not socially neutral. Exposure, land and asset ownership, unpaid care, income, mobility, access to finance, political voice and livelihood dependence all shape who carries climate risk and who benefits from climate action. Gender, age, disability, geography and social marginalisation therefore have to be visible in climate governance itself.',
        'This lens should examine participation, budgets, benefits, safeguards and outcomes. It should help distinguish meaningful influence from token consultation and make disaggregated evidence part of normal programme and policy reporting.'
      ],
      priorities: [
        ['Representation with decision power', 'Track who sits in climate committees, working groups and consultations, whose priorities enter final decisions and who can challenge those decisions.'],
        ['Gender-responsive climate finance', 'Examine whether budgets, grants, procurement and climate-finance mechanisms recognise differentiated needs and remove barriers to access.'],
        ['Youth livelihoods and innovation', 'Connect climate action to skills, enterprise, technology, green jobs, civic participation and intergenerational decision-making.'],
        ['Safeguards for marginalised groups', 'Protect Indigenous peoples, persons with disabilities, remote communities and other groups from exclusion, displacement and unequal project burdens.']
      ],
      anchors: [
        ['Kenya’s Second NDC 2031–2035', 'Explicitly calls for gender-responsive climate action and participation of vulnerable populations.'],
        ['Climate Change Act, 2016', 'Provides a public-governance framework in which participation and accountability are core implementation concerns.'],
        ['Constitutional equality and public participation', 'Kenya’s wider governance framework provides the basis for inclusion, representation and public participation.'],
        ['County and locally led climate processes', 'Devolved planning creates practical spaces where inclusive representation can be tested against real budget and project decisions.']
      ],
      questions: [
        'Who is making decisions, who is consulted and whose proposals appear in final plans and budgets?',
        'Are participation and benefit data disaggregated by sex, age, disability and other relevant vulnerability dimensions?',
        'Are women- and youth-led organisations able to access climate finance, procurement and programme partnerships directly?',
        'Do safeguards consider care burdens, safety, land rights, accessibility, displacement and unequal livelihood impacts?'
      ],
      signal: ['Participation ≠ influence', 'A credible inclusion metric asks who shaped the decision, controlled resources and benefited from the outcome.']
    },

    'locally-led-climate-action': {
      sectionTitle: 'Putting climate priorities, resources and accountability closer to communities',
      overview: [
        'Locally led climate action shifts more authority over priorities, design, finance and monitoring toward the people and institutions closest to climate impacts. In Kenya, devolution creates a strong foundation for this approach because county and ward processes can connect public resources with locally identified risks and solutions.',
        'The key governance question is whether local participation actually changes decisions. A locally led system should make community priorities visible, show how they enter county plans and budgets, track the resources attached to them and preserve feedback throughout implementation.'
      ],
      priorities: [
        ['Devolved climate planning', 'Connect community and ward priorities to county climate plans, CIDPs, annual development plans and sector investments.'],
        ['Predictable local climate finance', 'Move resources close enough to local decision-making for communities to shape investments and hold implementers accountable.'],
        ['Community monitoring and social accountability', 'Publish locations, budgets, implementation status, grievances, maintenance responsibilities and locally observed results.'],
        ['Local institutions and learning', 'Strengthen community organisations, county climate units and local networks so locally led action survives beyond individual projects.']
      ],
      anchors: [
        ['Kenya’s devolved governance system', 'County government and public-participation structures provide the institutional route from national policy to local decisions.'],
        ['Climate Change Act, 2016', 'Supports coordinated climate action across levels of government and institutions.'],
        ['Financing Locally-Led Climate Action (FLLoCA)', 'Works through Kenya’s county system to strengthen locally prioritised climate resilience and related institutional capacity.'],
        ['County climate governance frameworks', 'County legislation, climate funds, planning processes and climate units provide the practical architecture for local implementation.']
      ],
      questions: [
        'Can a community priority be traced into an approved plan, budget line, funded activity and implementation record?',
        'How much decision-making authority remains local after a project moves into technical design and procurement?',
        'Are funds timely, predictable and transparent enough for communities to plan and monitor effectively?',
        'Are grievance, feedback, maintenance and learning mechanisms active after an intervention is completed?'
      ],
      signal: ['47 counties', 'Locally led action can be compared and learned from across Kenya’s full devolved county system while retaining local context.']
    },

    'just-transition': {
      sectionTitle: 'Making the low-carbon transition economically fair and socially durable',
      overview: [
        'A just transition asks not only how Kenya decarbonises, but how the costs and benefits of that transition are distributed. Changes in energy, transport, agriculture, land use, industry and waste can create new opportunities while also disrupting jobs, livelihoods, prices, places and existing economic relationships.',
        'This lens should therefore connect climate ambition with decent work, skills, social protection, affordability, dialogue and regional development. The transition is more durable when affected workers and communities can influence its design before economic displacement occurs.'
      ],
      priorities: [
        ['Green jobs and skills', 'Identify future skills needs, support retraining and create pathways into decent climate-compatible employment and enterprise.'],
        ['Worker and community dialogue', 'Bring organised labour, informal workers, affected communities, businesses, counties and civil society into transition planning early.'],
        ['Affordability and access', 'Track whether shifts in energy, transport and production improve or worsen access to essential services for lower-income households.'],
        ['Social protection and regional adjustment', 'Prepare support for workers, households and places that may bear concentrated transition costs or livelihood disruption.']
      ],
      anchors: [
        ['Kenya’s Second NDC 2031–2035', 'Frames stronger climate ambition within sustainable development, inclusion and implementation support.'],
        ['Climate Change Act, 2016', 'Provides the overarching legal framework for low-carbon, climate-resilient development.'],
        ['National labour and social-protection systems', 'Climate transition measures need to connect with employment, skills and protection institutions rather than operate as a separate policy silo.'],
        ['County economic development', 'Many transition impacts will be spatially concentrated, making county-level employment, value-chain and livelihood evidence essential.']
      ],
      questions: [
        'Which workers, communities, sectors and counties face the largest transition gains and losses?',
        'Were affected groups involved before major technology, land-use or investment decisions were made?',
        'Are local jobs, enterprise opportunities and training outcomes measurable rather than assumed?',
        'Are affordability, livelihood security and social-protection needs monitored alongside emission reductions?'
      ],
      signal: ['Climate + livelihoods', 'A transition is not just if emissions fall while avoidable economic costs are transferred to workers, communities or vulnerable households.']
    },

    'circular-economy': {
      sectionTitle: 'Designing waste out of the economy and keeping materials in productive use',
      overview: [
        'A circular economy moves beyond end-of-pipe waste collection toward prevention, reuse, repair, remanufacturing, recycling and resource-efficient production. For climate governance, this matters because material extraction, manufacturing, transport, disposal and methane emissions are all connected to the way products and waste are managed.',
        'Kenya’s waste-governance reforms provide a practical policy base for this transition. The platform should connect producer responsibility, county waste systems, informal-sector livelihoods, material flows, pollution control and circular enterprise so that progress can be evaluated across the whole value chain.'
      ],
      priorities: [
        ['Extended producer responsibility', 'Track how producers and importers take responsibility for post-consumer products, packaging and recovery systems.'],
        ['Separation, collection and material recovery', 'Improve source segregation, reliable collection, recovery infrastructure and data on what is reused, recycled, treated or disposed.'],
        ['Circular enterprises and decent work', 'Support repair, reuse, recycling and resource-efficiency businesses while integrating and protecting informal waste workers.'],
        ['Priority waste streams and pollution', 'Strengthen governance of plastics, electronic waste, hazardous waste, organics and other streams with high environmental or health impacts.']
      ],
      anchors: [
        ['Sustainable Waste Management Act, 2022', 'Provides the statutory foundation for sustainable and circular approaches to waste governance.'],
        ['Extended Producer Responsibility Regulations, 2024', 'Assign post-consumer responsibility and compliance obligations to producers and importers.'],
        ['Waste-management regulations, 2024', 'Provide updated regulatory requirements for the management of waste and related environmental risks.'],
        ['County waste-management systems', 'Counties remain central to collection, local infrastructure, enforcement and public participation in waste governance.']
      ],
      questions: [
        'Are material flows measured from production and consumption through collection, recovery and final disposal?',
        'Are producer-responsibility obligations funded, enforced and transparent to the public?',
        'Are informal waste workers integrated into new systems with safer work, fair income and social protection?',
        'Do policies prioritise prevention, reuse and repair before relying on recycling or disposal?'
      ],
      signal: ['Waste → resource', 'Circularity is strongest when less material becomes waste in the first place and recovered value remains in local economic systems.']
    },

    'food-systems': {
      sectionTitle: 'Building resilient food systems from farm and rangeland to market and household',
      overview: [
        'Climate change affects food systems through rainfall variability, drought, heat, floods, pests, water stress, livestock losses, fisheries pressures, disrupted transport and volatile food prices. A food-systems lens therefore has to connect production with water, ecosystems, storage, processing, markets, nutrition, livelihoods and waste.',
        'Kenya’s climate-smart agriculture framework already links productivity, resilience and emissions. The digital platform can extend that logic by connecting evidence and programmes to specific counties, value chains and vulnerable groups, making it easier to see where adaptation and food-security priorities intersect.'
      ],
      priorities: [
        ['Climate-resilient production', 'Support climate-smart and agroecological practices, diversified livelihoods, resilient seed and breed systems and better climate advisories.'],
        ['Water, soil and rangeland health', 'Protect the natural-resource base on which crops, livestock, fisheries and pastoral systems depend.'],
        ['Storage, logistics and post-harvest loss', 'Improve storage, cold chains, processing, market access and infrastructure that reduce climate-related losses and food waste.'],
        ['Inclusive value chains and nutrition', 'Connect resilience with household food security, nutrition, smallholder income, women’s economic participation and youth enterprise.']
      ],
      anchors: [
        ['Kenya Climate Smart Agriculture Strategy 2017–2026', 'Links agricultural productivity and incomes with adaptation, resilience and mitigation where feasible.'],
        ['Kenya National Adaptation Plan 2015–2030', 'Identifies agriculture, water, ecosystems and livelihoods among critical adaptation concerns.'],
        ['Kenya’s Second NDC 2031–2035', 'Connects sectoral climate action to national adaptation and mitigation ambition.'],
        ['County agriculture and food-system planning', 'Devolved implementation makes county-level climate, agriculture, water and market evidence central to practical resilience.']
      ],
      questions: [
        'Are productivity, income and resilience improving together, especially for smallholders and pastoral households?',
        'What do soil health, water availability, rangeland condition and crop or livestock losses show over time?',
        'Are women and young people gaining access to finance, technology, extension, markets and decision-making?',
        'Are post-harvest losses, food waste, nutrition outcomes and value-chain emissions being measured alongside production?'
      ],
      signal: ['Farm → food system', 'Resilience depends on the whole chain: ecosystems, production, storage, processing, transport, markets, consumption and waste.']
    },

    'environmental-stewardship': {
      sectionTitle: 'Protecting the ecosystems that climate resilience and livelihoods depend on',
      overview: [
        'Climate resilience and mitigation both depend on functioning ecosystems. Forests, wetlands, rangelands, rivers, catchments, coastal and marine systems provide water regulation, carbon storage, biodiversity, livelihoods, food, disaster protection and cultural value. Environmental stewardship treats those systems as public assets requiring accountable governance.',
        'This thematic lens should connect restoration and conservation claims to ecological evidence, community rights, enforcement, benefit sharing and long-term management. The aim is not simply to count hectares or activities, but to understand whether ecosystem condition and the services people rely on are improving.'
      ],
      priorities: [
        ['Ecosystem restoration and integrity', 'Track restoration quality, survival, ecological function and long-term management across forests, wetlands, rangelands and degraded landscapes.'],
        ['Biodiversity and nature-based solutions', 'Use ecosystem approaches where they are ecologically appropriate and where biodiversity, rights and safeguards are protected.'],
        ['Catchment, coastal and rangeland governance', 'Connect upstream and downstream users, communities, counties and regulators around shared natural-resource systems.'],
        ['Pollution prevention and compliance', 'Make environmental standards, monitoring, enforcement and remediation visible alongside climate and development interventions.']
      ],
      anchors: [
        ['Environmental Management and Co-ordination Act', 'Kenya’s overarching environmental-governance framework for standards, assessment, compliance and institutional coordination.'],
        ['Climate Change Act, 2016', 'Connects ecosystem resilience and low-carbon development to national climate governance.'],
        ['Kenya’s Second NDC 2031–2035', 'Places land, ecosystems and nature-based action within the national climate commitment.'],
        ['Updated environmental regulations', 'Water quality, waste, air quality, plastics, sand harvesting and toxic-chemical controls provide practical compliance context for stewardship.']
      ],
      questions: [
        'Are restoration programmes reporting survival, ecological function and biodiversity outcomes rather than only hectares planted?',
        'Do local communities have secure rights, meaningful roles and fair benefits in conservation and nature-based projects?',
        'Are environmental compliance and enforcement records connected to the places and activities they regulate?',
        'Could a proposed climate intervention create maladaptation, biodiversity loss, pollution or inequitable land-use impacts?'
      ],
      signal: ['Nature = infrastructure', 'Healthy ecosystems are productive and protective infrastructure, not decorative additions to climate programmes.']
    }
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function installStyles(){
    if(document.getElementById('kpcg-thematic-content-styles'))return;
    const style=document.createElement('style');
    style.id='kpcg-thematic-content-styles';
    style.textContent=`
      .theme-editorial{background:#fffdf8;border-top:1px solid #e0e6e1;border-bottom:1px solid #e0e6e1}
      .theme-editorial-intro{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,.55fr);gap:34px;align-items:start;margin-bottom:44px}
      .theme-editorial-copy p{font-size:1.04rem;line-height:1.75;color:var(--text-secondary);max-width:78ch}
      .theme-signal{background:#0b5139;color:#fff;padding:28px;border-radius:16px;position:sticky;top:96px;box-shadow:0 18px 44px rgba(9,45,35,.12)}
      .theme-signal b{display:block;font-size:clamp(2rem,4vw,3.2rem);line-height:1;letter-spacing:-.05em;color:#f0ce83;margin-bottom:10px}
      .theme-signal span{display:block;color:#d5e5dc;line-height:1.55;font-size:.92rem}
      .theme-content-heading{display:flex;justify-content:space-between;align-items:end;gap:20px;margin:0 0 22px}
      .theme-content-heading h3{font-size:clamp(1.6rem,3vw,2.45rem);line-height:1.08;letter-spacing:-.03em;margin:5px 0 0}
      .theme-priority-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:50px;counter-reset:priority}
      .theme-priority{counter-increment:priority;background:#fff;border:1px solid #dbe3de;border-radius:14px;padding:24px;min-height:190px;position:relative;overflow:hidden}
      .theme-priority:before{content:counter(priority,decimal-leading-zero);display:block;color:#9c5a3c;font-size:.76rem;font-weight:900;letter-spacing:.08em;margin-bottom:30px}
      .theme-priority h4{font-size:1.08rem;margin:0 0 9px;color:#14231d}
      .theme-priority p{margin:0;color:#5a6a62;line-height:1.62}
      .theme-governance-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:30px;align-items:start}
      .theme-anchor-list,.theme-question-list{display:grid;border-top:1px solid #d8e0db}
      .theme-anchor,.theme-question{display:grid;grid-template-columns:34px 1fr;gap:14px;padding:18px 0;border-bottom:1px solid #d8e0db}
      .theme-anchor-num,.theme-question-num{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#e8f0eb;color:#0b5139;font-size:.72rem;font-weight:900}
      .theme-anchor strong,.theme-question strong{display:block;margin-bottom:5px;color:#1b2c25}
      .theme-anchor p,.theme-question p{margin:0;color:#617068;font-size:.91rem;line-height:1.55}
      .theme-context-note{margin-top:44px;padding:18px 20px;border-left:3px solid #c68a29;background:#f6f1e5;color:#5e625b;font-size:.82rem;line-height:1.6}
      @media(max-width:800px){.theme-editorial-intro,.theme-governance-grid{grid-template-columns:1fr}.theme-signal{position:relative;top:auto}.theme-priority-grid{grid-template-columns:1fr}.theme-priority{min-height:0}.theme-content-heading{display:block}}
    `;
    document.head.appendChild(style);
  }

  function renderPriority(item){
    return `<article class="theme-priority"><h4>${esc(item[0])}</h4><p>${esc(item[1])}</p></article>`;
  }

  function renderAnchor(item,index){
    return `<div class="theme-anchor"><span class="theme-anchor-num">${String(index+1).padStart(2,'0')}</span><div><strong>${esc(item[0])}</strong><p>${esc(item[1])}</p></div></div>`;
  }

  function renderQuestion(item,index){
    return `<div class="theme-question"><span class="theme-question-num">${String(index+1).padStart(2,'0')}</span><div><strong>Accountability question</strong><p>${esc(item)}</p></div></div>`;
  }

  function enhanceTheme(){
    const match=location.hash.match(/^#\/theme\/([^/?#]+)/);
    if(!match)return;
    const slug=decodeURIComponent(match[1]);
    const data=CONTENT[slug];
    if(!data)return;
    const app=document.getElementById('app');
    if(!app)return;
    if(app.querySelector(`[data-theme-editorial="${slug}"]`))return;

    const firstDetail=app.querySelector('.xp-section .detail-layout article');
    if(firstDetail){
      const heading=firstDetail.querySelector('.section-title');
      const lede=firstDetail.querySelector('.lede');
      if(heading)heading.textContent=data.sectionTitle;
      if(lede)lede.textContent=data.overview[0];
    }

    const section=document.createElement('section');
    section.className='xp-section theme-editorial';
    section.dataset.themeEditorial=slug;
    section.innerHTML=`<div class="container">
      <div class="theme-editorial-intro">
        <div class="theme-editorial-copy">
          <div class="eyebrow">Kenya context</div>
          <h2 class="section-title">What this thematic lens needs to explain</h2>
          <p>${esc(data.overview[1])}</p>
        </div>
        <aside class="theme-signal" aria-label="Key thematic signal"><b>${esc(data.signal[0])}</b><span>${esc(data.signal[1])}</span></aside>
      </div>

      <div class="theme-content-heading"><div><div class="eyebrow">Priority agenda</div><h3>What to follow across programmes, counties and policy</h3></div></div>
      <div class="theme-priority-grid">${data.priorities.map(renderPriority).join('')}</div>

      <div class="theme-governance-grid">
        <section>
          <div class="theme-content-heading"><div><div class="eyebrow">Governance anchors</div><h3>Frameworks and processes that give the theme context</h3></div></div>
          <div class="theme-anchor-list">${data.anchors.map(renderAnchor).join('')}</div>
        </section>
        <section>
          <div class="theme-content-heading"><div><div class="eyebrow">Evidence & accountability</div><h3>Questions the platform should make easier to answer</h3></div></div>
          <div class="theme-question-list">${data.questions.map(renderQuestion).join('')}</div>
        </section>
      </div>

      <div class="theme-context-note"><strong>Content status:</strong> Kenya policy and governance context is presented as public-domain thematic framing. KPCG-specific programme counts, member links, policy records, events and impact figures elsewhere in this evaluation prototype remain illustrative until validated and published by KPCG/PACJA.</div>
    </div>`;

    const target=[...app.querySelectorAll('.xp-section')].find(el=>el.classList.contains('alt')) || app.querySelectorAll('.xp-section')[1];
    if(target?.parentNode)target.parentNode.insertBefore(section,target);
    else app.querySelector('.page-shell')?.appendChild(section);
  }

  let pending=0;
  function schedule(){
    clearTimeout(pending);
    pending=setTimeout(enhanceTheme,35);
  }

  installStyles();
  window.addEventListener('hashchange',schedule);
  const app=document.getElementById('app');
  if(app)new MutationObserver(schedule).observe(app,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
})();
