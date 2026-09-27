# Pen & Page Academia — Frontend Developer Guide
## Everything You Need to Know Before Writing a Single Line

---

## 📌 READ FIRST — The Master Plan

> **`docs/BRILLIANT-INSPIRED-MASTER-PLAN.md`** — This is the MAIN reference document.  
> Read it completely before touching any file.

---

## 🚀 STARTING THE APP

```bash
# Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3001

# Backend (separate terminal — don't touch backend code)
cd backend
venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000
```

> ⚠️ **NEVER change** `"dev": "next dev --webpack"` in `package.json`  
> Turbopack **crashes** with `@tailwindcss/postcss`. Always use `--webpack`.

---

## 🏗️ PROJECT STRUCTURE

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/              ← Auth pages (signup, login, reset)
│   │   │   ├── signup/page.tsx  ← 5-step onboarding (needs rebuild)
│   │   │   ├── login/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (dashboard)/         ← All protected pages (needs auth)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx         ← HOME (needs redesign)
│   │   │   │   ├── lesson/page.tsx  ← Lesson Player
│   │   │   │   ├── courses/page.tsx ← My Courses
│   │   │   │   ├── settings/page.tsx
│   │   │   │   ├── you/page.tsx    ← (TO CREATE) Profile/You page
│   │   │   │   ├── leagues/page.tsx ← (TO CREATE) League leaderboard
│   │   │   │   └── ... (30+ other pages)
│   │   │   ├── admin/
│   │   │   └── instructor/
│   │   │
│   │   ├── (main)/              ← Public pages (no auth needed)
│   │   │   ├── page.tsx         ← Landing page (needs redesign)
│   │   │   ├── courses/page.tsx ← Public course catalog
│   │   │   ├── pricing/page.tsx
│   │   │   └── ... other public pages
│   │   │
│   │   └── layout.tsx           ← Root layout
│   │
│   ├── components/              ← Reusable components
│   │   ├── Navbar.tsx           ← Public + logged-in navbar (needs redesign)
│   │   ├── DashboardSidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── AIStudyBuddy.tsx     ← Our "Koji" equivalent
│   │   └── ... others
│   │
│   └── lib/                     ← Utilities
│       ├── auth-storage.ts      ← saveAuthSession(), loadAuthSession()
│       └── ... others
│
├── public/                      ← Static assets
├── package.json                 ← "dev": "next dev --webpack" ← NEVER CHANGE
└── tailwind.config.ts
```

---

## 🔐 AUTH SYSTEM

```typescript
// Save session after login/signup
import { saveAuthSession } from '@/lib/auth-storage'
saveAuthSession({ token, user })

// Load session on protected pages
import { loadAuthSession } from '@/lib/auth-storage'
const session = loadAuthSession()
if (!session) redirect('/login')

// Onboarding prefs (set during signup wizard)
localStorage.setItem('onboarding_goal', 'career')       // career|school|fun|child
localStorage.setItem('onboarding_track', 'cs')          // cs|math|english|physics
localStorage.setItem('onboarding_level', 'beginner')    // beginner|intermediate|advanced

// Enrolled courses
localStorage.setItem('student_enrolled_courses', JSON.stringify(['course-1', 'course-2']))
```

---

## 🎮 GAMIFICATION HELPERS (TO BUILD in `lib/`)

### Keys System — `lib/keys.ts`
```typescript
// Structure to store in localStorage: 'user_keys'
type KeysData = {
  remaining: number      // 0, 1, or 2
  lastResetDate: string  // YYYY-MM-DD
}

// Functions to build:
getKeys(): KeysData          // get current keys (auto-reset if new day)
useKey(): boolean            // use 1 key, returns false if none left
resetKeysIfNewDay(): void    // checks date, resets to 2 if new day
isPremium(): boolean         // check if user has premium (from auth session)
```

### Streak System — `lib/streak.ts`
```typescript
type StreakData = {
  count: number           // current streak days
  lastActiveDate: string  // YYYY-MM-DD
  charges: number         // 0, 1, or 2 (max 2)
  longestStreak: number
}

// Functions to build:
getStreak(): StreakData
markDayComplete(): void       // call when lesson/practice done
checkAndSaveStreak(): void    // run on app load — uses charge if missed day
earnCharge(): void            // call on lesson complete (+1 charge, max 2)
```

### XP System — `lib/xp.ts`
```typescript
type XPData = {
  total: number         // all-time XP
  thisWeek: number      // resets Monday 3am UTC
  weekStartDate: string // date of current week start
}

