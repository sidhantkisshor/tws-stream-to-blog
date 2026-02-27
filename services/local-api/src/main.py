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
