import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from src.main import app


@pytest.fixture
def api_key():
    return "test-key"


@pytest.fixture
async def client(api_key, monkeypatch):
    monkeypatch.setenv("API_KEY", api_key)
    monkeypatch.setenv("YOUTUBE_CHANNEL_ID", "UCtest123")
    monkeypatch.setenv("R2_ENDPOINT", "http://fake")
    monkeypatch.setenv("R2_ACCESS_KEY", "fake")
    monkeypatch.setenv("R2_SECRET_KEY", "fake")
    monkeypatch.setenv("R2_BUCKET", "fake")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
@patch("src.main.enqueue_transcription", new_callable=AsyncMock)
async def test_transcribe_returns_job_id(mock_enqueue, client, api_key):
    mock_enqueue.return_value = "job-123"
    resp = await client.post(
        "/transcribe",
        json={"video_id": "dQw4w9WgXcQ"},
        headers={"X-API-Key": api_key},
    )
    assert resp.status_code == 202
    assert resp.json()["job_id"] == "job-123"


@pytest.mark.asyncio
async def test_transcribe_rejects_invalid_video_id(client, api_key):
    resp = await client.post(
        "/transcribe",
        json={"video_id": "invalid!"},
        headers={"X-API-Key": api_key},
    )
    assert resp.status_code == 422
