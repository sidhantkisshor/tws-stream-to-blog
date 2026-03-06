# Dark Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add dark mode using the brand's Midnight Architect palette with OS preference detection and manual toggle.

**Architecture:** CSS variable remapping under `.dark` class on `<html>` — all 5 design tokens get dark values, so existing Tailwind classes (`text-deep-slate`, `bg-warm-white`, etc.) automatically adapt. A blocking `<script>` in `<head>` prevents FOUC. A sun/moon toggle in the nav persists choice to localStorage.

**Tech Stack:** Tailwind CSS v4, Next.js 16, React 19, CSS custom properties

**Design doc:** `docs/plans/2026-03-06-dark-mode-design.md`
**Brand reference:** `docs/plans/brand.md` (Midnight Architect palette)

---

### Task 1: Add dark CSS variables and fix hard-coded colors in globals.css

**Files:**
- Modify: `blog/src/app/globals.css`

**Step 1: Add `--color-surface` to the `@theme inline` block**

Add a new token for card/input backgrounds. This is needed because cards currently use `bg-white` which must differentiate from the page background in both modes.

In the `@theme inline` block (after `--color-wealth-teal`), add:

```css
--color-surface: #FFFFFF;
```

**Step 2: Add the `.dark` variable remapping block**

After the `@theme inline` block and before the `body` rule, add:

```css
.dark {
  --color-deep-slate: #EDE6D8;
  --color-burnt-amber: #D4894A;
  --color-brushed-gold: #C9A87C;
  --color-warm-white: #0B1221;
  --color-wealth-teal: #0A8D7A;
  --color-surface: #111A2E;
}
```

**Step 3: Fix hard-coded rgba values in `.tag-pill:hover` and `.post-row:hover`**

Replace `.tag-pill:hover`:
```css
.tag-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-deep-slate) 8%, transparent);
}
```

Replace `.post-row:hover`:
```css
.post-row:hover {
  background-color: color-mix(in srgb, var(--color-deep-slate) 2%, transparent);
  padding-left: 8px;
  margin-left: -8px;
}
```

**Step 4: Add dark grain overlay adjustment**

After the `.grain::before` rule, add:

```css
.dark .grain::before {
  opacity: 0.015;
}
```

**Step 5: Run lint**

Run: `cd blog && npm run lint`
Expected: No errors

**Step 6: Commit**

```bash
git add blog/src/app/globals.css
git commit -m "feat(dark-mode): add CSS variable remapping for dark theme"
```

---

### Task 2: Add FOUC prevention script to layout.tsx

**Files:**
- Modify: `blog/src/app/layout.tsx`

**Step 1: Add inline theme script in `<head>`**

This script must run before paint to set the `.dark` class. In `layout.tsx`, add a `<script>` tag inside `<head>`, before the GTM script:

