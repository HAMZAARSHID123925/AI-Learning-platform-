# 06 — TESTING & DEVOPS GUIDE
## ELARION Platform — Test Suite, CI/CD Pipeline, Docker Setup & Observability

> **Document Type:** Engineering Operations Specification
> **Covers:** Pytest architecture, mock strategies, CI/CD GitHub Actions, Docker Compose, local dev setup, OpenTelemetry instrumentation

---

## 1. Testing Philosophy

This project follows **Test-Driven Spec Verification** — each spec in `01-MODULE-SPECIFICATIONS.md` must have a corresponding test that proves the behaviour is implemented correctly.

### Test Pyramid

```
         ╔══════════════╗
         ║  E2E / Smoke ║   (minimal — just prove the whole stack boots)
         ╚══════════════╝
       ╔══════════════════════╗
       ║  Integration / API   ║   (most effort — covers business rules)
       ╚══════════════════════╝
     ╔══════════════════════════════╗
     ║     Unit / Service Layer      ║   (fast, isolated, mocked dependencies)
     ╚══════════════════════════════╝
```

**Rule:** Never mock the database in integration tests. Use a real PostgreSQL + Redis test instance (Docker). Mock only external APIs (Claude, S3, third-party video SDK).

---

## 2. Project Structure — Test Layout

```
backend/
├── app/                     # Application source
└── tests/
    ├── conftest.py           # Shared fixtures (DB session, test client, seed data)
    ├── factories/
    │   ├── user_factory.py   # Factory functions to create test users/roles
    │   ├── course_factory.py
    │   └── assessment_factory.py
    ├── unit/
    │   ├── test_rbac.py              # Permission accumulation logic
    │   ├── test_jwt.py               # Token encode/decode/expiry
    │   ├── test_mcq_grader.py        # Deterministic MCQ grading
    │   ├── test_weakness_detector.py # Threshold rules
    │   └── test_state_machine.py     # LearningPathState transitions
    ├── integration/
    │   ├── module1/
    │   │   ├── test_auth_register.py
    │   │   ├── test_auth_login.py
    │   │   ├── test_auth_refresh.py
    │   │   └── test_rbac_endpoints.py
    │   ├── module2/
    │   │   ├── test_course_crud.py
    │   │   ├── test_lesson_publish.py
    │   │   └── test_embedding_outbox.py
    │   ├── module3/
    │   │   ├── test_live_session_schedule.py
    │   │   └── test_webhooks.py
    │   ├── module4/
    │   │   ├── test_dashboard.py
    │   │   └── test_lesson_gating.py  ← Most critical: 403 on locked lessons
    │   ├── module5/
    │   │   ├── test_assessment_generation.py
    │   │   ├── test_submission_grading.py
    │   │   └── test_skill_score_aggregation.py
    │   └── module6/
    │       ├── test_weakness_flags.py
    │       ├── test_remediation_plan.py
    │       ├── test_retest_cap.py         ← Prove 3-attempt cap + escalation
    │       └── test_event_consumer.py     ← TestGraded → M6 reaction
    └── e2e/
        └── test_full_student_journey.py   ← Login → Learn → Assess → Remediate → Retest
```

---

## 3. Test Infrastructure Setup

### 3.1 conftest.py — Shared Fixtures

```python
# tests/conftest.py
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.config import settings

# Use a dedicated test database (never the dev database)
TEST_DATABASE_URL = settings.DATABASE_URL.replace("/elarion", "/elarion_test")

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    """Create all tables once per test session. Drop and recreate for isolation."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


@pytest_asyncio.fixture
async def db() -> AsyncSession:
    """Provide a rolled-back DB session per test for full isolation."""
    async with engine.begin() as conn:
        async with TestSessionLocal(bind=conn) as session:
            yield session
            await conn.rollback()


@pytest_asyncio.fixture
async def client(db: AsyncSession) -> AsyncClient:
    """HTTP test client with DB session override."""
    app.dependency_overrides[get_db] = lambda: db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as c:
        yield c
    app.dependency_overrides.clear()


# ---- User fixtures ----

@pytest_asyncio.fixture
async def student_user(db):
    from tests.factories.user_factory import create_user_with_role
    return await create_user_with_role(db, role="Student")

@pytest_asyncio.fixture
async def instructor_user(db):
    from tests.factories.user_factory import create_user_with_role
    return await create_user_with_role(db, role="Instructor")

@pytest_asyncio.fixture
async def admin_user(db):
    from tests.factories.user_factory import create_user_with_role
    return await create_user_with_role(db, role="Admin")

@pytest_asyncio.fixture
async def student_token(client, student_user):
    res = await client.post("/api/v1/auth/login", json={
        "email": student_user.email,
        "password": "TestPassword123!"
    })
    return res.json()["access_token"]

@pytest_asyncio.fixture
async def instructor_token(client, instructor_user):
    res = await client.post("/api/v1/auth/login", json={
        "email": instructor_user.email,
        "password": "TestPassword123!"
    })
    return res.json()["access_token"]
```

