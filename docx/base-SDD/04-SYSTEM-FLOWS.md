# 04 — System Flows

## Critical Source-of-Truth Rule

The project's **six module specifications are the PRIMARY SOURCE OF TRUTH**.

This document describes only how the workflows defined by those modules connect at a high level.

Priority:
1. Existing six module specifications — highest authority
2. Approved technology stack
3. Base SDD architecture/foundation documents
4. General engineering knowledge — only where necessary

Do NOT change, reinterpret, merge, split, rename, or reorganize the six modules.

The six modules are:
1. Module 1 — User & Access Management
2. Module 2 — Course & Content Management
3. Module 3 — Live Online Classes
4. Module 4 — Student Experience & Dashboard
5. Module 5 — AI Assessment & Evaluation
6. Module 6 — Adaptive Learning & Remediation

If a workflow detail is not supported by the module specifications, do not invent it.

---

## 1. Document Purpose

This document describes the major end-to-end system flows of the platform.

It explains how students, instructors, content, assessments, AI evaluation, adaptive remediation, and learning progress move through the six modules.

It is intended as shared high-level context for frontend engineers, backend engineers, AI engineers, technical leads, and AI coding agents.

Detailed APIs, database schemas, UI specifications, and module-specific implementation details belong in the relevant module documentation.

---

## 2. Core System Flow

The platform's central learning lifecycle is:

```text
User Authentication
       ↓
Course / Lesson Access
       ↓
Learning Content
       ↓
Assessment
       ↓
AI Evaluation
       ↓
Skill Scores
       ↓
Weakness Detection
       ↓
Remediation
       ↓
Remedial Learning
       ↓
Focused Retest
       ↓
Updated Skill State
       ↓
Continue Learning
```

The six modules participate as follows:

```text
Module 1
   ↓
Module 4
   ↓
Module 2
   ↓
Module 5
   ↓
Module 6
   ↓
Module 4
   ↓
Module 5
```

Module 3 participates when the learning experience includes live classes.

---

## 3. Authentication & Access Flow

Module 1 owns authentication and access.

```text
Student
   ↓
Frontend / Module 4
   ↓
Module 1 Authentication
   ↓
Credential Validation
   ↓
Access Token + Refresh Token
   ↓
Authenticated Session
   ↓
Student Accesses Platform
```

Module 1 provides the shared authentication and authorization foundation for the other modules.

Authorization must be enforced by the backend.

---

## 4. Course & Content Learning Flow

Module 2 owns course and learning content.

```text
Student
   ↓
Module 4
   ↓
Request Course / Lesson
   ↓
Module 2
   ↓
Course → Module → Lesson
   ↓
Published Content
   ↓
Content Player
   ↓
Student Learning
```

Module 4 presents the content while Module 2 remains responsible for the underlying curriculum and content data.

---

## 5. Content Publishing & Embedding Flow

Module 2 owns content publishing and the embedding pipeline.

```text
Instructor / Admin
       ↓
Create / Update Content
       ↓
Draft
       ↓
Publish
       ↓
Published Lesson / Version
       ↓
Async Embedding Job
       ↓
Text Extraction / OCR
       ↓
Chunking
       ↓
Embeddings
       ↓
pgvector
```

**Draft content must not be used as published AI-assessment context.**

Embedding processing should be asynchronous and idempotent.

The vector representation is derived from authoritative content.

---

## 6. Live Online Class Flow

Module 3 owns live online classes.

```text
Instructor
   ↓
Schedule Live Session
   ↓
Module 3
   ↓
Third-Party Video Provider
   ↓
Student Joins
   ↓
Join / Leave Webhooks
   ↓
Attendance Tracking
   ↓
Class Ends
   ↓
Recording
   ↓
Archive
   ↓
Module 2 Content Asset / Replay
```

Module 3 owns live-session behavior. If a recording becomes reusable learning content, it can enter Module 2's content system.

---

## 7. Assessment Generation Flow

Module 5 owns AI assessment generation.

```text
Student
   ↓
Module 4
   ↓
Start Assessment
   ↓
Module 5
   ↓
Identify Required Skill / Context
   ↓
Retrieve Published Content
   ↓
pgvector / RAG
   ↓
SkillTaxonomy + Retrieved Context
   ↓
Claude API
   ↓
Question Set + Rubric
   ↓
Store Test
   ↓
Make Test Available
```

Assessment generation should be asynchronous where generation is long-running.

Generated assessments should be versioned and traceable to their source context.

---

## 8. Assessment Submission Flow

