# 03 — Technical Foundation

## Critical Source-of-Truth Rule

The project's **six module specifications are the PRIMARY SOURCE OF TRUTH**.

The approved technology stack is the SECONDARY source and explains how the module requirements are technically supported.

Priority:
1. Existing six module specifications — highest authority
2. Approved technology stack
3. Project overview / system architecture documents
4. General engineering knowledge — only where necessary

Do NOT change, reinterpret, merge, split, rename, or reorganize the six modules.

The six modules are:
1. Module 1 — User & Access Management
2. Module 2 — Course & Content Management
3. Module 3 — Live Online Classes
4. Module 4 — Student Experience & Dashboard
5. Module 5 — AI Assessment & Evaluation
6. Module 6 — Adaptive Learning & Remediation

## Document Purpose

This document defines the technical foundation supporting the six-module architecture.

It explains the approved technology stack, shared infrastructure, frontend/backend/database foundations, AI/RAG infrastructure, asynchronous processing, security, observability, technical dependencies, and ownership principles.

This is a **foundation document**, not a detailed implementation specification.

## Project Technical Context

The platform is an AI-powered adaptive learning and assessment platform with a custom LMS. It combines structured LMS course/content management, student learning experience, live online classes, AI-generated assessments, AI-powered evaluation, skill-level performance tracking, adaptive remediation, personalized retesting, and AI-assisted learning.

The six modules remain the product architecture backbone.

Core adaptive loop:

`Module 4 → Module 5 → TestGraded → Module 6 → Module 4 → Module 5`

## Approved Technical Stack

### Frontend
- React / Next.js
- SSR for dashboard/course pages where appropriate
- CSR for interactive content-player experiences

### Backend API
- Python FastAPI

FastAPI is the backend/API foundation supporting the modules.

### Primary Database
- PostgreSQL

PostgreSQL is the primary transactional system of record.

### Vector Search
- pgvector initially
- Pinecone or Weaviate may be considered later if scale requires it

### Cache and Sessions
- Redis

Redis supports sessions, caching, temporary state, and other appropriate high-speed infrastructure needs. Module 1 specifically uses Redis-backed sessions.

### Async Messaging
Initial options:
- Redis Streams
- RabbitMQ

Kafka is a later-scale option, not an initial requirement. Messaging supports event-driven workflows, especially the Module 5 → Module 6 flow.

### Object Storage
S3-compatible storage:
- AWS S3
- Cloudflare R2
- MinIO

Used for PDFs, videos, uploaded assets, recordings, and other large files.

### CDN
- CloudFront
- Cloudflare

Used where appropriate for efficient content delivery.

### Live Video
Use a third-party provider such as:
- Agora
- Zoom SDK
- Daily.co

Do not build a custom WebRTC SFU.

### LLM
- Claude API

Used for AI assessment generation, evaluation/grading, RAG synthesis, and related AI capabilities defined by Modules 5 and 6.

### Authentication
- JWT access tokens
- refresh tokens
- bcrypt or Argon2 password hashing
- OAuth2/OIDC can be introduced later if required

Module 1 owns authentication and authorization behavior.

### Infrastructure
- Docker
- Kubernetes or ECS for deployment evolution
- GitHub Actions for CI/CD

Infrastructure is not treated as additional product modules.

### Observability
- OpenTelemetry
- Grafana Cloud, Honeycomb, or Datadog

Observability should support tracing across the adaptive learning workflow.

## Frontend Foundation

React / Next.js provides the frontend foundation for the student-facing LMS experience, dashboard, course navigation, content player, and interaction with FastAPI APIs.

Module 4 is the primary student-facing aggregation/presentation layer. It does not own the underlying business logic of other modules.

## Backend/API Foundation

FastAPI provides the backend API foundation and supports authentication middleware, RBAC enforcement, validation, module-level services, business logic boundaries, synchronous APIs, asynchronous jobs, and event-driven workflows.

Detailed endpoint specifications belong in the relevant module/API documentation.

## Database Foundation

PostgreSQL is the primary transactional source of truth.

| Module | Primary Data |
|---|---|
| Module 1 | Users, Roles, Permissions, Sessions, Audit Logs |
| Module 2 | Courses, Modules, Lessons, Content Assets, Skills, Embedding Metadata |
| Module 3 | Live Sessions, Session Participants, Recordings |
| Module 4 | Progress, Analytics Snapshots, Notifications |
| Module 5 | Tests, Questions, Submissions, Skill Scores |
| Module 6 | Weakness Flags, Remediation Plans, Learning Path State |

Module ownership remains defined by the module specifications.

## Vector Search & RAG Foundation

The initial vector-search foundation is PostgreSQL + pgvector.

Conceptual pipeline:

`Content → Text Extraction/OCR → Chunking → Embedding → pgvector → Retrieval → AI Assessment`

Rules:
- Draft content must not be embedded.
- Published content is processed asynchronously.
- Embedding jobs should be idempotent.
- Embeddings should retain relevant lesson/version/skill context.
- Vector data is derived from source content; it is not the primary source of original content.

Module 2 owns content and embedding-source behavior. Module 5 consumes indexed content for RAG-based assessment generation.

## AI/LLM Foundation

Claude API supports the AI capabilities defined by the modules.

