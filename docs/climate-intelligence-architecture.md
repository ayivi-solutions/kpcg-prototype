# KPCG Kenya Climate & Health Intelligence Architecture v21

## Purpose
KPCG's existing Kenya administrative map is the spatial operating layer for climate, health, vulnerability, resilience, policy and civil-society intelligence. This release extends the existing KPCG platform rather than replacing it with a standalone application.

The operating chain is:

`KENYA → COUNTY → CLIMATE HAZARD → EXPOSURE → VULNERABILITY → HEALTH / SOCIOECONOMIC IMPACT → RESPONSE → RESILIENCE → ACTORS → PROGRAMMES → EVIDENCE → POLICY → COMMITMENTS → ACCOUNTABILITY`

## Analytical model
The public analytical chain remains explicit and non-composite:

`HAZARD → EXPOSURE → VULNERABILITY → HEALTH / SOCIOECONOMIC IMPACT → RESPONSE → RESILIENCE`

No overall Climate Score or Vulnerability Score is generated. Each dimension remains separately inspectable. Indicator values never imply policy implementation status.

## Geography
The checksum-pinned Kenya boundary estate remains the prototype geography authority: ADM0 Kenya, ADM1 47 counties, ADM2 290 sub-counties and ADM3 1,452 wards. `scripts/sync-admin-boundaries.mjs` downloads the pinned geoBoundaries release and rejects files whose byte size, SHA-256, geometry count or administrative shape type differs from the approved evidence set.

Runtime geometry is loaded from `/data/admin/adm0.topo.json` through `/data/admin/adm3.topo.json`; the map can fall back to the same pinned remote source if local geometry is unavailable. Observations reference canonical geography IDs, never free-text county names. The production Geography contract additionally supports facilities, points and grid cells.

## Indicator and observation architecture
`public/data/climate/indicator-registry.json` is the central runtime registry. It provides at least 90 structural indicators across seven domains:

1. Climate Hazards
2. Exposure & Vulnerability
3. Climate & Health
4. Water, Food & Ecosystems
5. Emissions & Mitigation
6. Adaptation & Resilience
7. KPCG Action & Evidence

`public/data/climate/observations.json` remains separate from geography and metadata. Public observations are deliberately not populated with invented Kenyan climate or health figures.

Hard rules:
- missing data is never numeric zero;
- a genuine zero must be explicitly present in an observation;
- observed, estimated, modelled, projected and provisional values stay distinct;
- verified, provisional, stale, superseded and unavailable states stay visible;
- public values carry source, dataset, period, methodology and verification state;
- any development seed must carry `DEMO / SAMPLE DATA — NOT FOR PUBLICATION`;
- thresholds/classifications must come from indicator metadata or the authoritative source, never arbitrary frontend constants.

## Observation-aware map runtime
`public/climate-intelligence-execution-v21.js` is loaded after the v20 registry/core/UI layer and makes the administrative polygons data-aware without replacing the existing map engine.

The runtime now provides:
- observation-driven ADM0–ADM3 polygon state;
- explicit No data pattern rather than low-risk colouring;
- separate stale, provisional, estimated, modelled and projected visual states;
- metadata-driven threshold bands when approved thresholds exist;
- source and status filters encoded in map URL state;
- accessible polygon labels containing indicator, value, state, period and source;
- the WHO-style hazard-to-resilience analytical chain in the workspace and county drawer;
- timeline/playback controls when an indicator has more than one period;
- numeric time-series trend rendering without mixing superseded records;
- expanded indicator provenance, framework mapping, temporal/geographic metadata, licence and benchmark fields;
- county URL-state restoration for shared climate-intelligence links;
- county-level selected-indicator evidence summaries;
- explicit statement that framework relevance does not equal policy implementation evidence.

## Legends and uncertainty
Every active indicator receives an evidence-state legend. If authoritative thresholds exist, the legend uses each threshold's `visualToken`. If no approved threshold classification exists, verified observations render as a neutral observed state rather than being assigned an invented risk class.

Non-colour encodings distinguish No data, stale, provisional, estimated/modelled and projected states. This preserves meaning for users who cannot rely on colour alone and prevents uncertainty from being hidden.

## Temporal intelligence
The existing period selector remains canonical. When two or more periods exist for the active indicator, v21 adds an accessible range timeline and playback control. The timeline only switches between stored observations; it does not interpolate missing periods. Trend charts require numeric observations for the same canonical geography and exclude superseded records.

## Policy and accountability
`public/data/climate/policy-mappings.json` defines the fail-closed policy-accountability contract. `Indicator.framework[]` is the canonical indicator-to-framework relevance relationship. Commitment-level mappings require an authoritative target/commitment identifier, responsible institution where known, evidence IDs and an explicit evidence source before any implementation status may be presented.

The framework estate supports WHO, WMO, SDGs, UNFCCC, the Paris Agreement, Kenya NDC, Kenya NCCAP, Kenya Climate Change Act, national sector frameworks and County Climate Action Plans. Empty or incomplete mappings remain `not-assessed`; values are never converted into claims of policy delivery.

## Alerts
`public/data/climate/alerts.json` prepares drought, extreme-rainfall, flood, heat, air-pollution, disease-risk and food-insecurity alerts. The public alert store is empty until an authoritative source, authoritative threshold, affected geography, issue time, validity period, severity and source reference all exist. KPCG must never fabricate emergency warnings.

## Source priority and ingestion
The source registry prioritises Kenyan authorities: KMD, NDMA, KNBS, Ministry of Health/KHIS, Master Health Facility List, NEMA and approved county sources. International sources supplement rather than silently displace appropriate Kenyan authorities. NDMA drought classifications must be used as published rather than replaced by a KPCG-invented classification.

Reference TypeScript contracts live under `production-reference/climate-intelligence/`. `source-adapters.ts` now registers fail-closed adapter specifications for KMD, NDMA, KNBS, health/KHIS, MFL, NEMA, county sources, KPCG, WHO, WMO, UNFCCC, FAO, UNEP, World Bank and approved Earth-observation sources.

Every activated adapter must follow this sequence:
1. fetch/read source data;
2. validate source record;
3. normalize canonical geography;
4. normalize units;
5. map indicator code;
6. attach provenance;
7. create/store observation;
8. report failures;
9. preserve raw/source reference where appropriate.

An adapter remains structurally registered but deliberately fails closed until access, licence, schema, refresh cadence, geography crosswalk and validation rules are configured.

## Public map UX
`#/where-we-work` remains the map-first intelligence workspace. It contains the seven intelligence modes, indicator registry, real ADM0–ADM3 geography, county search, source/status filters, indicator provenance, temporal controls, county intelligence drawer, county comparison, shareable URL state and CSV export.

The existing county route is retained and enriched into a climate-intelligence profile. Existing KPCG programme, member, knowledge and event routes remain linked from county intelligence. Climate observations remain analytically separate from organisational activity records.

## Verification
`npm run climate:verify` checks the seven modes, indicator contract, authoritative source registry, canonical geography counts, missing-data rules, policy and alert fail-closed rules, observation-aware v21 runtime markers, source-adapter registration and ADM0–ADM3 map support.

`npm run verify` additionally executes administrative boundary preparation, social checks, acceptance checks and a Cloudflare deploy dry-run.
