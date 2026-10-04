"""Add video fields to Lesson

Revision ID: 6afbb004bacb
Revises: 015_add_grade_to_user_and_course
Create Date: 2026-10-01 15:46:09.747316

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6afbb004bacb'
down_revision: Union[str, None] = '015_add_grade_to_user_and_course'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add video fields to lessons
    op.add_column('lessons', sa.Column('video_url', sa.Text(), nullable=True))
    op.add_column('lessons', sa.Column('thumbnail_url', sa.Text(), nullable=True))
    op.add_column('lessons', sa.Column('duration_seconds', sa.Integer(), nullable=True))
    op.create_check_constraint('ck_lessons_duration_seconds', 'lessons', 'duration_seconds >= 0')


def downgrade() -> None:
    # Remove video fields from lessons
    op.drop_constraint('ck_lessons_duration_seconds', 'lessons', type_='check')
    op.drop_column('lessons', 'duration_seconds')
    op.drop_column('lessons', 'thumbnail_url')
    op.drop_column('lessons', 'video_url')
