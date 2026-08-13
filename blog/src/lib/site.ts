/**
 * Canonical site identity. Single source of truth for the blog's URL and brand.
 *
 * Before this module the base-URL expression
 * `process.env.NEXT_PUBLIC_SITE_URL || "https://<host>"` was duplicated in 13
 * files, so a domain move meant 13 edits and any miss shipped a wrong canonical
 * URL. Import from here instead of re-deriving.
 */

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
export const PROGRAMS_URL = "https://tradingwithsidhant.com/programs/";

/** Registered entity named in legal copy and JSON-LD. */
export const LEGAL_ENTITY = "Trading With Sidhant LLP";

/**
 * Google Tag Manager container. `GTM-P3PR2NBT` is the "tradingwithsidhant.com"
 * container in the TWS (2026) account. The blog moved here from the GurukulX
 * container `GTM-TMQ589CP` so blog and marketing site report into one property.
 */
export const GTM_ID = "GTM-P3PR2NBT";

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
  youtube: "https://www.youtube.com/@tradingwithsidhant",
  instagram: "https://www.instagram.com/tradingwithsidhant",
  x: "https://x.com/tradingwsidhant",
  telegram: "https://t.me/tradingwsidhant",
  linkedin: "https://www.linkedin.com/company/trading-with-sidhant",
  whatsapp: "https://wa.me/918062963333",
} as const;

/**
 * The subset of SOCIAL that belongs in schema.org `sameAs`, which wants URLs
 * that identify the organisation. A wa.me link is a way to message us, not a
 * profile page, so it is excluded here while staying in the footer where
 * readers expect a contact route.
 */
export const SAME_AS = [SOCIAL.youtube, SOCIAL.instagram, SOCIAL.x, SOCIAL.telegram, SOCIAL.linkedin] as const;

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

export const TWITTER_HANDLE = "@tradingwsidhant";
export const CONTACT_PHONE = "+91-8062963333";
