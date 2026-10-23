/**
 * Canonical site identity. Single source of truth for the blog's URL and brand.
 *
 * Before this module the base-URL expression
 * `process.env.NEXT_PUBLIC_SITE_URL || "https://<host>"` was duplicated in 13
 * files, so a domain move meant 13 edits and any miss shipped a wrong canonical
 * URL. Import from here instead of re-deriving.
 *
 * The legal entity, the GTM container, the profile URLs and the X handle are
 * read from the family module (src/lib/family.ts, generated from the tws-family
 * registry), so the whole family shares one copy of each.
 */
import { TWS_ORGANIZATION, TWS_SOCIALS, TWS_TRACKING, TWS_TWITTER_SITE } from "./family";

/** Public brand name, as readers see it. */
export const SITE_NAME = "Trading With Sidhant";

/** Short wordmark for tight slots (OG images, badges). */
export const SITE_WORDMARK = "TRADING WITH SIDHANT";

export const SITE_TAGLINE = "Trading Insights";

/**
 * `<title>` default and og:title for the site root. The pipe matches the
 * `%s | ${SITE_NAME}` template in layout.tsx, so the root title and every
 * child page title read as one system.
 */
export const SITE_TITLE = `${SITE_NAME} | ${SITE_TAGLINE}`;

export const SITE_DESCRIPTION =
  "Live stream trading analysis and market insights from Trading With Sidhant Team";

/**
 * Absolute origin, no trailing slash. Env var wins so previews and staging can
 * override; the literal is the production default.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://blogs.tradingwithsidhant.com"
).replace(/\/+$/, "");

/** Bare hostname, for robots.txt `Host:` and IndexNow, which reject a scheme. */
export const SITE_HOST = new URL(SITE_URL).host;

/** Marketing site this blog belongs to. */
export const MAIN_SITE_URL = "https://tradingwithsidhant.com";

/** Paid programs / courses landing page. */
export const PROGRAMS_URL = "https://tradingwithsidhant.com/programs";

/** Registered entity named in legal copy and JSON-LD. */
export const LEGAL_ENTITY: string = TWS_ORGANIZATION.legalName;

/**
 * Google Tag Manager container, read from the family registry. It is the one
 * web container every family site loads (the "tradingwithsidhant.com" container
 * in the TWS (2026) account), so blog and marketing site report into one
 * property. The consent loader in public/scripts/tws-consent.js loads it for
 * scripts; this constant only feeds the `<noscript>` fallback in layout.tsx.
 */
export const GTM_ID: string = TWS_TRACKING.gtmWeb;

/** One registry profile URL by key. Throws at import time if the key is ever removed. */
function socialUrl(key: (typeof TWS_SOCIALS)[number]["key"]): string {
  const found = TWS_SOCIALS.find((social) => social.key === key);
  if (!found) throw new Error(`Unknown social profile: ${key}`);
  return found.url;
}

/**
 * Every outbound channel the brand owns, profiles and contact alike. The five
 * profiles mirror the set twsgurukulx.com declares, so a search engine that
 * crawls both properties resolves them to the same organisation.
 *
 * "Mirror" means byte identical, not merely equivalent: sameAs is matched by
 * exact string, so a bare host or a country subdomain that only 301s to the
 * canonical one reads as a different URL and the two properties stop resolving
 * to one entity. Every profile here is the redirect target, never the redirect.
 */
export const SOCIAL = {
  youtube: socialUrl("youtube"),
  instagram: socialUrl("instagram"),
  x: socialUrl("x"),
  telegram: socialUrl("telegram"),
  linkedin: socialUrl("linkedin"),
  whatsapp: "https://wa.me/918062963333",
} as const;

/**
 * The subset of SOCIAL that belongs in schema.org `sameAs`, which wants URLs
 * that identify the organisation. A wa.me link is a way to message us, not a
 * profile page, so it is excluded here while staying in the footer where
 * readers expect a contact route. It is the registry list itself, in registry
 * order, so it cannot drift from the parent Organization node.
 */
export const SAME_AS: readonly string[] = TWS_SOCIALS.map((social) => social.url);

/**
 * The brand mark, everywhere it is shown to a reader: the circular photo the
 * marketing site uses as its own logo. It is the only mark this blog displays.
 * The former blog icon was retired artwork reading "TWS GurukulX", so pairing
 * the two only showed the dead brand more prominently.
 */
export const BRAND_AVATAR = "/parent-avatar.png";

/**
 * The mark for schema.org `logo`, which is a separate constant from
 * BRAND_AVATAR because it answers to a size rule rather than to layout: Google
 * rejects an Organization logo under 112x112, which the old 64x64 display mark
 * failed. This is the same avatar rendered square at 512, so the two never
 * disagree about what the brand looks like.
 */
export const SCHEMA_LOGO = "/brand-icon-512.png";

/**
 * The route that renders the generic share card, from src/app/opengraph-image.tsx.
 *
 * Routes have to name this explicitly. The App Router does not inherit a parent
 * segment's opengraph-image into child segments, so a page that sets `openGraph`
 * without `images` ships no share card at all. That is not theoretical: /about,
 * /posts, /privacy, /terms and /tags built with no og:image once the retired
 * banner was removed from them.
 */
export const OG_IMAGE = "/opengraph-image";

export const TWITTER_HANDLE: string = TWS_TWITTER_SITE;

/**
 * Brand field a page must restate when it sets its own `openGraph` object. Next
 * replaces that object wholesale rather than merging it with the root layout's,
 * so a page that omits this drops og:site_name. Spread it into each page-level
 * `openGraph`. Pages that set no `twitter` object inherit twitter:site from the
 * root layout, so they need nothing.
 */
export const SITE_OPEN_GRAPH = { siteName: SITE_NAME } as const;
