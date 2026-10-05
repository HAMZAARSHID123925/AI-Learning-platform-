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

from app.config import get_settings
get_settings.cache_clear()  # Ensure fresh reload picks up any .env changes

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
    ValidationError,
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
    # OpenTelemetry — must be set up BEFORE app starts (adds middleware)
    # WHY here and not in lifespan?
    #   FastAPI raises RuntimeError if middleware is added after startup.
    #   instrument_app() internally calls add_middleware(), so it MUST run
    #   during app construction, not inside the lifespan context.
    # -------------------------------------------------------------------------
    if settings.OTEL_EXPORTER_OTLP_ENDPOINT:
        from app.telemetry import setup_telemetry
        setup_telemetry(app)

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

    async def handle_401(request: Request, exc: ElarionError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"code": exc.code, "message": exc.message},
            headers={"WWW-Authenticate": "Bearer"},
        )

    async def handle_403(request: Request, exc: ElarionError):
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"code": exc.code, "message": exc.message},
        )

    async def handle_404(request: Request, exc: ResourceNotFoundError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"code": exc.code, "message": exc.message},
        )

    async def handle_409(request: Request, exc: DuplicateResourceError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"code": exc.code, "message": exc.message},
        )

    async def handle_422(request: Request, exc: ElarionError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"code": exc.code, "message": exc.message},
        )

    async def handle_429(request: Request, exc: RateLimitExceededError):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"code": exc.code, "message": exc.message},
            headers={"Retry-After": str(exc.retry_after)},
        )

    async def handle_storage_error(request: Request, exc: StorageError):
        logger.error("storage_error", message=exc.message)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"code": exc.code, "message": "A storage error occurred. Please try again."},
        )

    async def handle_global_error(request: Request, exc: Exception):
        logger.error("unhandled_global_error", error_type=type(exc).__name__)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"code": "INTERNAL_SERVER_ERROR", "message": "An internal error occurred."},
        )

    # Register each domain exception type
    for exc_cls in (InvalidCredentialsError, TokenExpiredError, TokenInvalidError, TokenRevokedError):
        app.add_exception_handler(exc_cls, handle_401)
    for exc_cls in (PermissionDeniedError, AccountSuspendedError, LessonLockedError):
        app.add_exception_handler(exc_cls, handle_403)
    app.add_exception_handler(ResourceNotFoundError, handle_404)
    app.add_exception_handler(DuplicateResourceError, handle_409)
    for exc_cls in (BusinessRuleError, InvalidStateTransitionError, ValidationError):
        app.add_exception_handler(exc_cls, handle_422)
    app.add_exception_handler(RateLimitExceededError, handle_429)
    app.add_exception_handler(StorageError, handle_storage_error)
    app.add_exception_handler(Exception, handle_global_error)

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
    # Static uploads mount with HTTP 206 Range Request support for HTML5 video
    # -------------------------------------------------------------------------
    import os
    from fastapi.staticfiles import StaticFiles
    from starlette.responses import StreamingResponse

    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", "uploads")
    if not os.path.exists(uploads_dir):
        uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    @app.get("/static/uploads/{file_name}")
    async def get_static_upload(file_name: str, request: Request):
        file_path = os.path.join(uploads_dir, file_name)
        if not os.path.isfile(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        file_size = os.path.getsize(file_path)
        range_header = request.headers.get("range")
        content_type = "video/mp4" if file_name.endswith(".mp4") else "image/jpeg" if file_name.endswith((".jpg", ".jpeg")) else "application/octet-stream"

        if range_header:
            # Parse Range: bytes=start-end
            range_val = range_header.strip().replace("bytes=", "")
            parts = range_val.split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1
            if end >= file_size:
                end = file_size - 1
            content_length = end - start + 1

            def iter_file():
                with open(file_path, "rb") as f:
                    f.seek(start)
                    bytes_remaining = content_length
                    while bytes_remaining > 0:
                        chunk_size = min(64 * 1024, bytes_remaining)
                        data = f.read(chunk_size)
                        if not data:
                            break
                        bytes_remaining -= len(data)
                        yield data

            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length),
                "Content-Type": content_type,
            }
            return StreamingResponse(iter_file(), status_code=206, headers=headers)

        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": content_type,
        }
        def full_iter():
            with open(file_path, "rb") as f:
                while chunk := f.read(64 * 1024):
                    yield chunk

        return StreamingResponse(full_iter(), status_code=200, headers=headers)

    app.mount("/static/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # -------------------------------------------------------------------------
    # Health Check Endpoint
    # WHY a health endpoint?
    #   Docker healthchecks, load balancers, and k8s liveness probes
    #   call this endpoint to determine if the app is ready to serve traffic.
    # -------------------------------------------------------------------------
    @app.get("/health/live", tags=["System"], summary="Liveness check")
    async def health_live():
        return {"status": "ok"}

    @app.get("/health/ready", tags=["System"], summary="Readiness check")
    async def health_ready():
        from app.database import AsyncSessionLocal
        from sqlalchemy import text
        from app.shared.redis_client import get_redis_client
        import json
        
        status_dict = {"status": "ok", "components": {}}
        
        # Check DB
        try:
            async with AsyncSessionLocal() as session:
                await session.execute(text("SELECT 1"))
            status_dict["components"]["database"] = "ok"
        except Exception as e:
            status_dict["status"] = "error"
            status_dict["components"]["database"] = f"error: {str(e)}"
            
        # Check Redis
        try:
            redis = get_redis_client()
            await redis.ping()
            status_dict["components"]["redis"] = "ok"
        except Exception as e:
            status_dict["status"] = "error"
            status_dict["components"]["redis"] = f"error: {str(e)}"
            
        return JSONResponse(
            status_code=200 if status_dict["status"] == "ok" else 503,
            content=status_dict
        )

    return app


# Create the application instance (used by uvicorn)
app = create_app()
