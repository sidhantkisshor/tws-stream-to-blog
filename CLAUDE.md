# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**TWSGurukulX — Live Stream to Blog**. Automated pipeline: detects ended YouTube live streams → transcribes via local GPU (faster-whisper) or cloud Whisper fallback → extracts chart frames → multi-model LLM chain (GPT-4o-mini → GPT-4o → Tavily → Claude Sonnet → Imagen 3) → publishes blog post to Next.js frontend on Vercel.

## Build / Dev / Test Commands

### Blog (`blog/`)

```bash
npm install              # install deps
npm run dev              # dev server at localhost:3000
npm run build            # production build
npm run lint             # ESLint (only automated check — no test suite)
npx prisma db push       # push schema to database
npx prisma migrate dev --name <name>  # create migration
```

### FastAPI Service (`services/local-api/`)

```bash
pip install -e ".[dev]"                    # install with dev extras
uvicorn src.main:app --host 0.0.0.0 --port 8100  # run API
python -m arq src.worker.WorkerSettings    # run background worker (separate terminal)
pytest                                     # all tests
pytest tests/test_api.py::test_transcribe_returns_job_id -v  # single test
```

pytest-asyncio uses `asyncio_mode = "auto"` — no `@pytest.mark.asyncio` needed.

### Start Everything (`bash start-local.sh`)

Starts Redis, FastAPI, ARQ worker, Cloudflare tunnel, and Next.js dev server.

## Architecture

```
YouTube stream ends
  → [n8n: stream-detection] polls YouTube API every 5 min, checks pipeline_runs table
  → [n8n: process-stream] calls local FastAPI via Cloudflare Tunnel (or cloud Whisper fallback)
  → [n8n: llm-pipeline] GPT-4o-mini compress → GPT-4o title/SEO → Tavily research → Claude blog body → Imagen hero image → R2 upload
  → [n8n: publish] POST /api/posts → Prisma upsert → validates page → updates pipeline_runs → Telegram notification
```

### blog/ — Next.js 16, React 19, TypeScript, Tailwind CSS v4, Prisma v7

- App Router only. Pages: `/`, `/posts`, `/posts/[slug]`, `/tags/[tag]`, `/about`, `/privacy`, `/terms`
- API routes: `POST /api/posts` (publish, X-API-Key auth), `POST /api/subscribe` (WhatsApp opt-in, rate-limited), `POST /api/subscribe-email` (email newsletter, rate-limited)
- Route handlers for SEO: `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/llms.txt` (AI crawler discovery), `/llms-full.txt`
- Prisma client output: `src/generated/prisma/` (non-standard). Import from `@/lib/prisma` (singleton).
- Data access helpers in `@/lib/posts.ts` (`getRecentPosts`, `getPostBySlug`, `getPostsByTag`, `getAllTags`, `getRelatedPosts`, `getAdjacentPosts`). ISR with `revalidate = 60`.
- Design tokens in `globals.css` `@theme inline`: deep-slate, burnt-amber, brushed-gold, warm-white, wealth-teal. Fonts: `font-satoshi` (body), `font-instrument` (accent).
- Local fonts loaded in `layout.tsx` via `next/font/local` (Satoshi, Instrument Serif) — woff2 files in `src/app/fonts/`.
- Database: Neon Postgres. Models: `Post` (videoId unique, slug unique, sections as JSON, faq as JSON), `Subscriber` (phone unique), `EmailSubscriber` (email unique).
- JSON-LD structured data on all pages: Article + FAQPage + BreadcrumbList on posts, ItemList on tag pages, WebSite + Blog on homepage, Organization on about page, WebPage on legal pages. All include `inLanguage: "en"`.
- Dark mode: CSS variable indirection in `globals.css` `@theme inline` block. Toggle in Nav persists to localStorage. Inline script in layout prevents FOUC.
- Markdown rendering: `react-markdown` with custom components in `MarkdownBody.tsx`. Callout blockquotes (Key Takeaway, Pro Tip, etc.) get teal styling via AST text inspection.

### services/local-api/ — Python 3.11+, FastAPI, ARQ, Redis

- Endpoints: `GET /health`, `POST /transcribe`, `POST /extract-charts`, `POST /upload-image`, `GET /status/{job_id}` — all require X-API-Key
- Heavy work goes through ARQ jobs (max 2 concurrent, 1hr timeout). Never do heavy work in request handlers.
- Whisper model loaded lazily (`_model = None` pattern). Downloads cleaned up in `finally` blocks.
- Job state in Redis: key `tws:job:{uuid}`, 24h TTL. Module: `src/jobs.py` (create/update/get).
- Worker tasks in `src/worker.py`: `transcribe_task` and `extract_charts_task`.
- Chart extraction: OpenCV scene detection → R2 upload via boto3 (`src/storage.py`).
- Config via pydantic-settings (`src/config.py`), reads from `.env`.

### n8n/ — Four workflow JSON files

- Activate in order: `publish` → `llm-pipeline` → `process-stream` → `stream-detection`
- Credential IDs are placeholders — re-link after import to n8n
- Inter-workflow calls use `$env.N8N_BASE_URL` + webhook auth header
- See `n8n/README.md` for full credential setup, state store SQL, and customization notes

## Key Environment Variables

### blog/.env
`DATABASE_URL` (Neon Postgres), `PUBLISH_API_KEY`, `NEXT_PUBLIC_SITE_URL`

### services/local-api/.env
`API_KEY`, `YOUTUBE_CHANNEL_ID`, `R2_ENDPOINT`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`, `REDIS_URL`, `WHISPER_MODEL` (default: large-v3), `WHISPER_DEVICE` (cuda/cpu), `DOWNLOAD_DIR` (default: ./downloads)

### n8n Variables
`N8N_BASE_URL`, `LOCAL_API_TUNNEL_URL`, `BLOG_BASE_URL`, `DISCORD_WEBHOOK_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`

## Conventions

- API auth: `X-API-Key` header checked against env var
- Blog API validation: manual `validateBody` type guards (not Zod)
- Slug format: `slugify(title) + "-" + Date.now().toString(36)`, idempotent via upsert on `videoId`
- Path alias: `@/` → `src/`
- Python tests: `httpx.AsyncClient` with `ASGITransport` + `monkeypatch.setenv`
- Rate limiting: in-memory Map per IP, cleanup on interval + size threshold (see `api/subscribe/route.ts` pattern)
- n8n state store: separate `pipeline_runs` Postgres table (not in Prisma schema). Reset failed runs: `DELETE FROM pipeline_runs WHERE video_id = '...'`
- AI crawler access: robots.txt explicitly allows GPTBot, ClaudeBot, PerplexityBot, GoogleOther, Bytespider, CCBot. `/llms.txt` serves structured site description for AI crawlers.

## Useful Operations

```bash
# Test publish API manually
curl -X POST https://your-blog.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <key>" \
  -d '{"videoId":"test","title":"Test","hook":"hook","seoDesc":"desc","heroImage":"","intro":"intro","sections":[{"heading":"H","body":"B"}],"conclusion":"end","tags":["t"],"keywords":["k"],"faq":[{"question":"Q?","answer":"A."}]}'

# Check pipeline state
psql -c "SELECT video_id, status, error_message FROM pipeline_runs ORDER BY detected_at DESC LIMIT 20;"

# Deploy blog to Vercel
cd blog && vercel --prod
```
