# Plan 01: Reading Progress Bar

**Depends on:** Nothing
**Files to create:** `blog/src/components/ReadingProgress.tsx`
**Files to modify:** `blog/src/app/posts/[slug]/page.tsx`

## Steps

1. Create `blog/src/components/ReadingProgress.tsx` (client component)
   - "use client"
   - Track scroll position with `useEffect` + scroll listener (passive)
   - Calculate progress: `scrollY / (documentHeight - windowHeight)`
   - Render a fixed 3px bar at `top: 0`, `z-index: 60` (above nav which is z-50)
   - Background: `linear-gradient` from wealth-teal to burnt-amber, width = progress%
   - Only visible when progress > 0 (opacity transition)
   - Clean up scroll listener on unmount

2. Add `<ReadingProgress />` to `blog/src/app/posts/[slug]/page.tsx`
   - Place it as the first element inside the fragment, before the JSON-LD script
   - Import at top of file

## Acceptance Criteria
- Bar appears at very top of page on post detail pages only
- Smoothly fills left-to-right as you scroll
- Uses wealth-teal to burnt-amber gradient
- Not visible at scroll position 0
- Does not interfere with sticky nav
