# TWS Live Stream to Blog — System Design

## Overview

Automated pipeline that detects when a TWS trading live stream ends on YouTube, transcribes it, extracts chart screenshots, generates an SEO-friendly blog post using a multi-model LLM chain, and publishes it to a custom-branded Next.js blog site.

## Architecture: Hybrid (N8N + Local FastAPI)

N8N orchestrates the workflow. A local FastAPI service on a Windows machine with NVIDIA GPU handles heavy processing (Whisper transcription, video frame extraction). Cloud fallbacks activate when the local machine is offline.

```
┌─────────────────────────────────────────────────────────────┐
│                     N8N (Orchestrator)                       │
│                                                             │
│  [WebSub Push] ──or── [videos.list poll @ 5min, 1 unit]    │
│         │                                                   │
│         ▼                                                   │
│  [Check State Store] ── already processed? → skip           │
│         │                                                   │
│         ▼                                                   │
│  [Wait 15 min] ── let YouTube process VOD                   │
│         │                                                   │
│         ▼                                                   │
│  [Health Check via Cloudflare Tunnel + API Key]             │
│         │                    │                              │
│       ONLINE               OFFLINE                          │
│         │                    │                              │
│         ▼                    ▼                              │
│  [Local FastAPI]      [Cloud Fallback]                      │
│   async job dispatch   - OpenAI Whisper API                 │
│   poll /status/{id}    - Cloud Function for charts          │
│         │                    │                              │
│         └────────┬───────────┘                              │
│                  ▼                                           │
│  [LLM Pipeline — all JSON structured output]                │
│   1. GPT-4o-mini → transcript compression                   │
│   2. GPT-5.2 → {title, hook, seo, keywords, image_prompt}  │
│   3. Tavily → research on extracted keywords                │
│   4. Sonnet 4.6 → {intro, sections[], conclusion, tags}    │
│   5. Nano Banana 2 → hero image                            │
│                  │                                           │
│                  ▼                                           │
│  [Publish to Blog CMS]                                      │
│  [Validate published URL → 200 OK]                          │
│  [Update state store → complete]                            │
│  [On failure → alert via Discord/email, store error]        │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Stream Detection (N8N)

- **Primary:** YouTube WebSub (PubSubHubbub) push notification — zero quota cost
- **Fallback:** `videos.list` polling every 5 minutes — 1 quota unit per call (288 units/day, well within 10,000 daily limit)
- **Important:** Never use `search.list` (100 units/call — exceeds daily quota at 5-min polling)
- **Deduplication:** State store check on `video_id` before processing
- **VOD delay:** 15-minute N8N Wait node after detection to allow YouTube VOD processing

### 2. Local FastAPI Service

**Tech:** Python, FastAPI, faster-whisper (CUDA), OpenCV, ARQ + Redis

**Endpoints:**
- `GET /health` — alive check, includes yt-dlp smoke test
- `POST /transcribe` — async; downloads audio-only via `yt-dlp -x --audio-format mp3`, runs Whisper on CUDA, returns `{job_id}`
- `POST /extract-charts` — async; downloads 720p video, OpenCV scene detection, uploads frames to Cloudflare R2, returns `{job_id}`
- `GET /status/{job_id}` — returns job status and result when complete

**Security:**
- Cloudflare Tunnel (outbound-only, no port forwarding)
- `X-API-Key` header middleware on all endpoints
- Input validation: only accept YouTube video IDs matching `[A-Za-z0-9_-]{11}` belonging to configured channel ID

**Reliability:**
- ARQ + Redis task queue (jobs survive service restarts)
- Windows Task Scheduler auto-start on boot
- Disable sleep mode on machine

### 3. Cloud Fallback

Activated when local machine `/health` check fails.

- **Transcription:** OpenAI Whisper API (~$0.006/min, ~$0.72 for 2-hour stream)
- **Chart extraction:** Cloud Function (GCP/AWS Lambda) with PySceneDetect on CPU — downloads low-res video from YouTube VOD URL, extracts frames, uploads to R2
- **LLM pipeline runs identically** regardless of local/cloud transcription path

### 4. LLM Pipeline (N8N HTTP Nodes)

All models return **JSON structured output** with defined schemas.

| Step | Model | Input | Output Schema |
|------|-------|-------|---------------|
| 1. Transcript compression | GPT-4o-mini | Raw Whisper transcript | `{tickers[], setups[], timestamps[], key_quotes[], summary}` |
| 2. Title & hooks | GPT-5.2 | Compressed summary | `{title, hook, seo_description, keywords[], image_prompt}` |
| 3. Research | Tavily | Keywords from step 2 | Research context per keyword/ticker |
| 4. Blog body | Sonnet 4.6 | Summary + title + research + chart URLs | `{intro, sections[{heading, body, chart_ref?}], conclusion, tags[]}` |
| 5. Hero image | Nano Banana 2 | `image_prompt` from step 2 | Image URL |

**Cost optimization:**
- GPT-4o-mini handles the largest token load (transcript) at lowest cost
- Cache Tavily results by ticker with 24-hour TTL
- Log token counts and costs per run in state store

### 5. Blog Website

**Tech:** Next.js, Prisma ORM, Neon Postgres (serverless), Vercel hosting

**Brand:** TWS Sophisticated Warmth palette (customer-facing)
- Deep Slate (#2C3539) — primary text
- Burnt Amber (#C87533) — headlines, CTAs, accents
- Brushed Gold (#B8956A) — premium highlights (<10%)
- Warm White (#FAF8F5) — page backgrounds
- Wealth Teal (#0A8D7A) — links, bridge element
- Fonts: Satoshi (body/UI), Instrument Serif (headline accents)

**Pages:**
- Home — recent posts grid with hero images, titles, dates
- Post detail — hero image, structured sections with inline chart screenshots, SEO meta
- Tag/category pages — filtered post listings
- API route `POST /api/posts` — authenticated endpoint for N8N to publish

**SEO:**
- Static generation (ISR) for all blog pages
- JSON-LD structured data (Article schema)
- Open Graph / Twitter Card meta tags
- Auto-generated sitemap.xml

**Database schema (Prisma):**
```
Post {
  id          String   @id @default(cuid())
  videoId     String   @unique
  title       String
  slug        String   @unique
  hook        String
  seoDesc     String
  heroImage   String   // R2 URL
  intro       String
  sections    Json     // [{heading, body, chartRef?}]
  conclusion  String
  tags        String[]
  keywords    String[]
  publishedAt DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 6. Image Storage — Cloudflare R2

- S3-compatible, no egress fees
- Chart screenshots uploaded by local FastAPI or cloud function
- Hero images uploaded by N8N after generation
- Served via Cloudflare CDN with custom domain

### 7. State Store — SQLite (on N8N host)

```sql
CREATE TABLE pipeline_runs (
  video_id      TEXT PRIMARY KEY,
  channel_id    TEXT NOT NULL,
  detected_at   DATETIME NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  transcript    TEXT,
  chart_urls    TEXT, -- JSON array
  blog_post_id  TEXT,
  published_url TEXT,
  llm_cost_usd  REAL,
  error_message TEXT,
  failed_step   TEXT,
  updated_at    DATETIME NOT NULL
);
```

### 8. Error Handling

- N8N Error Workflow triggers on any node failure
- Sends notification (Discord webhook or email) with: video_id, failed node, error message
- State store updated with `failed` status + step name
- Pipeline can be manually resumed from failed step (state store tracks progress)

## Hosting & Cost Summary

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Vercel (Next.js) | Free/Hobby | $0 |
| Neon Postgres | Free | $0 |
| Cloudflare R2 | Free (10GB) | $0 |
| Cloudflare Tunnel | Free | $0 |
| N8N | Existing instance | $0 |
| Redis (local) | Local install | $0 |

### Per-Stream Cost (~2 hours)

| Item | Local | Cloud Fallback |
|------|-------|---------------|
| Whisper | $0 | ~$0.72 |
| GPT-4o-mini (compression) | ~$0.01 | ~$0.01 |
| GPT-5.2 (titles/hooks) | ~$0.05-0.10 | ~$0.05-0.10 |
| Tavily research | ~$0.01 | ~$0.01 |
| Sonnet 4.6 (blog body) | ~$0.10-0.20 | ~$0.10-0.20 |
| Nano Banana 2 (image) | ~$0.02 | ~$0.02 |
| **Total** | **~$0.19-0.34** | **~$0.91-1.06** |

## Key Design Decisions

1. **Hybrid over pure-local or pure-cloud** — N8N for orchestration (visual, existing setup), Python for heavy processing (GPU, video)
2. **Async jobs with polling** — long transcription tasks don't timeout; ARQ + Redis for durability
3. **Cloudflare Tunnel over port forwarding** — outbound-only, secure, stable URL, free
4. **Audio-only download for transcription** — 150MB vs 4-8GB, 90% faster download
5. **Transcript compression before LLM chain** — keeps token costs low, improves output quality
6. **JSON structured output from all LLMs** — reliable parsing in N8N, no regex fragility
7. **WebSub + videos.list polling** — quota-safe YouTube detection (never use search.list)
8. **Cloud fallback includes chart extraction** — trading blog without charts is useless; Cloud Functions with PySceneDetect handles this on CPU
