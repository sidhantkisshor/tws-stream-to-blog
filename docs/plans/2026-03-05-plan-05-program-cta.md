# Plan 05: Program CTA (Mid-Article + Homepage)

**Depends on:** Nothing
**Files to create:** `blog/src/components/ProgramCTA.tsx`
**Files to modify:** `blog/src/app/posts/[slug]/page.tsx`, `blog/src/app/page.tsx`

## Steps

1. Create `blog/src/components/ProgramCTA.tsx` (server component)
   - Two variants via prop `variant: 'inline' | 'banner'`
   - **inline** (mid-article):
     - Styled as a blockquote: left border 2px brushed-gold, pl-4, py-2
     - Text: "Explore structured trading programs at" + link to twsgurukul.com
     - Link styled in brushed-gold, font-medium
     - Subtle, editorial feel — blends with article content
   - **banner** (homepage):
     - Card similar to TelegramCTA: rounded-xl, border, white bg, shadow
     - Decorative circles in brushed-gold/3 instead of wealth-teal/3
     - Heading: "Level up your trading"
     - Subtext: "Explore structured programs at TWSGurukulX"
     - CTA button: brushed-gold bg, white text, links to twsgurukul.com
     - Secondary link: "Learn more" text link

2. Add inline variant to `blog/src/app/posts/[slug]/page.tsx`
   - Insert after Math.floor(sections.length / 2) sections in the map
   - Only show if sections.length >= 3 (don't show on very short posts)

3. Add banner variant to `blog/src/app/page.tsx`
   - Place after the featured post, before the accent-line divider
   - Only show if there are posts (inside the featured block)

## Acceptance Criteria
- Mid-article CTA feels like an editorial aside, not an ad
- Homepage banner matches TelegramCTA styling but with gold accent
- Both link to twsgurukul.com with target="_blank"
- Neither feels pushy
