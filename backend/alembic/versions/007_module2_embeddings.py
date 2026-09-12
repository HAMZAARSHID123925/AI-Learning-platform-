"""007 — Module 2: ContentEmbeddings (pgvector)

This migration creates the vector embedding table.
Vector dimension: 384 (BAAI/bge-small-en-v1.5 via FastEmbed — dev)

IMPORTANT — Production Switch:
    When switching to OpenAI text-embedding-3-small (1536 dims):
    1. Create a new migration: ALTER TABLE content_embeddings ALTER COLUMN embedding TYPE vector(1536)
    2. Drop all existing embeddings (or re-embed)
    3. Update EMBEDDING_DIM=1536 and EMBEDDING_MODEL in .env
    The code is designed for this — EMBEDDING_DIM is read from config.

WHY vector(384) in dev?
    FastEmbed BAAI/bge-small-en-v1.5 outputs 384-dim vectors.
    Running locally: zero API cost, zero latency (no network).
    Quality: excellent for semantic similarity, suitable for RAG in dev/testing.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None

# CHANGE THIS when switching embedding model in production
EMBEDDING_DIM = 384


def upgrade() -> None:
    op.create_table(
        'content_embeddings',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('lesson_id', UUID(as_uuid=True), sa.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False),
        sa.Column('lesson_version', sa.Integer, nullable=False),
        sa.Column('chunk_index', sa.Integer, nullable=False),
        sa.Column('chunk_text', sa.Text, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('lesson_id', 'lesson_version', 'chunk_index', name='uq_content_embeddings_lesson_chunk'),
    )

    # Add vector column using raw SQL (pgvector type not supported by SQLAlchemy natively without extension)
    op.execute(f"ALTER TABLE content_embeddings ADD COLUMN embedding vector({EMBEDDING_DIM})")

    # IVFFlat index for approximate nearest-neighbor search
    # lists=100: good for datasets up to ~1M vectors. Tune in production.
    # WHY IVFFlat over HNSW?
    #   IVFFlat: faster to build, slightly slower to query.
    #   HNSW: slower to build, faster to query, more memory.
    #   For dev: IVFFlat is fine. Switch to HNSW in production with large datasets.
    op.execute(
        "CREATE INDEX ix_content_embeddings_vector ON content_embeddings "
        f"USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )
    op.create_index('ix_content_embeddings_lesson_id', 'content_embeddings', ['lesson_id'])


def downgrade() -> None:
    op.drop_table('content_embeddings')
