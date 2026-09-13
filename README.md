# KPCG Digital Platform — Public Prototype

This repository contains AYIVI Systems Limited's public prototype for the **Kenya Platform for Climate Governance (KPCG)**. It demonstrates the proposed public experience, information architecture, county discovery model, editorial workflows and interaction direction at:

`https://kpcg.ayivisolutions.com`

## What evaluators can review

- Responsive, mobile-first public climate-governance experience.
- Interactive exploration of Kenya's 47 counties, with an equivalent county list and keyboard-operable county map.
- Relationships between counties, thematic priorities, programmes and projects, policy and advocacy, evidence resources, news, events, multimedia, membership and opportunities.
- A rotating homepage hero using a broad set of KPCG-owned photographs, with additional real KPCG media distributed across News, Knowledge and Multimedia rather than repeatedly reusing the same small image set.
- Progressive Web App behaviour, service-worker caching, resilient navigation and automated desktop/mobile browser checks.
- Meaningful homepage content and social-preview metadata directly in the root HTML source for crawlers, link previews and non-JavaScript inspection.

### Editorial workflow demonstration

The prototype includes a simulated editorial workspace that demonstrates content creation, media handling, taxonomy, submissions, curation, users/roles, SEO, audit and analytics interactions.

Open it directly at:

`https://kpcg.ayivisolutions.com/#/cms/login`

This is a **workflow demonstrator**, not a claim that the public prototype itself is already running the production Payload CMS/PostgreSQL backend.

## Prototype deployment versus production commitment

The public prototype is deliberately lightweight so KPCG/PACJA evaluators can inspect it quickly and reliably. It is deployed as a **consolidated static application through Cloudflare Workers with Static Assets**.

The production implementation committed in AYIVI's Technical Proposal remains **Next.js, React and TypeScript with server rendering, Payload CMS 3.x, PostgreSQL and the associated Node.js services, security controls, publishing workflows and integrations**.

To make that production commitment concrete rather than merely descriptive, this repository includes an executable-reference scaffold under [`production-reference/`](production-reference/) containing:

- Next.js App Router / Server Component structure;
- Payload CMS 3.x configuration;
- PostgreSQL adapter configuration;
- authenticated users and roles;
- media management;
- draft/version/scheduled-publishing configuration;
- published-only public access; and
- a server-rendered homepage query against Payload content.

The production reference is automatically checked by the acceptance workflow so the public prototype and the proposed production architecture cannot silently drift apart.

## Current prototype runtime

The current prototype is maintained as a **single consolidated application document** at `public/index.html`. Historical prototype iterations remain available through Git history, but the deployed application no longer reconstructs or applies a chain of runtime patches.

The root document contains semantic homepage content before client-side enhancement, including primary navigation, the main heading, introductory copy and a representative KPCG image. A crawler, link-preview service, accessibility scanner or evaluator using View Source therefore sees meaningful platform content without needing the application JavaScript to execute first.

## Accessibility and performance

The prototype includes:

- keyboard-operable county shapes and administrative-centre markers;
- an equivalent text/list route for county exploration;
- semantic navigation and landmark structure;
- reduced-motion handling for animated experiences;
- responsive layouts for desktop and mobile;
- lazy loading of non-initial hero slides; and
- automated browser QA covering desktop, mobile, hero transitions, route rendering, service-worker behaviour and keyboard activation of the county map.

The acceptance workflow also runs a **mobile Lighthouse audit** and enforces minimum performance, accessibility, best-practices and SEO scores before the release is accepted.

## Data and media integrity

KPCG-owned photographs supplied for the prototype are treated as documentary KPCG media and may be used throughout the public experience. The release pipeline performs content-level duplicate detection so identical photographs downloaded under different Facebook filenames do not repeatedly appear across major sections.

Unless explicitly identified as verified client material, programme counts, member counts, policy records, opportunities, event details, resource metadata and impact-style values remain illustrative prototype content and must not be interpreted as confirmed KPCG results.

Leadership portraits remain placeholders until each person's identity can be verified against the corresponding KPCG role.

## Local review

```bash
npm install
npm run dev
```

Run the consolidated release checks with:

```bash
npm run acceptance:assets
npm run verify:strict
```

## Deployment

The public prototype is deployed from `main` through **Cloudflare Workers with Static Assets** using the repository's Wrangler configuration. The custom review domain is:

`https://kpcg.ayivisolutions.com`

The public prototype deployment choice should not be confused with the proposed production application stack described above.
