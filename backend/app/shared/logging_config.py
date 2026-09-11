"""
ELARION AI Learning Platform — Backend
Module: app/shared/logging_config.py

Purpose:
    Structured JSON logging configuration using structlog.

Why structured logging (JSON) over plain text?
    Plain text:  "2026-09-10 16:00:01 ERROR Grading failed for submission abc123"
    Structured:  {"ts":"2026-09-10T16:00:01Z","level":"error","event":"grading_failed",
                  "submission_id":"abc123","student_id":"...", "module":"module5"}

    With JSON:
    - Log aggregators (Grafana Loki, Datadog, CloudWatch) can QUERY fields directly.
    - You can filter: level=error AND module=module5 AND student_id=xyz
    - Machine-readable = alerting and dashboards without regex parsing.

Industry: Every major tech company (Google, Netflix, Stripe) uses structured logs.
"""

from __future__ import annotations

import logging
import sys

import structlog


def configure_logging(environment: str = "development") -> None:
    """
    Configure structlog for structured JSON logging.

    In development: pretty-printed console output (human-readable)
    In staging/production: JSON output (machine-readable, searchable)
    """
    is_dev = environment == "development"

    # Configure standard Python logging to route through structlog
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )

    shared_processors: list = [
        structlog.contextvars.merge_contextvars,       # Thread-safe context variables
        structlog.stdlib.add_logger_name,              # Add logger name
        structlog.stdlib.add_log_level,               # Add log level
        structlog.processors.TimeStamper(fmt="iso"),  # ISO 8601 timestamps (UTC)
        structlog.processors.StackInfoRenderer(),      # Stack info on errors
        structlog.processors.ExceptionPrettyPrinter() if is_dev
            else structlog.processors.format_exc_info, # Exception formatting
    ]

    structlog.configure(
        processors=shared_processors + [
            structlog.dev.ConsoleRenderer() if is_dev
                else structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = __name__) -> structlog.stdlib.BoundLogger:
    """
    Get a structured logger with the given name.

    Usage:
        from app.shared.logging_config import get_logger
        logger = get_logger(__name__)

        # Log with structured fields (not string interpolation)
        logger.info("user_login", user_id=str(user.id), email=user.email)
        logger.error("grading_failed", submission_id=str(sub.id), error=str(e))

    WHY not f-strings in log calls?
        logger.error(f"Grading failed for {submission_id}")
            → Plain text, not searchable by field

        logger.error("grading_failed", submission_id=submission_id)
            → JSON field, searchable by exact value
    """
    return structlog.get_logger(name)
