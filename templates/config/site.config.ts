/**
 * site.config.ts — the ONE file that makes this app "your business".
 *
 * Everything universal lives here: name, copy, services, brand colour, what you
 * sell, and who can log into the CRM. Change these values and the whole site
 * re-skins. The marketing pages, the enquiry form, Stripe, and the CRM admin
 * gate all read from this object.
 */

export type ServiceItem = {
  title: string;
  blurb: string;
  /** URL slug for this service's SEO landing page, e.g. "boiler-repair" */
  slug?: string;
  /** primary keyword this service page targets, from the research step */
  keyword?: string;
};

export type SeoConfig = {
  /** primary keyword for the home page, e.g. "emergency plumber dublin" */
  primaryKeyword: string;
  /** supporting long-tail phrases discovered in the research step */
  longTails: string[];
  /** towns/areas for local-SEO copy; empty for non-local businesses */
  serviceAreas: string[];
};

export type PaymentItem = {
  /** stable id used by the Buy button + /api/checkout */
  id: string;
  name: string;
  description?: string;
  /** price in the smallest currency unit — e.g. 5000 = $50.00 */
  amount: number;
  /** ISO currency, e.g. "usd", "eur", "gbp" */
  currency: string;
};

export const site = {
  name: "Your Business",
  tagline: "A one-line promise of what you do",
  description:
    "Two or three sentences describing the business — what you offer and who it's for. Used in the hero and as the default SEO description.",

  url: "https://your-business.example",
  email: "hello@your-business.example",
  phone: "+1 555 010 0000",
  location: "Your Town",
  /** Full address for a map embed. Leave "" to hide the map. */
  address: "",

  brand: {
    primary: "#2563eb", // main brand colour (buttons, links, accents)
    accent: "#f59e0b",
  },

  services: [
    { title: "Service one", blurb: "One sentence on what it is and why it helps." },
    { title: "Service two", blurb: "One sentence on what it is and why it helps." },
    { title: "Service three", blurb: "One sentence on what it is and why it helps." },
  ] as ServiceItem[],

  /**
   * Anything you sell online (Stripe). Leave the array empty if you don't take
   * payments yet — the Buy button hides itself and the CRM payment-link action
   * simply doesn't appear.
   */
  payments: [
    // { id: "deposit", name: "Booking deposit", description: "Secures your slot", amount: 5000, currency: "usd" },
  ] as PaymentItem[],

  /**
   * Filled in from the keyword-research step (SKILL.md step 2). Drives page
   * titles, descriptions, and which long-tails the blog posts target.
   */
  seo: {
    primaryKeyword: "your service your town",
    longTails: [],
    serviceAreas: [],
  } as SeoConfig,

  /** Emails allowed into the /dashboard CRM (compared lower-case). */
  adminEmails: ["hello@your-business.example"],
};

export type SiteConfig = typeof site;
export default site;
