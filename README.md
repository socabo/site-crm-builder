# site-crm-builder

A Claude Code **skill** that generates a complete marketing website **+ a built-in CRM** for any
business — from a short brief or an existing site's URL. It scaffolds and deploys a fresh, universal
**Next.js + Convex + Clerk + Stripe** app: a real multi-page site with a lead-capture form, plus a
login-protected CRM (leads inbox, statuses, notes, lead value, dashboard stats, search, CSV export)
and Stripe payments.

Works for **any** business — plumber, dentist, coffee roaster, SaaS, consultant, gym. Everything
specific to the business lives in one config file; the pages are generated fresh.

> It is deliberately a single-business build. It does **not** clone an existing site 1:1, and it is
> not a multi-tenant / industry-specific engine. See "Scope" in [`SKILL.md`](SKILL.md).

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

### 2. Keys (copy these from each dashboard when asked)

- **Clerk** → *API keys*: Publishable key (`pk_…`) + Secret key (`sk_…`), and your **JWT issuer
  domain** (create a JWT template named exactly `convex`).
- **Stripe** → *Developers → API keys*: **test** Publishable (`pk_test_…`) + Secret (`sk_test_…`).
  *(Skip if the business doesn't take payments.)*
- **Convex** — no key to paste; `npx convex dev` logs you in via the browser and writes its own keys.

### 3. Your business details (the intake)

Have these ready — or point the skill at your existing website URL and it will prefill them:

- **Name**, a one-line **tagline**, and a 2–3 sentence **description** of what you do.
- **3–6 services / offerings** (a short title + one sentence each).
- **Contact**: email, phone, town/city (and full address if you want a map).
- **Brand**: a primary colour (or "pick something that fits") and a tone (friendly / premium / etc.).
- **Payments** (optional): anything you'd sell online + its price.
- **Admin email(s)**: who is allowed to log into the CRM.

Everything above goes into one file — [`templates/config/site.config.ts`](templates/config/site.config.ts).

---

## CLIs / terminal commands you'll run

You run these in a terminal (the skill walks you through them). In order:

```bash
# 1. Scaffold the app
npx create-next-app@latest my-business --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*"
cd my-business
npm install convex @clerk/nextjs stripe @stripe/stripe-js

# 2. Start the backend (logs you into Convex, creates the project, pushes the schema)
npx convex dev

# 3. Tell Convex who your login provider is (Clerk), for the CRM auth
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://YOUR-app.clerk.accounts.dev

# 4. Run the site locally while you build
npm run dev            # http://localhost:3000

# 5. Ship it
npx convex deploy      # backend first
npx vercel             # deploy the site (add your env vars in the Vercel project settings)
```

**CLIs used:** `node` / `npm` (JavaScript), `npx convex` (backend), `npx vercel` (deploy), `git` +
`gh` (GitHub). Clerk and Stripe are configured in their **web dashboards** — no CLI needed.

Test card for Stripe checkout: `4242 4242 4242 4242`, any future expiry, any CVC.

---

## What it builds

- **Marketing site** — Home, About/Services, Contact; responsive; real SEO metadata + `sitemap.xml`.
- **Lead capture** — an enquiry form that writes straight to your CRM.
- **CRM** at `/dashboard` (login-protected) — leads with status, notes, value, live stats, search,
  and CSV export. Reactive: a lead submitted on a phone appears on your laptop instantly.
- **Payments** — a Stripe checkout button + "send a payment link" from a lead.

See [`SKILL.md`](SKILL.md) for the full file list, the build steps, and the "extend it yourself" ladder.
