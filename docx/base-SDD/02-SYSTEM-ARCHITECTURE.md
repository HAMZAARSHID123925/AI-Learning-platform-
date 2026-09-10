# 02 — System Architecture

## Critical Source-of-Truth Rule

The project's **six module specifications are the PRIMARY SOURCE OF TRUTH**.

This document defines the high-level system architecture that connects those modules and the approved technical foundation.

Use this priority:

1. Existing six module specifications — highest authority
2. Approved technology stack
3. Base SDD project overview
4. General engineering knowledge — only where necessary

Do NOT change, reinterpret, merge, split, rename, or reorganize the six modules.

The six modules are:

1. Module 1 — User & Access Management
2. Module 2 — Course & Content Management
3. Module 3 — Live Online Classes
4. Module 4 — Student Experience & Dashboard
5. Module 5 — AI Assessment & Evaluation
6. Module 6 — Adaptive Learning & Remediation

If there is any ambiguity, preserve the behavior and boundaries defined by the module specifications.

---

## 1. Document Purpose

This document defines the high-level system architecture of the AI-powered adaptive learning and assessment platform.

It explains how the six product modules interact with each other and how shared technical infrastructure supports them.

This is a **high-level architecture document**, not a detailed implementation specification.

Do not define detailed database schemas, complete API contracts, or implementation code here.

---

## 2. System Architecture Overview

The platform is a custom LMS combined with AI-powered assessment, evaluation, and adaptive remediation.

At a high level:

```text
                         ┌──────────────────────┐
                         │   Next.js Frontend   │
                         │ Student Experience   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     FastAPI API      │
                         │ Shared API Foundation│
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌────────────┐        ┌────────────┐        ┌────────────┐
      │ PostgreSQL │        │   Redis    │        │   Object   │
      │ Transaction│        │ Sessions / │        │  Storage   │
      │   Source   │        │   Cache    │        │  S3/R2/etc │
      └────────────┘        └────────────┘        └────────────┘
             │
             ▼
      ┌────────────┐
      │  pgvector  │
      │ RAG Search │
      └────────────┘

       ┌─────────────────────────────────────────┐
       │              AI / Async Layer            │
       │                                           │
       │ Claude API + Messaging + Background Jobs │
       └─────────────────────────────────────────┘

       ┌─────────────────────────────────────────┐
       │       Third-Party Live Video Layer       │
       │     Agora / Zoom SDK / Daily.co          │
       └─────────────────────────────────────────┘
```

The technical infrastructure supports the six modules but does not become additional product modules.

---

## 3. Six-Module Architecture

The six modules are the product architecture backbone.

### Module 1 — User & Access Management

Provides the identity and access foundation.

Responsibilities include:

- authentication
- token issuance and refresh
- password reset
- RBAC
- profiles/preferences
- Redis-backed sessions
- audit logging

All other modules depend on the access foundation.

---

### Module 2 — Course & Content Management

Owns the learning-content source of truth.

Responsibilities include:

- course hierarchy
- modules and lessons
- content assets
- content metadata
- skill tagging
- draft/published versioning
- content embedding pipeline

Published content can be processed into the vector index for AI retrieval.

---

### Module 3 — Live Online Classes

Owns live learning sessions.

Responsibilities include:

- scheduling
- third-party video integration
- attendance
- join/leave tracking
- recordings
- recording archival

Recordings can become content assets through Module 2.

---

### Module 4 — Student Experience & Dashboard

Provides the primary student-facing experience.

Responsibilities include:

- dashboard
- content player
- progress presentation
- analytics
- notifications
- navigation
- presentation of assessment and remediation results

Module 4 aggregates information from other modules but does not own their underlying business logic.

---

### Module 5 — AI Assessment & Evaluation

Owns AI-powered assessment capabilities.

Responsibilities include:

- assessment generation
- RAG-based context retrieval
- question generation
- grading/evaluation
- skill scoring
- assessment result generation

Module 5 uses Module 2's published content/index as assessment context.

When grading is complete, it emits the `TestGraded` event.

---

### Module 6 — Adaptive Learning & Remediation

Owns the closed-loop adaptive learning behavior.

Responsibilities include:

- weakness detection
- remediation planning
- mastery/state tracking
- adaptive retest triggering
- learning-path state

Module 6 primarily reacts to `TestGraded` events from Module 5.

---

## 4. Module Dependency Map

The conceptual dependency relationships are:

```text
Module 1
   │
   ├──────────────► Shared Authentication / Authorization
   │
   ▼
All Modules

Module 2 ─────────► Module 5
Content / Skills       AI Assessment Context

Module 3 ─────────► Module 2
Recordings              Content Asset / Replay

Module 4 ─────────► Modules 2, 3, 5, 6
Student Experience      Aggregation / Presentation

Module 5 ─────────► Module 6
       TestGraded Event

Module 6 ─────────► Module 4
       Remediation / Learning State

Module 6 ─────────► Module 5
       Focused Retest
```

