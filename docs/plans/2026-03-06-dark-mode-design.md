# Dark Mode Design

## Goal

Add dark mode to the blog using the brand's Midnight Architect palette, with OS preference detection and a manual toggle.

## Approach: CSS Variable Remapping

The blog already uses CSS custom properties (`--color-deep-slate`, `--color-warm-white`, etc.) referenced everywhere through Tailwind. Rather than adding `dark:` prefixes to hundreds of classes across 14+ components, we remap the CSS variables under a `.dark` class on `<html>`.

## Color Mapping

| Token | Light Mode | Dark Mode | Source |
|-------|-----------|-----------|--------|
| `warm-white` (bg) | `#FAF8F5` | `#0B1221` (Deep Navy-Black) | Brand: Midnight Architect |
| `deep-slate` (text) | `#2C3539` | `#EDE6D8` (Soft Sand) | Brand: Midnight Architect |
| `burnt-amber` | `#C87533` | `#D4894A` (brightened for contrast) | Adjusted |
| `brushed-gold` | `#B8956A` | `#C9A87C` (brightened for contrast) | Adjusted |
| `wealth-teal` | `#0A8D7A` | `#0A8D7A` (unchanged, bridge color) | Brand guideline |

## Changes Required

### 1. `globals.css` — Variable remapping + dark fixes
- Add `.dark` block remapping all 5 color variables
- Update hard-coded `rgba(44,53,57,...)` values in `.post-row:hover` and `.tag-pill:hover` to use CSS variables
- Adjust grain overlay opacity for dark mode

### 2. `layout.tsx` — FOUC prevention script
- Add inline `<script>` in `<head>` that reads `localStorage('theme')` and `prefers-color-scheme` before paint
- Sets `.dark` class on `<html>` before first render

### 3. `Nav.tsx` — Theme toggle button
- Sun/moon icon toggle in desktop and mobile nav
- Persists choice to `localStorage`
- Dispatches class change on `<html>`

### 4. Fix hard-coded `bg-white` (~6 instances)
- `SearchBar.tsx` — input `bg-white` → `bg-warm-white`
- `TelegramCTA.tsx` — card `bg-white` → `bg-warm-white`
- `ProgramCTA.tsx` — card `bg-white` → `bg-warm-white`
- `TableOfContents.tsx` — mobile TOC `bg-white` → `bg-warm-white`

### 5. `Footer.tsx` — gradient fix
- Replace hard-coded `#F3F0EB` with a CSS variable or Tailwind-aware value

## Theme Toggle Behavior

1. First visit: follows OS `prefers-color-scheme`
2. User clicks toggle: persists to `localStorage('theme')` as `'light'` or `'dark'`
3. Inline script in `<head>` applies class before paint (no FOUC)
4. Toggle listens for OS preference changes when no localStorage override exists

## What Stays the Same

- All component class structures remain identical
- Opacity patterns (`text-deep-slate/75`, `bg-deep-slate/5`) naturally invert
- No `dark:` prefixes needed on individual components
- Accent colors (wealth-teal) remain the brand bridge per brand guidelines
