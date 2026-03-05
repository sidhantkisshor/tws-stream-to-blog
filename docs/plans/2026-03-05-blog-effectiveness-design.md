# Blog Effectiveness Overhaul — Design

**Date:** 2026-03-05
**Goal:** Improve engagement, traffic, reading experience, and conversion to twsgurukul.com programs.
**Approach:** Content-Led Growth Engine (Approach B) — incremental, independently shippable features.

## 1. Post Detail Page

### Reading Progress Bar
- 3px bar fixed at top of viewport, above nav
- Gradient: wealth-teal to burnt-amber (matches accent-line)
- Appears only on scroll, fades at top
- Component: `ReadingProgress` (client)

### Sticky Table of Contents
- Desktop (>=1024px): floating sidebar left of prose column, highlights current section via Intersection Observer
- Mobile: collapsible TOC below hero image
- Built from `post.sections[].heading`
- Component: `TableOfContents` (client)

### Key Takeaway Box
- Positioned after intro, before first section
- Subtle card: wealth-teal left border, light teal bg
- Content: post hook + section headings as bullet list
- Title in Instrument Serif: "Key Takeaways"
- Component: `KeyTakeaways` (server)

## 2. Homepage

### Enhanced Post List
- Featured hero post unchanged
- Remaining posts: add 80x80 thumbnail on right from heroImage
- Fallback: subtle gradient placeholder if no hero image

### Program Highlight Banner
- Position: below featured post, above "Recent Posts"
- Copy: "Level up your trading — Explore programs at TWSGurukulX"
- Styling: same language as TelegramCTA but brushed-gold accent
- Links to twsgurukul.com
- Warm recommendation feel, not pushy

### Client-Side Search
- Compact input with search icon at top of Recent Posts section
- Filters loaded 20 posts by title + hook + tags
- Debounced, filters as you type
- Featured hero collapses into regular list when searching
- Clear button + "No posts match your search" empty state
- Component: `SearchBar` (client)

## 3. Sharing

### Share Buttons
- Position: after article conclusion, before Telegram CTA
- Channels: X/Twitter, Telegram, WhatsApp, Copy Link
- Small icon-based buttons with labels, muted styling, darken on hover
- Copy Link shows brief "Copied!" tooltip
- Share text: post title + URL
- Component: `ShareButtons` (client)

## 4. Conversion CTAs

### Mid-Article Program CTA
- Inserted after ~50% of sections
- Single line: "Explore structured trading programs -> twsgurukul.com"
- Styled as subtle blockquote with brushed-gold left border
- Editorial feel, not promotional
- Component: `ProgramCTA` (server)

### Homepage Program Banner
- See section 2 above

## 5. Post Navigation

### Related Posts ("More on this topic")
- Tag-based: up to 3 posts sharing most tags, excluding current post
- Horizontal cards: thumbnail + title + date
- Component: `RelatedPosts` (server)
- Data: new `getRelatedPosts(postId, tags)` in lib/posts.ts

### Chronological Nav ("Previous / Next Session")
- Below related posts
- Two-column: left arrow Previous Session | Next Session right arrow
- Shows title + date
- Component: `SessionNav` (server)
- Data: new `getAdjacentPosts(publishedAt)` in lib/posts.ts

## Data Layer Changes

New functions in `src/lib/posts.ts`:
- `getRelatedPosts(excludeId: number, tags: string[], limit?: number)` — find posts with overlapping tags
- `getAdjacentPosts(publishedAt: Date)` — get previous and next post by date

No Prisma schema changes needed.

## New Components Summary

| Component | Type | Location |
|-----------|------|----------|
| ReadingProgress | client | src/components/ReadingProgress.tsx |
| TableOfContents | client | src/components/TableOfContents.tsx |
| KeyTakeaways | server | src/components/KeyTakeaways.tsx |
| ShareButtons | client | src/components/ShareButtons.tsx |
| ProgramCTA | server | src/components/ProgramCTA.tsx |
| RelatedPosts | server | src/components/RelatedPosts.tsx |
| SessionNav | server | src/components/SessionNav.tsx |
| SearchBar | client | src/components/SearchBar.tsx |
