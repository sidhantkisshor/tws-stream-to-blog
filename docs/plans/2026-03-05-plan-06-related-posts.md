# Plan 06: Related Posts + Session Nav

**Depends on:** Nothing
**Files to create:** `blog/src/components/RelatedPosts.tsx`, `blog/src/components/SessionNav.tsx`
**Files to modify:** `blog/src/lib/posts.ts`, `blog/src/app/posts/[slug]/page.tsx`

## Steps

1. Add data functions to `blog/src/lib/posts.ts`

   **getRelatedPosts(excludeId: number, tags: string[], limit = 3)**
   - Query posts that have any overlapping tags, exclude current post by id
   - Order by publishedAt desc, take limit
   - Select: id, title, slug, heroImage, tags, publishedAt
   - Use Prisma `where: { id: { not: excludeId }, tags: { hasSome: tags } }`

   **getAdjacentPosts(publishedAt: Date)**
   - Two queries:
     - Previous: `where: { publishedAt: { lt: publishedAt } }, orderBy: { publishedAt: 'desc' }, take: 1`
     - Next: `where: { publishedAt: { gt: publishedAt } }, orderBy: { publishedAt: 'asc' }, take: 1`
   - Select: title, slug, publishedAt
   - Return `{ previous: Post | null, next: Post | null }`

2. Create `blog/src/components/RelatedPosts.tsx` (server component)
   - Props: `posts: { title, slug, heroImage, publishedAt }[]`
   - Render "More on this topic" heading (font-instrument, text-burnt-amber/70)
   - Horizontal flex/grid of up to 3 cards:
     - Each card: rounded-lg, overflow-hidden
     - Thumbnail (aspect-video, 200px wide) or gradient placeholder
     - Title (text-sm font-bold), date below
     - Entire card is a Link
   - Don't render if posts array is empty

3. Create `blog/src/components/SessionNav.tsx` (server component)
   - Props: `previous: { title, slug, publishedAt } | null`, `next: { ... } | null`
   - Two-column grid (grid-cols-2)
   - Left: "← Previous Session" with title + date, linked
   - Right: "Next Session →" with title + date, linked, text-right
   - Muted styling: text-sm, text-deep-slate/50, title in text-deep-slate on hover
   - Don't render if both are null

4. Add to `blog/src/app/posts/[slug]/page.tsx`
   - Fetch related posts and adjacent posts in the page component
   - Place RelatedPosts after ShareButtons
   - Place SessionNav after RelatedPosts, before TelegramCTA

## Acceptance Criteria
- Related posts show up to 3 tag-matched posts with thumbnails
- Previous/Next shows chronological neighbors
- Both gracefully handle empty states (no posts = no section rendered)
- Data queries are efficient (use select to limit fields)
