# =============================================================================
# ELARION Backend — Dockerfile
# =============================================================================
# Multi-stage build for security and minimal image size.
# Base: Python 3.12-slim (smallest stable Python image with glibc)
# Non-root user: prevents privilege escalation if container is compromised
# =============================================================================

FROM python:3.12-slim AS base

# Set working directory
WORKDIR /app

# System dependencies
# - libpq-dev: required by asyncpg (PostgreSQL C bindings)
# - poppler-utils: PDF rendering utilities (for pymupdf in Phase 2)
# - curl: healthcheck in docker-compose
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq-dev \
        poppler-utils \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user — running as root in a container is a security risk
RUN useradd --create-home --shell /bin/bash elarion
USER elarion
WORKDIR /home/elarion/app

# Install Python dependencies as non-root (--user flag)
COPY --chown=elarion:elarion requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy application source code
COPY --chown=elarion:elarion . .

# Add pip user bin to PATH
ENV PATH="/home/elarion/.local/bin:${PATH}"

# Expose port
EXPOSE 8000

# Default: production server (workers=4 for production)
# docker-compose overrides this to --reload for local dev
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
