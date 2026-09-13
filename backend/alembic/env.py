"""
Alembic environment configuration — async-compatible.

WHY async Alembic?
    Our SQLAlchemy engine uses asyncpg (async driver).
    Alembic's default env uses synchronous connections.
    We bridge the gap using run_sync() to execute migrations synchronously
    within an async context. This is the official Alembic async pattern.
"""

from __future__ import annotations

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Load all models so Alembic can detect schema changes for autogenerate.
# Order matters: shared models first (no dependencies), then dependents.
from app.database import Base
from app.modules.shared_models.skill_taxonomy import SkillTaxonomy  # noqa: F401
from app.modules.module1_auth.models import (  # noqa: F401
    User, Role, Permission, RolePermission, UserRole,
    RefreshToken, PasswordResetToken, AuditLog,
)
from app.modules.module2_content.models import (  # noqa: F401
    Course, CourseModule, Lesson, LessonSkill,
    ContentAsset, EmbeddingOutbox, ContentEmbedding,
)
from app.modules.module3_live.models import LiveSession, SessionAttendance  # noqa: F401
from app.modules.module4_experience.models import (  # noqa: F401
    StudentProgress, LearningPathState, Notification,
)
from app.modules.module5_assessment.models import (  # noqa: F401
    Test, Question, Submission, SkillScore,
)
from app.modules.module6_adaptive.models import (  # noqa: F401
    WeaknessFlag, RemediationPlan, RemediationPlanItem,
)

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url():
    """Get database URL from environment (overrides alembic.ini)."""
    import os
    return os.environ.get("DATABASE_URL") or config.get_main_option("sqlalchemy.url")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode — generates SQL without a live DB connection."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations using an async engine."""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
