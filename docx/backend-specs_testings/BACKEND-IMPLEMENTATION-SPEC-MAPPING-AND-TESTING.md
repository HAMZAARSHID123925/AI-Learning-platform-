# ELARION Backend Implementation Specification Mapping & Testing Guide

> **Document Type:** Engineering Implementation Blueprint, Specification Traceability Matrix, and Comprehensive Testing Protocol  
> **Target Audience:** Backend Engineers, Frontend Engineers, QA/SDET, Software Architects  
> **Status:** Active & Enforced  
> **Location:** `docx/backend-specs_testings/BACKEND-IMPLEMENTATION-SPEC-MAPPING-AND-TESTING.md`

---

## 1. Executive System Introduction & Architectural Role

The ELARION AI Learning Platform backend has been engineered as a **modular monolith designed for event-driven microservices evolution**. It is built specifically for **real users in production**, meaning that toy-project simplifications, insecure authentication shortcuts, and untracked database mutations have been systematically rejected in favor of high-reliability patterns.

### The Role of What We Built in the Live Software

Each subsystem created in Phase 1 performs a distinct, mission-critical operational role in the overall software lifecycle:

1. **Authentication & Identity Subsystem (`app/modules/module1_auth`)**: Serves as the security gatekeeper for every user request. It issues asymmetric **RS256 JWTs**, validates credentials against bcrypt-hashed passwords, assigns additive roles (`Student`, `Instructor`, `Admin`), enforces session revocation via Redis JTI blacklisting, and writes immutable audit logs for compliance.
2. **Curriculum & Knowledge Vault Subsystem (`app/modules/module2_content`)**: Manages the platform's core intellectual property. It organizes courses, modules, and lessons, manages secure asset uploads via MinIO/S3 presigned URLs, and acts as the ingestion point for the AI vector search engine. By using the **Transactional Outbox Pattern**, it guarantees that published lessons are never lost from the AI vector pipeline.
3. **Student Learning Progress & Content Gating Subsystem (`app/modules/module4_experience`)**: Directly drives the student learning journey. It records granular lesson completion timestamps, calculates aggregate course progress percentages, and enforces server-side **content gating** (preventing students from skipping foundational prerequisites before taking advanced material).
4. **Live Classes & AI Assessment Stubs (`app/modules/module3_live`, `app/modules/module5_assessment`, `app/modules/module6_adaptive`)**: Establishes the full database schema, foreign keys, and entity models for live sessions, AI-generated exams, skill-level grading, weakness flags, and automated remediation plans so that downstream AI workers and event consumers integrate smoothly without future breaking schema changes.
5. **Alembic Database Engine (`backend/alembic`)**: Provides 12 ordered, deterministic migrations that configure Postgres extensions (`uuid-ossp`, `vector`), define custom PostgreSQL enums, build relational tables, and register native database triggers for automatic timestamp management.

---

## 2. Specification Traceability Matrix: How Code Maps to Docs

Every file in the codebase directly implements rules, schemas, and constraints established in `docx/backends_specs/` and `docx/base-SDD/`. Below is the complete traceability index:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SPECIFICATION TRACEABILITY FLOW                                        │
│                                                                                                        │
│  Base SDD & Backend Specs                Implemented Code Artifacts                                    │
│  ────────────────────────                ──────────────────────────                                    │
│  00-MASTER-SDD-ROADMAP.md         ───►   app/main.py, app/telemetry.py, app/workers/                   │
│  01-MODULE-SPECIFICATIONS.md      ───►   app/modules/ (module1_auth, module2_content, module4)         │
│  02-DATABASE-AND-ERD.md           ───►   alembic/versions/ (001-012), app/database.py                  │
│  03-AUTH-AND-NEXTJS-GUIDE.md      ───►   app/shared/auth.py, app/shared/dependencies.py                │
│  04-AI-RAG-AND-EVALUATION.md      ───►   alembic/007_module2_embeddings.py, embedding_outbox           │
│  05-ADAPTIVE-LOOP-AND-EVENTS.md   ───►   app/modules/module6_adaptive/, adaptive_consumer.py           │
│  06-TESTING-AND-DEVOPS-GUIDE.md   ───►   tests/, docker-compose.yml, Dockerfile, scripts/             │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Component Mapping

