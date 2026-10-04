"""add storyboard_ready

Revision ID: f711e97d07b4
Revises: b7d5f0e34c11
Create Date: 2026-10-02 14:20:51.974266

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f711e97d07b4'
down_revision: Union[str, None] = 'b7d5f0e34c11'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ALTER TYPE cannot be run inside a transaction block in Postgres
    # so we must commit the current transaction first
    op.execute("COMMIT")
    op.execute("ALTER TYPE video_job_status ADD VALUE IF NOT EXISTS 'storyboard_ready' BEFORE 'assets_preparing'")


def downgrade() -> None:
    pass
