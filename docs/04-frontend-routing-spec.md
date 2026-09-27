# Pen & Page Academia — Frontend Routing Specification
## Complete Route Map — All Pages & Their Purpose

---

## 🌐 PUBLIC ROUTES (No Auth Required)

| Route | File | Description | Status |
|---|---|---|---|
| `/` | `(main)/page.tsx` | Public landing page — Hero, trust strip, subject showcase, testimonials | ❌ Needs redesign |
| `/courses` | `(main)/courses/page.tsx` | Course catalog — Filter tabs + Learning Paths + Course grid (max 6 public) | ❌ Needs redesign |
| `/pricing` | `(main)/pricing/page.tsx` | Pricing plans — Free / Monthly / Annual / Family / Educator | ❌ Needs update |
| `/about` | `(main)/about/page.tsx` | About us page | ✅ Exists |
| `/contact` | `(main)/contact/page.tsx` | Contact form | ✅ Exists |
| `/how-it-works` | `(main)/how-it-works/page.tsx` | Platform explanation | ✅ Exists |
| `/checkout` | `(main)/checkout/page.tsx` | Payment / subscription checkout | ✅ Exists |
| `/diagnostic` | `(main)/diagnostic/page.tsx` | Free diagnostic test (public) | ✅ Exists |
| `/courses/[id]` | `(main)/courses/[id]/page.tsx` | Individual course preview page | ✅ Exists |

---

## 🔐 AUTH ROUTES (No Auth Required — Guest Only)

| Route | File | Description | Status |
|---|---|---|---|
| `/signup` | `(auth)/signup/page.tsx` | **5-step onboarding wizard** → Goal → Track → Level → Account → Welcome | ❌ Needs full rebuild |
| `/login` | `(auth)/login/page.tsx` | Login with email / Google / Apple | ✅ OK |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | Request password reset | ✅ OK |
| `/reset-password` | `(auth)/reset-password/page.tsx` | Set new password via token | ✅ OK |

---

## 🏠 DASHBOARD ROUTES (Auth Required — Student)

| Route | File | Description | Status |
|---|---|---|---|
| `/dashboard` | `(dashboard)/dashboard/page.tsx` | **Main Home** — Up Next + Daily goal + Keys + Streak + League sidebar | ❌ Needs redesign |
| `/dashboard/lesson` | `(dashboard)/dashboard/lesson/page.tsx` | **Lesson Player** — video + interactive problems + Koji hints + XP | ✅ Exists (needs XP/keys) |
| `/dashboard/courses` | `(dashboard)/dashboard/courses/page.tsx` | My enrolled courses list | ✅ Exists |
| `/dashboard/you` | *(new)* `(dashboard)/dashboard/you/page.tsx` | **Profile Page** — streak calendar + XP + league + course progress | ❌ NOT BUILT |
| `/dashboard/leagues` | *(new)* `(dashboard)/dashboard/leagues/page.tsx` | **Weekly Leagues** — leaderboard of 30 peers, 10 tiers | ❌ NOT BUILT |
| `/dashboard/settings` | `(dashboard)/dashboard/settings/page.tsx` | Account, notifications, subscription management | ✅ Exists (needs updates) |
| `/dashboard/adaptive` | `(dashboard)/dashboard/adaptive/page.tsx` | Adaptive learning practice | ✅ Exists |
| `/dashboard/adaptive/[id]` | `(dashboard)/dashboard/adaptive/[id]/page.tsx` | Individual adaptive session | ✅ Exists |
| `/dashboard/ai-exam` | `(dashboard)/dashboard/ai-exam/page.tsx` | AI exam generator | ✅ Exists |
| `/dashboard/analytics` | `(dashboard)/dashboard/analytics/page.tsx` | Personal analytics | ✅ Exists |
| `/dashboard/assignments` | `(dashboard)/dashboard/assignments/page.tsx` | Assignments from instructor | ✅ Exists |
| `/dashboard/certificates` | `(dashboard)/dashboard/certificates/page.tsx` | Earned certificates | ✅ Exists |
| `/dashboard/community` | `(dashboard)/dashboard/community/page.tsx` | Community/forum | ✅ Exists |
| `/dashboard/diagnostic` | `(dashboard)/dashboard/diagnostic/page.tsx` | Placement diagnostic | ✅ Exists |
| `/dashboard/grammar` | `(dashboard)/dashboard/grammar/page.tsx` | Grammar practice | ✅ Exists |
| `/dashboard/mock-exam` | `(dashboard)/dashboard/mock-exam/page.tsx` | Mock exam simulator | ✅ Exists |
| `/dashboard/results` | `(dashboard)/dashboard/results/page.tsx` | Exam results viewer | ✅ Exists |
| `/dashboard/simulator` | `(dashboard)/dashboard/simulator/page.tsx` | IELTS simulator | ✅ Exists |
| `/dashboard/vocabulary` | `(dashboard)/dashboard/vocabulary/page.tsx` | Vocabulary practice | ✅ Exists |
| `/dashboard/writing` | `(dashboard)/dashboard/writing/page.tsx` | Writing practice | ✅ Exists |
| `/dashboard/live` | `(dashboard)/dashboard/live/page.tsx` | Live session | ✅ Exists |

---

## 👩‍🏫 INSTRUCTOR ROUTES (Auth Required — Instructor Role)

| Route | File | Description | Status |
|---|---|---|---|
| `/instructor` | `(dashboard)/instructor/page.tsx` | **Instructor Portal** — class management, assignments, student tracking | ✅ Exists (needs enhancements) |

