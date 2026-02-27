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
