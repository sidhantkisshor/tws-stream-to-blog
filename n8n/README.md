# N8N Workflows — TWS Stream to Blog

## Provenance

These files are **backups exported from the live n8n instance on 2026-07-27**, not the
source of truth. The instance is authoritative; re-export after every change or the repo
drifts. It had drifted badly before this export — `llm-pipeline.json` was 11 nodes against
32 live, and `process-stream.json` was 24 against 47.

| File | Workflow ID | Nodes | Exported |
|------|-------------|-------|----------|
| `process-stream.json` | `IPzLmrlY0ouPTnyM` | 47 | 2026-07-27 |
| `llm-pipeline.json` | `0eyr7rl0xs1YQZmX` | 32 | 2026-07-27 |
| `manual-transcript-to-blog.json` | `aljVaFklKureUK5h` | 6 | 2026-07-27 |
| `publish.json` | `0CyeY196pvsvhcpv` | 9 | **stale — not re-exported** |

Two caveats:

- **Credentials are stripped.** The export API returns no `credentials` block on any node,
  so importing these gives you the full logic with every credential unbound. Re-link each
  one by hand after import (see *Required n8n Credentials* below).
- **`publish.json` could not be re-exported.** That workflow has *Available in MCP* turned
  off, so the export API refuses it. To refresh it, either enable that toggle on the
  workflow card or export it from the n8n UI. Treat the committed copy as the original v1.

## Removed: automatic stream detection (2026-07-27)

`stream-detection.json` (`HbTFwsuTxh5gcYca`) has been removed from this repo and archived
on the instance. It was the schedule trigger that polled the TWS and Hitpoint YouTube
channels every 5 minutes and started the pipeline on its own; it had been inactive since
2026-07-20 and was deleted rather than revived.

**The pipeline no longer starts by itself.** The only entry point is now
`manual-transcript-to-blog.json` — submit its form with a video URL and transcript.
Nothing else referenced the removed workflow, so no other file changed behaviour.

## Import Instructions

1. Open your n8n instance
2. Go to **Workflows** > **Import from File**
3. Import each JSON file in this order:
   - `process-stream.json` — transcription: local GPU service, with YouTube caption scraping and retry fallbacks
   - `llm-pipeline.json` — multi-model blog generation chain (chart vision → ghost writer → editorial board agent)
   - `publish.json` — publishes to blog, validates, updates state, notifies Telegram
   - `manual-transcript-to-blog.json` — form-triggered manual path; paste a transcript to generate a post when caption fetch fails

## Required n8n Variables

Set these in **Settings > Variables** before activating any workflow:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `N8N_BASE_URL` | `https://n8n.yourdomain.com` | Base URL of your n8n instance (no trailing slash). Used to call webhooks between workflows. |
| `LOCAL_API_TUNNEL_URL` | `https://abc123.trycloudflare.com` | Cloudflare Tunnel URL pointing to your local FastAPI service. |
| `BLOG_BASE_URL` | `https://your-blog.vercel.app` | Deployed blog URL (no trailing slash). |
| `DISCORD_WEBHOOK_URL` | `https://discord.com/api/webhooks/...` | Discord webhook for success/failure notifications. |
| `R2_ACCOUNT_ID` | `your-cloudflare-account-id` | Cloudflare account ID for R2 uploads. |
| `R2_ACCESS_KEY` | `your-r2-access-key` | R2 S3-compatible access key. |
| `R2_SECRET_KEY` | `your-r2-secret-key` | R2 S3-compatible secret key. |
| `R2_BUCKET` | `tws-blog-images` | R2 bucket name for hero images. |
| `R2_PUBLIC_URL` | `https://pub-xxx.r2.dev` | Public URL of your R2 bucket (no trailing slash). |

**Note on `N8N_BASE_URL`**: The workflows call each other via webhook HTTP requests using this variable. `process-stream` calls `llm-pipeline`, and `llm-pipeline` calls `publish-blog`. Setting this variable correctly is required for the pipeline to chain between workflows.

## Required n8n Credentials

Create these in **Settings > Credentials**:

| Credential Name | Type | Configuration |
|-----------------|------|---------------|
| `YouTube OAuth2` | YouTube OAuth2 API | OAuth2 credentials for YouTube Data API v3 |
| `Local API Key` | HTTP Header Auth | Header: `X-API-Key`, Value: your FastAPI service key |
| `OpenAI API Key` | OpenAI API | API Key: `sk-...` (used by the native OpenAI nodes in `llm-pipeline`) |
| `Anthropic API Key` | HTTP Header Auth | Header: `x-api-key`, Value: `sk-ant-...` |
| `Tavily API Key` | HTTP Header Auth | Header: `Authorization`, Value: `Bearer tvly-...` |
| `Blog Publish API Key` | HTTP Header Auth | Header: `X-API-Key`, Value matching your blog `PUBLISH_API_KEY` env var |
| `N8N Webhook Auth` | HTTP Header Auth | Header: `X-Webhook-Key`, Value: a strong random secret. Used to authenticate inter-workflow webhook calls. |
| `Pipeline Postgres` | Postgres | Connection to your Postgres database (see State Store Setup below) |

After creating each credential, open the relevant nodes in each workflow and update the credential ID references:
- Replace `REPLACE_POSTGRES_CRED_ID` with your Postgres credential ID.
- Replace `REPLACE_WITH_WEBHOOK_AUTH_CREDENTIAL_ID` with your N8N Webhook Auth credential ID.

## State Store Setup (Postgres)

The `manual-transcript-to-blog` and `publish` workflows use Postgres to track which videos have been processed and record final status.

