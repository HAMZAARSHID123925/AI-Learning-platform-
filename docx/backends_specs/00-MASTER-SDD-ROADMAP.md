# 00 — MASTER SDD ROADMAP
## ELARION AI-Powered Learning Platform — Backend & AI Engineering Master Plan

> **Document Type:** Spec-Driven Development (SDD) Master Roadmap
> **Audience:** Backend Engineer (Usman), Frontend Engineer, Technical Lead
> **Status:** Approved for Execution
> **Last Updated:** 2026-09-10
> **Source of Truth Priority:** Module Specs > This Roadmap > General Assumptions

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Project Name** | ELARION AI-Powered Adaptive Learning Platform |
| **Architecture Style** | Modular Monolith → Event-Driven Microservices-ready |
| **Backend** | Python FastAPI |
| **Frontend** | React / Next.js (SSR + CSR) |
| **AI Provider** | Anthropic Claude API |
| **Database** | PostgreSQL + pgvector |
| **Cache / Sessions** | Redis |
| **Messaging** | Redis Streams (initial) → RabbitMQ (if scale requires) |
| **Object Storage** | S3-compatible (MinIO local / AWS S3 / Cloudflare R2 prod) |
| **Live Video** | Third-party SDK (Agora / Zoom SDK / Daily.co) |
| **Observability** | OpenTelemetry + Grafana Cloud / Honeycomb |
| **CI/CD** | GitHub Actions |
| **Container** | Docker + Docker Compose (local) → Kubernetes / ECS (prod) |

---

## 2. The Six-Module Architecture (Non-Negotiable)

These modules are the **fixed product backbone**. They must never be renamed, merged, split, or reordered.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ELARION Platform Architecture                    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │        Module 1 — User & Access Management                   │  │
│  │   Auth · JWT · RBAC · Sessions · Audit Logging               │  │
│  └────────────────────────────┬─────────────────────────────────┘  │
│                               │ Provides auth foundation to ALL    │
│            ┌──────────────────┼──────────────────┐                 │
│            ▼                  ▼                  ▼                 │
│  ┌──────────────────┐ ┌──────────────┐ ┌──────────────────────┐   │
│  │    Module 2      │ │   Module 3   │ │      Module 4        │   │
│  │ Course & Content │ │ Live Classes │ │ Student Experience   │   │
│  │ Management       │ │              │ │ & Dashboard          │   │
│  └────────┬─────────┘ └──────┬───────┘ └──────────┬───────────┘   │
│           │  published content│  schedules         │ presents all  │
│           │  + pgvector index │  + recordings      │               │
│           ▼                  ▼                    ▼               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Module 5 — AI Assessment & Evaluation           │  │
│  │   RAG Retrieval · Claude Generation · MCQ + LLM Grading      │  │
│  │   Skill Scoring · TestGraded Event                           │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
│                                 │ TestGraded event                 │
│                                 ▼                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │          Module 6 — Adaptive Learning & Remediation          │  │
│  │   Weakness Detection · Remediation Plans · Path Gating       │  │
│  │   Focused Retest (max 3) · Instructor Escalation             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### The Central Adaptive Loop

```
Module 4 → Module 5 → [TestGraded] → Module 6 → Module 4 → Module 5
```

This loop is the **core product differentiator**. Every architectural decision must protect this loop.

---

## 3. Critical Architectural Principles (Non-Negotiable)

These principles are enforced across all phases and all team members:

| # | Principle | Enforcement |
|---|---|---|
| 1 | **PostgreSQL is the transactional source of truth** | No business data in Redis or vector store |
| 2 | **Draft content is NEVER embedded** | Outbox worker checks `status = published` before processing |
| 3 | **Backend enforces all gating** | `GET /lessons/:id` returns `403` if prerequisites incomplete — not just hidden in UI |
| 4 | **MCQ grading is deterministic** | Zero LLM calls for MCQ evaluation |
| 5 | **Retest loops are bounded** | Maximum 3 retests per weakness; 3rd failure escalates to instructor |
| 6 | **Module ownership is strict** | Module 5 evaluates; Module 6 uses evidence. Module 5 never drives remediation. |
| 7 | **All datetimes stored in UTC** | Display layer converts to local timezone |
| 8 | **Async for long-running ops** | AI generation, embedding, grading never block synchronous request paths |
| 9 | **Idempotent background jobs** | Re-running a job must not create duplicate records |
| 10 | **SkillTaxonomy is a shared entity** | Owned by no single module; referenced by M2, M5, and M6 |

