# 🏛️ ELARION / Pen & Page Academia — Backend Integration Specification & API Contract
**Version:** 1.0.0 • **Target Environment:** Python 3.11+ / FastAPI / PostgreSQL / Redis / Celery  
**Frontend Client:** Next.js 14 App Router (`http://localhost:3000`)

---

## 📌 1. Architecture & Global Standards

### 1.1 Base URL & Headers
- **Base URL:** `http://localhost:8000/api/v1`
- **Standard Request Header:**
  ```http
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```
- **Error Response Standard (RFC 7807 inspired):**
  ```json
  {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource could not be found.",
    "details": {}
  }
  ```

### 1.2 User Roles & RBAC
1. `student` — Access to diagnostics, enrolled courses, practice studios (Writing, Speaking, Vocabulary, Mock Exams), community, and analytics.
2. `instructor` — Access to all student views + Instructor Hub, live session host management, course creation, and student grading oversight.
3. `admin` — System metrics, user suspension/management, global question bank controls, platform configuration.

---

## 🔐 2. Module 1: Authentication & User Profile

### `POST /api/v1/auth/register`
- **Description:** Registers a new user account.
- **Request Body:**
  ```json
  {
    "email": "student@penpage.com",
    "password": "SecurePassword123!",
    "full_name": "Hamza Arshid",
    "role": "student"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "user": {
      "id": "u_98a76b12-34cd-56ef-7890-abcdef123456",
      "email": "student@penpage.com",
      "full_name": "Hamza Arshid",
      "role": "student",
      "target_band": 8.0,
      "exam_date": "2026-11-15",
      "is_active": true,
      "created_at": "2026-09-16T12:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 3600
  }
  ```

### `POST /api/v1/auth/login`
- **Description:** Authenticates user via email and password (or form data for OAuth2).
- **Request Body:**
  ```json
  {
    "email": "student@penpage.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):**
  - Sets HttpOnly refresh token cookie: `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Lax`
  - Returns `access_token` and `user` object.

### `GET /api/v1/auth/me`
- **Description:** Returns currently authenticated user profile and academic target preferences.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "id": "u_98a76b12-34cd-56ef-7890-abcdef123456",
    "email": "student@penpage.com",
    "full_name": "Hamza Arshid",
    "role": "student",
    "avatar_url": "/avatars/avatar-1.png",
    "target_band": 8.5,
    "target_cefr": "C2",
    "exam_type": "IELTS Academic",
    "exam_date": "2026-11-20",
    "current_band": 7.5,
    "study_streak_days": 14,
    "enrolled_course_ids": ["course_ielts_mastery_01", "course_c2_lexicon_02"]
  }
  ```

### `PATCH /api/v1/auth/profile`
- **Description:** Updates candidate study targets, target band, exam date, and avatar.
- **Request Body:**
  ```json
  {
    "full_name": "Hamza Arshid",
    "target_band": 8.5,
    "exam_date": "2026-12-01",
    "avatar_url": "/avatars/avatar-3.png"
  }
  ```

---

## 📚 3. Module 2: Course Catalog & Lessons

### `GET /api/v1/courses`
- **Query Params:** `?category=ielts_academic&level=all`
- **Response (200 OK):**
  ```json
  [
    {
      "id": "course_ielts_mastery_01",
      "title": "IELTS Academic Band 8.5+ Masterclass",
      "category": "IELTS Academic",
      "level": "C1-C2",
      "instructor_name": "Dr. Victoria Sterling",
      "instructor_avatar": "/avatars/victoria.png",
      "duration_weeks": 8,
      "lessons_count": 32,
      "rating": 4.9,
      "reviews_count": 1240,
      "is_enrolled": true,
      "progress_percentage": 42
    }
  ]
  ```

