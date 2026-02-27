import logging

import cv2
import numpy as np
from pathlib import Path
from src.config import settings
from src.storage import upload_to_r2

logger = logging.getLogger(__name__)


def extract_chart_frames(
    video_path: str,
    video_id: str,
    sample_interval: float = 5.0,
    threshold: float = 30.0,
    max_frames: int = 20,
) -> list[dict]:
    """Extract chart/scene-change frames from video using streaming comparison.

    Compares consecutive sampled frames to detect scene changes without
    loading all frames into memory at once.
    """
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        cap.release()
        return []
    frame_interval = int(fps * sample_interval)

    # Stream through video, comparing consecutive frames
    changes: list[dict] = []
    prev_frame = None
    frame_idx = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % frame_interval == 0:
            timestamp = frame_idx / fps
            if prev_frame is not None:
                diff = cv2.absdiff(prev_frame, frame)
                mean_diff = float(np.mean(diff))
                if mean_diff > threshold:
                    changes.append({"timestamp": timestamp, "score": mean_diff})
            prev_frame = frame.copy()
        frame_idx += 1

    cap.release()

    # Take top N by score, then sort by time
    changes.sort(key=lambda x: x["score"], reverse=True)
    top_changes = changes[:max_frames]
    top_changes.sort(key=lambda x: x["timestamp"])

    # Re-read frames at selected timestamps, save and upload
    results = []
    out_dir = Path(settings.download_dir) / video_id / "charts"
    out_dir.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    try:
        for change in top_changes:
            cap.set(cv2.CAP_PROP_POS_MSEC, change["timestamp"] * 1000)
            ret, frame = cap.read()
            if not ret:
                continue

            filename = f"chart_{int(change['timestamp'])}s.jpg"
            local_path = str(out_dir / filename)
            cv2.imwrite(local_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 90])

            r2_key = f"{video_id}/charts/{filename}"
            try:
                url = upload_to_r2(local_path, r2_key)
                results.append({
                    "timestamp": change["timestamp"],
                    "url": url,
                    "score": change["score"],
                })
            except Exception:
                logger.warning("Failed to upload %s, skipping frame", r2_key, exc_info=True)
                continue
    finally:
        cap.release()

    return results
