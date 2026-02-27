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