### `POST /api/v1/courses/{course_id}/enroll`
- **Description:** Enrolls student in a course.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "course_id": "course_ielts_mastery_01",
    "enrolled_at": "2026-09-16T12:30:00Z"
  }
  ```

### `GET /api/v1/courses/{course_id}/syllabus`
- **Response (200 OK):**
  ```json
  {
    "course_id": "course_ielts_mastery_01",
    "modules": [
      {
        "id": "mod_01",
        "title": "Unit 1: Advanced Inversion & Subjunctive Syntax",
        "lessons": [
          {
            "id": "les_01_01",
            "title": "Conditional Negative Inversion in Argumentative Essays",
            "duration_mins": 25,
            "is_completed": true,
            "has_assessment": true
          }
        ]
      }
    ]
  }
  ```

---

## ✍️ 4. Module 5: IELTS Writing & Speaking AI Evaluation Engine

### `POST /api/v1/writing/evaluate` *(CRITICAL FOR BACKEND DEV)*
- **Description:** Evaluates Task 1 Visual Reports or Task 2 Discursive Essays using LLM prompt chain (OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet / Gemini 1.5 Pro).
- **Request Body:**
  ```json
  {
    "task_type": "task1",
    "prompt_id": "line-smart-devices",
    "prompt_title": "Smart Home Device Adoption (2018–2023)",
    "prompt_text": "The line graph below illustrates the percentage of households...",
    "essay_text": "The line graph delineates the proportion of households across five distinct income brackets that incorporated smart home automation systems in the United Kingdom between 2018 and 2023.\n\nOverall, it is immediately apparent that smart device adoption experienced a ubiquitous upward trajectory...",
    "time_spent_seconds": 980
  }
  ```

- **Response (200 OK):**
  ```json
  {
    "overall_band": 8.5,
    "criteria_breakdown": {
      "task_achievement": {
        "band": 8.5,
        "feedback": "Presents a clear overview highlighting universal upward trajectories and top-earner dominance. Key features and percentages are accurately selected."
      },
      "coherence_cohesion": {
        "band": 8.5,
        "feedback": "Skillful paragraphing. Seamless transitional devices ('Furthermore', 'In stark contradistinction to', 'Conversely')."
      },
      "lexical_resource": {
        "band": 8.5,
        "feedback": "Rich academic vocabulary ('ubiquitous upward trajectory', 'penetration rates', 'subsequent triennium')."
      },
      "grammatical_range_accuracy": {
        "band": 8.5,
        "feedback": "Flawless syntactic variety including complex comparisons and passive structures."
      }
    },
    "has_overview": true,
    "word_count": 168,
    "is_word_count_met": true,
    "examiner_feedback_summary": "High-caliber Task 1 response that exemplifies Band 8.5+ standards. Concise, objective reporting with accurate comparative grouping.",
    "vocabulary_suggestions": [
      {
        "original": "went up",
        "suggestion": "surged precipitously"
      },
      {
        "original": "very big difference",
        "suggestion": "stark disparity"
      }
    ]
  }
  ```

---

### `POST /api/v1/speaking/evaluate-audio` *(CRITICAL FOR BACKEND DEV)*
- **Description:** Multi-modal audio evaluation for IELTS Speaking Simulator.
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `audio_file`: binary file (`.webm`, `.wav`, `.mp4`)
  - `part`: `1` | `2` | `3`
  - `cue_card_topic`: `"Describe a momentous scientific discovery..."`
- **Processing Steps for Backend:**
  1. Transcribe audio using **Whisper / Deepgram API**.
  2. Compute **Words-Per-Minute (WPM)** from timestamped tokens.
  3. Detect filler words (*"um", "uh", "you know", "like"*).
  4. Prompt LLM with transcript for **Fluency & Coherence**, **Lexical Resource**, **Grammatical Range**, and **Pronunciation**.
- **Response (200 OK):**
  ```json
  {
    "overall_band": 8.0,
    "transcript": "Well, in contemporary discourse, one momentous scientific breakthrough that has fundamentally transformed human capability is CRISPR gene editing...",
    "metrics": {
      "words_per_minute": 138,
      "tempo_rating": "Optimal (120-150 WPM)",
      "total_words": 284,
      "fillers_count": 2,
      "filler_words_detected": ["um", "you know"],
      "pronunciation_clarity_score": 0.92
    },
    "criteria_breakdown": {
      "fluency_coherence": 8.0,
      "lexical_resource": 8.5,
      "grammatical_range": 8.0,
      "pronunciation": 8.0
    },
    "examiner_feedback": "Natural speech rhythm with advanced academic discourse markers. Minor hesitation observed before transitioning into Part 3 abstract reasoning."
  }
  ```

---

## 🎥 5. Module 3: Live Interactive Classrooms & WebRTC

### `GET /api/v1/live/sessions`
- **Description:** Returns upcoming scheduled masterclasses, active live webinars, and past recordings.
- **Response (200 OK):**
  ```json
  [
    {
      "id": "live_sess_101",
      "title": "IELTS Speaking Band 9 Live Masterclass: Idiomatic Mastery",
      "instructor_name": "Alastair Montgomery",
      "instructor_avatar": "/avatars/alastair.png",
      "scheduled_start": "2026-09-17T15:00:00Z",
      "duration_minutes": 60,
      "is_live_now": false,
      "attendees_count": 84,
      "room_id": "room_ielts_speaking_101"
    }
  ]
  ```

### `POST /api/v1/live/sessions/{session_id}/token`
- **Description:** Generates a secure LiveKit / Agora RTC room token for the authenticated user.
- **Response (200 OK):**
  ```json
  {
    "room_id": "room_ielts_speaking_101",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "server_url": "wss://livekit.penpage.academy",
    "role": "subscriber"
  }
  ```

---

## 🧠 6. Module 6: Adaptive Remediation & Weakness Analytics

### `GET /api/v1/analytics/overview`
- **Description:** Returns full performance telemetry for the student's dashboard radar chart, band trajectory, and weakness diagnostics.
- **Response (200 OK):**
  ```json
  {
    "overall_band": 7.5,
    "target_band": 8.5,
    "estimated_readiness_percentage": 78,
    "skills_radar": {
      "listening": 8.0,
      "reading": 7.5,
      "writing_task1": 7.0,
      "writing_task2": 7.5,
      "speaking_fluency": 7.5,
      "lexical_resource": 8.0,
      "grammatical_range": 7.0
    },
    "weak_points": [
      {
        "skill": "Grammatical Range",
        "sub_topic": "Conditional Subjunctive Inversion",
        "severity": "Medium",
        "recommended_drill_url": "/dashboard/writing"
      },
      {
        "skill": "Writing Task 1",
        "sub_topic": "Overview Paragraph Demarcation",
        "severity": "High",
        "recommended_drill_url": "/dashboard/writing"
      }
    ],
    "study_history_last_7_days": [
      { "date": "2026-09-10", "hours_studied": 1.5, "drills_completed": 4 },
      { "date": "2026-09-11", "hours_studied": 2.0, "drills_completed": 6 },
      { "date": "2026-09-12", "hours_studied": 1.0, "drills_completed": 3 },
      { "date": "2026-09-13", "hours_studied": 2.5, "drills_completed": 8 },
      { "date": "2026-09-14", "hours_studied": 3.0, "drills_completed": 9 },
      { "date": "2026-09-15", "hours_studied": 2.0, "drills_completed": 5 },
      { "date": "2026-09-16", "hours_studied": 1.8, "drills_completed": 4 }
    ]
  }
  ```

---

## 💳 7. Module 7: Payments & Subscriptions (Stripe)

### `POST /api/v1/payments/create-checkout-session`
- **Request Body:**
  ```json
  {
    "plan_tier": "ielts_pro_monthly",
    "success_url": "http://localhost:3000/dashboard?payment=success",
    "cancel_url": "http://localhost:3000/dashboard/courses"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_..."
  }
  ```

### `POST /api/v1/payments/webhook`
- **Description:** Stripe webhook endpoint processing `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.

---

## 🛠️ 8. Database Migrations & Environment Checklist

### Required `.env` Keys for Backend:
```ini
ENVIRONMENT=development
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/elarion_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=super-secret-jwt-signing-key-32-chars-minimum
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
```

### Alembic Migration Steps:
```bash
cd backend
source venv/bin/activate
alembic upgrade head
python -m app.scripts.seed_db
```
