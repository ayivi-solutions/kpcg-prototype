# KPCG v16.1 Acceptance Closure — 2026-09-12

## Baselines

- Current public experience line: **v16**.
- Validated experience fallback: **v15** (`3f437f62aaa75b8715b450bf68f617ce21131cd6`).
- Stable emergency core floor: **v13** (`e55499d82919f109a94fa7b032365c05d8b14d64`).
- v16.1 is a hardening release. It does not redesign or replace the approved v16 experience.

## P0 remediation completed

1. The loader now applies a 12-second bound to release-fragment requests.
2. Every major transform is structurally validated before it can replace the previous stable document.
3. A successful-but-empty, truncated or malformed patch result is rejected rather than written to the browser.
4. v16 failure preserves v15; v15 failure preserves the preceding stable interface.
5. Fatal base-load failure retains a visible recovery screen and Retry action.
6. The service worker now uses a release-specific v16.1 cache and network-first handling for release-critical application fragments, eliminating the previous mixed-version cache-first startup risk.
7. A deterministic Node acceptance test reconstructs the base document and applies v11, v12, v13, v15 and v16 in release order before deployment.
8. `npm run deploy` is protected by the runtime acceptance gate through `predeploy`.
9. GitHub Actions executes the runtime reconstruction gate on the hardening branch, `main`, and pull requests targeting `main`.
10. The superseded v14 staging fragments were removed from the active tree; their history remains available in Git.

## P1 visual-asset status

The sixteen public visual filenames remain stable so no URL, route or v16 component changes are required. Higher-quality WebP replacements have been regenerated from the original demonstration imagery and prepared as a drop-in asset pack. The strict repository command is:

```bash
npm run acceptance:assets
```

It fails while any of the sixteen public visual files is below the 40 KB release floor. The normal runtime gate reports the same condition as a warning so P0 safety remediation can deploy independently.

Prepared asset-pack checksum:

`2a86bbd9fc34fe3622e1f368ff96775beb7ad4d97759e4aa9c1229cc5a28c2a6`

The prepared files retain the existing sixteen filenames and are approximately 1,050–1,400 pixels on the long edge, depending on aspect ratio. They must replace the existing files in `public/assets/` in place, followed by `npm run verify:strict`.

## Content-integrity rule

Prototype counts, events, opportunities, resources, impact values and other institutional claims must not be represented as verified KPCG achievements unless backed by verified client material. Generated demonstration imagery is illustrative and must not be represented as documentary evidence of actual KPCG personnel, events or programme delivery.

## Release governance

The repository now contains a repeatable CI acceptance check. GitHub branch-protection/ruleset enforcement should require the `KPCG Acceptance` check on `main` where repository administration permissions permit. The current integration cannot change organization-level protection settings, so release discipline must continue through reviewed/green pull requests until that setting is enabled.
