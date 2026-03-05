# Plan 02: Sticky Table of Contents

**Depends on:** Nothing
**Files to create:** `blog/src/components/TableOfContents.tsx`
**Files to modify:** `blog/src/app/posts/[slug]/page.tsx`, possibly `blog/src/app/globals.css`

## Steps

1. Create `blog/src/components/TableOfContents.tsx` (client component)
   - "use client"
   - Props: `sections: { heading: string }[]`
   - Generate IDs from headings: slugify each heading (lowercase, replace spaces with hyphens)
   - Render a nav with anchor links to each section
   - Use Intersection Observer to track which section is in view, highlight its link
   - Desktop (>=1024px): render as a sticky sidebar
     - Position: `sticky top-24` in a left column
     - Small text (text-sm), muted colors, active item gets wealth-teal color + left border
   - Mobile (<1024px): render as a collapsible disclosure
     - Button: "Table of Contents" with chevron
     - useState for open/closed, closes when a link is clicked
   - Smooth scroll on click via `scrollIntoView({ behavior: 'smooth' })`

2. Modify `blog/src/app/posts/[slug]/page.tsx`
   - Add `id` attributes to each section `<h2>` (slugified heading)
   - Wrap the article in a flex layout for desktop sidebar:
     - Outer div: `flex gap-8 max-w-5xl mx-auto` (wider than current max-w-prose)
     - Left column: `<TableOfContents />` — hidden on mobile via the component's internal logic
     - Right column: existing `<article>` with max-w-prose
   - On mobile, render `<TableOfContents />` inside the article, below the hero image

## Acceptance Criteria
- Desktop: TOC floats on the left, highlights current section
- Mobile: collapsible TOC below hero
- Clicking a TOC item smooth-scrolls to that section
- Does not break existing article styling
