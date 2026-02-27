# TWS Live Stream to Blog — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an automated pipeline that converts TWS trading live streams into branded, SEO-friendly blog posts with chart screenshots and AI-generated hero images.

**Architecture:** N8N orchestrates the workflow, a local FastAPI service handles GPU-intensive work (Whisper transcription, video frame extraction), cloud fallbacks handle offline scenarios. A Next.js blog site on Vercel with Neon Postgres serves the content. Cloudflare R2 stores images. Multi-model LLM chain (GPT-4o-mini, GPT-5.2, Sonnet 4.6, Tavily, Nano Banana 2) generates the blog content.

**Tech Stack:** Python 3.11+, FastAPI, faster-whisper, OpenCV, ARQ, Redis, yt-dlp, Next.js 15, React 19, Prisma, Neon Postgres, Tailwind CSS, Cloudflare R2, N8N

---

## Workstream Overview

This project has **4 independent workstreams** that can be built in parallel, plus a final integration phase:

1. **Local FastAPI Service** (Tasks 1-6) — Python processing server
2. **Blog Website** (Tasks 7-13) — Next.js frontend + API
3. **N8N Workflow** (Tasks 14-18) — Orchestration pipeline
4. **Infrastructure** (Tasks 19-21) — Cloudflare Tunnel, R2, deployment
5. **Integration & Testing** (Tasks 22-24) — End-to-end wiring

---

## Workstream 1: Local FastAPI Service

### Task 1: Project Scaffold & Dependencies

**Files:**
- Create: `services/local-api/pyproject.toml`
- Create: `services/local-api/src/__init__.py`
- Create: `services/local-api/src/main.py`
- Create: `services/local-api/src/config.py`
- Create: `services/local-api/.env.example`
- Create: `services/local-api/.gitignore`

**Step 1: Initialize Python project**

```bash
cd services/local-api
```

`pyproject.toml`:
```toml
[project]
name = "tws-stream-processor"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.34.0",
    "faster-whisper>=1.1.0",
    "yt-dlp>=2025.1.0",
    "opencv-python-headless>=4.10.0",
    "arq>=0.26.0",
    "redis>=5.2.0",
    "boto3>=1.35.0",
    "pydantic-settings>=2.7.0",
    "httpx>=0.28.0",
]

[project.optional-dependencies]
dev = ["pytest>=8.0", "pytest-asyncio>=0.24", "httpx>=0.28.0"]
```

**Step 2: Create config**

`src/config.py`:
```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    api_key: str
    youtube_channel_id: str
    r2_endpoint: str
    r2_access_key: str
    r2_secret_key: str
    r2_bucket: str
    redis_url: str = "redis://localhost:6379"
    whisper_model: str = "large-v3"
    whisper_device: str = "cuda"
    download_dir: str = "./downloads"

    model_config = {"env_file": ".env"}


settings = Settings()
```

**Step 3: Create minimal main.py**

`src/main.py`:
```python
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from src.config import settings

app = FastAPI(title="TWS Stream Processor")

api_key_header = APIKeyHeader(name="X-API-Key")


async def verify_api_key(key: str = Security(api_key_header)):
    if key != settings.api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return key
```

**Step 4: Create .env.example and .gitignore**

`.env.example`:
```
API_KEY=your-secret-api-key-here
YOUTUBE_CHANNEL_ID=your-channel-id
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=tws-blog-images
REDIS_URL=redis://localhost:6379
WHISPER_MODEL=large-v3
WHISPER_DEVICE=cuda
DOWNLOAD_DIR=./downloads
```

`.gitignore`:
```
.env
downloads/
__pycache__/
*.pyc
.venv/
```

**Step 5: Install dependencies and verify**

```bash
pip install -e ".[dev]"
uvicorn src.main:app --host 0.0.0.0 --port 8000
# Verify: GET http://localhost:8000/docs returns Swagger UI
```

**Step 6: Commit**

```bash
git add services/local-api/
git commit -m "feat: scaffold local FastAPI service with config and auth"
```

---

### Task 2: Health Endpoint

**Files:**
- Create: `services/local-api/tests/test_health.py`
- Modify: `services/local-api/src/main.py`

**Step 1: Write the failing test**

`tests/test_health.py`:
```python
import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app


@pytest.fixture
def api_key():
    return "test-key"


@pytest.fixture
async def client(api_key, monkeypatch):
    monkeypatch.setenv("API_KEY", api_key)
    monkeypatch.setenv("YOUTUBE_CHANNEL_ID", "test-channel")
    monkeypatch.setenv("R2_ENDPOINT", "http://fake")
    monkeypatch.setenv("R2_ACCESS_KEY", "fake")
    monkeypatch.setenv("R2_SECRET_KEY", "fake")
    monkeypatch.setenv("R2_BUCKET", "fake")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_health_returns_ok(client, api_key):
    resp = await client.get("/health", headers={"X-API-Key": api_key})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "yt_dlp" in data


@pytest.mark.asyncio
async def test_health_rejects_bad_key(client):
    resp = await client.get("/health", headers={"X-API-Key": "wrong"})
    assert resp.status_code == 403
```

**Step 2: Run test to verify it fails**

```bash
cd services/local-api
pytest tests/test_health.py -v
# Expected: FAIL — no /health route
```

**Step 3: Implement health endpoint**

