# 02 Database Schema (PostgreSQL)

This schema defines the relational tables to be built via SQLAlchemy/Alembic.

## 1. User & Access Control
**users**
* `id` (UUID, PK)
* `email` (string, unique, indexed)
* `hashed_password` (string)
* `full_name` (string)
* `role` (enum: student, admin, teacher)
* `created_at`, `updated_at` (timestamp)

## 2. LMS Structure
**courses**
* `id` (UUID, PK)
* `title` (string)
* `slug` (string, unique)
* `description` (text)
* `category` (string)
* `is_published` (boolean)

**modules**
* `id` (UUID, PK)
* `course_id` (FK -> courses.id)
* `title` (string)
* `order_index` (integer)

**lessons**
* `id` (UUID, PK)
* `module_id` (FK -> modules.id)
* `title` (string)
* `content_type` (enum: text, pdf, video)
* `body_text` (text, nullable)
* `media_url` (string, nullable)
* `order_index` (integer)

## 3. Student Progress & Enrollments
**enrollments**
* `id` (UUID, PK), `user_id` (FK), `course_id` (FK), `enrolled_at`

**lesson_completions**
* `id` (UUID, PK), `user_id` (FK), `lesson_id` (FK), `completed_at`

## 4. Assessments & Questions (AI Ready)
**assessments**
* `id` (UUID, PK), `course_id` (FK), `module_id` (nullable FK), `title` (string), `is_ai_generated` (bool)

**questions**
* `id` (UUID, PK), `assessment_id` (FK), `prompt` (text), `question_type` (enum), `options` (JSONB), `correct_answer` (text)

**test_attempts**
* `id` (UUID, PK), `assessment_id` (FK), `user_id` (FK), `status`, `total_score`, `feedback_summary`

**attempt_answers**
* `id`, `attempt_id`, `question_id`, `student_answer`, `is_correct`, `score`, `ai_feedback`

## 5. Student Skill Profile
**student_skill_profiles**
* `id`, `user_id`, `skill_name`, `mastery_level` (0.0 to 100.0)

**ai_recommendations**
* `id`, `user_id`, `recommended_lesson_id`, `reason`, `is_completed`
