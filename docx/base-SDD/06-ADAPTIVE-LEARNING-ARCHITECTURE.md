# 03-ADAPTIVE-LEARNING-ARCHITECTURE.md

> **Document Type:** Additional Architecture Document — AI Adaptive Learning & Personalized Remediation
> **Project:** AI-Powered Learning Management System with AI Assessment and Adaptive Learning
> **Depends On:** `01-PROJECT-OVERVIEW.md`, `02-SYSTEM-ARCHITECTURE.md`
> **Status:** Architectural Specification — Implementation-Ready

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Old vs. New Architecture](#2-old-vs-new-architecture)
3. [End-to-End Student Journey](#3-end-to-end-student-journey)
4. [Persistent LMS Course vs. AI-Generated Personalized Course](#4-persistent-lms-course-vs-ai-generated-personalized-course)
5. [Personalized Course Generation Pipeline](#5-personalized-course-generation-pipeline)
6. [AI / Agent Architecture](#6-ai--agent-architecture)
7. [Personalized Course Data Model](#7-personalized-course-data-model)
8. [Personalized Course Lifecycle](#8-personalized-course-lifecycle)
9. [Retest Architecture](#9-retest-architecture)
10. [Performance Comparison](#10-performance-comparison)
11. [Improvement Report](#11-improvement-report)
12. [Module Responsibilities](#12-module-responsibilities)
13. [Event-Driven Flow](#13-event-driven-flow)
14. [API / Contract Impact](#14-api--contract-impact)
15. [Storage Architecture](#15-storage-architecture)
16. [RAG and Content Grounding](#16-rag-and-content-grounding)
17. [Safety, Quality, and Validation](#17-safety-quality-and-validation)
18. [Failure and Retry Strategy](#18-failure-and-retry-strategy)
19. [Observability](#19-observability)
20. [Security](#20-security)
21. [Architecture Diagrams](#21-architecture-diagrams)
22. [Complete End-to-End Example](#22-complete-end-to-end-example)
23. [Engineering Non-Negotiables](#23-engineering-non-negotiables)

---

## 1. Purpose

### 1.1 What This Document Defines

This document defines the **AI-powered adaptive learning and personalized remediation architecture** for the LMS platform. It is an additional, implementation-oriented specification that extends — and must be read alongside — the two existing Base SDD documents:

- `01-PROJECT-OVERVIEW.md` — Project context, module definitions, student lifecycle
- `02-SYSTEM-ARCHITECTURE.md` — Technical stack, module interactions, event-driven patterns

**This document does not redefine the six-module architecture.** The six modules remain the primary structural and responsibility boundaries. This document defines how those modules collaborate to implement an advanced adaptive learning loop.

### 1.2 The Problem This Architecture Solves

The original system design connected assessment to a follow-up test directly after weakness detection. While functional, this pattern has a fundamental limitation: **it tests whether students have improved without providing a structured mechanism to help them improve first.**

A student who scores poorly on Error Handling in a Python assessment receives another Error Handling test. They have not received targeted instruction on Error Handling. The retest produces a second data point — it does not produce a learning intervention.

The new architecture introduced in this document addresses this gap by inserting a **personalized remedial learning course** between weakness detection and retesting. The system now:

1. Evaluates the student.
2. Identifies specific weaknesses at the skill level.
3. **Generates a student-specific remedial learning course** targeted at those weaknesses.
4. Delivers that course to the student within the platform experience.
5. Issues a focused retest after the student completes the remedial course.
6. Compares pre- and post-remediation performance at the skill level.
7. Produces an improvement report visible to the student.

This transforms the assessment-feedback loop from a **test → retest** pattern into a **test → learn → retest → measure improvement** cycle. It is the core architectural change documented here.

### 1.3 Scope

This document covers:

- The new end-to-end adaptive learning flow.
- The personalized course generation pipeline.
- The data model for AI-generated personalized learning artifacts.
- The lifecycle of a personalized learning plan.
- The retest architecture.
- Performance comparison and improvement measurement.
- Module ownership for each component.
- Event-driven integration with the existing `TestGraded` event architecture.
- Storage, RAG grounding, safety, failure handling, observability, and security.

---

## 2. Old vs. New Architecture

### 2.1 Previous Flow (Simple Retest)

```
Student completes original LMS course
        ↓
Module 5: AI generates initial assessment
        ↓
Student attempts assessment
        ↓
Module 5: AI evaluates responses
        ↓
Module 6: AI identifies weak skill areas
        ↓
Module 5: AI generates a RETEST focused on weak areas
        ↓
Student attempts retest
        ↓
Module 5: AI evaluates retest
```

**Problems with this pattern:**

- The student moves from weakness detection directly to reassessment with no structured learning opportunity in between.
- The retest measures whether the student already knew the material — not whether the platform helped them improve.
- The feedback loop produces data but does not produce learning.
- Student experience is test-heavy with no remediation support surface.

### 2.2 New Flow (Personalized Remediation + Retest)

```
Student completes original LMS course (Module 2)
        ↓
Module 5: AI generates initial assessment (RAG from Module 2 content)
        ↓
Student attempts assessment (via Module 4)
        ↓
Module 5: AI evaluates responses (deterministic + LLM where applicable)
        ↓
Module 5: Produces skill-mapped performance evidence
        ↓
Module 5: Emits TestGraded event → Message Broker
        ↓
Module 6: Consumes TestGraded event
        ↓
Module 6: Identifies weak skills and constructs weakness profile
        ↓
Module 6: GENERATES PERSONALIZED REMEDIAL LEARNING COURSE  ← KEY CHANGE
        ↓
Module 4: Presents personalized course to student
        ↓
Student completes personalized course
        ↓
Module 6: Detects course completion → triggers retest
        ↓
Module 5: Generates focused retest (targeted at weak skills)
        ↓
Student attempts retest (via Module 4)
        ↓
Module 5: Evaluates retest → emits TestGraded event (retest context)
        ↓
Module 6: Compares original assessment vs retest at skill level
        ↓
Module 6: Produces improvement analysis
        ↓
Module 4: Presents improvement report to student
        ↓
[If weaknesses remain] → New remediation cycle
[If mastery achieved]  → Learning path advances
```

### 2.3 Key Architectural Difference

| Dimension | Old Architecture | New Architecture |
|---|---|---|
| Post-weakness action | Generate retest immediately | Generate personalized remedial course first |
| Learning intervention | None | AI-generated targeted learning content |
| Student experience | Test → Retest | Test → Learn → Retest → Improvement report |
| Performance measurement | Single retest score | Pre/post comparison at skill level |
| Improvement visibility | None | Structured improvement report |
| Adaptive loop closure | Partial (retests only) | Full (remediation + retest + comparison) |

---

## 3. End-to-End Student Journey

### Phase 1 — Original Course Engagement

The student accesses their enrolled course through the student dashboard (Module 4). The course is a standard instructor-created LMS course, owned and published by **Module 2 — Course & Content Management**.

Course content may include:

- Video lessons
- PDF documents
- Text-based lesson content
- Learning modules organized hierarchically (Course → Module → Lesson)
- Skill-tagged content (each lesson may be tagged with one or more skills from the platform's skill taxonomy)

The student progresses through the course content. Module 4 tracks and surfaces progress. When the student has satisfied the course completion criteria defined by the instructor, the course is marked complete and the assessment phase is eligible to begin.

**Module ownership:** Module 2 owns the course and content. Module 4 owns the student-facing experience of accessing and progressing through it.

---

### Phase 2 — Initial AI Assessment

**Owner: Module 5 — AI Assessment & Evaluation**

After course completion, an initial assessment is generated. Generation may be triggered automatically by the system upon course completion or initiated by the student/instructor depending on platform configuration.

**How course content becomes AI context:**

1. Module 5 queries the skill taxonomy associated with the completed course (from Module 2's skill tags).
2. Module 5 performs a semantic retrieval query against **pgvector** using the relevant skill/topic context. The vector store holds embeddings of published course content, generated asynchronously by Module 2's embedding pipeline.
3. The most semantically relevant content chunks are retrieved and assembled as RAG context.
4. The LLM (Claude API) receives a prompt containing: the RAG context, the skill taxonomy, the course metadata, and assessment generation instructions.
5. The LLM generates structured assessment items — question text, answer options (for MCQ), correct answers, skill tags, and difficulty markers.
6. Generated assessment items are validated and stored in PostgreSQL as a versioned assessment record.

**Assessment characteristics:**

- Versioned: each generated assessment has a version identifier linking it to the course content and skill context used for generation.
- Skill-mapped: every question is associated with one or more skills from the taxonomy.
- Mixed question types: MCQ (deterministically gradeable) and short-answer/open-ended (LLM-evaluated).
- Stored in PostgreSQL before delivery — assessments are not generated ephemerally.

**Delivery:** The assessment is presented to the student through Module 4.

---

### Phase 3 — Assessment Attempt

**Owner: Module 5 (backend processing); Module 4 (delivery)**

The student completes the assessment through the Module 4 UI.

- **MCQ responses** are submitted and stored as student answer records referencing the assessment item.
- **Short-answer responses** are stored as raw text alongside the question context.
- On submission, Module 4 sends the submission payload to the Module 5 API endpoint.
- Module 5 validates the submission (all required questions answered, no duplicate submissions, correct assessment version reference).
- The submission is written to PostgreSQL atomically.
- MCQ grading is performed **deterministically** immediately: correct/incorrect per question, score per skill.
- Short-answer/open-ended evaluation is queued for **asynchronous LLM evaluation** via the background worker.
- The student receives an acknowledgment that the submission was received. Evaluation results are available when processing completes.

---

### Phase 4 — AI Evaluation and Weakness Detection

**Owner: Module 5 (evaluation); Module 6 (weakness detection)**

**Module 5 — Evaluation:**

- Deterministic grading completes synchronously for MCQ items.
- LLM evaluation of open-ended items completes asynchronously. The LLM is provided the question, the student's response, the correct answer/rubric, and the skill context. It returns a structured evaluation result: score, reasoning summary (stored internally — not exposed to student), skill assessment.
- All item-level scores are aggregated into skill-level scores: for each skill in the assessment, the student's performance across all items tagged with that skill is computed.
- Overall score, per-skill scores, and item-level results are persisted in PostgreSQL as structured performance evidence.
- **TestGraded event is emitted** to the message broker with the assessment ID, student ID, skill scores, and overall result.

**Module 6 — Weakness Detection (triggered by TestGraded event):**

Module 6 consumes the TestGraded event and performs weakness analysis:

- **Weak skill identification:** Skills where the student's score falls below a defined mastery threshold (e.g., < 70%) are flagged as weak.
- **Severity classification:** Weaknesses may be classified by severity — e.g., Critical (< 50%), Moderate (50–69%), Borderline (70–79%) — to prioritize remediation focus. *(Thresholds are a proposed architectural decision; exact values should be confirmed during module specification.)*
- **Incorrect pattern analysis:** Item-level data is inspected to identify recurring incorrect response patterns within a skill domain.
- **Weakness profile construction:** A `WeaknessProfile` record is created and persisted in PostgreSQL. It contains: skill IDs, severity levels, score evidence, and references to the source assessment and TestGraded event.

If no weaknesses are detected (all skills above mastery threshold), the adaptive loop does not trigger personalized course generation. The student is notified of their results and mastery status.

---

### Phase 5 — Personalized Course Generation

**Owner: Module 6 — Adaptive Learning & Remediation**

This is the central new architectural component.

Upon completing weakness analysis, Module 6 initiates the personalized remedial course generation pipeline. This is an **asynchronous background operation** — it does not block the student's session.

The generation pipeline produces a **PersonalizedLearningPlan** — a student-specific, AI-generated learning experience structured as modules and lessons, targeting the identified weak skills. This is not a normal instructor-created LMS course and is not stored as a Module 2 course entity.

The generated learning experience may contain:

- **PersonalizedModules** — organized thematic units targeting specific weak skills.
- **PersonalizedLessons** — individual learning units within a module.
- **Explanatory content** — clear, structured text explanations of concepts the student struggled with.
- **Examples** — worked examples grounded in the course's skill and topic domain.
- **Practice material** — short exercises or problems within the lesson content.
- **Knowledge checks** — lightweight self-assessment questions embedded within lessons (not formal assessments; owned by Module 6 within the personalized course context).

When the plan is generated and validated, Module 4 is notified and the student sees the personalized course available in their dashboard.

---

## 4. Persistent LMS Course vs. AI-Generated Personalized Course

This distinction is architecturally critical and must be maintained throughout all implementation.

### 4.1 Normal LMS Course

| Property | Value |
|---|---|
| **Owner** | Module 2 — Course & Content Management |
| **Created by** | Instructors / Administrators |
| **Persistence** | Permanent (until explicitly archived/deleted) |
| **Reusability** | Reusable by multiple students |
| **Versioning** | Explicit versioning managed by instructors |
| **Publishing lifecycle** | Draft → Published workflow |
| **Storage** | PostgreSQL (course/module/lesson records) + Object Storage (assets) |
| **Embedding** | Published content is embedded into pgvector for RAG retrieval |
| **Skill taxonomy** | Manually tagged by instructors |
| **Appears in** | Course catalog, student enrollments |

### 4.2 AI-Generated Personalized Course

| Property | Value |
|---|---|
| **Owner / Orchestrator** | Module 6 — Adaptive Learning & Remediation |
| **Created by** | AI generation pipeline (Module 6, using LLM) |
| **Trigger** | Weakness profile from TestGraded event |
| **Persistence** | Lifecycle-bound (active during remediation cycle; archivable after completion) |
| **Reusability** | Student-specific; not shared between students |
| **Versioning** | Linked to the generating assessment version and weakness profile |
| **Publishing lifecycle** | Generated → Validated → Available → In Progress → Completed → Archived |
| **Storage** | PostgreSQL (plan metadata, module/lesson records, progress) + optionally Object Storage for large generated assets |
| **Embedding** | NOT automatically added to the pgvector production knowledge base |
| **Skill taxonomy** | Derived from the weakness profile (inherited from Module 5 assessment data) |
| **Appears in** | Student's adaptive learning panel in Module 4 (not the general course catalog) |

**Critical rule:** A `PersonalizedLearningPlan` must never be automatically promoted to a Module 2 LMS course. It is a remediation artifact, not a curriculum artifact. If an instructor wishes to incorporate AI-generated remedial content into the permanent course catalog, that is a deliberate editorial action outside the scope of the automated adaptive pipeline.

**Why this separation matters:**

- Module 2's pgvector index should contain only published, reviewed, authoritative course content. Feeding auto-generated remedial content into it would corrupt the RAG retrieval quality for future assessments.
- The normal course catalog must not be polluted with student-specific, transient artifacts.
- Module 6 must be able to manage the lifecycle of personalized content (archiving, expiry, deletion) independently without affecting the Module 2 content library.

---

## 5. Personalized Course Generation Pipeline

### 5.1 Pipeline Overview

```
INPUT: WeaknessProfile (from Module 6 weakness detection)
       + SourceAssessmentResult (from Module 5)
       + OriginalCourseContext (from Module 2 — skill taxonomy, course metadata)
       + Relevant approved content chunks (retrieved from pgvector)

STAGE 1: Skill Score Extraction
STAGE 2: Weakness Identification & Prioritization
STAGE 3: Learning Objective Generation
STAGE 4: Relevant Knowledge Retrieval (RAG)
STAGE 5: Personalized Course Outline Generation
STAGE 6: Module Generation
STAGE 7: Lesson & Content Generation
STAGE 8: Validation
STAGE 9: Persistence
STAGE 10: Notification & Delivery

OUTPUT: PersonalizedLearningPlan (persisted in PostgreSQL, surfaced via Module 4)
```

### 5.2 Stage Definitions

---

#### Stage 1 — Skill Score Extraction

| Field | Value |
|---|---|
| **Input** | TestGraded event payload; assessment result record from PostgreSQL |
| **Processing** | Read per-skill scores from the structured performance evidence produced by Module 5 |
| **Output** | Ordered list of `{skill_id, skill_name, score, mastery_threshold, status}` |
| **Owner** | Module 6 |
| **Persistence** | Scores already persisted by Module 5; no new write required at this stage |
| **Failure handling** | If assessment result is not found in PostgreSQL, job fails with `ASSESSMENT_RESULT_NOT_FOUND`; retry after delay |

---

#### Stage 2 — Weakness Identification and Prioritization

| Field | Value |
|---|---|
| **Input** | Skill scores from Stage 1 |
| **Processing** | Filter skills below mastery threshold; classify by severity (Critical/Moderate/Borderline); order by priority (Critical first, then by score ascending) |
| **Output** | `WeaknessProfile` — ordered list of weak skills with severity and priority rank |
| **Owner** | Module 6 |
| **Persistence** | `WeaknessProfile` persisted to PostgreSQL |
| **Failure handling** | Deterministic computation; no external dependencies; failures indicate data integrity issues |

---

#### Stage 3 — Learning Objective Generation

| Field | Value |
|---|---|
| **Input** | WeaknessProfile; skill taxonomy; original course metadata |
| **Processing** | For each weak skill, generate 2–4 learning objectives that the personalized course should achieve. LLM is used for objective formulation, grounded by the skill taxonomy definition. |
| **Output** | `LearningObjective` records per weak skill |
| **Owner** | Module 6 |
| **Persistence** | LearningObjectives persisted to PostgreSQL |
| **Failure handling** | LLM timeout or invalid output → retry up to 3 times with exponential backoff; if all retries fail, generation job enters `FAILED` state |

---

#### Stage 4 — Relevant Knowledge Retrieval (RAG)

| Field | Value |
|---|---|
| **Input** | Weak skill IDs and learning objectives |
| **Processing** | Semantic search query against pgvector using skill-context embeddings. Retrieve top-N relevant content chunks from the original course (or the broader approved content library if configured). Filter out content chunks that are not relevant to the identified weak skills. |
| **Output** | List of relevant content chunks `{chunk_id, content_text, skill_tags, source_lesson_id}` |
| **Owner** | Module 6 (retrieval orchestration); pgvector (retrieval) |
| **Persistence** | Retrieved chunks are used as LLM context; chunk IDs are stored as generation metadata references |
| **Failure handling** | If retrieval returns insufficient content chunks for a skill, generation proceeds with available context and flags the lesson as `LOW_GROUNDING_CONFIDENCE` in metadata |

---

#### Stage 5 — Personalized Course Outline Generation

| Field | Value |
|---|---|
| **Input** | WeaknessProfile; LearningObjectives; retrieved content chunks |
| **Processing** | LLM generates a structured course outline: number of modules, module titles, module-to-skill mapping, lesson count per module, lesson titles and objectives. Output is requested in structured JSON format. |
| **Output** | Course outline JSON: `{modules: [{title, skill_id, lessons: [{title, objective}]}]}` |
| **Owner** | Module 6 |
| **Persistence** | Outline is validated and used as the scaffold for Stage 6; not persisted independently |
| **Failure handling** | Schema validation on LLM output; if output does not conform to expected JSON schema, retry with corrective prompt |

---

#### Stage 6 — Module Generation

| Field | Value |
|---|---|
| **Input** | Course outline; skill context; learning objectives |
| **Processing** | For each module in the outline, create a `PersonalizedModule` record with title, target skill(s), and module-level learning objective |
| **Output** | `PersonalizedModule` records |
| **Owner** | Module 6 |
| **Persistence** | Persisted to PostgreSQL |
| **Failure handling** | Partial module creation is tracked; failed modules are flagged; generation job can resume from last successful module |

---

#### Stage 7 — Lesson and Content Generation

| Field | Value |
|---|---|
| **Input** | PersonalizedModule; relevant content chunks (from Stage 4); LearningObjectives |
| **Processing** | For each lesson: LLM generates lesson body content (explanation, examples, practice items). Content is grounded by the retrieved chunks. LLM is instructed to: cite the course material, not invent facts outside the retrieved context, produce content in structured Markdown, include at most one short knowledge check per lesson. |
| **Output** | `PersonalizedLesson` + `GeneratedContent` records per lesson |
| **Owner** | Module 6 |
| **Persistence** | Lesson content persisted to PostgreSQL (for typical text content). Large generated assets (e.g., PDF summaries if generated) go to Object Storage. |
| **Failure handling** | Per-lesson generation failures are isolated; a failed lesson is marked `GENERATION_FAILED` and generation continues for other lessons. A personalized course with < 50% lesson generation success is marked `PARTIALLY_GENERATED` and may be rejected by the validation stage. |

---

#### Stage 8 — Validation

| Field | Value |
|---|---|
| **Input** | All generated PersonalizedModules and PersonalizedLessons |
| **Processing** | Apply validation checks (see Section 17 for full safety/quality rules): skill alignment, completeness, grounding, no unsafe content, schema conformity, no duplicate lesson content. |
| **Output** | Validation result: `PASS`, `PARTIAL_PASS`, or `FAIL` with flagged items |
| **Owner** | Module 6 |
| **Persistence** | Validation result and any flagged issues stored as `GenerationMetadata` |
| **Failure handling** | `FAIL` → generation job enters `VALIDATION_FAILED` state; system may attempt regeneration of failed items or alert platform administrators. `PARTIAL_PASS` → flagged lessons are excluded; remaining valid lessons are delivered. |

---

#### Stage 9 — Persistence

| Field | Value |
|---|---|
| **Processing** | The complete `PersonalizedLearningPlan` is written to PostgreSQL in a single transaction: plan record, module records, lesson records, content records, learning objectives, generation metadata, source references. |
| **Output** | `PersonalizedLearningPlan` with status `AVAILABLE` |
| **Owner** | Module 6 |
| **Persistence** | Full plan persisted; lifecycle state initialized to `AVAILABLE` |
| **Failure handling** | Transaction rollback on failure; generation job retried from persistence stage |

---

#### Stage 10 — Notification and Delivery

| Field | Value |
|---|---|
| **Processing** | Module 6 notifies Module 4 that the personalized plan is available. A notification is delivered to the student (in-app, or via configured notification channel). The student's adaptive panel in Module 4 updates to show the personalized course. |
| **Output** | Student-visible personalized course in Module 4 |
| **Owner** | Module 6 (notification trigger); Module 4 (display) |
| **Failure handling** | Notification failure does not block course availability; plan is accessible via API even if notification is delayed |

---

## 6. AI / Agent Architecture

### 6.1 Logical AI Responsibilities

The adaptive learning pipeline requires several distinct AI reasoning tasks. These are defined as **logical responsibilities** — they may be implemented as individual service functions, workflow steps, or isolated LLM calls within a larger orchestration. They are **not** necessarily independent autonomous agents. Unnecessary agent proliferation adds operational complexity without proportionate benefit.

| # | Responsibility | Implementation Recommendation | Owner Module |
|---|---|---|---|
| 1 | **Assessment Generator** | Service function within Module 5; LLM call with RAG context | Module 5 |
| 2 | **Assessment Evaluator** | Service function within Module 5; deterministic for MCQ, LLM for open-ended | Module 5 |
| 3 | **Skill/Weakness Analyzer** | Service function within Module 6; primarily deterministic logic on skill scores | Module 6 |
| 4 | **Personalized Learning Designer** | Service function within Module 6; LLM call for outline and objective generation | Module 6 |
| 5 | **Learning Content Generator** | Service function within Module 6; LLM call per lesson, grounded by RAG | Module 6 |
| 6 | **Retest Generator** | Service function within Module 5; LLM call with weakness + original assessment context | Module 5 |
| 7 | **Performance Comparison Analyzer** | Service function within Module 6; deterministic comparison of structured score data | Module 6 |

### 6.2 Orchestration Flow

```
[TestGraded Event received by Module 6]
        │
        ▼
[3. Skill/Weakness Analyzer]
   Input: Skill scores from Module 5 performance evidence
   Output: WeaknessProfile
        │
        ▼
[4. Personalized Learning Designer]
   Input: WeaknessProfile + skill taxonomy + original course context
   Output: Course outline + LearningObjectives
        │
        ▼
[RAG Retrieval from pgvector]
   Input: Weak skill context
   Output: Relevant content chunks
        │
        ▼
[5. Learning Content Generator] (per lesson, parallelizable)
   Input: Lesson objective + content chunks
   Output: Generated lesson content
        │
        ▼
[Validation]
        │
        ▼
[PersonalizedLearningPlan → AVAILABLE]
        │
        ▼
[Student completes personalized course]
        │
        ▼
[6. Retest Generator]
   Input: WeaknessProfile + original assessment ref + personalized course ref
   Output: Focused retest assessment
        │
        ▼
[2. Assessment Evaluator]
   Input: Retest submission
   Output: Retest performance evidence + TestGraded event
        │
        ▼
[7. Performance Comparison Analyzer]
   Input: Original assessment scores + Retest scores
   Output: ImprovementReport
```

### 6.3 What Is Not a Separate Agent

The following do NOT require separate agent abstractions:

- Notification delivery (standard application event)
- Progress tracking (standard database state management)
- Session management (Module 1 / infrastructure concern)
- Content retrieval (pgvector query — not an AI reasoning task)

---

## 7. Personalized Course Data Model

> **Note:** This is a conceptual data model. Exact column types, indexes, and constraints are defined in the Module 6 data specification. All entities described here are proposed additions to the platform's data model.

### 7.1 Entity Overview

```
PersonalizedLearningPlan
    │── WeaknessProfile
    │── PersonalizedModule (1..N)
    │       └── PersonalizedLesson (1..N)
    │               └── GeneratedContent (1..N)
    │               └── LearningObjective (1..N)
    │── RemediationProgress
    │── RetestReference
    └── GenerationMetadata
```

---

### 7.2 Entity Definitions

#### `PersonalizedLearningPlan`

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `student_id` | UUID (FK → users) | The student this plan belongs to |
| `source_assessment_id` | UUID (FK → assessments) | The original assessment that triggered this plan |
| `source_test_graded_event_id` | UUID | Reference to the originating TestGraded event |
| `weakness_profile_id` | UUID (FK → WeaknessProfile) | The weakness profile this plan addresses |
| `status` | Enum | Plan lifecycle status (see Section 8) |
| `generated_at` | Timestamp | When generation completed |
| `available_at` | Timestamp | When made available to student |
| `completed_at` | Timestamp | When student completed all lessons |
| `expires_at` | Timestamp | Optional: when the plan should be archived |
| `generation_metadata_id` | UUID (FK → GenerationMetadata) | Generation audit trail |
| `retest_reference_id` | UUID (FK → RetestReference) | Null until retest is triggered |

**Lifecycle:** Created per assessment cycle per student. Archived after retest completion and improvement analysis. Must never be deleted; retained for audit and improvement tracking.

---

#### `WeaknessProfile`

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `student_id` | UUID | Student reference |
| `assessment_id` | UUID | Source assessment |
| `weak_skills` | JSONB | Array of `{skill_id, skill_name, score, severity, rank}` |
| `overall_score` | Decimal | Overall assessment score |
| `analysis_version` | String | Version of the weakness analysis logic used |
| `created_at` | Timestamp | When analysis was performed |

**Lifecycle:** Persisted at creation; read-only after creation. Referenced by the PersonalizedLearningPlan and the ImprovementReport.

---

#### `PersonalizedModule`

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `plan_id` | UUID (FK → PersonalizedLearningPlan) | Parent plan |
| `title` | String | Module title |
| `target_skill_id` | UUID (FK → skills) | Primary skill this module addresses |
| `sequence_order` | Integer | Display order within the plan |
| `status` | Enum | `PENDING`, `IN_PROGRESS`, `COMPLETED` |

**Lifecycle:** Created during generation; status updated as student progresses; archived with parent plan.

---

#### `PersonalizedLesson`

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `module_id` | UUID (FK → PersonalizedModule) | Parent module |
| `title` | String | Lesson title |
| `sequence_order` | Integer | Order within module |
| `status` | Enum | `PENDING`, `IN_PROGRESS`, `COMPLETED`, `GENERATION_FAILED` |
| `source_chunk_ids` | UUID[] | pgvector chunk IDs used as RAG source for this lesson |
| `grounding_confidence` | Enum | `HIGH`, `MEDIUM`, `LOW` (set during validation) |
| `completed_at` | Timestamp | When student completed this lesson |

---

#### `GeneratedContent`

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `lesson_id` | UUID (FK → PersonalizedLesson) | Parent lesson |
| `content_type` | Enum | `EXPLANATION`, `EXAMPLE`, `PRACTICE`, `KNOWLEDGE_CHECK` |
| `content_body` | Text | Generated Markdown content |
| `sequence_order` | Integer | Order within lesson |
| `model_id` | String | LLM model identifier used for generation |
| `prompt_template_version` | String | Version of the prompt template used |
| `generated_at` | Timestamp | Generation timestamp |

**Lifecycle:** Generated once; not modified after validation. Retained for audit purposes.

---

#### `LearningObjective`

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `plan_id` | UUID | Parent plan |
| `skill_id` | UUID | Target skill |
| `objective_text` | String | Human-readable learning objective |
| `sequence_order` | Integer | Priority order |

---

#### `RemediationProgress`

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `plan_id` | UUID | Parent plan |
| `student_id` | UUID | Student |
| `modules_total` | Integer | Total modules in plan |
| `modules_completed` | Integer | Modules completed by student |
| `lessons_total` | Integer | Total lessons |
| `lessons_completed` | Integer | Lessons completed |
| `last_activity_at` | Timestamp | Last student activity in the plan |
| `completion_percentage` | Decimal | Computed progress percentage |

---

#### `RetestReference`

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `plan_id` | UUID | Source plan |
| `original_assessment_id` | UUID | The initial assessment (pre-remediation) |
| `retest_assessment_id` | UUID | The generated retest assessment |
| `triggered_at` | Timestamp | When retest was triggered |
| `completed_at` | Timestamp | When student completed the retest |
| `improvement_report_id` | UUID (FK → ImprovementReport) | Link to the resulting report |

---

#### `GenerationMetadata`

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `plan_id` | UUID | Parent plan |
| `job_id` | UUID | Background job identifier |
| `model_id` | String | LLM model used for generation |
| `prompt_template_version` | String | Prompt version |
| `retrieval_query_context` | JSONB | Skill IDs and query parameters used for pgvector retrieval |
| `chunk_ids_used` | UUID[] | Content chunk IDs used as RAG context |
| `generation_duration_ms` | Integer | Total generation time |
| `validation_status` | Enum | `PASS`, `PARTIAL_PASS`, `FAIL` |
| `validation_flags` | JSONB | Any quality/safety flags raised |
| `created_at` | Timestamp | Generation job start time |

**Must persist:** This record is the audit trail for AI generation. It must be retained even after the plan is archived.

---

#### `ImprovementReport`

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `student_id` | UUID | Student |
| `plan_id` | UUID | Source personalized plan |
| `original_assessment_id` | UUID | Pre-remediation assessment |
| `retest_assessment_id` | UUID | Post-remediation retest |
| `original_overall_score` | Decimal | Overall score before remediation |
| `retest_overall_score` | Decimal | Overall score after retest |
| `overall_improvement` | Decimal | Computed: `retest_overall_score − original_overall_score` |
| `skill_comparisons` | JSONB | Array of `{skill_id, original_score, retest_score, improvement, mastery_achieved}` |
| `skills_mastered` | UUID[] | Skill IDs now above mastery threshold |
| `skills_still_weak` | UUID[] | Skill IDs still below mastery threshold |
| `recommended_next_step` | Enum | `ADVANCE`, `ADDITIONAL_REMEDIATION`, `INSTRUCTOR_REVIEW` |
| `generated_at` | Timestamp | When report was created |

---

### 7.3 Persistence Classification

| Entity | Must Persist | Can Cache/Temp |
|---|---|---|
| PersonalizedLearningPlan | ✅ Yes | — |
| WeaknessProfile | ✅ Yes | — |
| PersonalizedModule | ✅ Yes | — |
| PersonalizedLesson | ✅ Yes | — |
| GeneratedContent | ✅ Yes (text content) | Large binary assets → Object Storage |
| LearningObjective | ✅ Yes | — |
| RemediationProgress | ✅ Yes | Progress cache in Redis (invalidate on write) |
| RetestReference | ✅ Yes | — |
| GenerationMetadata | ✅ Yes (audit) | — |
| ImprovementReport | ✅ Yes | — |
| LLM chain-of-thought / internal reasoning | ❌ Never persist | Discard after structured output extracted |

---

## 8. Personalized Course Lifecycle

### 8.1 Lifecycle States

```
GENERATING
    ↓
VALIDATION_FAILED  ← (if validation fails after generation)
    ↓
AVAILABLE          ← (plan is ready; student has not started)
    ↓
IN_PROGRESS        ← (student has started at least one lesson)
    ↓
COMPLETED          ← (all valid lessons completed by student)
    ↓
RETEST_PENDING     ← (retest triggered, not yet attempted)
    ↓
RETEST_IN_PROGRESS ← (student started retest)
    ↓
RETEST_COMPLETED   ← (student submitted retest)
    ↓
EVALUATED          ← (improvement report generated)
    ↓
ARCHIVED           ← (plan retained for audit; no longer active)
```

Also valid:

```
GENERATING → GENERATION_FAILED  (generation pipeline failure)
IN_PROGRESS → ABANDONED         (student shows no activity beyond configurable timeout)
```

### 8.2 Edge Case Handling

| Scenario | System Behavior |
|---|---|
| **AI generation fails** | Generation job enters `GENERATION_FAILED` state. System retries up to 3 times with exponential backoff. If all retries fail, student is notified that their personalized plan is being prepared and an alert is raised for platform review. |
| **Content validation fails** | If `PARTIAL_PASS`: valid lessons are delivered, failed lessons excluded, student is informed content for certain topics is limited. If `FAIL`: plan is not delivered; generation is retried or escalated. |
| **Student abandons the course** | Plan enters `ABANDONED` state after configurable inactivity timeout. Progress is preserved; student may resume if plan has not expired. |
| **Student partially completes** | `RemediationProgress` reflects exact completion state. Retest is not triggered until 100% lesson completion (or a configurable threshold). |
| **Retest generation fails** | `RetestReference` status set to `RETEST_GENERATION_FAILED`. Student is notified; system retries retest generation. Manual fallback: instructor can assign a standard assessment. |
| **Student does not improve** | System detects no significant improvement (defined threshold: < 10pp overall, or critical skills still below mastery). `recommended_next_step` in ImprovementReport is set to `ADDITIONAL_REMEDIATION` or `INSTRUCTOR_REVIEW`. A new remediation cycle may be initiated or escalated to instructor. |
| **Student improves significantly** | Mastery achieved on all previously weak skills. `recommended_next_step` set to `ADVANCE`. Learning path advances. No further remediation cycle for these skills in this course context. |
| **Student still has weaknesses after retest** | Skills still below mastery threshold are listed in `skills_still_weak`. Recommended next step is determined by severity. The system may generate a second remediation plan for remaining weaknesses or escalate to instructor review based on platform configuration. |

---

## 9. Retest Architecture

### 9.1 Retest Trigger

The retest is triggered by Module 6 when `RemediationProgress.completion_percentage` reaches the configured completion threshold (default: 100%). Module 6 makes an API call to Module 5 to initiate focused retest generation.

### 9.2 Retest Generation Inputs

Module 5 receives the following context for retest generation:

- `WeaknessProfile` — the skill IDs and severity levels identified from the original assessment.
- `original_assessment_id` — reference to the original assessment, used to:
  - Avoid regenerating identical questions (question IDs from original assessment are passed as an exclusion list).
  - Calibrate difficulty (retest questions should match or slightly exceed the difficulty of original questions on the same skill).
- `personalized_plan_id` — reference to the completed personalized course (used to align retest topics with what was taught in the plan).
- Skill taxonomy for the relevant skills.

### 9.3 Retest Generation Logic

1. Only weak skills (from `WeaknessProfile`) are targeted. Skills where mastery was demonstrated in the original assessment are not retested.
2. Semantic retrieval from pgvector uses the weak skill context (same approved content base as original assessment).
3. LLM generates new questions on the same skills — different from the original questions but at equivalent or slightly higher difficulty.
4. Question type distribution mirrors the original assessment where possible (MCQ / short-answer ratio).
5. The retest is shorter than the original assessment — focused only on the weak skill subset.
6. Generated retest is versioned, stored in PostgreSQL, and linked via `RetestReference`.

### 9.4 Retest Delivery and Evaluation

- Delivered to student through Module 4, clearly labeled as a focused retest.
- Evaluated by Module 5 using the same deterministic + LLM evaluation pipeline as the original assessment.
- Skill scores produced at the same granularity as the original assessment for direct comparison.
- `TestGraded` event emitted with `assessment_type: RETEST` and `original_assessment_id` included in the payload.

---

## 10. Performance Comparison

### 10.1 Comparison Trigger

Module 6 consumes the `TestGraded` event for the retest (identified by `assessment_type: RETEST` and the presence of `original_assessment_id` in the payload). It retrieves the original assessment performance evidence and the retest performance evidence and performs a structured comparison.

### 10.2 Comparison Dimensions

#### Overall Score

```
overall_improvement = retest_overall_score − original_overall_score
```

Reports the raw score delta. Does not indicate whether a student passed or failed in absolute terms; it indicates directional change.

#### Skill-Level Comparison

For each skill in the WeaknessProfile:

```
skill_improvement[skill_id] = retest_skill_score[skill_id] − original_skill_score[skill_id]
mastery_achieved[skill_id]  = retest_skill_score[skill_id] >= mastery_threshold
```

#### Mastery Classification (per skill)

| Status | Condition |
|---|---|
| **Mastered** | Retest score ≥ mastery threshold AND was below threshold originally |
| **Improved — Not Yet Mastered** | Retest score > original score, still below threshold |
| **Unchanged** | Retest score within ±5pp of original score |
| **Regressed** | Retest score < original score |

#### Edge Case: Overall Improvement with Remaining Specific Weakness

A student may show overall score improvement while one particular skill remains below mastery. The comparison logic must identify this case explicitly:

```
IF overall_improvement > 0 AND EXISTS (skill WHERE mastery_achieved = false):
    → ImprovementReport.skills_still_weak is non-empty
    → recommended_next_step = ADDITIONAL_REMEDIATION (for those skills)
    → Overall improvement is still reported and communicated to the student
```

The report should not mask partial success — if a student improved in 3 of 4 weak skills, all 4 outcomes should be clearly communicated.

### 10.3 Improvement Thresholds

> **Architectural Proposal:** The following thresholds are proposed defaults. Exact values should be confirmed during Module 6 specification and may be configurable at the platform or course level.

| Label | Condition |
|---|---|
| Significant Improvement | overall_improvement ≥ 20pp |
| Moderate Improvement | overall_improvement 10–19pp |
| Marginal Improvement | overall_improvement 1–9pp |
| No Improvement | overall_improvement ≤ 0 |

---

## 11. Improvement Report

### 11.1 Report Contents

The improvement report is produced by Module 6 and surfaced to the student through Module 4 after retest evaluation is complete.

**Student-visible content:**

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR IMPROVEMENT REPORT                                        │
├─────────────────────────────────────────────────────────────────┤
│  Course: [Original Course Name]                                 │
│  Completed: [Date]                                              │
├─────────────────────────────────────────────────────────────────┤
│  OVERALL PERFORMANCE                                            │
│  Previous Score:     62%                                        │
│  New Score:          81%                                        │
│  Overall Improvement: +19%                                      │
├─────────────────────────────────────────────────────────────────┤
│  SKILL RESULTS                                                  │
│                                                                 │
│  ✅ Recursion          42% → 81%  (+39%)  MASTERED             │
│  ✅ Error Handling     55% → 76%  (+21%)  MASTERED             │
│  ✅ Functions          85% → 88%  (+3%)   (Previously strong)  │
│  ⚠️  Loops             78% → 70%  (-8%)   NEEDS ATTENTION      │
├─────────────────────────────────────────────────────────────────┤
│  SKILLS MASTERED:     Recursion, Error Handling                 │
│  STILL NEEDS WORK:    Loops                                     │
├─────────────────────────────────────────────────────────────────┤
│  RECOMMENDED NEXT STEP                                          │
│  You've made strong progress! A short focused module on Loops   │
│  has been prepared for you.                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Report Rules

- **Never expose** LLM chain-of-thought, internal evaluation reasoning, or raw prompts.
- **Never expose** skill mastery threshold values or internal classification labels.
- Use plain, student-friendly language.
- Report must be understandable without platform knowledge.
- Report must be deterministically derived from persisted score data — it must not regenerate LLM content each time it is viewed.
- Report is stored as a structured `ImprovementReport` record; the display is rendered by Module 4 from the stored record.

---

## 12. Module Responsibilities

### 12.1 Responsibility Matrix

| Responsibility | M1 | M2 | M3 | M4 | M5 | M6 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| User authentication & access control | ✅ | | | | | |
| Course and content management | | ✅ | | | | |
| Skill taxonomy definition | | ✅ | | | | |
| Content embedding pipeline | | ✅ | | | | |
| Live class scheduling | | | ✅ | | | |
| Student dashboard & experience | | | | ✅ | | |
| Personalized course display | | | | ✅ | | |
| Assessment delivery to student | | | | ✅ | | |
| Improvement report display | | | | ✅ | | |
| Initial assessment generation | | | | | ✅ | |
| MCQ deterministic grading | | | | | ✅ | |
| Open-ended LLM evaluation | | | | | ✅ | |
| Skill score computation | | | | | ✅ | |
| Performance evidence persistence | | | | | ✅ | |
| TestGraded event emission | | | | | ✅ | |
| Retest generation | | | | | ✅ | |
| Retest evaluation | | | | | ✅ | |
| TestGraded event consumption | | | | | | ✅ |
| Weakness analysis | | | | | | ✅ |
| WeaknessProfile creation | | | | | | ✅ |
| Personalized course generation | | | | | | ✅ |
| PersonalizedLearningPlan lifecycle | | | | | | ✅ |
| Retest trigger | | | | | | ✅ |
| Performance comparison | | | | | | ✅ |
| ImprovementReport generation | | | | | | ✅ |
| Adaptive learning decisions | | | | | | ✅ |

### 12.2 Detailed Module Notes

**Module 2 — Course & Content Management:**
Provides the approved course content and skill taxonomy that are the foundational inputs for the entire assessment and adaptive pipeline. Must not be modified by Module 6. The content library is a read source for Module 6 retrieval; it is never a write target for AI-generated content.

**Module 4 — Student Experience & Dashboard:**
Renders all student-facing aspects of the adaptive learning flow: assessment UI, personalized course lessons, progress indicators, and the improvement report. Does not own any business logic for generation, evaluation, or comparison. Receives structured data from Module 5 and Module 6 APIs and renders it.

**Module 5 — AI Assessment & Evaluation:**
Owns the full assessment generation and evaluation pipeline for both the initial assessment and the focused retest. The `TestGraded` event is Module 5's primary output interface. Module 5 does not own weakness analysis, personalized course generation, or improvement comparison.

**Module 6 — Adaptive Learning & Remediation:**
Owns the entire adaptive loop from weakness detection through personalized course generation, retest triggering, improvement comparison, and report generation. Module 6 is the orchestrator of the new architecture introduced in this document. It consumes Module 5's outputs and feeds guidance back to Module 4.

---

## 13. Event-Driven Flow

### 13.1 Event Architecture Overview

```
ASSESSMENT SUBMITTED (Student → Module 4 → Module 5 API)
        │
        ▼
[Module 5: Evaluate]
        │
        ▼
TestGraded Event published → Message Broker
{
  event_type: "TestGraded",
  assessment_type: "INITIAL" | "RETEST",
  event_id: UUID,
  student_id: UUID,
  assessment_id: UUID,
  original_assessment_id: UUID | null,  // populated for RETEST type
  skill_scores: [{skill_id, score, mastery_threshold}],
  overall_score: Decimal,
  timestamp: ISO8601,
  idempotency_key: UUID
}
        │
        ▼
[Module 6: Consume TestGraded Event]
        │
        ├──► IF assessment_type = INITIAL:
        │         Weakness Analysis
        │         → PersonalizedLearningPlan generation (background job)
        │         → Plan AVAILABLE → Module 4 notification
        │
        └──► IF assessment_type = RETEST:
                  Performance Comparison
                  → ImprovementReport generation
                  → Module 4 notification

[Student completes PersonalizedLearningPlan]
        │
        ▼
RemediationCompleted Event published → Message Broker
{
  event_type: "RemediationCompleted",
  plan_id: UUID,
  student_id: UUID,
  timestamp: ISO8601,
  idempotency_key: UUID
}
        │
        ▼
[Module 6: Consume RemediationCompleted]
        │
        ▼
[Module 6 → Module 5 API: Trigger Retest]
        │
        ▼
[Retest assessment generated and delivered via Module 4]
```

### 13.2 Idempotency

- Every event includes an `idempotency_key` (UUID).
- Consumers check whether the `idempotency_key` has already been processed (stored in PostgreSQL as a processed event log or in Redis for short-term deduplication).
- Duplicate events are acknowledged and discarded without reprocessing.
- Generation jobs are keyed by `(student_id, assessment_id)` — a duplicate job submission for the same key is a no-op if the job is already in progress or completed.

### 13.3 Event Delivery Guarantees

- Message broker provides at-least-once delivery.
- Consumers are idempotent by design.
- Failed event processing: consumer returns a NACK (negative acknowledgment); the broker redelivers after a configurable delay.
- Dead letter handling: after a configurable number of redelivery attempts, the event is moved to a Dead Letter Queue (DLQ) for manual inspection and alerting.

---

## 14. API / Contract Impact

> **Note:** All endpoints marked `[PROPOSED]` are new additions introduced by this architecture. They are not present in the existing Base SDD. Exact request/response schemas are defined in the API documentation; this section defines purpose, ownership, and behavior.

### 14.1 Existing APIs (Unaffected)

The following existing API areas are not modified by this architecture:

- Auth / session endpoints (Module 1)
- Course and content CRUD (Module 2)
- Live class scheduling (Module 3)
- Existing assessment generation and submission endpoints (Module 5)

### 14.2 New / Extended APIs

---

#### `GET /adaptive/plans/{student_id}/active` `[PROPOSED]`

| Field | Value |
|---|---|
| **Purpose** | Retrieve the student's currently active PersonalizedLearningPlan |
| **Owner** | Module 6 |
| **Auth** | JWT required; student can only access their own plan |
| **Response** | Plan metadata, module list, overall progress, status |
| **Error cases** | 404 if no active plan; 403 if student_id does not match token |

---

#### `GET /adaptive/plans/{plan_id}/modules` `[PROPOSED]`

| Field | Value |
|---|---|
| **Purpose** | Retrieve all modules within a PersonalizedLearningPlan |
| **Owner** | Module 6 |
| **Auth** | JWT; student must own the plan |
| **Response** | Ordered list of PersonalizedModules with lesson counts and completion status |

---

#### `GET /adaptive/plans/{plan_id}/modules/{module_id}/lessons/{lesson_id}` `[PROPOSED]`

| Field | Value |
|---|---|
| **Purpose** | Retrieve a specific lesson and its generated content |
| **Owner** | Module 6 |
| **Auth** | JWT; student must own the plan |
| **Response** | Lesson metadata + ordered GeneratedContent blocks |
| **Error cases** | 403 if ownership mismatch; 404 if lesson not found or in GENERATION_FAILED state |

---

#### `POST /adaptive/plans/{plan_id}/lessons/{lesson_id}/complete` `[PROPOSED]`

| Field | Value |
|---|---|
| **Purpose** | Mark a personalized lesson as completed by the student |
| **Owner** | Module 6 |
| **Auth** | JWT; student must own the plan |
| **Processing** | Updates `PersonalizedLesson.status` to `COMPLETED`; updates `RemediationProgress`; checks if all lessons complete and emits `RemediationCompleted` event if so |
| **Response** | Updated progress state |
| **Error cases** | 409 if already completed (idempotent — return current state); 403 ownership |

---

#### `GET /adaptive/plans/{plan_id}/progress` `[PROPOSED]`

| Field | Value |
|---|---|
| **Purpose** | Retrieve current remediation progress for a plan |
| **Owner** | Module 6 |
| **Auth** | JWT; student must own the plan |
| **Response** | RemediationProgress record |

---

#### `POST /adaptive/plans/{plan_id}/retest/trigger` `[PROPOSED]`

| Field | Value |
|---|---|
| **Purpose** | Trigger focused retest generation (called internally by Module 6 after RemediationCompleted; may also be exposed for instructor-initiated override) |
| **Owner** | Module 6 (trigger); Module 5 (execution) |
| **Auth** | Internal service call or instructor JWT |
| **Processing** | Validates plan is in COMPLETED state; creates RetestReference; calls Module 5 retest generation API |
| **Error cases** | 409 if retest already triggered; 400 if plan not yet completed |

---

#### `GET /adaptive/reports/{student_id}/latest` `[PROPOSED]`

| Field | Value |
|---|---|
| **Purpose** | Retrieve the most recent ImprovementReport for a student |
| **Owner** | Module 6 (data); Module 4 (display) |
| **Auth** | JWT; student or instructor with access |
| **Response** | ImprovementReport record with skill comparisons |

---

#### `GET /adaptive/reports/{report_id}` `[PROPOSED]`

| Field | Value |
|---|---|
| **Purpose** | Retrieve a specific ImprovementReport by ID |
| **Owner** | Module 6 |
| **Auth** | JWT; student must own the report or be an authorized instructor |

---

### 14.3 Modified Events

The `TestGraded` event payload is extended with:

```json
{
  "assessment_type": "INITIAL | RETEST",
  "original_assessment_id": "UUID | null",
  "plan_id": "UUID | null"
}
```

These are additive fields. Existing consumers that do not use them are unaffected.

---

## 15. Storage Architecture

### 15.1 PostgreSQL — System of Record

All durable, authoritative data for the adaptive learning pipeline is stored in PostgreSQL:

| Data | Table / Entity |
|---|---|
| Student identity and roles | Module 1 tables |
| Original course and content | Module 2 tables |
| Assessment definitions | Module 5 tables |
| Assessment submissions | Module 5 tables |
| Performance evidence (skill scores) | Module 5 tables |
| WeaknessProfile | Module 6 — `weakness_profiles` |
| PersonalizedLearningPlan | Module 6 — `personalized_learning_plans` |
| PersonalizedModule | Module 6 — `personalized_modules` |
| PersonalizedLesson | Module 6 — `personalized_lessons` |
| GeneratedContent (text) | Module 6 — `generated_content` |
| LearningObjective | Module 6 — `learning_objectives` |
| RemediationProgress | Module 6 — `remediation_progress` |
| RetestReference | Module 6 — `retest_references` |
| GenerationMetadata | Module 6 — `generation_metadata` |
| ImprovementReport | Module 6 — `improvement_reports` |
| Processed event log (idempotency) | Module 6 — `processed_events` |

### 15.2 Object Storage (S3-Compatible)

| Data | Storage Target |
|---|---|
| Original course PDFs, videos, images | Object storage (managed by Module 2) |
| AI-generated PDF summaries (if produced) | Object storage (managed by Module 6); URL stored in PostgreSQL |
| Live class recordings | Object storage (managed by Module 3) |

**Rule:** AI-generated large binary assets reference the object storage URL stored in PostgreSQL. They are not inlined in the PostgreSQL text column.

### 15.3 Redis — Cache and Transient Data

| Use | Approach |
|---|---|
| RemediationProgress cache | Cache keyed by `plan_id`; invalidated on every lesson completion write |
| Generation job status | Job status and polling state during async generation |
| Session / JWT | Existing auth session management (Module 1 pattern) |
| Rate limiting | API rate limit counters |

**Rule:** Redis is never the permanent source of truth for personalized learning data. PostgreSQL is authoritative. Redis holds derived or transient state only.

### 15.4 pgvector — Vector Store

| Use | Rule |
|---|---|
| Published course content embeddings | ✅ Produced by Module 2 embedding pipeline; used as RAG source for Module 5 and Module 6 retrieval |
| AI-generated personalized course content | ❌ MUST NOT be embedded into pgvector production index |

Generated personalized content must not contaminate the production vector store. Only reviewed, published course content is a valid retrieval source.

---

## 16. RAG and Content Grounding

### 16.1 For Initial Assessment Generation (Module 5)

```
Published Course Content (PostgreSQL — Module 2)
        ↓ [async, at publish time]
Embedding Pipeline (background worker)
        ↓
Embeddings stored in pgvector
        ↓ [at assessment generation time]
Semantic query: skill context + course ID filter
        ↓
Relevant content chunks retrieved
        ↓
Assembled as RAG context
        ↓
Claude API: [system prompt] + [RAG context] + [skill taxonomy] + [assessment instructions]
        ↓
Generated assessment items (structured JSON)
        ↓
Validated → Stored → Versioned assessment
```

### 16.2 For Personalized Remediation Course Generation (Module 6)

```
WeaknessProfile (identified weak skills + scores)
        +
Student's assessment submission data (question-level detail)
        +
Semantic retrieval from pgvector:
    query = weak_skill_context + course_id filter
    result = relevant approved content chunks
        +
Learning objectives (generated in Stage 3)
        ↓
Claude API prompt:
    [system prompt with grounding instruction]
    [retrieved approved content chunks — primary grounding source]
    [learning objectives]
    [student weakness profile — for personalization]
    [output format schema]
        ↓
Generated lesson content (grounded in approved course material)
        ↓
Validation (grounding confidence check)
        ↓
Stored as GeneratedContent
```

### 16.3 Grounding Rule

The LLM must be instructed to:

- Base explanations and examples on the retrieved approved content chunks.
- Not introduce technical facts or claims that contradict or are unsupported by the retrieved course content.
- Acknowledge when it is generating an example (as opposed to citing the course material directly).

When retrieval returns insufficient content for a weak skill, the generation prompt must indicate this constraint explicitly. The resulting lesson content is flagged `LOW_GROUNDING_CONFIDENCE` in `GenerationMetadata`.

---

## 17. Safety, Quality, and Validation

All AI-generated content must pass the following validation checks before being made available to the student.

### 17.1 Validation Checks

| Check | Description | Action on Failure |
|---|---|---|
| **Skill alignment** | Generated content maps to the target skill(s) in the lesson | Flag lesson; attempt regeneration |
| **Source grounding** | Content is traceable to retrieved content chunks | Flag as LOW_GROUNDING_CONFIDENCE; include in partial pass |
| **Schema conformity** | LLM output conforms to expected JSON/Markdown schema | Retry with corrective prompt (up to 3 times) |
| **Content completeness** | Lesson has required sections (explanation, at least one example) | Flag as incomplete; attempt regeneration |
| **Hallucination check** | Factual claims in explanations are present in retrieved source chunks | Flag; human review recommended for flagged lessons |
| **Duplicate content detection** | Lesson content is not near-identical to another lesson in the same plan | Regenerate with explicit diversity instruction |
| **Difficulty alignment** | Content difficulty is appropriate for the remedial context | Soft check; flag if content appears too advanced or trivial |
| **Unsafe content filter** | Content does not contain inappropriate, harmful, or off-topic material | Reject lesson; do not deliver; log for review |
| **Assessment alignment** | Generated content addresses the actual questions/skills the student failed | Cross-check against WeaknessProfile |

### 17.2 Validation Result Actions

| Result | Action |
|---|---|
| `PASS` | Plan proceeds to AVAILABLE state; all lessons delivered |
| `PARTIAL_PASS` | Valid lessons delivered; failed lessons excluded; student informed of limited content in flagged areas |
| `FAIL` | Plan not delivered; generation retried or escalated to platform review |

---

## 18. Failure and Retry Strategy

### 18.1 Failure Scenarios and Handling

| Failure | Detection | Retry | Final Fallback |
|---|---|---|---|
| LLM API timeout | HTTP timeout / no response | Retry up to 3× with exponential backoff (1s, 3s, 9s) | Job enters FAILED; alert raised |
| LLM API rate limit | 429 response | Retry after backoff per provider guidance | Queue job for retry in next window |
| Invalid structured LLM output | Schema validation failure | Retry with corrective prompt | After 3 attempts, mark lesson GENERATION_FAILED |
| pgvector retrieval returns no chunks | Empty result set | Widen query scope; retry once | Flag skill as LOW_GROUNDING_CONFIDENCE; proceed with reduced context |
| PostgreSQL write failure | DB exception | Retry with transaction | If persistent: alert on-call; job enters FAILED |
| Event not delivered (broker) | No consumer ack | Broker redelivers (at-least-once) | After N attempts: DLQ + alert |
| Duplicate event received | Idempotency key check | Discard silently | — |
| Student disconnects mid-lesson | Progress saved at lesson completion boundary | Student resumes from last completed lesson | — |
| Partial course completion | Progress tracked per lesson | Retest not triggered until threshold reached | Configurable timeout → ABANDONED state |
| Retest generation fails | Same as assessment generation | Same retry pattern | Instructor notified; manual assessment assignment fallback |
| Generation job lost (worker crash) | Job heartbeat / status check | Job re-queued from last checkpoint | — |

### 18.2 Idempotency Keys

Every background generation job and every event consumer operation is keyed by a stable idempotency key:

- Generation jobs: `{student_id}:{assessment_id}:generation`
- Event processing: `{event_id}` (UUID from event payload)
- Lesson completion: `{lesson_id}:{student_id}`

Duplicate operations with the same key are no-ops if the operation already completed successfully.

---

## 19. Observability

Every significant operation in the adaptive pipeline must be traceable. The following fields must be captured in structured logs and distributed traces.

### 19.1 Trace Context Fields

| Field | Source | Purpose |
|---|---|---|
| `request_id` | HTTP layer | Correlate API requests |
| `student_id` | Auth token | Student-scoped tracing |
| `assessment_id` | Assessment record | Assessment lifecycle tracing |
| `submission_id` | Submission record | Specific submission tracking |
| `weakness_analysis_id` | WeaknessProfile ID | Weakness detection trace |
| `plan_id` | PersonalizedLearningPlan ID | Plan generation and lifecycle trace |
| `generation_job_id` | Background job ID | Generation pipeline tracing |
| `lesson_id` | PersonalizedLesson ID | Per-lesson generation and delivery |
| `retest_id` | RetestReference ID | Retest lifecycle trace |
| `report_id` | ImprovementReport ID | Report generation trace |
| `model_id` | LLM model identifier | AI model audit |
| `prompt_template_version` | Prompt registry | Prompt version tracing |
| `generation_status` | Job state | Status at each pipeline stage |
| `latency_ms` | Timing | Performance monitoring |
| `error_type` | Exception category | Error classification and alerting |
| `event_id` | Message broker event | Event-driven tracing |
| `idempotency_key` | Operation key | Duplicate detection trace |

### 19.2 What Must Never Be Logged

- LLM chain-of-thought / internal reasoning text.
- Raw LLM prompts containing student answer data.
- Student PII beyond the student_id reference.
- Assessment item correct answers in plain log output.

### 19.3 Alerting Triggers

| Condition | Alert Level |
|---|---|
| Generation job fails after all retries | HIGH |
| Plan enters VALIDATION_FAILED state | MEDIUM |
| DLQ message count exceeds threshold | HIGH |
| LLM evaluation latency p99 > 30s | MEDIUM |
| Student with no active plan after TestGraded event > 10 min | MEDIUM |

---

## 20. Security

### 20.1 Authentication and Authorization

All adaptive learning API endpoints require a valid JWT access token (enforced by Module 1 via FastAPI middleware). Every endpoint enforces that the authenticated student can only access their own resources:

```
student_id in JWT claims == student_id in resource record
```

Instructors and administrators may have read access to student plans and reports according to their role permissions (defined in Module 1). Write access to student plans is restricted to the system (Module 6 service) and explicitly authorized roles.

### 20.2 Student Data Isolation

- A student must never be able to retrieve, view, or reference another student's `PersonalizedLearningPlan`, `WeaknessProfile`, `ImprovementReport`, or any associated content.
- All database queries on student-specific adaptive data must include a `student_id` filter keyed to the authenticated user.
- No personalized plan or generated content ID may be guessable or enumerable without authentication.

### 20.3 Generated Content Access Control

- `GeneratedContent` records are accessible only through authenticated API endpoints.
- Object storage URLs for large generated assets must be pre-signed with expiry (not permanently public URLs).
- Pre-signed URL generation must verify student ownership before issuing the URL.

### 20.4 AI Input and Output Security

- Student answer data passed to the LLM for evaluation must not be logged in plain text.
- LLM prompts containing student answers are treated as sensitive data in transit.
- LLM outputs (generated lesson content) must not include internal system instructions, prompt templates, or chain-of-thought that was part of the generation prompt.
- Input sanitization: any student-provided text passed to the LLM as context must be sanitized and clearly delimited in the prompt to prevent prompt injection.

### 20.5 Audit Logs

All of the following events must be written to the audit log (Module 1 audit infrastructure):

- TestGraded event processed for student.
- PersonalizedLearningPlan created.
- PersonalizedLearningPlan delivered to student.
- Retest triggered.
- ImprovementReport generated.
- Any generation failure event.

---

## 21. Architecture Diagrams

### 21.1 High-Level Adaptive Learning Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js / React)                            │
│     Course Player │ Assessment UI │ Personalized Course UI │ Report UI   │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ HTTPS / REST
┌───────────────────────────────▼──────────────────────────────────────────┐
│               BACKEND API LAYER (FastAPI)                                │
│        Auth Middleware (M1) │ BFF Aggregation │ Module APIs              │
└──────┬──────────────┬────────────────┬──────────────────┬────────────────┘
       │              │                │                  │
       ▼              ▼                ▼                  ▼
  ┌─────────┐   ┌──────────┐    ┌──────────┐      ┌──────────┐
  │   M2    │   │   M4     │    │   M5     │      │   M6     │
  │ Course  │   │ Student  │    │   AI     │      │ Adaptive │
  │Content  │   │Experience│    │Assessment│      │Learning  │
  │         │   │          │    │& Eval    │      │& Remed.  │
  └────┬────┘   └──────────┘    └────┬─────┘      └────┬─────┘
       │                             │                  │
       │ embed                       │ TestGraded       │ Plan
       ▼                             │ Event            │ Ready
  ┌─────────┐                        ▼                  │
  │pgvector │◄──── RAG ─────── Message Broker ─────────►│
  └─────────┘       retrieval        │                  │
                                     └──────────────────┘
                                            │ events
┌───────────────────────────────────────────▼──────────────────────────────┐
│              SHARED INFRASTRUCTURE                                        │
│  PostgreSQL │ pgvector │ Redis │ S3 Object Storage │ CDN │ Claude API     │
│  Background Workers │ Docker / CI/CD │ Observability                      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 21.2 End-to-End Student Flow

```
Student
  │
  │ 1. Completes original LMS course (Module 2 via Module 4)
  │
  │ 2. AI initial assessment generated (Module 5 — RAG from pgvector)
  │
  │ 3. Student attempts assessment (Module 4 → Module 5)
  │
  │ 4. Module 5 evaluates (deterministic MCQ + LLM open-ended)
  │         │
  │         └── TestGraded Event [INITIAL] → Message Broker
  │
  │ 5. Module 6 consumes event:
  │         Weakness Analysis → WeaknessProfile created
  │         Personalized Course Generation Pipeline (async)
  │         Plan → AVAILABLE
  │
  │ 6. Student sees personalized course in dashboard (Module 4)
  │
  │ 7. Student completes personalized lessons
  │         RemediationCompleted Event → Message Broker
  │
  │ 8. Module 6 triggers retest → Module 5 generates focused retest
  │
  │ 9. Student attempts retest (Module 4 → Module 5)
  │
  │ 10. Module 5 evaluates retest
  │         TestGraded Event [RETEST] → Message Broker
  │
  │ 11. Module 6 consumes retest event:
  │         Performance comparison (original vs retest)
  │         ImprovementReport generated
  │
  │ 12. Student views improvement report (Module 4)
  │
  └── [If weaknesses remain] → New remediation cycle
      [If mastery achieved]  → Learning path advances
```

---

### 21.3 AI Generation Pipeline

```
WeaknessProfile
      +
Original Course Skill Context (Module 2)
      +
pgvector Retrieval (relevant content chunks)
      │
      ▼
Stage 1: Skill Score Extraction        [Module 6 — deterministic]
      │
      ▼
Stage 2: Weakness Prioritization       [Module 6 — deterministic]
      │
      ▼
Stage 3: Learning Objective Gen        [Module 6 — LLM]
      │
      ▼
Stage 4: RAG Retrieval                 [pgvector semantic search]
      │
      ▼
Stage 5: Course Outline Gen            [Module 6 — LLM, structured JSON output]
      │
      ▼
Stage 6: Module Creation               [Module 6 — deterministic from outline]
      │
      ▼
Stage 7: Lesson & Content Gen          [Module 6 — LLM per lesson, parallelizable]
      │
      ▼
Stage 8: Validation                    [Module 6 — rule-based + schema check]
      │
      ├── PASS → Stage 9
      ├── PARTIAL_PASS → Stage 9 (with flags)
      └── FAIL → Retry / Escalate
      │
      ▼
Stage 9: Persistence                   [PostgreSQL atomic write]
      │
      ▼
Stage 10: Notification                 [Module 4 notified → student dashboard]
```

---

### 21.4 Module Interaction Diagram

```
                    ┌───────────────────┐
                    │ Module 1          │
                    │ User & Access     │
                    │ Management        │
                    └────────┬──────────┘
                             │ auth foundation (all modules)
     ┌───────────────────────┼────────────────────────────────┐
     │                       │                                │
     ▼                       ▼                                ▼
┌─────────┐           ┌─────────────┐                 ┌─────────────┐
│Module 2 │           │  Module 4   │                 │  Module 5   │
│Course & │──content─►│  Student    │◄──assessment────│  AI Assess. │
│Content  │           │  Experience │   delivery      │  & Eval     │
│Mgmt     │           │             │◄──results───────│             │
└────┬────┘           │             │◄──report────────┤             │
     │                │             │                 └──────┬──────┘
     │ embeddings     └─────────────┘                        │
     ▼                      ▲                         TestGraded Event
┌─────────┐                 │                                │
│pgvector │                 │ adaptive                       ▼
└────┬────┘                 │ guidance                ┌─────────────┐
     │                      │                         │  Module 6   │
     │ RAG retrieval         └─────────────────────────│  Adaptive   │
     └─────────────────────────────────────────────────│  Learning & │
                                                       │  Remediat.  │
                                                       └─────────────┘
```

---

### 21.5 Event-Driven Flow

```
[Student submits assessment]
        │
        ▼
[Module 5 API — Submission received]
        │
        ├── MCQ grading (sync)
        └── Open-ended evaluation (async worker)
              │
              ▼
        [Evaluation complete]
              │
              ▼
        TestGraded Event published
        {type: INITIAL, student_id, assessment_id, skill_scores}
              │
              ▼
        [Message Broker]
              │
        ┌─────┘
        ▼
[Module 6 — Event Consumer]
        │
        ├── Idempotency check (event_id)
        │
        ├── Weakness Analysis Job queued
        │       └── WeaknessProfile created
        │       └── PersonalizedPlan generation job queued
        │
        └── Generation pipeline runs (async workers)
              │
              ▼
        [Plan AVAILABLE]
        RemediationReady notification → Module 4

[Student completes plan]
        │
        ▼
[lesson_complete API called for final lesson]
        │
        ▼
RemediationCompleted Event published
        │
        ▼
[Module 6 — Event Consumer]
        │
        └── Retest trigger → Module 5 retest generation API

[Student submits retest]
        │
        ▼
[Module 5 — Evaluate retest]
        │
        ▼
TestGraded Event published
{type: RETEST, original_assessment_id, plan_id, skill_scores}
        │
        ▼
[Module 6 — Event Consumer]
        │
        └── Performance comparison
        └── ImprovementReport generated
        └── Report available notification → Module 4
```

---

### 21.6 Personalized Course Lifecycle

```
[TestGraded Event consumed by M6]
        │
        ▼
   GENERATING ──── failure ──► GENERATION_FAILED
        │
     success
        │
        ▼
   VALIDATION_FAILED ◄── validation FAIL
        │
   (validation PASS / PARTIAL_PASS)
        │
        ▼
   AVAILABLE ──── student starts ──►  IN_PROGRESS
                                           │
                              student completes all lessons
                                           │
                                           ▼
                                      COMPLETED
                                           │
                                    retest triggered
                                           │
                                           ▼
                                   RETEST_PENDING
                                           │
                                    student starts retest
                                           │
                                           ▼
                                  RETEST_IN_PROGRESS
                                           │
                                  student submits retest
                                           │
                                           ▼
                                   RETEST_COMPLETED
                                           │
                                  improvement report generated
                                           │
                                           ▼
                                       EVALUATED
                                           │
                                           ▼
                                       ARCHIVED
```

---

### 21.7 Assessment vs Remediation vs Retest

```
INITIAL ASSESSMENT (Module 5)
┌──────────────────────────────────────────────────────┐
│ Source: Published course content (Module 2 / RAG)   │
│ Scope:  Full course skill coverage                   │
│ Purpose: Establish baseline performance              │
│ Output:  Skill scores + TestGraded event [INITIAL]  │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
PERSONALIZED REMEDIATION COURSE (Module 6)
┌──────────────────────────────────────────────────────┐
│ Source: WeaknessProfile + RAG (approved content)    │
│ Scope:  Only identified weak skills                  │
│ Purpose: Teach the student what they got wrong       │
│ Output:  GeneratedContent lessons + progress data    │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
FOCUSED RETEST (Module 5)
┌──────────────────────────────────────────────────────┐
│ Source: WeaknessProfile + RAG + original ref        │
│ Scope:  Only weak skills (not full course)          │
│ Purpose: Measure improvement after remediation       │
│ Output:  Retest scores + TestGraded event [RETEST]  │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
IMPROVEMENT REPORT (Module 6)
┌──────────────────────────────────────────────────────┐
│ Source: Original assessment scores + Retest scores  │
│ Scope:  Skill-level comparison                      │
│ Purpose: Show student their measurable improvement  │
│ Output:  ImprovementReport (student-visible)        │
└──────────────────────────────────────────────────────┘
```

---

### 21.8 Data and Storage Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            PostgreSQL                                     │
│                                                                           │
│  Module 1: users, roles, permissions, audit_logs                         │
│  Module 2: courses, modules, lessons, skill_tags, content_metadata       │
│  Module 5: assessments, submissions, evaluation_results, skill_scores    │
│  Module 6: weakness_profiles, personalized_learning_plans,               │
│            personalized_modules, personalized_lessons,                   │
│            generated_content, learning_objectives,                       │
│            remediation_progress, retest_references,                      │
│            generation_metadata, improvement_reports, processed_events    │
└──────────────────────────────────────┬───────────────────────────────────┘
                                       │
              ┌────────────────────────┼──────────────────────┐
              │                        │                      │
              ▼                        ▼                      ▼
┌─────────────────────┐   ┌────────────────────┐  ┌─────────────────────┐
│     pgvector        │   │   S3 Object Store  │  │       Redis         │
│                     │   │                    │  │                     │
│ Published content   │   │ Course PDFs/videos │  │ Session/JWT tokens  │
│ embeddings          │   │ Generated PDFs     │  │ Progress cache      │
│ (Module 2 source)   │   │ Live recordings    │  │ Job status          │
│                     │   │ (URL ref in PG)    │  │ Rate limit counters │
│ NOT: personalized   │   │                    │  │ (NOT permanent data)│
│ content embeddings  │   │                    │  │                     │
└─────────────────────┘   └────────────────────┘  └─────────────────────┘
```

---

## 22. Complete End-to-End Example

### Scenario: Student completes a Python Programming course

**Student:** Alex
**Course:** Python Programming Fundamentals
**Skills covered:** Functions, Loops, Recursion, Error Handling

---

#### Step 1 — Initial Assessment

Module 5 generates a 20-question assessment from the Python course content (5 questions per skill). Alex attempts the assessment.

**Assessment Result:**

| Skill | Score | Status |
|---|---|---|
| Functions | 85% | ✅ Strong |
| Loops | 78% | ⚠️ Borderline (threshold: 80%) |
| Recursion | 42% | ❌ Critical Weakness |
| Error Handling | 55% | ❌ Moderate Weakness |

**TestGraded event emitted:** `{type: INITIAL, overall_score: 65%}`

---

#### Step 2 — Weakness Detection (Module 6)

Module 6 consumes the TestGraded event.

**WeaknessProfile:**

```json
{
  "weak_skills": [
    { "skill_id": "recursion", "score": 0.42, "severity": "CRITICAL", "rank": 1 },
    { "skill_id": "error_handling", "score": 0.55, "severity": "MODERATE", "rank": 2 },
    { "skill_id": "loops", "score": 0.78, "severity": "BORDERLINE", "rank": 3 }
  ]
}
```

*Functions (85%) is above threshold — not included in WeaknessProfile.*

---

#### Step 3 — Personalized Course Generation (Module 6)

The generation pipeline produces a `PersonalizedLearningPlan` with 4 modules:

```
PersonalizedLearningPlan: "Python Remediation — Alex"
│
├── Module 1: Understanding Recursion           (Skill: Recursion — CRITICAL)
│       ├── Lesson 1.1: What is Recursion?
│       │       Content: Explanation + examples of call stack behavior
│       ├── Lesson 1.2: The Base Case
│       │       Content: Why base cases prevent infinite recursion
│       └── Lesson 1.3: Recursive Problem Solving
│               Content: Worked examples — factorial, fibonacci
│               Knowledge check: 2 practice problems
│
├── Module 2: Error Handling Fundamentals       (Skill: Error Handling — MODERATE)
│       ├── Lesson 2.1: try/except in Python
│       │       Content: Syntax, common exception types
│       └── Lesson 2.2: Raising and Handling Custom Errors
│               Content: raise keyword, custom exception classes
│               Knowledge check: 2 practice problems
│
├── Module 3: Loops Refresher                   (Skill: Loops — BORDERLINE)
│       └── Lesson 3.1: Common Loop Pitfalls
│               Content: Off-by-one errors, infinite loops, nested loops
│
└── Module 4: Practice Exercises (Cross-skill)
        └── Lesson 4.1: Applied Exercises
                Content: Short practice problems combining recursion + error handling
```

All content grounded in retrieved chunks from the Python course content in pgvector.

Alex receives a notification: *"Your personalized learning plan is ready."*

---

#### Step 4 — Student Completes Personalized Course

Alex works through the 4 modules and 8 lessons over 3 study sessions. Progress is tracked per lesson in `RemediationProgress`.

When Lesson 4.1 is marked complete:

```
RemediationProgress: 8/8 lessons completed (100%)
→ RemediationCompleted event emitted
→ Module 6 triggers retest
```

---

#### Step 5 — Focused Retest

Module 5 generates a 12-question retest (4 questions per weak skill):

- Recursion: 4 new questions (different from original; same difficulty)
- Error Handling: 4 new questions
- Loops: 4 new questions

*Functions is not retested — it was not a weakness.*

Alex completes the retest.

**Retest Results:**

| Skill | Original | Retest | Change | Status |
|---|---|---|---|---|
| Recursion | 42% | 81% | +39% | ✅ Mastered |
| Error Handling | 55% | 76% | +21% | ✅ Mastered |
| Loops | 78% | 70% | -8% | ⚠️ Still Weak |

**TestGraded event emitted:** `{type: RETEST, original_assessment_id: "...", overall_retest_score: 75.7%}`

---

#### Step 6 — Performance Comparison (Module 6)

Module 6 consumes the RETEST TestGraded event and computes:

```
overall_improvement = 75.7% − 65.0% = +10.7%

skills_mastered:    [recursion, error_handling]
skills_still_weak:  [loops]
recommended_next_step: ADDITIONAL_REMEDIATION (for loops)
```

---

#### Step 7 — Improvement Report (displayed via Module 4)

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR IMPROVEMENT REPORT                                    │
│  Python Programming Fundamentals                            │
├─────────────────────────────────────────────────────────────┤
│  OVERALL PERFORMANCE                                        │
│  Previous Score:      65%                                   │
│  New Score:           76%                                   │
│  Improvement:         +11%                                  │
├─────────────────────────────────────────────────────────────┤
│  SKILL RESULTS                                              │
│                                                             │
│  ✅ Recursion        42% → 81%  (+39%)  MASTERED           │
│  ✅ Error Handling   55% → 76%  (+21%)  MASTERED           │
│  ✅ Functions        85% → 88%  (+3%)   (not retested)     │
│  ⚠️  Loops           78% → 70%  (-8%)   NEEDS ATTENTION    │
├─────────────────────────────────────────────────────────────┤
│  SKILLS MASTERED:    Recursion, Error Handling              │
│  STILL NEEDS WORK:   Loops                                  │
├─────────────────────────────────────────────────────────────┤
│  NEXT STEP                                                  │
│  Great progress on Recursion and Error Handling! A focused  │
│  refresher on Loops has been prepared for you.              │
└─────────────────────────────────────────────────────────────┘
```

**Edge case illustrated:** Alex's overall score improved (+11pp) and two skills were mastered. However, Loops **regressed** (78% → 70%). The system correctly identifies this: the improvement report surfaces Loops as still requiring attention, and `recommended_next_step` triggers a second remediation cycle for Loops only. Alex is not required to repeat Recursion or Error Handling remediation.

---

## 23. Engineering Non-Negotiables

The following rules are non-negotiable constraints for all engineering work on the adaptive learning pipeline. They may not be circumvented, reinterpreted, or deprioritized.

1. **The six existing modules remain the primary architectural source of truth.** This document extends — it does not replace — the six-module architecture defined in `01-PROJECT-OVERVIEW.md` and `02-SYSTEM-ARCHITECTURE.md`.

2. **AI-generated personalized learning content is not a normal LMS course.** It must never be automatically added to the Module 2 course catalog, stored as a Module 2 course entity, or embedded into the pgvector production knowledge base.

3. **Module ownership must remain explicit.** Module 5 owns assessment generation and evaluation. Module 6 owns weakness analysis, personalized course generation, and improvement comparison. No module may absorb the responsibilities of another.

4. **PostgreSQL is the system of record.** All durable adaptive learning data — plans, weakness profiles, lessons, progress, reports — must be persisted in PostgreSQL. Redis holds transient or cached data only.

5. **Redis is not permanent business storage.** No adaptive learning record should be exclusively stored in Redis. If Redis is unavailable, business data must remain accessible from PostgreSQL.

6. **AI-generated content must be grounded and validated before delivery.** No generated lesson content may be delivered to a student until it has passed the validation pipeline defined in Section 17.

7. **Assessment and retest results must be fully traceable.** Every `TestGraded` event, every submission, every evaluation result, and every `ImprovementReport` must link back to the original assessment via foreign key references. Audit trails must not be broken.

8. **AI generation jobs must be asynchronous.** Personalized course generation, lesson content generation, and LLM-based evaluation must not block synchronous user-facing API responses.

9. **AI operations must be idempotent and retry-safe.** Every generation job must be safe to retry without producing duplicate records. Idempotency keys must be defined and enforced for every AI job.

10. **Student-specific content must be isolated.** A student must never access another student's `PersonalizedLearningPlan`, `WeaknessProfile`, `GeneratedContent`, or `ImprovementReport`. Ownership checks must be enforced at the API layer.

11. **Original and retest assessments must be linked for comparison.** The `RetestReference` must always carry a reference to `original_assessment_id`. Performance comparison must use both records. Orphaned retests without an original reference must be treated as an error.

12. **Improvement must be measured at the skill level, not only by overall score.** The `ImprovementReport` must include per-skill comparisons. Overall score improvement that masks a skill-level regression must be surfaced explicitly.

13. **LLM chain-of-thought must never be exposed or persisted as student-facing content.** Internal reasoning, prompt templates, and intermediate LLM outputs are system internals. Only the final structured output (lesson content, evaluation results, improvement data) is stored and presented.

14. **Do not introduce autonomous agents without explicit justification.** AI responsibilities are implemented as service functions, workflow steps, or scheduled jobs within the existing module architecture. Adding independent autonomous agents requires explicit architectural approval.

15. **Do not silently change the existing six-module architecture.** If a requirement in this document appears to conflict with the Base SDD, the conflict must be explicitly documented and resolved — not silently resolved by redefining module responsibilities.
