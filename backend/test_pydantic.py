from app.modules.module2_content.schemas import LessonResponse
from datetime import datetime
import uuid

lesson = LessonResponse(
    id=uuid.uuid4(),
    module_id=uuid.uuid4(),
    title="Test",
    slug="test",
    status="draft",
    sequence_order=1,
    content_version=1,
    estimated_minutes=15,
    video_url="http://vid",
    thumbnail_url="http://thumb",
    duration_seconds=180,
    skill_ids=[],
    published_at=datetime.now(),
    created_at=datetime.now(),
    updated_at=datetime.now()
)

print(lesson.model_dump_json(indent=2))
