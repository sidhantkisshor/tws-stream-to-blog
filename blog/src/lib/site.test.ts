import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as site from "./site";

/**
 * Drift guard over the brand constants, plus a banned character sweep over the
 * whole source tree. ESLint was this project's only automated check, which is
 * how an em dash reached every page title unnoticed, so the rules that copy and
 * links must obey are pinned here instead of living in a reviewer's head.
 *
 * The first half of this file walks the site module's exported values. That is
 * useful but narrow, and the narrowness was itself a bug: it reported green
 * while roughly 43 em dashes sat in shipped metadata objects and JSX, because
 * none of them are reachable from the site module's namespace. The source tree
 * sweep at the bottom is the check that actually backs the claim above.
 */

/**
 * The banned dash characters, written as escapes so this file never carries the
 * very character it exists to reject. A literal here would be found by any
 * repo-wide grep for the defect and read as a violation.
 */
const EM_DASH = "\u2014";
const EN_DASH = "\u2013";

/** One flattened string value plus the export path it came from, so a failure names the culprit. */
type StringEntry = { path: string; value: string };

/**
 * Walks the module namespace rather than listing constants by hand. A future
 * export is swept the moment it is added, which is the point: the guard must
 * not depend on someone remembering to extend it.
 */
function collectStrings(value: unknown, path: string, out: StringEntry[]): void {
  if (typeof value === "string") {
    out.push({ path, value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, `${path}[${index}]`, out));
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      collectStrings(child, `${path}.${key}`, out);
    }
  }
}

const ALL_STRINGS: StringEntry[] = [];
for (const [name, value] of Object.entries(site)) {
  collectStrings(value, name, ALL_STRINGS);
}

/** Paths of every entry whose value contains `needle`, formatted for the assertion message. */
function offenders(needle: string): string[] {
  return ALL_STRINGS.filter((entry) => entry.value.includes(needle)).map(
    (entry) => `${entry.path}: ${entry.value}`,
  );
}

/**
 * The parent brand's account slugs. A link repointed at a retired handle stops
 * matching all three, which is the failure this list exists to catch.
 */
const BRAND_SLUGS = ["tradingwithsidhant", "tradingwsidhant", "trading-with-sidhant"];

/** The contact route, deliberately excluded from `sameAs` and from the slug check below. */
const WHATSAPP_URL = "https://wa.me/918062963333";

/**
 * Pinned by exact string, because that is how a search engine reads sameAs. The
 * same five literals appear in twsgurukulx's src/constants.ts and index.html;
 * they must stay byte identical across all three, so treat a change here as a
 * change to be made in that repo in the same breath.
 */
const EXPECTED_SAME_AS = [
  "https://www.youtube.com/@tradingwithsidhant",
  "https://www.instagram.com/tradingwithsidhant",
  "https://x.com/tradingwsidhant",
  "https://t.me/tradingwsidhant",
  "https://www.linkedin.com/company/trading-with-sidhant",
];

describe("site constants: banned characters", () => {
  it("sweeps a non-empty set of exported strings", () => {
    // Guards the guard: an empty walk would let every check below pass vacuously.
    expect(ALL_STRINGS.length).toBeGreaterThan(10);
  });

  it("has no em dash in any exported string", () => {
    expect(offenders(EM_DASH)).toEqual([]);
  });

  it("has no en dash in any exported string", () => {
    expect(offenders(EN_DASH)).toEqual([]);
  });

  it("has no exclamation mark in any exported string", () => {
    expect(offenders("!")).toEqual([]);
  });

  it("would catch a violation nested inside an object or an array", () => {
    // A green sweep is only meaningful if the walker reaches every shape the
    // module exports. Plant one offender at each depth and confirm both surface.
    const planted: StringEntry[] = [];
    collectStrings(
      { nested: { title: `Trading${EM_DASH}Insights` }, list: [`Range${EN_DASH}bound`] },
      "PLANTED",
      planted,
    );

    expect(planted.map((entry) => entry.path)).toEqual([
      "PLANTED.nested.title",
      "PLANTED.list[0]",
    ]);
    expect(planted.filter((entry) => entry.value.includes(EM_DASH))).toHaveLength(1);
    expect(planted.filter((entry) => entry.value.includes(EN_DASH))).toHaveLength(1);
  });
});

describe("SAME_AS", () => {
  it("is exactly the five parent brand profiles", () => {
    expect([...site.SAME_AS]).toEqual(EXPECTED_SAME_AS);
  });

  it("excludes the wa.me contact URL", () => {
    // schema.org sameAs wants pages that identify the organisation. A click to
    // message us is not one, even though the footer still links it.
    expect([...site.SAME_AS]).not.toContain(WHATSAPP_URL);
    expect(site.SOCIAL.whatsapp).toBe(WHATSAPP_URL);
  });
});