---

## 4. Build Phases — Master Timeline

### Phase Dependency Map

```
Phase 1: Functional LMS Core (Days 1–5)
    ↓ [Authoritative published content exists]
Phase 2: AI Assessment & RAG Engine (Days 6–11)
    ↓ [TestGraded event emitted reliably]
Phase 3: Adaptive Intelligence Loop (Days 12–16)
    ↓ [Both loops proven end-to-end]
Phase 4: Live Classes & Replay Archival (Days 17–20)  [parallel to P3 is fine]
    ↓
Phase 5: BFF Aggregation, Real-Time & Hardening (Days 21–25)
```

---

### PHASE 1 — Functional LMS Core (Days 1–5)

**Goal:** Ship a fully working, non-AI LMS. Frontend team is unblocked immediately after Day 5.

| Day | Task | Module | Owner |
|---|---|---|---|
| 1 | Project scaffold: FastAPI app, Alembic, Docker Compose (Postgres + Redis + MinIO) | Infra | Backend |
| 1 | `SkillTaxonomy` shared table + seed data | Shared | Backend |
| 2 | Module 1: User, Role, Permission, AuditLog models + Alembic migration | M1 | Backend |
| 2 | Module 1: `POST /auth/register`, `POST /auth/login` (JWT + Refresh Token) | M1 | Backend |
| 3 | Module 1: `POST /auth/refresh`, `POST /auth/forgot-password`, `POST /auth/reset-password` | M1 | Backend |
| 3 | Module 1: Redis-backed session store + RBAC dependency injection | M1 | Backend |
| 4 | Module 2: Course, CourseModule, Lesson models + Alembic migration | M2 | Backend |
| 4 | Module 2: Course/Module/Lesson CRUD endpoints + draft→published state machine | M2 | Backend |
| 4 | Module 2: ContentAsset upload to S3/MinIO | M2 | Backend |
| 5 | Module 2: Skill tagging (`lesson_skills` junction table) | M2 | Backend |
| 5 | Module 4: `student_progress` model + `GET /courses/:id/progress`, `POST /lessons/:id/complete` | M4 | Backend |
| 5 | Integration smoke test: Register → Login → Create Course → Publish Lesson → Track Progress | All | Backend |

**Phase 1 Deliverable (What You See):**
- `docker compose up` starts the whole stack
- Postman/Bruno: login returns JWT + sets refresh cookie
- Create a course, add modules/lessons, publish a lesson
- Student can mark lesson complete and see progress percentage
- Frontend team can begin building login page and course catalog

---

### PHASE 2 — AI Assessment & RAG Engine (Days 6–11)

**Goal:** Transform published content into AI-generated, AI-evaluated assessments.

| Day | Task | Module | Owner |
|---|---|---|---|
| 6 | Install pgvector extension + `content_embeddings` table migration | M2 | Backend |
| 6 | Outbox pattern: Write `embedding_outbox` row within same publish transaction | M2 | Backend |
| 7 | Async embedding worker: PDF/text extraction → chunking → embedding via API → pgvector insert | M2 | Backend |
| 7 | Idempotency check: skip if `content_embedding` row already exists for this `(lesson_id, version)` | M2 | Backend |
| 8 | Module 5: Test, Question, Submission, SkillScore models + migration | M5 | Backend |
| 8 | Module 5: RAG retrieval service (top-k pgvector search filtered by skill tags) | M5 | Backend |
| 9 | Module 5: Async test generation job — Claude API with structured JSON output | M5 | Backend |
| 9 | `POST /assessments/generate` (returns `job_id`), `GET /assessments/:job_id/status` | M5 | Backend |
| 10 | Module 5: Submission handler + deterministic MCQ grader | M5 | Backend |
| 10 | Module 5: LLM-as-a-grader for short answers (rubric + source chunks + student answer → Claude) | M5 | Backend |
| 11 | Module 5: SkillScore computation + `TestGraded` event emit to Redis Streams | M5 | Backend |
| 11 | Integration test: Publish lesson → Embed → Generate assessment → Submit → Graded → Event fired | All | Backend |

