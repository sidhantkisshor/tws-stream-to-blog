/**
 * Display-only text helpers. Metadata and JSON-LD keep the stored strings, so
 * SEO output does not change.
 */

/*
 * The two character classes below are intentional and load bearing: they strip
 * em and en dashes out of generated copy at render time. They are written as
 * unicode escapes so a dash sweep has nothing to remove.
 */
const DASH_RANGE = /(\d(?:\s?[AaPp][Mm])?)\s*[\u2013\u2014]\s*(\d)/g;
const DASH = /\s*[\u2013\u2014]\s*/g;

export function plainDashes(text: string): string {
  return text.replace(DASH_RANGE, "$1 to $2").replace(DASH, ", ");
}

/** "risk-management" becomes "Risk management". */
export function tagLabel(tag: string): string {
  const words = tag.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
