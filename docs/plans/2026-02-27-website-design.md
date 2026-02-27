# TWSGurukulX Blog — Website Design

## Brand

- **Name:** TWSGurukulX
- **Company:** Trading With Sidhant LLP
- **WhatsApp:** +918062963333 (wa.me/918062963333)
- **Contact phone:** +91-8062963333
- **Main site:** twsgurukul.com

## Design Language

- **Vibe:** Minimal, content-first (Substack/Medium inspired)
- **Background:** Warm White (#FAF8F5)
- **Body font:** Satoshi (sans-serif)
- **Heading font:** Instrument Serif
- **Colors:**
  - Deep Slate #2C3539 — primary text
  - Burnt Amber #C87533 — headings, accents, CTAs
  - Brushed Gold #B8956A — premium highlights
  - Warm White #FAF8F5 — page background
  - Wealth Teal #0A8D7A — links, tags

## Navigation (sticky, all pages)

- Left: "TWSGurukulX" in Instrument Serif, Burnt Amber — links to home
- Right: "About" text link + "Join WhatsApp" button (subtle green tint, links to wa.me/918062963333)
- Mobile: hamburger icon, slide-out drawer with same links
- Sticky with backdrop blur + subtle bottom border on scroll
- Container: max-w-4xl (896px)

## Footer (all pages)

- "© 2026 Trading With Sidhant LLP"
- Popular tags as links

## Pages

### Home Page

- **Featured post (latest):** Full-width hero image (16:9), tags, title in Instrument Serif, hook as subtitle, date. Links to post.
- **Recent posts list:** Clean text list with dividers (no images, no cards). Each row: title, hook, date, tags. Scans fast, loads fast.
- **WhatsApp CTA section** at bottom: "Get notified when new analysis drops." Phone input with country code dropdown (default +91), stores in DB.
- No pagination initially — show last 20 posts.
- No sidebar — single column.

### Post Page (`/posts/[slug]`)

- **Narrow reading column:** max-w-prose (~680px / ~65ch)
- **Header:** Tags, title (Instrument Serif), hook (Burnt Amber, pull-quote style), date
- **Hero image:** Full-width within column, rounded corners
- **Intro paragraph:** Generous line-height
- **Sections:** Instrument Serif headings with subtle visual rhythm. Body text in Satoshi.
- **Charts:** Expandable thumbnails (~300px wide). Click opens lightbox overlay (dark background, full-res image, close on click/Esc). Caption below thumbnail. Pure CSS + minimal JS, no library.
- **Conclusion:** Separated by subtle top border
- **WhatsApp CTA** repeats at bottom of every post (highest-intent placement)
- No share buttons, no comments

### Tag Page (`/tags/[tag]`)

- Same text-list format as home page recent posts
- Heading: "Posts tagged #[tag]"
- Filtered post list

### About Page (`/about`)

- Same narrow column as post pages
- Heading: "About TWSGurukulX"
- Copy: "Trading With Sidhant Team breaks down Nifty, BankNifty, and options setups live — every trading day. This blog captures those sessions so you can revisit the analysis, study the setups, and learn at your own pace."
- "What You'll Find Here" section: live stream recaps, chart analysis, market context
- Contact: Trading With Sidhant LLP, +91-8062963333, twsgurukul.com

## New Components

### Chart Lightbox

- Triggered by clicking chart thumbnail in post
- Dark semi-transparent overlay
- Full-resolution chart image centered
- Close on: click overlay, click X button, press Esc
- Pure CSS + minimal JS (no external library)

### WhatsApp Phone Form

- Country code dropdown (default: +91 India)
- Phone number text input (10-digit validation for India)
- "Join" submit button
- Success state: inline "You're in!" confirmation, no redirect
- Error state: inline validation message

### Mobile Hamburger Menu

- Hamburger icon replaces nav links on small screens
- Slide-out drawer from right
- Contains: About link, Join WhatsApp link
- Close on backdrop click or X button

## Data Model Addition

New Prisma model:

```prisma
model Subscriber {
  id          String   @id @default(cuid())
  phone       String   @unique
  countryCode String   @default("+91")
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

New API route: `POST /api/subscribe`
- Validates phone format
- Rejects duplicates
- Returns success/error JSON

## SEO (unchanged)

- JSON-LD Article schema on post pages
- Open Graph + Twitter Card meta tags
- Auto-generated sitemap.xml
- ISR revalidation: 60 seconds

## What's NOT in scope

- Dark mode
- Search
- Pagination (load more can be added later)
- Comment system
- Social share buttons
- WhatsApp Business API integration (just data collection for now)
- Legal pages (add later, potentially link to twsgurukul.com)