---

## 4. Unit Tests — Key Examples

### 4.1 MCQ Grader (Deterministic — Zero LLM)

```python
# tests/unit/test_mcq_grader.py
import pytest
from app.modules.module5_assessment.services.grading.mcq_grader import grade_mcq
from tests.factories.assessment_factory import make_mcq_question

def test_grade_mcq_correct_answer():
    question = make_mcq_question(correct_option_id="opt_a")
    result = grade_mcq(question, student_answer="opt_a")
    assert result.score == 1.0
    assert result.grader_type.value == "deterministic"
    assert result.feedback is None

def test_grade_mcq_wrong_answer():
    question = make_mcq_question(correct_option_id="opt_a")
    result = grade_mcq(question, student_answer="opt_c")
    assert result.score == 0.0

def test_grade_mcq_no_answer():
    question = make_mcq_question(correct_option_id="opt_a")
    result = grade_mcq(question, student_answer="")
    assert result.score == 0.0
```

### 4.2 Weakness Threshold

```python
# tests/unit/test_weakness_detector.py
from app.modules.module6_adaptive.config import WEAKNESS_THRESHOLD

def test_weakness_threshold_is_sixty_percent():
    """The threshold is a documented contract. Changing this breaks the spec."""
    assert WEAKNESS_THRESHOLD == 0.60

@pytest.mark.parametrize("score,expected_flag", [
    (0.0, True),
    (0.45, True),
    (0.59, True),   # just below threshold
    (0.60, False),  # at threshold — not flagged
    (0.85, False),
    (1.0, False),
])
def test_weakness_detection_rule(score, expected_flag):
    from app.modules.module6_adaptive.services.weakness_detector import is_weak
    assert is_weak(score) == expected_flag
```

### 4.3 LearningPathState Machine

```python
# tests/unit/test_state_machine.py
from app.modules.module6_adaptive.services.state_machine import can_transition

def test_unlocked_to_in_progress():
    assert can_transition("unlocked", "in_progress") is True

def test_unlocked_to_locked():
    assert can_transition("unlocked", "locked") is True

def test_in_progress_to_mastered():
    assert can_transition("in_progress", "mastered") is True

def test_mastered_is_terminal():
    assert can_transition("mastered", "locked") is False
    assert can_transition("mastered", "unlocked") is False
```

---

## 5. Integration Tests — Key Examples

### 5.1 RBAC: Student Cannot Create Courses

```python
# tests/integration/module1/test_rbac_endpoints.py

async def test_student_cannot_create_course(client, student_token):
    res = await client.post(
        "/api/v1/courses",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"title": "Hacked Course", "slug": "hacked-course"}
    )
    assert res.status_code == 403

async def test_instructor_can_create_course(client, instructor_token):
    res = await client.post(
        "/api/v1/courses",
        headers={"Authorization": f"Bearer {instructor_token}"},
        json={"title": "Test Course", "slug": "test-course"}
    )
    assert res.status_code == 201

async def test_unauthenticated_cannot_access_courses(client):
    res = await client.get("/api/v1/courses")
    assert res.status_code == 401
```

### 5.2 Lesson Gating (Critical Spec Verification)

