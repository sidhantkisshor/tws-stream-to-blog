# TWS Stream to Blog — Complete Setup Guide

Step-by-step instructions to get the full pipeline running. Follow in order.

---

## Prerequisites

You need these accounts and tools before starting:

- [ ] **Windows PC with NVIDIA GPU** (for local Whisper transcription)
- [ ] **GitHub account** (repo already at `sidhantkisshor/tws-stream-to-blog`)
- [ ] **Cloudflare account** (free — for R2 storage + Tunnel)
- [ ] **Vercel account** (free — for blog hosting)
- [ ] **Neon account** (free — for Postgres database)
- [ ] **N8N instance** (self-hosted or cloud — you already have this)
- [ ] **API keys**: OpenAI, Anthropic, Tavily, YouTube Data API v3, Google AI (Nano Banana 2)
- [ ] **Discord server** with a webhook URL (for notifications)

---

## Phase 1: Local Machine Setup (Windows)

### Step 1.1: Install Python 3.11+

```powershell
winget install Python.Python.3.11
```

Verify: `python --version` → should show 3.11+

### Step 1.2: Install Redis for Windows

Option A — WSL (recommended):
```powershell
wsl --install
# Inside WSL:
sudo apt update && sudo apt install redis-server -y
sudo service redis-server start
redis-cli ping
# Should return: PONG
```

Option B — Memurai (native Windows Redis alternative):
```powershell
winget install Memurai.MemuraiDeveloper
```

### Step 1.3: Install yt-dlp and FFmpeg

```powershell
winget install yt-dlp
winget install Gyan.FFmpeg
```

Verify:
```powershell
yt-dlp --version
ffmpeg -version
```

### Step 1.4: Install CUDA toolkit (if not already)

Check if you have it:
```powershell
nvidia-smi
```

If not installed:
```powershell
winget install Nvidia.CUDA
```

Restart your terminal after install.

### Step 1.5: Clone the repo and set up the FastAPI service

```powershell
git clone https://github.com/sidhantkisshor/tws-stream-to-blog.git
cd tws-stream-to-blog/services/local-api

python -m venv .venv
.venv\Scripts\activate

pip install -e ".[dev]"
```

This installs FastAPI, faster-whisper, OpenCV, ARQ, yt-dlp bindings, etc.

### Step 1.6: First-time Whisper model download

The first transcription will download the Whisper model (~3GB). Do it now to avoid delays later:

```python
python -c "from faster_whisper import WhisperModel; m = WhisperModel('large-v3', device='cuda', compute_type='float16'); print('Model loaded OK')"
```

This takes a few minutes. Wait for "Model loaded OK".

### Step 1.7: Create your .env file

```powershell
cd tws-stream-to-blog/services/local-api
copy .env.example .env
```

Edit `.env` with your values — we'll fill in R2 credentials in Phase 2:

```env
API_KEY=<generate-a-random-32-char-string>
YOUTUBE_CHANNEL_ID=<your-youtube-channel-id>
R2_ENDPOINT=<fill-after-phase-2>
R2_ACCESS_KEY=<fill-after-phase-2>
R2_SECRET_KEY=<fill-after-phase-2>
R2_BUCKET=tws-blog-images
R2_PUBLIC_URL=<fill-after-phase-2>
REDIS_URL=redis://localhost:6379
WHISPER_MODEL=large-v3
WHISPER_DEVICE=cuda
DOWNLOAD_DIR=./downloads
```

**To generate a random API key:**
```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Save this key — you'll need it for N8N later.

**To find your YouTube Channel ID:**
1. Go to your YouTube channel
2. Click your profile icon → "View your channel"
3. The URL will be `youtube.com/channel/UCxxxxxxx` — the `UCxxxxxxx` part is your channel ID
4. If the URL shows a custom handle (`@YourName`), go to https://www.youtube.com/account_advanced to find the numeric ID

### Step 1.8: Test the local service

Start Redis (in one terminal):
```powershell
# If using WSL:
wsl redis-server
# If using Memurai, it runs as a service automatically
```

Start the API (in another terminal):
```powershell
cd tws-stream-to-blog/services/local-api
.venv\Scripts\activate
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

Start the worker (in a third terminal):
```powershell
cd tws-stream-to-blog/services/local-api
.venv\Scripts\activate
python -m arq src.worker.WorkerSettings
```

