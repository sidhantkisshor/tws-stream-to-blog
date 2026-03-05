# Plan 07: Homepage Search Bar

**Depends on:** Nothing
**Files to create:** `blog/src/components/SearchBar.tsx`
**Files to modify:** `blog/src/app/page.tsx`

## Steps

1. Create `blog/src/components/SearchBar.tsx` (client component)
   - "use client"
   - Props: `posts: { id, title, slug, hook, heroImage, tags, publishedAt: string }[]`
     - Note: dates must be serialized as strings since this is a client component
   - State: `query` string, debounced with 200ms delay (simple setTimeout approach)
   - Filter logic: lowercase query matched against title + hook + tags.join(' ')
   - Render:
     - Search input: rounded-lg border border-deep-slate/10, bg-white, px-4 py-2.5
     - Inline SVG search icon on the left (text-deep-slate/30)
     - Clear button (x icon) appears when query is non-empty
     - Placeholder: "Search posts..."
   - Below input, render filtered results:
     - If query is empty, render nothing (parent page shows default layout)
     - If query is non-empty, render matching posts in the same list style as the rest list
       - Each post: title, hook (line-clamp-1), tags, date, thumbnail on right (80x80)
       - Linked to /posts/[slug]
     - Empty state: "No posts match your search" in muted text

2. Modify `blog/src/app/page.tsx`
   - Serialize posts for client component (convert dates to ISO strings)
   - Pass all posts (not just rest) to SearchBar
   - SearchBar placed above "Recent Posts" heading
   - When SearchBar has an active query, hide the featured post + Recent Posts section
   - Implementation: SearchBar calls an `onSearchActive(isActive: boolean)` callback
     - Actually simpler: make the homepage a hybrid. Keep it as server component but wrap the post display area in a client component that handles search state
   - Alternative simpler approach:
     - Keep page.tsx as server component
     - Create a client wrapper component `PostsDisplay` that receives all posts
     - PostsDisplay contains SearchBar + featured post + rest list logic
     - When search is active, it shows search results; when inactive, shows featured + list

3. Create `blog/src/components/PostsDisplay.tsx` (client component)
   - "use client"
   - Props: serialized posts array
   - Contains SearchBar inline (or import SearchBar)
   - Manages search state
   - Renders either:
     - Default view: featured hero + accent line + Recent Posts list (same markup as current page.tsx)
     - Search view: filtered results in uniform list

## Acceptance Criteria
- Search input appears on homepage above post listings
- Typing filters posts in real-time (debounced 200ms)
- Featured hero collapses when searching
- Clear button resets to default view
- Empty state message when no matches
- No API calls — fully client-side filtering
