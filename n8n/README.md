# N8N Workflows — TWS Stream to Blog

## Import Instructions

1. Open your N8N instance
2. Go to **Workflows** > **Import from File**
3. Import each JSON file in this order:
   - `stream-detection.json` — detects when your live stream ends
   - `process-stream.json` — dispatches transcription (local or cloud)
   - `llm-pipeline.json` — multi-model blog generation chain
   - `publish.json` — publishes to blog + validates + notifies

## Required N8N Variables

Set these in **Settings > Variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `LIVE_VIDEO_ID` | Your YouTube live video ID | The 11-char ID of your recurring live stream |
| `LOCAL_API_URL` | `https://stream-api.yourdomain.com` | Cloudflare Tunnel URL to local FastAPI |
| `PROCESS_WEBHOOK_URL` | N8N webhook URL | Auto-generated when you activate process-stream workflow |
| `LLM_PIPELINE_WEBHOOK_URL` | N8N webhook URL | Auto-generated when you activate llm-pipeline workflow |
| `PUBLISH_WEBHOOK_URL` | N8N webhook URL | Auto-generated when you activate publish workflow |
| `BLOG_URL` | `https://your-blog.vercel.app` | Your deployed blog URL |
| `DISCORD_WEBHOOK_URL` | Discord webhook URL | For success/failure notifications |

## Required N8N Credentials

Create these in **Settings > Credentials**:

1. **YouTube API Key** (HTTP Query Auth) — `key` parameter with your YouTube Data API v3 key
2. **Local API Key** (HTTP Header Auth) — `X-API-Key` header with your FastAPI service key
3. **OpenAI API Key** (HTTP Header Auth) — `Authorization: Bearer sk-...`
4. **Anthropic API Key** (HTTP Header Auth) — `x-api-key: sk-ant-...`
5. **Tavily API Key** (HTTP Header Auth) — `Authorization: Bearer tvly-...`
6. **Blog Publish API Key** (HTTP Header Auth) — `X-API-Key` header matching your PUBLISH_API_KEY env var

## State Store Setup

Run the SQL setup script on your N8N host:

```bash
sqlite3 /path/to/n8n-data/tws-pipeline.db < setup-state-store.sql
```

Then configure each SQLite node in the workflows to point to this database file.

## Workflow Activation Order

1. Activate `publish.json` first (it's called by llm-pipeline)
2. Activate `llm-pipeline.json` (called by process-stream)
3. Activate `process-stream.json` (called by stream-detection)
4. Activate `stream-detection.json` last (this starts polling)

## Customization Notes

- The LLM system prompts in `llm-pipeline.json` are tuned for trading/finance content. Edit them in the HTTP Request node bodies if your content focus changes.
- Polling interval is 5 minutes. Change in the Schedule Trigger node of `stream-detection.json`.
- The 15-minute VOD processing wait can be adjusted in the Wait node.
- Chart extraction polling interval is 30 seconds. Adjust in process-stream if needed.
