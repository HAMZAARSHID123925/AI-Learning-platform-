"""
ELARION AI Learning Platform — Backend
Unit tests for Module 4 (Student Experience & Dashboard Layer)
"""

import json
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from app.modules.module1_auth.models import User
from app.modules.module4_experience.models import Notification, NotificationType, PathState
from app.modules.module4_experience.schemas import StudentDashboardResponse
from app.modules.module4_experience.services.dashboard_service import (
    get_aggregated_student_dashboard,
    get_dashboard_cache_key,
    invalidate_dashboard_cache,
)
from app.modules.module4_experience.services.notification_service import (
    create_and_publish_notification,
    get_notification_channel,
    mark_notification_as_read,
)
from app.modules.module4_experience.services.progress_service import get_course_progress


def test_dashboard_cache_key_generation():
    student_id = uuid.uuid4()
    key = get_dashboard_cache_key(student_id)
    assert f":cache:dashboard:{student_id}" in key


def test_notification_channel_generation():
    student_id = uuid.uuid4()
    channel = get_notification_channel(student_id)
    assert f":notifications:{student_id}" in channel


@pytest.mark.asyncio
async def test_invalidate_dashboard_cache():
    student_id = uuid.uuid4()
    mock_redis = AsyncMock()

    with patch("app.modules.module4_experience.services.dashboard_service.get_redis_client", return_value=mock_redis):
        await invalidate_dashboard_cache(student_id)
        mock_redis.delete.assert_called_once()
        call_arg = mock_redis.delete.call_args[0][0]
        assert str(student_id) in call_arg


@pytest.mark.asyncio
async def test_dashboard_cache_hit_returns_cached_response():
    student_id = uuid.uuid4()
    cached_payload = {
        "student_id": str(student_id),
        "student_name": "Test Learner",
        "enrolled_courses": [],
        "overall_completion_percentage": 75.0,
        "next_recommended_lesson": None,
        "skill_mastery_radar": [],
        "active_remediations": [],
        "unread_notifications_count": 2,
        "cached_at": datetime.now(timezone.utc).isoformat(),
    }

    mock_redis = AsyncMock()
    mock_redis.get.return_value = json.dumps(cached_payload)
    mock_db = AsyncMock()

    with patch("app.modules.module4_experience.services.dashboard_service.get_redis_client", return_value=mock_redis):
        result = await get_aggregated_student_dashboard(mock_db, student_id, use_cache=True)

        assert isinstance(result, StudentDashboardResponse)
        assert result.student_id == student_id
        assert result.student_name == "Test Learner"
        assert result.overall_completion_percentage == 75.0
        assert result.unread_notifications_count == 2
        # Ensure DB was never queried due to cache hit
        mock_db.get.assert_not_called()


@pytest.mark.asyncio
async def test_create_and_publish_notification():
    student_id = uuid.uuid4()
    mock_db = AsyncMock()
    mock_redis = AsyncMock()

    with patch("app.modules.module4_experience.services.notification_service.get_redis_client", return_value=mock_redis):
        notif = await create_and_publish_notification(
            db=mock_db,
            student_id=student_id,
            notification_type=NotificationType.remediation_plan_created,
            title="Remedial Guide Ready",
            body="A tailored written study guide has been synthesized for you.",
            payload={"plan_id": str(uuid.uuid4())},
        )

        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_redis.publish.assert_called_once()
        assert notif.student_id == student_id
        assert notif.read is False


@pytest.mark.asyncio
async def test_mark_notification_as_read():
    student_id = uuid.uuid4()
    notif_id = uuid.uuid4()
    existing_notif = Notification(
        id=notif_id,
        student_id=student_id,
        notification_type=NotificationType.general,
        title="Welcome",
        body="Welcome to ELARION",
        read=False,
        created_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = existing_notif
    mock_db.execute.return_value = mock_res

    updated = await mark_notification_as_read(mock_db, student_id, notif_id)

    assert updated.read is True
    assert updated.read_at is not None
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_get_course_progress_calculation():
    student_id = uuid.uuid4()
    course_id = uuid.uuid4()

    mock_db = AsyncMock()

    # Fixture parity/bounding is covered in test_course_progress_read.py.
    result = MagicMock()
    result.mappings.return_value.one.return_value = {
        "total": 10, "completed": 5, "locked": 2,
        "submission_id": None, "submission_status": None,
    }
    mock_db.execute.return_value = result

    progress = await get_course_progress(mock_db, student_id, course_id)

    assert progress["total_lessons"] == 10
    assert progress["completed_lessons"] == 5
    assert progress["locked_lessons"] == 2
    assert progress["percentage"] == 50.0
    assert progress["assessment_status"] == "not_started"
    assert progress["latest_submission_id"] is None
