# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See @AGENTS.md for Next.js-version-specific agent guidance (this project may use APIs/conventions newer than your training data — check `node_modules/next/dist/docs/` before relying on memory).

## Project status

Scaffolded with `create-next-app`: Next.js (App Router) + TypeScript + Tailwind CSS v4 + ESLint. No separate backend — Next.js API routes (`src/app/api/**/route.ts`) serve as the backend for now.

Commands:
- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint

## Project brief (from README, originally in Russian)

The site is for the user's father's plumbing/sanitary-ware business ("сантехника" — plumbing fixtures/supplies) in their city. Goals:

- Initial version: a landing page / business-card style site showcasing products (товары).
- Reference competitor site for visual/functional inspiration: https://nautilusdn.com/ — the goal is to match or exceed it in design quality and modern visual polish.
- Possible future integration with "1C" (1С, a common Russian ERP/accounting system) to pull product nomenclature (номенклатура) and sync it into the site — not yet decided how (could start as a simple/basic data export rather than live integration).
- After the initial landing page, functionality may be expanded (e.g. a fuller catalog/store).

## Stack decisions

- TypeScript throughout.
- Next.js (React) with App Router — chosen over Vue/Nuxt and a plain SPA for built-in SSR/SSG (SEO matters for a marketing landing page) and a clear growth path to a fuller catalog.
- Tailwind CSS v4 for styling.
- No standalone backend yet — Next.js API routes act as the backend until/unless the 1C integration or a fuller store requires a dedicated service.
