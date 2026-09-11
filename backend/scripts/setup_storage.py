"""
ELARION AI Learning Platform — Backend
Script: scripts/setup_storage.py

Purpose:
    Create required MinIO buckets on first deployment.
    Safe to run multiple times (idempotent — checks before creating).

Buckets created:
    elarion-assets: All uploaded files (PDFs, videos, images, audio)

Run this ONCE after starting MinIO for the first time.
"""

from __future__ import annotations

import asyncio

import aiobotocore.session
from botocore.exceptions import ClientError

from app.config import get_settings


async def setup_buckets() -> None:
    settings = get_settings()

    if not settings.S3_ENDPOINT_URL:
        print("⚠  S3_ENDPOINT_URL not set — assuming real AWS S3. Bucket creation skipped.")
        print("   Create the bucket manually in the AWS console.")
        return

    print(f"🪣 Setting up MinIO buckets at {settings.S3_ENDPOINT_URL}...")

    session = aiobotocore.session.get_session()
    async with session.create_client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY_ID,
        aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
        region_name=settings.S3_REGION,
    ) as s3:
        bucket = settings.S3_BUCKET_NAME
        try:
            await s3.head_bucket(Bucket=bucket)
            print(f"  ✓ Bucket '{bucket}' already exists.")
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code in ("404", "NoSuchBucket"):
                await s3.create_bucket(Bucket=bucket)
                print(f"  ✓ Bucket '{bucket}' created.")
            else:
                raise

    print("✅ Storage setup complete.")
    print()
    print("MinIO Console: http://localhost:9001")
    print(f"  Username: {settings.S3_ACCESS_KEY_ID}")
    print("  Password: (from .env S3_SECRET_ACCESS_KEY)")


if __name__ == "__main__":
    asyncio.run(setup_buckets())
