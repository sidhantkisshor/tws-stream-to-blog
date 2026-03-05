# Plan 04: Share Buttons

**Depends on:** Nothing
**Files to create:** `blog/src/components/ShareButtons.tsx`
**Files to modify:** `blog/src/app/posts/[slug]/page.tsx`

## Steps

1. Create `blog/src/components/ShareButtons.tsx` (client component)
   - "use client"
   - Props: `title: string`, `slug: string`
   - Construct share URL from `window.location.origin + '/posts/' + slug`
   - Buttons (inline SVG icons, no external icon library):
     - **X/Twitter:** opens `https://twitter.com/intent/tweet?text={title}&url={url}` in new window
     - **Telegram:** opens `https://t.me/share/url?url={url}&text={title}` in new window
     - **WhatsApp:** opens `https://wa.me/?text={title} {url}` in new window
     - **Copy Link:** copies URL to clipboard, shows "Copied!" text for 2 seconds via useState
   - Styling: horizontal flex row, gap-3
   - Each button: rounded-lg, bg-deep-slate/5, px-3 py-2, text-sm, text-deep-slate/50
   - Hover: bg-deep-slate/10, text-deep-slate/70
   - Label text next to each icon

2. Add to `blog/src/app/posts/[slug]/page.tsx`
   - Place after the conclusion section, before the TelegramCTA
   - Add a small heading: "Share this post" in text-sm text-deep-slate/40

## Acceptance Criteria
- Four share buttons render in a row
- X, Telegram, WhatsApp open correct share URLs in new windows
- Copy Link copies to clipboard and shows "Copied!" feedback
- Muted styling that doesn't overpower the content
