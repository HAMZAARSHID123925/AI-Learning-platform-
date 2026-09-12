"""
ELARION AI Learning Platform — Backend
Module: app/telemetry.py

Purpose:
    OpenTelemetry instrumentation setup.
    Auto-instruments FastAPI, SQLAlchemy, Redis, and httpx.
    Exports traces to an OTLP collector (Grafana Tempo, Jaeger, etc.)

WHY OpenTelemetry?
    Distributed tracing allows you to follow a single request across:
    - FastAPI route → SQLAlchemy query → Redis call → Claude API call
    All linked by a single trace_id. Essential for debugging slow requests.
"""

from __future__ import annotations

from fastapi import FastAPI


def setup_telemetry(app: FastAPI) -> None:
    """
    Initialize OpenTelemetry with auto-instrumentation.
    Called on app startup if OTEL_EXPORTER_OTLP_ENDPOINT is set.
    """
    try:
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
        from opentelemetry.instrumentation.redis import RedisInstrumentor
        from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor

        from app.config import get_settings
        settings = get_settings()

        provider = TracerProvider()
        exporter = OTLPSpanExporter(endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT)
        provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)

        FastAPIInstrumentor.instrument_app(app)
        SQLAlchemyInstrumentor().instrument()
        RedisInstrumentor().instrument()
        HTTPXClientInstrumentor().instrument()

    except ImportError:
        pass  # OpenTelemetry packages not installed — skip silently


def get_tracer(module_name: str):
    """Get a tracer for manual span creation in business logic."""
    from opentelemetry import trace
    return trace.get_tracer(module_name)