Test health endpoint:
```powershell
curl http://localhost:8000/health -H "X-API-Key: <your-api-key>"
```

Expected response:
```json
{"status": "ok", "yt_dlp": {"available": true, "version": "2025.x.x"}}
```

If this works, your local service is ready. Stop all 3 terminals for now.

---

## Phase 2: Cloudflare Setup (R2 + Tunnel)

### Step 2.1: Create Cloudflare R2 bucket

1. Go to https://dash.cloudflare.com
2. Left sidebar → **R2 Object Storage**
3. Click **Create Bucket**
4. Name: `tws-blog-images`
5. Choose your nearest region
6. Click **Create Bucket**

### Step 2.2: Enable public access for R2

1. Go into the `tws-blog-images` bucket
2. Click **Settings** tab
3. Under **Public Access**, click **Allow Access**
4. Choose **R2.dev subdomain** (easiest) or add a custom domain
5. Copy the **public URL** — looks like `https://pub-xxxxxxxxx.r2.dev`

### Step 2.3: Create R2 API token

1. Go to **R2** → **Manage R2 API Tokens** (top right)
2. Click **Create API Token**
3. Token name: `tws-blog-uploads`
4. Permissions: **Object Read & Write**
5. Specify bucket: `tws-blog-images`
6. Click **Create API Token**
7. **COPY AND SAVE** these values (shown only once):
   - Access Key ID → this is your `R2_ACCESS_KEY`
   - Secret Access Key → this is your `R2_SECRET_KEY`
8. Note the **S3 API endpoint** at the top — looks like `https://<account-id>.r2.cloudflarestorage.com`

### Step 2.4: Update your .env file with R2 credentials

Edit `services/local-api/.env`:
```env
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<your-access-key-id>
R2_SECRET_KEY=<your-secret-access-key>
R2_BUCKET=tws-blog-images
R2_PUBLIC_URL=https://pub-xxxxxxxxx.r2.dev
```

### Step 2.5: Install Cloudflare Tunnel

```powershell
winget install Cloudflare.cloudflared
```

### Step 2.6: Authenticate cloudflared

```powershell
cloudflared tunnel login
```

This opens a browser. Select your Cloudflare account and authorize.

### Step 2.7: Create the tunnel

```powershell
cloudflared tunnel create tws-stream-processor
```

Output will show a **Tunnel ID** — save it.

### Step 2.8: Configure the tunnel

Create file `C:\Users\<YourUsername>\.cloudflared\config.yml`:

```yaml
tunnel: <your-tunnel-id>
credentials-file: C:\Users\<YourUsername>\.cloudflared\<your-tunnel-id>.json

ingress:
  - hostname: stream-api.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

Replace:
- `<your-tunnel-id>` with the ID from step 2.7
- `stream-api.yourdomain.com` with your desired subdomain (your domain must be on Cloudflare)

### Step 2.9: Add DNS route

```powershell
cloudflared tunnel route dns tws-stream-processor stream-api.yourdomain.com
```

### Step 2.10: Test the tunnel

Start the local service (3 terminals as in Step 1.8), then in a 4th terminal:

```powershell
cloudflared tunnel run tws-stream-processor
```

Test from any device:
```bash
curl https://stream-api.yourdomain.com/health -H "X-API-Key: <your-api-key>"
```

Should return the same health response as before. If it works, the tunnel is configured.

### Step 2.11: Install tunnel as Windows service (auto-start)

```powershell
cloudflared service install
```

This makes the tunnel start automatically on boot.

---

## Phase 3: Database + Blog Deployment

### Step 3.1: Create Neon Postgres database

1. Go to https://console.neon.tech
2. Click **Create Project**
3. Project name: `tws-blog`
4. Region: choose closest to you
5. Click **Create Project**
6. On the dashboard, copy the **connection string** — looks like:
   ```
   postgresql://neondb_owner:xxxxxx@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3.2: Push database schema

On your local machine:
```powershell
cd tws-stream-to-blog/blog
npm install
```

Create `blog/.env` file:
```env
DATABASE_URL=postgresql://neondb_owner:xxxxxx@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
PUBLISH_API_KEY=<generate-another-random-32-char-string>
```

