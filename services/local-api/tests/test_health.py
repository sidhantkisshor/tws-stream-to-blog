import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app


@pytest.fixture
def api_key():
    return "test-key"


@pytest.fixture
async def client(api_key, monkeypatch):
    monkeypatch.setenv("API_KEY", api_key)
    monkeypatch.setenv("YOUTUBE_CHANNEL_ID", "test-channel")
    monkeypatch.setenv("R2_ENDPOINT", "http://fake")
    monkeypatch.setenv("R2_ACCESS_KEY", "fake")
    monkeypatch.setenv("R2_SECRET_KEY", "fake")
    monkeypatch.setenv("R2_BUCKET", "fake")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_health_returns_ok(client, api_key):
    resp = await client.get("/health", headers={"X-API-Key": api_key})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "yt_dlp" in data


@pytest.mark.asyncio
async def test_health_rejects_bad_key(client):
    resp = await client.get("/health", headers={"X-API-Key": "wrong"})
    assert resp.status_code == 403
