---
name: site-crm-builder
description: Use when someone wants to generate a complete SEO-optimized marketing website + built-in CRM for ANY business, from a short brief or an existing site's URL. Builds a fresh, universal static-first Astro + Convex + Clerk + Stripe app — a real multi-page site (per-service SEO pages, blog, sitemap) with a lead-capture form, plus a login-protected CRM (leads inbox, statuses, notes, lead value, dashboard stats, search, CSV export) and Stripe payments. Triggers — "build me a site and CRM", "make a website with a CRM for my business", "generate a site + lead tracker", "I need a site that captures leads", "CRM website builder".
---

# Site + CRM Builder (Astro)

## Overview

This skill builds one business a **complete, self-contained web app**: a genuinely good,
**SEO-engineered** marketing website with a lead-capture form, backed by a real CRM the owner logs
into to work their leads, plus Stripe payments. It works for **any** business — a plumber, a dentist,
a coffee roaster, a SaaS, a consultant, a gym — because everything specific to the business comes
from one config file and the pages are generated fresh from the brief.

Stack (all have free tiers): **Astro (static-first site, zero JS by default) · React islands (the
dynamic bits) · Tailwind CSS · Convex (database + reactive backend) · Clerk (auth, via
`@clerk/astro`) · Stripe (payments) · Vercel (hosting)**. It is deliberately a **single-business**
app that you scaffold directly — not a multi-tenant framework — so a beginner can follow the whole
thing end to end and actually ship it.

The architecture in one sentence: **every marketing page is static Astro** (fast, near-zero JS,
great Core Web Vitals → ranks better), and **only three things hydrate or run on the server** — the
enquiry form island, the Stripe checkout API route, and the `/dashboard` CRM island.

You can build it two ways:
1. **From a brief** — ask the owner a few questions (below) and generate everything from the answers.
2. **From a URL** — read their existing site to *prefill* the brief (name, what they do, services,
   contact, brand feel), then generate a **fresh** site. You are pulling facts to save typing — you
   are **not** cloning their existing site page-for-page. Generate original pages from the facts.

### What this builds (all real, not stubs)
- **SEO marketing site** — Home, About, **one page per service** (keyword-targeted landing pages,
  800–1500 words each), a **blog via Astro content collections**, Contact (add areas-served /
  testimonials pages when the business warrants them). Every page: `SEOHead` component (unique
  title, ≤160-char description, canonical, Open Graph, JSON-LD), proper heading hierarchy, internal
  links, `sitemap-index.xml` via `@astrojs/sitemap`, dynamic `robots.txt`, favicon.
- **Keyword research first** — before scaffolding, research what ranks in the niche, find keyword
  gaps and long-tail targets, and propose the page list + keyword map for owner sign-off.
- **Lead capture** — an enquiry form (React island) that writes to Convex.
- **CRM dashboard** (`/dashboard`, Clerk-protected, one React island) — a leads inbox with:
  per-lead **status** (new / contacted / quoted / won / lost), a **notes/activity trail**, an
  optional **lead value**, **summary stats** (counts by status, total pipeline value), **search +
  status filter**, and **CSV export**. Reactive — new leads appear live.
- **Payments** — a Stripe **Checkout** button on the site (sell a product/service/deposit), and a
  "**send payment link**" action from a lead in the CRM, with the lead marked paid on success.

### Scope — what this intentionally is (and isn't)
This is a **fresh, universal** build. It is not, and should not become:
- a **1:1 copy** of an existing website (URL input prefills facts; you still generate original pages);
- a **multi-client / re-skinnable engine** (it's one business's app, built directly);
- an **industry-specific machine** (no booking configurators, calendar/OTA sync, deposit-milestone
  quoting, or vertical-specific workflows) — keep it general so it fits every business.

The SEO phase adds **research and pages**, not vertical features. Keep it capable and clean. If a
business needs a vertical-specific feature, note it as a next step — don't bend this universal
builder into a niche system.

## Division of labour (important)