Add to `src/main.py`:
```python
import shutil
import subprocess


@app.get("/health")
async def health(key: str = Depends(verify_api_key)):
    # Check yt-dlp is available
    yt_dlp_ok = shutil.which("yt-dlp") is not None
    yt_dlp_version = None
    if yt_dlp_ok:
        result = subprocess.run(["yt-dlp", "--version"], capture_output=True, text=True)
        yt_dlp_version = result.stdout.strip()

    return {
        "status": "ok",
        "yt_dlp": {"available": yt_dlp_ok, "version": yt_dlp_version},
    }
```

**Step 4: Run test to verify it passes**

```bash
pytest tests/test_health.py -v
# Expected: PASS
```

**Step 5: Commit**

```bash
git add services/local-api/tests/test_health.py services/local-api/src/main.py
git commit -m "feat: add health endpoint with yt-dlp check"
```

---

### Task 3: Video ID Validation & YouTube Helpers

**Files:**
- Create: `services/local-api/src/youtube.py`
- Create: `services/local-api/tests/test_youtube.py`

**Step 1: Write the failing test**

`tests/test_youtube.py`:
```python
import pytest
from src.youtube import validate_video_id, download_audio, download_video


def test_valid_video_id():
    assert validate_video_id("dQw4w9WgXcQ") is True


def test_invalid_video_id_too_short():
    assert validate_video_id("abc") is False


def test_invalid_video_id_bad_chars():
    assert validate_video_id("dQw4w9WgXc!") is False


def test_invalid_video_id_empty():
    assert validate_video_id("") is False
```

**Step 2: Run test to verify it fails**

```bash
pytest tests/test_youtube.py -v
# Expected: FAIL — module not found
```

**Step 3: Implement youtube helpers**

`src/youtube.py`:
```python
import re
import subprocess
import os
from pathlib import Path
from src.config import settings

VIDEO_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{11}$")


def validate_video_id(video_id: str) -> bool:
    return bool(VIDEO_ID_PATTERN.match(video_id))


def download_audio(video_id: str) -> Path:
    """Download audio-only from YouTube video. Returns path to mp3 file."""
    out_dir = Path(settings.download_dir) / video_id
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "audio.mp3"

    if out_path.exists():
        return out_path

    subprocess.run(
        [
            "yt-dlp",
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            "-o", str(out_path),
            f"https://www.youtube.com/watch?v={video_id}",
        ],
        check=True,
        capture_output=True,
    )
    return out_path


def download_video(video_id: str) -> Path:
    """Download 720p video for chart extraction. Returns path to video file."""
    out_dir = Path(settings.download_dir) / video_id
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "video.mp4"

    if out_path.exists():
        return out_path

    subprocess.run(
        [
            "yt-dlp",
            "-f", "bestvideo[height<=720]+bestaudio/best[height<=720]",
            "--merge-output-format", "mp4",
            "-o", str(out_path),
            f"https://www.youtube.com/watch?v={video_id}",
        ],
        check=True,
        capture_output=True,
    )
    return out_path
```

**Step 4: Run test to verify it passes**

```bash
pytest tests/test_youtube.py -v
# Expected: PASS (validation tests only — download tests need integration setup)
```

**Step 5: Commit**

```bash
git add services/local-api/src/youtube.py services/local-api/tests/test_youtube.py
git commit -m "feat: add video ID validation and yt-dlp download helpers"
```

---

### Task 4: Whisper Transcription Worker

**Files:**
- Create: `services/local-api/src/transcribe.py`
- Create: `services/local-api/tests/test_transcribe.py`

**Step 1: Write the failing test**

`tests/test_transcribe.py`:
```python
import pytest
from unittest.mock import patch, MagicMock
from src.transcribe import transcribe_audio


@patch("src.transcribe.WhisperModel")
def test_transcribe_returns_segments(mock_whisper_cls):
    mock_model = MagicMock()
    mock_model.transcribe.return_value = (
        [
            MagicMock(start=0.0, end=5.0, text="Hello everyone, welcome to the stream."),
            MagicMock(start=5.0, end=10.0, text="Today we're looking at NIFTY levels."),
        ],
        MagicMock(language="en", language_probability=0.98),
    )
    mock_whisper_cls.return_value = mock_model

    result = transcribe_audio("/fake/audio.mp3")

    assert len(result["segments"]) == 2
    assert result["segments"][0]["text"] == "Hello everyone, welcome to the stream."
    assert result["segments"][0]["start"] == 0.0
    assert result["full_text"].startswith("Hello everyone")
    assert result["language"] == "en"
```

**Step 2: Run test to verify it fails**

```bash
pytest tests/test_transcribe.py -v
# Expected: FAIL — module not found
```

**Step 3: Implement transcription**

`src/transcribe.py`:
```python
from faster_whisper import WhisperModel
from src.config import settings

_model = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            settings.whisper_model,
            device=settings.whisper_device,
            compute_type="float16",
        )
    return _model


def transcribe_audio(audio_path: str) -> dict:
    """Transcribe audio file using faster-whisper. Returns segments + full text."""
    model = get_model()
    segments_iter, info = model.transcribe(
        audio_path,
        beam_size=5,
        language=None,  # auto-detect
        vad_filter=True,
    )

    segments = []
    full_text_parts = []
    for seg in segments_iter:
        segments.append({
            "start": seg.start,
            "end": seg.end,
            "text": seg.text.strip(),
        })
        full_text_parts.append(seg.text.strip())

    return {
        "segments": segments,
        "full_text": " ".join(full_text_parts),
        "language": info.language,
        "language_probability": info.language_probability,
    }
```

**Step 4: Run test to verify it passes**

```bash
pytest tests/test_transcribe.py -v
# Expected: PASS
```

**Step 5: Commit**

