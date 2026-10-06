"""
ELARION AI Learning Platform — Backend
Module: app/database.py

Purpose:
    Async SQLAlchemy database engine and session management.
    Provides the declarative Base all models inherit from,
    the async engine, and the get_db dependency.

Industry Practice: Repository Pattern + Unit of Work
    Each request gets one database session (Unit of Work).
    The session is injected via FastAPI's dependency injection.
    Session is committed only on success; rolled back on any exception.
    This ensures atomicity: partial writes never persist.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings


class Base(DeclarativeBase):
    """
    Declarative base class for all SQLAlchemy models.

    All models inherit from this class to:
    1. Register themselves with the metadata (required for Alembic autogenerate)
    2. Gain access to the mapping infrastructure

    Note: Models are NOT imported here — they are imported in alembic/env.py
    and in the main app to ensure they are registered before any migration runs.
    """
    pass


def _create_engine(database_url: str) -> AsyncEngine:
    """
    Create an async SQLAlchemy engine with production-grade settings.

    Key settings explained:
    - pool_size=10: Number of persistent connections in the pool.
      For a single API server under normal load, 10 is a good baseline.
    - max_overflow=20: Additional connections allowed beyond pool_size.
      Total max = 30 connections.
    - pool_pre_ping=True: Executes a cheap SELECT 1 before handing a
      connection from the pool. Detects and removes stale connections
      (e.g., after Postgres restarts). Without this, you'd get cryptic
      "connection closed" errors.
    - pool_recycle=1800: Recycle connections every 30 min. Prevents
      Postgres from closing idle connections (Postgres default: idle=10min).
    - echo=False in production — query logging is expensive.
    """
    settings = get_settings()
    return create_async_engine(
        database_url,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=1800,
        hide_parameters=True,  # Never log persisted audio bytes, signed URLs or secrets.
        echo=settings.is_development,  # Log SQL in dev only
    )


settings = get_settings()

# Primary async engine
engine: AsyncEngine = _create_engine(settings.DATABASE_URL)

# Session factory — produces AsyncSession instances
# expire_on_commit=False: After commit(), ORM objects remain accessible.
# Without this, accessing attributes after commit() would trigger lazy loads
# which don't work in async context.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,  # Manual flush control — we flush explicitly when needed
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session per request.

    Usage:
        @router.get("/example")
        async def my_endpoint(db: AsyncSession = Depends(get_db)):
            ...

    Lifecycle:
        1. Session is created at request start
        2. Session is injected into the route handler
        3. On success: session is committed
        4. On any exception: session is rolled back
        5. Session is always closed (returned to pool)

    WHY not auto-commit in the dependency?
        The route handler owns the transaction. Services do NOT call commit().
        Only this dependency commits. This enforces a clean boundary:
        services perform operations, the request lifecycle manages transactions.
    """
    session = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for use outside of FastAPI request lifecycle.
    Used by background workers (embedding worker, adaptive consumer).

    Usage:
        async with get_db_session() as db:
            result = await db.execute(select(User))
            await db.commit()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