#### A. Core Infrastructure & Deployment Configuration
- **Specification Source:** `docx/backends_specs/06-TESTING-AND-DEVOPS-GUIDE.md` §3 (Docker & Local Dev) and `docx/base-SDD/03-TECHNICAL-FOUNDATION.md` §2.
- **Implemented Files:**
  - `backend/docker-compose.yml`: Provisions PostgreSQL 16 with `pgvector/pgvector:pg16`, Redis 7 on Alpine, and MinIO S3-compatible object storage with dedicated health checks.
  - `backend/Dockerfile`: Multi-stage Python 3.12 production container utilizing non-root security principles and wheel caching.
  - `backend/requirements.txt`: Strictly pinned production dependencies (`fastapi`, `uvicorn`, `sqlalchemy[asyncio]`, `asyncpg`, `redis`, `cryptography`, `pgvector`, `boto3`, `opentelemetry`).
  - `backend/.env.example`: Comprehensive environment template documenting every operational variable.
- **Rationale & Guardrail:** Prevents the classic "works on my machine" syndrome by mirroring production orchestration locally with identical database drivers and vector extensions.

#### B. Application Factory, Telemetry & Database Session
- **Specification Source:** `docx/backends_specs/01-MODULE-SPECIFICATIONS.md` §General API Standards, `02-DATABASE-AND-ERD.md` §Connection Pooling, and `00-MASTER-SDD-ROADMAP.md` §1.
- **Implemented Files:**
  - `app/main.py`: Configures FastAPI lifespan, CORS middleware with credentials support, centralized exception handlers translating domain errors to RFC-standard JSON, and registers routers.
  - `app/database.py`: Builds the async engine using `asyncpg` with connection pool pre-pinging, recycling (1800s), and `async_sessionmaker`.
  - `app/telemetry.py`: Auto-instruments FastAPI, SQLAlchemy, Redis, and HTTPX using OpenTelemetry for distributed trace propagation.
- **Rationale & Guardrail:** Connection pool pre-pinging guarantees that stale connections dropped by network firewalls do not cause 500 errors for real users.

#### C. Cryptography, Authentication & Additive RBAC
- **Specification Source:** `docx/backends_specs/03-AUTH-AND-NEXTJS-GUIDE.md` §1 & §2, and `docx/backends_specs/01-MODULE-SPECIFICATIONS.md` §Module 1 Rules 1–7.
- **Implemented Files:**
  - `app/shared/auth.py`: Implements **RS256 asymmetric JWT** signing and verification using cryptographic keys, bcrypt password hashing with automatic salt generation, and SHA-256 refresh token hashing.
  - `app/shared/dependencies.py`: FastAPI dependency functions (`get_current_user`, `require_permission`, `require_any_role`). Validates JWT signature, checks the Redis JTI blacklist to block logged-out tokens immediately, eagerly loads roles and permissions via `selectinload`, blocks suspended accounts in real-time, and enforces additive permissions.
  - `app/modules/module1_auth/services/auth_service.py` & `user_service.py`: Encapsulates user registration, password rotation, audit log recording, and session cookie generation.
- **Rationale & Guardrail:** Avoids symmetric HS256 shared-secret risks. Suspended users are denied immediately on their next request without waiting for token expiration.

#### D. Content Management, Hierarchical Structuring & Transactional Outbox
- **Specification Source:** `docx/backends_specs/01-MODULE-SPECIFICATIONS.md` §Module 2, `02-DATABASE-AND-ERD.md` §Content Tables, and `04-AI-RAG-AND-EVALUATION.md` §Transactional Outbox.
- **Implemented Files:**
  - `app/modules/module2_content/models.py`: Defines `Course`, `CourseModule`, `Lesson`, `LessonSkill`, `ContentAsset`, `EmbeddingOutbox`, and `ContentEmbedding` (with 384-dimensional pgvector column).
  - `app/modules/module2_content/services/lesson_service.py`: Implements the `publish_lesson` method which writes to `lessons` and creates a pending row in `embedding_outbox` **in the exact same database transaction**. Re-publishing a lesson increments `content_version`.
  - `app/modules/module2_content/services/asset_service.py`: Handles media file uploads to S3/MinIO and generates presigned download URLs.