```bash
git add services/local-api/src/transcribe.py services/local-api/tests/test_transcribe.py
git commit -m "feat: add Whisper transcription with faster-whisper"
```

---

### Task 5: Chart Frame Extraction + R2 Upload

**Files:**
- Create: `services/local-api/src/charts.py`
- Create: `services/local-api/src/storage.py`
- Create: `services/local-api/tests/test_charts.py`

**Step 1: Write the failing test**

`tests/test_charts.py`:
```python
import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from src.charts import detect_scene_changes


def test_detect_scene_changes_finds_transitions():
    # Create two very different frames to simulate a scene change
    frame1 = np.zeros((720, 1280, 3), dtype=np.uint8)  # black
    frame2 = np.ones((720, 1280, 3), dtype=np.uint8) * 255  # white
    frame3 = np.zeros((720, 1280, 3), dtype=np.uint8)  # black again

    frames = [frame1, frame2, frame3]
    timestamps = [0.0, 10.0, 20.0]

    changes = detect_scene_changes(frames, timestamps, threshold=30.0)

    assert len(changes) >= 1
    assert changes[0]["timestamp"] == 10.0
```

**Step 2: Run test to verify it fails**

```bash
pytest tests/test_charts.py -v
# Expected: FAIL — module not found
```

**Step 3: Implement chart extraction and R2 upload**

`src/storage.py`:
```python
import boto3
from src.config import settings


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.r2_endpoint,
        aws_access_key_id=settings.r2_access_key,
        aws_secret_access_key=settings.r2_secret_key,
    )


def upload_to_r2(file_path: str, key: str, content_type: str = "image/jpeg") -> str:
    """Upload file to R2 and return the public URL."""
    client = get_r2_client()
    client.upload_file(
        file_path,
        settings.r2_bucket,
        key,
        ExtraArgs={"ContentType": content_type},
    )
    return f"{settings.r2_endpoint}/{settings.r2_bucket}/{key}"
```

`src/charts.py`:
```python
import cv2
import numpy as np
import os
from pathlib import Path
from src.storage import upload_to_r2


def detect_scene_changes(
    frames: list[np.ndarray],
    timestamps: list[float],
    threshold: float = 30.0,
) -> list[dict]:
    """Detect scene changes between consecutive frames using mean absolute difference."""
    changes = []
    for i in range(1, len(frames)):
        diff = cv2.absdiff(frames[i - 1], frames[i])
        mean_diff = np.mean(diff)
        if mean_diff > threshold:
            changes.append({
                "timestamp": timestamps[i],
                "score": float(mean_diff),
            })
    return changes


def extract_chart_frames(
    video_path: str,
    video_id: str,
    sample_interval: float = 5.0,
    threshold: float = 30.0,
    max_frames: int = 20,
) -> list[dict]:
    """Extract chart/scene-change frames from video, upload to R2, return URLs."""
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(fps * sample_interval)

    frames = []
    timestamps = []
    frame_idx = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % frame_interval == 0:
            frames.append(frame)
            timestamps.append(frame_idx / fps)
        frame_idx += 1

    cap.release()

    changes = detect_scene_changes(frames, timestamps, threshold)
    # Take top N by score
    changes.sort(key=lambda x: x["score"], reverse=True)
    top_changes = changes[:max_frames]
    top_changes.sort(key=lambda x: x["timestamp"])

    # Save and upload frames at those timestamps
    results = []
    out_dir = Path(f"./downloads/{video_id}/charts")
    out_dir.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    for change in top_changes:
        cap.set(cv2.CAP_PROP_POS_MSEC, change["timestamp"] * 1000)
        ret, frame = cap.read()
        if not ret:
            continue

        filename = f"chart_{int(change['timestamp'])}s.jpg"
        local_path = str(out_dir / filename)
        cv2.imwrite(local_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 90])

        r2_key = f"{video_id}/charts/{filename}"
        url = upload_to_r2(local_path, r2_key)
        results.append({
            "timestamp": change["timestamp"],
            "url": url,
            "score": change["score"],
        })

    cap.release()
    return results
```

**Step 4: Run test to verify it passes**

```bash
pytest tests/test_charts.py -v
# Expected: PASS
```

**Step 5: Commit**

```bash
git add services/local-api/src/charts.py services/local-api/src/storage.py services/local-api/tests/test_charts.py
git commit -m "feat: add chart frame extraction with scene detection and R2 upload"
```

---

### Task 6: Async Job Queue + API Endpoints

**Files:**
- Create: `services/local-api/src/worker.py`
- Create: `services/local-api/src/jobs.py`
- Modify: `services/local-api/src/main.py`
- Create: `services/local-api/tests/test_api.py`

**Step 1: Write the failing test**

`tests/test_api.py`:
```python
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from src.main import app


@pytest.fixture
def api_key():
    return "test-key"


@pytest.fixture
async def client(api_key, monkeypatch):
    monkeypatch.setenv("API_KEY", api_key)
    monkeypatch.setenv("YOUTUBE_CHANNEL_ID", "UCtest123")
    monkeypatch.setenv("R2_ENDPOINT", "http://fake")
    monkeypatch.setenv("R2_ACCESS_KEY", "fake")
    monkeypatch.setenv("R2_SECRET_KEY", "fake")
    monkeypatch.setenv("R2_BUCKET", "fake")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
@patch("src.main.enqueue_transcription", new_callable=AsyncMock)
async def test_transcribe_returns_job_id(mock_enqueue, client, api_key):
    mock_enqueue.return_value = "job-123"
    resp = await client.post(
        "/transcribe",
        json={"video_id": "dQw4w9WgXcQ"},
        headers={"X-API-Key": api_key},
    )
    assert resp.status_code == 202
    assert resp.json()["job_id"] == "job-123"


@pytest.mark.asyncio
async def test_transcribe_rejects_invalid_video_id(client, api_key):
    resp = await client.post(
        "/transcribe",
        json={"video_id": "invalid!"},
        headers={"X-API-Key": api_key},
    )
    assert resp.status_code == 422
```