**Phase 2 Deliverable (What You See):**
- Publish a lesson → wait ~30s → assessment automatically available
- Submit answers → get back skill-level scores with feedback
- Redis Streams shows `TestGraded` event with full payload
- Short answer evaluated by Claude against rubric — not just keyword matching

---

### PHASE 3 — Adaptive Intelligence Loop (Days 12–16)

**Goal:** Close the adaptive learning loop — weakness detection → remediation → bounded retest.

| Day | Task | Module | Owner |
|---|---|---|---|
| 12 | Module 6: WeaknessFlag, RemediationPlan, RemediationPlanItem, LearningPathState models + migration | M6 | Backend |
| 12 | Module 6: `TestGraded` event consumer (Redis Streams consumer group) | M6 | Backend |
| 13 | Module 6: Rule-based weakness detector (sub-skill score `< 60%` → `WeaknessFlag`) | M6 | Backend |
| 13 | Module 6: Remediation plan generator (SkillTaxonomy lookup → lesson mapping → ordered plan) | M6 | Backend |
| 14 | Module 6: `LearningPathState` transitions (`locked → unlocked → in_progress → mastered`) | M6 | Backend |
| 14 | Backend gating: `GET /lessons/:id` checks `LearningPathState` — returns `403` if locked | M6 | Backend |
| 15 | Module 6: Focused retest trigger on remediation completion (calls M5 generate with skill scope) | M6 | Backend |
| 15 | Retest attempt counter: max 3 → 4th failure sets `instructor_escalation = true` | M6 | Backend |
| 16 | `GET /students/:id/remediation-plan` + `POST /remediation-plans/:id/acknowledge` | M6 | Backend |
| 16 | Full loop integration test: Fail skill → see plan → complete remediation → retest triggered | All | Backend |

**Phase 3 Deliverable (What You See):**
- Fail a skill below 60% → remediation plan automatically created
- Advanced lesson returns `403 Forbidden` until remediation complete
- Complete remediation → focused retest auto-triggers on weak skills only
- After 3 failures: student marked for instructor intervention (flag visible in admin panel)

---

### PHASE 4 — Live Classes & Replay Archival (Days 17–20)

**Goal:** Integrate third-party video sessions anchored to the curriculum.

| Day | Task | Module | Owner |
|---|---|---|---|
| 17 | Module 3: LiveSession, SessionParticipant, Recording models + migration | M3 | Backend |
| 17 | Module 3: Session scheduling endpoints (`POST /live-sessions`, `GET /live-sessions`) | M3 | Backend |
| 18 | Module 3: Third-party SDK token generation for host + participants | M3 | Backend |
| 18 | Module 3: Webhook handler for join/leave events → attendance tracking | M3 | Backend |
| 19 | Module 3: `POST /webhooks/recording-complete` → store in S3 → create M2 ContentAsset (type: `replay`) | M3 | Backend |
| 20 | UTC timestamp enforcement across all session fields | M3 | Backend |
| 20 | Integration test: Schedule → Join → Leave → Attendance recorded → Recording archived → Visible in M2 | All | Backend |

**Phase 4 Deliverable (What You See):**
- Schedule a live class attached to a course module
- Get a join URL/token for both host and student
- Join/leave automatically recorded as attendance
- After class ends, recording appears in course content library as replay

---

### PHASE 5 — BFF Aggregation, Real-Time & Hardening (Days 21–25)

**Goal:** Production-ready performance, observability, and security.

