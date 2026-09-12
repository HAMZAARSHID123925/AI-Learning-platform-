# 01 — MODULE SPECIFICATIONS
## ELARION AI-Powered Learning Platform — Complete Six-Module Specification

> **Document Type:** Module-Level Specification
> **Priority:** This document is the PRIMARY SOURCE OF TRUTH for all module behavior, entity definitions, business rules, and API contracts.
> **Supersedes:** Any general assumption or high-level description in the Base SDD where conflict exists.

---

## How to Read This Document

Each module section contains:
1. **Purpose** — Why this module exists
2. **Entities** — Every data entity this module owns
3. **Business Rules** — Invariants that must always hold
4. **API Surface** — Every endpoint this module exposes
5. **Module Dependencies** — What it reads from other modules
6. **Events** — What events it emits or consumes

---

## MODULE 1 — User & Access Management

### Purpose
Module 1 is the authentication and authorization foundation of the entire platform. Every API call from every other module passes through the access control layer established here. No module can function without Module 1.

---

### Entities

#### `users`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, default gen | |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Lowercased on write |
| `password_hash` | TEXT | NOT NULL | bcrypt or Argon2id |
| `first_name` | VARCHAR(100) | NOT NULL | |
| `last_name` | VARCHAR(100) | NOT NULL | |
| `status` | ENUM | NOT NULL | `active`, `suspended`, `pending_verification` |
| `email_verified` | BOOLEAN | default FALSE | |
| `parental_consent` | BOOLEAN | nullable | FERPA/COPPA compliance |
| `last_login_at` | TIMESTAMPTZ | nullable | |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Auto-updated |

#### `roles`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | `Student`, `Instructor`, `Admin` |
| `description` | TEXT | | |

#### `permissions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `code` | VARCHAR(100) | UNIQUE, NOT NULL | e.g. `course:create`, `grade:override`, `user:manage` |
| `description` | TEXT | | |

#### `role_permissions`
| Column | Type | Constraints |
|---|---|---|
| `role_id` | UUID | FK → roles.id |
| `permission_id` | UUID | FK → permissions.id |
| Composite PK | `(role_id, permission_id)` | |

#### `user_roles`
| Column | Type | Constraints |
|---|---|---|
| `user_id` | UUID | FK → users.id |
| `role_id` | UUID | FK → roles.id |
| Composite PK | `(user_id, role_id)` | |

#### `refresh_tokens`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id | |
| `token_hash` | TEXT | NOT NULL | SHA-256 of raw token |
| `expires_at` | TIMESTAMPTZ | NOT NULL | 7-day TTL |
| `revoked_at` | TIMESTAMPTZ | nullable | Set on logout/rotation |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

#### `password_reset_tokens`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id | |
| `token_hash` | TEXT | NOT NULL | Single-use |
| `expires_at` | TIMESTAMPTZ | NOT NULL | 1-hour TTL |
| `used_at` | TIMESTAMPTZ | nullable | |

#### `audit_logs`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `actor_id` | UUID | nullable | NULL = system action |
| `action` | VARCHAR(100) | NOT NULL | e.g. `user.login`, `role.assigned` |
| `target_type` | VARCHAR(50) | | e.g. `User`, `Course` |
| `target_id` | UUID | nullable | |
| `metadata` | JSONB | | Additional context |
| `ip_address` | INET | nullable | |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

---

### Business Rules

1. **Email must be unique** across all users regardless of status.
2. **Passwords** must be hashed with bcrypt (cost 12) or Argon2id before storage. Plaintext passwords must never touch the database layer.
3. **Access tokens** are short-lived JWTs (15-minute TTL) signed with RS256 (asymmetric). The private key signs; other services verify with the public key only.
4. **Refresh tokens** are opaque random strings stored as SHA-256 hashes. Raw token is returned to client once and never stored.
5. **Refresh token rotation:** Every successful refresh invalidates the previous token and issues a new one.
6. **Suspended users** receive `403 Forbidden` on all authenticated endpoints immediately — no waiting for token expiry.
7. **RBAC is additive:** A user with multiple roles accumulates all permissions from all roles.
8. **Permission checks at route level:** Every protected route uses a FastAPI dependency that verifies the decoded JWT's `permissions` array. Frontend UI restrictions do not replace this.
9. **Rate limiting:** `POST /auth/login` → max 5 attempts per 15 minutes per IP. `POST /auth/forgot-password` → max 3 per hour per email.
10. **Audit log everything:** Every auth event (login success, login failure, token refresh, password reset, role change) must produce an `audit_log` row.