```python
# tests/integration/module4/test_lesson_gating.py

async def test_locked_lesson_returns_403(client, student_token, db):
    from tests.factories.course_factory import create_lesson_with_lock
    lesson = await create_lesson_with_lock(db, student_id=current_student_id)

    res = await client.get(
        f"/api/v1/lessons/{lesson.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "LESSON_LOCKED"

async def test_unlocked_lesson_is_accessible(client, student_token, db):
    from tests.factories.course_factory import create_published_lesson
    lesson = await create_published_lesson(db)

    res = await client.get(
        f"/api/v1/lessons/{lesson.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 200

async def test_instructor_can_access_locked_lesson(client, instructor_token, db):
    """Instructors bypass gating for preview purposes."""
    from tests.factories.course_factory import create_lesson_with_lock
    lesson = await create_lesson_with_lock(db, student_id=some_student_id)

    res = await client.get(
        f"/api/v1/lessons/{lesson.id}",
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert res.status_code == 200
```

### 5.3 Mocked Claude API — Assessment Generation

```python
# tests/integration/module5/test_assessment_generation.py
from unittest.mock import AsyncMock, patch

MOCK_CLAUDE_RESPONSE = {
    "questions": [
        {
            "type": "mcq",
            "skill_id": "{{skill_id}}",
            "prompt": "What is the standard form of a quadratic equation?",
            "source_chunk_ids": ["chunk-uuid-1"],
            "options": [
                {"id": "opt_a", "text": "ax² + bx + c = 0", "is_correct": True},
                {"id": "opt_b", "text": "ax + b = 0",        "is_correct": False},
                {"id": "opt_c", "text": "ax³ + bx + c = 0", "is_correct": False},
                {"id": "opt_d", "text": "a/x + b = 0",       "is_correct": False}
            ],
            "rubric": None
        }
    ]
}

async def test_assessment_generation_creates_test(client, instructor_token, db):
    # Mock Claude API to avoid real API calls in tests
    with patch(
        "app.modules.module5_assessment.services.assessment_generator.client.messages.create",
        new_callable=AsyncMock
    ) as mock_claude:
        mock_claude.return_value = MockClaudeMessage(
            content=[MockContent(text=json.dumps(MOCK_CLAUDE_RESPONSE))]
        )

        res = await client.post(
            "/api/v1/assessments/generate",
            headers={"Authorization": f"Bearer {instructor_token}"},
            json={"lesson_id": str(published_lesson.id)}
        )

    assert res.status_code == 202
    job_id = res.json()["job_id"]

    # Poll job status (or use fixture to run worker synchronously)
    job_res = await client.get(
        f"/api/v1/assessments/jobs/{job_id}",
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert job_res.json()["status"] == "completed"
    assert job_res.json()["test_id"] is not None
```

### 5.4 TestGraded Event → Module 6 Reaction

```python
# tests/integration/module6/test_event_consumer.py

async def test_test_graded_event_creates_weakness_flag(db):
    """
    Simulate a TestGraded event with a skill score below threshold.
    Verify that M6 creates a WeaknessFlag and a RemediationPlan.
    """
    from app.workers.adaptive_consumer import process_test_graded
    from app.modules.module6_adaptive.models import WeaknessFlag, RemediationPlan

    student = await create_test_student(db)
    skill = await get_or_create_skill(db, slug="algebra.quadratic")

    event = {
        "event_type": "test.graded",
        "version": "1.0",
        "emitted_at": "2026-09-10T16:00:00Z",
        "payload": {
            "submission_id": str(uuid4()),
            "test_id": str(uuid4()),
            "student_id": str(student.id),
            "lesson_id": str(uuid4()),
            "lesson_version": 1,
            "attempt_number": 1,
            "overall_score": 0.43,
            "skill_scores": [{
                "skill_id": str(skill.id),
                "skill_slug": "algebra.quadratic",
                "skill_name": "Quadratic Equations",
                "score": 0.43,  # Below 0.60 threshold
                "max_score": 1.0,
                "grader_type": "deterministic"
            }],
            "graded_at": "2026-09-10T16:00:00Z"
        }
    }

    await process_test_graded(event)

    # Verify WeaknessFlag created
    flag = await db.execute(
        select(WeaknessFlag).where(
            WeaknessFlag.student_id == student.id,
            WeaknessFlag.skill_id == skill.id
        )
    )
    flag = flag.scalar_one()
    assert flag.status.value == "active"
    assert float(flag.score_at_flag) == 0.43

    # Verify RemediationPlan created
    plan = await db.execute(
        select(RemediationPlan).where(
            RemediationPlan.weakness_flag_id == flag.id
        )
    )
    plan = plan.scalar_one()
    assert plan.status.value == "active"
    assert plan.retest_attempt_count == 0


async def test_retest_cap_escalates_after_three_attempts(db):
    """Prove the 3-attempt cap and instructor escalation."""
    plan = await create_active_plan_with_attempts(db, attempt_count=3)
    skill = await db.get(SkillTaxonomy, plan.weakness_flag.skill_id)

    # 4th failure — should escalate, not retry
    from app.workers.adaptive_consumer import process_skill_score
    await process_skill_score(
        db=db,
        student_id=plan.student_id,
        skill_id=skill.id,
        score=0.30,  # Still failing
        submission_id=uuid4()
    )
    await db.refresh(plan)

    assert plan.instructor_escalated is True
    assert plan.retest_attempt_count == 3  # Did not increment beyond 3
```

