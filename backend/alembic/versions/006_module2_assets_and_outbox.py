"""006 — Module 2: ContentAssets and EmbeddingOutbox"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'content_assets',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('lesson_id', UUID(as_uuid=True), sa.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False),
        sa.Column('asset_type', sa.Enum('pdf', 'video', 'image', 'audio', name='asset_type', create_type=False), nullable=False),
        sa.Column('original_filename', sa.String(500), nullable=False),
        sa.Column('storage_key', sa.Text, nullable=False),
        sa.Column('file_size_bytes', sa.Integer, nullable=True),
        sa.Column('mime_type', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('ix_content_assets_lesson_id', 'content_assets', ['lesson_id'])

    op.create_table(
        'embedding_outbox',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('lesson_id', UUID(as_uuid=True), sa.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False),
        sa.Column('lesson_version', sa.Integer, nullable=False),
        sa.Column('status', sa.Enum('pending', 'processing', 'completed', 'failed', name='outbox_status', create_type=False), nullable=False, server_default='pending'),
        sa.Column('attempts', sa.Integer, nullable=False, server_default='0'),
        sa.Column('last_error', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_embedding_outbox_status', 'embedding_outbox', ['status'])
    op.create_index('ix_embedding_outbox_lesson_version', 'embedding_outbox', ['lesson_id', 'lesson_version'])


def downgrade() -> None:
    op.drop_table('embedding_outbox')
    op.drop_table('content_assets')
