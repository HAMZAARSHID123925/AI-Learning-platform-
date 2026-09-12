"""
ELARION AI Learning Platform — Backend
Script: scripts/seed_data.py

Purpose:
    Seed initial required data into a fresh database.
    Must be run AFTER alembic upgrade head on a new deployment.

Seeds:
    1. Platform Roles (Student, Instructor, Admin)
    2. Platform Permissions (11 granular codes)
    3. Role-Permission assignments
    4. Sample SkillTaxonomy entries (for development/testing)

WHY seed scripts instead of migrations?
    Migrations handle SCHEMA changes (tables, columns, indexes).
    Seeds handle REFERENCE DATA (roles, permissions, lookup values).
    Mixing them makes rollbacks messy — you'd lose reference data.
    Separate scripts: schema and data are independently manageable.

Idempotent: Safe to run multiple times (INSERT ... ON CONFLICT DO NOTHING).
"""

from __future__ import annotations

import asyncio
from pathlib import Path
import sys
import uuid

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text
from sqlalchemy.dialects.postgresql import insert

from app.database import get_db_session


# =============================================================================
# Seed Data Definitions
# =============================================================================

ROLES = [
    {"name": "Student",    "description": "Learner — takes courses, submits assessments"},
    {"name": "Instructor", "description": "Educator — creates courses, views student progress"},
    {"name": "Admin",      "description": "Platform administrator — full access"},
]

PERMISSIONS = [
    # Course management
    {"code": "course:create",   "description": "Create and manage courses and lessons"},
    {"code": "course:read",     "description": "View published courses"},
    {"code": "course:delete",   "description": "Delete any course (Admin only)"},

    # Assessment
    {"code": "assessment:take",     "description": "Take assessments and submit answers"},
    {"code": "assessment:generate", "description": "Trigger AI assessment generation"},
    {"code": "assessment:grade",    "description": "View grading results and feedback"},

    # User management
    {"code": "user:read",   "description": "View any user profile"},
    {"code": "user:manage", "description": "Suspend, update, assign roles to users"},

    # Live sessions
    {"code": "session:create", "description": "Create and manage live sessions"},
    {"code": "session:join",   "description": "Join a live session"},

    # Analytics
    {"code": "analytics:read", "description": "View platform analytics and reports"},
]

# Which permissions each role gets
ROLE_PERMISSIONS = {
    "Student": [
        "course:read",
        "assessment:take",
        "assessment:grade",
        "session:join",
    ],
    "Instructor": [
        "course:create",
        "course:read",
        "assessment:generate",
        "assessment:grade",
        "session:create",
        "session:join",
        "analytics:read",
    ],
    "Admin": [
        "course:create",
        "course:read",
        "course:delete",
        "assessment:take",
        "assessment:generate",
        "assessment:grade",
        "user:read",
        "user:manage",
        "session:create",
        "session:join",
        "analytics:read",
    ],
}

SAMPLE_SKILLS = [
    # Top-level subjects
    {"slug": "mathematics",  "name": "Mathematics",  "parent_slug": None},
    {"slug": "programming",  "name": "Programming",  "parent_slug": None},
    {"slug": "data-science", "name": "Data Science", "parent_slug": None},

    # Mathematics sub-skills
    {"slug": "algebra",          "name": "Algebra",            "parent_slug": "mathematics"},
    {"slug": "calculus",         "name": "Calculus",           "parent_slug": "mathematics"},
    {"slug": "linear-algebra",   "name": "Linear Algebra",     "parent_slug": "mathematics"},

    # Algebra sub-skills
    {"slug": "algebra.linear",    "name": "Linear Equations",    "parent_slug": "algebra"},
    {"slug": "algebra.quadratic", "name": "Quadratic Equations", "parent_slug": "algebra"},

    # Programming sub-skills
    {"slug": "python",      "name": "Python",      "parent_slug": "programming"},
    {"slug": "algorithms",  "name": "Algorithms",  "parent_slug": "programming"},

    # Data Science sub-skills
    {"slug": "statistics",      "name": "Statistics",       "parent_slug": "data-science"},
    {"slug": "machine-learning","name": "Machine Learning", "parent_slug": "data-science"},
]


# =============================================================================
# Seed Functions
# =============================================================================

