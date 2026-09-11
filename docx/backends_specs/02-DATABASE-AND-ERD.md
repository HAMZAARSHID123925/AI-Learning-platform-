# 02 — DATABASE & ERD
## ELARION AI-Powered Learning Platform — Complete PostgreSQL Schema, Indexes & Migration Guide

> **Document Type:** Database Specification
> **Authority:** This document defines the authoritative table structure. All SQLAlchemy models and Alembic migrations must match exactly.
> **Extensions Required:** `uuid-ossp`, `pgvector`
> **Default Timezone:** All TIMESTAMPTZ columns store UTC. Application layer never writes local time.

---

## 1. Prerequisites & Extensions

```sql
-- Run once on fresh database (included in first Alembic migration)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Verify
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'vector');
```

---

## 2. Naming Conventions

| Convention | Rule | Example |
|---|---|---|
| Tables | `snake_case`, plural | `skill_scores`, `live_sessions` |
| Columns | `snake_case` | `created_at`, `student_id` |
| PKs | Always `id UUID DEFAULT uuid_generate_v4()` | |
| FKs | `{referenced_table_singular}_id` | `lesson_id`, `user_id` |
| Indexes | `ix_{table}_{column(s)}` | `ix_submissions_student_id` |
| Unique constraints | `uq_{table}_{column(s)}` | `uq_users_email` |
| Enums | `snake_case` type names | `lesson_status`, `grader_type` |
| Timestamps | Always `TIMESTAMPTZ`, always UTC | `created_at`, `published_at` |

---

## 3. Enum Type Definitions

```sql
-- Module 1
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification');

-- Module 2
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE lesson_status AS ENUM ('draft', 'published');
CREATE TYPE asset_type AS ENUM ('video', 'pdf', 'text', 'image', 'replay');
CREATE TYPE asset_processing_status AS ENUM ('pending', 'ready', 'failed');
CREATE TYPE outbox_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Module 3
CREATE TYPE session_provider AS ENUM ('agora', 'zoom', 'daily');
CREATE TYPE session_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled');
CREATE TYPE recording_status AS ENUM ('pending', 'processing', 'ready', 'failed');

-- Module 4
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Module 5
CREATE TYPE test_status AS ENUM ('generating', 'ready', 'archived');
CREATE TYPE question_type AS ENUM ('mcq', 'short_answer');
CREATE TYPE submission_status AS ENUM ('submitted', 'grading', 'graded');
CREATE TYPE grader_type AS ENUM ('deterministic', 'llm');

-- Module 6
CREATE TYPE weakness_status AS ENUM ('active', 'resolved');
CREATE TYPE plan_status AS ENUM ('active', 'completed', 'abandoned');
CREATE TYPE plan_item_status AS ENUM ('pending', 'completed');
CREATE TYPE path_state AS ENUM ('locked', 'unlocked', 'in_progress', 'mastered');
```

---

## 4. Full DDL — Table by Table

### 4.1 Shared Reference Table

```sql
CREATE TABLE skill_taxonomy (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id       UUID REFERENCES skill_taxonomy(id) ON DELETE SET NULL,
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(150) NOT NULL,
    description     TEXT,
    version         INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_skill_taxonomy_slug UNIQUE (slug)
);

CREATE INDEX ix_skill_taxonomy_parent_id ON skill_taxonomy(parent_id);
CREATE INDEX ix_skill_taxonomy_slug ON skill_taxonomy(slug);

COMMENT ON TABLE skill_taxonomy IS 'Shared reference: skills/competencies used by M2 (tagging), M5 (assessment), M6 (weakness detection)';
```

---

### 4.2 Module 1 — Auth & Access

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               VARCHAR(255) NOT NULL,
    password_hash       TEXT NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    status              user_status NOT NULL DEFAULT 'pending_verification',
    email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
    parental_consent    BOOLEAN,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_status ON users(status);

-- -------------------------------------------------------

CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50) NOT NULL,
    description TEXT,

    CONSTRAINT uq_roles_name UNIQUE (name)
);

-- Seed data (run in first migration):
-- INSERT INTO roles (name, description) VALUES
--   ('Student',    'Enrolled learner'),
--   ('Instructor', 'Content author and live class host'),
--   ('Admin',      'Platform administrator');

-- -------------------------------------------------------

CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(100) NOT NULL,
    description TEXT,

    CONSTRAINT uq_permissions_code UNIQUE (code)
);

-- Seed data:
-- INSERT INTO permissions (code, description) VALUES
--   ('course:create',    'Create new courses'),
--   ('course:edit',      'Edit existing courses'),
--   ('course:publish',   'Publish courses and lessons'),
--   ('lesson:read',      'Access published lessons'),
--   ('assessment:take',  'Take assessments'),
--   ('grade:override',   'Manually override AI grades'),
--   ('live:host',        'Host live sessions'),
--   ('live:join',        'Join live sessions'),
--   ('user:manage',      'Manage users and roles'),
--   ('progress:write',   'Write lesson completion progress');

-- -------------------------------------------------------

CREATE TABLE role_permissions (
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,

    PRIMARY KEY (role_id, permission_id)
);

-- -------------------------------------------------------

CREATE TABLE user_roles (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,

    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX ix_user_roles_user_id ON user_roles(user_id);

-- -------------------------------------------------------

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX ix_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX ix_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- -------------------------------------------------------

CREATE TABLE password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ
);

CREATE INDEX ix_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);

-- -------------------------------------------------------

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id   UUID,
    metadata    JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX ix_audit_logs_action ON audit_logs(action);
CREATE INDEX ix_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX ix_audit_logs_target ON audit_logs(target_type, target_id);
```

---

### 4.3 Module 2 — Curriculum & Content

```sql
CREATE TABLE courses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          course_status NOT NULL DEFAULT 'draft',
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    thumbnail_url   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_courses_slug UNIQUE (slug)
);

CREATE INDEX ix_courses_status ON courses(status);
CREATE INDEX ix_courses_created_by ON courses(created_by);

-- -------------------------------------------------------

CREATE TABLE course_modules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    sequence_order  INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_course_modules_order UNIQUE (course_id, sequence_order)
);

CREATE INDEX ix_course_modules_course_id ON course_modules(course_id);

-- -------------------------------------------------------

CREATE TABLE lessons (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id       UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    sequence_order  INTEGER NOT NULL,
    status          lesson_status NOT NULL DEFAULT 'draft',
    published_at    TIMESTAMPTZ,
    content_version INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_lessons_order UNIQUE (module_id, sequence_order)
);

CREATE INDEX ix_lessons_module_id ON lessons(module_id);
CREATE INDEX ix_lessons_status ON lessons(status);

-- -------------------------------------------------------

CREATE TABLE lesson_skills (
    lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    skill_id    UUID NOT NULL REFERENCES skill_taxonomy(id) ON DELETE CASCADE,

    PRIMARY KEY (lesson_id, skill_id)
);

CREATE INDEX ix_lesson_skills_skill_id ON lesson_skills(skill_id);

-- -------------------------------------------------------

CREATE TABLE content_assets (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id           UUID REFERENCES lessons(id) ON DELETE CASCADE,
    session_id          UUID,  -- FK added after live_sessions table created
    type                asset_type NOT NULL,
    storage_key         TEXT NOT NULL,
    cdn_url             TEXT,
    file_size_bytes     BIGINT,
    duration_seconds    INTEGER,
    processing_status   asset_processing_status NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_content_assets_parent
        CHECK (
            (lesson_id IS NOT NULL AND session_id IS NULL) OR
            (lesson_id IS NULL AND session_id IS NOT NULL)
        )
);

CREATE INDEX ix_content_assets_lesson_id ON content_assets(lesson_id);
CREATE INDEX ix_content_assets_session_id ON content_assets(session_id);

