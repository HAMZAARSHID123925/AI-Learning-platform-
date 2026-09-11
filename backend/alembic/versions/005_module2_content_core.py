"""005 — Module 2: Courses, CourseModules, Lessons, LessonSkills"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'courses',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('instructor_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('slug', sa.String(500), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('status', sa.Enum('draft', 'published', 'archived', name='course_status', create_type=False), nullable=False, server_default='draft'),
        sa.Column('thumbnail_url', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('slug', name='uq_courses_slug'),
    )
    op.create_index('ix_courses_instructor_id', 'courses', ['instructor_id'])
    op.create_index('ix_courses_status', 'courses', ['status'])

    op.create_table(
        'course_modules',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('course_id', UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('sequence_order', sa.Integer, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('ix_course_modules_course_id', 'course_modules', ['course_id'])

    op.create_table(
        'lessons',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('module_id', UUID(as_uuid=True), sa.ForeignKey('course_modules.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('slug', sa.String(500), nullable=False),
        sa.Column('body_markdown', sa.Text, nullable=True),
        sa.Column('status', sa.Enum('draft', 'published', 'archived', name='lesson_status', create_type=False), nullable=False, server_default='draft'),
        sa.Column('sequence_order', sa.Integer, nullable=False),
        sa.Column('content_version', sa.Integer, nullable=False, server_default='1'),
        sa.Column('estimated_minutes', sa.Integer, nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('slug', name='uq_lessons_slug'),
    )
    op.create_index('ix_lessons_module_id', 'lessons', ['module_id'])
    op.create_index('ix_lessons_status', 'lessons', ['status'])
    op.create_index('ix_lessons_sequence', 'lessons', ['module_id', 'sequence_order'])

    op.create_table(
        'lesson_skills',
        sa.Column('lesson_id', UUID(as_uuid=True), sa.ForeignKey('lessons.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('skill_id', UUID(as_uuid=True), sa.ForeignKey('skill_taxonomy.id', ondelete='CASCADE'), primary_key=True),
    )


def downgrade() -> None:
    op.drop_table('lesson_skills')
    op.drop_table('lessons')
    op.drop_table('course_modules')
    op.drop_table('courses')
