# Student Course Enrollment, Curriculum Builder & Lesson Delivery Wiring Specification

## 1. Architecture Overview
This document specifies the end-to-end integration for:
1. **Student Course Enrollment & Dashboard Progress**
2. **Admin Studio Curriculum Builder (Modules & Lessons)**
3. **Student Lesson Player with Real-Time Completion & MinIO S3 Presigned URL Streaming**

All dummy data fallbacks and mock local storage collections have been replaced with real PostgreSQL tables (`courses`, `course_modules`, `lessons`, `lesson_assets`, `enrollments`, `student_lesson_progress`) and MinIO S3 media streaming.

```
┌────────────────────────────────────────────────────────┐
│                   Course Catalog                       │
│        /courses & /courses/[id] (Public Details)       │
└───────────────────────┬────────────────────────────────┘
                        │ Click "Enroll Now"
                        ▼
            POST /api/v1/enrollments
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│                 PostgreSQL Database                    │
│             `enrollments` (student_id, course_id)      │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│               Student Learning Dashboard               │
│                     /dashboard                         │
│                                                        │
│    GET /api/v1/students/me/dashboard                   │
│    (Returns real enrolled courses & actual % progress) │
└───────────────────────┬────────────────────────────────┘
                        │ Click "Continue Lesson"
                        ▼
┌────────────────────────────────────────────────────────┐
│                 Student Lesson Player                  │
│               /dashboard/lesson?id={id}                │
│                                                        │
│  1. GET /api/v1/lessons/{id}                           │
│     - Fetches markdown body from PostgreSQL            │
│     - Generates MinIO S3 presigned streaming URL       │
│  2. POST /api/v1/lessons/{id}/complete                 │
│     - Updates student progress & mastery in DB         │
│     - Invalidates Redis dashboard cache                │
└────────────────────────────────────────────────────────┘
```

---

## 2. API Endpoints

### 2.1 Enroll Student in Course (`POST /api/v1/enrollments`)
- **Authorization:** `Bearer <Student JWT>`
- **Request Body:**
```json
{
  "course_id": "a86833e3-ded3-4880-a600-26a5c5e61310"
}
```
- **Response (201 Created):**
```json
{
  "id": "42f96feb-e7c9-412a-b782-25572654dd16",
  "student_id": "7dbbf4fd-7318-4ebf-9da8-350fa2089432",
  "course_id": "a86833e3-ded3-4880-a600-26a5c5e61310",
  "status": "active",
  "enrolled_at": "2026-09-17T03:51:17.409395Z",
  "course_title": "Full-Stack AI Engineering Masterclass"
}
```
- **Idempotency:** Re-enrolling in an already enrolled course returns `409 Conflict`, which the frontend cleanly handles by redirecting straight to `/dashboard`.

### 2.2 Aggregated Student Dashboard (`GET /api/v1/students/me/dashboard`)
- **Authorization:** `Bearer <Student JWT>`
- **Database Query:** Joins `courses` through `enrollments WHERE student_id = current_user.id AND status = 'active'`.
- **Response Model:** `StudentDashboardResponse`
```json
{
  "student_id": "7dbbf4fd-7318-4ebf-9da8-350fa2089432",
  "student_name": "Elarion Student",
  "enrolled_courses": [
    {
      "course_id": "a86833e3-ded3-4880-a600-26a5c5e61310",
      "course_title": "Full-Stack AI Engineering Masterclass",
      "course_slug": "full-stack-ai-engineering-masterclass",
      "total_lessons": 1,
      "completed_lessons": 1,
      "locked_lessons": 0,
      "percentage": 100.0
    }
  ],
  "overall_completion_percentage": 100.0,
  "next_recommended_lesson": null,
  "skill_mastery_radar": [],
  "active_remediations": [],
  "unread_notifications_count": 0
}
```

### 2.3 Fetch Course Details with Syllabus (`GET /api/v1/courses/{course_id}`)
- **Authorization:** Optional (Accessible to prospective students and unauthenticated visitors).
- **Response Model:** `CourseDetailResponse`
```json
{
  "id": "a86833e3-ded3-4880-a600-26a5c5e61310",
  "title": "Full-Stack AI Engineering Masterclass",
  "slug": "full-stack-ai-engineering-masterclass",
  "description": "Comprehensive curriculum",
  "status": "published",
  "version": 1,
  "modules": [
    {
      "id": "ec019eb9-73ec-4993-9c84-18f921d3f572",
      "title": "Module 1: Advanced Inverted Syntax and Academic Grammar",
      "description": "Module 1 objectives",
      "sequence_order": 1,
      "lessons": [
        {
          "id": "2f85e5fc-9b17-4ed3-8ff1-f2c440fe3581",
          "title": "Lesson 1: Inverted Syntax and Emphatic Structures",
          "slug": "lesson-1-inverted-syntax-and-emphatic-structures",
          "sequence_order": 1,
          "estimated_minutes": 15,
          "status": "published"
        }
      ]
    }
  ]
}
```

### 2.4 Curriculum Authoring (Admin Studio)
- **Create Module:** `POST /api/v1/courses/{course_id}/modules` (Requires permission `course:create`)
- **Create Lesson:** `POST /api/v1/modules/{module_id}/lessons` (Requires permission `course:create`)
- **Publish Lesson:** `POST /api/v1/lessons/{lesson_id}/publish`

### 2.5 Lesson Delivery with MinIO S3 Presigned URL (`GET /api/v1/lessons/{lesson_id}`)
- **Authorization:** Optional / Bearer Token
- **S3 Integration:** Automatically generates a 3600-second secure presigned URL for any attached video, audio, or PDF file stored in MinIO bucket `elarion-media`.
- **Mark Complete:** `POST /api/v1/lessons/{lesson_id}/complete` updates `student_lesson_progress` and invalidates Redis cache.

---

## 3. Automated Verification Script
Run the automated test suite from the `backend/` directory:
```bash
python scripts/test_enrollment_and_lessons.py
```
**Test Results:**
- Step 1: Login as Admin & obtain JWT token (Passed)
- Step 2: Query / Create course with module and lesson in PostgreSQL (Passed)
- Step 3: Login as Student & obtain JWT token (Passed)
- Step 4: Enroll Student via `POST /api/v1/enrollments` (Passed, 201 Created)
- Step 5: Query Student Dashboard and verify real enrolled course count & progress (Passed)
- Step 6: Query lesson body & MinIO presigned URL (Passed)
- Step 7: Mark lesson complete via `POST /api/v1/lessons/{lesson_id}/complete` (Passed)
- Step 8: Verify dashboard progress updated to 100% in PostgreSQL (Passed)
