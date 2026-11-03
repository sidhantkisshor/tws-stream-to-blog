/**
 * Tag URLs are lowercase-hyphen slugs. Stored tags are free text from the
 * publishing pipeline ("Bitcoin", "bitcoin", "Order Flow"), so every URL, link
 * and lookup goes through tagSlug and the variants collapse to one page.
 */
export function tagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Unique, sorted canonical slugs for a list of raw tags. */
export function uniqueTagSlugs(tags: string[]): string[] {
  return [...new Set(tags.map(tagSlug).filter(Boolean))].sort();
}
