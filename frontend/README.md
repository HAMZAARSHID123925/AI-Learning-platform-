# Pen & Page Academia — Frontend README
## Brilliant.org-Inspired Multi-Discipline Learning Platform

---

## 🎯 What Is This?

**Pen & Page Academia** is a Brilliant.org-inspired interactive learning platform covering 4 disciplines:

| Track | Content |
|---|---|
| 📖 Academic English | IELTS prep, Academic Writing, Rhetoric, Grammar |
| 🧮 Higher Mathematics | Algebra → Calculus → Linear Algebra |
| 💻 Computer Science | Python → Algorithms → Data Structures → AI |
| 🔬 Applied Physics | Everyday Physics → Mechanics → Circuits → Quantum |

**Key features being built:**
- 🎯 5-step personalised onboarding (like Brilliant)
- 🔑 Daily keys system (2 free lessons/day)
- 🔥 Streak system with automatic charge saves
- ⭐ XP + Weekly league leaderboard (10 tiers)
- 💎 Free vs Premium model
- 🤖 AI Study Buddy (our Koji — Socratic hints, never the answer)

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start dev server (ALWAYS use this command)
npm run dev
# → http://localhost:3001

# Type check
npx tsc --noEmit

# Production build
npx next build --webpack
```

> 🚨 **CRITICAL:** Always use `npm run dev` (which runs `next dev --webpack`).  
> Never use `turbopack`. It crashes with `@tailwindcss/postcss`.

---

## 🗂️ Key Files

| File | Purpose |
|---|---|
| `src/app/(main)/page.tsx` | Landing page |
| `src/app/(auth)/signup/page.tsx` | Signup — 5-step wizard |
| `src/app/(dashboard)/dashboard/page.tsx` | Home dashboard |
| `src/app/(dashboard)/dashboard/lesson/page.tsx` | Lesson player |
| `src/components/Navbar.tsx` | Public + logged-in navbar |
| `src/components/AIStudyBuddy.tsx` | AI Study Buddy widget |
| `src/lib/auth-storage.ts` | Auth session helpers |

---

## 📖 Documentation

| Doc | Location | Description |
|---|---|---|
| **Master Plan** | `../docs/BRILLIANT-INSPIRED-MASTER-PLAN.md` | Complete A-Z feature plan |
| **UI Design Spec** | `../docs/05-public-ui-design.md` | Page-by-page UI wireframes |
| **Routing Spec** | `../docs/04-frontend-routing-spec.md` | All routes + navigation flows |
| **Roadmap** | `../docs/07-development-roadmap.md` | Phase 1-4 build order |
| **System Overview** | `../docs/01-system-overview.md` | Architecture + auth + gamification |
| **Dev Guide** | `AGENTS.md` | Component patterns + build rules |

---

## 🔒 Rules

1. Backend in `backend/` — **do not touch**
2. `"dev": "next dev --webpack"` — **never change**
3. Max **6 courses** on public grid
4. **Discuss → Approve → Build** (never skip planning)
5. **4 tracks only:** CS · Math · English · Physics

---

## 🌐 Ports

| Service | URL |
|---|---|
| Frontend | `http://localhost:3001` |
| Backend API | `http://localhost:8000` |
| API Docs | `http://localhost:8000/docs` |
