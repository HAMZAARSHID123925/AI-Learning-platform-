"""
ELARION AI Learning Platform — Backend
tests/unit/test_rbac.py

Purpose:
    Unit tests for Role-Based Access Control (RBAC) logic in:
    - User model methods (has_role, get_permissions)
    - Dependency permission validators (_get_user_permissions, require_permission, require_any_role)

Ensures that permissions are strictly additive and unprivileged roles cannot access protected actions.
"""

from __future__ import annotations

from unittest.mock import MagicMock
import pytest

from app.modules.module1_auth.models import Permission, Role, RolePermission, User, UserRole
from app.shared.dependencies import _get_user_permissions, get_user_role_names, require_any_role, require_permission
from app.shared.exceptions import PermissionDeniedError


def make_mock_user(role_names_and_perms: dict[str, list[str]], status_val="active") -> User:
    """Helper to create a User mock with populated roles and permissions."""
    user = MagicMock(spec=User)
    user.status = MagicMock(value=status_val)
    user_roles = []

    for role_name, perms in role_names_and_perms.items():
        role = MagicMock(spec=Role)
        role.name = role_name

        role_permissions = []
        for p_code in perms:
            perm = MagicMock(spec=Permission)
            perm.code = p_code
            rp = MagicMock(spec=RolePermission)
            rp.permission = perm
            role_permissions.append(rp)

        role.role_permissions = role_permissions

        ur = MagicMock(spec=UserRole)
        ur.role = role
        user_roles.append(ur)

    user.user_roles = user_roles
    return user


class TestRBACUnit:
    def test_single_role_permissions(self):
        user = make_mock_user({"Student": ["course:read", "assessment:take"]})
        perms = _get_user_permissions(user)
        assert perms == {"course:read", "assessment:take"}

    def test_additive_permissions_across_multiple_roles(self):
        """A user with both Student and Instructor roles must inherit union of permissions."""
        user = make_mock_user({
            "Student": ["course:read", "lesson:read"],
            "Instructor": ["course:create", "course:update", "lesson:create"],
        })
        perms = _get_user_permissions(user)
        assert perms == {"course:read", "lesson:read", "course:create", "course:update", "lesson:create"}

    def test_get_user_role_names(self):
        user = make_mock_user({"Instructor": [], "Admin": []})
        roles = get_user_role_names(user)
        assert roles == {"Instructor", "Admin"}

    @pytest.mark.asyncio
    async def test_require_permission_success(self):
        user = make_mock_user({"Instructor": ["course:create"]})
        checker = require_permission("course:create")
        res = await checker(current_user=user)
        assert res == user

    @pytest.mark.asyncio
    async def test_require_permission_denied(self):
        user = make_mock_user({"Student": ["course:read"]})
        checker = require_permission("course:create")
        with pytest.raises(PermissionDeniedError) as exc_info:
            await checker(current_user=user)
        assert exc_info.value.permission == "course:create"

    @pytest.mark.asyncio
    async def test_require_any_role_success(self):
        user = make_mock_user({"Instructor": []})
        checker = require_any_role("Admin", "Instructor")
        res = await checker(current_user=user)
        assert res == user

    @pytest.mark.asyncio
    async def test_require_any_role_denied(self):
        user = make_mock_user({"Student": []})
        checker = require_any_role("Admin", "Instructor")
        with pytest.raises(PermissionDeniedError):
            await checker(current_user=user)