---

### API Surface

#### Authentication

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email
```

#### Users

```
GET    /api/v1/users/me
PATCH  /api/v1/users/me
GET    /api/v1/users/:id              [Admin only]
PATCH  /api/v1/users/:id              [Admin only]
DELETE /api/v1/users/:id              [Admin only — soft delete/suspend]
GET    /api/v1/users                  [Admin only — paginated list]
```

#### Roles & Permissions

```
GET    /api/v1/roles                  [Admin only]
POST   /api/v1/users/:id/roles        [Admin only]
DELETE /api/v1/users/:id/roles/:role  [Admin only]
```

#### Audit Logs

```
GET    /api/v1/audit-logs             [Admin only — paginated, filterable by actor/action/target]
```

---

### JWT Payload Contract

```json
{
  "sub": "usr_a1b2c3d4-...",
  "email": "student@elarion.edu",
  "roles": ["Student"],
  "permissions": [
    "lesson:read",
    "assessment:take",
    "live:join",
    "progress:write"
  ],
  "iat": 1725984000,
  "exp": 1725984900
}
```

---

### Redis Keys (Module 1)

| Key Pattern | Value | TTL | Purpose |
|---|---|---|---|
| `session:{user_id}` | `{last_seen, token_family}` | 7 days | Active session registry |
| `rate_limit:login:{ip}` | attempt count | 15 min | Login rate limiting |
| `rate_limit:forgot:{email}` | attempt count | 1 hour | Reset rate limiting |
| `blacklist:token:{jti}` | `1` | Access token TTL | Immediate token revocation |

---

## MODULE 2 — Course & Content Management

### Purpose
Module 2 is the LMS backbone — the authoritative source of all learning content. It defines the curriculum hierarchy (Course → Module → Lesson), manages the content lifecycle (draft → published), and owns the embedding pipeline that feeds the RAG index used by Module 5.

---

### Shared Entity: `skill_taxonomy` *(not owned by M2, referenced by M2, M5, M6)*

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `parent_id` | UUID | nullable FK → self | For nested skills |
| `name` | VARCHAR(150) | NOT NULL | e.g. "Quadratic Equations" |
| `slug` | VARCHAR(150) | UNIQUE, NOT NULL | e.g. "algebra.quadratic" — stable across versions |
| `description` | TEXT | | |
| `version` | INTEGER | NOT NULL, default 1 | Increment on structural change |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

---

### Entities (Module 2 owns)

#### `courses`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `title` | VARCHAR(255) | NOT NULL | |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL-safe identifier |
| `description` | TEXT | | |
| `status` | ENUM | NOT NULL | `draft`, `published`, `archived` |
| `created_by` | UUID | FK → users.id | |
| `thumbnail_url` | TEXT | nullable | S3 URL |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

#### `course_modules`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `course_id` | UUID | FK → courses.id, CASCADE | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `sequence_order` | INTEGER | NOT NULL | 1-based ordering |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

#### `lessons`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `module_id` | UUID | FK → course_modules.id, CASCADE | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `sequence_order` | INTEGER | NOT NULL | |
| `status` | ENUM | NOT NULL | `draft`, `published` |
| `published_at` | TIMESTAMPTZ | nullable | Set when status → published |
| `content_version` | INTEGER | NOT NULL, default 1 | Increment on re-publish |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

#### `lesson_skills`
| Column | Type | Constraints |
|---|---|---|
| `lesson_id` | UUID | FK → lessons.id |
| `skill_id` | UUID | FK → skill_taxonomy.id |
| Composite PK | `(lesson_id, skill_id)` | |

#### `content_assets`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `lesson_id` | UUID | FK → lessons.id, nullable | NULL if attached to session recording |
| `session_id` | UUID | FK → live_sessions.id, nullable | For replay assets |
| `type` | ENUM | NOT NULL | `video`, `pdf`, `text`, `image`, `replay` |
| `storage_key` | TEXT | NOT NULL | S3 object key |
| `cdn_url` | TEXT | | CloudFront/Cloudflare URL |
| `file_size_bytes` | BIGINT | | |
| `duration_seconds` | INTEGER | nullable | For video/audio |
| `processing_status` | ENUM | NOT NULL | `pending`, `ready`, `failed` |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

#### `embedding_outbox`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `lesson_id` | UUID | FK → lessons.id | |
| `lesson_version` | INTEGER | NOT NULL | Snapshot of version at publish time |
| `status` | ENUM | NOT NULL | `pending`, `processing`, `completed`, `failed` |
| `retry_count` | INTEGER | NOT NULL, default 0 | |
| `error_message` | TEXT | nullable | |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `processed_at` | TIMESTAMPTZ | nullable | |

#### `content_embeddings`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `lesson_id` | UUID | FK → lessons.id | |
| `lesson_version` | INTEGER | NOT NULL | Tied to specific published version |
| `chunk_index` | INTEGER | NOT NULL | Position in lesson for ordering context |
| `chunk_text` | TEXT | NOT NULL | Source text for this vector |
| `vector` | vector(1536) | NOT NULL | pgvector column (dimension matches embedding model) |
| `skill_tags` | UUID[] | | Array of skill_taxonomy IDs this chunk covers |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

Index: `CREATE INDEX ON content_embeddings USING ivfflat (vector vector_cosine_ops)`

---

### Business Rules

1. **Draft content is never embedded.** The embedding worker must verify `lessons.status = 'published'` before processing. Any outbox event for a draft lesson is discarded.
2. **Content versioning:** Re-publishing a lesson increments `content_version`. The embedding worker creates new `content_embeddings` rows for the new version and marks old rows as superseded (soft delete or version filter).
3. **Idempotent embedding:** If `content_embeddings` already contains rows for `(lesson_id, lesson_version)`, the worker skips processing. Re-running is safe.
4. **Outbox atomicity:** The `embedding_outbox` row and the `lessons.status = 'published'` update happen in the same database transaction.
5. **Skill tagging is required before publishing** if the lesson will be used for AI assessment. A lesson without skill tags can be published but will not be eligible for assessment generation.
6. **Course hierarchy integrity:** Deleting a course cascades to its modules and lessons. This also triggers cleanup of associated content assets (soft delete, S3 objects retained with TTL policy).
7. **Content assets belong to one parent:** A `content_asset` is either attached to a `lesson_id` OR a `session_id` — never both.

---

### API Surface

```
# Courses
POST   /api/v1/courses                          [Instructor, Admin]
GET    /api/v1/courses                          [All authenticated — paginated]
GET    /api/v1/courses/:id                      [All authenticated]
PATCH  /api/v1/courses/:id                      [Instructor (owner), Admin]
DELETE /api/v1/courses/:id                      [Admin]
POST   /api/v1/courses/:id/publish              [Instructor (owner), Admin]

