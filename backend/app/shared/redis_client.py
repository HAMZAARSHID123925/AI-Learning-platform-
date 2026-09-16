"""
ELARION AI Learning Platform — Backend
Module: app/shared/redis_client.py

Purpose:
    Async Redis client with connection pooling.
    Provides the get_redis FastAPI dependency and a standalone client
    for background workers.

Why connection pooling?
    Without a pool, each Redis operation would open a new TCP connection.
    Opening a TCP connection: ~1-3ms. With a pool: ~0.01ms (reuse).
    Under 100 req/s this adds up to seconds of wasted latency.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

import redis.asyncio as redis
from redis.asyncio import Redis

from app.config import get_settings

from app.shared.mock_redis import MockRedisClient

from typing import Any
_redis_pool: redis.ConnectionPool | None = None
_mock_redis: MockRedisClient = MockRedisClient()

def _get_pool() -> redis.ConnectionPool | None:
    global _redis_pool
    if _redis_pool is None:
        try:
            settings = get_settings()
            _redis_pool = redis.ConnectionPool.from_url(
                settings.REDIS_URL,
                max_connections=50,
                decode_responses=True,
                socket_timeout=1,
                socket_connect_timeout=1,
            )
        except Exception:
            _redis_pool = None
    return _redis_pool

def get_redis_client() -> Any:
    pool = _get_pool()
    if pool:
        try:
            return redis.Redis(connection_pool=pool)
        except Exception:
            pass
    return _mock_redis

async def get_redis() -> AsyncGenerator[Any, None]:
    pool = _get_pool()
    if pool:
        try:
            client = redis.Redis(connection_pool=pool)
            # Test connectivity
            await client.ping()
            try:
                yield client
            finally:
                await client.aclose()
            return
        except Exception:
            # Fallback to mock redis in local dev if Redis server is down
            pass
    yield _mock_redis


async def close_redis_pool() -> None:
    """
    Close the Redis connection pool gracefully.
    Called on application shutdown to release all connections cleanly.
    """
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None
