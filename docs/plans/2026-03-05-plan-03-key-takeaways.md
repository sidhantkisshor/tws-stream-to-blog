# Plan 03: Key Takeaways Box

**Depends on:** Nothing
**Files to create:** `blog/src/components/KeyTakeaways.tsx`
**Files to modify:** `blog/src/app/posts/[slug]/page.tsx`

## Steps

1. Create `blog/src/components/KeyTakeaways.tsx` (server component)
   - Props: `hook: string`, `sections: { heading: string }[]`
   - Render a card:
     - Left border: 3px wealth-teal
     - Background: wealth-teal/5
     - Rounded corners (rounded-lg)
     - Padding: px-5 py-4
   - Title: "Key Takeaways" in font-instrument, text-lg, text-deep-slate
   - Body: hook text as a paragraph, then section headings as a bulleted list
   - Bullets: small wealth-teal dots (same style as about page list items)

2. Add to `blog/src/app/posts/[slug]/page.tsx`
   - Place after the intro `<MarkdownBody>` div, before the sections loop
   - Pass `hook={post.hook}` and `sections={sections}`

## Acceptance Criteria
- Displays after intro, before first section
- Shows hook + section headings as bullets
- Subtle teal-accented card, not loud
- Works with any number of sections (including 0 — hide if no sections)
