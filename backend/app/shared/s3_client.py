"""
ELARION AI Learning Platform — Backend
Module: app/shared/s3_client.py

Purpose:
    Async S3-compatible object storage client (MinIO in dev / AWS S3 in prod).
    Provides upload, delete, and presigned URL generation.

Why S3-compatible instead of proprietary?
    MinIO, AWS S3, Cloudflare R2, and Backblaze B2 all speak the same
    S3 protocol. By abstracting behind this module, switching storage
    providers in production requires ONLY environment variable changes.
    Zero code change needed.

Industry Practice: Presigned URLs
    Files are served directly from S3 to the browser — not proxied through
    the API server. This reduces API server load and bandwidth costs.
    A presigned URL gives temporary, direct access to a specific object.
"""

from __future__ import annotations

import uuid
from contextlib import asynccontextmanager
from typing import BinaryIO

import aiobotocore.session
from botocore.exceptions import ClientError

from app.config import get_settings
from app.shared.exceptions import StorageError
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


def _make_key(prefix: str, filename: str) -> str:
    """
    Generate a unique, non-guessable S3 object key.

    WHY not use the original filename?
        1. Security: original filenames may contain path traversal attempts
        2. Uniqueness: two users uploading "notes.pdf" would collide
        3. Organization: prefix separates content types (assets/recordings/etc.)

    Result: "assets/f47ac10b-58cc-4372-a567-0e02b2c3d479.pdf"
    """
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    return f"{prefix}/{uuid.uuid4()}.{ext}"


@asynccontextmanager
async def _get_s3_client():
    """
    Async context manager that yields a configured S3 client.
    Connection is released when the context exits.
    """
    settings = get_settings()
    session = aiobotocore.session.get_session()
    config_kwargs: dict = {
        "service_name": "s3",
        "aws_access_key_id": settings.S3_ACCESS_KEY_ID,
        "aws_secret_access_key": settings.S3_SECRET_ACCESS_KEY,
        "region_name": settings.S3_REGION,
    }
    if settings.S3_ENDPOINT_URL:
        config_kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL

    async with session.create_client(**config_kwargs) as client:
        yield client


async def upload_file(
    file_data: bytes | BinaryIO,
    original_filename: str,
    content_type: str,
    prefix: str = "assets",
) -> tuple[str, str]:
    """
    Upload a file to object storage.

    Args:
        file_data: File bytes or file-like object
        original_filename: Original name (for extension extraction only)
        content_type: MIME type (e.g. "application/pdf")
        prefix: S3 key prefix (e.g. "assets", "recordings")

    Returns:
        (storage_key, public_url): S3 object key and CDN/endpoint URL

    Raises:
        StorageError: If upload fails
    """
    settings = get_settings()
    key = _make_key(prefix, original_filename)

    try:
        async with _get_s3_client() as s3:
            await s3.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=key,
                Body=file_data,
                ContentType=content_type,
            )

        # Construct the URL
        if settings.S3_ENDPOINT_URL:
            url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{key}"
        else:
            url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.S3_REGION}.amazonaws.com/{key}"

        logger.info("file_uploaded", key=key, content_type=content_type)
        return key, url

    except ClientError as e:
        logger.error("s3_upload_failed", key=key, error=str(e))
        raise StorageError("upload", str(e)) from e


async def generate_presigned_url(storage_key: str, expires_in: int = 3600) -> str:
    """
    Generate a presigned URL for temporary direct access to an S3 object.

    Args:
        storage_key: The S3 object key
        expires_in: URL validity in seconds (default: 1 hour)

    Returns:
        Presigned URL string

    WHY presigned URLs?
        - Files are served directly from S3 to client — no API bandwidth cost
        - URL expires automatically — no need to revoke access
        - Works for private buckets (objects not publicly accessible)
    """
    settings = get_settings()
    try:
        async with _get_s3_client() as s3:
            url = await s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.S3_BUCKET_NAME, "Key": storage_key},
                ExpiresIn=expires_in,
            )
        return url
    except ClientError as e:
        logger.error("presigned_url_failed", key=storage_key, error=str(e))
        raise StorageError("presigned_url", str(e)) from e


async def delete_file(storage_key: str) -> None:
    """
    Delete a file from object storage.
    Note: S3 delete is a soft operation — MinIO/S3 versions are retained
    if bucket versioning is enabled (recommended for production).
    """
    settings = get_settings()
    try:
        async with _get_s3_client() as s3:
            await s3.delete_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=storage_key,
            )
        logger.info("file_deleted", key=storage_key)
    except ClientError as e:
        logger.error("s3_delete_failed", key=storage_key, error=str(e))
        raise StorageError("delete", str(e)) from e
