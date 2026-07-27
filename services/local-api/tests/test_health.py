async def test_health_returns_ok(client, api_key):
    resp = await client.get("/health", headers={"X-API-Key": api_key})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "yt_dlp" in data


async def test_health_rejects_bad_key(client):
    resp = await client.get("/health", headers={"X-API-Key": "wrong"})
    assert resp.status_code == 403


async def test_health_rejects_missing_key(client):
    # Absent credentials are rejected by APIKeyHeader itself (401), before
    # verify_api_key runs — a wrong key gets 403 from the check above.
    resp = await client.get("/health")
    assert resp.status_code == 401
