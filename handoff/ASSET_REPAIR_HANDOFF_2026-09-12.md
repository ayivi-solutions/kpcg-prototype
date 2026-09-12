# KPCG Asset Repair Handoff — 2026-09-12

## Scope completed in working sandbox

Prepared higher-quality WebP replacements for the existing public visual asset slots below. No new logo was requested or approved; the repository logo is intentionally left unchanged.

- featured-locally-led-action.webp
- leader-governance.webp
- leader-programme.webp
- leader-secretariat.webp
- media-01-county-dialogue.webp
- media-02-community-adaptation.webp
- media-03-governance-interview.webp
- media-04-evidence-cover.webp
- media-05-county-dialogue.webp
- media-06-community-adaptation.webp
- media-07-governance-interview.webp
- media-08-evidence-cover.webp
- media-09-county-dialogue.webp
- media-10-community-adaptation.webp
- media-11-governance-interview.webp
- media-12-evidence-cover.webp

## Prepared output characteristics

The replacement files were prepared from the generated source imagery at materially higher web quality than the currently deployed 2–5 KB thumbnail-grade assets. Typical prepared dimensions are approximately 1400 px on the long edge, with portrait/document assets around 1050×1400 and square interview assets around 1254×1254.

The prepared archive checksum from the working sandbox was:

`0be2f2ec4fc225ab7f1548652da1270dd2582381d83edeaa1412cee9eed867c5`

## Important handoff note

The binary replacements were prepared in the working sandbox but were not safely attached to the production tree through the available connector before this handoff. Do not treat the tiny current files under `public/assets/` as the intended quality baseline. The next assignee should replace those existing files in-place using the filenames above so the application requires no URL changes.

## Current production baseline

Leave the existing v16 application code and routing intact. The outstanding task is binary asset replacement only unless a new instruction explicitly expands scope.
