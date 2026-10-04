"""add course_id to test

Revision ID: 856dc43cb128
Revises: 6afbb004bacb
Create Date: 2026-10-02 12:58:50.290807

"""
from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '856dc43cb128'
down_revision: Union[str, None] = '6afbb004bacb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tests', sa.Column('course_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=True))
    op.create_index('ix_tests_course_id', 'tests', ['course_id'])
    op.alter_column('tests', 'lesson_id', existing_type=postgresql.UUID(as_uuid=True), nullable=True)
    op.alter_column('tests', 'lesson_version', existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    op.alter_column('tests', 'lesson_version', existing_type=sa.Integer(), nullable=False)
    op.alter_column('tests', 'lesson_id', existing_type=postgresql.UUID(as_uuid=True), nullable=False)
    op.drop_index('ix_tests_course_id', table_name='tests')
    op.drop_column('tests', 'course_id')