async def seed_roles_and_permissions(db) -> dict:
    """Seed roles and permissions. Returns {role_name: role_id, permission_code: perm_id}."""
    id_map = {}

    # Insert roles (idempotent)
    for role_data in ROLES:
        role_id = uuid.uuid4()
        await db.execute(text("""
            INSERT INTO roles (id, name, description)
            VALUES (:id, :name, :description)
            ON CONFLICT (name) DO NOTHING
        """), {"id": role_id, "name": role_data["name"], "description": role_data["description"]})

    # Insert permissions (idempotent)
    for perm_data in PERMISSIONS:
        perm_id = uuid.uuid4()
        await db.execute(text("""
            INSERT INTO permissions (id, code, description)
            VALUES (:id, :code, :description)
            ON CONFLICT (code) DO NOTHING
        """), {"id": perm_id, "code": perm_data["code"], "description": perm_data["description"]})

    # Reload IDs from DB (some may have been skipped by ON CONFLICT DO NOTHING)
    roles_result = await db.execute(text("SELECT id, name FROM roles"))
    for row in roles_result:
        id_map[f"role:{row.name}"] = row.id

    perms_result = await db.execute(text("SELECT id, code FROM permissions"))
    for row in perms_result:
        id_map[f"perm:{row.code}"] = row.id

    # Assign role-permission mappings (idempotent)
    for role_name, perm_codes in ROLE_PERMISSIONS.items():
        role_id = id_map.get(f"role:{role_name}")
        if not role_id:
            print(f"  WARNING: Role '{role_name}' not found in DB. Skipping.")
            continue
        for code in perm_codes:
            perm_id = id_map.get(f"perm:{code}")
            if not perm_id:
                print(f"  WARNING: Permission '{code}' not found in DB. Skipping.")
                continue
            await db.execute(text("""
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES (:role_id, :perm_id)
                ON CONFLICT DO NOTHING
            """), {"role_id": role_id, "perm_id": perm_id})

    return id_map


async def seed_skill_taxonomy(db) -> None:
    """Seed sample skill taxonomy entries (idempotent)."""
    # First pass: top-level skills (no parent)
    slug_to_id: dict[str, uuid.UUID] = {}

    for skill_data in SAMPLE_SKILLS:
        if skill_data["parent_slug"] is not None:
            continue  # Skip children in first pass
        skill_id = uuid.uuid4()
        await db.execute(text("""
            INSERT INTO skill_taxonomy (id, slug, name, parent_id, version, created_at)
            VALUES (:id, :slug, :name, NULL, 1, NOW())
            ON CONFLICT (slug) DO NOTHING
        """), {"id": skill_id, "slug": skill_data["slug"], "name": skill_data["name"]})

    # Reload parent IDs
    result = await db.execute(text("SELECT id, slug FROM skill_taxonomy"))
    for row in result:
        slug_to_id[row.slug] = row.id

    # Second pass: child skills
    for skill_data in SAMPLE_SKILLS:
        if skill_data["parent_slug"] is None:
            continue
        parent_id = slug_to_id.get(skill_data["parent_slug"])
        if not parent_id:
            print(f"  WARNING: Parent slug '{skill_data['parent_slug']}' not found. Skipping '{skill_data['slug']}'.")
            continue
        skill_id = uuid.uuid4()
        await db.execute(text("""
            INSERT INTO skill_taxonomy (id, slug, name, parent_id, version, created_at)
            VALUES (:id, :slug, :name, :parent_id, 1, NOW())
            ON CONFLICT (slug) DO NOTHING
        """), {"id": skill_id, "slug": skill_data["slug"], "name": skill_data["name"], "parent_id": parent_id})


async def main():
    print("[*] ELARION Seed Script Starting...")

    async with get_db_session() as db:
        print("  -> Seeding roles and permissions...")
        id_map = await seed_roles_and_permissions(db)
        print(f"  [+] {len(ROLES)} roles, {len(PERMISSIONS)} permissions seeded.")

        print("  -> Seeding skill taxonomy...")
        await seed_skill_taxonomy(db)
        print(f"  [+] {len(SAMPLE_SKILLS)} skill taxonomy entries seeded.")

        await db.commit()

    print("[SUCCESS] Seed complete.")
    print()
    print("Next steps:")
    print("  1. python scripts/setup_storage.py   -> create MinIO buckets")
    print("  2. uvicorn app.main:app --reload      -> start API server")
    print("  3. http://localhost:8000/docs          -> open Swagger UI")


if __name__ == "__main__":
    asyncio.run(main())