Generate publish key:
```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Push the schema to Neon:
```powershell
cd blog
npx prisma db push
```

Expected output: `Your database is now in sync with your Prisma schema.`

### Step 3.3: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select `sidhantkisshor/tws-stream-to-blog`
4. **IMPORTANT** — Configure these settings:
   - **Root Directory**: click **Edit** → type `blog` → click **Continue**
   - **Framework Preset**: should auto-detect `Next.js`
5. Expand **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string from step 3.1 |
| `PUBLISH_API_KEY` | The random key you generated in step 3.2 |
| `NEXT_PUBLIC_SITE_URL` | `https://your-blog-domain.com` (or the Vercel URL for now) |

6. Click **Deploy**
7. Wait for build to complete (~2-3 minutes)

### Step 3.4: Verify the blog is live

Visit your Vercel deployment URL. You should see:
- "**TWS** Trading Insights" header in Burnt Amber + Deep Slate
- "No posts yet. Check back after the next live stream." message
- Warm White (#FAF8F5) background

### Step 3.5: Test the publish API

```bash
curl -X POST https://your-blog.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-publish-api-key>" \
  -d '{
    "videoId": "test1234567",
    "title": "Test Post - NIFTY Analysis",
    "hook": "A look at key NIFTY levels from today'\''s session",
    "seoDesc": "Trading analysis of NIFTY levels and setups discussed in today'\''s live stream",
    "heroImage": "https://placehold.co/1200x630/2C3539/C87533?text=TWS+Trading",
    "intro": "Today'\''s live stream covered several important NIFTY setups that traders should watch for in the coming sessions.",
    "sections": [{"heading": "Key Levels Discussed", "body": "The 19,500 level continues to act as strong resistance. We discussed how a break above this level with volume could trigger a move towards 19,800."}],
    "conclusion": "Keep these levels on your watchlist for tomorrow'\''s session. Risk management remains key.",
    "tags": ["NIFTY", "Technical Analysis"],
    "keywords": ["nifty analysis", "trading levels", "support resistance"]
  }'
```

Expected response:
```json
{"id": "clxxxx", "slug": "test-post-nifty-analysis-xxxxx", "url": "/posts/test-post-nifty-analysis-xxxxx"}
```

Visit the URL from the response on your Vercel deployment — you should see the full blog post with TWS branding.

### Step 3.6: Add custom domain (optional)

1. In Vercel project → **Settings** → **Domains**
2. Add your domain (e.g., `insights.twswealthos.com`)
3. Follow the DNS instructions shown

### Step 3.7: Update Next.js image domains

If your R2 public URL or custom domain is different from `*.r2.cloudflarestorage.com`, update `blog/next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "pub-xxxxxxxxx.r2.dev",  // your R2 public subdomain
    },
    {
      protocol: "https",
      hostname: "placehold.co",  // for testing
    },
  ],
},
```

Commit and push — Vercel will auto-redeploy.

---

## Phase 4: N8N Workflow Setup

### Step 4.1: Create the state store database

On your N8N host machine:
```bash
# Create the SQLite database
sqlite3 /path/to/n8n-data/tws-pipeline.db < /path/to/tws-stream-to-blog/n8n/setup-state-store.sql
```

If your N8N is cloud-hosted, you can use the N8N SQLite node to run the CREATE TABLE query manually.

### Step 4.2: Set up N8N credentials

Go to your N8N instance → **Settings** → **Credentials** and create:

1. **YouTube API Key** (type: HTTP Query Auth)
   - Parameter Name: `key`
   - Value: your YouTube Data API v3 key
   - Name it: `YouTube API Key`

2. **Local API Key** (type: HTTP Header Auth)
   - Header Name: `X-API-Key`
   - Value: the API_KEY from your `services/local-api/.env`
   - Name it: `Local API Key`

3. **OpenAI API Key** (type: HTTP Header Auth)
   - Header Name: `Authorization`
   - Value: `Bearer sk-xxxxxxxxxxxx`
   - Name it: `OpenAI API Key`

4. **Anthropic API Key** (type: HTTP Header Auth)
   - Header Name: `x-api-key`
   - Value: `sk-ant-xxxxxxxxxxxx`
   - Name it: `Anthropic API Key`

5. **Tavily API Key** (type: HTTP Header Auth)
   - Header Name: `Authorization`
   - Value: `Bearer tvly-xxxxxxxxxxxx`
   - Name it: `Tavily API Key`

6. **Blog Publish Key** (type: HTTP Header Auth)
   - Header Name: `X-API-Key`
   - Value: the PUBLISH_API_KEY from your `blog/.env`
   - Name it: `Blog Publish API Key`

### Step 4.3: Set up N8N variables

Go to **Settings** → **Variables** and create:

| Variable | Value |
|----------|-------|
| `LIVE_VIDEO_ID` | Your YouTube live stream video ID (see note below) |
| `LOCAL_API_URL` | `https://stream-api.yourdomain.com` |
| `BLOG_URL` | `https://your-blog.vercel.app` (or custom domain) |
| `DISCORD_WEBHOOK_URL` | Your Discord webhook URL (see Step 4.4) |

**Finding your LIVE_VIDEO_ID:**
- Go to YouTube Studio → **Content** → **Live** tab
- Your recurring live stream has a fixed video ID
- OR: check the URL when you go live — the `v=` parameter is the video ID
- This value changes each time you create a new stream. Update it before going live, or automate with the YouTube API `search.list` (one-time call to find the latest live video)

### Step 4.4: Create Discord webhook

1. In your Discord server, go to a channel → **Settings** → **Integrations** → **Webhooks**
2. Click **New Webhook**
3. Name it: `TWS Blog Pipeline`
4. Copy the webhook URL
5. Paste it as the `DISCORD_WEBHOOK_URL` variable in N8N

### Step 4.5: Import workflows (in this order)

For each workflow file in the `n8n/` directory:

1. In N8N → **Workflows** → **Add Workflow** → **Import from File**
2. Import in this exact order:
   - `publish.json`
   - `llm-pipeline.json`
   - `process-stream.json`
   - `manual-transcript-to-blog.json`

### Step 4.6: Update credential references in each workflow

After importing, open each workflow and update the credential references:

For **every HTTP Request node** that has `"id": "xxx_CREDENTIAL_ID"`:
1. Click the node
2. Go to **Authentication** section
3. Select the matching credential you created in Step 4.2

This is tedious but only needs to be done once. Go through each workflow:
- **publish.json**: Blog Publish Key
- **llm-pipeline.json**: OpenAI API Key, Tavily API Key, Anthropic API Key
- **process-stream.json**: Local API Key, OpenAI API Key, YouTube API Key
- **manual-transcript-to-blog.json**: Pipeline Postgres

### Step 4.7: Update SQLite node paths

In **manual-transcript-to-blog.json** and **publish.json**, each SQLite node needs the database path:
1. Click each SQLite node
2. Set the database path to `/path/to/n8n-data/tws-pipeline.db`

### Step 4.8: Get webhook URLs and update variables

1. **Activate** the `TWS Publish Blog` workflow → copy its webhook URL
2. **Activate** the `TWS LLM Pipeline` workflow → copy its webhook URL
3. **Activate** the `TWS Process Stream` workflow → copy its webhook URL
4. Go to **Settings** → **Variables** and add:

| Variable | Value |
|----------|-------|
| `PROCESS_WEBHOOK_URL` | Webhook URL from `TWS Process Stream` |
| `LLM_PIPELINE_WEBHOOK_URL` | Webhook URL from `TWS LLM Pipeline` |
| `PUBLISH_WEBHOOK_URL` | Webhook URL from `TWS Publish Blog` |

5. **Activate** the `TWS Content — Manual Transcript → Blog` workflow last, then open its form URL — that form is how every run is started.

> The scheduled `TWS Stream Detection` workflow was removed on 2026-07-27. Nothing polls
> YouTube any more; the pipeline only runs when someone submits the form above.

---

## Phase 5: Windows Auto-Start

### Step 5.1: Edit the startup script

Edit `services/local-api/scripts/start.bat` — update the path:

```bat
@echo off
cd /d C:\path\to\tws-stream-to-blog\services\local-api
call .venv\Scripts\activate
start /B redis-server
timeout /t 3
start /B python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
start /B python -m arq src.worker.WorkerSettings
echo TWS Stream Processor started.
```

### Step 5.2: Create Windows Task Scheduler entry

Open PowerShell as Administrator:
```powershell
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"C:\path\to\tws-stream-to-blog\services\local-api\scripts\start.bat`""
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName "TWS Stream Processor" -Action $action -Trigger $trigger -RunLevel Highest -Description "Start TWS Stream Processor on boot"
```

### Step 5.3: Disable sleep mode

```powershell
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
```

---

## Phase 6: End-to-End Test

### Step 6.1: Verify all services are running

Run these checks:

```bash
# 1. Local API health (through tunnel)
curl https://stream-api.yourdomain.com/health -H "X-API-Key: <key>"
# Expected: {"status": "ok", ...}

# 2. Blog is live
curl -s https://your-blog.vercel.app | head -20
# Expected: HTML with "TWS Trading Insights"

# 3. N8N workflows are active
# Check N8N UI — all 4 workflows should show green "Active" status
```

### Step 6.2: Test with a short video

Pick a short public YouTube video (1-2 minutes). We'll run the pipeline manually:

```bash
# Trigger transcription
curl -X POST https://stream-api.yourdomain.com/transcribe \
  -H "X-API-Key: <your-local-api-key>" \
  -H "Content-Type: application/json" \
  -d '{"video_id": "dQw4w9WgXcQ"}'
```

Note the `job_id` from the response, then poll:
```bash
curl "https://stream-api.yourdomain.com/status/<job_id>" \
  -H "X-API-Key: <your-local-api-key>"
```

Keep polling every 30 seconds until `status` is `complete`. The `result.full_text` field will contain the transcript.

### Step 6.3: Test the full N8N pipeline

1. In N8N, open the `TWS Process Stream` workflow
2. Click **Test Workflow**
3. Send a test webhook with:
   ```json
   {"video_id": "dQw4w9WgXcQ"}
   ```
4. Watch the workflow execute through each node
5. Check your blog site for the new post
6. Check Discord for the success notification

### Step 6.4: Test an end-to-end run from the form

1. Open the form URL from `TWS Content — Manual Transcript → Blog`
2. Paste a YouTube video URL (or bare 11-character ID) and pick the channel
3. Paste a transcript of at least 1000 characters, then submit
4. Wait ~10 minutes for generation
5. Check:
   - Telegram notification received?
   - Blog post published?
   - State store updated? (`SELECT * FROM pipeline_runs;`)

---

## Troubleshooting

### "yt-dlp: command not found"
Ensure yt-dlp is in your system PATH. Reinstall: `pip install yt-dlp`

### Whisper runs slow / uses CPU
Check CUDA is available:
```python
python -c "import torch; print(torch.cuda.is_available())"
```
If `False`, reinstall PyTorch with CUDA: `pip install torch --index-url https://download.pytorch.org/whl/cu121`

### Cloudflare Tunnel not connecting
```powershell
cloudflared tunnel info tws-stream-processor
cloudflared tunnel run tws-stream-processor --loglevel debug
```

### N8N "Credential not found" errors
Re-link credentials in each HTTP Request node after importing workflows.

### Blog returns 500 on publish
Check Vercel logs: **Project** → **Deployments** → click latest → **Functions** tab.
Common cause: `DATABASE_URL` not set in Vercel environment variables.

### State store "table not found"
Re-run the SQL setup: `sqlite3 /path/to/tws-pipeline.db < n8n/setup-state-store.sql`

---

## Maintenance

### Updating yt-dlp (do this weekly)
```powershell
pip install --upgrade yt-dlp
```
YouTube changes frequently — outdated yt-dlp will fail to download.

### Cleaning up downloads
The `services/local-api/downloads/` directory grows with each processed stream. Periodically delete old files:
```powershell
# Delete downloads older than 7 days
forfiles /p "C:\path\to\services\local-api\downloads" /d -7 /c "cmd /c rd /s /q @path"
```

### Monitoring costs
Check the `pipeline_runs` SQLite table for `llm_cost_usd` column. Run:
```sql
SELECT SUM(llm_cost_usd) as total_cost, COUNT(*) as streams_processed FROM pipeline_runs WHERE status='complete';
```

### Updating the LIVE_VIDEO_ID
Each time you create a new recurring live stream on YouTube, update the `LIVE_VIDEO_ID` variable in N8N Settings → Variables.