-- -------------------------------------------------------

CREATE TABLE embedding_outbox (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    lesson_version  INTEGER NOT NULL,
    status          outbox_status NOT NULL DEFAULT 'pending',
    retry_count     INTEGER NOT NULL DEFAULT 0,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at    TIMESTAMPTZ
);

CREATE INDEX ix_embedding_outbox_status ON embedding_outbox(status);
CREATE INDEX ix_embedding_outbox_lesson_id ON embedding_outbox(lesson_id);

-- -------------------------------------------------------

CREATE TABLE content_embeddings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    lesson_version  INTEGER NOT NULL,
    chunk_index     INTEGER NOT NULL,
    chunk_text      TEXT NOT NULL,
    vector          vector(1536) NOT NULL,  -- Adjust to match embedding model output dims
    skill_tags      UUID[],
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IVFFlat index for approximate nearest-neighbor search (cosine similarity)
-- Build after bulk loading; nlist = sqrt(total_rows) is a starting rule
CREATE INDEX ix_content_embeddings_vector
    ON content_embeddings USING ivfflat (vector vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX ix_content_embeddings_lesson_version
    ON content_embeddings(lesson_id, lesson_version);
```

---

### 4.4 Module 3 — Live Online Classes

```sql
CREATE TABLE live_sessions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id           UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    module_id           UUID REFERENCES course_modules(id) ON DELETE SET NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    host_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    scheduled_at_utc    TIMESTAMPTZ NOT NULL,
    duration_minutes    INTEGER NOT NULL,
    provider            session_provider NOT NULL,
    provider_room_id    TEXT NOT NULL,
    status              session_status NOT NULL DEFAULT 'scheduled',
    max_participants    INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_live_sessions_course_id ON live_sessions(course_id);
CREATE INDEX ix_live_sessions_host_id ON live_sessions(host_id);
CREATE INDEX ix_live_sessions_scheduled_at ON live_sessions(scheduled_at_utc);
CREATE INDEX ix_live_sessions_status ON live_sessions(status);

-- Now add FK on content_assets.session_id
ALTER TABLE content_assets
    ADD CONSTRAINT fk_content_assets_session
    FOREIGN KEY (session_id) REFERENCES live_sessions(id) ON DELETE SET NULL;

-- -------------------------------------------------------

CREATE TABLE session_participants (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id              UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at_utc           TIMESTAMPTZ,
    left_at_utc             TIMESTAMPTZ,
    duration_seconds        INTEGER,
    attendance_verified     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX ix_session_participants_session_id ON session_participants(session_id);
CREATE INDEX ix_session_participants_user_id ON session_participants(user_id);

-- -------------------------------------------------------

CREATE TABLE recordings (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id              UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
    provider_recording_id   TEXT,
    storage_key             TEXT,
    duration_seconds        INTEGER,
    processing_status       recording_status NOT NULL DEFAULT 'pending',
    content_asset_id        UUID REFERENCES content_assets(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_recordings_session_id ON recordings(session_id);
```

---

### 4.5 Module 4 — Student Experience

```sql
CREATE TABLE student_progress (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status          progress_status NOT NULL DEFAULT 'not_started',
    completion_pct  NUMERIC(5,2) NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,

    CONSTRAINT uq_student_progress UNIQUE (student_id, lesson_id),
    CONSTRAINT chk_completion_pct CHECK (completion_pct BETWEEN 0 AND 100)
);

CREATE INDEX ix_student_progress_student_id ON student_progress(student_id);
CREATE INDEX ix_student_progress_lesson_id ON student_progress(lesson_id);

-- -------------------------------------------------------

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    payload     JSONB,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_notifications_student_id ON notifications(student_id);
CREATE INDEX ix_notifications_read_at ON notifications(student_id, read_at) WHERE read_at IS NULL;

-- -------------------------------------------------------

CREATE TABLE analytics_snapshots (
    student_id  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    snapshot    JSONB NOT NULL,
    cached_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 4.6 Module 5 — AI Assessment & Evaluation

```sql
CREATE TABLE tests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    lesson_version  INTEGER NOT NULL,
    title           VARCHAR(255),
    status          test_status NOT NULL DEFAULT 'generating',
    time_limit_minutes INTEGER,
    generated_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_tests_lesson_version UNIQUE (lesson_id, lesson_version)
);

CREATE INDEX ix_tests_lesson_id ON tests(lesson_id);
CREATE INDEX ix_tests_status ON tests(status);

-- -------------------------------------------------------

CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    skill_id        UUID NOT NULL REFERENCES skill_taxonomy(id) ON DELETE RESTRICT,
    type            question_type NOT NULL,
    prompt          TEXT NOT NULL,
    options         JSONB,  -- [{"id": "uuid", "text": "...", "is_correct": true/false}]
    rubric          JSONB,  -- {"criteria": [...], "max_score": 1.0}
    source_chunk_ids UUID[] NOT NULL DEFAULT '{}',
    sequence_order  INTEGER NOT NULL
);

CREATE INDEX ix_questions_test_id ON questions(test_id);
CREATE INDEX ix_questions_skill_id ON questions(skill_id);

-- -------------------------------------------------------

CREATE TABLE submissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE RESTRICT,
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers         JSONB NOT NULL,  -- [{"question_id": "uuid", "value": "..."}]
    status          submission_status NOT NULL DEFAULT 'submitted',
    attempt_number  INTEGER NOT NULL DEFAULT 1,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    graded_at       TIMESTAMPTZ,
    overall_score   NUMERIC(5,4),

    CONSTRAINT uq_submissions_attempt UNIQUE (test_id, student_id, attempt_number),
    CONSTRAINT chk_overall_score CHECK (overall_score BETWEEN 0 AND 1)
);

CREATE INDEX ix_submissions_test_id ON submissions(test_id);
CREATE INDEX ix_submissions_student_id ON submissions(student_id);
CREATE INDEX ix_submissions_status ON submissions(status);

-- -------------------------------------------------------

CREATE TABLE skill_scores (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id       UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    skill_id            UUID NOT NULL REFERENCES skill_taxonomy(id) ON DELETE RESTRICT,
    score               NUMERIC(5,4) NOT NULL,
    max_score           NUMERIC(5,4) NOT NULL DEFAULT 1.0,
    grader_type         grader_type NOT NULL,
    feedback            TEXT,
    llm_reasoning       TEXT,

    CONSTRAINT chk_skill_score CHECK (score BETWEEN 0 AND max_score)
);

CREATE INDEX ix_skill_scores_submission_id ON skill_scores(submission_id);
CREATE INDEX ix_skill_scores_skill_id ON skill_scores(skill_id);
```

---

### 4.7 Module 6 — Adaptive Learning & Remediation

```sql
CREATE TABLE weakness_flags (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id                    UUID NOT NULL REFERENCES skill_taxonomy(id) ON DELETE RESTRICT,
    submission_id               UUID NOT NULL REFERENCES submissions(id) ON DELETE RESTRICT,
    score_at_flag               NUMERIC(5,4) NOT NULL,
    threshold                   NUMERIC(5,4) NOT NULL DEFAULT 0.6,
    status                      weakness_status NOT NULL DEFAULT 'active',
    resolution_submission_id    UUID REFERENCES submissions(id) ON DELETE SET NULL,
    flagged_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at                 TIMESTAMPTZ,

    CONSTRAINT uq_weakness_flags_active UNIQUE (student_id, skill_id)
);

CREATE INDEX ix_weakness_flags_student_id ON weakness_flags(student_id);
CREATE INDEX ix_weakness_flags_status ON weakness_flags(status);
CREATE INDEX ix_weakness_flags_skill_id ON weakness_flags(skill_id);

-- -------------------------------------------------------

CREATE TABLE remediation_plans (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weakness_flag_id        UUID NOT NULL REFERENCES weakness_flags(id) ON DELETE RESTRICT,
    status                  plan_status NOT NULL DEFAULT 'active',
    retest_attempt_count    INTEGER NOT NULL DEFAULT 0,
    instructor_escalated    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at            TIMESTAMPTZ
);

CREATE INDEX ix_remediation_plans_student_id ON remediation_plans(student_id);
CREATE INDEX ix_remediation_plans_status ON remediation_plans(status);
CREATE INDEX ix_remediation_plans_escalated
    ON remediation_plans(instructor_escalated)
    WHERE instructor_escalated = TRUE;

-- -------------------------------------------------------

CREATE TABLE remediation_plan_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id         UUID NOT NULL REFERENCES remediation_plans(id) ON DELETE CASCADE,
    lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,
    sequence_order  INTEGER NOT NULL,
    status          plan_item_status NOT NULL DEFAULT 'pending',
    completed_at    TIMESTAMPTZ
);

CREATE INDEX ix_remediation_plan_items_plan_id ON remediation_plan_items(plan_id);

-- -------------------------------------------------------

CREATE TABLE learning_path_states (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    state           path_state NOT NULL DEFAULT 'unlocked',
    locked_reason   TEXT,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_learning_path_states UNIQUE (student_id, lesson_id)
);

CREATE INDEX ix_learning_path_states_student_id ON learning_path_states(student_id);
CREATE INDEX ix_learning_path_states_state ON learning_path_states(state);
```

---

## 5. Alembic Migration Strategy

### Directory Structure

```
backend/
└── alembic/
    ├── env.py
    ├── script.py.mako
    └── versions/
        ├── 001_extensions_and_enums.py        # uuid-ossp, pgvector, all ENUM types
        ├── 002_shared_skill_taxonomy.py        # skill_taxonomy table
        ├── 003_module1_auth.py                 # users, roles, permissions, junction tables
        ├── 004_module1_tokens.py               # refresh_tokens, password_reset_tokens, audit_logs
        ├── 005_module2_content_core.py         # courses, course_modules, lessons, lesson_skills
        ├── 006_module2_assets_and_outbox.py    # content_assets, embedding_outbox
        ├── 007_module2_embeddings.py           # content_embeddings + ivfflat index
        ├── 008_module3_live_classes.py         # live_sessions, session_participants, recordings
        ├── 009_module3_content_asset_fk.py     # Add session_id FK to content_assets
        ├── 010_module4_experience.py           # student_progress, notifications, analytics_snapshots
        ├── 011_module5_assessment.py           # tests, questions, submissions, skill_scores
        └── 012_module6_adaptive.py             # weakness_flags, remediation_plans, learning_path_states
```

### Migration Rules

1. **Never edit an existing migration file** after it has been applied to any environment (dev, staging, prod).
2. **Forward-only migrations.** Avoid downgrade scripts in production. If you need to revert, create a new forward migration.
3. **Test migration on fresh DB before merging.** CI pipeline runs `alembic upgrade head` on a blank Postgres instance.
4. **Seed data** (roles, permissions, skill_taxonomy initial data) lives in a dedicated seed script `scripts/seed_data.py`, not in migrations.
5. **pgvector ivfflat index** should be built in a separate migration after bulk content loading in staging. On small datasets during development, HNSW or brute-force scan is acceptable.

### IVFFlat vs HNSW Decision Guide

| Scenario | Index Type | Command |
|---|---|---|
| Development (< 10,000 rows) | None (brute force) | No index needed |
| Staging / Small prod (< 1M rows) | IVFFlat | `WITH (lists = 100)` |
| Large prod (> 1M rows) | HNSW | `WITH (m = 16, ef_construction = 64)` |

---

## 6. Useful Diagnostic Queries

### Check for unprocessed embedding outbox jobs
```sql
SELECT id, lesson_id, lesson_version, retry_count, error_message, created_at
FROM embedding_outbox
WHERE status IN ('pending', 'failed')
ORDER BY created_at;
```

### Verify no draft content is embedded
```sql
SELECT ce.lesson_id, l.status, ce.lesson_version, COUNT(*) as chunk_count
FROM content_embeddings ce
JOIN lessons l ON ce.lesson_id = l.id
WHERE l.status = 'draft'
GROUP BY ce.lesson_id, l.status, ce.lesson_version;
-- Expected: 0 rows
```

### Active weakness flags awaiting resolution
```sql
SELECT wf.student_id, u.email, st.slug as skill_slug, wf.score_at_flag, wf.flagged_at,
       rp.retest_attempt_count, rp.instructor_escalated
FROM weakness_flags wf
JOIN users u ON wf.student_id = u.id
JOIN skill_taxonomy st ON wf.skill_id = st.id
LEFT JOIN remediation_plans rp ON rp.weakness_flag_id = wf.id
WHERE wf.status = 'active'
ORDER BY wf.flagged_at DESC;
```

### Locked lessons for a student
```sql
SELECT lps.student_id, l.title, lps.state, lps.locked_reason, lps.updated_at
FROM learning_path_states lps
JOIN lessons l ON lps.lesson_id = l.id
WHERE lps.student_id = '<student_uuid>'
  AND lps.state = 'locked';
```

### Students requiring instructor escalation
```sql
SELECT u.email, u.first_name, u.last_name,
       st.slug as skill_slug,
       rp.retest_attempt_count,
       rp.created_at as plan_created
FROM remediation_plans rp
JOIN users u ON rp.student_id = u.id
JOIN weakness_flags wf ON rp.weakness_flag_id = wf.id
JOIN skill_taxonomy st ON wf.skill_id = st.id
WHERE rp.instructor_escalated = TRUE
  AND rp.status = 'active'
ORDER BY rp.created_at;
```

### Submission grading pipeline status
```sql
SELECT s.id, s.student_id, s.status, s.submitted_at, s.graded_at,
       s.overall_score,
       COUNT(ss.id) as skill_scores_count
FROM submissions s
LEFT JOIN skill_scores ss ON ss.submission_id = s.id
WHERE s.status IN ('submitted', 'grading')
GROUP BY s.id
ORDER BY s.submitted_at;
```

---

## 7. Redis Key Schema

All Redis keys use the prefix `elarion:` to avoid collisions.

| Key | Type | TTL | Purpose |
|---|---|---|---|
| `elarion:session:{user_id}` | Hash | 7 days | Active session metadata |
| `elarion:blacklist:jwt:{jti}` | String | Access token TTL | Revoked JWT JTI |
| `elarion:rate:login:{ip}` | String (counter) | 15 min | Login rate limiter |
| `elarion:rate:forgot:{email}` | String (counter) | 1 hour | Password reset rate limiter |
| `elarion:cache:dashboard:{student_id}` | JSON string | 5 min (soft) | Dashboard aggregate cache |
| `elarion:cache:skills` | JSON string | 1 hour | SkillTaxonomy cache |
| `elarion:sse:student:{student_id}` | Stream | — | SSE event buffer |

### Redis Streams

| Stream Key | Producers | Consumers | Purpose |
|---|---|---|---|
| `elarion:events:test_graded` | Module 5 grading worker | Module 6 consumer group | Trigger adaptive loop |
| `elarion:events:embedding_ready` | Module 2 outbox worker | Module 5 (optional notify) | Embedding complete |
| `elarion:events:remediation_updated` | Module 6 | Module 4 SSE pusher | Notify student dashboard |
| `elarion:events:live_starting` | Module 3 scheduler | Module 4 SSE pusher | Live class reminder (5 min before) |

---

*For the SQLAlchemy ORM model implementations, see the backend module source code.*
*For migration commands and CI integration, see `06-TESTING-AND-DEVOPS-GUIDE.md`.*
