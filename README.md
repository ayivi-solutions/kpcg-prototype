# KPCG Digital Platform Prototype

Executive prototype for the **Kenya Platform for Climate Governance (KPCG)**.

## Production target

- Deployment platform: **Cloudflare Workers** with Static Assets — not Cloudflare Pages.
- GitHub repository: `ayivi-solutions/kpcg-prototype`
- Custom domain: `https://kpcg.ayivisolutions.com`
- Application entry: `public/index.html`
- Accepted experience line: **v16**, hardened as the **v16.1 acceptance baseline**.
- Validated fallback line: **v15**; stable core fallback remains **v13**.

## Administrative Kenya map

The public platform uses the supplied **geoBoundaries Kenya ADM1** administrative boundary geometry for the 47 counties. County polygons are embedded into the prototype and are interactive, keyboard accessible, drillable, zoomable, and backed by the equivalent county list. Activity counts and content relationships remain explicitly illustrative prototype data.

## Local development

```bash
npm install
npm run dev
```

## Acceptance and release safety

Before any deployment, reconstruct and validate the complete application chain:

```bash
npm run acceptance
```

The acceptance gate verifies required release assets, reconstructs the compressed base application, applies v11, v12, v13, validated v15 and v16 in sequence, rejects malformed or unexpectedly truncated output, verifies the v16.1 cache contract and PWA metadata, and enforces a minimum quality floor for the sixteen public visual assets.

For the full pre-deployment verification pass:

```bash
npm run verify
```

`npm run deploy` is protected by the `predeploy` acceptance gate. GitHub also runs the same reconstruction check on pushes to `main`, the v16.1 hardening branch, and pull requests targeting `main`.

## Runtime hardening

`public/index.html` uses bounded network requests and validates the document after each major patch stage. A failed v16 transform preserves v15; a failed v15 transform preserves the previous stable interface. The final document is validated before it can replace the loader, preventing a successful-but-empty transform from recreating the earlier blank-screen failure mode.

The service worker uses a release-specific cache and network-first handling for release-critical application fragments and public assets so clients do not assemble mixed versions from stale cache entries.

## Cloudflare Workers deployment

This repository is intended for **Cloudflare's direct Git integration / Workers Builds**. No Cloudflare API secrets are required in GitHub for the direct integration path.

In Cloudflare, connect/import `ayivi-solutions/kpcg-prototype`, use branch `main`, and let Cloudflare build/deploy the Worker from the repository configuration.

Recommended deploy command:

```bash
npm install && npm run deploy
```

`wrangler.jsonc` configures Worker Static Assets with SPA fallback and the custom domain `kpcg.ayivisolutions.com`.

## Domain note

The Wrangler configuration uses a Worker **Custom Domain**. Cloudflare can create/manage the Worker DNS record and certificate when `ayivisolutions.com` is an active Cloudflare zone and the hostname is available. If `kpcg.ayivisolutions.com` already has a conflicting DNS record, reconcile it before the first Worker deployment.

## Prototype data integrity

Unless explicitly identified as verified client material, programme counts, member counts, policy records, events, opportunities, resources and impact-style values are prototype/illustrative data and must not be represented as verified KPCG achievements. Generated demonstration imagery is illustrative and must not be represented as documentary evidence of actual KPCG events, personnel or programme delivery.
