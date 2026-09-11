"""
ELARION AI Learning Platform — Backend
Module: app/modules/module2_content/services/asset_service.py

Purpose:
    File upload to S3/MinIO and presigned URL generation for content assets.
"""

from __future__ import annotations

import uuid

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.module2_content.models import AssetType, ContentAsset
from app.shared.exceptions import BusinessRuleError, ResourceNotFoundError
from app.shared.logging_config import get_logger
from app.shared.s3_client import generate_presigned_url, upload_file

logger = get_logger(__name__)

# Allowed MIME types per asset type
_ALLOWED_MIME: dict[str, tuple[str, ...]] = {
    "pdf": ("application/pdf",),
    "video": ("video/mp4", "video/webm", "video/quicktime"),
    "image": ("image/jpeg", "image/png", "image/webp", "image/gif"),
    "audio": ("audio/mpeg", "audio/ogg", "audio/wav"),
}

# Max file sizes (bytes)
_MAX_SIZE: dict[str, int] = {
    "pdf": 100 * 1024 * 1024,    # 100 MB
    "video": 2 * 1024 * 1024 * 1024,  # 2 GB
    "image": 10 * 1024 * 1024,   # 10 MB
    "audio": 200 * 1024 * 1024,  # 200 MB
}


async def upload_lesson_asset(
    db: AsyncSession,
    lesson_id: uuid.UUID,
    file: UploadFile,
    asset_type_str: str,
) -> ContentAsset:
    """
    Upload a file to S3/MinIO and create a ContentAsset record.

    Validates MIME type and file size before upload.
    """
    asset_type_str = asset_type_str.lower()
    if asset_type_str not in _ALLOWED_MIME:
        raise BusinessRuleError(f"Unknown asset type: {asset_type_str}")

    # Validate content type
    content_type = file.content_type or "application/octet-stream"
    allowed_mimes = _ALLOWED_MIME[asset_type_str]
    if content_type not in allowed_mimes:
        raise BusinessRuleError(
            f"Invalid MIME type '{content_type}' for asset type '{asset_type_str}'. "
            f"Allowed: {', '.join(allowed_mimes)}"
        )

    # Read file data
    file_data = await file.read()
    file_size = len(file_data)

    # Validate size
    max_size = _MAX_SIZE[asset_type_str]
    if file_size > max_size:
        raise BusinessRuleError(
            f"File too large: {file_size / 1024 / 1024:.1f} MB. "
            f"Max for {asset_type_str}: {max_size / 1024 / 1024:.0f} MB"
        )

    # Upload to S3/MinIO
    storage_key, _ = await upload_file(
        file_data=file_data,
        original_filename=file.filename or "upload",
        content_type=content_type,
        prefix=f"lessons/{lesson_id}/{asset_type_str}",
    )

    asset = ContentAsset(
        lesson_id=lesson_id,
        asset_type=AssetType(asset_type_str),
        original_filename=file.filename or "upload",
        storage_key=storage_key,
        file_size_bytes=file_size,
        mime_type=content_type,
    )
    db.add(asset)
    await db.flush()

    logger.info("asset_uploaded", asset_id=str(asset.id), lesson_id=str(lesson_id), type=asset_type_str)
    return asset


async def get_asset_with_url(db: AsyncSession, asset_id: uuid.UUID) -> tuple[ContentAsset, str]:
    """Fetch an asset and generate a presigned URL for it."""
    result = await db.execute(select(ContentAsset).where(ContentAsset.id == asset_id))
    asset = result.scalar_one_or_none()
    if not asset:
        raise ResourceNotFoundError("ContentAsset", str(asset_id))

    url = await generate_presigned_url(asset.storage_key, expires_in=3600)
    return asset, url
