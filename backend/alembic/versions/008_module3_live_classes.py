"""008 — Module 3: Live Sessions and Attendance"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ENUM

revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'live_sessions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('course_id', UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('instructor_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('duration_minutes', sa.Integer, nullable=False, server_default='60'),
        sa.Column('status', ENUM('scheduled', 'live', 'ended', 'cancelled', name='session_status', create_type=False), nullable=False, server_default='scheduled'),
        sa.Column('video_provider', sa.String(50), nullable=True),
        sa.Column('room_id', sa.String(500), nullable=True),
        sa.Column('room_url', sa.Text, nullable=True),
        sa.Column('max_participants', sa.Integer, nullable=False, server_default='100'),
        sa.Column('recording_url', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('ix_live_sessions_course_id', 'live_sessions', ['course_id'])
    op.create_index('ix_live_sessions_scheduled_at', 'live_sessions', ['scheduled_at'])
    op.create_index('ix_live_sessions_status', 'live_sessions', ['status'])

    op.create_table(
        'session_attendances',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('session_id', UUID(as_uuid=True), sa.ForeignKey('live_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', ENUM('registered', 'attended', 'no_show', name='attendance_status', create_type=False), nullable=False, server_default='registered'),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('left_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('session_id', 'student_id', name='uq_session_attendance'),
    )
    op.create_index('ix_session_attendances_student_id', 'session_attendances', ['student_id'])


def downgrade() -> None:
    op.drop_table('session_attendances')
    op.drop_table('live_sessions')
