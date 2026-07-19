---
title: "refactor: Replace Next.js with static Astro as the site layer (keep Convex + Clerk + Stripe CRM)"
type: refactor
date: 2026-07-19
---

# ♻️ Replace Next.js with static Astro as the site layer

## Overview

Rewrite the `site-crm-builder` skill so the generated app is a **static-first Astro** site instead of
a Next.js App Router app, adopting the SEO-first playbook from `astro-builder-skill` (niche/keyword
research, long-form content, many pages, content collections), while **keeping the CRM exactly as
scoped today**: Convex (reactive DB) + Clerk (auth) + Stripe (payments), running as a React island at
`/dashboard`.

This repo is a **skill** (docs + two starter templates), not an app — the deliverable is updated
`SKILL.md`, `README.md`, and `templates/`, not application code.

## Problem Statement / Motivation

- Next.js is heavier than needed: the marketing site is 90% static content; only the enquiry form,
  checkout button, and dashboard need JS. Astro ships zero JS by default → better Core Web Vitals →
  better rankings, which is the whole point of a business site.
- The sibling `astro-builder-skill` has a proven SEO playbook (keyword research, per-page keyword
  targets, 800–1500-word service pages, blog via content collections, internal linking) that
  site-crm-builder's thin 3-page site lacks.
- Two skills by the same author currently overlap awkwardly; this makes site-crm-builder the
  "Astro SEO site **with a real CRM**" option.

## Proposed Solution

Swap only the site layer. Architecture of the generated app:

- **Static Astro pages** (default `output: 'static'`) — Home, About, one page **per service**
  (SEO landing pages), Areas-served/testimonials as warranted, Blog via **content collections**,
  Contact. Each page gets an `SEOHead.astro` (title, description, canonical, OG, JSON-LD),
  `@astrojs/sitemap`, dynamic `robots.txt`.
- **New Phase: keyword research before building** — adopt astro-builder's Phase 1: research what
  ranks, keyword gaps, long-tail targets; propose page list + keyword map; confirm with the owner.
- **React islands for everything dynamic**:
  - `EnquiryForm.tsx` (`client:load`) → Convex public mutation `api.leads.submitLead` (unchanged).
  - `app/dashboard` → `src/pages/dashboard.astro` rendering one `<DashboardApp client:only="react" />`
    island wrapped in `ConvexProviderWithClerk` + Clerk's React provider. CRM feature set unchanged
    (statuses, notes, value, stats, search, CSV export, payment-link button).
- **Auth**: `@clerk/astro` integration; `clerkMiddleware()` in `src/middleware.ts` protecting
  `/dashboard`; island uses `useAuth` from `@clerk/astro/react` (works with
  `ConvexProviderWithClerk`, which accepts any Clerk React SDK). Never import `@clerk/astro/server`
  in an island.
- **Server routes**: `/dashboard` page and `src/pages/api/checkout.ts` (Stripe Checkout session) are
  the only non-static routes — each marked `export const prerender = false;` with the
  `@astrojs/vercel` adapter. Do **not** use `output: 'hybrid'` (removed in Astro v5).
- **Convex/Clerk/Stripe wiring, env vars, non-interactive deploy-key flow: unchanged.** Env var
  names change prefix where client-exposed: `NEXT_PUBLIC_*` → `PUBLIC_*` (Astro convention).

### File-by-file changes in this repo

- `SKILL.md` — rewrite: stack section, scaffold commands (`npm create astro@latest` +
  `npx astro add react tailwind sitemap` + `@clerk/astro convex stripe`), new "keyword research"
  step, page-generation step (per-service pages, content collections, SEOHead), auth step
  (`@clerk/astro` middleware instead of `clerkMiddleware` from `@clerk/nextjs`), checkout route as
  Astro API route, dashboard-as-island step, deploy step (adapter note, `prerender = false`),
  updated "Files to create" list and verify checklist (add: Lighthouse/CWV sanity, sitemap present,
  per-page unique titles).
- `README.md` — update stack description, env-var table (`PUBLIC_CONVEX_URL`,
  `PUBLIC_CLERK_PUBLISHABLE_KEY`, …), "commands it runs" details block, "What it builds" (many SEO
  pages + blog).
- `templates/config/site.config.ts` — keep; extend with optional `seo` block (target keywords per
  service, service-area towns) feeding page generation.
