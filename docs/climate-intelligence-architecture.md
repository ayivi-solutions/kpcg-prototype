# KPCG Kenya Climate & Health Intelligence Architecture v20

## Purpose
This release extends the existing KPCG platform rather than replacing it with a standalone application. The ADM0–ADM3 geography engine remains the spatial foundation while the climate-intelligence layer adds indicator, observation, provenance, temporal, comparison, policy and KPCG relationship semantics.

## Analytical model
The public analytical chain remains explicit and non-composite:

`HAZARD → EXPOSURE → VULNERABILITY → HEALTH / SOCIOECONOMIC IMPACT → RESPONSE → RESILIENCE`

No overall Climate Score or Vulnerability Score is generated. Each dimension remains separately inspectable.

## Geography
The supplied Kenya boundary estate remains authoritative for the prototype: ADM0 Kenya, ADM1 47 counties, ADM2 290 sub-counties and ADM3 1,452 wards. The production Geography contract also supports facilities, points and grid cells. Observations reference geography IDs, never free-text county names.

## Indicator and observation architecture
`public/data/climate/indicator-registry.json` is the central runtime registry. It provides 94 structural indicators across seven domains. Common fields are declared through `indicatorDefaults` and expanded at runtime, so each indicator resolves to the full Indicator contract.

`public/data/climate/observations.json` is deliberately separate from geography and metadata. Public observations are empty in this structural release rather than populated with invented Kenyan climate or health figures.

Hard rules:
- missing data is never numeric zero;
- a genuine zero must be explicitly present in an observation;
- observed, estimated, modelled, projected and provisional values stay distinct;
- verified, provisional, stale, superseded and unavailable states stay visible;
- public values carry source, dataset, period, methodology and verification state;
- any development seed must carry `DEMO / SAMPLE DATA — NOT FOR PUBLICATION`.

## Source priority
The source registry prioritises Kenyan authorities: KMD, NDMA, KNBS, Ministry of Health/KHIS, Master Health Facility List, NEMA and approved county sources. International sources supplement rather than silently displace appropriate Kenyan authorities. NDMA drought classifications must be used as published rather than replaced by a KPCG-invented classification.

## Public map UX
The existing `#/where-we-work` route becomes a map-first intelligence workspace with seven intelligence modes, registry-driven indicators, the hazard-to-resilience chain, ADM0–ADM3 drill-down, an accessible county list, indicator provenance, temporal controls, county intelligence drawer, county comparison, shareable URL state and CSV export. The map uses a patterned No data state until observations exist, so unavailable data cannot be mistaken for low risk.

The existing county route is retained and enriched into a full climate-intelligence profile. Existing KPCG programme, project, member, evidence, event and story relationships remain available and are explicitly separated from climate observations.

## Production ingestion boundary
Reference TypeScript contracts live under `production-reference/climate-intelligence/`. Each external adapter follows this sequence:
1. fetch/read source data;
2. validate;
3. normalize geography;
4. normalize units;
5. map indicator code;
6. attach provenance;
7. create/store observation;
8. report failures;
9. preserve raw/source reference where appropriate.

External API acquisition therefore does not live inside map components. Real integrations should be activated only after access, licence, schema, refresh cadence, geographic compatibility and validation rules are confirmed.
