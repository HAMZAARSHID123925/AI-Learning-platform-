"""009 — Module 4: StudentProgress, LearningPathState, Notifications"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM

revision = '009'
down_revision = '008'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'student_progress',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('student_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('lesson_id', UUID(as_uuid=True), sa.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False),
        sa.Column('completed', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('time_spent_seconds', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('student_id', 'lesson_id', name='uq_student_progress_student_lesson'),
    )
    op.create_index('ix_student_progress_student_id', 'student_progress', ['student_id'])
    op.create_index('ix_student_progress_lesson_id', 'student_progress', ['lesson_id'])

    op.create_table(
        'learning_path_states',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('student_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('lesson_id', UUID(as_uuid=True), sa.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False),
        sa.Column('state', ENUM('unlocked', 'in_progress', 'mastered', 'locked', name='path_state', create_type=False), nullable=False, server_default='unlocked'),
        sa.Column('locked_reason', sa.Text, nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('student_id', 'lesson_id', name='uq_learning_path_state'),
    )
    op.create_index('ix_learning_path_states_student_id', 'learning_path_states', ['student_id'])
    op.create_index('ix_learning_path_states_state', 'learning_path_states', ['state'])

    op.create_table(
        'notifications',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('student_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('notification_type', ENUM(
            'remediation_plan_created', 'retest_ready', 'instructor_escalation',
            'session_reminder', 'course_published', 'general',
            name='notification_type', create_type=False
        ), nullable=False, server_default='general'),
        sa.Column('title', sa.String(300), nullable=False),
        sa.Column('body', sa.Text, nullable=False),
        sa.Column('payload', JSONB, nullable=True),
        sa.Column('read', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('ix_notifications_student_id_read', 'notifications', ['student_id', 'read'])
    op.create_index('ix_notifications_created_at', 'notifications', ['created_at'])


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('learning_path_states')
    op.drop_table('student_progress')
