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

_redis_pool: redis.ConnectionPool | None = None


def _get_pool() -> redis.ConnectionPool:
    """
    Get or create the Redis connection pool (singleton).

    WHY singleton pool?
        asyncio applications should have ONE pool shared across the event loop.
        Creating multiple pools wastes file descriptors and connections.
    """
    global _redis_pool
    if _redis_pool is None:
        settings = get_settings()
        _redis_pool = redis.ConnectionPool.from_url(
            settings.REDIS_URL,
            max_connections=50,         # Max concurrent Redis connections
            decode_responses=True,      # Return str instead of bytes
            socket_timeout=5,           # Fail fast on slow Redis
            socket_connect_timeout=3,
        )
    return _redis_pool


def get_redis_client() -> Redis:
    """
    Get a Redis client using the shared connection pool.
    Use this in background workers where FastAPI DI is not available.
    """
    return redis.Redis(connection_pool=_get_pool())


async def get_redis() -> AsyncGenerator[Redis, None]:
    """
    FastAPI dependency that provides a Redis client per request.

    Usage:
        @router.post("/example")
        async def my_endpoint(redis: Redis = Depends(get_redis)):
            await redis.set("key", "value", ex=300)

    The client is returned to the pool automatically.
    """
    client = redis.Redis(connection_pool=_get_pool())
    try:
        yield client
    finally:
        await client.aclose()


async def close_redis_pool() -> None:
    """
    Close the Redis connection pool gracefully.
    Called on application shutdown to release all connections cleanly.
    """
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None
