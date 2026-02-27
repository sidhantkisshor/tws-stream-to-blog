import boto3
from src.config import settings


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.r2_endpoint,
        aws_access_key_id=settings.r2_access_key,
        aws_secret_access_key=settings.r2_secret_key,
    )


def upload_to_r2(file_path: str, key: str, content_type: str = "image/jpeg") -> str:
    """Upload file to R2 and return the public URL."""
    client = get_r2_client()
    client.upload_file(
        file_path,
        settings.r2_bucket,
        key,
        ExtraArgs={"ContentType": content_type},
    )
    return f"{settings.r2_public_url}/{key}"