# Course Modules
POST   /api/v1/courses/:id/modules              [Instructor, Admin]
GET    /api/v1/courses/:id/modules              [All authenticated]
PATCH  /api/v1/modules/:id                      [Instructor, Admin]
DELETE /api/v1/modules/:id                      [Instructor, Admin]
PATCH  /api/v1/modules/:id/reorder              [Instructor, Admin]

# Lessons
POST   /api/v1/modules/:id/lessons              [Instructor, Admin]
GET    /api/v1/modules/:id/lessons              [All authenticated]
GET    /api/v1/lessons/:id                      [All authenticated — checks LearningPathState]
PATCH  /api/v1/lessons/:id                      [Instructor, Admin]
DELETE /api/v1/lessons/:id                      [Instructor, Admin]
POST   /api/v1/lessons/:id/publish              [Instructor, Admin]
POST   /api/v1/lessons/:id/skills               [Instructor, Admin]
DELETE /api/v1/lessons/:id/skills/:skill_id     [Instructor, Admin]

# Content Assets
POST   /api/v1/lessons/:id/assets               [Instructor, Admin — multipart upload]
GET    /api/v1/lessons/:id/assets               [All authenticated]
DELETE /api/v1/assets/:id                       [Instructor (owner), Admin]

# Skill Taxonomy
GET    /api/v1/skills                           [All authenticated]
GET    /api/v1/skills/:id                       [All authenticated]
POST   /api/v1/skills                           [Admin only]

