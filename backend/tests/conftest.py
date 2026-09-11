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
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Use a dedicated test database URL
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://elarion_user:elarion_pass@localhost:5432/elarion_test",
)


@pytest.fixture(scope="session")
def event_loop():
    """
    Create a single event loop for the entire test session.
    Required for session-scoped async fixtures.
    """
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """
    Create the async engine for the test database.
    Session-scoped: created once, shared across all tests.
    """
    from app.database import Base

    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    # Create all tables at session start
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop all tables at session end
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture
async def db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """
    Provide a transactional database session for each test.

    Pattern: Savepoint-based rollback
        1. Begin an outer transaction (never committed)
        2. Create a SAVEPOINT for nested transaction support
        3. Test runs within the savepoint
        4. After test: rollback to savepoint → outer transaction rolled back
        5. Database is clean for the next test

    WHY SAVEPOINT?
        SQLAlchemy uses SAVEPOINT internally for nested transactions.
        Without this, session.begin_nested() would fail in tests.
    """
    connection = await test_engine.connect()
    trans = await connection.begin()
    session_factory = async_sessionmaker(bind=connection, expire_on_commit=False)
    session = session_factory()

    try:
        yield session
    finally:
        await session.close()
        await trans.rollback()
        await connection.close()


@pytest_asyncio.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Async HTTP test client with database session override.

    Uses FastAPI's dependency override to inject the test db session.
    This means: every API call during a test uses the same rolled-back session.
    All test data is isolated and never committed to the real database.
    """
    from app.database import get_db
    from app.main import create_app

    app = create_app()
    app.dependency_overrides[get_db] = lambda: db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def seeded_db(db: AsyncSession) -> AsyncSession:
    """
    A db session with roles and permissions pre-seeded.
    Use this in tests that need auth (login, protected endpoints).
    """
    from scripts.seed_data import seed_roles_and_permissions
    await seed_roles_and_permissions(db)
    await db.flush()
    return db
