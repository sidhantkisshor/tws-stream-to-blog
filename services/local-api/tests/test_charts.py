from unittest.mock import patch

import cv2
import numpy as np
import pytest

from src import charts
from src.charts import extract_chart_frames


def _frame(value: int) -> np.ndarray:
    return np.full((8, 8, 3), value, dtype=np.uint8)


class FakeCapture:
    """Minimal stand-in for cv2.VideoCapture over an in-memory frame list.

    extract_chart_frames opens the video twice — once to stream and score
    scene changes, once to seek back to the winning timestamps — so the patched
    factory hands out a fresh instance per call.
    """

    def __init__(self, frames: list[np.ndarray], fps: float):
        self._frames = frames
        self._fps = fps
        self._idx = 0
        self.released = False

    def get(self, prop):
        return self._fps if prop == cv2.CAP_PROP_FPS else 0.0

    def set(self, prop, value):
        if prop != cv2.CAP_PROP_POS_MSEC:
            return False
        self._idx = int(round(value / 1000.0 * self._fps))
        return True

    def isOpened(self):
        return not self.released

    def read(self):
        if self._idx >= len(self._frames):
            return False, None
        frame = self._frames[self._idx]
        self._idx += 1
        return True, frame

    def release(self):
        self.released = True


@pytest.fixture
def download_dir(tmp_path, monkeypatch):
    monkeypatch.setattr(charts.settings, "download_dir", str(tmp_path))
    return tmp_path


@pytest.fixture
def fake_video(monkeypatch):
    """Patch cv2.VideoCapture with a scripted frame sequence.

    fps=1.0 with sample_interval=1.0 means every frame is a sample, so frame
    index equals timestamp in seconds.
    """

    def _install(frames: list[np.ndarray], fps: float = 1.0):
        monkeypatch.setattr(
            charts.cv2, "VideoCapture", lambda _path: FakeCapture(frames, fps)
        )

    return _install


def test_extract_chart_frames_detects_and_uploads_scene_changes(
    fake_video, download_dir
):
    # black, black, white, white, black -> jumps at t=2s and t=4s
    fake_video([_frame(0), _frame(0), _frame(255), _frame(255), _frame(0)])

    with patch(
        "src.charts.upload_to_r2", side_effect=lambda _p, key, *a, **kw: f"https://cdn/{key}"
    ) as mock_upload:
        results = extract_chart_frames(
            "/fake/video.mp4", "vid123", sample_interval=1.0, threshold=30.0
        )

    assert [r["timestamp"] for r in results] == [2.0, 4.0]
    assert [r["url"] for r in results] == [
        "https://cdn/vid123/charts/chart_2s.jpg",
        "https://cdn/vid123/charts/chart_4s.jpg",
    ]
    assert all(r["score"] > 30.0 for r in results)

    uploaded_keys = [call.args[1] for call in mock_upload.call_args_list]
    assert uploaded_keys == ["vid123/charts/chart_2s.jpg", "vid123/charts/chart_4s.jpg"]
    # Frames are written to disk under the configured download dir before upload.
    assert (download_dir / "vid123" / "charts" / "chart_2s.jpg").exists()


def test_extract_chart_frames_ignores_static_video(fake_video, download_dir):
    fake_video([_frame(0)] * 5)

    with patch("src.charts.upload_to_r2") as mock_upload:
        results = extract_chart_frames(
            "/fake/video.mp4", "vid123", sample_interval=1.0, threshold=30.0
        )

    assert results == []
    mock_upload.assert_not_called()


def test_extract_chart_frames_returns_empty_when_fps_unavailable(
    fake_video, download_dir
):
    fake_video([_frame(0), _frame(255)], fps=0.0)

    results = extract_chart_frames("/fake/video.mp4", "vid123")

    assert results == []


def test_extract_chart_frames_caps_at_max_frames(fake_video, download_dir):
    # 11 frames alternating black/white -> 10 scene changes, capped to 3.
    fake_video([_frame(255 if i % 2 else 0) for i in range(11)])

    with patch("src.charts.upload_to_r2", side_effect=lambda _p, key, *a, **kw: f"https://cdn/{key}"):
        results = extract_chart_frames(
            "/fake/video.mp4",
            "vid123",
            sample_interval=1.0,
            threshold=30.0,
            max_frames=3,
        )

    assert len(results) == 3
    timestamps = [r["timestamp"] for r in results]
    assert timestamps == sorted(timestamps)


def test_extract_chart_frames_skips_frames_that_fail_to_upload(
    fake_video, download_dir
):
    fake_video([_frame(0), _frame(0), _frame(255), _frame(255), _frame(0)])

    def flaky_upload(_path, key, *args, **kwargs):
        if "chart_2s" in key:
            raise RuntimeError("R2 unavailable")
        return f"https://cdn/{key}"

    with patch("src.charts.upload_to_r2", side_effect=flaky_upload):
        results = extract_chart_frames(
            "/fake/video.mp4", "vid123", sample_interval=1.0, threshold=30.0
        )

    # The failed frame is dropped, the healthy one still comes back.
    assert [r["timestamp"] for r in results] == [4.0]
