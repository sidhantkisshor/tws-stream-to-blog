"use client";

import { familyHref, familyStrip, trackFamilyLinkClick } from "@/lib/family";

// This blog is the "blog" entry in the family registry, so the strip leaves it out.
const GROUPS = familyStrip(["blog"]);

const SOURCE = "blog";
const PLACEMENT = "family_strip";

/**
 * The Trading With Sidhant family links, grouped as the registry defines them.
 * Same-tab links, each reported to the dataLayer as `family_link_click`. Lives
 * in its own client component because the click handler cannot run in the
 * server rendered Footer.
 */
export function FamilyStrip() {
  return (
    <nav
      aria-label="Trading With Sidhant family"
      className="mb-8 grid gap-6 sm:grid-cols-3"
    >
      {GROUPS.map((group) => (
        <div key={group.key}>
          <p className="mb-2 text-xs font-medium text-deep-slate/50">{group.label}</p>
          <ul className="flex flex-col gap-1.5">
            {group.items.map((item) => {
              const href = familyHref(item.url, SOURCE, PLACEMENT);
              return (
                <li key={item.key}>
                  <a
                    href={href}
                    onClick={() => trackFamilyLinkClick(href, PLACEMENT, SOURCE)}
                    className="text-xs text-deep-slate/30 no-underline transition-colors hover:text-deep-slate/60"
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
