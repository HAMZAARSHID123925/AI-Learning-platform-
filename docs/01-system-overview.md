# Pen & Page Academia — System Overview
## Platform Summary, Architecture & Feature Set

---

## 🎯 WHAT WE ARE BUILDING

**Pen & Page Academia** is a Brilliant.org-inspired interactive learning platform for:

| Discipline | Track Name | Coverage |
|---|---|---|
| 📖 Academic English | English Track | IELTS prep, Academic Writing, Rhetoric, Grammar, Vocabulary |
| 🧮 Higher Mathematics | Math Track | Algebra → Calculus → Linear Algebra → Statistics |
| 💻 Computer Science | CS Track | Python → Algorithms → Data Structures → AI |
| 🔬 Applied Physics | Physics Track | Everyday Physics → Mechanics → Circuits → Quantum |

**Core philosophy (from Brilliant.org):**
- Learn by **doing** — not watching
- **Interactive problems** — not static videos
- **AI Study Buddy** (our Koji) — Socratic hints, never the answer
- **Gamification** — streaks, XP, leagues, keys
- **Freemium model** — 2 lessons/day free, unlimited with premium

---

## 🏗️ SYSTEM ARCHITECTURE

```
STUDENT / TEACHER / PARENT
         │
         ▼
  NEXT.JS FRONTEND (localhost:3001)
  ┌─────────────────────────────────────────┐
  │  Public Pages:                          │
  │  • Landing (/) • Courses • Pricing     │
  │  • About • Contact • How It Works      │
  │                                         │
  │  Auth Pages:                            │
  │  • Signup (5-step wizard)              │
  │  • Login • Reset Password              │
  │                                         │
  │  Dashboard (Student):                   │
  │  • Home • Lesson Player • Courses      │
  │  • You/Profile • Leagues • Settings    │
  │  • Adaptive • Mock Exam • Grammar      │
  │                                         │
  │  Instructor Portal:                     │
  │  • Class management • Assignments      │
  │  • Student progress tracking           │
  │                                         │
  │  Admin Panel:                           │
  │  • Course management • Analytics       │
  └──────────────┬──────────────────────────┘
                 │ REST API (fetch)
                 ▼
  FASTAPI BACKEND (localhost:8000)
  ┌─────────────────────────────────────────┐
  │  • Auth & JWT tokens                   │
  │  • User management (RBAC)             │
  │  • Course & lesson data               │
  │  • Progress tracking                  │
  │  • AI exam generation                 │
  │  • RAG (document Q&A)                │
  │  • Assessment engine                  │
  └────────────┬──────────────────────────-─┘
               │
       ┌───────┴────────┐
       ▼                ▼
  POSTGRESQL         AI ENGINE
  • Users            • Gemini/OpenAI
  • Courses          • RAG (pgvector)
  • Lessons          • Essay grading
  • Progress         • Quiz generation
  • Attempts         • Weakness analysis
  • pgvector
```

---

## 👥 USER ROLES

| Role | Description | Access Level |
|---|---|---|
| `student` (free) | Regular learner, 2 keys/day | Dashboard, 2 lessons/day |
| `student` (premium) | Paid learner, unlimited | Dashboard, full access |
| `instructor` | Teacher with class management | Instructor portal + student tracking |
| `admin` | Platform administrator | Full admin panel |
| `parent` | Family plan manager | Can view linked student progress |

---

## 🔑 GAMIFICATION SYSTEM

### Keys System (Freemium Control)
- **Free users:** 2 keys per day
- **1 key = 1 lesson or 1 practice set**
- **Reset:** Midnight local time
- **Premium users:** No keys (unlimited)
- **Stored:** `localStorage` key: `{ daily_keys, keys_reset_date }`

### Streak System
- **Maintained by:** Completing 3 problems OR 1 lesson per day
- **Broken:** Missing a day with no charges
- **Streak Charges:** Earned 1 per lesson (max 2 banked), auto-used if day missed
- **Stored:** `localStorage` key: `{ streak_count, last_active_date, streak_charges }`

### XP System
- `+50 XP` per lesson completed
- `+10 XP` per correct problem in daily practice
- `+200 XP` per chapter complete bonus
- Used for: weekly league ranking
- **Stored:** `localStorage` + backend sync

### League System
- **30 users** per weekly league group
- **Weekly reset:** Every Monday 3:00 AM UTC
- **10 tiers:** Bronze → Silver → Gold → Platinum → Diamond (or Hydrogen→Einsteinium)
- **Promotion:** Top 5 users → next tier
- **Demotion:** Bottom 5 users → lower tier
- **Stored:** Backend (needs user comparison)

