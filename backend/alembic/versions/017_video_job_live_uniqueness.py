"""Protect all in-progress video states from concurrent duplicate requests."""
from alembic import op
revision='017_video_job_live_uniqueness'
down_revision='016_owned_remediation_retest'
branch_labels=None
depends_on=None

def upgrade():
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_live_video_job_per_weakness_v2 ON video_generation_jobs (weakness_flag_id) WHERE status NOT IN ('ready', 'failed')")

def downgrade():
    op.drop_index('uq_live_video_job_per_weakness_v2',table_name='video_generation_jobs')