- `templates/convex/schema.ts` — unchanged.
- **New** `templates/astro/` starters (small, reference-only, matching the existing two-starter
  pattern): `SEOHead.astro`, `middleware.ts`, `dashboard.astro` + `DashboardApp.tsx` provider
  wrapper skeleton, `api/checkout.ts` header comment sketch — or, if keeping the repo minimal,
  describe them precisely in SKILL.md as today. Decide during implementation; default to adding
  only `SEOHead.astro` + the provider wrapper (the two genuinely fiddly bits).

## Technical Considerations

- **Clerk + Convex in Astro is supported**: `@clerk/astro` is official; `ConvexProviderWithClerk`
  works with any Clerk React SDK's `useAuth`. Verified against current docs (July 2026).
- **`client:only="react"` for the dashboard** avoids SSR of Convex hooks (no server Convex client
  needed); show a small static loading shell.
- **Middleware + static output**: `clerkMiddleware` only runs on server-rendered routes — which is
  fine, since `/dashboard` is `prerender = false`. Static pages never need auth.
- **Scope guard**: keep the skill's "universal, single-business, no vertical features" scope. The
  SEO phase adds *research and pages*, not booking engines.
- **Non-interactive promise must hold**: keyword research uses web search (no new credentials);
  Convex deploy-key flow, Clerk JWT-template-via-API, and Vercel token deploy all carry over
  verbatim.

## Acceptance Criteria

- [x] `SKILL.md` describes an Astro-based build end to end; no `next`/`create-next-app`/
      `@clerk/nextjs` references remain (grep clean).
- [x] New intake/research step: keyword research → proposed page list + keyword targets → owner
      sign-off, before scaffolding.
- [x] Site spec includes: per-service SEO pages (800–1500 words), blog via content collections,
      `SEOHead` on every page, sitemap + robots.txt, internal linking rule.
- [x] CRM spec unchanged in features; specified as a Clerk-protected React island backed by the same
      `convex/leads.ts` API; Stripe checkout as an Astro API route with `prerender = false`.
- [x] Env-var table updated to `PUBLIC_*` prefixes; JWT-template curl, `convex dev --once`,
      `convex deploy`, and Vercel token flow preserved.
- [x] Astro v5 gotchas encoded: no `output: 'hybrid'`; `src/content.config.ts` (not
      `src/content/config.ts`); hydration directives on islands.
- [x] Verify checklist updated: build passes (`astro build`), test enquiry → appears live in
      `/dashboard`, test Stripe checkout, mobile ~390px, sitemap lists all pages.
- [x] `README.md` matches the new SKILL.md (stack, env vars, what-it-builds, commands block).
- [x] Templates updated: `site.config.ts` gains optional `seo` block; any new `templates/astro/`
      starters compile conceptually against current `@clerk/astro` / Convex APIs.

## Success Metrics

- A fresh run of the skill produces a deployable Astro site + working CRM with no interactive
  logins mid-build (same bar as today).
- Generated sites ship near-zero JS on marketing pages (only islands hydrate).
- The skill produces ≥6–10 indexed pages per business (vs. 3 today) with unique keyword-targeted
  metadata.

## Dependencies & Risks

- **`@clerk/astro` API drift** — middleware/hook names should be re-checked against docs at
  implementation time. Mitigation: SKILL.md already tells the agent to consult current docs.
- **Convex React hooks inside `client:only` island** — well-trodden but less documented than
  Next.js; if `ConvexProviderWithClerk` + `useAuth` from `@clerk/astro/react` misbehaves, fall back
  to Clerk's plain React provider inside the island.
- **Scope creep toward astro-builder** — risk of duplicating the whole taste/SEO reference corpus
  here. Mitigation: inline only a compact SEO checklist; link the sibling skill for the rest, or
  keep this skill self-contained with a one-page distilled version (preferred, since skills should
  be self-contained).
- **Vercel adapter needed** even for a mostly-static site (because of `/dashboard` + checkout
  route) — document explicitly so builds don't fail at deploy.

## References & Research

### Internal
- Current build workflow: `SKILL.md:70-166` (site-crm-builder)
- Files-to-create list to rewrite: `SKILL.md:168-191`
- SEO/research playbook to adopt: `../astro-builder-skill/skill/SKILL.md` (Phases 1, 3, 5; Astro v5
  notes at lines 304-312)
- Starter templates: `templates/config/site.config.ts`, `templates/convex/schema.ts`

### External
- Clerk Astro SDK (React islands, middleware): https://clerk.com/docs/reference/astro/react ·
  https://www.npmjs.com/package/@clerk/astro
- Convex + Clerk (works with any Clerk React SDK): https://docs.convex.dev/auth/clerk
- Clerk's own Astro patterns skill: https://github.com/clerk/skills/blob/main/skills/frameworks/clerk-astro-patterns/SKILL.md
