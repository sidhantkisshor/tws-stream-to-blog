import pytest
from unittest.mock import patch, MagicMock
from src.transcribe import transcribe_audio


@patch("src.transcribe.WhisperModel")
def test_transcribe_returns_segments(mock_whisper_cls):
    mock_model = MagicMock()
    mock_model.transcribe.return_value = (
        [
            MagicMock(start=0.0, end=5.0, text="Hello everyone, welcome to the stream."),
            MagicMock(start=5.0, end=10.0, text="Today we're looking at NIFTY levels."),
        ],
        MagicMock(language="en", language_probability=0.98),
    )
    mock_whisper_cls.return_value = mock_model

    result = transcribe_audio("/fake/audio.mp3")

    assert len(result["segments"]) == 2
    assert result["segments"][0]["text"] == "Hello everyone, welcome to the stream."
    assert result["segments"][0]["start"] == 0.0
    assert result["full_text"].startswith("Hello everyone")
    assert result["language"] == "en"
