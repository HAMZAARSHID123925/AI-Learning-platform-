"""
ELARION AI Learning Platform — Backend
Module: app/main.py

Purpose:
    FastAPI application factory.
    Assembles all modules, registers exception handlers, configures CORS,
    sets up observability, and manages startup/shutdown lifecycle.

Industry Pattern: Application Factory
    The app is created inside a function (not module-level).
    This makes it easy to create fresh instances in tests with different config.
    FastAPI itself follows this pattern.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.shared.exceptions import (
    AccountSuspendedError,
    BusinessRuleError,
    DuplicateResourceError,
    ElarionError,
    InvalidCredentialsError,
    InvalidStateTransitionError,
    LessonLockedError,
    PermissionDeniedError,
    RateLimitExceededError,
    ResourceNotFoundError,
    StorageError,
    TokenExpiredError,
    TokenInvalidError,
    TokenRevokedError,
)
from app.shared.logging_config import configure_logging, get_logger
from app.shared.redis_client import close_redis_pool

logger = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager — replaces deprecated @app.on_event.

    Startup: Configure logging, telemetry, warm up connection pools.
    Shutdown: Drain connection pools gracefully.

    WHY graceful shutdown?
        Without it, in-flight requests are killed mid-transaction.
        With it, the server completes pending requests and closes connections cleanly.
    """
    # --- Startup ---
    configure_logging(settings.ENVIRONMENT)
    logger.info("elarion_startup", environment=settings.ENVIRONMENT)

    # Setup OpenTelemetry (if OTLP endpoint configured)
    if settings.OTEL_EXPORTER_OTLP_ENDPOINT:
        from app.telemetry import setup_telemetry
        setup_telemetry(app)

    yield  # App is running

    # --- Shutdown ---
    logger.info("elarion_shutdown")
    await close_redis_pool()


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    """
    app = FastAPI(
        title="ELARION AI Learning Platform API",
        description=(
            "Modular AI-powered learning platform with adaptive assessments, "
            "live classes, and personalized remediation plans."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # -------------------------------------------------------------------------
    # CORS
    # WHY CORS middleware?
    #   The frontend (Next.js on port 3000) makes requests to the API (port 8000).
    #   Browsers block cross-origin requests by default (same-origin policy).
    #   CORS headers tell browsers: "This origin is allowed to call our API."
    # -------------------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,   # Required for HttpOnly cookies (refresh token)
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # -------------------------------------------------------------------------
    # Exception Handlers
    # Map domain exceptions to HTTP responses with consistent error format.
    # WHY centralized handlers?
    #   Every route would need try/except blocks duplicating the same mapping.
    #   Centralized handlers keep routes clean and mapping consistent.
    # -------------------------------------------------------------------------

    @app.exception_handler(InvalidCredentialsError)
    @app.exception_handler(TokenExpiredError)
    @app.exception_handler(TokenInvalidError)
    @app.exception_handler(TokenRevokedError)
    async def handle_401(request: Request, exc: ElarionError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"code": exc.code, "message": exc.message},
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(PermissionDeniedError)
    @app.exception_handler(AccountSuspendedError)
    @app.exception_handler(LessonLockedError)
    async def handle_403(request: Request, exc: ElarionError):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(ResourceNotFoundError)
    async def handle_404(request: Request, exc: ResourceNotFoundError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(DuplicateResourceError)
    async def handle_409(request: Request, exc: DuplicateResourceError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(BusinessRuleError)
    @app.exception_handler(InvalidStateTransitionError)
    async def handle_422(request: Request, exc: ElarionError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"code": exc.code, "message": exc.message},
        )

    @app.exception_handler(RateLimitExceededError)
    async def handle_429(request: Request, exc: RateLimitExceededError):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"code": exc.code, "message": exc.message},
            headers={"Retry-After": str(exc.retry_after)},
        )

    @app.exception_handler(StorageError)
    async def handle_storage_error(request: Request, exc: StorageError):
        logger.error("storage_error", message=exc.message)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"code": exc.code, "message": "A storage error occurred. Please try again."},
        )

    # -------------------------------------------------------------------------
    # Routers — Register all module routers under /api/v1
    # -------------------------------------------------------------------------
    from app.modules.module1_auth.router import router as auth_router
    from app.modules.module2_content.router import router as content_router
    from app.modules.module3_live.router import router as live_router
    from app.modules.module4_experience.router import router as experience_router
    from app.modules.module5_assessment.router import router as assessment_router
    from app.modules.module6_adaptive.router import router as adaptive_router

    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(content_router, prefix="/api/v1")
    app.include_router(live_router, prefix="/api/v1")
    app.include_router(experience_router, prefix="/api/v1")
    app.include_router(assessment_router, prefix="/api/v1")
    app.include_router(adaptive_router, prefix="/api/v1")

    # -------------------------------------------------------------------------
    # Health Check Endpoint
    # WHY a health endpoint?
    #   Docker healthchecks, load balancers, and k8s liveness probes
    #   call this endpoint to determine if the app is ready to serve traffic.
    # -------------------------------------------------------------------------
    @app.get("/health", tags=["System"], summary="Health check")
    async def health_check():
        return {"status": "healthy", "version": "1.0.0", "environment": settings.ENVIRONMENT}

    return app


# Create the application instance (used by uvicorn)
app = create_app()
