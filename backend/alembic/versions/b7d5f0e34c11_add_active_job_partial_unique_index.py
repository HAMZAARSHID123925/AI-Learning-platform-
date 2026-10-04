"""Add active job partial unique index

Revision ID: b7d5f0e34c11
Revises: d48b1116c808
Create Date: 2026-10-02 13:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b7d5f0e34c11'
down_revision = 'd48b1116c808'
branch_labels = None
depends_on = None

def upgrade():
    op.create_index(
        'uq_active_video_job_per_weakness', 
        'video_generation_jobs', 
        ['weakness_flag_id'], 
        unique=True, 
        postgresql_where=sa.text("status IN ('queued', 'planning', 'scripting', 'audio_generating', 'assets_preparing', 'rendering', 'uploading')")
    )

def downgrade():
    op.drop_index('uq_active_video_job_per_weakness', table_name='video_generation_jobs')
