# Infrastructure Setup Guide

## Task 19: Cloudflare R2 Bucket

### Steps

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2 Object Storage** > **Create Bucket**
3. Name: `tws-blog-images`
4. Location: choose closest region

### Enable Public Access

1. Go to bucket **Settings** > **Public Access**
2. Either:
   - Enable R2.dev subdomain (quick, free), OR
   - Add a custom domain (e.g., `images.yourdomain.com`)

### Create API Token

1. Go to **R2** > **Manage R2 API Tokens** > **Create API Token**
2. Permissions: **Object Read & Write**
3. Specify bucket: `tws-blog-images`
4. Copy and save:
   - **Access Key ID** → `R2_ACCESS_KEY`
   - **Secret Access Key** → `R2_SECRET_KEY`
   - **Endpoint URL** → `https://<account-id>.r2.cloudflarestorage.com`

### Configure

Add these to `services/local-api/.env`:
```
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<your-access-key>
R2_SECRET_KEY=<your-secret-key>
R2_BUCKET=tws-blog-images
```

---

## Task 20: Cloudflare Tunnel

### Install cloudflared (Windows)

```powershell
winget install Cloudflare.cloudflared
```

### Authenticate

```bash
cloudflared tunnel login
```

This opens a browser to authenticate with your Cloudflare account.

### Create Tunnel

```bash
cloudflared tunnel create tws-stream-processor
```

Note the **Tunnel ID** from the output.

### Configure Tunnel

Create `C:\Users\<you>\.cloudflared\config.yml`:

```yaml
tunnel: <tunnel-id>
credentials-file: C:\Users\<you>\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: stream-api.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

### Add DNS Route

```bash
cloudflared tunnel route dns tws-stream-processor stream-api.yourdomain.com
```

### Install as Windows Service

```powershell
cloudflared service install
```

This makes the tunnel start automatically on boot.

### Verify

```bash
curl https://stream-api.yourdomain.com/health -H "X-API-Key: your-key"
```

Should return `{"status": "ok", ...}`.

### Optional: Cloudflare Access (extra security)

1. Go to **Zero Trust** > **Access** > **Service Auth**
2. Create a **Service Token**
3. Add an **Access Policy** for `stream-api.yourdomain.com` requiring the service token
4. Add `CF-Access-Client-Id` and `CF-Access-Client-Secret` headers to N8N HTTP nodes

---

## Task 21: Vercel Deployment

### Prerequisites

- GitHub repo: `sidhantkisshor/tws-stream-to-blog`
- Neon Postgres database created at [neon.tech](https://neon.tech)

### Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project: `tws-blog`
3. Copy the **connection string** (looks like `postgresql://user:pass@host/dbname?sslmode=require`)

### Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `sidhantkisshor/tws-stream-to-blog`
3. Set **Root Directory** to `blog`
4. Set **Framework Preset** to `Next.js`

### Environment Variables

Set these in Vercel project settings:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `PUBLISH_API_KEY` | Generate a random 32-char secret (e.g., `openssl rand -hex 32`) |
| `NEXT_PUBLIC_SITE_URL` | Your blog domain (e.g., `https://insights.twswealthos.com`) |

### Custom Domain (optional)

1. Go to project **Settings** > **Domains**
2. Add your custom domain
3. Follow DNS instructions to point it to Vercel

### Push Database Schema

After setting DATABASE_URL, run locally:

```bash
cd blog
DATABASE_URL="your-neon-connection-string" npx prisma db push
```

### Verify

- Visit your Vercel deployment URL
- Should see "TWS Trading Insights" with "No posts yet" message
- Test publish API:

```bash
curl -X POST https://your-blog.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-publish-key" \
  -d '{
    "videoId": "test123test",
    "title": "Test Post",
    "hook": "This is a test",
    "seoDesc": "Test description",
    "heroImage": "https://placehold.co/1200x630",
    "intro": "Test intro paragraph.",
    "sections": [{"heading": "Section 1", "body": "Content here"}],
    "conclusion": "Test conclusion.",
    "tags": ["test"],
    "keywords": ["test"]
  }'
```

Should return `{"id": "...", "slug": "test-post-...", "url": "/posts/test-post-..."}`.

---

## Task 22: End-to-End Test

Once all infrastructure is set up, test the full pipeline:

1. **Start local services:**
   ```bash
   cd services/local-api
   redis-server &
   uvicorn src.main:app --host 0.0.0.0 --port 8000 &
   python -m arq src.worker.WorkerSettings &
   ```

2. **Test health through tunnel:**
   ```bash
   curl https://stream-api.yourdomain.com/health -H "X-API-Key: your-key"
   ```

3. **Test transcription with a short video (~1 min):**
   ```bash
   curl -X POST https://stream-api.yourdomain.com/transcribe \
     -H "X-API-Key: your-key" \
     -H "Content-Type: application/json" \
     -d '{"video_id": "dQw4w9WgXcQ"}'
   ```
   Then poll the returned job_id until complete.

4. **Manually trigger N8N pipeline** with test transcript data.

5. **Verify blog post** appears on your Vercel site.

### Windows Task Scheduler (auto-start)

```powershell
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"C:\path\to\services\local-api\scripts\start.bat`""
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName "TWS Stream Processor" -Action $action -Trigger $trigger -RunLevel Highest -Description "Start TWS Stream Processor on boot"
```
