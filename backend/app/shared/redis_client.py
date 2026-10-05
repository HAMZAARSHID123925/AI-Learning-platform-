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
from redis.exceptions import TimeoutError as RedisTimeoutError

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
                socket_timeout=10,
                socket_connect_timeout=5,
            )
        except Exception:
            _redis_pool = None
    return _redis_pool

def get_redis_client() -> Any:
    settings = get_settings()
    pool = _get_pool()
    if pool:
        try:
            return redis.Redis(connection_pool=pool)
        except Exception as e:
            if settings.is_production:
                raise RuntimeError(f"Redis connection failed in production: {e}") from e
    if settings.is_production:
        raise RuntimeError("Redis connection pool unavailable in production. Cannot use MockRedis.")
    raise RuntimeError("Redis connection pool unavailable")

async def get_redis() -> AsyncGenerator[Any, None]:
    settings = get_settings()
    pool = _get_pool()
    client = None
    if pool:
        try:
            test_client = redis.Redis(connection_pool=pool)
            await test_client.ping()
            client = test_client
        except Exception as e:
            if settings.is_production:
                raise RuntimeError(f"Redis ping failed in production: {e}") from e
    
    if client is not None:
        yield client
    else:
        if settings.is_production:
            raise RuntimeError("Redis connection pool unavailable in production. Cannot use MockRedis.")
        raise RuntimeError("Redis authentication dependency unavailable")


async def close_redis_pool() -> None:
    """
    Close the Redis connection pool gracefully.
    Called on application shutdown to release all connections cleanly.
    """
    global _redis_pool
    if _redis_pool is not None:
        try:
            await _redis_pool.aclose()
        except (TimeoutError, RedisTimeoutError, OSError):
            # TLS shutdown failure must not turn successful requests into failures.
            pass
        finally:
            _redis_pool = None