```text
Student
   ↓
Module 4
   ↓
Answer Questions
   ↓
Submit Assessment
   ↓
Module 5
   ↓
Store Submission
   ↓
Grade / Evaluate
   ↓
Calculate Skill Scores
   ↓
Assessment Result
```

Module 5 owns assessment evaluation.

Module 4 presents resulting information to the student.

---

## 9. Assessment Grading Flow

```text
Submission
   ↓
Module 5
   ├── MCQ → Deterministic Grading
   │
   └── Short Answer → Rubric + Context + Claude
                         ↓
                      Evaluation
   ↓
Skill-Level Scores
   ↓
Test Result
```

Deterministic grading should be used where deterministic evaluation is sufficient.

AI evaluation should remain traceable to the relevant rubric and source context.

---

## 10. TestGraded Event Flow

When grading is complete, Module 5 emits the central event:

`TestGraded`

```text
Module 5
   ↓
Assessment Graded
   ↓
Skill Scores Calculated
   ↓
TestGraded Event
   ↓
Message / Event Infrastructure
   ↓
Module 6
```

The event-driven approach allows Module 6 to react without Module 5 directly controlling every remediation operation.

---

## 11. Weakness Detection Flow

Module 6 consumes the `TestGraded` event.

```text
TestGraded
   ↓
Module 6
   ↓
Read Skill Scores
   ↓
Apply Weakness Threshold Rules
   ↓
Weak Skill Identified
   ↓
Create Weakness Flag
```

Initially, weakness detection is rule-based. The architecture should not assume an ML-based weakness detector because sufficient training data does not yet exist.

---

## 12. Remediation Planning Flow

```text
Weakness Flag
   ↓
Module 6
   ↓
SkillTaxonomy / Relevant Content
   ↓
Identify Remedial Learning
   ↓
Generate Remediation Plan
   ↓
Update Learning Path State
   ↓
Module 4
   ↓
Show Remediation to Student
```

Module 6 owns remediation planning.

Module 4 owns presentation of that remediation to the student.

---

## 13. Learning-Path State Flow

Module 6 maintains explicit learning-path state.

```text
locked
   ↓
unlocked
   ↓
in_progress
   ↓
mastered
```

When a weakness requires remediation, advanced learning content can remain locked until required remediation is completed.

Gating must be enforced by backend/module logic, not only hidden in the frontend.

---

## 14. Remedial Learning Flow

```text
Module 6
   ↓
Remediation Plan
   ↓
Module 4
   ↓
Student Views Remediation
   ↓
Module 2
   ↓
Remedial Lesson / Content
   ↓
Student Completes Remediation
   ↓
Learning Progress Updated
```

Module 4 presents the experience.

Module 2 owns learning content.

Module 6 owns adaptive remediation behavior.

---

## 15. Focused Retest Flow

```text
Remedial Learning Completed
   ↓
Module 6
   ↓
Retest Trigger
   ↓
Module 5
   ↓
Generate Focused Assessment
   ↓
Student Takes Retest
   ↓
Grade
   ↓
Updated Skill Score
   ↓
TestGraded
   ↓
Module 6
```

This creates the closed-loop adaptive behavior.

---

## 16. Complete Adaptive Learning Loop

```text
┌───────────────────────────────────────────┐
│              Module 4                     │
│       Student Experience                  │
└─────────────────┬─────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────┐
│              Module 5                     │
│      Assessment & Evaluation              │
└─────────────────┬─────────────────────────┘
                  │
                  │ TestGraded
                  ▼
┌───────────────────────────────────────────┐
│              Module 6                     │
│    Adaptive Learning & Remediation        │
└─────────────────┬─────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────┐
│              Module 4                     │
│     Remediation / Learning Experience     │
└─────────────────┬─────────────────────────┘
                  │
                  ▼
            Focused Retest
                  │
                  ▼
┌───────────────────────────────────────────┐
│              Module 5                     │
│       Evaluation / New Skill Score        │
└───────────────────────────────────────────┘
```

This loop is the core differentiating behavior of the platform.

---

## 17. Student End-to-End Journey

```text
1. Login
   ↓
2. Open Dashboard
   ↓
3. Select Course
   ↓
4. Open Lesson
   ↓
5. Learn Content
   ↓
6. Take Assessment
   ↓
7. Receive Evaluation
   ↓
8. Skill Scores Updated
   ↓
9. Weakness Detected
   ↓
10. Remediation Presented
   ↓
11. Complete Remedial Learning
   ↓
12. Focused Retest
   ↓
13. Skill State Updated
   ↓
14. Continue Learning
```