The most important adaptive dependency is:

```text
Module 4
   ↓
Module 5
   ↓
TestGraded
   ↓
Module 6
   ↓
Module 4
   ↓
Module 5
```

---

## 5. Shared Technical Infrastructure

The system uses shared technical infrastructure across modules.

### Frontend

React / Next.js provides the frontend foundation.

### Backend

FastAPI provides the API/service foundation.

### Database

PostgreSQL provides transactional persistence and remains the primary data source.

### Cache / Sessions

Redis supports sessions, caching, and temporary state.

### Vector Search

PostgreSQL + pgvector provides the initial vector-search foundation.

### Object Storage

S3-compatible storage supports large files and media.

### Messaging

Redis Streams or RabbitMQ provide the initial asynchronous event foundation.

### AI

Claude API supports AI generation and evaluation capabilities.

### Live Video

A third-party video provider supports Module 3.

### Observability

OpenTelemetry and an appropriate hosted observability platform provide tracing, metrics, and monitoring.

---

## 6. Data Architecture

PostgreSQL is the primary transactional source of truth.

Each module owns its defined business data.

```text
Module 1 → Identity / Access Data
Module 2 → Course / Content / Skill Data
Module 3 → Live Session / Attendance / Recording Data
Module 4 → Progress / Analytics / Notification Data
Module 5 → Assessment / Question / Submission / Skill Score Data
Module 6 → Weakness / Remediation / Learning Path State
```

Large binary assets are stored in S3-compatible object storage.

Vector embeddings are derived from published content and stored using pgvector.

Redis is used for high-speed infrastructure concerns rather than as the primary transactional database.

---

## 7. Content and AI Architecture

Module 2 is the source of truth for learning content.

The conceptual content-to-AI flow is:

```text
Course Content
      ↓
Published Lesson / Version
      ↓
Text Extraction / OCR
      ↓
Chunking
      ↓
Embeddings
      ↓
pgvector
      ↓
Module 5 Retrieval
      ↓
Claude API
      ↓
Generated Assessment
```

Important architectural rule:

**Draft content must never be treated as published AI-assessment context.**

Embedding processing should be asynchronous and idempotent.

Retrieved context should be associated with the relevant lesson/version/skill information.

---

## 8. AI Assessment Architecture

Module 5 provides the AI assessment engine.

Conceptually:

```text
Student Request
      ↓
Module 4
      ↓
Module 5
      ↓
Retrieve Relevant Published Content
      ↓
SkillTaxonomy / Skill Context
      ↓
Claude API
      ↓
Question Set + Rubric
      ↓
Store Test
      ↓
Student Submission
      ↓
Grading
      ↓
Skill Scores
      ↓
TestGraded Event
```

MCQ grading remains deterministic.

Short-answer evaluation can use an LLM grader with the appropriate rubric and source context.

Generated assessments should be versioned and traceable to their source context.

Long-running generation should be asynchronous.

---

## 9. Adaptive Learning Architecture

Module 6 closes the learning loop after assessment.

Conceptually:

```text
TestGraded
    ↓
Module 6
    ↓
Skill Score Analysis
    ↓
Weakness Detection
    ↓
SkillTaxonomy / Content Lookup
    ↓
Remediation Plan
    ↓
Learning Path State Update
    ↓
Module 4
    ↓
Student Completes Remediation
    ↓
Focused Retest
    ↓
Module 5
```

Initially, weakness detection should use rule-based thresholds rather than an ML model because sufficient training data does not yet exist.

The learning-path state should be explicit and support states such as:

- locked
- unlocked
- in_progress
- mastered

Retest attempts should be bounded, with escalation to an instructor after repeated failure where defined by Module 6.

---

## 10. Synchronous vs Asynchronous Architecture

Use synchronous communication for operations that require immediate request/response behavior.

Examples:

- login
- loading dashboard data
- loading course information
- reading assessment results
- retrieving remediation state

Use asynchronous processing for long-running or event-driven operations.

Examples:

- content embedding
- AI test generation
- AI grading where appropriate
- event processing
- notifications
- remediation processing

Conceptual model:

| Operation | Communication |
|---|---|
| Authentication | Synchronous |
| Course/content retrieval | Synchronous |
| Dashboard queries | Synchronous / aggregated |
| Test generation | Asynchronous |
| Content embedding | Asynchronous |
| Assessment grading | Asynchronous where appropriate |
| `TestGraded` propagation | Event-driven |
| Remediation generation | Event-driven / asynchronous |
| Notifications | Asynchronous / event-driven |