### 1. Create the table

Run the included SQL against your Postgres database:

```bash
psql -h localhost -U n8n -d n8n -f setup-state-store.sql
```

If your n8n uses Docker Compose with a bundled Postgres service:

```bash
docker exec -i <postgres-container-name> psql -U n8n -d n8n < setup-state-store.sql
```

### 2. Configure the Postgres credential in n8n

In **Settings > Credentials**, create a new **Postgres** credential named `Pipeline Postgres` with the connection details for your database.

For n8n self-hosted with the default Docker Compose stack, the bundled Postgres connection details are:

- Host: `postgres` (or `localhost` if running n8n directly)
- Port: `5432`
- Database: `n8n`
- User: `n8n`
- Password: (from your `POSTGRES_PASSWORD` env var)

### 3. Replace credential IDs in the workflow JSON

After saving the credential, open each workflow in n8n and re-select the `Pipeline Postgres` credential in every Postgres node. Alternatively, edit the JSON files before import and replace `REPLACE_POSTGRES_CRED_ID` with the actual credential ID.

## Workflow Activation Order

Activate in this order so each webhook is registered before the upstream workflow tries to call it:

1. Activate `publish.json` first (called by llm-pipeline)
2. Activate `llm-pipeline.json` (called by process-stream)
3. Activate `process-stream.json`
4. Activate `manual-transcript-to-blog.json` last — this exposes the form that starts a run

## Workflow Architecture

> **Outdated.** The diagram below describes the original v1 design and no longer matches the
> exported JSON. Known divergences: workflows now chain via `executeWorkflow` nodes rather
> than webhook POSTs; `process-stream` replaced the cloud-Whisper fallback with a YouTube
> caption-scraping chain (timedtext and player-API fallbacks, retry_pending state, Telegram
> retry alerts); `llm-pipeline` gained chart vision classification, an internal-link pool
> built from the live sitemap, an Editorial Board agent, and a compliance/publish gate.
> The scheduled `stream-detection` stage shown as the entry point was removed on
> 2026-07-27 — runs now start from the `manual-transcript-to-blog` form.
> Read the JSON for current behaviour.

```
[Form submission: video URL + transcript]
       |
manual-transcript-to-blog
  - Parse video ID, map channel → voice
  - Postgres: INSERT pipeline_runs (status=processing)
  - → llm-pipeline (transcript supplied directly, no charts)

[or, for a run that still needs transcription]
process-stream
  - GET local API /health
  - IF local machine online:
    - POST /transcribe → poll /status/{job_id} (max 60x 30s)
    - IF complete:
      - POST /extract-charts → poll /status/{job_id} (max 40x 30s)
      - HTTP POST → llm-pipeline webhook (with or without chart_urls)
  - ELSE (local machine offline):
    - yt-dlp download audio as MP3
    - POST OpenAI Whisper API
    - HTTP POST → llm-pipeline webhook (no charts)
       |
llm-pipeline
  - POST OpenAI GPT-4o-mini: compress transcript → structured JSON
  - POST OpenAI GPT-4o: generate title, hook, SEO, image_prompt
  - POST Tavily: research using keywords
  - POST Anthropic Claude Sonnet 4.6: write blog body JSON
  - POST Google Imagen 3: generate hero image (continueOnFail=true)
  - Code: assemble publish payload
  - HTTP POST → publish-blog webhook
       |
publish
  - POST blog API /api/posts
  - GET blog URL /posts/{slug} (validate 200 response)
  - IF 200:
    - Postgres: UPDATE pipeline_runs SET status='complete'
    - Telegram: success notification
  - ELSE:
    - Postgres: UPDATE pipeline_runs SET status='failed'
    - Telegram: failure notification
```

## Customization Notes

- The LLM system prompts in `llm-pipeline.json` are tuned for trading/finance content. Edit them directly in the **Messages** fields of the OpenAI nodes (Step 1 and Step 2), and in the `jsonBody` field of the Anthropic HTTP Request node (Step 4).
- Transcription polling: 60 retries x 30s = up to 30 minutes. Adjust `MAX_RETRIES` in the Code node.
- Chart extraction polling: 40 retries x 30s = up to 20 minutes. Adjust `MAX_RETRIES` in the Code node.
- The channel → voice mapping lives in the `Prepare Manual Input` Code node of `manual-transcript-to-blog.json` and must stay in sync with the Voice Router in `llm-pipeline.json`.

## Pipeline State Reference

The `pipeline_runs` Postgres table tracks each video through the pipeline:

| Column | Description |
|--------|-------------|
| `video_id` | YouTube video ID (primary key) |
| `channel_id` | YouTube channel ID |
| `detected_at` | When the run was created (form submission time) |
| `status` | `pending`, `complete`, or `failed` |
| `transcript` | Full transcript text (not populated by n8n — available for future use) |
| `chart_urls` | JSON array of chart URLs (not populated by n8n — available for future use) |
| `blog_post_id` | Blog post ID returned by the blog API |
| `published_url` | Full published URL of the blog post |
| `llm_cost_usd` | LLM cost tracking (not populated by n8n — available for future use) |
| `error_message` | Error detail if status is `failed` |
| `failed_step` | Which step failed (`transcription`, `validate`, etc.) |
| `updated_at` | Last update timestamp |

To inspect the state store:

```sql
SELECT video_id, status, detected_at, published_url, error_message
FROM pipeline_runs
ORDER BY detected_at DESC
LIMIT 20;
```

To reset a failed video for reprocessing:

```sql
DELETE FROM pipeline_runs WHERE video_id = 'YOUR_VIDEO_ID';
```
