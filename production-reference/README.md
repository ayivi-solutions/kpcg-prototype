# KPCG Production Reference Architecture

This directory is an executable-reference scaffold for the production architecture committed in AYIVI's Technical Proposal. It is intentionally separate from the lightweight public prototype deployment.

The reference stack uses:

- Next.js 16 App Router with Server Components / server rendering
- React 19
- Payload CMS 3.x
- PostgreSQL through Payload's Postgres adapter
- Node.js 22+
- structured collections for pages, media and users
- server-rendered public pages that query published CMS content on the server

The public prototype at the repository root is optimized for evaluator access and rapid review. This reference demonstrates how the same information architecture is intended to move into the production CMS/database/server-rendered application without representing the current prototype as that production system.

## Environment

Copy `.env.example` to `.env.local` and provide a PostgreSQL connection string and Payload secret.

## Intended production flow

`Editor → Payload CMS workflow → PostgreSQL → server-rendered Next.js route → public cache/CDN`

Publishing remains an authenticated human action. Draft/private records are not returned by public queries.
