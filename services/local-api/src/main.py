import shutil
import subprocess

from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from src.config import settings

app = FastAPI(title="TWS Stream Processor")

api_key_header = APIKeyHeader(name="X-API-Key")


async def verify_api_key(key: str = Security(api_key_header)):
    if key != settings.api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return key


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
