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
from botocore.config import Config

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

    boto_config = Config(
        retries={"max_attempts": 3, "mode": "standard"},
        connect_timeout=10,
        read_timeout=30,
    )

    async with session.create_client(**config_kwargs, config=boto_config) as client:
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


async def generate_presigned_upload_url(storage_key: str, content_type: str, expires_in: int = 3600) -> str:
    settings = get_settings()
    try:
        async with _get_s3_client() as s3:
            url = await s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": settings.S3_BUCKET_NAME,
                    "Key": storage_key,
                    "ContentType": content_type
                },
                ExpiresIn=expires_in,
            )
        return url
    except ClientError as e:
        logger.error("presigned_upload_url_failed", key=storage_key, error=str(e))
        raise StorageError("presigned_url", str(e)) from e


async def object_exists(storage_key: str) -> bool:
    settings = get_settings()
    try:
        async with _get_s3_client() as s3:
            await s3.head_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=storage_key,
            )
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            return False
        raise StorageError("head_object", str(e)) from e


async def download_file_bytes(storage_key: str) -> bytes:
    """
    Download a file's raw bytes from object storage.
    Used by extraction workers to parse PDFs and audio files.
    """
    settings = get_settings()
    try:
        async with _get_s3_client() as s3:
            response = await s3.get_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=storage_key,
            )
            async with response["Body"] as stream:
                return await stream.read()
    except ClientError as e:
        logger.error("s3_download_failed", key=storage_key, error=str(e))
        raise StorageError("download", str(e)) from e


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


async def upload_verified_bytes(file_data: bytes, storage_key: str, content_type: str) -> tuple[str, str]:
    """Idempotent private PUT, confirmed by size/type/content hash before READY.

    A retry after an ambiguous successful PUT uses HEAD and does not upload again.
    No public ACL is ever set. Existing general-purpose uploads are unchanged.
    """
    import hashlib
    if not file_data or len(file_data) > 64 * 1024 * 1024:
        raise ValueError("Video artifact must be nonempty and <=64 MiB")
    settings = get_settings()
    digest = hashlib.sha256(file_data).hexdigest()
    def matches(head):
        return (head.get("ContentLength") == len(file_data)
                and head.get("ContentType") == content_type
                and head.get("Metadata", {}).get("sha256") == digest)
    async with _get_s3_client() as s3:
        try:
            if matches(await s3.head_object(Bucket=settings.S3_BUCKET_NAME, Key=storage_key)):
                return storage_key, ""
        except ClientError as exc:
            if str(exc.response.get("Error", {}).get("Code")) not in {"404", "NoSuchKey", "NotFound"}:
                raise
        await s3.put_object(Bucket=settings.S3_BUCKET_NAME, Key=storage_key, Body=file_data,
                            ContentType=content_type, Metadata={"sha256": digest})
        head = await s3.head_object(Bucket=settings.S3_BUCKET_NAME, Key=storage_key)
        if not matches(head):
            raise RuntimeError("Object upload confirmation mismatch")
    logger.info("video_artifact_upload_confirmed", key=storage_key, bytes_size=len(file_data))
    return storage_key, ""
