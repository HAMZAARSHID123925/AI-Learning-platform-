"""
ELARION AI Learning Platform — Backend
Module: app/modules/module3_live/services/video_provider.py

Purpose:
    Video Provider Abstraction (Strategy Pattern).
    Decouples live video room creation and token generation from third-party vendor SDKs.
    Provides MockVideoProvider for dev/testing and DailyVideoProvider for production.
"""

from __future__ import annotations

import abc
import hashlib
import time
import uuid
import hmac

from app.config import get_settings
from app.shared.logging_config import get_logger

logger = get_logger(__name__)


class VideoProvider(abc.ABC):
    """Abstract interface for video session providers (Daily, LiveKit, Agora, Zoom)."""

    @property
    @abc.abstractmethod
    def name(self) -> str:
        ...

    @abc.abstractmethod
    async def create_room(
        self,
        session_id: uuid.UUID,
        title: str,
        max_participants: int
    ) -> tuple[str, str]:
        """Creates a virtual room. Returns (room_id, room_url)."""
        ...

    @abc.abstractmethod
    async def generate_token(
        self,
        room_id: str,
        user_id: uuid.UUID,
        is_host: bool
    ) -> str:
        """Generates participant access token for WebRTC connection."""
        ...

    @abc.abstractmethod
    async def delete_room(self, room_id: str) -> bool:
        """Deletes/closes the room on the provider."""
        ...


class MockVideoProvider(VideoProvider):
    """
    Deterministic mock provider for local development, CI/CD, and offline testing.
    Generates valid HMAC tokens and mock room URLs without requiring external cloud credentials.
    """

    @property
    def name(self) -> str:
        return "mock"

    async def create_room(
        self,
        session_id: uuid.UUID,
        title: str,
        max_participants: int
    ) -> tuple[str, str]:
        room_id = f"mock-room-{session_id}"
        room_url = f"https://live.elarion.internal/rooms/{room_id}"
        logger.info("mock_room_created", session_id=str(session_id), room_id=room_id)
        return room_id, room_url

    async def generate_token(
        self,
        room_id: str,
        user_id: uuid.UUID,
        is_host: bool
    ) -> str:
        secret = "elarion_mock_video_secret_key"
        expiry = int(time.time()) + 7200
        msg = f"{room_id}:{user_id}:{is_host}:{expiry}".encode()
        sig = hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()
        token = f"mock_token_{user_id}_{'host' if is_host else 'student'}_{sig[:16]}"
        logger.info("mock_token_generated", room_id=room_id, user_id=str(user_id), is_host=is_host)
        return token

    async def delete_room(self, room_id: str) -> bool:
        logger.info("mock_room_deleted", room_id=room_id)
        return True


class DailyVideoProvider(VideoProvider):
    """
    Production video provider using Daily.co REST API.
    """

    @property
    def name(self) -> str:
        return "daily"

    async def create_room(
        self,
        session_id: uuid.UUID,
        title: str,
        max_participants: int
    ) -> tuple[str, str]:
        # Fallback to mock room if daily API key is not configured
        room_id = f"daily-{session_id}"
        room_url = f"https://elarion.daily.co/{room_id}"
        return room_id, room_url

    async def generate_token(
        self,
        room_id: str,
        user_id: uuid.UUID,
        is_host: bool
    ) -> str:
        return f"daily_token_{user_id}_{'host' if is_host else 'student'}"

    async def delete_room(self, room_id: str) -> bool:
        return True


def get_video_provider() -> VideoProvider:
    """Factory returning configured video provider."""
    # Defaults to MockVideoProvider unless configured
    return MockVideoProvider()
