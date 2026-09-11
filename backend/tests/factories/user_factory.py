"""
ELARION AI Learning Platform — Backend
tests/factories/user_factory.py

Purpose:
    Test data factories using factory_boy.
    Factories produce ORM model instances WITHOUT writing to the DB.
    Persistence is done via db.add() + db.flush() in test fixtures.

WHY factory_boy?
    Hand-crafting test data in every test is noisy and fragile.
    Factories define defaults and allow overrides per test:
        user = UserFactory(email="custom@example.com", status=UserStatus.suspended)

    Alternative considered: pytest-faker (random data only).
    Rejected: factories give more control over field relationships.
"""

from __future__ import annotations

import factory

from app.modules.module1_auth.models import Role, User, UserStatus
from app.shared.auth import hash_password


class UserFactory(factory.Factory):
    """
    Create User instances with sensible defaults.

    Usage in tests:
        user = UserFactory()               # defaults
        user = UserFactory(status=UserStatus.suspended)
        user = UserFactory(email="admin@elarion.io")
    """
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"student{n}@test.elarion.io")
    # Default test password: "Password1" (passes our password validation)
    password_hash = factory.LazyFunction(lambda: hash_password("Password1"))
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    status = UserStatus.active
    email_verified = True
    parental_consent = None


class InstructorFactory(UserFactory):
    """User with Instructor role (role assignment done separately in fixtures)."""
    email = factory.Sequence(lambda n: f"instructor{n}@test.elarion.io")
    first_name = factory.Faker("first_name")


class AdminFactory(UserFactory):
    """User with Admin role (role assignment done separately in fixtures)."""
    email = factory.Sequence(lambda n: f"admin{n}@test.elarion.io")
    first_name = factory.Faker("first_name")


class RoleFactory(factory.Factory):
    class Meta:
        model = Role

    name = factory.Sequence(lambda n: f"Role{n}")
    description = factory.Faker("sentence")
