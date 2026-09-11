"""002 — Shared SkillTaxonomy table

Dependency: 001 (uuid-ossp extension)
This table is referenced by Module 2 (LessonSkill), Module 5 (Question),
and Module 6 (WeaknessFlag). It must exist before all of them.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'skill_taxonomy',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('parent_id', UUID(as_uuid=True), sa.ForeignKey('skill_taxonomy.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('slug', sa.String(150), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('version', sa.Integer, nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('slug', name='uq_skill_taxonomy_slug'),
    )
    op.create_index('ix_skill_taxonomy_slug', 'skill_taxonomy', ['slug'])
    op.create_index('ix_skill_taxonomy_parent_id', 'skill_taxonomy', ['parent_id'])


def downgrade() -> None:
    op.drop_table('skill_taxonomy')
