# Design plan: "The Tape"

**One visual idea: the session's real candles are the photograph, and one sentence from the post shouts over the calm.** Dark always means the market. Light always means the reading.

## Decisions

1. **Light by default.** The theme script now goes dark only on a stored choice, so everyone gets the designed page first. The toggle stays.
2. **Cream takeaway cards and YouTube thumbnails leave the page.** `heroImage` stops rendering on every reader surface and on share cards. It stays in the BlogPosting JSON-LD, and `POST /api/hero-card` and the schema do not change, so n8n and old posts need nothing.
3. **Heavy face: Archivo (OFL), instanced at wdth 62, wght 900, subset to Latin, 6 KB.** Self-hosted. Instrument Serif stays, set upright for the J.P. Morgan read. Satoshi stays for body.
4. **The big line comes from the post.** `lib/hard-line.ts` picks a section heading or a first takeaway sentence of at most 64 characters, verbatim. No line qualifies: no shout. Nothing is shortened or invented.
5. **Real charts only.** `lib/tape.ts` reads candles and levels out of the stored `*-chart-*.html` on R2. 30 of 73 posts have one. The other 43 get a type-only masthead. The AI illustration rasters never get promoted to a masthead.

## Tokens

| Token | Light | Dark |
|---|---|---|
| page | #F4F5F7 | #0B0D11 |
| sheet | #FFFFFF | #13161C |
| ink | #0D0F13 | #F1F3F6 |
| body | #2A2E35 | #C9CED6 |
| mute | #5C636E | #98A0AC |
| hot (large type, chart line) | #FF4A12 | #FF5A24 |
| hot-text (small type) | #C2390A | #FF8259 |
| market (plates, same as the stored sims) | #0B0B0C | #0B0B0C |

Corners are square everywhere except the avatar. One accent. No shadows except the search-free overlay prompt.

## Type

| Role | Face | Size |
|---|---|---|
| Shout | Archivo condensed black, caps, 0.9 line height | Fitted so the longest line fills the container |
| Title | Instrument Serif upright | clamp(2.6rem, 6.2vw, 5.4rem) |
| Section heading | Instrument Serif upright | clamp(2rem, 4vw, 2.9rem) |
| Body | Satoshi 400 | 1.125rem, 1.72 line height, 68ch |
| Small | Satoshi 500 | 0.8125rem |

## Wireframes

Index, 390:

```
[lockup              menu]
YOUR GURU
WON'T POST
THIS
Real trades from our live sessions...
All  Bitcoin  Risk  Order flow
█████ candles █████████████
█ hot entry line ──────────
█ Serif title of latest post
█ hook, receipt
██ ┌───────────────────────
██ │ search
   │ Risk management
   │ Serif title
   │ hook
   │ date, min
   │ ...
█████ BAND: candles + SHOUT █
```

Index, 1024 and up (reworked 2026-10-30 after the owner said desktop was bad): one content width of 1280, and nav, masthead, plate text and reading all share one left edge. The shout is one line. The plate is split, title on the left and candles on the right, so candles never sit behind type. The sheet is centred and overlaps the plate, with the post list beside a sticky rail for Telegram and email.

Post with a chart, 390 and 1440:

```
[nav]
█████ candles, hot entry line ██████
█ Tag
█ Serif title, large
█ hook, date, receipt
████ ┌─────────────────────────────
████ │ SHOUTED HARD LINE, FULL WIDTH
     │ contents   intro
     │ (sticky)   takeaways
     │            section, serif heading
     │            ██ dark interactive chart ██
     │            FAQ, open, no accordion
     │            share, related, next
```

Post, 1024 and up: the same split plate, then a two line shout, then contents, reading column and, from 1400, a sticky rail with share and Telegram.

Post with no chart: no plate, because there is no market to show.

```
[nav]
SHOUTED HARD LINE
(or the title itself, when no line qualifies)
Serif title, hook, date
contents   reading
```

## Banned list check

- Eyebrow over every heading: no. A tag label appears only over a post title, as navigation.
- Three equal cards: no. Cards as default container: no, rows and rules.
- Accordion FAQ: no, open list.
- Dark rounded hairline cards, purple glows: no.
- Paper or cream: no, cool near white.
- Chart inside a rounded card: no, full bleed and square.
- P&L, chips, cash, gold, cars: none. YouTube thumbnails with rupee figures are gone from the page and from share cards.
- AI generated imagery: none added.
