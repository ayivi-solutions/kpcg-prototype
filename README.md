# KPCG Digital Platform Prototype

Executive prototype for the **Kenya Platform for Climate Governance (KPCG)**.

## Production target

- Deployment platform: **Cloudflare Workers** with Static Assets — not Cloudflare Pages.
- GitHub repository: `ayivi-solutions/kpcg-prototype`
- Custom domain: `https://kpcg.ayivisolutions.com`
- Application: self-contained SPA at `public/index.html`

## Administrative Kenya map

The public platform uses the supplied **geoBoundaries Kenya ADM1** administrative boundary geometry for the 47 counties. County polygons are embedded directly into the self-contained HTML and are interactive, keyboard accessible, drillable, zoomable, and backed by the equivalent county list. Activity counts and content relationships remain explicitly illustrative prototype data.

## Local development

```bash
npm install
npm run dev
```

## Cloudflare Workers deployment

```bash
npm install
npm run deploy
```

`wrangler.jsonc` configures Worker Static Assets with SPA fallback and the custom domain `kpcg.ayivisolutions.com`.

### Git-connected deployment

Connect this repository to Cloudflare Workers Builds and deploy the `main` branch. Use Node 20+ and the deploy command:

```bash
npm install && npm run deploy
```

Alternatively, enable the included GitHub Actions workflow and add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Domain note

The Wrangler configuration uses a Worker **Custom Domain**. Cloudflare can create/manage the Worker DNS record and certificate when `ayivisolutions.com` is an active Cloudflare zone and the hostname is available. If `kpcg.ayivisolutions.com` already has a conflicting CNAME, remove or reconcile that record before the first Worker deployment.

## Prototype data integrity

Unless explicitly identified as verified client material, programme counts, member counts, policy records, events, opportunities, resources and impact-style values are prototype/illustrative data and must not be represented as verified KPCG achievements.
