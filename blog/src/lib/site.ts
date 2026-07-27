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

/** `<title>` default and og:title for the site root. */
export const SITE_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const SITE_DESCRIPTION =
  "Live stream trading analysis and market insights from Trading With Sidhant Team";

/**
 * Absolute origin, no trailing slash. Env var wins so previews and staging can
 * override; the literal is the production default.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://blogs.tradingwithsidhant.com"
).replace(/\/+$/, "");

/** Bare hostname — for robots.txt `Host:` and IndexNow, which reject a scheme. */
export const SITE_HOST = new URL(SITE_URL).host;

/** Marketing site this blog belongs to. */
export const MAIN_SITE_URL = "https://tradingwithsidhant.com";

/** Paid programs / courses landing page. */
export const PROGRAMS_URL = "https://tradingwithsidhant.com/programs/";

/** Registered entity named in legal copy and JSON-LD. */
export const LEGAL_ENTITY = "Trading With Sidhant LLP";

/**
 * Google Tag Manager container. `GTM-P3PR2NBT` is the "tradingwithsidhant.com"
 * container in the TWS (2026) account — the blog moved here from the GurukulX
 * container `GTM-TMQ589CP` so blog and marketing site report into one property.
 */
export const GTM_ID = "GTM-P3PR2NBT";

/** Social profiles. Also emitted as JSON-LD `sameAs`. */
export const SOCIAL = {
  youtube: "https://youtube.com/@tradingwithsidhant",
  instagram: "https://instagram.com/tradingwithsidhant",
  x: "https://x.com/tradingwsidhant",
  telegram: "https://t.me/tradingwsidhant",
  whatsapp: "https://wa.me/918062963333",
} as const;

export const TWITTER_HANDLE = "@tradingwsidhant";
export const CONTACT_PHONE = "+91-8062963333";
