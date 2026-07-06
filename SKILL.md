---
name: site-crm-builder
description: Use when someone wants to generate a complete marketing website + built-in CRM for ANY business, from a short brief or an existing site's URL. Builds a fresh, universal Next.js + Convex + Clerk + Stripe app — a real multi-page site with a lead-capture form, plus a login-protected CRM (leads inbox, statuses, notes, lead value, dashboard stats, search, CSV export) and Stripe payments. Triggers — "build me a site and CRM", "make a website with a CRM for my business", "generate a site + lead tracker", "I need a site that captures leads", "CRM website builder".
---

# Site + CRM Builder

## Overview

This skill builds one business a **complete, self-contained web app**: a genuinely good marketing
website with a lead-capture form, backed by a real CRM the owner logs into to work their leads, plus
Stripe payments. It works for **any** business — a plumber, a dentist, a coffee roaster, a SaaS, a
consultant, a gym — because everything specific to the business comes from one config file and the
pages are generated fresh from the brief.

Stack (all have free tiers): **Next.js (App Router) · Convex (database + reactive backend) · Clerk
(auth) · Stripe (payments) · Vercel (hosting)**. It is deliberately a **single-business** app that you
scaffold directly — not a multi-tenant framework — so a beginner can follow the whole thing end to end
and actually ship it.

You can build it two ways:
1. **From a brief** — ask the owner a few questions (below) and generate everything from the answers.
2. **From a URL** — read their existing site to *prefill* the brief (name, what they do, services,
   contact, brand feel), then generate a **fresh** site. You are pulling facts to save typing — you are
   **not** cloning their existing site page-for-page. Generate original pages from the facts.

### What this builds (all real, not stubs)
- **Marketing site** — Home, About/Services, Contact (add more pages when the business needs them),
  responsive, with proper per-page SEO metadata, Open Graph tags, a `sitemap.xml`, and a favicon.
- **Lead capture** — an enquiry form on the site that writes to Convex.
- **CRM dashboard** (`/dashboard`, Clerk-protected) — a leads inbox with: per-lead **status**
  (new / contacted / quoted / won / lost), a **notes/activity trail**, an optional **lead value**,
  **summary stats** (counts by status, total pipeline value), **search + status filter**, and **CSV
  export**. Reactive — new leads appear live.
- **Payments** — a Stripe **Checkout** button on the site (sell a product/service/deposit), and a
  "**send payment link**" action from a lead in the CRM, with the lead marked paid on success.

### Scope — what this intentionally is (and isn't)
This is a **fresh, universal** build. It is not, and should not become:
- a **1:1 copy** of an existing website (URL input prefills facts; you still generate original pages);
- a **multi-client / re-skinnable engine** (it's one business's app, built directly);
- an **industry-specific machine** (no booking configurators, calendar/OTA sync, deposit-milestone
  quoting, or vertical-specific workflows) — keep it general so it fits every business.

Keep it capable and clean. If a business needs a vertical-specific feature, note it as a next step —
don't bend this universal builder into a niche system.

## Division of labour (important)

