"""add grade to user and course

Revision ID: 015_add_grade_to_user_and_course
Revises: 014_add_remediation_plan_columns
Create Date: 2026-10-01 05:22:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '015_add_grade_to_user_and_course'
down_revision = '014'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add grade column to users
    op.add_column('users', sa.Column('grade', sa.Integer(), nullable=True))
    op.create_check_constraint('ck_users_grade', 'users', 'grade >= 1 AND grade <= 5')
    
    # Add grade column to courses
    op.add_column('courses', sa.Column('grade', sa.Integer(), nullable=True))
    op.create_check_constraint('ck_courses_grade', 'courses', 'grade >= 1 AND grade <= 5')

def downgrade() -> None:
    # Remove from courses
    op.drop_constraint('ck_courses_grade', 'courses', type_='check')
    op.drop_column('courses', 'grade')
    
    # Remove from users
    op.drop_constraint('ck_users_grade', 'users', type_='check')
    op.drop_column('users', 'grade')
