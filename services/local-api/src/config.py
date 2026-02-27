from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    api_key: str
    youtube_channel_id: str
    r2_endpoint: str
    r2_access_key: str
    r2_secret_key: str
    r2_bucket: str
    r2_public_url: str  # e.g. https://images.yourdomain.com or https://pub-xxx.r2.dev
    redis_url: str = "redis://localhost:6379"
    whisper_model: str = "large-v3"
    whisper_device: str = "cuda"
    download_dir: str = "./downloads"

    model_config = {"env_file": ".env"}


settings = Settings()
