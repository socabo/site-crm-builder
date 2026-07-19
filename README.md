# site-crm-builder

A Claude Code **skill** that generates a complete SEO-optimized marketing website **+ a built-in
CRM** for any business — from a short brief or an existing site's URL. It scaffolds and deploys a
fresh, universal **Astro + Convex + Clerk + Stripe** app: a static-first, multi-page site (a
keyword-targeted page per service, a blog, sitemap, structured data) with a lead-capture form, plus
a login-protected CRM (leads inbox, statuses, notes, lead value, dashboard stats, search, CSV
export) and Stripe payments.

Works for **any** business — plumber, dentist, coffee roaster, SaaS, consultant, gym. Everything
specific to the business lives in one config file; the pages are generated fresh — after a real
keyword-research pass on the niche.

> It is deliberately a single-business build. It does **not** clone an existing site 1:1, and it is
> not a multi-tenant / industry-specific engine. See "Scope" in [`SKILL.md`](SKILL.md).

---

## Want it done for you?

- **[Get one built for you →](https://stewardengine.com)** — we'll design, build, and ship your whole
  site + CRM for you.
- **[Try our AI SEO content generator →](https://harborseo.ai)** — fill your new site with
  AI-written SEO content that ranks.

---

## Install the skill

Drop the folder into your Claude Code skills directory:

```bash
git clone https://github.com/IncomeStreamSurfer/site-crm-builder.git
mkdir -p ~/.claude/skills
cp -R site-crm-builder ~/.claude/skills/site-crm-builder
```

Then in Claude Code, invoke it with `/site-crm-builder`, or just ask:
*"build me a site and CRM for my business."*

The full playbook it follows is in [`SKILL.md`](SKILL.md); starter code is in [`templates/`](templates).

---

## What YOU need to provide

### 1. Accounts (all have a free tier)

| Service | What it's for | Sign up |
|---|---|---|
| **Node.js 18+** | Run everything locally | https://nodejs.org |
| **Convex** | Database + backend (the CRM) | https://convex.dev |
| **Clerk** | Login for the CRM dashboard | https://clerk.com |
| **Stripe** | Payments (optional) | https://stripe.com |
| **Vercel** | Hosting the live site | https://vercel.com |
| **GitHub** | Store your code | https://github.com |

### 2. Env variables to hand the skill

Create the projects above, then paste these to the skill — **it does everything else with them.** You
don't run any of the commands yourself. (Astro uses the `PUBLIC_` prefix for browser-visible vars.)

| Variable | Where to get it |
|---|---|
| `PUBLIC_CONVEX_URL` | Convex → your project → the deployment URL |
| `CONVEX_DEPLOY_KEY` | Convex → Project Settings → **Deploy Keys** → Generate (lets the skill push without a browser login) |
| `PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API keys (`pk_…`) |
| `CLERK_SECRET_KEY` | Clerk → API keys (`sk_…`) |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk → API keys → your Frontend API / JWT issuer URL |
| `STRIPE_SECRET_KEY` *(optional)* | Stripe → Developers → API keys (`sk_test_…`) |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` *(optional)* | Stripe → Developers → API keys (`pk_test_…`) |
| `VERCEL_TOKEN` *(optional)* | Vercel → Account Settings → Tokens (lets the skill deploy for you) |

You do **not** need to create the Clerk `convex` JWT template yourself — the skill creates it for you
via the Clerk API using your secret key.

### 3. Your business details (the intake)

Have these ready — or point the skill at your existing website URL and it will prefill them:

- **Name**, a one-line **tagline**, and a 2–3 sentence **description** of what you do.
- **3–6 services / offerings** (a short title + one sentence each).
- **Contact**: email, phone, town/city (and full address if you want a map).
- **Brand**: a primary colour (or "pick something that fits") and a tone (friendly / premium / etc.).
- **Payments** (optional): anything you'd sell online + its price.
- **Admin email(s)**: who is allowed to log into the CRM.

Everything above goes into one file — [`templates/config/site.config.ts`](templates/config/site.config.ts).
Before building, the skill also researches your niche (what ranks, keyword gaps, long-tail phrases)
and proposes the page list + keyword targets for your sign-off.

---

## Who does what

**Your part (a few minutes, in a browser):** create a **Convex** project and a **Clerk** app (plus
**Stripe**/**Vercel** if you want payments/hosting), then paste the skill the env variables above.
That's the whole job — you don't type any commands.

**The skill's part (automatic):** it researches your niche, writes all the code, and runs every
command for you — scaffolds the Astro app, installs packages, creates the Clerk `convex` JWT template
via the Clerk API, pushes your Convex schema with your deploy key, wires the site + CRM + Stripe,
builds, and deploys. Because you provide a Convex deploy key (and optional Vercel token), none of it
needs a browser login mid-build.

<details><summary>The commands it runs under the hood (for the curious — you don't run these)</summary>

```bash
npm create astro@latest my-business -- --template minimal --install --no-git
npx astro add react tailwind sitemap vercel --yes
npm install convex @clerk/astro stripe @stripe/stripe-js
CONVEX_DEPLOY_KEY=<yours> npx convex dev --once        # push the schema, no login prompt
CONVEX_DEPLOY_KEY=<yours> npx convex env set CLERK_JWT_ISSUER_DOMAIN https://YOUR-app.clerk.accounts.dev
# create the Clerk "convex" JWT template via the Clerk API (uses CLERK_SECRET_KEY)
npx astro build
CONVEX_DEPLOY_KEY=<yours> npx convex deploy            # ship the backend
vercel deploy --prod --token <yours>                   # ship the site
```
</details>

Test card for Stripe checkout: `4242 4242 4242 4242`, any future expiry, any CVC.

---

## What it builds

- **SEO marketing site** — static-first Astro (near-zero JavaScript on marketing pages): Home,
  About, a keyword-targeted page **per service** (800–1500 words), a blog via content collections,
  Contact; responsive; unique metadata + Open Graph + JSON-LD per page, `sitemap-index.xml`,
  `robots.txt`.
- **Keyword research** — the page list comes from real niche research (what ranks, gaps, long-tails),
  not a template.
- **Lead capture** — an enquiry form (React island) that writes straight to your CRM.
- **CRM** at `/dashboard` (login-protected React island) — leads with status, notes, value, live
  stats, search, and CSV export. Reactive: a lead submitted on a phone appears on your laptop
  instantly.
- **Payments** — a Stripe checkout button + "send a payment link" from a lead.

See [`SKILL.md`](SKILL.md) for the full file list, the build steps, and the "extend it yourself" ladder.