# Embedding Status (Internal / Admin)
GET    /api/v1/lessons/:id/embedding-status     [Admin, Instructor]
```

---

## MODULE 3 — Live Online Classes

### Purpose
Module 3 manages the live, synchronous learning experience. It integrates with a third-party video SDK for real-time sessions, tracks attendance via webhooks, and archives recordings back into the Module 2 content library.

---

### Entities

#### `live_sessions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `course_id` | UUID | FK → courses.id | |
| `module_id` | UUID | FK → course_modules.id, nullable | Optional curriculum anchor |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `host_id` | UUID | FK → users.id | Instructor |
| `scheduled_at_utc` | TIMESTAMPTZ | NOT NULL | Always UTC |
| `duration_minutes` | INTEGER | NOT NULL | |
| `provider` | ENUM | NOT NULL | `agora`, `zoom`, `daily` |
| `provider_room_id` | TEXT | NOT NULL | External room identifier |
| `status` | ENUM | NOT NULL | `scheduled`, `live`, `ended`, `cancelled` |
| `max_participants` | INTEGER | nullable | |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

#### `session_participants`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `session_id` | UUID | FK → live_sessions.id | |
| `user_id` | UUID | FK → users.id | |
| `joined_at_utc` | TIMESTAMPTZ | nullable | Set by webhook |
| `left_at_utc` | TIMESTAMPTZ | nullable | Set by webhook |
| `duration_seconds` | INTEGER | nullable | Computed on leave |
| `attendance_verified` | BOOLEAN | default FALSE | True if duration >= threshold |

#### `recordings`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `session_id` | UUID | FK → live_sessions.id | |
| `provider_recording_id` | TEXT | | External reference |
| `storage_key` | TEXT | | S3 object key |
| `duration_seconds` | INTEGER | | |
| `processing_status` | ENUM | NOT NULL | `pending`, `processing`, `ready`, `failed` |
| `content_asset_id` | UUID | FK → content_assets.id, nullable | Set after M2 ingestion |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

---

### Business Rules

1. **No custom WebRTC.** Token generation calls the third-party provider SDK. The platform never operates its own SFU.
2. **Attendance is webhook-driven.** Join and leave events from the provider populate `session_participants`. Attendance cannot be manually fabricated by the frontend.
3. **A recording becomes a Module 2 ContentAsset** when the `POST /webhooks/recording-complete` webhook fires. This triggers async processing that creates a `content_asset` row with `type = 'replay'` linked to the session's `course_id`/`module_id`.
4. **All times are UTC.** `scheduled_at_utc` is stored in UTC. Display-layer formatting to local timezone is the frontend's responsibility.
5. **Cancellation rule:** A session can only be cancelled before its `scheduled_at_utc`. A session in `live` status must be ended, not cancelled.

---

### API Surface

```
POST   /api/v1/live-sessions                         [Instructor, Admin]
GET    /api/v1/live-sessions?course_id=&from=&to=   [All authenticated]
GET    /api/v1/live-sessions/:id                     [All authenticated]
PATCH  /api/v1/live-sessions/:id                     [Instructor (host), Admin]
DELETE /api/v1/live-sessions/:id                     [Admin — cancel only if scheduled]
POST   /api/v1/live-sessions/:id/join                [All authenticated — returns provider token]
POST   /api/v1/live-sessions/:id/end                 [Instructor (host), Admin]
GET    /api/v1/live-sessions/:id/attendance          [Instructor (host), Admin]
POST   /api/v1/webhooks/session-join                 [Provider webhook — no auth, HMAC verified]
POST   /api/v1/webhooks/session-leave                [Provider webhook — no auth, HMAC verified]
POST   /api/v1/webhooks/recording-complete           [Provider webhook — no auth, HMAC verified]
```

---

## MODULE 4 — Student Experience & Dashboard

### Purpose
Module 4 is the student-facing aggregation and presentation layer. It does not own business logic — it surfaces data produced by Modules 2, 3, 5, and 6. Its backend responsibilities are aggregation, caching, notifications, and real-time updates.

---

### Entities