**Step 2: Run test to verify it fails**

```bash
pytest tests/test_api.py -v
# Expected: FAIL — no /transcribe route
```

**Step 3: Implement job queue and endpoints**

`src/jobs.py`:
```python
import uuid

# In-memory job store (ARQ handles persistence via Redis, this is the status cache)
_jobs: dict[str, dict] = {}


def create_job() -> str:
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "pending", "result": None, "error": None}
    return job_id


def update_job(job_id: str, status: str, result: dict | None = None, error: str | None = None):
    if job_id in _jobs:
        _jobs[job_id] = {"status": status, "result": result, "error": error}


def get_job(job_id: str) -> dict | None:
    return _jobs.get(job_id)
```

`src/worker.py`:
```python
from arq import create_pool
from arq.connections import RedisSettings
from src.config import settings
from src.youtube import download_audio, download_video
from src.transcribe import transcribe_audio
from src.charts import extract_chart_frames
from src.jobs import update_job


async def transcribe_task(ctx, job_id: str, video_id: str):
    """ARQ worker task: download audio + transcribe."""
    try:
        update_job(job_id, "downloading")
        audio_path = download_audio(video_id)

        update_job(job_id, "transcribing")
        result = transcribe_audio(str(audio_path))

        update_job(job_id, "complete", result=result)
    except Exception as e:
        update_job(job_id, "failed", error=str(e))


async def extract_charts_task(ctx, job_id: str, video_id: str):
    """ARQ worker task: download video + extract chart frames."""
    try:
        update_job(job_id, "downloading")
        video_path = download_video(video_id)

        update_job(job_id, "extracting")
        charts = extract_chart_frames(str(video_path), video_id)

        update_job(job_id, "complete", result={"charts": charts})
    except Exception as e:
        update_job(job_id, "failed", error=str(e))


class WorkerSettings:
    functions = [transcribe_task, extract_charts_task]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    max_jobs = 2
    job_timeout = 3600  # 1 hour max per job
```

Update `src/main.py` — add the API endpoints:
```python
import re
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, field_validator
from src.config import settings
from src.jobs import create_job, get_job

app = FastAPI(title="TWS Stream Processor")

api_key_header = APIKeyHeader(name="X-API-Key")


async def verify_api_key(key: str = Security(api_key_header)):
    if key != settings.api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return key


class TranscribeRequest(BaseModel):
    video_id: str

    @field_validator("video_id")
    @classmethod
    def validate_video_id(cls, v: str) -> str:
        if not re.match(r"^[A-Za-z0-9_-]{11}$", v):
            raise ValueError("Invalid YouTube video ID format")
        return v


class ExtractChartsRequest(BaseModel):
    video_id: str

    @field_validator("video_id")
    @classmethod
    def validate_video_id(cls, v: str) -> str:
        if not re.match(r"^[A-Za-z0-9_-]{11}$", v):
            raise ValueError("Invalid YouTube video ID format")
        return v


# Will be replaced with actual ARQ pool in startup
_arq_pool = None


async def enqueue_transcription(video_id: str) -> str:
    job_id = create_job()
    if _arq_pool:
        await _arq_pool.enqueue_job("transcribe_task", job_id, video_id)
    return job_id


async def enqueue_chart_extraction(video_id: str) -> str:
    job_id = create_job()
    if _arq_pool:
        await _arq_pool.enqueue_job("extract_charts_task", job_id, video_id)
    return job_id


import shutil
import subprocess


@app.get("/health")
async def health(key: str = Depends(verify_api_key)):
    yt_dlp_ok = shutil.which("yt-dlp") is not None
    yt_dlp_version = None
    if yt_dlp_ok:
        result = subprocess.run(["yt-dlp", "--version"], capture_output=True, text=True)
        yt_dlp_version = result.stdout.strip()
    return {
        "status": "ok",
        "yt_dlp": {"available": yt_dlp_ok, "version": yt_dlp_version},
    }


@app.post("/transcribe", status_code=202)
async def transcribe(req: TranscribeRequest, key: str = Depends(verify_api_key)):
    job_id = await enqueue_transcription(req.video_id)
    return {"job_id": job_id}


@app.post("/extract-charts", status_code=202)
async def extract_charts(req: ExtractChartsRequest, key: str = Depends(verify_api_key)):
    job_id = await enqueue_chart_extraction(req.video_id)
    return {"job_id": job_id}


@app.get("/status/{job_id}")
async def job_status(job_id: str, key: str = Depends(verify_api_key)):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, **job}
```

**Step 4: Run tests to verify they pass**

```bash
pytest tests/ -v
# Expected: ALL PASS
```

**Step 5: Commit**

```bash
git add services/local-api/src/ services/local-api/tests/
git commit -m "feat: add async job queue with transcribe and chart extraction endpoints"
```

---

## Workstream 2: Blog Website (Next.js)

### Task 7: Next.js Project Scaffold

**Files:**
- Create: `blog/` (Next.js project root)

**Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest blog --typescript --tailwind --app --src-dir --eslint --import-alias "@/*"
cd blog
```

**Step 2: Install additional dependencies**

```bash
npm install prisma @prisma/client
npm install -D @types/node
npx prisma init
```

**Step 3: Clean default files**

Remove default Next.js boilerplate content from `src/app/page.tsx` and `src/app/globals.css`. Keep Tailwind directives.

**Step 4: Commit**

```bash
git add blog/
git commit -m "feat: scaffold Next.js blog project with Tailwind and Prisma"
```

---

### Task 8: Prisma Schema + Database Setup

**Files:**
- Modify: `blog/prisma/schema.prisma`
- Create: `blog/.env.example`

**Step 1: Define Prisma schema**

`blog/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Post {
  id          String   @id @default(cuid())
  videoId     String   @unique
  title       String
  slug        String   @unique
  hook        String
  seoDesc     String
  heroImage   String
  intro       String   @db.Text
  sections    Json
  conclusion  String   @db.Text
  tags        String[]
  keywords    String[]
  publishedAt DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([publishedAt(sort: Desc)])
  @@index([tags])
}
```

**Step 2: Set up .env.example**

```
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
PUBLISH_API_KEY=your-secret-publish-key
```

**Step 3: Generate Prisma client and push schema**

```bash
cd blog
# Set DATABASE_URL in .env to your Neon connection string
npx prisma db push
npx prisma generate
```

**Step 4: Commit**

```bash
git add blog/prisma/ blog/.env.example
git commit -m "feat: add Prisma schema for blog posts with Neon Postgres"
```

---

### Task 9: TWS Brand Theme + Tailwind Config

**Files:**
- Modify: `blog/tailwind.config.ts`
- Modify: `blog/src/app/globals.css`
- Modify: `blog/src/app/layout.tsx`

**Step 1: Configure Tailwind with TWS brand colors**

`blog/tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "deep-slate": "#2C3539",
        "burnt-amber": "#C87533",
        "brushed-gold": "#B8956A",
        "warm-white": "#FAF8F5",
        "wealth-teal": "#0A8D7A",
      },
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"],
        instrument: ["Instrument Serif", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Set up global styles**

`blog/src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-warm-white text-deep-slate font-satoshi;
  }

  h1, h2, h3 {
    @apply font-instrument;
  }

  a {
    @apply text-wealth-teal hover:underline;
  }
}
```

**Step 3: Set up layout with font loading**

`blog/src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TWS Trading Insights",
  description: "Live stream trading analysis and market insights from TWS Wealth OS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=instrument-serif@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
```

**Step 4: Verify dev server loads with correct fonts/colors**

```bash
cd blog
npm run dev
# Open http://localhost:3000 — verify Warm White background, Deep Slate text
```

**Step 5: Commit**

```bash
git add blog/tailwind.config.ts blog/src/app/globals.css blog/src/app/layout.tsx
git commit -m "feat: add TWS Sophisticated Warmth brand theme"
```

---

### Task 10: Prisma Client Helper + Data Access

**Files:**
- Create: `blog/src/lib/prisma.ts`
- Create: `blog/src/lib/posts.ts`

**Step 1: Create Prisma client singleton**

`blog/src/lib/prisma.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Step 2: Create data access functions**

`blog/src/lib/posts.ts`:
```typescript
import { prisma } from "./prisma";

export async function getRecentPosts(limit: number = 12) {
  return prisma.post.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      hook: true,
      heroImage: true,
      tags: true,
      publishedAt: true,
    },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function getPostsByTag(tag: string) {
  return prisma.post.findMany({
    where: { tags: { has: tag } },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      hook: true,
      heroImage: true,
      tags: true,
      publishedAt: true,
    },
  });
}

export async function getAllTags(): Promise<string[]> {
  const posts = await prisma.post.findMany({ select: { tags: true } });
  const tagSet = new Set(posts.flatMap((p) => p.tags));
  return Array.from(tagSet).sort();
}
```

**Step 3: Commit**

```bash
git add blog/src/lib/
git commit -m "feat: add Prisma client singleton and post data access layer"
```

---

### Task 11: Home Page — Post Grid

**Files:**
- Create: `blog/src/components/PostCard.tsx`
- Modify: `blog/src/app/page.tsx`

**Step 1: Create PostCard component**

`blog/src/components/PostCard.tsx`:
```tsx
import Link from "next/link";
import Image from "next/image";

interface PostCardProps {
  title: string;
  slug: string;
  hook: string;
  heroImage: string;
  tags: string[];
  publishedAt: Date;
}

export function PostCard({ title, slug, hook, heroImage, tags, publishedAt }: PostCardProps) {
  return (
    <Link href={`/posts/${slug}`} className="group block no-underline">
      <article className="overflow-hidden rounded-lg border border-deep-slate/10 bg-white transition-shadow hover:shadow-lg">
        <div className="relative aspect-video">
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-5">
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-wealth-teal/10 px-2.5 py-0.5 text-xs font-medium text-wealth-teal"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mb-2 text-lg font-bold text-deep-slate group-hover:text-burnt-amber transition-colors">
            {title}
          </h2>
          <p className="mb-3 text-sm text-deep-slate/70 line-clamp-2">{hook}</p>
          <time className="text-xs text-deep-slate/50" dateTime={publishedAt.toISOString()}>
            {publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </article>
    </Link>
  );
}
```

**Step 2: Build home page**

`blog/src/app/page.tsx`:
```tsx
import { getRecentPosts } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  const posts = await getRecentPosts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-deep-slate">
          <span className="text-burnt-amber">TWS</span> Trading Insights
        </h1>
        <p className="mt-2 text-lg text-deep-slate/70">
          Live stream analysis and market insights
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-deep-slate/50">No posts yet. Check back after the next live stream.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </main>
  );
}
```

**Step 3: Verify in dev**

```bash
npm run dev
# Open http://localhost:3000 — should see branded header, empty state message
```

**Step 4: Commit**

```bash
git add blog/src/components/PostCard.tsx blog/src/app/page.tsx
git commit -m "feat: add home page with post grid and TWS branding"
```

---

### Task 12: Post Detail Page

**Files:**
- Create: `blog/src/app/posts/[slug]/page.tsx`

**Step 1: Create post detail page with SEO**

`blog/src/app/posts/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPostBySlug } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const revalidate = 60;

