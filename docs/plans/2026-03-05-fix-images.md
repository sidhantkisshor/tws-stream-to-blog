# Fix All Image Issues — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix broken remote images, full-size chart modal, OG metadata, asset performance, and z-index layering.

**Architecture:** Five independent fixes across next.config.ts, ChartImage component, post metadata, static assets, and globals.css.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, sharp (for compression)

---

### Task 1: Fix remotePatterns wildcard for R2 domains

**Files:**
- Modify: `blog/next.config.ts`

Next.js remotePatterns `hostname` uses `*` to match a single segment and `**` for any number of segments. `pub-*.r2.dev` won't match `pub-abc123.r2.dev` because `*` matches a full segment (between dots), not characters within a segment. Use `**.r2.dev` to match any R2 subdomain.

### Task 2: Fix ChartImage modal to display full-viewport

**Files:**
- Modify: `blog/src/components/ChartImage.tsx`

Replace fixed `width={1200} height={675}` with `fill` inside a sized container so the image scales to fill the viewport.

### Task 3: Improve OG metadata on post pages

**Files:**
- Modify: `blog/src/app/posts/[slug]/page.tsx`

Change `images: [post.heroImage]` to `images: [{ url: post.heroImage, width: 1200, height: 675, alt: post.title }]` for both openGraph and twitter.

### Task 4: Compress oversized PNGs, delete unused logo-wordmark.png

**Files:**
- Delete: `blog/public/logo-wordmark.png` (820KB, unused)
- Compress: `blog/public/og-banner.png` (1.1MB -> target <200KB)
- Compress: `blog/public/logo-icon.png` (88KB -> target <15KB)

### Task 5: Fix grain overlay z-index vs modal z-index

**Files:**
- Modify: `blog/src/app/globals.css`

Grain overlay is `z-index: 9999`, ChartImage modal is `z-[100]`. Lower grain to `z-index: 50` so modals render above it.
