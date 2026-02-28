import asyncio
import base64
import re
import shutil
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path

from arq import create_pool
from arq.connections import RedisSettings
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, field_validator

from src.config import settings
from src.jobs import create_job, get_job
from src.storage import upload_to_r2

_arq_pool = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _arq_pool
    _arq_pool = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    yield
    await _arq_pool.close()


app = FastAPI(title="TWS Stream Processor", lifespan=lifespan)

api_key_header = APIKeyHeader(name="X-API-Key")


async def verify_api_key(key: str = Security(api_key_header)):
    if key != settings.api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return key


class VideoIdRequest(BaseModel):
    video_id: str

    @field_validator("video_id")
    @classmethod
    def validate_video_id(cls, v: str) -> str:
        if not re.match(r"^[A-Za-z0-9_-]{11}$", v):
            raise ValueError("Invalid YouTube video ID format")
        return v


class UploadImageRequest(BaseModel):
    image_base64: str
    key: str
    content_type: str = "image/png"


async def enqueue_transcription(video_id: str) -> str:
    job_id = create_job()
    await _arq_pool.enqueue_job("transcribe_task", job_id, video_id)
    return job_id


async def enqueue_chart_extraction(video_id: str) -> str:
    job_id = create_job()
    await _arq_pool.enqueue_job("extract_charts_task", job_id, video_id)
    return job_id


@app.get("/health")
async def health(key: str = Depends(verify_api_key)):
    yt_dlp_ok = shutil.which("yt-dlp") is not None
    yt_dlp_version = None
    if yt_dlp_ok:
        proc = await asyncio.create_subprocess_exec(
            "yt-dlp", "--version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        yt_dlp_version = stdout.decode().strip()
    return {
        "status": "ok",
        "yt_dlp": {"available": yt_dlp_ok, "version": yt_dlp_version},
    }


@app.post("/transcribe", status_code=202)
async def transcribe(req: VideoIdRequest, key: str = Depends(verify_api_key)):
    job_id = await enqueue_transcription(req.video_id)
    return {"job_id": job_id}


@app.post("/extract-charts", status_code=202)
async def extract_charts(req: VideoIdRequest, key: str = Depends(verify_api_key)):
    job_id = await enqueue_chart_extraction(req.video_id)
    return {"job_id": job_id}


@app.post("/upload-image")
async def upload_image(req: UploadImageRequest, key: str = Depends(verify_api_key)):
    try:
        image_bytes = base64.b64decode(req.image_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 data")

    suffix = Path(req.key).suffix or ".png"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        tmp.write(image_bytes)
        tmp.close()
        url = upload_to_r2(tmp.name, req.key, req.content_type)
        return {"url": url}
    finally:
        Path(tmp.name).unlink(missing_ok=True)


@app.get("/status/{job_id}")
async def job_status(job_id: str, key: str = Depends(verify_api_key)):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, **job}