**The person does two things, in a browser:** creates a **Convex** project and a **Clerk** app (plus
**Stripe**/**Vercel** if they want payments/hosting), and pastes you the env variables below. **You do
everything else** — research, scaffold, install, write files, create the Clerk JWT template via API,
push the schema, wire, build, deploy. Because they hand you a Convex **deploy key** (and optional
Vercel token), nothing needs an interactive browser login mid-build. Don't tell them to run the CLI
commands — you run them. (Keyword research needs only web search — no extra credentials.)

Collect these up front (they get them from each dashboard):
- **Convex** → create a project → Project Settings → **Deploy Keys** → Generate. Get:
  `CONVEX_DEPLOY_KEY` and `PUBLIC_CONVEX_URL` (the deployment URL).
- **Clerk** → create an application → API keys. Get: `PUBLIC_CLERK_PUBLISHABLE_KEY`,
  `CLERK_SECRET_KEY`, and `CLERK_JWT_ISSUER_DOMAIN` (the Frontend API / JWT issuer URL). You create
  the `convex` JWT template yourself via the Clerk API (step 5) — they don't.
- **Stripe** *(optional)* → Developers → API keys → **test** keys: `STRIPE_SECRET_KEY`,
  `PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- **Vercel** *(optional, to deploy for them)* → Account Settings → Tokens → `VERCEL_TOKEN`.
- **Node 18+** must be available in the environment you're running commands in.

Write everything into `.env` from `.env.example`. (Astro exposes client-side vars with the
`PUBLIC_` prefix — not `NEXT_PUBLIC_`.)

## Build workflow

### 1. Intake the business
Gather (ask, or prefill from a URL then confirm):
- **Name**, one-line **tagline**, a 2–3 sentence **description** of what they do.
- **3–6 services / offerings**, each a short title + one sentence.
- **Contact**: email, phone, town/city (and address if they want a map).
- **Brand**: a primary colour (hex or "pick something that fits"), and a tone (e.g. friendly,
  premium, no-nonsense).
- **Payments** (optional): anything they'd sell online — a product, a service, a deposit — with a
  price. Skip if they don't take payments yet.
- **Admin email(s)**: who logs into the CRM.

Everything above lands in `config/site.config.ts` (template provided) — the single source of truth.

### 2. Keyword research → proposed page list (get sign-off)
Before writing any code, use web search to research the niche:
- **What's ranking** for the obvious head terms (top 5–10 results) and what those pages cover.
- **Content gaps** — questions competitors answer badly or not at all.
- **Long-tail keywords** — specific phrases with less competition (per service, per problem).
- **Local SEO signals** if it's a local business — "<service> <town>" variants, areas served.

Then propose a concrete site structure and get the owner's sign-off. Example shape:

```
Proposed pages:
1. Home — "<Primary keyword> | <Business>"            (500–1000 words)
2. About — trust signals, story, qualifications
3. /services/<service-slug> — one page PER service    (800–1500 words each, one keyword cluster each)
4. /blog + /blog/<slug> — 2–3 launch posts targeting long-tail questions (1500–3000 words)
5. /areas or /testimonials — if warranted
6. Contact — form + details (+ map if address given)

Keyword map: page → primary keyword → supporting long-tails
```

Record the keyword targets in `site.config.ts` (`seo` block) so page generation reads them.

### 3. Scaffold the app
```bash
npm create astro@latest <business-slug> -- --template minimal --install --no-git
cd <business-slug>
npx astro add react tailwind sitemap vercel --yes
npm install convex @clerk/astro stripe @stripe/stripe-js
```
Notes that keep Astro v5 happy:
- Default output is **`static`** — do **not** set `output: 'hybrid'` (removed in v5). The two
  server routes opt out individually with `export const prerender = false;`.
- The `@astrojs/vercel` adapter is required even though the site is mostly static, because
  `/dashboard` and `/api/checkout` are server-rendered.
- Set `site: "https://<their-domain>"` in `astro.config.mjs` (placeholder if no domain yet) — the
  sitemap and canonicals need it.
- Content-collection schemas live in **`src/content.config.ts`** (not `src/content/config.ts` —
  the old path throws `LegacyContentConfigError` in v5), and every collection needs a `loader`
  (use `glob()` from `astro/loaders`).

### 4. Wire the backend (Convex) — non-interactive
- Copy the template files into place: `config/site.config.ts`, `convex/schema.ts`, `convex/leads.ts`,
  `convex/auth.config.ts`.
- Push the schema with the deploy key (no login prompt):
  ```bash
  CONVEX_DEPLOY_KEY=<their key> npx convex dev --once
  ```
- The `leads` table + functions come up immediately; no data modelling needed.

### 5. Wire auth (Clerk via `@clerk/astro`) — you create the JWT template via API
- Put the Clerk keys in `.env` (`PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
- Add the integration in `astro.config.mjs`: `import clerk from "@clerk/astro"` → `clerk()` in
  `integrations`.
- Create the `convex` JWT template with the Clerk Backend API (idempotent — check first):
  ```bash
  curl -s https://api.clerk.com/v1/jwt_templates -H "Authorization: Bearer $CLERK_SECRET_KEY" | grep -q '"name":"convex"' \
    || curl -s -X POST https://api.clerk.com/v1/jwt_templates \
         -H "Authorization: Bearer $CLERK_SECRET_KEY" -H "Content-Type: application/json" \
         -d '{"name":"convex","claims":{"aud":"convex"}}'
  ```
- Tell Convex the issuer domain: `CONVEX_DEPLOY_KEY=<key> npx convex env set CLERK_JWT_ISSUER_DOMAIN <their domain>`.
- `src/middleware.ts` — `clerkMiddleware()` from `@clerk/astro/server`, redirecting unauthenticated
  requests to `/dashboard(.*)` to sign-in (use `createRouteMatcher`). Middleware only runs on
  server-rendered routes — fine, `/dashboard` is one; static pages never need auth.
- **Island rule:** inside React islands import ONLY from `@clerk/astro/react` (e.g. `useAuth`).
  Never import `@clerk/astro/server` into an island — it breaks the build or leaks server code.
- The owner signs in with an email listed in `config/site.config.ts` `adminEmails` to reach the CRM.

### 6. Generate the marketing site (static Astro, fresh per business)
Build the pages from the intake + keyword map — original copy, not scraped text. Use the business's
real services, tone, and brand colour (drive Tailwind from `site.config.ts`). All of these are plain
`.astro` files — **no client JS** except the islands noted.
- **Home** — hero (tagline + primary CTA to Contact / Buy), a services grid linking to each service
  page, a short "why us", a social-proof/testimonial slot (clean placeholder if none yet), closing CTA.
- **About** — the fuller story + trust signals.
- **One page per service** at `/services/<slug>` — 800–1500 words targeting that service's keyword
  cluster: what it is, who it's for, process, FAQ (with FAQPage JSON-LD), CTA to Contact.
- **Blog** — content collection (`src/content/blog/*.md`, schema in `src/content.config.ts`:
  title, description, pubDate, tags, draft). Write 2–3 real launch posts from the long-tail list.
  `/blog/index.astro` + `/blog/[...slug].astro` via `getCollection()`.
- **Contact** — the `<EnquiryForm client:load />` island + contact details (map embed if address).

SEO rules for every page:
- `<SEOHead>` (template provided) in the head: unique keyword-first title (<60 chars), unique
  ≤160-char description, canonical from `site.url`, OG + Twitter tags, JSON-LD (`LocalBusiness` on
  Home if local, `Service` on service pages, `BlogPosting` on posts, `FAQPage` where there's a FAQ).
- One `<h1>` per page with the primary keyword; H2/H3 hierarchy, never skip levels.
- Every page internally links to 2–3+ other pages with descriptive anchor text.
- Every image gets descriptive alt text. Add `app` favicon + `src/pages/robots.txt.ts` (dynamic,
  `Disallow: /dashboard`, points at `sitemap-index.xml`).
Keep it responsive and check it at ~390px.

### 7. Wire lead capture
`src/components/EnquiryForm.tsx` (React island, `client:load`) on the Contact page (and optionally
Home). It creates a plain `ConvexReactClient` (no auth needed for visitors) and calls the public
`api.leads.submitLead` mutation, then shows a thank-you state.

### 8. Wire payments (Stripe) — if the business sells anything
- Keys in `.env`.
- `src/pages/api/checkout.ts` — an Astro API route with `export const prerender = false;`. POST
  creates a Checkout Session from an item in `site.config.ts.payments` (or an ad-hoc
  `{name, amount, currency}` for a CRM payment link) and returns the URL; success/cancel return to
  the site.
- Add a "Buy / Book / Pay deposit" button that POSTs to it.
- In the CRM, the **send payment link** action on a lead creates a Checkout link you can copy to the
  customer; mark the lead paid in the CRM when it clears (auto-marking via a Stripe webhook is an
  optional extension, below).
- Skip this whole step cleanly if the business doesn't take payments — the site + CRM work without it.

### 9. Build the CRM dashboard (one React island)
- `src/pages/dashboard.astro` — `export const prerender = false;` (so Clerk middleware protects it),
  renders a minimal static shell + `<DashboardApp client:only="react" />`.
- `src/components/DashboardApp.tsx` — the island root: wraps the CRM in Clerk's React provider +
  `ConvexProviderWithClerk` from `convex/react-clerk`, passing `useAuth` from `@clerk/astro/react`
  (template wrapper provided). `client:only="react"` avoids server-rendering Convex hooks.
- The CRM UI inside it renders:
  - a **stats strip** (leads by status, total pipeline value),
  - a **search box + status filter**,
  - the **leads table** — click a lead to open detail (contact info, editable status dropdown, lead
    value, notes/activity trail with add-note), and a **payment link** button if Stripe is configured,
  - an **Export CSV** button.
All reads/writes go through `convex/leads.ts` (auth-gated queries/mutations). It's reactive, so a
lead submitted on the public site appears in the dashboard live.

### 10. Deploy (you do it)
```bash
CONVEX_DEPLOY_KEY=<key> npx convex deploy               # ship the backend first
vercel deploy --prod --token $VERCEL_TOKEN --yes        # ship the site (if they gave a token)
```
Set the same env vars on the Vercel project (`vercel env add … --token …`), using **production**
Convex/Clerk/Stripe values when going live. If they didn't give a Vercel token, hand them the one
manual step: import the GitHub repo at vercel.com and paste the env vars. Keep Stripe in test mode
until they're ready.

### 11. Verify (don't claim done without this)
- `npx astro build` passes (with the Vercel adapter; only `/dashboard` + `/api/checkout` are
  server routes — everything else prerenders).
- Load the site, submit a **test enquiry** → confirm it appears in `/dashboard` live.
- Sign in as an admin email → confirm the dashboard loads and the lead is editable (status + note).
- If payments: run one **test Checkout** (Stripe test card `4242 4242 4242 4242`) → confirm success.
- SEO spot-check: every page has a unique title + description; `sitemap-index.xml` lists all pages;
  `robots.txt` disallows `/dashboard`; JSON-LD parses; marketing pages ship no unexpected JS.
- Check the site at mobile width (~390px) — no horizontal scroll, tappable controls.

## Files to create (the whole app)
Generate these in the new app — they follow directly from the steps above. Reference starters are in
`templates/` (`config/site.config.ts`, `convex/schema.ts`, `astro/SEOHead.astro`,
`astro/DashboardApp.tsx`); write the rest to match.
- `config/site.config.ts` — business identity, services, brand, payments, admin emails, and the
  `seo` block (keyword targets per page). *(starter provided)*
- `convex/schema.ts` — the `leads` table. *(starter provided)*
- `convex/leads.ts` — `submitLead` (public mutation) + admin-auth-gated `list`, `get`, `stats`,
  `updateStatus`, `updateValue`, `addNote`, `markPaid`, `remove`. Auth check: `ctx.auth.getUserIdentity()`
  and the email is in `site.adminEmails`.
- `convex/auth.config.ts` — `{ providers: [{ domain: process.env.CLERK_JWT_ISSUER_DOMAIN, applicationID: "convex" }] }`.
- `astro.config.mjs` — react + tailwind + sitemap + clerk integrations, vercel adapter, `site` URL.
- `src/middleware.ts` — `clerkMiddleware` from `@clerk/astro/server` protecting `/dashboard(.*)`.
- `src/components/SEOHead.astro` — title/description/canonical/OG/JSON-LD head partial. *(starter provided)*
- `src/layouts/BaseLayout.astro` — html shell, `<SEOHead>`, header/nav, footer.
- `src/components/EnquiryForm.tsx` — island: plain `ConvexReactClient` →
  `api.leads.submitLead` → thank-you state.
- `src/pages/` — `index.astro`, `about.astro`, `services/<slug>.astro` (one per service),
  `blog/index.astro`, `blog/[...slug].astro`, `contact.astro`, `robots.txt.ts`.
- `src/content.config.ts` + `src/content/blog/*.md` — blog collection schema + launch posts.
- `src/pages/dashboard.astro` — `prerender = false`, renders `<DashboardApp client:only="react" />`.
- `src/components/DashboardApp.tsx` — Clerk React provider + `ConvexProviderWithClerk`
  (`useAuth` from `@clerk/astro/react`) around the CRM UI (stats strip, search + status filter,
  leads table + detail with status/value/notes, CSV export, payment-link button if
  `site.payments` is non-empty). *(provider-wrapper starter provided)*
- `src/pages/api/checkout.ts` — `prerender = false`; creates a Stripe Checkout Session and returns
  the URL.
- `.env.example` — `PUBLIC_CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `PUBLIC_CLERK_PUBLISHABLE_KEY`,
  `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, `STRIPE_SECRET_KEY`, `PUBLIC_STRIPE_PUBLISHABLE_KEY`,
  `PUBLIC_SITE_URL`, `VERCEL_TOKEN`. (`CLERK_JWT_ISSUER_DOMAIN` also gets set on the Convex
  deployment via `npx convex env set`.)

Marking a lead paid is a manual toggle in the CRM; auto-marking via a Stripe webhook is a listed
extension below, not part of the core build.

`@clerk/astro` and Convex APIs move — if an import or middleware helper doesn't match these notes,
check the current Clerk Astro docs (clerk.com/docs/reference/astro) and Convex+Clerk docs
(docs.convex.dev/auth/clerk) rather than forcing it.

## Teaching notes (for the video / the learner)
- The whole thing is ~a dozen files plus content. The "CRM" is genuinely just: one Convex table +
  a handful of functions + one dashboard island. That's the lesson — a useful CRM is small.
- Astro's deal is the other lesson: the marketing site ships almost no JavaScript. View source on a
  service page — it's just HTML. Only the form and the dashboard hydrate.
- Convex being reactive is the wow moment: submit a lead on the phone, watch it pop into the
  dashboard on the laptop with no refresh. Demo that.
- Everything universal lives in `site.config.ts`. Change it, the whole site re-skins. Show that.
- The keyword research step is why the pages exist: each service page maps to a keyword cluster you
  found, not to a template.

## Extend it yourself (the ladder — where a real build goes next)
Mention these as "next steps you could build," so learners see the path without you having to hand
them a finished system:
- Email notifications on new leads (Resend) and auto-replies.
- A booking/calendar step, quotes with line items, or recurring billing.
- More blog posts on a schedule, areas-served pages per town, structured-data breadcrumbs.
- Turning it into a re-skinnable template to run several businesses from one codebase.

Those are deliberately **out of scope** here — this skill gets anyone a real, shippable site + CRM
for their own business, and stops there.