- **Rationale & Guardrail:** Solves the distributed dual-write problem. AI workers can never fail to index a published lesson due to network partitions between Postgres and message brokers.

#### E. Student Learning Experience & Server-Side Content Gating
- **Specification Source:** `docx/backends_specs/01-MODULE-SPECIFICATIONS.md` §Module 4, and `00-MASTER-SDD-ROADMAP.md` §3 Principle 3.
- **Implemented Files:**
  - `app/modules/module4_experience/services/progress_service.py`: Calculates course progress percentage (`completed_lessons / total_lessons * 100`) and provides `check_content_gating()`. Verifies that all prior lessons in the sequence are marked complete before permitting access to the requested lesson.
  - `app/modules/module4_experience/router.py`: Exposes endpoints for recording lesson completions, fetching student dashboard summaries, and managing notifications.
- **Rationale & Guardrail:** All content access is guarded by the backend. Client-side state cannot manipulate or bypass course prerequisites.

#### F. Shared Skill Taxonomy & Stub Models for Modules 3, 5, 6
- **Specification Source:** `docx/backends_specs/00-MASTER-SDD-ROADMAP.md` §3 Principle 10, `01-MODULE-SPECIFICATIONS.md` §Modules 3, 5, 6, and `02-DATABASE-AND-ERD.md`.
- **Implemented Files:**
  - `app/modules/shared_models/skill_taxonomy.py`: Cross-cutting skill hierarchy referenced by Module 2 (curriculum tagging), Module 5 (assessment scoring), and Module 6 (weakness tracking).
  - `app/modules/module3_live/models.py`: Live class sessions, WebRTC links, and attendance records.
  - `app/modules/module5_assessment/models.py`: Tests, question banks (MCQ + open-ended), submissions, and skill-level grading.
  - `app/modules/module6_adaptive/models.py`: Weakness detection flags, remediation plans, and targeted retest tracking.
- **Rationale & Guardrail:** Defining the database schema upfront in Phase 1 ensures zero breaking database migrations when Phase 2 and Phase 3 are implemented.

#### G. Alembic Database Migrations (001–012)
- **Specification Source:** `docx/backends_specs/02-DATABASE-AND-ERD.md` (Complete DDL Specifications and ERD).
- **Implemented Files:**
  - `001_extensions_and_enums.py`: Enables `uuid-ossp` & `vector`; registers platform enums.
  - `002_shared_skill_taxonomy.py`: Creates `skill_taxonomy`.
  - `003_module1_auth.py`: Creates `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, and `audit_logs`.
  - `004_module1_tokens.py`: Creates `refresh_tokens` and `password_reset_tokens`.
  - `005_module2_content_core.py`: Creates `courses`, `course_modules`, `lessons`, and `lesson_skills`.
  - `006_module2_assets_and_outbox.py`: Creates `content_assets` and `embedding_outbox`.
  - `007_module2_embeddings.py`: Creates `content_embeddings` with pgvector(384) and IVFFlat index.
  - `008_module3_live_classes.py`: Creates `live_sessions` and `session_attendees`.
  - `009_module4_experience.py`: Creates `student_progress`, `learning_path_state`, and `notifications`.
  - `010_module5_assessment.py`: Creates `tests`, `questions`, `submissions`, and `skill_scores`.
  - `011_module6_adaptive.py`: Creates `weakness_flags`, `remediation_plans`, and `remediation_plan_items`.
  - `012_db_triggers.py`: Registers Postgres triggers to automatically update `updated_at` timestamps on row modifications.
- **Rationale & Guardrail:** Database triggers handle timestamp updates at the engine level, guaranteeing accuracy regardless of whether an update originated from SQLAlchemy, raw SQL, or background workers.

---

## 3. Backend Testing Protocol: How to Test the Backend Now

The test suite in `backend/tests/` provides rapid local feedback and automated regression protection.

### Structure of the Backend Test Suite

```
backend/tests/
├── conftest.py                             # Test engine, HTTP async client, and rollback fixtures
├── factories/
│   ├── user_factory.py                     # FactoryBoy generator for Users, Admins, Instructors
│   └── course_factory.py                   # FactoryBoy generator for Courses, Modules, Lessons
├── unit/
│   ├── test_auth_crypto.py                 # Pure unit tests: Bcrypt, RS256 JWT, Refresh Tokens
│   ├── test_rbac.py                        # Unit tests: Role inheritance, Additive permissions
│   └── test_pagination.py                  # Unit tests: PaginatedResponse & offset math
└── integration/
    ├── module1/
    │   └── test_auth_endpoints.py          # API tests: Register, Login, Refresh Cookies, /users/me
    └── module2/
        ├── test_course_crud.py             # API tests: Permission gating, Course listing, 404s
        └── test_lesson_publish.py          # API tests: Outbox transaction & version incrementing
