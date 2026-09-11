# Module deep dives

Each module below covers: sub-components, key data entities, representative APIs, integration points, and engineering considerations specific to that module.

Module 1 — User & Access Management
Role: identity provider and permission gate for every other module.
Sub-components
● Auth service (register, login, token issuance/refresh, password reset)
● RBAC engine (role/permission matrix)
● Profile service (contact info, preferences, account settings)
● Session/token management (Redis-backed)
● Audit logging (who did what, when)
Key data entities
● User (id, email, password_hash, name, status, created_at)
● Role (Student, Admin, Instructor)
● Permission (fine-grained action grants)
● Session (token, user_id, expires_at, device info)
● AuditLog (actor_id, action, target, timestamp)
Representative APIs
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
GET /users/:id
PATCH /users/:id
PATCH /users/:id/role (admin only)
Integration pattern: Shared middleware/library.

Module 2 — Course & Content Management
Role: the administrative workbench where curriculum and content live, and the source of truth the AI assessment pipeline reads from.
Sub-components
● Curriculum builder API
● Content upload & storage service
● Metadata/skill-tagging service
● Content versioning
● Embedding pipeline (async worker)
Key data entities
● Course, Module, Lesson
● ContentAsset
● SkillTag / SkillTaxonomy
● ContentEmbedding
Representative APIs
POST /courses
POST /courses/:id/modules
POST /modules/:id/lessons
POST /lessons/:id/content
POST /lessons/:id/tags
GET /courses/:id

Module 3 — Live Online Classes
Role: synchronous teaching sessions layered on top of the async course content.
Sub-components
● Scheduling engine
● Video conferencing integration
● Attendance tracking
● Recording capture & archiving pipeline
Key data entities
● LiveSession
● SessionParticipant
● Recording
Representative APIs
POST /live-sessions
GET /live-sessions?course_id=&from=&to=
POST /live-sessions/:id/join
POST /live-sessions/:id/end
POST /webhooks/recording-complete

Module 4 — Student Experience & Dashboard
Role: the aggregation and presentation layer.
Sub-components
● Content player
● Dashboard/analytics UI
● Navigation and notification center
Key data entities
● Progress
● AnalyticsSnapshot
● Notification
Representative APIs
GET /students/:id/dashboard
GET /courses/:id/progress
POST /lessons/:id/complete
GET /notifications

Module 5 — AI Assessment & Evaluation
Role: replaces static quiz banks with tests generated and graded against the actual lesson content.
Sub-components
● Context retriever (RAG query)
● Dynamic test generator (LLM call)
● Multi-agent grading engine
● Skill score aggregator
Key data entities
● Test
● Question
● Submission
● SkillScore
Representative APIs
POST /assessments/generate { lesson_id }
GET /assessments/:job_id/status
POST /assessments/:id/submit
GET /assessments/:id/results

Module 6 — Adaptive Learning & Remediation
Role: the closed-loop intelligence that turns a graded test into a changed learning path.
Sub-components
● Weakness detection engine
● Remediation plan generator
● Adaptive retest trigger
● Mastery/state tracker
Key data entities
● WeaknessFlag
● RemediationPlan
● LearningPathState
Representative APIs
GET /students/:id/remediation-plan
POST /remediation-plans/:student_id/acknowledge
This module is primarily event-driven internally rather than API-first.

4. Cross-cutting concerns
● Security: RBAC enforcement at the API gateway layer
● Compliance: FERPA, COPPA, GDPR
● Observability: distributed tracing
● Data consistency between Postgres and the vector store

5. Suggested build phases
Phase 1: Module 1 + Module 2 + Module 4
Phase 2: Module 5 + embedding pipeline
Phase 3: Module 6
Phase 4: Module 3

6. End-to-end data flow (worked example)
1. Student logs in — Module 1 issues a token.
2. Student opens a lesson — Module 4 requests it from Module 2.
3. Student clicks "start test" — Module 4 calls Module 5.
4. Module 5 retrieves chunks, generates test, serves back.
5. Student submits — Module 5 grades it.
6. Module 6 consumes event, flags weak skill, builds remediation plan.
7. Student completes remedial lesson and retests.
