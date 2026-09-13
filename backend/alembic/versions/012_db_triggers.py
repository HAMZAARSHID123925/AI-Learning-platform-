"""012 — DB-level triggers: updated_at auto-update

Applies updated_at triggers to all tables that have that column.
This removes the need for application-level onupdate= handlers
(SQLAlchemy onupdate only fires on ORM updates, not raw SQL updates).

WHY a DB trigger instead of ORM onupdate?
    If anyone runs raw SQL (e.g., Alembic data migrations, admin scripts),
    the ORM hook doesn't fire. The trigger fires regardless of how the
    update is made — it's enforced at the database level.
"""

from alembic import op

revision = '012'
down_revision = '011'
branch_labels = None
depends_on = None

TABLES_WITH_UPDATED_AT = [
    'users',
    'courses',
    'lessons',
    'live_sessions',
    'student_progress',
    'learning_path_states',
]


def upgrade() -> None:
    # Create the trigger function once
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)

    # Apply trigger to each table
    for table in TABLES_WITH_UPDATED_AT:
        op.execute(f"""
            CREATE TRIGGER set_{table}_updated_at
            BEFORE UPDATE ON {table}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        """)


def downgrade() -> None:
    for table in TABLES_WITH_UPDATED_AT:
        op.execute(f"DROP TRIGGER IF EXISTS set_{table}_updated_at ON {table}")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column")
