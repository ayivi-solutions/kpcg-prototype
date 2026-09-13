# KPCG Digital Platform — Public Prototype

This repository contains AYIVI Systems Limited's public prototype for the **Kenya Platform for Climate Governance (KPCG)**. It is designed to demonstrate the proposed public experience, information architecture and interaction model at `https://kpcg.ayivisolutions.com`.

## What the prototype demonstrates

- A responsive, mobile-first public climate-governance experience.
- Interactive exploration of Kenya's 47 counties, with an equivalent county list and keyboard-operable county map.
- Relationships between counties, thematic priorities, programmes and projects, policy and advocacy, evidence resources, news, events, multimedia, membership and opportunities.
- Real KPCG-owned media integrated across the public experience, including a rotating multi-image homepage hero.
- Progressive Web App behaviour, service-worker caching, resilient navigation and automated desktop/mobile browser checks.
- Source-visible homepage content and social-preview metadata for crawlers, link unfurling and non-JavaScript inspection.

## Prototype and proposed production architecture

This repository is a **public-facing prototype demonstrator**. Its deployment architecture is intentionally lightweight so evaluators can review the experience quickly and reliably.

The prototype is deployed as a **consolidated static application through Cloudflare Workers with Static Assets**. It is **not** represented as the production CMS, database, security, workflow or integration implementation described in AYIVI's Technical Proposal.

The proposed production implementation remains the architecture stated in the Technical Proposal, including **Next.js, React and TypeScript with server rendering, Payload CMS 3.x, PostgreSQL, and the associated Node.js services, publishing workflows and integration controls**.

The distinction is deliberate: this repository demonstrates the user experience and functional direction; the Technical Proposal defines the production engineering commitment.

## Current prototype runtime

The current prototype is maintained as a **single consolidated application document** at `public/index.html`. Historical prototype iterations remain available through Git history, but the deployed application does not reconstruct or apply a chain of runtime patches.

The public root document includes semantic homepage content before client-side enhancement, including primary navigation, the main heading, introductory copy and a representative KPCG image. This allows search crawlers, link-preview systems and source inspection to see meaningful content without executing the application JavaScript.

## Accessibility and performance

The prototype includes:

- Keyboard-operable county shapes and administrative-centre markers.
- An equivalent text/list route for county exploration.
- Semantic navigation and landmark structure.
- Reduced-motion handling for animated experiences.
- Responsive layouts for desktop and mobile.
- Lazy loading of non-initial hero slides so the expanded slideshow does not force all hero images into the initial network path.
- Automated browser QA covering desktop, mobile, hero transitions, route rendering, service-worker behaviour and keyboard activation of the county map.

## Data and media integrity

KPCG-owned photographs supplied for the prototype are treated as documentary KPCG media and may be used throughout the public experience. The prototype deliberately rotates a larger pool of photographs to avoid excessive repetition.

Unless explicitly identified as verified client material, programme counts, member counts, policy records, opportunities, event details, resource metadata and impact-style values remain illustrative prototype content and must not be interpreted as confirmed KPCG results.

Leadership portraits remain placeholders until the identity of each person can be verified against the corresponding KPCG role.

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
