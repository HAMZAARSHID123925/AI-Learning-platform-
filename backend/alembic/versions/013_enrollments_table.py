"""013 — Module 4: Enrollments table

Tracks student course enrollments, linking users to courses.
Enforces unique (student_id, course_id) so students cannot be double-enrolled.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '013'
down_revision = '012'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'enrollments',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('student_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('course_id', UUID(as_uuid=True), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='active'),
        sa.Column('enrolled_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('student_id', 'course_id', name='uq_enrollments_student_course'),
    )
    op.create_index('ix_enrollments_student_id', 'enrollments', ['student_id'])
    op.create_index('ix_enrollments_course_id', 'enrollments', ['course_id'])

    # Apply updated_at trigger
    op.execute("""
        CREATE TRIGGER update_enrollments_updated_at
        BEFORE UPDATE ON enrollments
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS update_enrollments_updated_at ON enrollments;")
    op.drop_index('ix_enrollments_course_id', table_name='enrollments')
    op.drop_index('ix_enrollments_student_id', table_name='enrollments')
    op.drop_table('enrollments')
