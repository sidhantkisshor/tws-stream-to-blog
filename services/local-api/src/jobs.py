import json
import logging
import uuid
import redis

from src.config import settings

logger = logging.getLogger(__name__)

_redis: redis.Redis | None = None


def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
        )
    return _redis


def _job_key(job_id: str) -> str:
    return f"tws:job:{job_id}"


def create_job() -> str:
    job_id = str(uuid.uuid4())
    r = get_redis()
    r.set(
        _job_key(job_id),
        json.dumps({"status": "pending", "result": None, "error": None}),
        ex=86400,  # expire after 24 hours
    )
    return job_id


def update_job(job_id: str, status: str, result: dict | None = None, error: str | None = None):
    try:
        r = get_redis()
        r.set(
            _job_key(job_id),
            json.dumps({"status": status, "result": result, "error": error}),
            ex=86400,
        )
    except redis.exceptions.RedisError:
        logger.error("Failed to update job %s to status %s", job_id, status, exc_info=True)


def get_job(job_id: str) -> dict | None:
    r = get_redis()
    data = r.get(_job_key(job_id))
    if data is None:
        return None
    return json.loads(data)