// Functions to build:
getXP(): XPData
addXP(amount: number): void  // +50 lesson, +10 problem, +200 chapter
resetWeeklyXP(): void        // called Monday 3am UTC
```

---

## 🎨 DESIGN SYSTEM

### Colors (use Tailwind classes)
```
Primary blue:    bg-blue-600 / text-blue-600 / border-blue-600
Dark text:       text-slate-900
Body text:       text-slate-500
Border:          border-slate-200
Card bg:         bg-white
Section bg:      bg-slate-50
Success:         text-emerald-600 / bg-emerald-50
Warning:         text-amber-600 / bg-amber-50
Error:           text-red-600 / bg-red-50
Streak/flame:    text-orange-500
Premium:         bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400
```

### Key UI Patterns (pill buttons everywhere!)
```tsx
// Primary button (filled)
<button className="rounded-full bg-blue-600 text-white px-8 py-3 font-semibold hover:bg-blue-700">
  Continue
</button>

// Secondary button (outlined)
<button className="rounded-full border-2 border-slate-300 text-slate-700 px-8 py-3 font-semibold">
  Maybe later
</button>

// Card
<div className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition">
  ...
</div>

// Selected card (onboarding)
<div className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-6 cursor-pointer">
  ...
</div>

// Keys badge (navbar)
<div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm">
  🔑 <span className="font-semibold text-blue-700">2</span>
</div>

// Streak badge (navbar)
<div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-3 py-1 text-sm">
  🔥 <span className="font-semibold text-orange-700">14</span>
</div>

// Premium pill (Start trial button)
<button className="rounded-full px-4 py-1.5 text-sm font-semibold text-white
  bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400">
  Start trial
</button>
```

---

## 📋 COMPONENT CHECKLIST

### Existing ✅
- `Navbar.tsx` — needs full redesign
- `DashboardSidebar.tsx` — OK
- `Footer.tsx` — minor updates
- `AIStudyBuddy.tsx` — our Koji equivalent, keep + enhance

### To Create ❌
- `KeysBadge.tsx` — 🔑 navbar pill
- `StreakBadge.tsx` — 🔥 navbar pill
- `ChargeBadge.tsx` — ⚡ navbar pill
- `CountdownBanner.tsx` — sub-navbar timer strip
- `StreakCalendar.tsx` — GitHub heatmap for You page
- `LessonEndScreen.tsx` — post-lesson XP popup
- `OutOfKeysScreen.tsx` — when 2 free lessons used
- `PremiumUpsellModal.tsx` — between-lesson upgrade prompt
- `OnboardingCard.tsx` — signup wizard step selector cards
- `LeagueLeaderboard.tsx` — 30-peer weekly leaderboard
- `LearningPathCard.tsx` — courses page path cards
- `CourseProgressBar.tsx` — progress bars on course cards

---

## 🚦 BUILD & DEPLOY

```bash
# Type check
cd frontend && npx tsc --noEmit

# Production build
cd frontend && npx next build --webpack

# Expected output: 44+ pages compiled, 0 TypeScript errors

# If you get useSearchParams() error → wrap in <Suspense>
# Example:
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  )
}
function PageContent() {
  const params = useSearchParams() // safe inside Suspense
  ...
}
```

---

## ⚠️ GOLDEN RULES

1. **Discuss → Approve → Then build** — never code without plan agreement
2. **Backend is off-limits** — never touch `backend/` directory
3. **Max 6 courses** on public catalog grid
4. **Keep `--webpack`** flag — always
5. **4 tracks only:** CS · Math · English · Physics
6. **Never delete** working features without backup
7. **Mobile-first** — all components responsive at `sm:` `md:` `lg:` breakpoints
8. **No dark mode** built in (Brilliant doesn't have it, we don't need it yet)
9. **Pill buttons everywhere** — `rounded-full` for all buttons
10. **`rounded-2xl`** for all cards

---

## 🔗 KEY DOCUMENTS

| Doc | Location | What it covers |
|---|---|---|
| **MASTER PLAN** | `docs/BRILLIANT-INSPIRED-MASTER-PLAN.md` | Everything — A to Z feature list and priority |
| **UI Design Spec** | `docs/05-public-ui-design.md` | Every page wireframe + component code |
| **Routing Spec** | `docs/04-frontend-routing-spec.md` | All routes, navigation flows, component inventory |
| **Roadmap** | `docs/07-development-roadmap.md` | Phase 1-4 implementation checklist |
| **System Overview** | `docs/01-system-overview.md` | Architecture, roles, auth, gamification |
