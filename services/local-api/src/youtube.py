import re
import subprocess
from pathlib import Path
from src.config import settings

VIDEO_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{11}$")

# Subprocess timeout slightly under the ARQ job timeout (3600s)
DOWNLOAD_TIMEOUT = 3300


def validate_video_id(video_id: str) -> bool:
    return bool(VIDEO_ID_PATTERN.match(video_id))


def _is_valid_download(path: Path) -> bool:
    """Check that a file exists and has non-zero size (not a partial download)."""
    return path.exists() and path.stat().st_size > 0


def download_audio(video_id: str) -> Path:
    """Download audio-only from YouTube video. Returns path to mp3 file."""
    out_dir = Path(settings.download_dir) / video_id
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "audio.mp3"

    if _is_valid_download(out_path):
        return out_path

    # Remove partial download if it exists
    if out_path.exists():
        out_path.unlink()

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
        timeout=DOWNLOAD_TIMEOUT,
    )
    return out_path


def download_video(video_id: str) -> Path:
    """Download 720p video for chart extraction. Returns path to video file."""
    out_dir = Path(settings.download_dir) / video_id
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "video.mp4"

    if _is_valid_download(out_path):
        return out_path

    # Remove partial download if it exists
    if out_path.exists():
        out_path.unlink()

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
        timeout=DOWNLOAD_TIMEOUT,
    )
    return out_path
