"""
ELARION AI Learning Platform — Backend
Unit tests for Module 3 (Live Online Classes & Synchronous Learning)
"""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from app.modules.module2_content.models import Course
from app.modules.module3_live.models import AttendanceStatus, LiveSession, SessionAttendance, SessionStatus
from app.modules.module3_live.services.session_service import (
    cancel_live_session,
    create_live_session,
    join_live_session,
)
from app.modules.module3_live.services.video_provider import MockVideoProvider
from app.modules.module3_live.services.webhook_service import (
    handle_session_leave,
    verify_webhook_signature,
)
from app.shared.exceptions import BusinessRuleError


@pytest.mark.asyncio
async def test_mock_video_provider():
    provider = MockVideoProvider()
    assert provider.name == "mock"

    session_id = uuid.uuid4()
    user_id = uuid.uuid4()

    room_id, room_url = await provider.create_room(session_id, "Test Room", 50)
    assert str(session_id) in room_id
    assert room_id in room_url

    token = await provider.generate_token(room_id, user_id, is_host=True)
    assert "host" in token
    assert str(user_id) in token

    student_token = await provider.generate_token(room_id, user_id, is_host=False)
    assert "student" in student_token


@pytest.mark.asyncio
async def test_create_live_session():
    instructor_id = uuid.uuid4()
    course_id = uuid.uuid4()

    course = Course(id=course_id, title="AI Engineering")

    mock_db = AsyncMock()
    mock_db.get.return_value = course

    now = datetime.now(timezone.utc)
    session = await create_live_session(
        db=mock_db,
        instructor_id=instructor_id,
        course_id=course_id,
        title="Live Workshop 1",
        description="Intro to Transformers",
        scheduled_at=now + timedelta(days=1),
        duration_minutes=90,
        max_participants=50,
    )

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    assert session.title == "Live Workshop 1"
    assert session.status == SessionStatus.scheduled
    assert session.video_provider == "mock"
    assert session.max_participants == 50


@pytest.mark.asyncio
async def test_join_live_session_transitions_to_live_for_host():
    host_id = uuid.uuid4()
    session_id = uuid.uuid4()

    session = LiveSession(
        id=session_id,
        course_id=uuid.uuid4(),
        instructor_id=host_id,
        title="Live Coding Session",
        status=SessionStatus.scheduled,
        scheduled_at=datetime.now(timezone.utc),
        duration_minutes=60,
    )

    user = MagicMock()
    user.id = host_id
    user.has_role.return_value = False

    mock_db = AsyncMock()
    mock_db.get.return_value = session

    res_session, token = await join_live_session(mock_db, session_id, user)

    assert res_session.status == SessionStatus.live
    assert "host" in token
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_join_ended_session_raises_error():
    user = MagicMock()
    user.id = uuid.uuid4()
    session_id = uuid.uuid4()

    session = LiveSession(
        id=session_id,
        course_id=uuid.uuid4(),
        instructor_id=uuid.uuid4(),
        title="Finished Class",
        status=SessionStatus.ended,
        scheduled_at=datetime.now(timezone.utc),
    )

    mock_db = AsyncMock()
    mock_db.get.return_value = session

    with pytest.raises(BusinessRuleError, match="Cannot join a session that is ended"):
        await join_live_session(mock_db, session_id, user)


@pytest.mark.asyncio
async def test_cancel_session_only_allowed_when_scheduled():
    host_id = uuid.uuid4()
    session_id = uuid.uuid4()

    user = MagicMock()
    user.id = host_id
    user.has_role.return_value = False

    # 1. Cancel a scheduled session succeeds
    session_scheduled = LiveSession(
        id=session_id,
        course_id=uuid.uuid4(),
        instructor_id=host_id,
        title="Scheduled",
        status=SessionStatus.scheduled,
        scheduled_at=datetime.now(timezone.utc) + timedelta(hours=2),
    )
    mock_db = AsyncMock()
    mock_db.get.return_value = session_scheduled

    res = await cancel_live_session(mock_db, session_id, user)
    assert res.status == SessionStatus.cancelled

    # 2. Cancel a live session fails (rule 5)
    session_live = LiveSession(
        id=session_id,
        course_id=uuid.uuid4(),
        instructor_id=host_id,
        title="Live",
        status=SessionStatus.live,
        scheduled_at=datetime.now(timezone.utc),
    )
    mock_db.get.return_value = session_live

    with pytest.raises(BusinessRuleError, match="Live sessions must be ended"):
        await cancel_live_session(mock_db, session_id, user)


def test_verify_webhook_signature():
    payload = b'{"event":"session.join"}'
    # Test valid mock signature
    assert verify_webhook_signature(payload, "mock-valid-signature") is True


@pytest.mark.asyncio
async def test_handle_session_leave_calculates_duration_and_verifies_attendance():
    session_id = uuid.uuid4()
    student_id = uuid.uuid4()

    session = LiveSession(
        id=session_id,
        course_id=uuid.uuid4(),
        instructor_id=uuid.uuid4(),
        title="AI Workshop",
        duration_minutes=60,  # 60 min -> 50% threshold is 30 min (1800s)
        status=SessionStatus.live,
        scheduled_at=datetime.now(timezone.utc),
    )

    joined_time = datetime.now(timezone.utc) - timedelta(minutes=45)
    left_time = datetime.now(timezone.utc)

    attendance = SessionAttendance(
        id=uuid.uuid4(),
        session_id=session_id,
        student_id=student_id,
        status=AttendanceStatus.attended,
        joined_at=joined_time,
    )

    mock_db = AsyncMock()
    mock_db.get.return_value = session

    mock_res = MagicMock()
    mock_res.scalar_one_or_none.return_value = attendance
    mock_db.execute.return_value = mock_res

    res = await handle_session_leave(mock_db, session_id, student_id, left_time)

    # Attended 45 mins out of 60 mins -> duration ~2700s >= 1800s threshold
    assert res.duration_seconds is not None
    assert res.duration_seconds >= 2600
    assert res.attendance_verified is True
    mock_db.commit.assert_called_once()
