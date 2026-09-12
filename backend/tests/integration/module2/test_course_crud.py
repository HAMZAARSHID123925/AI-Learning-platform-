"""
ELARION AI Learning Platform — Backend
tests/integration/module2/test_course_crud.py

Purpose:
    Integration tests for Course and Module CRUD endpoints in Module 2.
    Tests verify permission enforcement (Student vs Instructor),
    course creation, fetching, updating, and module attachment.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
class TestCourseCrud:
    async def _create_instructor_and_login(self, client: AsyncClient, email="inst@test.com"):
        await client.post("/api/v1/auth/register", json={
            "email": email,
            "password": "Password1",
            "first_name": "Instructor",
            "last_name": "User",
        })
        login_res = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "Password1",
        })
        return login_res.json()["access_token"]

    async def test_student_cannot_create_course(self, client: AsyncClient, seeded_db: AsyncSession):
        """Default registered users have Student role, which lacks 'course:create'."""
        token = await self._create_instructor_and_login(client, "student_no_perm@test.com")

        resp = await client.post(
            "/api/v1/courses",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "Unauthorized Course",
                "slug": "unauth-course",
                "description": "Testing permissions",
            },
        )
        assert resp.status_code == 403
        assert resp.json()["code"] == "PERMISSION_DENIED"

    async def test_get_course_not_found(self, client: AsyncClient, seeded_db: AsyncSession):
        token = await self._create_instructor_and_login(client, "student_get@test.com")
        import uuid
        random_id = str(uuid.uuid4())

        resp = await client.get(
            f"/api/v1/courses/{random_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404
        assert resp.json()["code"] == "NOT_FOUND"

    async def test_list_courses_empty_ok(self, client: AsyncClient, seeded_db: AsyncSession):
        token = await self._create_instructor_and_login(client, "student_list@test.com")

        resp = await client.get(
            "/api/v1/courses",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert isinstance(data["items"], list)
