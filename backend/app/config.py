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
        env_file=Path(__file__).resolve().parents[1] / ".env",
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
    MEDIA_SIGNED_URL_TTL_SECONDS: int = 900
    # Optional deployment paths; otherwise resolve executables from worker PATH.
    VIDEO_NODE_BINARY: str | None = None
    FFMPEG_BINARY: str | None = None
    FFPROBE_BINARY: str | None = None

    MAX_VIDEO_SIZE_BYTES: int = 500 * 1024 * 1024  # 500 MB
    MAX_IMAGE_SIZE_BYTES: int = 5 * 1024 * 1024    # 5 MB

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
    LLM_PROVIDER: str = "groq"  # groq | anthropic | openai
    GROQ_API_KEY: str = ""
    GROQ_LLM_MODEL: str = "llama-3.3-70b-versatile"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_LLM_MODEL: str = "claude-opus-4-5"
    OPENAI_LLM_MODEL: str = "gpt-4o"

    # -------------------------------------------------------------------------
    # TTS — Text-to-Speech (M3.4 — Personalized Video Narration)
    # Dev:  openai_tts (gpt-4o-mini-tts, "nova" voice — warm, friendly)
    #       OR explicit mock (TTS_MOCK_MODE=true) when no key is present
    # Prod: openai_tts | elevenlabs
    # WHY abstracted:
    #   Provider swap = env var change only. Service stays unchanged.
    # -------------------------------------------------------------------------
    TTS_PROVIDER: str = "openai_tts"     # openai_tts | elevenlabs
    TTS_MOCK_MODE: bool = False           # Explicit mock — dev/test only
    OPENAI_TTS_API_KEY: str = ""          # Required if TTS_PROVIDER=openai_tts
    OPENAI_TTS_MODEL: str = "tts-1"       # tts-1 | tts-1-hd
    OPENAI_TTS_VOICE: str = "nova"        # alloy | echo | fable | onyx | nova | shimmer
    ELEVENLABS_API_KEY: str = ""          # Required if TTS_PROVIDER=elevenlabs
    ELEVENLABS_VOICE_ID: str = ""         # ElevenLabs voice ID
    TTS_SPEAKING_RATE: float = 1.0        # 0.25–4.0 for OpenAI; 0.7–1.2 for ElevenLabs
    TTS_OUTPUT_FORMAT: str = "mp3"        # mp3 | opus
    TTS_AUDIO_OBJECT_PREFIX: str = "personalized-video"  # S3 key prefix for audio clips
    TTS_SCENE_PADDING_SECONDS: float = 0.5   # Padding added to render_duration after audio

    # Presenters. One is picked at random for each video job (whole video keeps
    # the same teacher). The name selects the narration voice here AND the
    # green-screen clip set in video-render/src/templates/teacherClip.ts.
    TEACHER_PRESENTERS: str = "female,male"   # comma list; "female" = only the original teacher
    OPENAI_TTS_VOICE_FEMALE: str = ""         # defaults to OPENAI_TTS_VOICE
    OPENAI_TTS_VOICE_MALE: str = "onyx"       # onyx (deep) | echo | fable
    ELEVENLABS_VOICE_ID_FEMALE: str = ""      # defaults to ELEVENLABS_VOICE_ID
    ELEVENLABS_VOICE_ID_MALE: str = ""

    def presenter_choices(self) -> list[str]:
        names = [n.strip().lower() for n in self.TEACHER_PRESENTERS.split(",")]
        return [n for n in names if n in ("female", "male")] or ["female"]

    def tts_voice_for(self, teacher: str | None) -> str:
        """Voice id for a presenter under the active TTS provider."""
        male = (teacher or "female") == "male"
        if self.TTS_PROVIDER == "elevenlabs":
            return (self.ELEVENLABS_VOICE_ID_MALE if male else self.ELEVENLABS_VOICE_ID_FEMALE) or self.ELEVENLABS_VOICE_ID
        return (self.OPENAI_TTS_VOICE_MALE if male else self.OPENAI_TTS_VOICE_FEMALE) or self.OPENAI_TTS_VOICE
    TTS_DURATION_TOLERANCE_RATIO: float = 0.20  # ±20% total duration tolerance
    TTS_CONCURRENCY: int = 4                    # Scene clips synthesized in parallel (1 = old serial behaviour)

    # Video render performance (personalized video pipeline)
    VIDEO_OUTPUT_HEIGHT: int = 1080             # 1080 = 1920x1080, 720 = 1280x720 (~2x faster render)
    VIDEO_RENDER_CONCURRENCY: int = 0           # Chromium tabs rendering frames; 0 = auto (CPU count - 2, max 8)
    VIDEO_RENDER_MODE: str = "template"         # template = keyframe stage + cached teacher loop (fast); full = draw every frame

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


    @model_validator(mode="after")
    def validate_production_readiness(self) -> "Settings":
        if self.is_production:
            if "localhost" in self.CORS_ALLOWED_ORIGINS:
                raise ValueError("CORS_ALLOWED_ORIGINS must not contain localhost in production.")

            if self.TTS_MOCK_MODE:
                raise ValueError("TTS_MOCK_MODE=True is not allowed in production.")

            if self.LLM_PROVIDER == "groq" and not self.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY is required in production when LLM_PROVIDER=groq")
            if self.LLM_PROVIDER == "anthropic" and not self.ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY is required in production when LLM_PROVIDER=anthropic")
            if self.LLM_PROVIDER == "openai" and not self.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is required in production when LLM_PROVIDER=openai")

            if self.TTS_PROVIDER == "openai_tts" and not self.OPENAI_TTS_API_KEY and not self.OPENAI_API_KEY:
                raise ValueError("OPENAI_TTS_API_KEY or OPENAI_API_KEY is required in production when TTS_PROVIDER=openai_tts")
            if self.TTS_PROVIDER == "elevenlabs" and not self.ELEVENLABS_API_KEY:
                raise ValueError("ELEVENLABS_API_KEY is required in production when TTS_PROVIDER=elevenlabs")

            if not self.S3_ACCESS_KEY_ID or not self.S3_SECRET_ACCESS_KEY:
                raise ValueError("S3 credentials (S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY) are required in production.")

        return self

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
