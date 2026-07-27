"""Shared test bootstrap and fixtures.

The environment below must be populated *before* anything imports ``src.*``:
``src.config`` builds its ``Settings`` singleton at module import, so any value
that is missing at that moment is a hard ValidationError, and any value set
afterwards (e.g. via ``monkeypatch.setenv`` inside a fixture) arrives too late
to affect it.

pydantic-settings gives real environment variables precedence over ``.env``,
so assigning here also keeps the suite deterministic on a dev machine whose
``.env`` holds real credentials.
"""

import os

TEST_API_KEY = "test-key"

os.environ.update(
    {
        "API_KEY": TEST_API_KEY,
        "YOUTUBE_CHANNEL_ID": "UCtest123",
        "R2_ENDPOINT": "http://fake",
        "R2_ACCESS_KEY": "fake",
        "R2_SECRET_KEY": "fake",
        "R2_BUCKET": "fake",
        "R2_PUBLIC_URL": "http://fake.local",
        "REDIS_URL": "redis://localhost:6379",
    }
)

import pytest  # noqa: E402
from httpx import AsyncClient, ASGITransport  # noqa: E402

from src.main import app  # noqa: E402


@pytest.fixture
def api_key() -> str:
    return TEST_API_KEY


@pytest.fixture
async def client():
    """HTTP client bound to the ASGI app.

    ASGITransport does not run lifespan events, so ``_arq_pool`` stays None —
    tests that reach an enqueue path must patch it out.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
