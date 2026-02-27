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
