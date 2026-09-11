"""001 — PostgreSQL Extensions and All Custom Enum Types

Why run this first?
    Extensions (uuid-ossp, pgvector) and custom ENUM types must exist before
    any table references them. This migration has NO dependencies.

Extensions:
    uuid-ossp: gen_random_uuid() default for UUID columns
    pgvector:  vector() column type for semantic similarity search

Enums:
    All platform enums defined here to centralize type registration.
    Naming convention: snake_case matching SQLAlchemy Enum(name=...) declarations.
"""

from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Module 1 Enums
    op.execute("CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification')")

    # Module 2 Enums
    op.execute("CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived')")
    op.execute("CREATE TYPE lesson_status AS ENUM ('draft', 'published', 'archived')")
    op.execute("CREATE TYPE asset_type AS ENUM ('pdf', 'video', 'image', 'audio')")
    op.execute("CREATE TYPE outbox_status AS ENUM ('pending', 'processing', 'completed', 'failed')")

    # Module 3 Enums
    op.execute("CREATE TYPE session_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled')")
    op.execute("CREATE TYPE attendance_status AS ENUM ('registered', 'attended', 'no_show')")

    # Module 4 Enums
    op.execute("CREATE TYPE path_state AS ENUM ('unlocked', 'in_progress', 'mastered', 'locked')")
    op.execute("CREATE TYPE notification_type AS ENUM ('remediation_plan_created', 'retest_ready', 'instructor_escalation', 'session_reminder', 'course_published', 'general')")

    # Module 5 Enums
    op.execute("CREATE TYPE question_type AS ENUM ('mcq', 'short_answer')")
    op.execute("CREATE TYPE grader_type AS ENUM ('deterministic', 'llm')")
    op.execute("CREATE TYPE submission_status AS ENUM ('pending', 'grading', 'graded', 'error')")

    # Module 6 Enums
    op.execute("CREATE TYPE weakness_status AS ENUM ('active', 'resolved')")
    op.execute("CREATE TYPE plan_status AS ENUM ('active', 'completed', 'escalated')")
    op.execute("CREATE TYPE plan_item_status AS ENUM ('pending', 'completed', 'skipped')")


def downgrade() -> None:
    op.execute("DROP TYPE IF EXISTS plan_item_status")
    op.execute("DROP TYPE IF EXISTS plan_status")
    op.execute("DROP TYPE IF EXISTS weakness_status")
    op.execute("DROP TYPE IF EXISTS submission_status")
    op.execute("DROP TYPE IF EXISTS grader_type")
    op.execute("DROP TYPE IF EXISTS question_type")
    op.execute("DROP TYPE IF EXISTS notification_type")
    op.execute("DROP TYPE IF EXISTS path_state")
    op.execute("DROP TYPE IF EXISTS attendance_status")
    op.execute("DROP TYPE IF EXISTS session_status")
    op.execute("DROP TYPE IF EXISTS outbox_status")
    op.execute("DROP TYPE IF EXISTS asset_type")
    op.execute("DROP TYPE IF EXISTS lesson_status")
    op.execute("DROP TYPE IF EXISTS course_status")
    op.execute("DROP TYPE IF EXISTS user_status")
    op.execute("DROP EXTENSION IF EXISTS vector")
    op.execute("DROP EXTENSION IF EXISTS \"uuid-ossp\"")