| Day | Task | Module | Owner |
|---|---|---|---|
| 21 | Module 4: Dashboard aggregate endpoint (`GET /students/:id/dashboard`) — Redis-cached | M4 | Backend |
| 21 | Module 4: Cache invalidation on `lesson_completed`, `test_graded`, `remediation_updated` | M4 | Backend |
| 22 | Module 4: Notification model + SSE endpoint for real-time push | M4 | Backend |
| 22 | SSE events: `test.graded`, `live_class.starting`, `remediation.plan_ready` | M4 | Backend |
| 23 | OpenTelemetry: trace spans across M4 → M5 → TestGraded → M6 → M4 | Infra | Backend |
| 23 | Structured logging: JSON logs with `trace_id`, `module`, `student_id` | Infra | Backend |
| 24 | Security hardening: rate limiting on auth routes, RBAC audit on every endpoint | M1 | Backend |
| 24 | FERPA compliance: data purge endpoint, parental consent flag on user model | M1 | Backend |
| 25 | GitHub Actions CI pipeline: lint → typecheck → pytest → docker build | Infra | Backend |
| 25 | Final integration test: Full student journey from login to mastery confirmation | All | Backend |

**Phase 5 Deliverable (What You See):**
- Dashboard loads from Redis cache in <50ms
- Browser tab gets real-time notification when test is graded (no polling)
- OpenTelemetry dashboard shows the full chain of a student's test submission
- GitHub Actions runs full test suite on every push

---

## 5. Module Ownership Matrix

| Capability | Owned By | NOT Owned By |
|---|---|---|
| Authentication & Token Issuance | M1 | Any other module |
| RBAC enforcement | M1 (middleware) | Frontend UI |
| Course/Content/Lesson data | M2 | M4 (presents only) |
| SkillTaxonomy (shared) | Shared table | Any single module |
| Content embedding into pgvector | M2 (async worker) | M5 |
| Live session scheduling | M3 | M2 or M4 |
| Student dashboard presentation | M4 | Any other module |
| Assessment generation | M5 | M6 |
| Grading / Skill Scoring | M5 | M6 |
| TestGraded event emission | M5 | M6 |
| Weakness detection | M6 | M5 |
| Remediation plan construction | M6 | M4 or M5 |
| Content gating decisions | M6 | Frontend |
| Focused retest triggering | M6 | M5 (executes, not decides) |

---

## 6. Shared Infrastructure Contracts

### Event: `TestGraded`
```json
{
  "event_type": "test.graded",
  "version": "1.0",
  "emitted_at": "2026-09-10T16:00:00Z",
  "payload": {
    "submission_id": "uuid",
    "test_id": "uuid",
    "student_id": "uuid",
    "lesson_id": "uuid",
    "overall_score": 0.72,
    "skill_scores": [
      { "skill_id": "uuid", "skill_slug": "algebra.quadratic", "score": 0.45, "max_score": 1.0 },
      { "skill_id": "uuid", "skill_slug": "algebra.linear", "score": 0.90, "max_score": 1.0 }
    ],
    "graded_at": "2026-09-10T16:00:00Z"
  }
}
```

### Shared SkillTaxonomy Table (Reference)
```
skill_taxonomy
├── id (UUID)
├── parent_id (UUID, nullable — for hierarchical skills)
├── name (e.g. "Quadratic Equations")
├── slug (e.g. "algebra.quadratic") — stable identifier
├── description
└── version (integer — increment on structural changes)
```

---

## 7. Documentation Suite Index

| File | Reads When |
|---|---|
| `00-MASTER-SDD-ROADMAP.md` *(this file)* | Start of project, team onboarding, phase planning |
| `01-MODULE-SPECIFICATIONS.md` | Before building any endpoint or model in any module |
| `02-DATABASE-AND-ERD.md` | Before writing any Alembic migration or SQLAlchemy model |
| `03-AUTH-AND-NEXTJS-GUIDE.md` | Frontend engineer setting up auth; backend engineer designing JWT |
| `04-AI-RAG-AND-EVALUATION.md` | Building embedding pipeline, Claude prompts, grading engine |
| `05-ADAPTIVE-LOOP-AND-EVENTS.md` | Building Module 6, event consumers, state machine, retest logic |
| `06-TESTING-AND-DEVOPS-GUIDE.md` | Setting up test suite, CI/CD, Docker, observability |

---

## 8. Definition of Done — Per Phase

A phase is **done** when:

- [ ] All listed endpoints return correct responses (validated with Postman/Bruno collection)
- [ ] All Alembic migrations apply cleanly on a fresh database
- [ ] All background jobs complete without errors and are idempotent
- [ ] Unit and integration tests pass with `pytest` (no skips without documented reason)
- [ ] All new endpoints have RBAC verified: correct role passes, incorrect role gets `403`
- [ ] No draft content appears in pgvector (verified by direct DB query)
- [ ] All datetimes in DB are UTC (verified by direct DB query)
- [ ] No synchronous request path calls the Claude API directly (only async workers do)

---

## 9. Production-Grade Engineering Standards & Real-User Protection Protocol

> **CRITICAL DIRECTIVE FOR ALL AGENTS AND DEVELOPERS:**
> This platform is being engineered for **real users in production**. Shortcuts, sloppy hacks, insecure fallbacks, and toy-project practices are strictly prohibited. Every commit and architectural decision must follow senior-level industry standards.

### 9.1 The 10 Inviolable Production Guardrails

| # | Guardrail | Standard Required | Anti-Pattern Avoided |
|---|---|---|---|
| **1** | **Data Integrity & Outbox Pattern** | Asynchronous events (AI embedding, notifications, adaptive loops) must use the **Transactional Outbox Pattern** in PostgreSQL. The event record is written in the exact same DB transaction as the state change. | Direct Redis/message broker publishing inside HTTP requests (which fails if network drops after DB commit, causing lost events). |
| **2** | **Zero Frontend Trust (Backend Gating)** | Every business rule (content access prerequisites, permissions, role capabilities) is enforced inside backend dependencies. If a user tries to access Lesson 5 without completing Lesson 4, backend returns `403 Forbidden`. | Client-side only hiding of buttons/links while leaving API endpoints unguarded. |
| **3** | **Robust Cryptography & Session Hygiene** | Access tokens use asymmetric **RS256** (private key signs, public key verifies). Refresh tokens are stored in **HttpOnly, Secure, SameSite=Strict** cookies. JTI blacklisting in Redis enables instantaneous logout/revocation. | Symmetric HS256 with shared secrets, storing tokens in localStorage (vulnerable to XSS), or inability to revoke compromised tokens. |
| **4** | **No User Enumeration** | Authentication failures (unknown email vs wrong password) return the identical generic error message (`INVALID_CREDENTIALS`, `401 Unauthorized`) with constant-time response behavior. | "User not found" vs "Incorrect password" leaks user existence to attackers. |
| **5** | **Deterministic vs Generative Separation** | MCQ grading is **100% deterministic code** with zero LLM intervention. AI generation (Claude / Groq) is strictly reserved for synthetic assessment creation, open-ended evaluations, and remediation synthesis. | Calling costly, nondeterministic LLMs to check if option 'B' equals 'B'. |
| **6** | **N+1 Query Prevention** | All SQLAlchemy queries accessing related entities must explicitly specify eager loading strategies (`selectinload` / `joinedload`). | Lazy-loading inside loops that triggers 100 queries for 100 list items. |
| **7** | **Standardized Error Responses** | All errors must produce the unified error schema (`{ "error": true, "code": "...", "message": "...", "details": {...} }`) with appropriate HTTP status codes (400, 401, 403, 404, 409, 422, 500). | Inconsistent raw tracebacks, string exceptions, or returning 200 OK with `{"error": true}`. |
| **8** | **Idempotent Migrations & Seeds** | Database migrations and seed scripts must be completely idempotent. Seeding must safely check existence before insert (`INSERT ... ON CONFLICT DO NOTHING` or explicit existence queries). | Seeds that crash on second run or migrations that fail when reapplied. |
| **9** | **Testing Isolation & Transaction Rollbacks** | Integration tests must run within wrapped database transactions that roll back at the end of each test (`await session.rollback()`), guaranteeing zero test pollution. | Tests writing permanently to shared dev databases or leaving dirty state. |
| **10** | **Graceful AI Degradation & Cost Control** | Embedding generation and LLM calls must have bounded retry policies with exponential backoff, timeout ceilings, and circuit breakers. Fallback to free test providers (e.g. Groq/FastEmbed) during initial development must swap seamlessly to production models via configuration without code changes. | Unbounded loops calling paid APIs, infinite hanging on API outages, or coupling code to a single vendor. |

---

*This document is the master authority on build order and phase ownership. For detailed implementation, see the module spec documents listed in Section 7.*