---

## 🔧 ADMIN ROUTES (Auth Required — Admin Role)

| Route | File | Description | Status |
|---|---|---|---|
| `/admin` | `(dashboard)/admin/page.tsx` | Admin dashboard | ✅ Exists |
| `/admin/courses` | `(dashboard)/admin/courses/page.tsx` | Course management | ✅ Exists |
| `/admin/analytics` | `(dashboard)/admin/analytics/page.tsx` | Platform analytics | ✅ Exists |

---

## 🆕 NEW ROUTES TO CREATE

| Route | File to Create | Purpose | Priority |
|---|---|---|---|
| `/dashboard/you` | `(dashboard)/dashboard/you/page.tsx` | Profile — streak cal + XP + league + courses | 🔴 HIGH |
| `/dashboard/leagues` | `(dashboard)/dashboard/leagues/page.tsx` | Weekly league leaderboard (10 tiers, 30 peers) | 🟡 MEDIUM |
| `/welcome` | `(auth)/welcome/page.tsx` | Post-signup welcome screen (Step 5 of onboarding) | 🔴 HIGH |
| `/upgrade` | `(main)/upgrade/page.tsx` | Premium upsell page (from "Start trial" clicks) | 🔴 HIGH |

---

## 🧭 NAVIGATION FLOWS

### Flow 1: New Visitor → Student
```
/ (landing)
  ↓ click "I'm a Student"
/signup (Step 1: Goal)
  ↓
/signup (Step 2: Track)
  ↓
/signup (Step 3: Level)
  ↓
/signup (Step 4: Account creation)
  ↓
/welcome (Step 5: AI Buddy intro + keys explained)
  ↓ (premium upsell modal shown)
/dashboard (Home — personalised to chosen track)
```

### Flow 2: New Visitor → Teacher
```
/ (landing)
  ↓ click "I'm a Teacher or Parent"
/instructor (or external educator portal)
  ↓ apply with school email
/instructor (approved — full portal access)
```

### Flow 3: New Visitor → Parent
```
/ (landing)
  ↓ click "I'm a Teacher or Parent"
/pricing (Family Plan shown prominently)
  ↓ choose Family Plan
/checkout (payment)
  ↓ invite family members
/dashboard (each member's own account)
```

### Flow 4: Returning User (Free)
```
Email/push notification → opens /dashboard
  ↓ see "Up Next" card
/dashboard/lesson (uses 1 key)
  ↓ lesson complete
Lesson End Screen (+XP, streak maintained)
  ↓ click Next Lesson → uses 2nd key
  ↓ 2nd lesson complete
Out of Keys Screen → upsell OR "Come back tomorrow"
```

### Flow 5: Returning User (Premium)
```
Opens /dashboard
  ↓ see "Up Next" card (no key warning)
/dashboard/lesson (no key limit)
  ↓ lesson complete
Lesson End Screen (+XP)
  ↓ Next → Next → Next (unlimited)
  ↓ finish course → next course in Learning Path suggested
```

---

## 📦 COMPONENT INVENTORY

### Existing Components
| Component | File | Used On |
|---|---|---|
| Public Navbar | `components/Navbar.tsx` | All public + auth pages |
| Dashboard Sidebar | `components/DashboardSidebar.tsx` | All dashboard pages |
| Admin Sidebar | `components/AdminSidebar.tsx` | Admin pages |
| Teacher Sidebar | `components/TeacherSidebar.tsx` | Instructor pages |
| Footer | `components/Footer.tsx` | Public pages |
| AI Study Buddy | `components/AIStudyBuddy.tsx` | Dashboard pages |
| Toast Provider | `components/ToastProvider.tsx` | Global |
| Diagnostic Modal | `components/DiagnosticPlacementModal.tsx` | Dashboard |
| Chart Renderer | `components/writing/Task1ChartRenderer.tsx` | Writing page |

### New Components to Create
| Component | File | Purpose |
|---|---|---|
| Keys Badge | `components/KeysBadge.tsx` | 🔑 key count pill (navbar) |
| Streak Badge | `components/StreakBadge.tsx` | 🔥 streak count pill (navbar) |
| Charge Badge | `components/ChargeBadge.tsx` | ⚡ charge count pill (navbar) |
| Countdown Banner | `components/CountdownBanner.tsx` | Sub-navbar timer (free users) |
| Streak Calendar | `components/StreakCalendar.tsx` | Heatmap on You page |
| Lesson End Screen | `components/LessonEndScreen.tsx` | Post-lesson XP popup |
| Out of Keys Screen | `components/OutOfKeysScreen.tsx` | When free user hits limit |
| Premium Upsell Modal | `components/PremiumUpsellModal.tsx` | Between-lesson upsell |
| Onboarding Step Card | `components/OnboardingCard.tsx` | Signup wizard step cards |
| League Leaderboard | `components/LeagueLeaderboard.tsx` | League page + dashboard |
| Course Progress Bar | `components/CourseProgressBar.tsx` | Course cards + You page |
| Learning Path Card | `components/LearningPathCard.tsx` | Courses page |

---

## 🔒 ROUTE PROTECTION RULES

| Route Group | Protection | Redirect if fails |
|---|---|---|
| `(main)/*` | None — public | — |
| `(auth)/*` | Redirect if already logged in | `/dashboard` |
| `(dashboard)/*` | Must be authenticated | `/login` |
| `/admin/*` | Must be `role = admin` | `/dashboard` |
| `/instructor` | Must be `role = instructor` | `/dashboard` |
