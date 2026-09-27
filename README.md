# AI Learning Platform — Pen & Page Academia
## Brilliant.org-Inspired Multi-Discipline LMS

---

## 🎯 Platform Overview

**Pen & Page Academia** is an interactive, gamified learning platform inspired by Brilliant.org.

### 4 Disciplines
| Track | Content |
|---|---|
| 📖 Academic English | IELTS · Academic Writing · Rhetoric · Grammar · Vocabulary |
| 🧮 Higher Mathematics | Algebra → Calculus → Linear Algebra → Statistics |
| 💻 Computer Science | Python → Algorithms → Data Structures → AI |
| 🔬 Applied Physics | Everyday Physics → Mechanics → Circuits → Quantum |

### Key Features (Brilliant-Inspired)
- 🎯 5-step personalised onboarding
- 🔑 Daily keys system (2 free / unlimited premium)
- 🔥 Daily streaks + ⚡ streak charges
- ⭐ XP points + 🏆 Weekly leagues (10 tiers)
- 💎 Freemium model
- 🤖 AI Study Buddy (Socratic hints, never the answer)
- 👩‍🏫 Instructor portal with class management
- 👪 Family plan (up to 6 members)

---

## 🏗️ Architecture

```
frontend/   ← Next.js 16 + Tailwind v4   → localhost:3001
backend/    ← FastAPI + PostgreSQL        → localhost:8000
docs/       ← All project documentation
docx/       ← Legacy SDD specs
```

---

## 🚀 Getting Started

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📖 Key Documents

| Doc | Path | Description |
|---|---|---|
| **Master Plan** | `docs/BRILLIANT-INSPIRED-MASTER-PLAN.md` | ⭐ Start here — complete A-Z plan |
| **System Overview** | `docs/01-system-overview.md` | Architecture, roles, gamification |
| **UI Design Spec** | `docs/05-public-ui-design.md` | Every page wireframe |
| **Routing Spec** | `docs/04-frontend-routing-spec.md` | All routes + flows |
| **Roadmap** | `docs/07-development-roadmap.md` | Phase 1-4 build checklist |
| **Frontend Dev Guide** | `frontend/AGENTS.md` | Code patterns + rules |
| **Backend Spec** | `backend/BACKEND_INTEGRATION_SPEC.md` | API contracts |

---

## ⚠️ Critical Rules

1. **Backend off-limits** for frontend team — `backend/` directory is separate team
2. **`next dev --webpack`** only — Turbopack crashes Tailwind v4
3. **Discuss → Approve → Build** — no implementation without plan review
4. **Max 6 courses** on public catalog grid
5. **4 tracks only:** CS · Math · English · Physics
