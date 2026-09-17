"""014 — Add remedial course fields to remediation_plans"""

from alembic import op
import sqlalchemy as sa

revision = '014'
down_revision = '013'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('remediation_plans', sa.Column('remedial_course_title', sa.String(255), nullable=True))
    op.add_column('remediation_plans', sa.Column('remedial_course_markdown', sa.Text(), nullable=True))
    op.add_column('remediation_plans', sa.Column('study_completed', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('remediation_plans', sa.Column('study_completed_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('remediation_plans', 'study_completed_at')
    op.drop_column('remediation_plans', 'study_completed')
    op.drop_column('remediation_plans', 'remedial_course_markdown')
    op.drop_column('remediation_plans', 'remedial_course_title')