describe("outbound links", () => {
  const socialEntries = Object.entries(site.SOCIAL);
  const sameAsEntries = site.SAME_AS.map(
    (url, index) => [`SAME_AS[${index}]`, url] as [string, string],
  );

  it.each([...socialEntries, ...sameAsEntries])("%s parses as an https URL", (_name, url) => {
    const parsed = new URL(url);
    expect(parsed.protocol).toBe("https:");
  });

  /**
   * Every profile link must point at a parent brand account. The wa.me entry is
   * exempt because its path is a phone number, not a handle; it is pinned by
   * exact value in the SAME_AS suite above instead.
   */
  const profileEntries = [...socialEntries, ...sameAsEntries].filter(
    ([, url]) => url !== WHATSAPP_URL,
  );

  it.each(profileEntries)("%s points at a parent brand account", (_name, url) => {
    const pathname = new URL(url).pathname.toLowerCase();
    expect(BRAND_SLUGS.some((slug) => pathname.includes(slug))).toBe(true);
  });
});

describe("identity", () => {
  it("names the registered entity exactly", () => {
    // Legal copy and JSON-LD both read this; a drifted spelling is a compliance bug.
    expect(site.LEGAL_ENTITY).toBe("Trading With Sidhant LLP");
  });

  it("keeps SITE_URL free of a trailing slash", () => {
    // Canonical and og:url concatenate paths onto this, so a trailing slash
    // would ship doubled separators sitewide.
    expect(site.SITE_URL.endsWith("/")).toBe(false);
    expect(site.SITE_URL).toMatch(/^https:\/\//);
  });

  it("derives SITE_HOST from SITE_URL", () => {
    expect(new URL(site.SITE_URL).host).toBe(site.SITE_HOST);
  });
});

/**
 * `src`, resolved from this file rather than from the working directory, so the
 * sweep scans the same tree no matter where vitest is invoked from.
 */
const SRC_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Only hand written source is swept; the tree also holds css, json and fonts. */
const SCANNED_EXTENSIONS = [".ts", ".tsx"];

/**
 * Directories skipped wholesale, as paths relative to `src`.
 *
 * `generated` is the Prisma client. We do not author it, `prisma generate`
 * rewrites it on every build, and it carries dashes in vendored doc comments
 * that no amount of editing here would keep out.
 */
const EXCLUDED_DIRS = ["generated"];

/**
 * The one line level escape hatch. A line carrying this marker is skipped, so a
 * future deliberate dash can be opted out where it lives, in one line, visibly,
 * instead of by widening an exclusion list in this file.
 */
const ALLOW_MARKER = "dash-guard-allow";

/**
 * The deliberate dash stripper, as it appears in source: optional whitespace,
 * an em dash, optional whitespace. It is the core of every `.replace(...)` that
 * strips em dashes out of LLM generated hooks and headings, and the dash inside
 * it is load bearing. Deleting it would silently disable the protection that
 * keeps generated copy clean, so the sweep must let it through.
 *
 * Two notes on why the exemption is written this way.
 *
 * First, it exempts a token, not a file and not a line number. The brief named
 * one stripper in `app/posts/[slug]/page.tsx`, but there are eight across six
 * files (ArchiveList, KeyTakeaways twice, PostsDisplay twice, RelatedPosts,
 * MarkdownBody's link aware variant, and that page). Every one of them contains
 * this exact token, including the link aware variant, so keying off the token
 * covers all eight and keeps covering them if they are later consolidated into
 * a shared helper. Excluding whole files would have blinded the guard to the
 * rest of six real files.
 *
 * Second, it is narrow in the way that matters: the exemption is subtracted
 * from the line before the line is tested, so a line that carries the stripper
 * AND a prose dash still fails on the prose dash.
 *
 * A marker comment would be cleaner still. None of those eight lines carries
 * one today, and they belong to other files, so the token match stands in until
 * they do; ALLOW_MARKER above is the mechanism they should adopt.
 */
const DELIBERATE_STRIPPER = `\\s*${EM_DASH}\\s*`;

/** Every `.ts` / `.tsx` file under `src`, minus the excluded directories. */
function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const relative = path.relative(SRC_ROOT, full).split(path.sep).join("/");
      if (EXCLUDED_DIRS.includes(relative)) continue;
      sourceFiles(full, out);
      continue;
    }
    if (SCANNED_EXTENSIONS.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

/**
 * Whether a single line carries a banned dash once its sanctioned uses are
 * removed. Pulled out as a pure function so the exemption logic can be tested
 * directly, rather than only implicitly through whatever the tree happens to
 * contain today.
 */
function lineHasBannedDash(line: string): boolean {
  if (line.includes(ALLOW_MARKER)) return false;
  const remainder = line.split(DELIBERATE_STRIPPER).join("");
  return remainder.includes(EM_DASH) || remainder.includes(EN_DASH);
}

/** `path:line` plus the offending text, so a failure is actionable without a grep. */
function scanSourceTree(): string[] {
  const found: string[] = [];
  for (const file of sourceFiles(SRC_ROOT)) {
    const relative = path.relative(SRC_ROOT, file).split(path.sep).join("/");
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .forEach((line, index) => {
        if (lineHasBannedDash(line)) {
          found.push(`src/${relative}:${index + 1}: ${line.trim()}`);
        }
      });
  }
  return found;
}

describe("source tree: banned characters", () => {
  it("scans a plausible number of source files", () => {
    // Guards the guard. A walk that resolved to the wrong directory, or that
    // silently returned nothing, would make the sweep below pass vacuously.
    expect(sourceFiles(SRC_ROOT).length).toBeGreaterThan(15);
  });

  it("excludes the generated Prisma client from the walk", () => {
    const swept = sourceFiles(SRC_ROOT).map((file) =>
      path.relative(SRC_ROOT, file).split(path.sep).join("/"),
    );
    expect(swept.some((file) => file.startsWith("generated/"))).toBe(false);
    // ...but the exclusion must be surgical, not a wildcard that ate lib/ too.
    expect(swept).toContain("lib/site.ts");
  });

  it("exempts the deliberate dash stripper and nothing more", () => {
    // The stripper, verbatim, as six files spell it.
    expect(lineHasBannedDash(`{post.hook.replace(/${DELIBERATE_STRIPPER}/g, ", ")}`)).toBe(false);
    // MarkdownBody's link aware variant wraps the same token in lookaround.
    expect(
      lineHasBannedDash(`.replace(/(?<!\\[[^\\]]*)${DELIBERATE_STRIPPER}(?![^\\[]*\\])/g, ", ")`),
    ).toBe(false);
    // A dash in prose is caught.
    expect(lineHasBannedDash(`title: "Trading${EM_DASH}Insights"`)).toBe(true);
    // An en dash in prose is caught.
    expect(lineHasBannedDash(`range: "9${EN_DASH}5"`)).toBe(true);
    // A line holding both the stripper and a prose dash still fails: the
    // exemption is subtracted, it does not bless the rest of the line.
    expect(
      lineHasBannedDash(`.replace(/${DELIBERATE_STRIPPER}/g, ", ") // and${EM_DASH}then`),
    ).toBe(true);
    // The marker opts a line out explicitly.
    expect(lineHasBannedDash(`const arrow = "${EM_DASH}"; // ${ALLOW_MARKER}`)).toBe(false);
  });

  it("has no em dash or en dash in any source file", () => {
    expect(scanSourceTree()).toEqual([]);
  });
});

/**
 * `public`, sibling of `src`, resolved from this file the same way as
 * SRC_ROOT so the walk is stable no matter where vitest is invoked from.
 *
 * This sweep exists because the source tree sweep above, thorough as it is,
 * only ever walked `.ts` / `.tsx` files under `src`. `orderflow.html` is a
 * standalone static page under `public/demos`, embedded as an iframe in blog
 * posts and fully user visible, and it carried 22 em dashes that the source
 * sweep could never have caught: it is neither `.ts` nor `.tsx`, and it does
 * not live under `src` at all. Widening the exclusion list or extension list
 * on `sourceFiles` would not have covered it either, since it sits outside
 * `SRC_ROOT` entirely, which is why this is a second, independent walk over
 * `public` rather than a tweak to the one above.
 */
const PUBLIC_ROOT = path.resolve(SRC_ROOT, "..", "public");

/** Hand written static pages live here as `.html`; images and manifests do not need sweeping. */
const SCANNED_PUBLIC_EXTENSIONS = [".html"];

/** Every file under `public` whose extension matches, found recursively. */
function publicFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      publicFiles(full, out);
      continue;
    }
    if (SCANNED_PUBLIC_EXTENSIONS.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

/**
 * `path:line` plus the offending text for every banned dash under `public`.
 * Reuses `lineHasBannedDash`, so the same ALLOW_MARKER escape hatch and
 * deliberate-stripper exemption apply here too, unchanged.
 */
function scanPublicTree(): string[] {
  const found: string[] = [];
  for (const file of publicFiles(PUBLIC_ROOT)) {
    const relative = path.relative(PUBLIC_ROOT, file).split(path.sep).join("/");
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .forEach((line, index) => {
        if (lineHasBannedDash(line)) {
          found.push(`public/${relative}:${index + 1}: ${line.trim()}`);
        }
      });
  }
  return found;
}

describe("public tree: banned characters", () => {
  it("scans a plausible number of public HTML files", () => {
    // Guards the guard, same pattern as the source tree sweep above. This is
    // exactly the check that would have caught orderflow.html's em dashes
    // before they shipped, so an empty or misrouted walk must not pass
    // silently: a vacuous pass here is precisely the failure mode that let
    // 22 em dashes sit in a user visible page unnoticed.
    expect(publicFiles(PUBLIC_ROOT).length).toBeGreaterThan(0);
  });

  it("has no em dash or en dash in any public HTML file", () => {
    expect(scanPublicTree()).toEqual([]);
  });
});
