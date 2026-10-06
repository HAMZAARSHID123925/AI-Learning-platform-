"""Private object relay with exact course/lesson key, size and MIME boundaries."""
import re
from app.config import get_settings
from app.shared.exceptions import ValidationError
from app.shared.s3_client import _get_s3_client


def validate_relay(course_id, lesson_id, key, media_type, content_type, size):
    settings = get_settings()
    folders = {"course_thumbnail": f"course-content/{course_id}/thumbnail/",
               "lesson_video": f"course-content/{course_id}/lessons/{lesson_id}/video/",
               "lesson_thumbnail": f"course-content/{course_id}/lessons/{lesson_id}/thumbnail/"}
    if media_type not in folders or (media_type.startswith("lesson_") and lesson_id is None):
        raise ValidationError("Invalid media target")
    prefix = folders[media_type]
    if not key.startswith(prefix) or not re.fullmatch(r"[0-9a-f-]{36}\.(mp4|webm|jpg|jpeg|png|webp)", key[len(prefix):]):
        raise ValidationError("Invalid upload key for this media target")
    allowed = {"video/mp4", "video/webm"} if media_type == "lesson_video" else {"image/jpeg", "image/png", "image/webp"}
    limit = settings.MAX_VIDEO_SIZE_BYTES if media_type == "lesson_video" else settings.MAX_IMAGE_SIZE_BYTES
    if content_type not in allowed:
        raise ValidationError("Unsupported media format")
    if not isinstance(size, int) or not 0 < size <= limit:
        raise ValidationError("File is empty or exceeds the upload limit")


async def store_relay(key, file):
    settings = get_settings()
    async with _get_s3_client() as client:
        await client.put_object(Bucket=settings.S3_BUCKET_NAME, Key=key, Body=file.file,
                                ContentLength=file.size, ContentType=file.content_type)
