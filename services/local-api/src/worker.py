import shutil
from pathlib import Path

from arq import create_pool
from arq.connections import RedisSettings
from src.config import settings
from src.youtube import download_audio, download_video
from src.transcribe import transcribe_audio
from src.charts import extract_chart_frames
from src.jobs import update_job


def _cleanup_downloads(video_id: str):
    """Remove downloaded files for a video to prevent disk exhaustion."""
    download_path = Path(settings.download_dir) / video_id
    if download_path.exists():
        shutil.rmtree(download_path, ignore_errors=True)


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
    finally:
        _cleanup_downloads(video_id)


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
    finally:
        _cleanup_downloads(video_id)


class WorkerSettings:
    functions = [transcribe_task, extract_charts_task]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    max_jobs = 2
    job_timeout = 3600  # 1 hour max per job