---

## 6. Docker Compose — Local Development

### docker-compose.yml

```yaml
version: "3.9"

services:

  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: elarion
      POSTGRES_USER: elarion_user
      POSTGRES_PASSWORD: elarion_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U elarion_user -d elarion"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres_test:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: elarion_test
      POSTGRES_USER: elarion_user
      POSTGRES_PASSWORD: elarion_pass
    ports:
      - "5433:5432"   # Different port to avoid conflict with dev DB

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minio_access_key
      MINIO_ROOT_SECRET: minio_secret_key
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://elarion_user:elarion_pass@postgres:5432/elarion
      REDIS_URL: redis://redis:6379/0
      AWS_ENDPOINT_URL: http://minio:9000
      AWS_ACCESS_KEY_ID: minio_access_key
      AWS_SECRET_ACCESS_KEY: minio_secret_key
      S3_BUCKET_NAME: elarion-assets
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}  # From .env file
      JWT_PRIVATE_KEY_PATH: /app/keys/private.pem
      JWT_PUBLIC_KEY_PATH: /app/keys/public.pem
    volumes:
      - ./keys:/app/keys:ro
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  embedding_worker:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://elarion_user:elarion_pass@postgres:5432/elarion
      REDIS_URL: redis://redis:6379/0
      AWS_ENDPOINT_URL: http://minio:9000
    depends_on:
      - postgres
      - redis
    command: python -m app.workers.embedding_worker

  adaptive_consumer:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://elarion_user:elarion_pass@postgres:5432/elarion
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - postgres
      - redis
    command: python -m app.workers.adaptive_consumer

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (for PDF extraction)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Do NOT include .env or keys in the image — mount them
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 7. Database Commands (Daily Use)

```bash
# Start fresh local dev environment
docker compose up -d postgres redis minio

# Run migrations on dev DB
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "add_parental_consent_to_users"

# Seed initial data (roles, permissions, skill taxonomy)
python scripts/seed_data.py

# Start the full stack (API + workers)
docker compose up

# Run tests (all)
pytest tests/ -v

# Run tests for a specific module
pytest tests/integration/module5/ -v

# Run tests with coverage
pytest tests/ --cov=app --cov-report=html

# Reset test DB
docker compose exec postgres_test psql -U elarion_user -d elarion_test -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
alembic -x db=test upgrade head
```

---

## 8. GitHub Actions CI Pipeline

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_DB: elarion_test
          POSTGRES_USER: elarion_user
          POSTGRES_PASSWORD: elarion_pass
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-cov httpx

      - name: Generate test JWT keys
        run: |
          mkdir -p keys
          openssl genrsa -out keys/private.pem 2048
          openssl rsa -in keys/private.pem -pubout -out keys/public.pem

      - name: Run migrations on test DB
        env:
          DATABASE_URL: postgresql+asyncpg://elarion_user:elarion_pass@localhost:5432/elarion_test
        run: alembic upgrade head

      - name: Run tests
        env:
          DATABASE_URL: postgresql+asyncpg://elarion_user:elarion_pass@localhost:5432/elarion_test
          REDIS_URL: redis://localhost:6379/0
          JWT_PRIVATE_KEY_PATH: ./keys/private.pem
          JWT_PUBLIC_KEY_PATH: ./keys/public.pem
          ANTHROPIC_API_KEY: "test-key-not-real"  # Claude is mocked in tests
        run: |
          pytest tests/ -v --cov=app --cov-report=xml --cov-fail-under=80

      - name: Upload coverage report
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install ruff mypy
      - run: ruff check app/
      - run: mypy app/ --ignore-missing-imports
```

