"""
ELARION AI Learning Platform — Backend
Module: app/modules/shared_models/skill_taxonomy.py

Purpose:
    Shared SkillTaxonomy model — referenced by M2 (tagging), M5 (assessment), M6 (adaptive).
    Not owned by any single module. Lives in shared_models.

Design: Self-referential hierarchy
    A skill can have a parent_id pointing to another skill.
    Example:
        Mathematics (top-level, parent_id=None)
        └── Algebra (parent_id=mathematics.id)
            └── Quadratic Equations (parent_id=algebra.id)
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SkillTaxonomy(Base):
    """
    Shared competency/skill taxonomy tree.

    WHY a tree structure (parent_id self-reference)?
        Skills are hierarchical. A question testing "Quadratic Formula" also
        tests "Algebra" at a higher level. The tree lets Module 6 identify
        weakness at multiple granularities.

    WHY slug instead of just name?
        Names can change ("Algebra" → "Elementary Algebra").
        Slugs are stable identifiers used in code and event payloads.
        A slug change is a schema migration — not a name edit.
    """

    __tablename__ = "skill_taxonomy"
    __table_args__ = (
        UniqueConstraint("slug", name="uq_skill_taxonomy_slug"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("skill_taxonomy.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
    )

    # Self-referential relationship
    children: Mapped[list[SkillTaxonomy]] = relationship(
        "SkillTaxonomy",
        back_populates="parent",
    )
    parent: Mapped[SkillTaxonomy | None] = relationship(
        "SkillTaxonomy",
        back_populates="children",
        remote_side="SkillTaxonomy.id",
    )

    def __repr__(self) -> str:
        return f"<SkillTaxonomy slug={self.slug!r}>"
