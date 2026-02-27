# N8N Workflows — TWS Stream to Blog

## Import Instructions

1. Open your n8n instance
2. Go to **Workflows** > **Import from File**
3. Import each JSON file in this order:
   - `stream-detection.json` — polls YouTube every 5 minutes, detects ended streams
   - `process-stream.json` — dispatches transcription (local GPU or cloud Whisper fallback)
   - `llm-pipeline.json` — multi-model blog generation chain
   - `publish.json` — publishes to blog, validates, updates state, notifies Discord

## Required n8n Variables

Set these in **Settings > Variables** before activating any workflow:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `N8N_BASE_URL` | `https://n8n.yourdomain.com` | Base URL of your n8n instance (no trailing slash). Used to call webhooks between workflows. |
| `LOCAL_API_URL` | `https://abc123.trycloudflare.com` | Cloudflare Tunnel URL pointing to your local FastAPI service. |
| `BLOG_URL` | `https://your-blog.vercel.app` | Deployed blog URL (no trailing slash). |
| `DISCORD_WEBHOOK_URL` | `https://discord.com/api/webhooks/...` | Discord webhook for success/failure notifications. |

**Note on `N8N_BASE_URL`**: The workflows call each other via webhook HTTP requests using this variable. The `stream-detection` workflow calls `process-stream`, `process-stream` calls `llm-pipeline`, and `llm-pipeline` calls `publish-blog`. Setting this variable correctly is required for the pipeline to chain between workflows.

## Required n8n Credentials

Create these in **Settings > Credentials**:

| Credential Name | Type | Configuration |
|-----------------|------|---------------|
| `YouTube OAuth2` | YouTube OAuth2 API | OAuth2 credentials for YouTube Data API v3 |
| `Local API Key` | HTTP Header Auth | Header: `X-API-Key`, Value: your FastAPI service key |
| `OpenAI API Key` | HTTP Header Auth | Header: `Authorization`, Value: `Bearer sk-...` |
| `Anthropic API Key` | HTTP Header Auth | Header: `x-api-key`, Value: `sk-ant-...` |
| `Tavily API Key` | HTTP Header Auth | Header: `Authorization`, Value: `Bearer tvly-...` |
| `Blog Publish API Key` | HTTP Header Auth | Header: `X-API-Key`, Value matching your blog `PUBLISH_API_KEY` env var |
| `Pipeline Postgres` | Postgres | Connection to your Postgres database (see State Store Setup below) |

After creating each credential, open the relevant nodes in each workflow and update the credential ID references. Look for nodes that reference `REPLACE_POSTGRES_CRED_ID` — update these with the actual credential ID shown in n8n after you save the Postgres credential.

## State Store Setup (Postgres)

The `stream-detection` and `publish` workflows use Postgres to track which videos have been processed and record final status.

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
3. Activate `process-stream.json` (called by stream-detection)
4. Activate `stream-detection.json` last (this starts the polling schedule)

## Workflow Architecture

```
[Schedule: every 5 min]
       |
stream-detection
  - Fetch YouTube playlist (latest video)
  - Fetch video details + liveStreamingDetails
  - IF liveBroadcastContent == "none" (stream ended)
    - Postgres: check if video_id already in pipeline_runs
    - IF not yet processed:
      - Postgres: INSERT pipeline_runs (status=pending)
      - Wait 15 minutes (VOD processing time)
      - HTTP POST → process-stream webhook
       |
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
    - POST Discord: success notification
  - ELSE:
    - Postgres: UPDATE pipeline_runs SET status='failed'
    - POST Discord: failure notification
```

## Customization Notes

- The LLM system prompts in `llm-pipeline.json` are tuned for trading/finance content. Edit them in the `jsonBody` fields of the HTTP Request nodes.
- Polling interval is 5 minutes. Change it in the Schedule Trigger node of `stream-detection.json`.
- The 15-minute VOD processing wait can be adjusted in the Wait node of `stream-detection.json`.
- Transcription polling: 60 retries x 30s = up to 30 minutes. Adjust `MAX_RETRIES` in the Code node.
- Chart extraction polling: 40 retries x 30s = up to 20 minutes. Adjust `MAX_RETRIES` in the Code node.
- The YouTube playlist ID `UUyFDhiqKcVqoIGB3CmJJFUg` is hardcoded in `stream-detection.json`. Update it in the Fetch Recent Videos node if your channel changes.

## Pipeline State Reference

The `pipeline_runs` Postgres table tracks each video through the pipeline:

| Column | Description |
|--------|-------------|
| `video_id` | YouTube video ID (primary key) |
| `channel_id` | YouTube channel ID |
| `detected_at` | When the stream end was detected |
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