---

## 📱 FREE vs PREMIUM — COMPLETE FEATURE MATRIX

| Feature | Free | Premium |
|---|---|---|
| Daily lessons | 🔑 2/day | ♾️ Unlimited |
| Course order | Sequential only | Jump to any lesson |
| AI Study Buddy | 2-3 hints/lesson | Full, unlimited |
| Ads/upsell prompts | Yes (between lessons) | None |
| Streak charges | ✅ Same | ✅ Same |
| XP & Leagues | ✅ Same | ✅ Same |
| Streak calendar | ✅ Same | ✅ Same |
| All 4 tracks | ✅ Same | ✅ Same |
| Navbar | Shows trial + 🔑 + countdown | Clean — no trial/🔑 |
| Price | \$0 | ~\$20/mo annual |

---

## 🔐 AUTH SYSTEM

- **JWT tokens** stored in `localStorage` via `saveAuthSession()` in `lib/auth-storage.ts`
- **Onboarding prefs** stored in `localStorage`:
  - `onboarding_goal` — why they joined
  - `onboarding_track` — chosen subject
  - `onboarding_level` — experience level
- **Enrolled courses** stored in `localStorage` key: `student_enrolled_courses`
- **Session check:** `loadAuthSession()` called on protected pages

---

## 📁 PROJECT STRUCTURE

```
AI-Learning-platform-/
├── frontend/                   ← Next.js app (FRONTEND TEAM ONLY)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/         ← Signup, Login, Reset password
│   │   │   ├── (dashboard)/    ← All logged-in pages
│   │   │   │   ├── dashboard/  ← Student dashboard pages
│   │   │   │   ├── admin/      ← Admin pages
│   │   │   │   └── instructor/ ← Instructor portal
│   │   │   ├── (main)/         ← Public pages
│   │   │   └── layout.tsx
│   │   ├── components/         ← Reusable UI components
│   │   └── lib/                ← Utilities, auth, API helpers
│   ├── package.json            ← "dev": "next dev --webpack" — DO NOT CHANGE
│   └── ...
│
├── backend/                    ← FastAPI app (BACKEND TEAM ONLY — DO NOT TOUCH)
│   ├── app/
│   │   ├── api/                ← Routes
│   │   ├── models/             ← SQLAlchemy models
│   │   ├── schemas/            ← Pydantic schemas
│   │   └── services/           ← Business logic
│   └── ...
│
├── docs/                       ← Project documentation
│   ├── BRILLIANT-INSPIRED-MASTER-PLAN.md  ← MAIN PLAN — read first
│   ├── 01-system-overview.md              ← This file
│   ├── 04-frontend-routing-spec.md        ← All routes
│   ├── 05-public-ui-design.md             ← UI specs per page
│   ├── 07-development-roadmap.md          ← Phase 1-4 implementation order
│   └── ...
│
└── docx/                       ← Legacy SDD and backend specs
```

---

## ⚙️ DEV ENVIRONMENT

| Item | Value |
|---|---|
| Frontend port | `http://localhost:3001` |
| Backend port | `http://localhost:8000` |
| Start frontend | `cd frontend && npm run dev` |
| Start backend | `cd backend && venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` |
| Build command | `cd frontend && npx next build --webpack` |
| Node version | 18+ |
| Python version | 3.11 |

> ⚠️ **CRITICAL:** `package.json` must keep `"dev": "next dev --webpack"` — Turbopack crashes Tailwind v4

---

## 📋 IMPLEMENTATION PHASES (SUMMARY)

| Phase | Focus | Items |
|---|---|---|
| **Phase 1** 🔴 | Core UX Overhaul | Navbar redesign, Landing page, 5-step signup, premium upsell, logged-in navbar, countdown banner |
| **Phase 2** 🟡 | Gamification | Keys system, streak system, XP, dashboard redesign, lesson end screen, out-of-keys screen |
| **Phase 3** 🟡 | Profile & Courses | You page, Courses page, Leagues, streak calendar |
| **Phase 4** 🟢 | Polish | Settings update, hamburger menu, pricing update, instructor portal, personalisation |

> **Full detail in:** [`docs/BRILLIANT-INSPIRED-MASTER-PLAN.md`](./BRILLIANT-INSPIRED-MASTER-PLAN.md)
