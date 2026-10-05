"""Persist adaptive events atomically with assessment grades."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision='018_test_graded_outbox'
down_revision='017_video_job_live_uniqueness'
branch_labels=None
depends_on=None

def upgrade():
    op.create_table('test_graded_outbox',sa.Column('submission_id',postgresql.UUID(as_uuid=True),sa.ForeignKey('submissions.id',ondelete='CASCADE'),primary_key=True),sa.Column('payload',postgresql.JSONB(),nullable=False),sa.Column('created_at',sa.DateTime(timezone=True),server_default=sa.func.now(),nullable=False),sa.Column('published_at',sa.DateTime(timezone=True),nullable=True))
    op.create_index('ix_test_graded_outbox_pending','test_graded_outbox',['published_at'])

def downgrade():
    op.drop_table('test_graded_outbox')
