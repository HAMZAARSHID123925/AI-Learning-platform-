"""Keep different courses' remediation lifecycles independent."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
revision = "019_course_scoped_weakness"
down_revision = "018_test_graded_outbox"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("remediation_plans", sa.Column("source_submission_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.execute("UPDATE remediation_plans p SET source_submission_id = w.submission_id FROM weakness_flags w WHERE w.id = p.weakness_flag_id")
    op.create_foreign_key("fk_remediation_source_submission", "remediation_plans", "submissions", ["source_submission_id"], ["id"], ondelete="SET NULL")
    op.add_column("weakness_flags", sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.execute("""
        UPDATE weakness_flags w SET course_id = COALESCE(t.course_id, m.course_id)
        FROM submissions s JOIN tests t ON t.id = s.test_id
        LEFT JOIN lessons l ON l.id = t.lesson_id
        LEFT JOIN course_modules m ON m.id = l.module_id
        WHERE s.id = w.submission_id
    """)
    # Abort transaction if an orphan cannot be grounded; never guess its course.
    op.alter_column("weakness_flags", "course_id", nullable=False)
    op.create_foreign_key("fk_weakness_course", "weakness_flags", "courses", ["course_id"], ["id"], ondelete="CASCADE")
    op.drop_constraint("uq_active_weakness_per_student_skill", "weakness_flags", type_="unique")
    op.create_unique_constraint("uq_weakness_per_student_skill_course", "weakness_flags", ["student_id", "skill_id", "course_id"])

def downgrade():
    op.drop_constraint("fk_remediation_source_submission", "remediation_plans", type_="foreignkey")
    op.drop_column("remediation_plans", "source_submission_id")
    # Deliberately refuse a lossy downgrade if multiple courses now share a skill.
    op.create_unique_constraint("uq_active_weakness_per_student_skill", "weakness_flags", ["student_id", "skill_id"])
    op.drop_constraint("uq_weakness_per_student_skill_course", "weakness_flags", type_="unique")
    op.drop_constraint("fk_weakness_course", "weakness_flags", type_="foreignkey")
    op.drop_column("weakness_flags", "course_id")
