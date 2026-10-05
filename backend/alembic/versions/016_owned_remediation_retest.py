"""Persist the owned focused-retest handoff; additive and retry-safe."""
from alembic import op
revision = "016_owned_remediation_retest"
down_revision = "15fc1715d468"
branch_labels = None
depends_on = None

def upgrade():
    op.execute("ALTER TABLE remediation_plans ADD COLUMN IF NOT EXISTS focused_retest_id UUID REFERENCES tests(id) ON DELETE SET NULL")

def downgrade():
    op.drop_column("remediation_plans", "focused_retest_id")