```tsx
<script dangerouslySetInnerHTML={{ __html: `
  (function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();
` }} />
```

**Step 2: Add `suppressHydrationWarning` to `<html>`**

Because the script modifies the `<html>` class before React hydrates, add `suppressHydrationWarning` to prevent mismatch warnings:

```tsx
<html lang="en" suppressHydrationWarning className={`${satoshi.variable} ${instrumentSerif.variable}`}>
```

**Step 3: Run lint**

Run: `cd blog && npm run lint`
Expected: No errors

**Step 4: Commit**

```bash
git add blog/src/app/layout.tsx
git commit -m "feat(dark-mode): add FOUC prevention script in layout head"
```

---

### Task 3: Add theme toggle to Nav.tsx

**Files:**
- Modify: `blog/src/components/Nav.tsx`

**Step 1: Add theme state and toggle logic**

Add a `mounted` state (to avoid hydration mismatch since we read from DOM) and a `dark` state. Add this inside the `Nav` component, after the existing `useState`/`useEffect` hooks:

```tsx
const [mounted, setMounted] = useState(false);
const [dark, setDark] = useState(false);

useEffect(() => {
  setDark(document.documentElement.classList.contains("dark"));
  setMounted(true);
}, []);

const toggleTheme = useCallback(() => {
  const next = !dark;
  setDark(next);
  document.documentElement.classList.toggle("dark", next);
  localStorage.setItem("theme", next ? "dark" : "light");
}, [dark]);
```

Add `useCallback` to the import from React:

```tsx
import { useState, useEffect, useCallback } from "react";
```

**Step 2: Add the toggle button to desktop nav**

In the desktop nav `<div className="hidden items-center gap-6 sm:flex">`, add a button before the "About" link:

```tsx
{mounted && (
  <button
    onClick={toggleTheme}
    className="rounded-full p-2 text-deep-slate/50 transition-colors hover:text-deep-slate"
    aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
  >
    {dark ? (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ) : (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )}
  </button>
)}
```

**Step 3: Add the toggle button to mobile drawer**

In the mobile drawer `<div className="flex flex-col gap-4 px-4 py-4">`, add a button after the Telegram link:

```tsx
{mounted && (
  <button
    onClick={toggleTheme}
    className="flex items-center gap-2 text-sm text-deep-slate/70 no-underline"
  >
    {dark ? (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ) : (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )}
    {dark ? "Light mode" : "Dark mode"}
  </button>
)}
```

**Step 4: Run lint**

Run: `cd blog && npm run lint`
Expected: No errors

**Step 5: Commit**

```bash
git add blog/src/components/Nav.tsx
git commit -m "feat(dark-mode): add sun/moon theme toggle to nav"
```

---

### Task 4: Fix hard-coded `bg-white` in components

**Files:**
- Modify: `blog/src/components/SearchBar.tsx`
- Modify: `blog/src/components/TelegramCTA.tsx`
- Modify: `blog/src/components/ProgramCTA.tsx`
- Modify: `blog/src/components/TableOfContents.tsx`

**Step 1: SearchBar.tsx**

Line 46: Change `bg-white` to `bg-surface` in the `<input>` className.

Before: `...border-deep-slate/10 bg-white px-4...`
After: `...border-deep-slate/10 bg-surface px-4...`

**Step 2: TelegramCTA.tsx**

Line 3: Change `bg-white` to `bg-surface` in the outer `<div>`.

Before: `...border-deep-slate/8 bg-white px-6...`
After: `...border-deep-slate/8 bg-surface px-6...`

**Step 3: ProgramCTA.tsx (banner variant)**

Line 25: Change `bg-white` to `bg-surface` in the banner variant's outer `<div>`.

Before: `...border-deep-slate/8 bg-white px-6...`
After: `...border-deep-slate/8 bg-surface px-6...`

**Step 4: TableOfContents.tsx (two places)**

Line 95: Change `bg-white` to `bg-surface` in the mobile TOC button.

Before: `...border-deep-slate/10 bg-white px-4...`
After: `...border-deep-slate/10 bg-surface px-4...`

Line 116: Change `bg-white` to `bg-surface` in the mobile TOC dropdown list.

Before: `...border-deep-slate/10 bg-white p-3...`
After: `...border-deep-slate/10 bg-surface p-3...`

**Step 5: Run lint**

Run: `cd blog && npm run lint`
Expected: No errors

**Step 6: Commit**

```bash
git add blog/src/components/SearchBar.tsx blog/src/components/TelegramCTA.tsx blog/src/components/ProgramCTA.tsx blog/src/components/TableOfContents.tsx
git commit -m "fix(dark-mode): replace hard-coded bg-white with bg-surface token"
```

---

### Task 5: Fix Footer gradient

**Files:**
- Modify: `blog/src/components/Footer.tsx`

**Step 1: Replace hard-coded gradient color**

Line 9: The footer uses `bg-gradient-to-b from-warm-white to-[#F3F0EB]`. In dark mode, `from-warm-white` will correctly be navy-black, but the hard-coded `to-[#F3F0EB]` will remain light.

Replace:
```
bg-gradient-to-b from-warm-white to-[#F3F0EB]
```

With:
```
bg-gradient-to-b from-warm-white to-deep-slate/5
```

This uses a 5% tint of `deep-slate` over the warm-white base, which gives a subtle gradient in both modes.

**Step 2: Run lint**

Run: `cd blog && npm run lint`
Expected: No errors

**Step 3: Commit**

```bash
git add blog/src/components/Footer.tsx
git commit -m "fix(dark-mode): replace hard-coded footer gradient with token-aware value"
```

---

### Task 6: Visual verification and build

**Step 1: Run the dev server**

Run: `cd blog && npm run dev`

**Step 2: Verify light mode**

Open `http://localhost:3000` in the browser. Everything should look identical to the current site (no visual regressions).

**Step 3: Verify dark mode via toggle**

Click the moon icon in the nav. Verify:
- Background changes to deep navy-black (`#0B1221`)
- Text changes to soft sand (`#EDE6D8`)
- Cards (TelegramCTA, ProgramCTA) have slightly elevated dark surface
- Search input has dark surface background
- Accent colors (burnt-amber, wealth-teal) are visible and readable
- Grain overlay is subtle, not overpowering
- Footer gradient is smooth
- Tag pills, post rows, and hover states work correctly

**Step 4: Verify persistence**

Refresh the page. Dark mode should persist (no flash of light mode).

**Step 5: Verify OS preference**

Clear localStorage (`localStorage.removeItem('theme')`). Toggle OS dark mode. Page should follow OS preference on reload.

**Step 6: Run production build**

Run: `cd blog && npm run build`
Expected: Build succeeds with no errors

**Step 7: Commit any remaining fixes**

If any visual issues were found and fixed, commit them.

---

### Task 7: Final commit

**Step 1: Verify all changes**

Run: `git status` and `git diff` to review.

**Step 2: Run lint one final time**

Run: `cd blog && npm run lint`
Expected: No errors

**Step 3: Final commit if needed**

Only if there are uncommitted fixes from Task 6.
