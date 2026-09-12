"""
ELARION AI Learning Platform — Backend
tests/unit/test_auth_crypto.py

Unit tests for cryptographic functions in app/shared/auth.py.

Unit tests = no database, no HTTP, pure Python.
These run in milliseconds.

Tested: password hashing, JWT encode/decode, refresh token generation.
"""

from __future__ import annotations

import time

import pytest

from app.shared.auth import (
    create_access_token,
    decode_access_token,
    generate_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.shared.exceptions import TokenExpiredError, TokenInvalidError


# =============================================================================
# Password Tests
# =============================================================================

class TestPasswordHashing:
    def test_hash_is_different_from_plaintext(self):
        hashed = hash_password("Password1")
        assert hashed != "Password1"
        assert len(hashed) > 0

    def test_verify_correct_password(self):
        hashed = hash_password("Password1")
        assert verify_password("Password1", hashed) is True

    def test_verify_wrong_password(self):
        hashed = hash_password("Password1")
        assert verify_password("WrongPassword1", hashed) is False

    def test_same_password_different_hashes(self):
        """bcrypt auto-salts: same input should produce different outputs."""
        hash1 = hash_password("Password1")
        hash2 = hash_password("Password1")
        assert hash1 != hash2


# =============================================================================
# Refresh Token Tests
# =============================================================================

class TestRefreshToken:
    def test_generate_token_length(self):
        token = generate_refresh_token()
        assert len(token) == 128  # 64 bytes → 128 hex chars

    def test_tokens_are_unique(self):
        t1 = generate_refresh_token()
        t2 = generate_refresh_token()
        assert t1 != t2

    def test_hash_token_is_deterministic(self):
        token = "some_raw_token"
        h1 = hash_token(token)
        h2 = hash_token(token)
        assert h1 == h2
        assert len(h1) == 64  # SHA-256 → 64 hex chars

    def test_hash_token_not_reversible(self):
        """The hash should not contain the raw token."""
        token = "super_secret_raw_token"
        hashed = hash_token(token)
        assert token not in hashed


# =============================================================================
# JWT Tests (RS256)
# These require actual key files. In CI, generate ephemeral keys.
# =============================================================================

class TestJWT:
    def test_create_and_decode_token(self, tmp_path):
        """Generate a temporary RS256 key pair and test JWT roundtrip."""
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.primitives.asymmetric import rsa

        # Generate ephemeral RSA key pair
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        private_pem = private_key.private_bytes(
            serialization.Encoding.PEM,
            serialization.PrivateFormat.TraditionalOpenSSL,
            serialization.NoEncryption(),
        ).decode()
        public_pem = private_key.public_key().public_bytes(
            serialization.Encoding.PEM,
            serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode()

        # Patch settings
        from unittest.mock import patch
        with patch("app.shared.auth.get_settings") as mock_settings:
            mock_settings.return_value.jwt_private_key = private_pem
            mock_settings.return_value.jwt_public_key = public_pem
            mock_settings.return_value.JWT_ALGORITHM = "RS256"
            mock_settings.return_value.JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 15

            token, jti = create_access_token(
                user_id="test-user-id",
                email="test@example.com",
                first_name="Test",
                roles=["Student"],
                permissions=["course:read"],
            )

            payload = decode_access_token(token)

        assert payload["sub"] == "test-user-id"
        assert payload["email"] == "test@example.com"
        assert payload["roles"] == ["Student"]
        assert payload["permissions"] == ["course:read"]
        assert payload["jti"] == jti

    def test_decode_invalid_token_raises(self):
        with pytest.raises(TokenInvalidError):
            decode_access_token("not.a.valid.jwt.token")