---

## 9. OpenTelemetry Setup

```python
# app/telemetry.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor

def setup_telemetry(app):
    provider = TracerProvider()
    exporter = OTLPSpanExporter(
        endpoint=settings.OTEL_EXPORTER_OTLP_ENDPOINT  # e.g. http://collector:4317
    )
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)

    # Auto-instrument FastAPI routes
    FastAPIInstrumentor.instrument_app(app)

    # Auto-instrument SQLAlchemy queries
    SQLAlchemyInstrumentor().instrument()

    # Auto-instrument Redis calls
    RedisInstrumentor().instrument()

    # Auto-instrument Claude API calls (via httpx)
    HTTPXClientInstrumentor().instrument()
```

### Manual Span for AI Operations

```python
# In grading pipeline — create explicit spans for AI operations

tracer = trace.get_tracer("module5.grading")

async def grade_short_answer(...):
    with tracer.start_as_current_span("llm.grade_short_answer") as span:
        span.set_attribute("question.id", str(question.id))
        span.set_attribute("question.skill_id", str(question.skill_id))
        span.set_attribute("grader.model", "claude-opus-4-5")

        result = await call_claude_grader(...)

        span.set_attribute("llm.input_tokens", result.usage.input_tokens)
        span.set_attribute("llm.output_tokens", result.usage.output_tokens)
        span.set_attribute("grade.score", result.total_score)

        return result
```

---

## 10. Local Development Quickstart

```bash
# 1. Clone the repo and enter backend directory
cd backend

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy env template
cp .env.example .env
# Edit .env: add ANTHROPIC_API_KEY, set JWT key paths

# 5. Generate RSA key pair for JWT
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# 6. Start infrastructure
docker compose up -d postgres redis minio

# 7. Run migrations
alembic upgrade head

# 8. Seed data
python scripts/seed_data.py

# 9. Create a MinIO bucket
python scripts/setup_storage.py

# 10. Start the API server
uvicorn app.main:app --reload --port 8000

# 11. Open API docs
# http://localhost:8000/docs  (Swagger UI)
# http://localhost:8000/redoc (ReDoc)

# 12. Run tests
pytest tests/ -v
```

---

## 11. Environment Variable Reference

```env
# ===========================================
# Database
# ===========================================
DATABASE_URL=postgresql+asyncpg://elarion_user:elarion_pass@localhost:5432/elarion

# ===========================================
# Redis
# ===========================================
REDIS_URL=redis://localhost:6379/0

# ===========================================
# JWT Authentication
# ===========================================
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ALGORITHM=RS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# ===========================================
# AI Provider
# ===========================================
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_DEFAULT_MODEL=claude-opus-4-5
ANTHROPIC_GRADING_MODEL=claude-opus-4-5
ANTHROPIC_REMEDIATION_MODEL=claude-sonnet-4-5

# Embedding model (separate from LLM)
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# ===========================================
# Object Storage (MinIO / S3)
# ===========================================
AWS_ENDPOINT_URL=http://localhost:9000      # Remove for real AWS S3
AWS_ACCESS_KEY_ID=minio_access_key
AWS_SECRET_ACCESS_KEY=minio_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=elarion-assets

# ===========================================
# CORS
# ===========================================
CORS_ALLOWED_ORIGINS=http://localhost:3000

# ===========================================
# Live Video SDK
# ===========================================
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
VIDEO_WEBHOOK_SECRET=your-hmac-secret

# ===========================================
# Observability
# ===========================================
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
OTEL_SERVICE_NAME=elarion-backend

# ===========================================
# Application
# ===========================================
ENVIRONMENT=development      # development | staging | production
LOG_LEVEL=INFO
WEAKNESS_THRESHOLD=0.60
MAX_RETEST_ATTEMPTS=3
```

---

*All spec files in `docx/usman-mds/` are now complete. Begin implementation with `00-MASTER-SDD-ROADMAP.md` as your daily guide.*