#### `student_progress`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `student_id` | UUID | FK → users.id | |
| `lesson_id` | UUID | FK → lessons.id | |
| `status` | ENUM | NOT NULL | `not_started`, `in_progress`, `completed` |
| `completion_pct` | NUMERIC(5,2) | default 0 | 0.00 to 100.00 |
| `last_accessed_at` | TIMESTAMPTZ | | |
| `completed_at` | TIMESTAMPTZ | nullable | |
| UNIQUE | `(student_id, lesson_id)` | | |

#### `notifications`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `student_id` | UUID | FK → users.id | |
| `type` | VARCHAR(50) | NOT NULL | `test.graded`, `remediation.ready`, `live.starting` |
| `title` | VARCHAR(255) | NOT NULL | |
| `body` | TEXT | | |
| `payload` | JSONB | | Links/IDs for frontend navigation |
| `read_at` | TIMESTAMPTZ | nullable | |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

#### `analytics_snapshots` *(Redis-mirrored cache)*
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `student_id` | UUID | PK | |
| `snapshot` | JSONB | NOT NULL | Aggregated dashboard data |
| `cached_at` | TIMESTAMPTZ | NOT NULL | |

---

### Business Rules

1. **Module 4 does not own business logic.** It calls internal services or queries Module 2/5/6 data to assemble responses.
2. **Dashboard responses are Redis-cached.** Cache is invalidated on: `lesson_completed`, `test_graded`, `remediation_plan_updated`, `live_class_scheduled`.
3. **Real-time updates use SSE.** Students subscribe to `GET /api/v1/students/me/events`. Server pushes events as they occur. No polling.
4. **`GET /lessons/:id` enforces gating.** Module 4 calls Module 6's internal service to check `LearningPathState` for the requesting student. Returns `403` if locked.

---

### API Surface

```
GET    /api/v1/students/me/dashboard            [Student]
GET    /api/v1/students/me/courses              [Student — enrolled courses with progress]
GET    /api/v1/students/me/events               [Student — SSE stream]
GET    /api/v1/courses/:id/progress             [Student]
POST   /api/v1/lessons/:id/complete             [Student]
GET    /api/v1/notifications                    [Student — paginated]
PATCH  /api/v1/notifications/:id/read           [Student]
GET    /api/v1/students/:id/dashboard           [Instructor, Admin — view specific student]
```

---

## MODULE 5 — AI Assessment & Evaluation

### Purpose
Module 5 is the AI-powered assessment engine. It generates assessments from course content using RAG, delivers them to students, evaluates responses (deterministically for MCQs, with Claude for short answers), computes skill-level scores, and emits the `TestGraded` event that drives the adaptive loop.

---

### Entities

#### `tests`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `lesson_id` | UUID | FK → lessons.id | |
| `lesson_version` | INTEGER | NOT NULL | Tied to content version used for generation |
| `title` | VARCHAR(255) | | Auto-generated or admin-set |
| `status` | ENUM | NOT NULL | `generating`, `ready`, `archived` |
| `generated_at` | TIMESTAMPTZ | nullable | |
| `time_limit_minutes` | INTEGER | nullable | |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

#### `questions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `test_id` | UUID | FK → tests.id, CASCADE | |
| `skill_id` | UUID | FK → skill_taxonomy.id | The skill this question tests |
| `type` | ENUM | NOT NULL | `mcq`, `short_answer` |
| `prompt` | TEXT | NOT NULL | The question text |
| `options` | JSONB | nullable | MCQ options: `[{id, text, is_correct}]` |
| `rubric` | JSONB | nullable | Short answer grading rubric |
| `source_chunk_ids` | UUID[] | NOT NULL | IDs of `content_embeddings` rows used |
| `sequence_order` | INTEGER | NOT NULL | |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

#### `submissions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `test_id` | UUID | FK → tests.id | |
| `student_id` | UUID | FK → users.id | |
| `answers` | JSONB | NOT NULL | `[{question_id, answer_text or option_id}]` |
| `status` | ENUM | NOT NULL | `submitted`, `grading`, `graded` |
| `submitted_at` | TIMESTAMPTZ | NOT NULL | |
| `graded_at` | TIMESTAMPTZ | nullable | |
| `overall_score` | NUMERIC(5,4) | nullable | 0.0000 to 1.0000 |
| `attempt_number` | INTEGER | NOT NULL, default 1 | Tracks retest attempts |
| UNIQUE | `(test_id, student_id, attempt_number)` | | |