```

### The Transaction Rollback Isolation Pattern

In `backend/tests/conftest.py`, every integration test receives the `seeded_db` fixture:
```python
@pytest_asyncio.fixture
async def seeded_db(db_engine):
    async with db_engine.connect() as conn:
        trans = await conn.begin()
        async_session = AsyncSession(bind=conn, expire_on_commit=False)
        # Seeds roles and test data in the transaction
        yield async_session
        await trans.rollback()  # Rolled back cleanly! Zero database pollution.
```
**Why this matters:**
- Tests run at high speed because the database schema is not rebuilt between tests.
- Tests can safely create, update, or delete records without polluting the database for subsequent tests.

### How to Run the Tests

#### Running the Full Test Suite
```powershell
pytest
```

#### Running Only Unit Tests (Sub-second execution)
```powershell
pytest tests/unit
```

#### Running Module 1 Auth Integration Tests
```powershell
pytest tests/integration/module1/test_auth_endpoints.py -v
```

#### Running Module 2 Publishing & Outbox Tests
```powershell
pytest tests/integration/module2/test_lesson_publish.py -v
```

---

## 4. Frontend Integration & Testing Guidance (Current & Future)

This section provides actionable guidance for the frontend engineering team, detailing how to interact with and test against the backend today, and how to structure end-to-end testing when the Next.js frontend is built.

### 4.1 Current Phase: How Frontend Engineers Test Against the Backend Today

Even before the full frontend application is built, frontend engineers must integrate and test API contracts:

#### 1. Interactive Exploration via Swagger & ReDoc
- **Swagger UI:** `http://localhost:8000/docs` allows frontend developers to test request payloads, inspect HTTP response schemas, and copy cURL commands.
- **Machine-Readable OpenAPI Spec:** Available at `http://localhost:8000/openapi.json`. The frontend team can import this directly into Postman, Insomnia, or Bruno collections.

#### 2. Cookie & CORS Handling for Authentication
- **Access Token:** Returned in the JSON response body of `POST /api/v1/auth/login`. The frontend must keep this in memory (or React Context / state store), **never in `localStorage`** (to prevent XSS token theft).
- **Refresh Token:** Stored in an `HttpOnly`, `SameSite=Strict`, `Secure` cookie named `refresh_token`.
- **Axios / Fetch Requirement:** All frontend requests must configure `credentials: 'include'` (Fetch) or `withCredentials: true` (Axios) so the browser automatically sends and receives cookies during `POST /api/v1/auth/refresh` and `POST /api/v1/auth/logout`.

#### 3. TypeScript Type Generation from Backend OpenAPI
Frontend developers can generate TypeScript types directly from the running FastAPI server:
```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api-schema.d.ts
```
This guarantees that frontend request bodies and response types match the backend Pydantic models.

#### 4. Frontend Mocking with MSW (Mock Service Worker)
When developing UI components before backend endpoints are fully integrated, the frontend team should use **MSW** to intercept requests in the browser:
```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/users/me', () => {
    return HttpResponse.json({
      id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      email: 'student@elarion.io',
      first_name: 'Alex',
      last_name: 'Student',
      roles: ['Student'],
      permissions: ['course:read', 'lesson:read'],
    });
  }),
];
```

---

### 4.2 Future Phase: Complete Frontend Testing Strategy

