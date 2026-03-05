# Plan 08: Post List Thumbnails

**Depends on:** Plan 07 (SearchBar/PostsDisplay) since homepage post rendering moves to PostsDisplay
**Files to modify:** `blog/src/app/page.tsx` (or `PostsDisplay.tsx` if Plan 07 is done first), `blog/src/app/tags/[tag]/page.tsx`

## Notes on Ordering
- If Plan 07 (Search) is done first, thumbnails go into `PostsDisplay.tsx`
- If this plan is done first, add thumbnails to `page.tsx` directly; Plan 07 will move the markup later
- Either order works — the thumbnail markup is the same

## Steps

1. Add thumbnails to post list items
   - In the post row layout (the `flex items-start justify-between` div):
     - Add a thumbnail on the right side, after the date
     - Use Next.js `Image` component: 80x80px, rounded-lg, object-cover
     - Source: `post.heroImage`
     - Fallback if no heroImage: a small div with `bg-gradient-to-br from-deep-slate/5 to-burnt-amber/5`
     - On mobile (<640px): thumbnail is 60x60px
   - Adjust the existing layout:
     - The text content div gets `flex-1`
     - Date stays where it is (or moves below title on mobile)
     - Thumbnail is the rightmost element, shrink-0

2. Apply same thumbnail treatment to `blog/src/app/tags/[tag]/page.tsx`
   - Same markup pattern as homepage list items

## Acceptance Criteria
- Each post in the list shows a small thumbnail from heroImage
- Graceful fallback gradient when no image exists
- Responsive: slightly smaller on mobile
- Applied to both homepage list and tag page list