interface Section {
  heading: string;
  body: string;
  chartRef?: string;
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | TWS Trading Insights`,
    description: post.seoDesc,
    openGraph: {
      title: post.title,
      description: post.seoDesc,
      images: [post.heroImage],
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.seoDesc,
      images: [post.heroImage],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const sections = post.sections as Section[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDesc,
    image: post.heroImage,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "TWS Wealth OS" },
    keywords: post.keywords.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <a
                key={tag}
                href={`/tags/${tag}`}
                className="rounded-full bg-wealth-teal/10 px-3 py-1 text-xs font-medium text-wealth-teal hover:bg-wealth-teal/20"
              >
                {tag}
              </a>
            ))}
          </div>
          <h1 className="text-3xl font-bold leading-tight text-deep-slate sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-burnt-amber">{post.hook}</p>
          <time
            className="mt-2 block text-sm text-deep-slate/50"
            dateTime={post.publishedAt.toISOString()}
          >
            {post.publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>

        <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed">{post.intro}</p>

          {sections.map((section, i) => (
            <section key={i} className="mt-8">
              <h2 className="text-2xl font-bold text-deep-slate">{section.heading}</h2>
              <div
                className="mt-3 leading-relaxed text-deep-slate/80"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
              {section.chartRef && (
                <figure className="mt-4">
                  <Image
                    src={section.chartRef}
                    alt={`Chart: ${section.heading}`}
                    width={800}
                    height={450}
                    className="rounded-lg border border-deep-slate/10"
                  />
                </figure>
              )}
            </section>
          ))}

          <section className="mt-8 border-t border-deep-slate/10 pt-8">
            <p className="leading-relaxed text-deep-slate/80">{post.conclusion}</p>
          </section>
        </div>
      </article>
    </>
  );
}
```

**Step 2: Commit**

```bash
git add blog/src/app/posts/
git commit -m "feat: add post detail page with SEO, JSON-LD, and chart images"
```

---

### Task 13: Publish API Route + Sitemap

**Files:**
- Create: `blog/src/app/api/posts/route.ts`
- Create: `blog/src/app/sitemap.ts`

**Step 1: Create publish API route**

`blog/src/app/api/posts/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("X-API-Key");
  if (apiKey !== process.env.PUBLISH_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const slug = slugify(body.title) + "-" + Date.now().toString(36);

  const post = await prisma.post.create({
    data: {
      videoId: body.videoId,
      title: body.title,
      slug,
      hook: body.hook,
      seoDesc: body.seoDesc,
      heroImage: body.heroImage,
      intro: body.intro,
      sections: body.sections,
      conclusion: body.conclusion,
      tags: body.tags,
      keywords: body.keywords,
      publishedAt: new Date(),
    },
  });

  return NextResponse.json(
    { id: post.id, slug: post.slug, url: `/posts/${post.slug}` },
    { status: 201 }
  );
}
```

**Step 2: Create sitemap**

`blog/src/app/sitemap.ts`:
```typescript
import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://insights.twswealthos.com";

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...posts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
```

**Step 3: Commit**

```bash
git add blog/src/app/api/ blog/src/app/sitemap.ts
git commit -m "feat: add publish API route and auto-generated sitemap"
```

---

## Workstream 3: N8N Workflow

> **Note:** N8N workflows are configured via the N8N UI, not code files. These tasks describe what to build in N8N. Export the workflow JSON and save to `n8n/` directory for version control.

### Task 14: YouTube Stream Detection Workflow

**Files:**
- Create: `n8n/stream-detection.json` (exported workflow)

**Steps:**

1. **Create new N8N workflow** named "TWS Stream Detection"
2. **Add Schedule Trigger node** — run every 5 minutes
3. **Add HTTP Request node** — call YouTube Data API v3 `videos.list`:
   - URL: `https://www.googleapis.com/youtube/v3/videos`
   - Params: `part=snippet,liveStreamingDetails`, `id={{your_live_video_id}}`
   - Auth: YouTube API key from N8N credentials
4. **Add IF node** — check `snippet.liveBroadcastContent === "none"` AND video has `liveStreamingDetails.actualEndTime`
5. **Add HTTP Request node** — check state store (SQLite via a simple API or N8N's built-in SQLite node):
   - Query: `SELECT video_id FROM pipeline_runs WHERE video_id = ?`
   - If exists → stop (already processed)
6. **Add SQLite node** — insert new record: `INSERT INTO pipeline_runs (video_id, channel_id, detected_at, status, updated_at) VALUES (?, ?, NOW(), 'pending', NOW())`
7. **Add Wait node** — 15 minutes delay
8. **Add HTTP Request node** — trigger the processing workflow via N8N webhook
9. **Export workflow JSON** to `n8n/stream-detection.json`
10. **Commit**

```bash
git add n8n/
git commit -m "feat: add N8N YouTube stream detection workflow"
```

---

### Task 15: Local Health Check + Transcription Dispatch

**Files:**
- Create: `n8n/process-stream.json` (exported workflow)

**Steps:**

1. **Create new N8N workflow** named "TWS Process Stream"
2. **Add Webhook trigger** — receives `{video_id}` from detection workflow
3. **Add HTTP Request node** — health check local machine:
   - URL: `https://your-tunnel.cfargotunnel.com/health`
   - Headers: `X-API-Key: {{credential}}`
   - Timeout: 10 seconds
   - On error: continue (don't fail workflow)
4. **Add IF node** — check if health check succeeded (status 200)
5. **Branch A (Local online):**
   - **HTTP Request** — POST `/transcribe` with `{video_id}` → get `{job_id}`
   - **Loop/Wait** — poll `/status/{job_id}` every 30 seconds until `status === "complete"` or `status === "failed"`
   - **HTTP Request** — POST `/extract-charts` with `{video_id}` → get `{job_id}`
   - **Loop/Wait** — poll chart job status
6. **Branch B (Local offline — cloud fallback):**
   - **HTTP Request** — call OpenAI Whisper API with audio URL
   - **HTTP Request** — trigger cloud function for chart extraction (or skip if not yet set up)
7. **Merge branches** — both produce `{transcript, chart_urls}`
8. **Trigger LLM pipeline** (next workflow via webhook)
9. **Export and commit**

```bash
git add n8n/process-stream.json
git commit -m "feat: add N8N transcription dispatch with local/cloud fallback"
```

---

### Task 16: LLM Pipeline Workflow

**Files:**
- Create: `n8n/llm-pipeline.json` (exported workflow)

**Steps:**

1. **Create new N8N workflow** named "TWS LLM Pipeline"
2. **Add Webhook trigger** — receives `{video_id, transcript, chart_urls}`

3. **Step 1 — Transcript Compression (GPT-4o-mini):**
   - **HTTP Request** to OpenAI API
   - Model: `gpt-4o-mini`
   - System prompt: "You are a trading stream analyst. Extract structured data from this live stream transcript."
   - User prompt: full transcript
   - Response format: JSON — `{tickers: string[], setups: {ticker, direction, entry, target, stop}[], timestamps: {time, topic}[], key_quotes: string[], summary: string}`
   - Max tokens: 4000

4. **Step 2 — Title & Hooks (GPT-5.2):**
   - **HTTP Request** to OpenAI API
   - Model: `gpt-5.2`
   - Input: compressed summary from step 1
   - Response format: JSON — `{title: string, hook: string, seo_description: string, keywords: string[], image_prompt: string}`

5. **Step 3 — Tavily Research:**
   - **HTTP Request** to Tavily API
   - Query: keywords/tickers from step 2
   - **Cache check first** — N8N Function node checks if results for these tickers exist in cache (< 24h old)

6. **Step 4 — Blog Body (Sonnet 4.6):**
   - **HTTP Request** to Anthropic API
   - Model: `claude-sonnet-4-6-20250514`
   - Input: summary + title + hook + research + chart URLs
   - System prompt: "You are a financial blog writer for TWS Wealth OS. Write an SEO-optimized blog post about today's trading live stream. Use the chart images provided by referencing their URLs in the appropriate sections."
   - Response format: JSON — `{intro: string, sections: [{heading, body, chartRef?}], conclusion: string, tags: string[]}`

7. **Step 5 — Hero Image (Nano Banana 2):**
   - **HTTP Request** to image generation API
   - Prompt: `image_prompt` from step 2
   - Upload result to R2 via S3-compatible PUT
   - Store URL

8. **Pass all data to publish workflow**
9. **Export and commit**

```bash
git add n8n/llm-pipeline.json
git commit -m "feat: add N8N multi-model LLM pipeline workflow"
```

---

### Task 17: Publish + Validate Workflow

**Files:**
- Create: `n8n/publish.json` (exported workflow)

**Steps:**

1. **Create new N8N workflow** named "TWS Publish Blog"
2. **Add Webhook trigger** — receives all blog data
3. **HTTP Request** — POST to blog API:
   - URL: `https://your-blog.vercel.app/api/posts`
   - Headers: `X-API-Key: {{publish_key}}`
   - Body: `{videoId, title, hook, seoDesc, heroImage, intro, sections, conclusion, tags, keywords}`
4. **HTTP Request** — validate published URL returns 200:
   - URL: response URL from publish step
   - Method: GET
   - Assert status 200
5. **SQLite node** — update state store:
   - `UPDATE pipeline_runs SET status='complete', blog_post_id=?, published_url=?, llm_cost_usd=?, updated_at=NOW() WHERE video_id=?`
6. **On error** — Error Workflow:
   - Update state store with `status='failed'`, `error_message`, `failed_step`
   - Send Discord webhook / email notification with error details
7. **Export and commit**

```bash
git add n8n/publish.json
git commit -m "feat: add N8N publish and validate workflow with error handling"
```

---

### Task 18: N8N State Store Setup

**Files:**
- Create: `n8n/setup-state-store.sql`

**Step 1: Create SQLite setup script**

`n8n/setup-state-store.sql`:
```sql
CREATE TABLE IF NOT EXISTS pipeline_runs (
    video_id      TEXT PRIMARY KEY,
    channel_id    TEXT NOT NULL,
    detected_at   DATETIME NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending',
    transcript    TEXT,
    chart_urls    TEXT,
    blog_post_id  TEXT,
    published_url TEXT,
    llm_cost_usd  REAL,
    error_message TEXT,
    failed_step   TEXT,
    updated_at    DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_detected_at ON pipeline_runs(detected_at);
```

**Step 2: Execute on N8N host**

```bash
sqlite3 /path/to/n8n/data/tws-pipeline.db < n8n/setup-state-store.sql
```

**Step 3: Commit**

```bash
git add n8n/setup-state-store.sql
git commit -m "feat: add SQLite state store schema for pipeline tracking"
```

---

## Workstream 4: Infrastructure

### Task 19: Cloudflare R2 Bucket Setup

**Steps:**

1. Log into Cloudflare dashboard
2. Create R2 bucket named `tws-blog-images`
3. Enable public access via custom domain or R2 public URL
4. Create R2 API token with read/write permissions
5. Note down: endpoint URL, access key ID, secret access key
6. Add these to both `services/local-api/.env` and N8N credentials

---

### Task 20: Cloudflare Tunnel Setup

**Steps:**

1. Install `cloudflared` on Windows machine:
   ```powershell
   winget install Cloudflare.cloudflared
   ```
2. Authenticate:
   ```bash
   cloudflared tunnel login
   ```
3. Create tunnel:
   ```bash
   cloudflared tunnel create tws-stream-processor
   ```
4. Configure tunnel (`~/.cloudflared/config.yml`):
   ```yaml
   tunnel: <tunnel-id>
   credentials-file: ~/.cloudflared/<tunnel-id>.json

   ingress:
     - hostname: stream-api.yourdomain.com
       service: http://localhost:8000
     - service: http_status:404
   ```
5. Add DNS record:
   ```bash
   cloudflared tunnel route dns tws-stream-processor stream-api.yourdomain.com
   ```
6. Install as Windows service:
   ```powershell
   cloudflared service install
   ```
7. Add Cloudflare Access policy (optional but recommended):
   - Create a Service Token in Zero Trust dashboard
   - Add policy requiring `CF-Access-Client-Id` and `CF-Access-Client-Secret` headers

---

### Task 21: Vercel Deployment

**Steps:**

1. Push blog to GitHub repository
2. Connect repo to Vercel
3. Set environment variables in Vercel:
   - `DATABASE_URL` — Neon Postgres connection string
   - `PUBLISH_API_KEY` — secret key for N8N to publish
   - `NEXT_PUBLIC_SITE_URL` — your blog domain
4. Configure custom domain in Vercel
5. Add R2 domain to `next.config.ts` `images.remotePatterns`

`blog/next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "your-r2-public-domain.com",
      },
    ],
  },
};

export default nextConfig;
```

```bash
git add blog/next.config.ts
git commit -m "feat: configure Next.js image domains for R2"
```

---

## Workstream 5: Integration & Testing

### Task 22: End-to-End Test — Manual Trigger

**Steps:**

1. Start local FastAPI service: `uvicorn src.main:app --host 0.0.0.0 --port 8000`
2. Start Redis: `redis-server`
3. Start ARQ worker: `arq src.worker.WorkerSettings`
4. Test health check:
   ```bash
   curl -H "X-API-Key: your-key" https://stream-api.yourdomain.com/health
   ```
5. Test with a short YouTube video (not a 2-hour stream):
   - Call `/transcribe` with a known video ID
   - Poll `/status/{job_id}` until complete
   - Verify transcript returned
6. Manually trigger N8N pipeline with test transcript
7. Verify blog post appears on Vercel site

---

### Task 23: Tag Pages

**Files:**
- Create: `blog/src/app/tags/[tag]/page.tsx`

**Step 1: Create tag page**

`blog/src/app/tags/[tag]/page.tsx`:
```tsx
import { getPostsByTag, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `${tag} | TWS Trading Insights`,
    description: `Trading insights and analysis tagged with ${tag}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-12">
        <a href="/" className="text-sm text-wealth-teal">&larr; Back to all posts</a>
        <h1 className="mt-4 text-3xl font-bold text-deep-slate">
          Posts tagged <span className="text-burnt-amber">{tag}</span>
        </h1>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add blog/src/app/tags/
git commit -m "feat: add tag pages for filtered post listings"
```

---

### Task 24: Windows Auto-Start Setup

**Files:**
- Create: `services/local-api/scripts/start.bat`

**Step 1: Create startup script**

`services/local-api/scripts/start.bat`:
```bat
@echo off
cd /d %~dp0\..
start /B redis-server
timeout /t 3
start /B python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
start /B python -m arq src.worker.WorkerSettings
echo TWS Stream Processor started.
```

**Step 2: Create Windows Task Scheduler entry**

```powershell
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"C:\path\to\services\local-api\scripts\start.bat`""
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName "TWS Stream Processor" -Action $action -Trigger $trigger -RunLevel Highest -Description "Start TWS Stream Processor on boot"
```

**Step 3: Commit**

```bash
git add services/local-api/scripts/
git commit -m "feat: add Windows auto-start script for local services"
```

---

## Build Order (Recommended)

These workstreams can be built in parallel since they're independent:

```
Week 1 (Parallel):
├── Workstream 1: Tasks 1-6 (Local FastAPI)
├── Workstream 2: Tasks 7-13 (Blog Website)
└── Workstream 4: Tasks 19-21 (Infrastructure)

Week 2:
├── Workstream 3: Tasks 14-18 (N8N Workflows)
└── Workstream 5: Tasks 22-24 (Integration)
```

The N8N workflows depend on having the local API and blog site running, so they come after. Infrastructure (R2, Tunnel, Vercel) can be set up anytime but is needed before integration testing.
