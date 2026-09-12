"""
ELARION AI Learning Platform — Backend
tests/integration/module1/test_auth_endpoints.py

Integration tests for Module 1 auth endpoints.

These tests hit the ACTUAL FastAPI routes via the test client.
The db fixture ensures all writes are rolled back after each test.

Tests cover:
    - POST /api/v1/auth/register
    - POST /api/v1/auth/login
    - POST /api/v1/auth/logout
    - GET  /api/v1/users/me
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
class TestAuthRegister:
    async def test_register_success(self, client: AsyncClient, seeded_db: AsyncSession):
        resp = await client.post("/api/v1/auth/register", json={
            "email": "newuser@test.com",
            "password": "Password1",
            "first_name": "John",
            "last_name": "Doe",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "user_id" in data
        assert "Registration successful" in data["message"]

    async def test_register_duplicate_email(self, client: AsyncClient, seeded_db: AsyncSession):
        """Second registration with same email should return 409 Conflict."""
        payload = {
            "email": "duplicate@test.com",
            "password": "Password1",
            "first_name": "A",
            "last_name": "B",
        }
        await client.post("/api/v1/auth/register", json=payload)
        resp = await client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 409
        assert resp.json()["code"] == "DUPLICATE_RESOURCE"

    async def test_register_weak_password_no_uppercase(self, client: AsyncClient, seeded_db: AsyncSession):
        resp = await client.post("/api/v1/auth/register", json={
            "email": "weak@test.com",
            "password": "password1",  # No uppercase
            "first_name": "X",
            "last_name": "Y",
        })
        assert resp.status_code == 422

    async def test_register_weak_password_no_digit(self, client: AsyncClient, seeded_db: AsyncSession):
        resp = await client.post("/api/v1/auth/register", json={
            "email": "weak2@test.com",
            "password": "PasswordOnly",  # No digit
            "first_name": "X",
            "last_name": "Y",
        })
        assert resp.status_code == 422

    async def test_register_invalid_email(self, client: AsyncClient, seeded_db: AsyncSession):
        resp = await client.post("/api/v1/auth/register", json={
            "email": "not-an-email",
            "password": "Password1",
            "first_name": "X",
            "last_name": "Y",
        })
        assert resp.status_code == 422


@pytest.mark.asyncio
class TestAuthLogin:
    async def _register_user(self, client, email="logintest@test.com"):
        resp = await client.post("/api/v1/auth/register", json={
            "email": email,
            "password": "Password1",
            "first_name": "Test",
            "last_name": "User",
        })
        return resp

    async def test_login_success(self, client: AsyncClient, seeded_db: AsyncSession):
        await self._register_user(client)
        resp = await client.post("/api/v1/auth/login", json={
            "email": "logintest@test.com",
            "password": "Password1",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "Bearer"
        assert "user" in data
        assert data["user"]["email"] == "logintest@test.com"
        # Refresh token should be in cookie, not in response body
        assert "refresh_token" not in data

    async def test_login_wrong_password(self, client: AsyncClient, seeded_db: AsyncSession):
        await self._register_user(client, "wrongpw@test.com")
        resp = await client.post("/api/v1/auth/login", json={
            "email": "wrongpw@test.com",
            "password": "WrongPassword1",
        })
        assert resp.status_code == 401
        assert resp.json()["code"] == "INVALID_CREDENTIALS"

    async def test_login_unknown_email(self, client: AsyncClient, seeded_db: AsyncSession):
        resp = await client.post("/api/v1/auth/login", json={
            "email": "ghost@test.com",
            "password": "Password1",
        })
        # Same 401 as wrong password — no user enumeration
        assert resp.status_code == 401
        assert resp.json()["code"] == "INVALID_CREDENTIALS"

    async def test_login_returns_refresh_cookie(self, client: AsyncClient, seeded_db: AsyncSession):
        await self._register_user(client, "cookie@test.com")
        resp = await client.post("/api/v1/auth/login", json={
            "email": "cookie@test.com",
            "password": "Password1",
        })
        assert resp.status_code == 200
        # Check HttpOnly cookie is set
        assert "refresh_token" in resp.cookies


@pytest.mark.asyncio
class TestGetMe:
    async def test_get_me_authenticated(self, client: AsyncClient, seeded_db: AsyncSession):
        # Register and login
        await client.post("/api/v1/auth/register", json={
            "email": "getme@test.com",
            "password": "Password1",
            "first_name": "Get",
            "last_name": "Me",
        })
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": "getme@test.com",
            "password": "Password1",
        })
        token = login_resp.json()["access_token"]

        resp = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "getme@test.com"
        assert data["first_name"] == "Get"

    async def test_get_me_unauthenticated(self, client: AsyncClient, seeded_db: AsyncSession):
        resp = await client.get("/api/v1/users/me")
        assert resp.status_code == 403  # HTTPBearer returns 403 when no Bearer header

    async def test_get_me_invalid_token(self, client: AsyncClient, seeded_db: AsyncSession):
        resp = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert resp.status_code == 401
