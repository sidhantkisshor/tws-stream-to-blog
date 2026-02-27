from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from src.config import settings

app = FastAPI(title="TWS Stream Processor")

api_key_header = APIKeyHeader(name="X-API-Key")


async def verify_api_key(key: str = Security(api_key_header)):
    if key != settings.api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return key
