"""011 — Module 6: WeaknessFlags, RemediationPlans, RemediationPlanItems"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '011'
down_revision = '010'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'weakness_flags',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('student_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', UUID(as_uuid=True), sa.ForeignKey('skill_taxonomy.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('submission_id', UUID(as_uuid=True), sa.ForeignKey('submissions.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('score_at_flag', sa.Numeric(5, 4), nullable=False),
        sa.Column('threshold', sa.Numeric(5, 4), nullable=False, server_default='0.60'),
        sa.Column('status', sa.Enum('active', 'resolved', name='weakness_status', create_type=False), nullable=False, server_default='active'),
        sa.Column('resolution_submission_id', UUID(as_uuid=True), sa.ForeignKey('submissions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('student_id', 'skill_id', name='uq_active_weakness_per_student_skill'),
    )
    op.create_index('ix_weakness_flags_student_id', 'weakness_flags', ['student_id'])
    op.create_index('ix_weakness_flags_status', 'weakness_flags', ['status'])

    op.create_table(
        'remediation_plans',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('student_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('weakness_flag_id', UUID(as_uuid=True), sa.ForeignKey('weakness_flags.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.Enum('active', 'completed', 'escalated', name='plan_status', create_type=False), nullable=False, server_default='active'),
        sa.Column('retest_attempt_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('instructor_escalated', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_remediation_plans_student_id', 'remediation_plans', ['student_id'])
    op.create_index('ix_remediation_plans_status', 'remediation_plans', ['status'])

    op.create_table(
        'remediation_plan_items',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('plan_id', UUID(as_uuid=True), sa.ForeignKey('remediation_plans.id', ondelete='CASCADE'), nullable=False),
        sa.Column('lesson_id', UUID(as_uuid=True), sa.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sequence_order', sa.Integer, nullable=False),
        sa.Column('status', sa.Enum('pending', 'completed', 'skipped', name='plan_item_status', create_type=False), nullable=False, server_default='pending'),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_remediation_plan_items_plan_id', 'remediation_plan_items', ['plan_id'])


def downgrade() -> None:
    op.drop_table('remediation_plan_items')
    op.drop_table('remediation_plans')
    op.drop_table('weakness_flags')