#### `skill_scores`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `submission_id` | UUID | FK → submissions.id, CASCADE | |
| `skill_id` | UUID | FK → skill_taxonomy.id | |
| `score` | NUMERIC(5,4) | NOT NULL | 0.0000 to 1.0000 |
| `max_score` | NUMERIC(5,4) | NOT NULL | Always 1.0000 |
| `grader_type` | ENUM | NOT NULL | `deterministic`, `llm` |
| `feedback` | TEXT | nullable | LLM-generated feedback for student |
| `llm_reasoning` | TEXT | nullable | Internal grading rationale (not shown to student) |

---

### Business Rules

1. **MCQ grading is deterministic.** Compare `option_id` in submission against `is_correct: true` option in `questions.options`. Zero Claude API calls.
2. **Short answer grading uses LLM-as-a-grader.** The grader receives: (1) the question prompt, (2) the rubric, (3) the source `chunk_text` values from `source_chunk_ids`, (4) the student's answer. It returns a score and feedback.
3. **Grading is asynchronous.** `POST /assessments/:id/submit` returns immediately with `status: grading`. Frontend polls `GET /submissions/:id` or listens on SSE.
4. **Questions are traceable.** Every question stores the `source_chunk_ids` used in generation. This enables audit of what content the question was based on.
5. **Tests are versioned.** A new test is generated when `lesson_version` changes. Old tests remain accessible for historical submissions.
6. **`TestGraded` is emitted after all `skill_scores` are written.** The event is atomic with the final `submissions.status = 'graded'` update.
7. **Assessment generation is idempotent.** If a `test` for `(lesson_id, lesson_version)` in `ready` status already exists, re-requesting generation returns the existing test.

---

### API Surface

```
POST   /api/v1/assessments/generate              [Instructor, Admin — or system-triggered]
GET    /api/v1/assessments/jobs/:job_id          [Instructor, Admin]
GET    /api/v1/lessons/:id/assessment            [Student, Instructor — get ready test]
POST   /api/v1/assessments/:id/submit            [Student]
GET    /api/v1/submissions/:id                   [Student (own), Instructor, Admin]
GET    /api/v1/students/:id/submissions          [Student (own), Instructor, Admin]
GET    /api/v1/submissions/:id/skill-scores      [Student (own), Instructor, Admin]
```

### Events Emitted

```
event: test.graded
channel: redis_streams / rabbitmq
payload: see 00-MASTER-SDD-ROADMAP.md § 6 (TestGraded contract)
```

---

## MODULE 6 — Adaptive Learning & Remediation

### Purpose
Module 6 is the closed-loop intelligence engine. It consumes `TestGraded` events from Module 5 and transforms raw skill scores into structured weakness flags, ordered remediation plans, and focused retest triggers. It owns content gating and learning path state.

---

### Entities

#### `weakness_flags`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `student_id` | UUID | FK → users.id | |
| `skill_id` | UUID | FK → skill_taxonomy.id | |
| `submission_id` | UUID | FK → submissions.id | The submission that triggered this flag |
| `score_at_flag` | NUMERIC(5,4) | NOT NULL | Score that caused the flag |
| `threshold` | NUMERIC(5,4) | NOT NULL, default 0.6 | Configurable per platform |
| `status` | ENUM | NOT NULL | `active`, `resolved` |
| `resolution_submission_id` | UUID | nullable | Submission that resolved this weakness |
| `flagged_at` | TIMESTAMPTZ | NOT NULL | |
| `resolved_at` | TIMESTAMPTZ | nullable | |
| UNIQUE | `(student_id, skill_id)` | | Only one active flag per skill per student |