---

## 11. Student Experience Architecture

Module 4 is the presentation and aggregation layer for the student.

A student may:

1. authenticate through Module 1
2. browse learning content through Module 2
3. join live classes through Module 3
4. take an assessment through Module 5
5. receive results and skill scores
6. have weaknesses identified by Module 6
7. receive remediation
8. complete remedial learning
9. take a focused retest
10. continue through the learning path

The frontend should not implement business rules that belong to the backend modules.

For example, content gating must be enforced by backend/module logic rather than only hidden in the UI.

---

## 12. Live-Class Architecture

Module 3 integrates with a third-party conferencing provider.

Conceptual flow:

```text
Module 3
   ↓
Create / Schedule Session
   ↓
Third-Party Video Provider
   ↓
Student / Instructor Join
   ↓
Join / Leave Webhooks
   ↓
Attendance
   ↓
Recording
   ↓
Object Storage
   ↓
Module 2 Content Asset / Replay
```

The system should not build and operate its own WebRTC SFU.

---

## 13. Event-Driven Adaptive Loop

The central event-driven workflow is:

```text
Module 5
   │
   │ grading completes
   ▼
TestGraded
   │
   ▼
Module 6
   │
   ├── weakness detection
   ├── remediation plan
   └── learning-path update
   │
   ▼
Module 4
   │
   └── presents remediation to student
   │
   ▼
Student completes remediation
   │
   ▼
Module 5
   │
   └── focused retest
```

This event-driven architecture keeps assessment and adaptive remediation loosely coupled.

---

## 14. Security Architecture

Security is a shared foundation.

Module 1 owns authentication and authorization behavior.

Shared security concerns include:

- JWT access tokens
- refresh-token mechanism
- RBAC
- role/permission separation
- secure password hashing
- API authorization
- encryption in transit
- encryption at rest
- audit logging

All module APIs must enforce authorization appropriate to the user's role and permissions.

---

## 15. Observability Architecture

Observability must cover both normal request flows and asynchronous AI workflows.

The architecture should support:

- structured logs
- metrics
- distributed tracing
- error monitoring
- background-job visibility
- event-processing visibility
- AI generation/grading visibility

Tracing should make the following flow observable:

`Module 4 → Module 5 → TestGraded → Module 6 → Module 4`

This is important because failures may occur across different services, queues, background workers, and AI providers.

---

## 16. Architecture Boundaries

Maintain clear ownership.

### Module 1
Owns identity and access.

### Module 2
Owns course/content.

### Module 3
Owns live classes.

### Module 4
Owns student-facing aggregation/presentation.

### Module 5
Owns assessment generation and evaluation.

### Module 6
Owns adaptive learning and remediation.

Technical infrastructure such as PostgreSQL, Redis, pgvector, object storage, messaging, and observability supports these modules but does not replace their ownership boundaries.

---

## 17. Architecture Principles

1. The six modules are the product architecture backbone.
2. Module specifications are the primary source of truth.
3. Technical infrastructure supports modules rather than becoming new product modules.
4. PostgreSQL is the transactional source of truth.
5. Module ownership must remain explicit.
6. Prefer asynchronous processing for long-running operations.
7. Use event-driven communication for cross-module workflows that benefit from loose coupling.
8. Keep AI workloads isolated from synchronous request paths where practical.
9. Use deterministic logic where deterministic logic is sufficient.
10. Never embed unpublished/draft content.
11. Keep vector data derived from authoritative content.
12. Do not duplicate business logic in the frontend.
13. Use third-party infrastructure where it is more appropriate than building complex infrastructure internally.
14. Design cross-module workflows for observability and traceability.
15. Prefer idempotent background jobs and event handlers.

---

## 18. Relationship to Other Base SDD Documents

This document defines **how the system is architected at a high level**.

`01-PROJECT-OVERVIEW.md` explains what the project is and what the six modules represent.

`03-TECHNICAL-FOUNDATION.md` explains the approved technologies and shared technical foundation.

The six module specifications remain the detailed source of truth for module-specific behavior.

For implementation decisions:

`Module Specification > Base SDD Architecture/Foundation > General Assumptions`

---

## 19. Final Architecture Summary

The platform is organized around six product modules supported by a shared technical foundation.

The architecture combines:

- Next.js
- FastAPI
- PostgreSQL
- Redis
- pgvector
- S3-compatible object storage
- asynchronous messaging
- Claude API
- third-party live video infrastructure
- observability tooling

The central adaptive-learning architecture is:

`Module 4 → Module 5 → TestGraded → Module 6 → Module 4 → Module 5`

The six module specifications remain the primary source of truth for product behavior, ownership, workflows, and boundaries.
