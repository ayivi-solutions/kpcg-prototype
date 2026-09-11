# KPCG Digital Platform Prototype

Executive prototype for the **Kenya Platform for Climate Governance (KPCG)**.

## Production target

- Deployment platform: **Cloudflare Workers** with Static Assets — not Cloudflare Pages.
- GitHub repository: `ayivi-solutions/kpcg-prototype`
- Custom domain: `https://kpcg.ayivisolutions.com`
- Application entry: `public/index.html`

## Administrative Kenya map

The public platform uses the supplied **geoBoundaries Kenya ADM1** administrative boundary geometry for the 47 counties. County polygons are embedded into the prototype and are interactive, keyboard accessible, drillable, zoomable, and backed by the equivalent county list. Activity counts and content relationships remain explicitly illustrative prototype data.

## Local development

```bash
npm install
npm run dev
```

## Cloudflare Workers deployment

This repository is intended for **Cloudflare's direct Git integration / Workers Builds**. No GitHub Actions deployment workflow and no Cloudflare API secrets are required in GitHub.

In Cloudflare, connect/import `ayivi-solutions/kpcg-prototype`, use branch `main`, and let Cloudflare build/deploy the Worker from the repository configuration.

Recommended deploy command:

```bash
npm install && npm run deploy
```

`wrangler.jsonc` configures Worker Static Assets with SPA fallback and the custom domain `kpcg.ayivisolutions.com`.

## Domain note

The Wrangler configuration uses a Worker **Custom Domain**. Cloudflare can create/manage the Worker DNS record and certificate when `ayivisolutions.com` is an active Cloudflare zone and the hostname is available. If `kpcg.ayivisolutions.com` already has a conflicting DNS record, reconcile it before the first Worker deployment.

## Prototype data integrity

Unless explicitly identified as verified client material, programme counts, member counts, policy records, events, opportunities, resources and impact-style values are prototype/illustrative data and must not be represented as verified KPCG achievements.
