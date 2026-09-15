"""
In-memory Mock Redis client for local development when Redis server is offline.
Supports sliding window rate-limiting (incr, expire, ttl), get, set, delete, and pubsub stub.
"""
import time
from typing import Any, Dict, Optional

class MockRedisClient:
    def __init__(self):
        self._store: Dict[str, Any] = {}
        self._expires: Dict[str, float] = {}

    def _clean_expired(self, key: str):
        if key in self._expires and time.time() > self._expires[key]:
            self._store.pop(key, None)
            self._expires.pop(key, None)

    async def incr(self, key: str) -> int:
        self._clean_expired(key)
        val = self._store.get(key, 0)
        try:
            val = int(val) + 1
        except (ValueError, TypeError):
            val = 1
        self._store[key] = val
        return val

    async def expire(self, key: str, seconds: int) -> bool:
        self._expires[key] = time.time() + seconds
        return True

    async def ttl(self, key: str) -> int:
        self._clean_expired(key)
        if key not in self._store:
            return -2
        if key not in self._expires:
            return -1
        remaining = int(self._expires[key] - time.time())
        return max(0, remaining)

    async def get(self, key: str) -> Optional[str]:
        self._clean_expired(key)
        return self._store.get(key)

    async def set(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        self._store[key] = str(value)
        if ex is not None:
            self._expires[key] = time.time() + ex
        return True

    async def delete(self, *keys: str) -> int:
        count = 0
        for k in keys:
            if k in self._store:
                self._store.pop(k, None)
                self._expires.pop(k, None)
                count += 1
        return count

    async def aclose(self) -> None:
        pass