#### `remediation_plans`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `student_id` | UUID | FK → users.id | |
| `weakness_flag_id` | UUID | FK → weakness_flags.id | |
| `status` | ENUM | NOT NULL | `active`, `completed`, `abandoned` |
| `remedial_course_title` | VARCHAR(255) | nullable | Title of AI-generated remedial course document |
| `remedial_course_markdown` | TEXT | nullable | Full AI-generated written course content (Markdown — NOT video) |
| `study_completed` | BOOLEAN | NOT NULL, default FALSE | True once student completes reading the remedial document |
| `study_completed_at` | TIMESTAMPTZ | nullable | When student finished reading remedial content |
| `retest_attempt_count` | INTEGER | NOT NULL, default 0 | |
| `instructor_escalated` | BOOLEAN | default FALSE | Set on 3rd failed retest |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `completed_at` | TIMESTAMPTZ | nullable | |

#### `remediation_plan_items`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `plan_id` | UUID | FK → remediation_plans.id, CASCADE | |
| `lesson_id` | UUID | FK → lessons.id | Remedial lesson to complete |
| `sequence_order` | INTEGER | NOT NULL | |
| `status` | ENUM | NOT NULL | `pending`, `completed` |
| `completed_at` | TIMESTAMPTZ | nullable | |

#### `learning_path_states`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `student_id` | UUID | FK → users.id | |
| `lesson_id` | UUID | FK → lessons.id | |
| `state` | ENUM | NOT NULL | `locked`, `unlocked`, `in_progress`, `mastered` |
| `locked_reason` | TEXT | nullable | e.g. "Weakness flag: algebra.quadratic" |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |
| UNIQUE | `(student_id, lesson_id)` | | |

---

### Business Rules

1. **Weakness threshold is `score < 0.60`** (60%). This is rule-based — no ML model. The threshold is a platform constant, configurable by Admin.
2. **Only one active weakness flag per skill per student.** If a new `TestGraded` event arrives for a skill already flagged, the existing flag is updated rather than a duplicate created.
3. **Weakness resolution:** A `weakness_flag.status = 'resolved'` when a subsequent `TestGraded` event shows `score >= 0.60` for the same skill. The `resolution_submission_id` is set.
4. **AI-Generated Written Remedial Course (Document / Reading Format — NOT video):** When a weakness is flagged, the AI engine calls Claude API (`claude-sonnet-4-5`) to dynamically generate a targeted written course in clean Markdown. It directly breaks down the student's test errors, explains core principles, and provides step-by-step worked examples.
5. **Mandatory Study Completion Before Retesting:** The system does NOT immediately generate another test. The student must study and acknowledge completion of the AI-generated remedial course document (`study_completed = true`) before Module 5 is unlocked or triggered to generate the focused retest.
6. **Content gating is backend-enforced.** When a weakness flag is `active`, subsequent lessons in the same module are transitioned to `state = 'locked'`. The `GET /lessons/:id` endpoint returns `403` for locked lessons.
7. **Retest is bounded.** `remediation_plans.retest_attempt_count` is incremented on each focused retest. At `count = 3` (3rd failed retest), `instructor_escalated = true` is set and no further retests are auto-triggered.
8. **Focused retest scope.** When Module 6 triggers a retest (after study completion), it calls Module 5's generation service with a `skill_filter = [weak_skill_id]`. The generated test covers only the flagged skills.
9. **Remediation completion.** When the remedial study is finished and the subsequent focused retest is passed (`score >= 0.60`), the plan moves to `completed` and blocked lessons are unlocked.

---

### API Surface

```
GET    /api/v1/students/me/weakness-flags        [Student]
GET    /api/v1/students/me/remediation-plan      [Student — includes remedial course Markdown]
POST   /api/v1/remediation-plans/:id/acknowledge [Student — acknowledge receipt]
POST   /api/v1/remediation-plans/:id/complete-study [Student — confirm remedial document studied → triggers retest]
GET    /api/v1/students/me/learning-path         [Student — full state per lesson]
GET    /api/v1/students/:id/weakness-flags       [Instructor, Admin]
GET    /api/v1/students/:id/remediation-plan     [Instructor, Admin]
GET    /api/v1/escalations                       [Instructor, Admin — students needing intervention]
```

### Events Consumed

```
event: test.graded
action: Run weakness detection → create/update weakness flags → update remediation plan → gate content
```

---

*For database DDL, indexes, and migration scripts, see `02-DATABASE-AND-ERD.md`.*
*For event payload specifications and state machine diagrams, see `05-ADAPTIVE-LOOP-AND-EVENTS.md`.*
