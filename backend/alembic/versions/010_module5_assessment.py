"""010 — Module 5: Tests, Questions, Submissions, SkillScores"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM

revision = '010'
down_revision = '009'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'tests',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('lesson_id', UUID(as_uuid=True), sa.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False),
        sa.Column('lesson_version', sa.Integer, nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('is_focused_retest', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('ix_tests_lesson_id', 'tests', ['lesson_id'])

    op.create_table(
        'questions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('test_id', UUID(as_uuid=True), sa.ForeignKey('tests.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', UUID(as_uuid=True), sa.ForeignKey('skill_taxonomy.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('question_type', ENUM('mcq', 'short_answer', name='question_type', create_type=False), nullable=False),
        sa.Column('prompt', sa.Text, nullable=False),
        sa.Column('options', JSONB, nullable=True),
        sa.Column('rubric', sa.Text, nullable=True),
        sa.Column('max_score', sa.Numeric(5, 4), nullable=False, server_default='1.0'),
        sa.Column('source_chunk_ids', JSONB, nullable=True),
    )
    op.create_index('ix_questions_test_id', 'questions', ['test_id'])
    op.create_index('ix_questions_skill_id', 'questions', ['skill_id'])

    op.create_table(
        'submissions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('test_id', UUID(as_uuid=True), sa.ForeignKey('tests.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('student_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('attempt_number', sa.Integer, nullable=False, server_default='1'),
        sa.Column('status', ENUM('pending', 'grading', 'graded', 'error', name='submission_status', create_type=False), nullable=False, server_default='pending'),
        sa.Column('answers', JSONB, nullable=True),
        sa.Column('overall_score', sa.Numeric(5, 4), nullable=True),
        sa.Column('graded_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.UniqueConstraint('test_id', 'student_id', 'attempt_number', name='uq_submission_attempt'),
    )
    op.create_index('ix_submissions_student_id', 'submissions', ['student_id'])
    op.create_index('ix_submissions_status', 'submissions', ['status'])

    op.create_table(
        'skill_scores',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('submission_id', UUID(as_uuid=True), sa.ForeignKey('submissions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', UUID(as_uuid=True), sa.ForeignKey('skill_taxonomy.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('score', sa.Numeric(5, 4), nullable=False),
        sa.Column('max_score', sa.Numeric(5, 4), nullable=False, server_default='1.0'),
        sa.Column('grader_type', ENUM('deterministic', 'llm', name='grader_type', create_type=False), nullable=False),
        sa.Column('llm_feedback', sa.Text, nullable=True),
        sa.UniqueConstraint('submission_id', 'skill_id', name='uq_skill_score'),
    )
    op.create_index('ix_skill_scores_student_skill', 'skill_scores', ['submission_id', 'skill_id'])


def downgrade() -> None:
    op.drop_table('skill_scores')
    op.drop_table('submissions')
    op.drop_table('questions')
    op.drop_table('tests')
