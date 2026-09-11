# 03 API Contracts (FastAPI)

## 1. Auth Module (`/api/v1/auth`)
* `POST /register`: Accepts email, password, name. Creates user.
* `POST /login`: Validates credentials, returns JWT Bearer Token.
* `GET /me`: Returns current logged-in user profile and role.

## 2. Course & Content Module (`/api/v1/courses`)
* `GET /`: Lists published courses.
* `GET /{course_id}`: Returns course details with modules and lesson titles.
* `POST /` (Admin/Teacher): Creates a course.
* `POST /{course_id}/modules` (Admin/Teacher): Adds a module.
* `POST /{module_id}/lessons` (Admin/Teacher): Adds a lesson.
* `POST /upload-media` (Admin/Teacher): Uploads PDF/video directly to S3/R2 and returns URL.

## 3. Student Progress Module (`/api/v1/progress`)
* `POST /enroll/{course_id}`: Enrolls student in course.
* `POST /lessons/{lesson_id}/complete`: Marks lesson as done.
* `GET /courses/{course_id}/summary`: Calculates overall percentage of lessons completed.

## 4. Assessment Module (`/api/v1/assessments`)
* `GET /{assessment_id}`: Fetches questions for the student to answer.
* `POST /{assessment_id}/start`: Creates a new record in `test_attempts`.
* `POST /attempts/{attempt_id}/submit`: Accepts array of answers, triggers grading.
* `GET /attempts/{attempt_id}/result`: Returns score, question breakdowns, and AI feedback.

## 5. AI Handoff Endpoints (Stubs for AI Dev)
* `POST /api/v1/ai/generate-test`: Input `user_id`, `course_id`. Triggers Test Agent.
* `POST /api/v1/ai/chat-tutor`: Input `user_id`, `lesson_id`, `message`. Triggers Tutor Agent.
* `GET /api/v1/ai/recommendations`: Reads from `ai_recommendations` table.
