"""
ELARION AI Learning Platform — Backend
Module: app/shared/pagination.py

Purpose:
    Reusable pagination schemas for all list endpoints.
    Every list response follows the same contract.

Industry Practice:
    Cursor-based pagination (better for large datasets, consistent under inserts)
    vs offset-based (simpler but can miss/duplicate items under concurrent writes).
    We use offset-based here for simplicity; switch to cursor-based when needed.
"""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Common query parameters for all paginated list endpoints."""
    page: int = Field(default=1, ge=1, description="Page number (1-based)")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page (max 100)")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Standard paginated response wrapper.

    All list endpoints return this shape:
    {
        "items": [...],
        "total": 150,
        "page": 2,
        "page_size": 20,
        "pages": 8
    }
    """
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int

    @classmethod
    def create(cls, items: list[T], total: int, params: PaginationParams) -> "PaginatedResponse[T]":
        pages = max(1, -(-total // params.page_size))  # Ceiling division
        return cls(
            items=items,
            total=total,
            page=params.page,
            page_size=params.page_size,
            pages=pages,
        )