### Module 5
- dynamic test generation
- question generation
- rubric generation
- AI evaluation
- short-answer grading
- skill-level scoring
- RAG-based assessment generation

### Module 6
- remediation-plan generation
- adaptive learning decisions where appropriate
- personalized remediation activities where defined

AI should not replace deterministic logic where deterministic logic is appropriate. MCQ grading should be deterministic. Module 6 initially uses rule-based weakness thresholds rather than ML because training data is not yet available.

## Redis Foundation

Redis supports Module 1 session management, caching, temporary state, and other appropriate high-speed infrastructure concerns.

Redis is not the primary business-data store. PostgreSQL remains the transactional source of truth.

## Async Jobs & Event-Driven Foundation

Long-running operations should use asynchronous processing where appropriate, including content embedding, AI test generation, AI grading where appropriate, event processing, and notifications.

Key event:

`TestGraded`

Conceptual flow:

`Module 5`
→ grades assessment
→ emits `TestGraded`
→ `Module 6` consumes event
→ weakness detection
→ remediation plan
→ learning-path update
→ Module 4 is notified/updated

This avoids unnecessary tight coupling between Module 5 and every Module 6 operation.

## Object Storage & Content Delivery

S3-compatible object storage supports PDFs, videos, uploaded course assets, live-class recordings, and other large media. CDN infrastructure can improve delivery performance.

Module 2 owns content-management behavior. Module 3 owns live-session and recording behavior.

## Live-Class Technical Foundation

Module 3 uses a third-party conferencing provider.

High-level flow:

`Module 3`
→ creates/schedules live session
→ external video provider
→ students/instructors join
→ join/leave webhooks
→ attendance tracking
→ recording capture/archive
→ recording can become a Module 2 content asset

Store timestamps in UTC and convert them for display where required.

## Authentication, Authorization & Security Foundation

The shared security foundation includes JWT access tokens, refresh-token mechanism, secure password hashing, RBAC, role/permission separation, API authorization, encryption in transit, encryption at rest, and audit logging.

Module 1 owns identity and access management. Other modules consume the shared authorization foundation.

## Observability Foundation

The system should support structured logging, metrics, distributed tracing, error monitoring, and OpenTelemetry.

Tracing should cover:

`Module 4 → Module 5 → TestGraded → Module 6 → Module 4`

This is especially important for diagnosing AI generation, grading, event processing, remediation, and student-experience failures.

## Technical Dependencies Across Six Modules

| Module | Primary Technical Dependencies |
|---|---|
| Module 1 | FastAPI, PostgreSQL, Redis, JWT, password hashing |
| Module 2 | FastAPI, PostgreSQL, object storage, pgvector, async processing |
| Module 3 | FastAPI, PostgreSQL, third-party video SDK, object storage, webhooks |
| Module 4 | Next.js, FastAPI, PostgreSQL, APIs/events, WebSocket or SSE where appropriate |
| Module 5 | FastAPI, PostgreSQL, pgvector, Claude API, async jobs, messaging |
| Module 6 | FastAPI, PostgreSQL, messaging, SkillTaxonomy/content retrieval, Claude API where required |

## Source-of-Truth & Data Ownership Principles

### Module Specifications
Primary source of truth for product behavior and module ownership.

### PostgreSQL
Primary transactional source of truth.

### Object Storage
Source of truth for large binary/media assets.

### Vector Store
Derived/searchable representation of published content, not the primary source of original content.

### Redis
Cache/session/temporary infrastructure, not the primary business-data store.

### API Contracts
Source of truth for frontend/backend integration once formally defined.

### Events
Mechanism for asynchronous state propagation between event-driven components, not a replacement for transactional records.

## Architecture Principles

1. Modules define product boundaries.
2. Module specifications are the primary source of truth.
3. PostgreSQL is the transactional source of truth.
4. Prefer asynchronous processing for long-running operations.
5. Keep AI workloads out of synchronous request paths where practical.
6. Keep AI-generated decisions explainable and traceable.
7. Use deterministic logic where deterministic logic is sufficient.
8. Do not build infrastructure that an external provider already solves well.
9. Avoid unnecessary coupling between modules.
10. Preserve clear ownership of data and business logic.
11. Design for observability from the beginning.
12. Prefer idempotent background jobs and event handlers.
13. Do not embed unpublished/draft content.
14. Frontend UI restrictions must not replace backend authorization or gating.

## Relationship to Module Specifications

This document describes the **technical foundation**.

The six module specifications describe the **actual product capabilities, ownership, workflows, entities, APIs, and module-specific behavior**.

For implementation decisions, use:

`Module Specification > Base SDD Technical Foundation > General Engineering Assumptions`

If a technical choice appears to conflict with a module specification, review the module specification rather than silently changing module behavior.

## Final Technical Summary

The platform uses Next.js for the frontend, FastAPI for backend APIs, PostgreSQL as the transactional source of truth, Redis for sessions/cache, pgvector for initial RAG retrieval, S3-compatible storage for large assets, asynchronous messaging for event-driven workflows, Claude API for AI capabilities, third-party infrastructure for live classes, and OpenTelemetry-based observability.

These technologies support the six-module product architecture without creating additional product modules.

The module specifications remain the primary source of truth for what the platform does and which module owns each capability.
