"""
ELARION AI Learning Platform — Backend
tests/unit/test_pagination.py

Unit tests for the shared pagination utility.
"""

from __future__ import annotations

from app.shared.pagination import PaginatedResponse, PaginationParams


class TestPaginationParams:
    def test_offset_calculation_page_1(self):
        p = PaginationParams(page=1, page_size=20)
        assert p.offset == 0

    def test_offset_calculation_page_2(self):
        p = PaginationParams(page=2, page_size=20)
        assert p.offset == 20

    def test_offset_calculation_page_5(self):
        p = PaginationParams(page=5, page_size=10)
        assert p.offset == 40

    def test_default_page_size(self):
        p = PaginationParams()
        assert p.page_size == 20
        assert p.page == 1


class TestPaginatedResponse:
    def test_creates_correct_metadata_page_1(self):
        params = PaginationParams(page=1, page_size=5)
        result = PaginatedResponse.create(items=["a", "b", "c"], total=13, params=params)
        assert result.total == 13
        assert result.page == 1
        assert result.page_size == 5
        assert result.total_pages == 3  # ceil(13/5) = 3
        assert result.has_next is True
        assert result.has_previous is False

    def test_creates_correct_metadata_last_page(self):
        params = PaginationParams(page=3, page_size=5)
        result = PaginatedResponse.create(items=["a", "b", "c"], total=13, params=params)
        assert result.has_next is False
        assert result.has_previous is True

    def test_single_page(self):
        params = PaginationParams(page=1, page_size=20)
        result = PaginatedResponse.create(items=list(range(5)), total=5, params=params)
        assert result.total_pages == 1
        assert result.has_next is False
        assert result.has_previous is False

    def test_empty_result(self):
        params = PaginationParams(page=1, page_size=20)
        result = PaginatedResponse.create(items=[], total=0, params=params)
        assert result.total_pages == 0
        assert result.has_next is False
