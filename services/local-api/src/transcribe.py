from faster_whisper import WhisperModel
from src.config import settings

_model = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            settings.whisper_model,
            device=settings.whisper_device,
            compute_type="float16",
        )
    return _model


def transcribe_audio(audio_path: str) -> dict:
    """Transcribe audio file using faster-whisper. Returns segments + full text."""
    model = get_model()
    segments_iter, info = model.transcribe(
        audio_path,
        beam_size=5,
        language=None,  # auto-detect
        vad_filter=True,
    )

    segments = []
    full_text_parts = []
    for seg in segments_iter:
        segments.append({
            "start": seg.start,
            "end": seg.end,
            "text": seg.text.strip(),
        })
        full_text_parts.append(seg.text.strip())

    return {
        "segments": segments,
        "full_text": " ".join(full_text_parts),
        "language": info.language,
        "language_probability": info.language_probability,
    }