**The person does two things, in a browser:** creates a **Convex** project and a **Clerk** app (plus
**Stripe**/**Vercel** if they want payments/hosting), and pastes you the env variables below. **You do
everything else** — scaffold, install, write files, create the Clerk JWT template via API, push the
schema, wire, build, deploy. Because they hand you a Convex **deploy key** (and optional Vercel token),
nothing needs an interactive browser login mid-build. Don't tell them to run the CLI commands — you run
them.

Collect these up front (they get them from each dashboard):
- **Convex** → create a project → Project Settings → **Deploy Keys** → Generate. Get:
  `CONVEX_DEPLOY_KEY` and `NEXT_PUBLIC_CONVEX_URL` (the deployment URL).
- **Clerk** → create an application → API keys. Get: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
  `CLERK_SECRET_KEY`, and `CLERK_JWT_ISSUER_DOMAIN` (the Frontend API / JWT issuer URL). You create the
  `convex` JWT template yourself via the Clerk API (step 4) — they don't.
- **Stripe** *(optional)* → Developers → API keys → **test** keys: `STRIPE_SECRET_KEY`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- **Vercel** *(optional, to deploy for them)* → Account Settings → Tokens → `VERCEL_TOKEN`.
- **Node 18+** must be available in the environment you're running commands in.

Write everything into `.env.local` from `.env.example`.

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

### 2. Scaffold the app
```bash
npx create-next-app@latest <business-slug> --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*"
cd <business-slug>
npm install convex @clerk/nextjs stripe @stripe/stripe-js
```

### 3. Wire the backend (Convex) — non-interactive
- Copy the template files into place: `config/site.config.ts`, `convex/schema.ts`, `convex/leads.ts`,
  `convex/auth.config.ts`.
- Push the schema with the deploy key (no login prompt):
  ```bash
  CONVEX_DEPLOY_KEY=<their key> npx convex dev --once
  ```
- The `leads` table + functions come up immediately; no data modelling needed.

### 4. Wire auth (Clerk) — you create the JWT template via API
- Put the Clerk keys in `.env.local`.
- Create the `convex` JWT template with the Clerk Backend API (idempotent — check first):
  ```bash
  curl -s https://api.clerk.com/v1/jwt_templates -H "Authorization: Bearer $CLERK_SECRET_KEY" | grep -q '"name":"convex"' \
    || curl -s -X POST https://api.clerk.com/v1/jwt_templates \
         -H "Authorization: Bearer $CLERK_SECRET_KEY" -H "Content-Type: application/json" \
         -d '{"name":"convex","claims":{"aud":"convex"}}'
  ```
- Tell Convex the issuer domain: `CONVEX_DEPLOY_KEY=<key> npx convex env set CLERK_JWT_ISSUER_DOMAIN <their domain>`.
- Add `middleware.ts` (protects `/dashboard`) and wrap `app/layout.tsx` in `<ClerkProvider>` +
  `<ConvexProviderWithClerk useAuth={useAuth}>` (a small client component — see the Files list below).
- The owner signs in with an email listed in `config/site.config.ts` `adminEmails` to reach the CRM.

### 5. Generate the marketing site (fresh, per business)
Build the pages from the intake — original copy, not scraped text. Use the business's real services,
tone, and brand colour (drive Tailwind from `site.config.ts`). A good default set:
- **Home** — hero (tagline + primary CTA to Contact / Buy), a services grid, a short "why us", a
  social-proof or testimonial slot (leave a clean placeholder if none yet), and a closing CTA.
- **About / Services** — the fuller story + each service expanded.
- **Contact** — the `<EnquiryForm />` + the business's contact details (and a map embed if there's an
  address).
Give every page real metadata (`export const metadata`) with a keyword-first title, a ≤160-char
description, and Open Graph tags from `site.config.ts`. Add `app/sitemap.ts` and a favicon. Keep it
responsive and check it at ~390px.

### 6. Wire lead capture
Drop `<EnquiryForm />` (template) on the Contact page (and optionally the home page). It calls the
public `api.leads.submitLead` mutation — no auth needed for the visitor — and shows a thank-you state.

### 7. Wire payments (Stripe) — if the business sells anything
- Keys in `.env.local`.
- `app/api/checkout/route.ts` (template) creates a Checkout Session from an item in
  `site.config.ts.payments` and redirects to Stripe; success/cancel return to the site.
- Add a "Buy / Book / Pay deposit" button that POSTs to it.
- In the CRM, the **send payment link** action on a lead creates a Checkout link you can copy to the
  customer; mark the lead paid in the CRM when it clears (auto-marking via a Stripe webhook is an
  optional extension, below).
- Skip this whole step cleanly if the business doesn't take payments — the site + CRM work without it.

### 8. Build the CRM dashboard
Copy `app/dashboard/page.tsx` (template). It renders:
- a **stats strip** (leads by status, total pipeline value),
- a **search box + status filter**,
- the **leads table** — click a lead to open detail (contact info, editable status dropdown, lead
  value, notes/activity trail with add-note), and a **payment link** button if Stripe is configured,
- an **Export CSV** button.
All reads/writes go through `convex/leads.ts` (auth-gated queries/mutations). It's reactive, so a lead
submitted on the public site appears in the dashboard live.

### 9. Deploy (you do it)
```bash
CONVEX_DEPLOY_KEY=<key> npx convex deploy               # ship the backend first
vercel deploy --prod --token $VERCEL_TOKEN --yes        # ship the site (if they gave a token)
```
Set the same env vars on the Vercel project (`vercel env add … --token …`), using **production**
Convex/Clerk/Stripe values when going live. If they didn't give a Vercel token, hand them the one
manual step: import the GitHub repo at vercel.com and paste the env vars. Keep Stripe in test mode
until they're ready.

### 10. Verify (don't claim done without this)
- `npx next build` passes.
- Load the site, submit a **test enquiry** → confirm it appears in `/dashboard`.
- Sign in as an admin email → confirm the dashboard loads and the lead is editable (status + note).
- If payments: run one **test Checkout** (Stripe test card `4242 4242 4242 4242`) → confirm success.
- Check the site at mobile width (~390px) — no horizontal scroll, tappable controls.

## Files to create (the whole app)
Generate these in the new app — they're small and follow directly from the steps above. Two reference
starters are in `templates/` (`config/site.config.ts`, `convex/schema.ts`); write the rest to match.
- `config/site.config.ts` — business identity, services, brand, payments, admin emails (the one file
  that makes it "their business"). *(starter provided)*
- `convex/schema.ts` — the `leads` table. *(starter provided)*
- `convex/leads.ts` — `submitLead` (public mutation) + admin-auth-gated `list`, `get`, `stats`,
  `updateStatus`, `updateValue`, `addNote`, `markPaid`, `remove`. Auth check: `ctx.auth.getUserIdentity()`
  and the email is in `site.adminEmails`.
- `convex/auth.config.ts` — `{ providers: [{ domain: process.env.CLERK_JWT_ISSUER_DOMAIN, applicationID: "convex" }] }`.
- `app/layout.tsx` wrapped in `<ClerkProvider>` + `<ConvexProviderWithClerk useAuth={useAuth}>`.
- `middleware.ts` — `clerkMiddleware` protecting `/dashboard(.*)`.
- `components/EnquiryForm.tsx` — client form → `useMutation(api.leads.submitLead)` → thank-you state.
- `app/dashboard/page.tsx` — the CRM (stats strip, search + status filter, leads table + detail with
  status/value/notes, CSV export, and the Stripe payment-link button if `site.payments` is non-empty).
- `app/api/checkout/route.ts` — creates a Stripe Checkout Session (from a `site.payments` item, or an
  ad-hoc `{name, amount, currency}` for a CRM payment link) and returns the URL.
- `.env.example` — `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOY_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`,
  `CLERK_SECRET_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
  `NEXT_PUBLIC_SITE_URL`, `VERCEL_TOKEN`. (`CLERK_JWT_ISSUER_DOMAIN` also gets set on the Convex
  deployment via `npx convex env set`.)

Marking a lead paid is a manual toggle in the CRM; auto-marking via a Stripe webhook is a listed
extension below, not part of the core build.

## Teaching notes (for the video / the learner)
- The whole thing is ~a dozen files. The "CRM" is genuinely just: one Convex table + a handful of
  functions + one dashboard page. That's the lesson — a useful CRM is small.
- Convex being reactive is the wow moment: submit a lead on the phone, watch it pop into the dashboard
  on the laptop with no refresh. Demo that.
- Everything universal lives in `site.config.ts`. Change it, the whole site re-skins. Show that.

## Extend it yourself (the ladder — where a real build goes next)
Mention these as "next steps you could build," so learners see the path without you having to hand them
a finished system:
- Email notifications on new leads (Resend) and auto-replies.
- A booking/calendar step, quotes with line items, or recurring billing.
- Multiple pages per service for SEO, structured data, a blog.
- Turning it into a re-skinnable template to run several businesses from one codebase.

Those are deliberately **out of scope** here — this skill gets anyone a real, shippable site + CRM for
their own business, and stops there.
