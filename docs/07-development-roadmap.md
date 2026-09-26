# Pen & Page Academia — Development Roadmap
## Brilliant.org-Inspired Redesign & Feature Build

> **See full plan:** `docs/BRILLIANT-INSPIRED-MASTER-PLAN.md`
> **Rule:** Never build without discussion + approval first.

---

## 🔴 PHASE 1 — Core UX Overhaul (Top Priority)

| # | Task | File | Done? |
|---|---|---|---|
| 1 | Redesign public Navbar → ultra-minimal (Logo + Sign In only) | `components/Navbar.tsx` | ❌ |
| 2 | Redesign Landing Page (hero + trust strip + tutor section + subjects + testimonials + dark footer) | `(main)/page.tsx` | ❌ |
| 3 | Build Multi-Step Signup (5 steps: goal → track → level → account → welcome) | `(auth)/signup/page.tsx` | ❌ |
| 4 | Build Premium Upsell Screen (post-signup modal / page) | New component | ❌ |
| 5 | Redesign Logged-In Navbar (Home+Courses+You + trial badge + 🔑 + ⚡ + ☰) | `components/Navbar.tsx` | ❌ |
| 6 | Add Countdown Sub-Banner below logged-in navbar | Layout or Navbar | ❌ |

---

## 🟡 PHASE 2 — Gamification Foundation

| # | Task | File | Done? |
|---|---|---|---|
| 7 | Build Keys System (2/day free, midnight reset, navbar counter) | `lib/keys.ts` (new) | ❌ |
| 8 | Build Streak System (daily tracking + streak charges auto-save) | `lib/streak.ts` (new) | ❌ |
| 9 | Build XP System (earn per lesson + per correct problem) | `lib/xp.ts` (new) | ❌ |
| 10 | Redesign Dashboard Home (Up Next + daily goal + sidebar widgets) | `dashboard/page.tsx` | ❌ |
| 11 | Add "Out of Keys" screen inside Lesson Player | `dashboard/lesson/page.tsx` | ❌ |
| 12 | Add Lesson End Screen (+XP, streak maintained, next lesson button) | `dashboard/lesson/page.tsx` | ❌ |

---

## 🟡 PHASE 3 — Profile & Courses

| # | Task | File | Done? |
|---|---|---|---|
| 13 | Create "You" Profile Page (streak calendar + XP + league + courses) | `dashboard/you/page.tsx` (new) | ❌ |
| 14 | Redesign Courses Page (subject filter tabs + learning paths + course grid) | `(main)/courses/page.tsx` | ❌ |
| 15 | Add League System (weekly leaderboard, 10 tiers, 30 peers per group) | `dashboard/leagues/page.tsx` (new) | ❌ |
| 16 | Add Streak Calendar Component (GitHub-style heatmap) | `components/StreakCalendar.tsx` (new) | ❌ |

---

## 🟢 PHASE 4 — Polish & Complete

| # | Task | File | Done? |
|---|---|---|---|
| 17 | Update Settings page (notifications + subscription + language) | `dashboard/settings/page.tsx` | ❌ |
| 18 | Update Hamburger Menu (all options including settings/signout/language) | `components/Navbar.tsx` | ❌ |
| 19 | Update Pricing Page (Free/Monthly/Annual/Family table comparison) | `(main)/pricing/page.tsx` | ❌ |
| 20 | Update Instructor Portal (class creation + student invite + progress tracking) | `instructor/page.tsx` | ❌ |
| 21 | Add Personalisation Engine (dashboard shows content by chosen track) | Multiple files | ❌ |

---

## ✅ Already Done & Stable

| Feature | File | Status |
|---|---|---|
| Login page | `(auth)/login/page.tsx` | ✅ Working |
| Forgot / Reset password | `(auth)/forgot-password` + `reset-password` | ✅ Working |
| Dashboard layout | `(dashboard)/layout.tsx` | ✅ Working |
| Lesson Player (basic video + quiz) | `dashboard/lesson/page.tsx` | ✅ Working (needs XP/keys) |
| Admin panel | `admin/page.tsx` | ✅ Working |
| AI Study Buddy (chat widget) | `components/AIStudyBuddy.tsx` | ✅ Working |
| Footer | `components/Footer.tsx` | ✅ Working (minor updates needed) |
| Adaptive learning page | `dashboard/adaptive/page.tsx` | ✅ Working |

---

## ⚠️ HARD RULES — Never Violate

1. `"dev": "next dev --webpack"` in `package.json` — NEVER change to turbopack
2. Backend in `backend/` — **NEVER touch from frontend team**
3. Max **6 courses** on public grid
4. Our 4 tracks ONLY: CS & Python · Higher Math · Academic English · Applied Physics
5. Always build: Discuss → Approve → Then code
6. Never delete working features — extend, never remove without backup
7. Build command: `npx next build --webpack` (not bare `next build`)

---

## 🗂️ Architecture Quick Reference

```
Frontend:  http://localhost:3001   (npx next dev --webpack in frontend/)
Backend:   http://localhost:8000   (uvicorn in backend/)
Auth:      localStorage via saveAuthSession() in lib/auth-storage.ts
Onboarding prefs: localStorage keys: onboarding_goal, onboarding_track, onboarding_level
Enrolled courses: localStorage key: student_enrolled_courses
```
