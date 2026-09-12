"""
ELARION AI Learning Platform — Backend
Module: app/config.py

Purpose:
    Single source of truth for all application configuration.
    All values are loaded from environment variables and validated on startup.
    If a required env var is missing, the app fails IMMEDIATELY with a clear error
    — no silent defaults in production.

Industry Practice: 12-Factor App (https://12factor.net/config)
    Configuration is stored in the environment, not in code.
    Different envs (dev/staging/prod) use different .env files, never code branches.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Pydantic BaseSettings automatically:
    - Reads from process environment variables
    - Reads from a .env file (if present)
    - Validates types and required fields
    - Fails fast with descriptive errors on invalid/missing config
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore unknown env vars (CI may inject extras)
    )

    # -------------------------------------------------------------------------
    # Application
    # -------------------------------------------------------------------------
    ENVIRONMENT: str = "development"  # development | staging | production

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    # -------------------------------------------------------------------------
    # Database
    # -------------------------------------------------------------------------
    DATABASE_URL: str  # Required — no default

    @property
    def test_database_url(self) -> str:
        """Returns the test database URL derived from the main DATABASE_URL."""
        return self.DATABASE_URL.replace("/elarion", "/elarion_test")

    # -------------------------------------------------------------------------
    # Redis
    # -------------------------------------------------------------------------
    REDIS_URL: str  # Required — no default

    # Redis key prefix — prevents collisions with other apps on shared Redis
    REDIS_KEY_PREFIX: str = "elarion"

    # -------------------------------------------------------------------------
    # JWT Authentication (RS256)
    # WHY RS256 over HS256:
    #   HS256 uses a single shared secret. If leaked, anyone can forge tokens.
    #   RS256 uses asymmetric keys: private key signs, public key verifies.
    #   Other services only need the public key — private key never leaves backend.
    # -------------------------------------------------------------------------
    JWT_PRIVATE_KEY_PATH: Path = Path("./keys/private.pem")
    JWT_PUBLIC_KEY_PATH: Path = Path("./keys/public.pem")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_ALGORITHM: str = "RS256"

    @property
    def jwt_private_key(self) -> str:
        """Load RSA private key from file at runtime."""
        return self.JWT_PRIVATE_KEY_PATH.read_text()

    @property
    def jwt_public_key(self) -> str:
        """Load RSA public key from file at runtime."""
        return self.JWT_PUBLIC_KEY_PATH.read_text()

    # -------------------------------------------------------------------------
    # CORS
    # -------------------------------------------------------------------------
    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",")]

    # -------------------------------------------------------------------------
    # Object Storage (S3 / MinIO / Cloudflare R2)
    # WHY abstracted:
    #   MinIO locally → AWS S3 / Cloudflare R2 in production.
    #   Same S3 API protocol. Switching is env-var-only, zero code change.
    # -------------------------------------------------------------------------
    S3_ENDPOINT_URL: str | None = None  # None = real AWS S3
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = "elarion-assets"
    S3_REGION: str = "us-east-1"

    # -------------------------------------------------------------------------
    # AI — Embeddings
    # Dev:  FastEmbed (local, BAAI/bge-small-en-v1.5, 384 dims, free)
    # Prod: OpenAI text-embedding-3-small (1536 dims)
    #
    # WHY vector(384) in dev instead of vector(1536)?
    #   Schema migration 007 must match the embedding model output dimension.
    #   When switching to production model, create a new migration to ALTER
    #   the vector column dimension and re-embed all content.
    # -------------------------------------------------------------------------
    EMBEDDING_PROVIDER: str = "fastembed"  # fastembed | openai
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_DIM: int = 384  # CRITICAL: must match model output
    OPENAI_API_KEY: str = ""  # Required if EMBEDDING_PROVIDER=openai

    # -------------------------------------------------------------------------
    # AI — LLM (Generation & Grading)
    # Dev:  Groq (free tier, llama-3.3-70b-versatile — fast, good quality)
    # Prod: Anthropic Claude API (claude-opus-4-5 — best reasoning)
    #
    # WHY Groq in dev?
    #   Groq offers free inference at very high speeds.
    #   Same OpenAI-compatible API. Provider abstraction makes switching trivial.
    # -------------------------------------------------------------------------
    LLM_PROVIDER: str = "groq"  # groq | anthropic
    GROQ_API_KEY: str = ""
    GROQ_LLM_MODEL: str = "llama-3.3-70b-versatile"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_LLM_MODEL: str = "claude-opus-4-5"

    # -------------------------------------------------------------------------
    # Live Video Provider (Phase 4)
    # Dev:  MockVideoProvider — returns fake tokens, no real video
    # Prod: zoom | agora | daily
    # WHY abstract interface?
    #   All providers require: create_room(), get_token(room_id, user_id).
    #   Implement as Strategy pattern — swap provider = change one env var.
    # -------------------------------------------------------------------------
    VIDEO_PROVIDER: str = "mock"  # mock | zoom | agora | daily
    ZOOM_API_KEY: str = ""
    ZOOM_API_SECRET: str = ""
    AGORA_APP_ID: str = ""
    AGORA_APP_CERTIFICATE: str = ""
    DAILY_API_KEY: str = ""
    WEBHOOK_SECRET: str = "elarion_default_webhook_secret_key"

    # -------------------------------------------------------------------------
    # Email (Phase 1: console, Prod: real SMTP)
    # -------------------------------------------------------------------------
    EMAIL_PROVIDER: str = "console"  # console | smtp | sendgrid | mailgun
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@elarion.edu"

    # -------------------------------------------------------------------------
    # Frontend URL (for password reset links)
    # -------------------------------------------------------------------------
    FRONTEND_URL: str = "http://localhost:3000"

    # -------------------------------------------------------------------------
    # Observability
    # -------------------------------------------------------------------------
    OTEL_EXPORTER_OTLP_ENDPOINT: str = ""

    # -------------------------------------------------------------------------
    # Rate Limiting (aligned with 01-MODULE-SPECIFICATIONS.md business rules)
    # -------------------------------------------------------------------------
    RATE_LIMIT_LOGIN_MAX: int = 5         # Max login attempts per window
    RATE_LIMIT_LOGIN_WINDOW_SECONDS: int = 900   # 15 minutes
    RATE_LIMIT_FORGOT_MAX: int = 3        # Max forgot-password per window
    RATE_LIMIT_FORGOT_WINDOW_SECONDS: int = 3600  # 1 hour

    # -------------------------------------------------------------------------
    # Business Rules (from spec — configurable by Admin in future)
    # -------------------------------------------------------------------------
    WEAKNESS_THRESHOLD: float = 0.60     # Skills below this = weakness flag
    MAX_RETEST_ATTEMPTS: int = 3         # Max retests before instructor escalation
    REMEDIATION_LESSON_LIMIT: int = 5    # Max lessons in a remediation plan


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings instance.

    WHY lru_cache?
        Settings are immutable at runtime. Caching prevents re-reading and
        re-validating the .env file on every function call. The cache is
        cleared in tests to allow injecting test-specific settings.
    """
    return Settings()