When the Next.js/React frontend is built, testing must be structured across four distinct levels:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND TEST PYRAMID                    │
│                                                             │
│                    /───────────────\                        │
│                   /   E2E Tests     \       Playwright      │
│                  /  (User Journeys)  \                      │
│                 /─────────────────────\                     │
│                /   Integration Tests   \    React Testing   │
│               /  (Components + Router)  \   Library + MSW   │
│              /───────────────────────────\                  │
│             /         Unit Tests          \ Vitest / Jest   │
│            /     (Utilities & Hooks)       \                │
│           /─────────────────────────────────\               │
└─────────────────────────────────────────────────────────────┘
```

#### 1. Unit Testing (Vitest / Jest)
- **Scope:** Custom hooks (e.g., `useAuth`, `useProgress`), formatters (e.g., date helpers, duration converters), and validation schemas (e.g., Zod schemas matching backend constraints).
- **Standard:** Fast, isolated tests without browser or network dependencies.

#### 2. Component & Integration Testing (React Testing Library + MSW)
- **Scope:** Interactive components (e.g., `CourseCard`, `LessonViewer`, `QuizQuestionMCQ`).
- **Guidelines:**
  - Test user behavior rather than implementation details (use `getByRole`, `getByText` instead of CSS selectors).
  - Mock network calls using MSW rather than mocking `fetch` directly.
  - Verify that buttons disable properly during pending states and error banners appear when APIs return 4xx/5xx status codes.

#### 3. End-to-End (E2E) Testing (Playwright)
Playwright will run against a real running stack (Frontend container + Backend container + Postgres/Redis) to validate complete user journeys:

- **Journey 1: Registration & Login Flow**
  1. Student fills registration form.
  2. Asserts redirect to onboarding or dashboard.
  3. Verifies user name displays in navigation.
  4. Checks that the `refresh_token` cookie is set as `HttpOnly`.
- **Journey 2: Course Access & Content Gating**
  1. Student navigates to Course details.
  2. Student completes Lesson 1 and clicks "Complete & Next".
  3. Asserts Lesson 2 unlocks and becomes clickable.
  4. Attempts direct navigation to Lesson 4 URL (expects 403 Forbidden screen).
- **Journey 3: Role-Based Navigation**
  1. Login as Student -> verifies "Create Course" button is **absent**.
  2. Login as Instructor -> verifies Instructor Studio and "Create Course" button are **present**.
- **Journey 4: Session Revocation / Logout**
  1. User clicks "Log out".
  2. Asserts redirect to `/login`.
  3. Verifies pressing browser back button does not display authenticated pages.

#### 4. SSR vs. CSR Authentication Testing in Next.js
Next.js App Router utilizes Server Components (SSR) and Client Components (CSR). Testing must specifically verify:
- **Middleware Gating (`middleware.ts`):** Unauthenticated requests to `/dashboard/*` or `/courses/*` are redirected to `/login` before rendering occurs on the server.
- **Server Component Token Forwarding:** When Server Components fetch data from the FastAPI backend, they must read the cookie header from `next/headers` and forward it via the `Cookie` or `Authorization` header.
- **Token Refresh Loop:** When the access token expires in the browser, an Axios/Fetch interceptor must call `/api/v1/auth/refresh`, receive a new access token, and retry the original failed request seamlessly.

---

## 5. Summary & Handover Checklist

| Verification Item | Command / Location | Expected Outcome | Status |
|---|---|---|---|
| **All Migrations Applied** | `alembic upgrade head` | 12 migrations run cleanly with zero errors | Verified |
| **Database Triggers Active** | Migration 012 applied | `updated_at` updates automatically on row edit | Verified |
| **System Seed Data Loaded** | `python scripts/seed_data.py` | 3 Roles, 18 Permissions, Skill Taxonomy seeded | Verified |
| **Unit & Integration Tests** | `pytest` | All tests pass with transaction rollback isolation | Verified |
| **OpenAPI Documentation** | `http://localhost:8000/docs` | Full interactive documentation available | Verified |
| **Frontend Guidance Created** | This document | Complete spec mapping and testing roadmap documented | Complete |
