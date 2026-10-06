"""Durable bounded MP4 checkpoint for upload-only recovery."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
revision = "020_video_upload_checkpoint"
down_revision = "019_course_scoped_weakness"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("video_generation_jobs", sa.Column("render_manifest_json", JSONB, nullable=True))
    op.add_column("video_generation_jobs", sa.Column("render_checkpoint_bytes", sa.LargeBinary, nullable=True))
    op.create_check_constraint("ck_video_checkpoint_size", "video_generation_jobs", "render_checkpoint_bytes IS NULL OR octet_length(render_checkpoint_bytes) <= 67108864")

def downgrade():
    op.drop_constraint("ck_video_checkpoint_size", "video_generation_jobs", type_="check")
    op.drop_column("video_generation_jobs", "render_checkpoint_bytes")
    op.drop_column("video_generation_jobs", "render_manifest_json")
