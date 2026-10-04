"""
ELARION AI Learning Platform — Backend
tests/conftest.py

Purpose:
    Shared pytest fixtures for the entire test suite.

Test Database Strategy:
    WHY a separate test database?
        Tests must not touch production/dev data.
        We spin up a fresh PostgreSQL schema per test session.

    SQLite is NOT used:
        pgvector, INET, JSONB, ENUM types require real PostgreSQL.
        Testing against SQLite would be a lie — your code would break on real Postgres.

    Transaction rollback per test:
        Each test runs in a transaction that's rolled back after completion.
        This is 100x faster than dropping and recreating tables.
        Pattern: Begin transaction → test runs → rollback (no commit).

    WHY fixtures instead of setUp/tearDown?
        Pytest fixtures compose better, are more explicit, and are reusable across modules.
        They also support async natively with pytest-asyncio.
"""

from __future__ import annotations

import asyncio
import os
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from sqlalchemy.pool import NullPool

def _get_test_db_url() -> str:
    if os.environ.get("ENVIRONMENT") != "test":
        raise RuntimeError("Tests must be run with ENVIRONMENT=test")
    test_url = os.environ.get("TEST_DATABASE_URL")
    if not test_url:
        raise RuntimeError("TEST_DATABASE_URL environment variable is required to run tests.")
    return test_url

TEST_DATABASE_URL = _get_test_db_url()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def init_test_db():
    """
    Initialize test database schema and seeds once per test session.
    """
    from app.database import Base
    import app.modules.shared_models.skill_taxonomy  # noqa: F401
    import app.modules.module1_auth.models  # noqa: F401
    import app.modules.module2_content.models  # noqa: F401
    import app.modules.module3_live.models  # noqa: F401
    import app.modules.module4_experience.models  # noqa: F401
    import app.modules.module5_assessment.models  # noqa: F401
    import app.modules.module6_adaptive.models  # noqa: F401

    try:
        engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool, echo=False)
        async with engine.begin() as conn:
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector'))
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

        session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)
        async with session_factory() as session:
            from scripts.seed_data import seed_roles_and_permissions, seed_skill_taxonomy
            await seed_roles_and_permissions(session)
            await seed_skill_taxonomy(session)
            await session.commit()

        await engine.dispose()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("PostgreSQL test database not reachable at %s. Integration tests requiring DB will fail: %s", TEST_DATABASE_URL, e)


@pytest_asyncio.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    """
    Provide an isolated transactional database session for each test.
    Rolls back at the end of every test to ensure zero pollution.
    """
    engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool, echo=False)
    connection = await engine.connect()
    trans = await connection.begin()
    session_factory = async_sessionmaker(bind=connection, expire_on_commit=False)
    session = session_factory()

    try:
        yield session
    finally:
        await session.close()
        await trans.rollback()
        await connection.close()
        await engine.dispose()


@pytest_asyncio.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Async HTTP test client with database session override and isolated Redis client.
    """
    from app.database import get_db
    from app.main import create_app
    from app.shared.redis_client import get_redis
    from app.config import get_settings
    import redis.asyncio as aioredis

    app = create_app()

    async def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db

    test_redis_url = os.environ.get("TEST_REDIS_URL")
    if not test_redis_url:
        raise RuntimeError("TEST_REDIS_URL environment variable is required to run tests (preventing accidental flushdb).")

    test_redis = aioredis.from_url(
        test_redis_url,
        decode_responses=True,
        socket_timeout=5,
        socket_connect_timeout=3,
    )

    async def _override_get_redis():
        yield test_redis

    app.dependency_overrides[get_redis] = _override_get_redis

    await test_redis.flushdb()

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    await test_redis.flushdb()
    await test_redis.aclose()
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def seeded_db(db: AsyncSession) -> AsyncSession:
    """
    A db session with roles and permissions pre-seeded.
    """
    return db
