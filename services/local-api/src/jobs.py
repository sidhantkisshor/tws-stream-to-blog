import uuid

# In-memory job store (ARQ handles persistence via Redis, this is the status cache)
_jobs: dict[str, dict] = {}


def create_job() -> str:
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "pending", "result": None, "error": None}
    return job_id


def update_job(job_id: str, status: str, result: dict | None = None, error: str | None = None):
    if job_id in _jobs:
        _jobs[job_id] = {"status": status, "result": result, "error": error}


def get_job(job_id: str) -> dict | None:
    return _jobs.get(job_id)
