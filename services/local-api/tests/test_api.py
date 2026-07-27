from unittest.mock import patch, AsyncMock


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


async def test_transcribe_rejects_invalid_video_id(client, api_key):
    resp = await client.post(
        "/transcribe",
        json={"video_id": "invalid!"},
        headers={"X-API-Key": api_key},
    )
    assert resp.status_code == 422


async def test_transcribe_rejects_bad_key(client):
    resp = await client.post(
        "/transcribe",
        json={"video_id": "dQw4w9WgXcQ"},
        headers={"X-API-Key": "wrong"},
    )
    assert resp.status_code == 403


@patch("src.main.enqueue_chart_extraction", new_callable=AsyncMock)
async def test_extract_charts_returns_job_id(mock_enqueue, client, api_key):
    mock_enqueue.return_value = "job-456"
    resp = await client.post(
        "/extract-charts",
        json={"video_id": "dQw4w9WgXcQ"},
        headers={"X-API-Key": api_key},
    )
    assert resp.status_code == 202
    assert resp.json()["job_id"] == "job-456"


@patch("src.main.get_job")
async def test_status_returns_job(mock_get_job, client, api_key):
    mock_get_job.return_value = {"status": "complete", "result": {"ok": True}, "error": None}
    resp = await client.get("/status/abc-123", headers={"X-API-Key": api_key})
    assert resp.status_code == 200
    assert resp.json() == {
        "job_id": "abc-123",
        "status": "complete",
        "result": {"ok": True},
        "error": None,
    }


@patch("src.main.get_job")
async def test_status_404_for_unknown_job(mock_get_job, client, api_key):
    mock_get_job.return_value = None
    resp = await client.get("/status/nope", headers={"X-API-Key": api_key})
    assert resp.status_code == 404
