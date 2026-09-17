# ELARION AI Learning Platform: Course Creation, Database Persistence & Catalog Wiring

> **Document Type:** Production Integration & Wiring Specification  
> **Folder:** `docx/wiring/`  
> **Topic:** Admin Course Creation $\to$ PostgreSQL Persistence $\to$ Public Catalog Display (`/courses`)  
> **Status:** Live & Verified  
> **Date:** September 2026  

---

## 1. Architectural Summary & Concept

In production ed-tech platforms (such as Coursera, Udemy, or enterprise LMSs), courses are **never** stored in client-side storage (`localStorage`). Instead:

1. **Administration / Instructor Layer**:
   - An authorized user with `course:create` permission (e.g. `Admin` or `Instructor`) sends a structured `POST /api/v1/courses` request to FastAPI.
   - The backend validates the payload, generates an invariant URL slug, and executes an atomic `INSERT INTO courses (...)` in PostgreSQL with initial state `status = 'draft'`.

2. **Publishing State Machine**:
   - When the curriculum is ready or approved by platform administration, calling `POST /api/v1/courses/{id}/publish` transitions `status = 'published'` in PostgreSQL.
   - For instructors, publishing requires at least one published lesson in the course hierarchy; administrators possess administrative override authority.

3. **Public & Student Catalog Layer**:
   - When visitors or students visit `http://localhost:3000/courses`, the page calls `GET /api/v1/courses?status=published`.
   - The backend strictly filters out draft/archived courses for non-staff visitors, returning only verified published courses.
   - The Next.js frontend dynamically renders the database records.

---

## 2. Default Platform Accounts (PostgreSQL Seeded)

The platform includes verified default accounts seeded via `python scripts/seed_data.py`:

| Role | Email | Password | Permissions | Default Landing |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@elarion.com` | `Admin123!` | Full permissions (11 codes, `course:create`, `course:delete`, `user:manage`) | `/admin/courses` |
| **Instructor** | `instructor@elarion.com` | `Instructor123!` | `course:create`, `course:read`, `session:create`, `analytics:read` | `/instructor` |
| **Student** | `student@elarion.com` | `Student123!` | `course:read`, `assessment:take`, `assessment:grade`, `session:join` | `/dashboard` |

---

## 3. Database Schema & Persistence Details

All courses, modules, and lessons are persisted in the **`elarion_postgres`** container running on port `5432`.

### Primary Table: `courses`
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    description TEXT,
    status course_status NOT NULL DEFAULT 'draft', -- ENUM('draft', 'published', 'archived')
    thumbnail_url VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Supporting Tables:
* **`users`**: Platform user identities with bcrypt-hashed passwords.
* **`roles`** & **`user_roles`**: Many-to-many RBAC mappings.
* **`course_modules`**: Chapters/modules within a course (`sequence_order` indexed).
* **`lessons`**: Individual learning units within modules.
* **`embedding_outbox`**: Transactional outbox triggering vector embeddings upon publication.

---

## 4. API Endpoints & Contract

All endpoints run on `http://localhost:8000/api/v1`:

### 1. Authenticate & Retrieve Token
* **Route:** `POST /api/v1/auth/login`
* **Body:** `{"email": "admin@elarion.com", "password": "Admin123!"}`
* **Returns:** `{"access_token": "<RS256-JWT>", "token_type": "Bearer", "user": {...}}`

### 2. Create Course (Admin or Instructor)
* **Route:** `POST /api/v1/courses`
* **Header:** `Authorization: Bearer <access_token>`
* **Body:**
  ```json
  {
    "title": "Full-Stack AI Engineering Masterclass",
    "description": "End-to-end production AI application development from foundational LLMs to deployment."
  }
  ```
* **Status:** `201 Created`

### 3. Publish Course
* **Route:** `POST /api/v1/courses/{course_id}/publish`
* **Header:** `Authorization: Bearer <access_token>`
* **Status:** `200 OK` (sets `status = "published"`)

### 4. Public Catalog Listing
* **Route:** `GET /api/v1/courses?page=1&page_size=50`
* **Authentication:** Optional. If unauthenticated or role is `Student`, automatically filters to `status=published`.
* **Status:** `200 OK`

### 5. Delete Course
* **Route:** `DELETE /api/v1/courses/{course_id}`
* **Header:** `Authorization: Bearer <access_token>`
* **Status:** `204 No Content`

---

## 5. Step-by-Step Testing & Verification Guide

### Step 1: Log in as Administrator
1. Open your browser to **[http://localhost:3000/login](http://localhost:3000/login)**.
2. Enter:
   - **Email:** `admin@elarion.com`
   - **Password:** `Admin123!`
3. Click **Sign In**. The system logs in against PostgreSQL and redirects you directly to `/admin/courses`.

### Step 2: Create a Real Course in the Admin Studio
1. In the top-right corner of `/admin/courses`, click **"+ Create Course"**.
2. Enter:
   - **Title:** e.g., *"Modern Deep Learning with PyTorch"*
   - **Description:** e.g., *"Comprehensive deep neural networks from first principles."*
   - **Status:** Select **"Published Immediately"** or **"Save as Draft"**.
3. Click **"Publish Course to Catalog"** (or Save Draft).
4. Notice:
   - A success toast confirms: `"Course Created & Published in Database! 🚀"`.
   - The course appears immediately in the table under **"Published"**.
   - The metric tabs update with the live count.

### Step 3: Inspect the Real PostgreSQL Database
To prove beyond any doubt that the course is saved in PostgreSQL (and NOT in browser memory):

Run this command in any terminal:
```powershell
docker exec -it elarion_postgres psql -U elarion_user -d elarion -c "SELECT id, title, status, created_at FROM courses;"
```
**Expected Output:**
```
                  id                  |                 title                  |  status   |          created_at           
--------------------------------------+----------------------------------------+-----------+-------------------------------
 a86833e3-ded3-4880-a600-26a5c5e61310 | Full-Stack AI Engineering Masterclass  | published | 2026-09-17 03:13:42.502844+00
 <new-uuid>                           | Modern Deep Learning with PyTorch      | published | 2026-09-17 ...
(2 rows)
```

### Step 4: Verify Public Catalog (`http://localhost:3000/courses`)
1. Open **[http://localhost:3000/courses](http://localhost:3000/courses)** in your browser (even in an incognito window without logging in!).
2. Notice:
   - All mock dummy cards have been eliminated.
   - Your real course from PostgreSQL is rendered in the 3-column responsive catalog grid with a green `"Live in DB"` badge.
   - Clicking **"Enroll Now"** starts the enrollment journey for students.