| Student Action | Primary Module |
|---|---|
| Login | Module 1 |
| Dashboard | Module 4 |
| Course/Lesson | Module 2 + Module 4 |
| Live Class | Module 3 + Module 4 |
| Assessment Generation | Module 5 |
| Assessment Submission | Module 5 |
| Evaluation | Module 5 |
| Weakness Detection | Module 6 |
| Remediation | Module 6 + Module 4 |
| Remedial Content | Module 2 + Module 4 |
| Focused Retest | Module 5 + Module 6 |

---

## 18. Instructor / Content Flow

```text
Instructor / Admin
   ↓
Create Course
   ↓
Create Module
   ↓
Create Lesson
   ↓
Upload Content
   ↓
Tag Skills
   ↓
Publish
   ↓
Embedding Pipeline
   ↓
pgvector
   ↓
Available for Learning / AI Retrieval
```

For live teaching:

```text
Instructor
   ↓
Schedule Live Session
   ↓
Third-Party Video Provider
   ↓
Conduct Class
   ↓
Attendance
   ↓
Recording
   ↓
Archive
   ↓
Potential Module 2 Content Asset
```

---

## 19. Notification / Student Update Flow

When important state changes occur, Module 4 should surface relevant information to the student.

Examples:
- assessment results
- remediation availability
- learning-path changes
- other module-defined notifications

The underlying business operation belongs to the responsible module.

Module 4 is responsible for the student-facing presentation.

Real-time updates may use WebSocket/SSE/event subscription where appropriate rather than unnecessary polling.

---

## 20. Synchronous vs Asynchronous Flows

### Synchronous

Use synchronous request/response flows for operations requiring immediate results.

Examples:
- login
- loading course data
- loading lesson data
- dashboard reads
- retrieving existing results
- retrieving learning state

### Asynchronous

Use asynchronous processing for long-running operations.

Examples:
- content embedding
- AI test generation
- AI grading where appropriate
- event processing
- remediation generation
- notifications

Long-running AI workflows should not be forced into normal synchronous request paths when unnecessary.

---

## 21. Error / Retry Principles

Long-running background workflows should support safe retry.

Examples:
- embedding jobs
- assessment-generation jobs
- grading jobs
- event handlers
- remediation jobs

Important principle:

**Retries must not create duplicate business results.**

Jobs and event handlers should therefore be idempotent where practical.

Detailed retry policies belong in implementation-level documentation.

---

## 22. Cross-Module Ownership Rules

The system flows must preserve these ownership boundaries:

- Module 1 owns identity and access.
- Module 2 owns course/content.
- Module 3 owns live classes.
- Module 4 owns student-facing aggregation/presentation.
- Module 5 owns assessment generation/evaluation.
- Module 6 owns adaptive learning/remediation.

A module may consume another module's data or events, but it should not silently take ownership of another module's business logic.

---

## 23. Core Event Flow Summary

```text
Assessment Submission
        ↓
Module 5
        ↓
Evaluation
        ↓
Skill Scores
        ↓
TestGraded
        ↓
Module 6
        ↓
Weakness Detection
        ↓
Remediation
        ↓
Learning Path Update
        ↓
Module 4
        ↓
Student Remediation
        ↓
Focused Retest
        ↓
Module 5
```

This is the platform's central closed-loop learning mechanism.

---

## 24. Source-of-Truth Rule for System Flows

When implementing or modifying a flow:

1. Start with the relevant module specification.
2. Preserve the module's defined responsibility.
3. Use this document to understand cross-module interaction.
4. Use API contracts for frontend/backend integration once defined.
5. Use database documentation for data-level details.
6. Do not invent a new flow merely because it seems technically convenient.

If this document conflicts with a detailed module specification, the **module specification wins**.

---

## 25. Final Flow Summary

The platform is fundamentally a closed-loop adaptive learning system.

The student learns through Modules 2, 3, and 4, is assessed and evaluated through Module 5, and receives adaptive remediation through Module 6.

The central loop is:

`Module 4 → Module 5 → TestGraded → Module 6 → Module 4 → Module 5`

Module 1 provides the shared identity and access foundation.

Module 2 provides the authoritative learning-content foundation.

Module 3 provides live online learning.

Module 4 provides the student-facing experience.

Module 5 provides AI assessment and evaluation.

Module 6 closes the adaptive learning loop.

The six module specifications remain the primary source of truth for all product behavior and ownership.
