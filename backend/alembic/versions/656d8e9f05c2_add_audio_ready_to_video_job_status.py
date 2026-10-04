"""add_audio_ready_to_video_job_status

Revision ID: 656d8e9f05c2
Revises: f711e97d07b4
Create Date: 2026-10-02 14:48:46.241276

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '656d8e9f05c2'
down_revision: Union[str, None] = 'f711e97d07b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("COMMIT")
    op.execute("ALTER TYPE video_job_status ADD VALUE IF NOT EXISTS 'audio_ready' BEFORE 'rendering'")


def downgrade() -> None:
    pass
