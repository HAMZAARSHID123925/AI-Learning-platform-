# 🎯 Brilliant.org-Inspired Master Plan
## Pen & Page Academia — Complete A to Z Feature Implementation Plan

> **Last Updated:** September 2026  
> **Status:** Planning Phase — Read before building ANYTHING  
> **Rule:** Discuss every section → Agree → Then implement. Never build without approval.

---

## 📌 OUR PLATFORM vs BRILLIANT — WHAT WE HAVE vs WHAT WE NEED

### ✅ Already Built (Frontend)
| Feature | File | Status |
|---|---|---|
| Public landing page | `(main)/page.tsx` | ✅ Exists — needs redesign |
| Courses catalog | `(main)/courses/page.tsx` | ✅ Exists — needs redesign |
| Pricing page | `(main)/pricing/page.tsx` | ✅ Exists — needs redesign |
| Signup page | `(auth)/signup/page.tsx` | ✅ Exists — needs full redesign |
| Login page | `(auth)/login/page.tsx` | ✅ Exists — OK |
| Dashboard home | `(dashboard)/dashboard/page.tsx` | ✅ Exists — needs redesign |
| Lesson player | `(dashboard)/dashboard/lesson/page.tsx` | ✅ Exists — needs upgrade |
| AI Study Buddy | `components/AIStudyBuddy.tsx` | ✅ Exists — our version of Koji |
| Navbar (public) | `components/Navbar.tsx` | ✅ Exists — needs full redesign |
| Dashboard sidebar | `components/DashboardSidebar.tsx` | ✅ Exists |
| Settings | `(dashboard)/dashboard/settings/page.tsx` | ✅ Exists |
| Instructor portal | `(dashboard)/instructor/page.tsx` | ✅ Exists — our teacher portal |

### ❌ NOT Built Yet (Need to Create)
| Feature | Inspired By | Priority |
|---|---|---|
| Multi-step onboarding flow | Brilliant signup wizard | 🔴 HIGH |
| Keys / daily lesson limit system | Brilliant keys | 🔴 HIGH |
| Streak system + streak charges | Brilliant streaks | 🔴 HIGH |
| XP system | Brilliant XP | 🔴 HIGH |
| Weekly leagues / leaderboard | Brilliant leagues | 🟡 MEDIUM |
| Premium upsell screen (post-signup) | Brilliant trial screen | 🔴 HIGH |
| Countdown banner (sub-navbar) | Brilliant sub-header | 🔴 HIGH |
| Personalized dashboard by track | Brilliant home | 🔴 HIGH |
| Course progress tracking (visual) | Brilliant progress bars | 🔴 HIGH |
| Streak calendar (heatmap) | Brilliant You tab | 🟡 MEDIUM |
| Profile / You page | Brilliant You tab | 🟡 MEDIUM |
| Welcome screen after signup | Brilliant Koji intro | 🔴 HIGH |
| Parent dashboard | Brilliant family | 🟢 LOW |

---

## 🗺️ COMPLETE FEATURE MAP — A TO Z

### SECTION 1: PUBLIC WEBSITE (Before Login)

#### 1.1 Navbar — Public (Not Logged In)
**Brilliant does:** Logo + "Sign in" only (ultra minimal)  
**We should do:**
```
[PPAcademia Logo]                              [Sign in]
```
- Just the logo on the left
- Just "Sign in" text link on the right
- Pure white background, 1px bottom border
- NO other links (no courses, no pricing, no about)

**File to change:** `frontend/src/components/Navbar.tsx`  
**Status:** ❌ Not done

---

#### 1.2 Landing Page — Hero Section (`/`)
**Brilliant does:**
- Big serif headline: "Your personal tutor for math and coding"
- Subheadline explaining value
- TWO CTA buttons: "I'm a learner" (green/filled) + "I'm a parent or teacher" (outlined)
- App store badges
- Right side: interactive visual demo of a lesson

**We should do (adapted for our subjects):**
```
HEADLINE: "Your personal tutor for English, Math, Physics & CS"
or: "Master Any Subject with AI That Adapts to You"

SUBHEADLINE: "From Academic English to Advanced Calculus — 
interactive lessons, AI guidance, and real progress tracking."

TWO CTAs:
[I'm a Student] (primary, our brand color)
[I'm a Teacher or Parent] (secondary, outlined)

App store badges (if we have mobile app)

RIGHT: Interactive preview of a lesson widget
```
**File to change:** `frontend/src/app/(main)/page.tsx`  
**Status:** ❌ Not done (current version is old IELTS-focused)

---

#### 1.3 Landing Page — Trust Strip (3 cards)
**Brilliant does:** 3 bordered stat cards with icons
```
🏆 Fully accredited | ⭐ 100,000+ 5-star reviews | 🌍 10M+ learners
```
**We should do:**
```
🏆 Cambridge & IDP Calibrated | ⭐ 98.4% Accuracy | 🌍 [X] Students
```
**Status:** ❌ Not done in current format

---

#### 1.4 Landing Page — AI Tutor Introduction
**Brilliant does:** Koji mascot + Math/Coding toggle + description + lesson screenshot  
**We should do:**
- Our AI Study Buddy introduction
- Toggle between subjects (English / Math / CS / Physics)
- Show a sample lesson interaction per subject
- Voice/animated mascot (future)

**Status:** ❌ Not done

---

#### 1.5 Landing Page — Subject Coverage
**Brilliant does:** "From grade 5 to college" + 4 subject tabs + lesson preview  
**We should do:**
```
"From IELTS prep to university-level STEM"
Tabs: [Academic English] [Mathematics] [Computer Science] [Physics]
Left: Covered topics list
Right: Sample lesson preview screenshot
```
**Status:** ❌ Not done

---

#### 1.6 Landing Page — Testimonials
**Brilliant does:** Real user cards with photo + name + job title  
**We should do:** Same format with our real/mock students  
**Status:** ❌ Not done in Brilliant style

---

#### 1.7 Landing Page — Footer
**Brilliant does:** 4 columns (Product / Solutions / Company / Legal)  
**We should do:** Same structure, adapted for our platform  
**Status:** ✅ Partially done — needs update

---

### SECTION 2: SIGNUP / ONBOARDING FLOW (`/signup`)

#### 2.1 STEP 1 — Why are you here? (Goal Selection)
Cards (one selectable):
- 💼 Advance my career
- 🎓 Ace school & university
- 🔭 Learn for fun
- 👨‍👩‍👧 For my child

**Behaviour:** Card bounces/scales on selection. "Continue" activates when 1 selected.  
**Status:** ❌ Not done

---

#### 2.2 STEP 2 — What do you want to learn? (Subject/Track)
Cards for our 4 disciplines:
- 📖 Academic English & Rhetoric
- 🧮 Higher Mathematics & Calculus
- 💻 Computer Science & Python
- 🔬 Applied Physics & Sciences

Each card shows: icon + name + description + preview of covered topics (on hover/select)  
**Status:** ❌ Not done

---

#### 2.3 STEP 3 — Experience Level
Cards:
- 🌱 Beginner — Starting from scratch
- ⚡ Intermediate — Know the basics
- 🚀 Advanced — Want deep challenges

**Status:** ❌ Not done

---

#### 2.4 STEP 4 — Create Account
- Continue with Google (OAuth)
- Continue with Apple (OAuth)
- Continue with Email → form: email + password
- Terms agreement
- Progress bar showing "Step 4 of 4"

**Status:** ❌ Not done (current signup has no steps)

---

#### 2.5 STEP 5 — Welcome Screen (post-account)
- "Meet Your AI Study Buddy!" introduction
- Shows their chosen subject track
- "You have 2 free lesson keys today 🔑"
- [Start Your First Lesson] button
- [Browse All Courses] button

**Status:** ❌ Not done

---

#### 2.6 Premium Upsell Screen (right after account creation)
```
💎 Try Premium FREE for 7 days
✓ Unlimited lessons daily
✓ Full AI Study Buddy access
✓ No ads
✓ Jump to any lesson

[Start Free Trial]    [Maybe Later]
```
**Status:** ❌ Not done

---

### SECTION 3: LOGGED-IN NAVBAR

#### 3.1 Navbar — Logged In
**Brilliant does:**
```
Logo | 🏠Home  📚Courses  👤You | [Start trial] [1🔑] [1⚡] [☰]
```
**We should do:**
```
[Logo] | 🏠Home  📚Courses  👤You | [Start trial] [1🔑] [1⚡] [☰]
```
- `[Start trial]` = iridescent/rainbow gradient border pill — ONLY for free users
- `[1🔑]` = daily key count — ONLY for free users — disappears for premium
- `[1⚡]` = streak charge count — shows for all users
- `[☰]` = hamburger menu
- Premium users: no Start trial, no 🔑 keys, just streak + ☰

**File to change:** `frontend/src/components/Navbar.tsx`  
**Status:** ❌ Not done

---

#### 3.2 Sub-Navbar Countdown Banner — Free/Trial Users Only
```
💎 Try Premium FREE for 7 days. Offer ends in 1d 18h 53m 15s. [Start trial]
```
- Gradient background (lavender → peach → soft amber)
- Real-time countdown ticker
- Disappears when user is premium
- Disappears when trial ends and user hasn't converted

**Status:** ❌ Not done

---

#### 3.3 Hamburger Menu Contents
```
☰ Menu
─────────────────
👤 My Profile
⚙️ Settings
💳 Manage Subscription
🌙 Dark / Light Mode
🌐 Language (English)
❓ Help & Support
────────────────
🚪 Sign Out
```
**Status:** ❌ Not done (current hamburger is basic)

---

### SECTION 4: HOME DASHBOARD (`/dashboard`)

#### 4.1 Personalized "Up Next" Card
- Shows course based on their chosen subject from onboarding
- Shows current lesson name + progress bar
- Estimated time: "~12 mins"
- Key cost shown: "Uses 1 🔑"
- [Continue →] button

**Free users:** Shows key cost  
**Premium users:** No key cost shown  
**Status:** ❌ Partially exists — needs personalisation + keys system

---

#### 4.2 Daily Practice Section
- 3 adaptive problems from their weak areas
- "Based on your recent activity"
- Uses 1 key for free users
- [Start Practice] button

**Status:** ❌ Not done

---

#### 4.3 Daily Goal Tracker (Right Sidebar)
```
Today's Goal
● ● ○    ← dots for 3 daily problems
1 of 3 complete

🔥 Streak: 14 days
```
**Status:** ❌ Not done

---

#### 4.4 Keys Counter (Right Sidebar) — Free Users Only
```
🔑 2 keys today
Each key = 1 lesson
Resets at midnight
```
**Premium users:** This section hidden  
**Status:** ❌ Not done

---

#### 4.5 Streak Charges (Right Sidebar)
```
⚡ 1 streak charge banked
(max 2 — auto-saves streak if you miss a day)
```
**Status:** ❌ Not done

---

#### 4.6 League Standings (Right Sidebar)
```
🏆 Carbon League
You: Rank #8 of 30 this week
320 XP this week
[See leaderboard]
```
**Status:** ❌ Not done

---

### SECTION 5: COURSES PAGE (`/courses`)

#### 5.1 Subject Filter Tabs
```
[ All ]  [ Academic English ]  [ Mathematics ]  [ Computer Science ]  [ Applied Physics ]
```
**Status:** ❌ Not done in this format

---

#### 5.2 Learning Paths Section (Top)
```
📍 LEARNING PATHS

[English Path]        [Math Path]
Foundation →          Pre-Calc →
Academic Writing →    Algebra →
Rhetoric →            Calculus →
IELTS Mastery         Linear Algebra

[CS Path]             [Physics Path]
Python Intro →        Everyday Physics →
Algorithms →          Mechanics →
Data Structures →     Quantum →
AI Fundamentals       Circuits
```
**Status:** ❌ Not done

---

#### 5.3 Course Grid
Each card:
- Subject icon + color theme
- Course name
- Difficulty badge (Beginner/Intermediate/Advanced)
- Lesson count
- Estimated hours
- Progress bar (if started)
- 🔒 lock for sequential lock (free users)

**Max visible on public page:** 6 cards (existing rule)  
**Logged-in:** All courses visible  
**Status:** ✅ Partially exists — needs redesign

---

### SECTION 6: LESSON PLAYER (`/dashboard/lesson`)

#### 6.1 Lesson Structure (Not just video!)
Brilliant's approach — we should adapt:
1. Text explanation + visual diagram
2. Interactive problem (MCQ / fill blank / etc.)
3. ✅ Correct → WHY explanation → next step
4. ❌ Wrong → hint from AI Study Buddy → try again
5. Repeat 8-15 steps
6. Lesson end screen with XP earned

**Current:** We show videos only  
**Future:** Add interactive problems after video  
**Status:** ❌ Needs upgrade

---

#### 6.2 Lesson End Screen
```
Lesson Complete! 🎉
+50 XP earned
🔥 Streak maintained!
Concept mastered: ✓ Clause Construction

[Next Lesson →]    [Back to Course]
```
**Status:** ❌ Not done

---

#### 6.3 Out of Keys Screen (Free Users)
```
🔑 You're out of keys today!
Free learners get 2 lessons/day.
Keys reset at midnight your time.
🕛 Next keys in: 14h 23m

[💎 Get unlimited access]
[Come back tomorrow]
```
**Status:** ❌ Not done

---

### SECTION 7: "YOU" / PROFILE PAGE (`/dashboard/you` or `/you`)

#### 7.1 Profile Header
```
[Avatar/Initials]  Alex Johnson
                   Free Plan  [Upgrade]
                   Member since Sep 2026
```

#### 7.2 Streak Calendar
- GitHub-style activity heatmap
- Green squares for active days
- 🔥 Current streak: 14 days
- 🏆 Longest: 21 days

#### 7.3 XP & League
- Total XP this week
- League tier + rank (#8 of 30)
- [See leaderboard] link

#### 7.4 Course Progress
- List of all enrolled courses
- % complete + lessons done

#### 7.5 Keys & Charges
- 🔑 Keys: 2/2 today (free only)
- ⚡ Streak charges: 1/2

**Status:** ❌ Not done (no dedicated You/Profile page)

---

### SECTION 8: GAMIFICATION SYSTEM

#### 8.1 Keys System
- Free users: 2 keys/day
- Each key = 1 lesson or practice set
- Reset at midnight local time
- Premium: no keys needed (unlimited)
- Visual: 🔑 count in navbar

**Implementation:**
- Stored in `localStorage` for now: `{ keys: 2, lastReset: "date" }`
- Check on lesson load — if 0 keys → show out-of-keys screen

**Status:** ❌ Not done

---

#### 8.2 Streak System
- Maintained by: completing 3 problems OR 1 lesson per day
- Broken: missing a day with no charge banked
- Visual: 🔥 flame + number in navbar/dashboard

**Streak Charges:**
- Earned: 1 charge per lesson completed (max 2 banked)
- Auto-used: overnight if user missed the day
- Visual: ⚡ count in navbar

**Implementation:**
- Stored in `localStorage`: `{ streak: 14, charges: 1, lastActive: "date" }`

**Status:** ❌ Not done

---

#### 8.3 XP System
- Earned: +50 XP per lesson, +10 XP per correct problem
- Displayed: in navbar, on dashboard, on You page
- Used for: weekly league ranking

**Status:** ❌ Not done

---

#### 8.4 League System
- 30 users per league group
- Weekly reset: Monday 3am UTC
- 10 tiers: Bronze → Silver → Gold → ... → Diamond (our naming)
- Or use Brilliant names: Hydrogen → Einsteinium
- Top 5 → promoted, Bottom 5 → relegated

**Status:** ❌ Not done

---

### SECTION 9: PREMIUM vs FREE — IMPLEMENTATION RULES

| Feature | Free User | Premium User |
|---|---|---|
| Navbar | Shows `[Start trial]` `[🔑]` + countdown banner | Clean — no trial button, no 🔑 |
| Home | Keys warning shown, upsell cards | No friction, seamless flow |
| Lessons/day | 2 keys limit | Unlimited |
| Course order | Sequential only | Jump to any lesson |
| AI Study Buddy | 2-3 free hints per lesson | Full, unlimited |
| Ads/upsells | Between lessons | None |
| Price display | Free + upgrade prompts | "Premium" badge |

---

### SECTION 10: INSTRUCTOR / TEACHER PORTAL

#### Our Equivalent of Brilliant for Educators
Route: `/instructor`  
Already exists at: `(dashboard)/instructor/page.tsx`

**What Brilliant does:**
- Create classes + import Google Classroom
- Browse courses → share link to students
- Track who started/finished/time spent
- Students get free premium

**What we should add:**
- Class creation form
- Student invitation system (email invite)
- Assignment tool (link to specific lesson)
- Progress tracker per student per course
- Instructor gets premium-equivalent access

**Status:** ✅ Basic portal exists — needs these specific tools

---

### SECTION 11: SETTINGS PAGE

**Route:** `/dashboard/settings` (already exists)

**Add to existing settings:**
- 🔔 Notification preferences (daily reminder time, league alerts, streak alerts)
- 💳 Subscription management (Free/Premium, billing date, cancel)
- 🌐 Language preference (English as primary)
- ⚡ Streak charge display
- 🗑️ Delete account option

**Status:** ✅ Exists — needs items above added

---

### SECTION 12: PARENT / FAMILY PLAN

**Our equivalent:**
- Family Plan pricing tier on `/pricing`
- Up to 6 members on one subscription
- Parent account sees all children's progress
- Children need own accounts

**Status:** ❌ Not done — LOW PRIORITY for now

---

## 📋 IMPLEMENTATION ORDER (Priority Queue)

### 🔴 PHASE 1 — Core UX Overhaul (Do First)
| # | Task | File(s) | Estimated Effort |
|---|---|---|---|
| 1 | Redesign public Navbar (ultra-minimal, just Logo + Sign In) | `Navbar.tsx` | Small |
| 2 | Redesign Landing Page (hero + trust strip + AI tutor section + subjects + testimonials) | `(main)/page.tsx` | Large |
| 3 | Build Multi-Step Signup (5 steps: goal→track→level→account→welcome) | `(auth)/signup/page.tsx` | Large |
| 4 | Build Premium Upsell Screen (post-signup modal) | New component | Medium |
| 5 | Redesign Logged-In Navbar (Home+Courses+You + trial badge + 🔑 + ⚡ + ☰) | `Navbar.tsx` | Medium |
| 6 | Add Countdown Sub-Banner below navbar | `Navbar.tsx` or layout | Small |

### 🟡 PHASE 2 — Gamification Foundation
| # | Task | File(s) | Estimated Effort |
|---|---|---|---|
| 7 | Build Keys System (localStorage, daily reset, navbar counter) | New: `lib/keys.ts` | Medium |
| 8 | Build Streak System (daily tracking, charges, auto-use) | New: `lib/streak.ts` | Medium |
| 9 | Build XP System (earn per lesson/problem) | New: `lib/xp.ts` | Small |
| 10 | Redesign Dashboard Home (Up Next + Daily goal + sidebar widgets) | `dashboard/page.tsx` | Large |
| 11 | Add "Out of Keys" screen to Lesson Player | `dashboard/lesson/page.tsx` | Small |
| 12 | Add Lesson End Screen (+XP, streak maintained, next lesson) | `dashboard/lesson/page.tsx` | Medium |

### 🟡 PHASE 3 — Profile & Courses
| # | Task | File(s) | Estimated Effort |
|---|---|---|---|
| 13 | Create "You" Profile Page (streak calendar + XP + league + courses) | New: `dashboard/you/page.tsx` | Large |
| 14 | Redesign Courses Page (filter tabs + learning paths + course grid) | `(main)/courses/page.tsx` | Large |
| 15 | Add League System (weekly leaderboard, 10 tiers) | New: `dashboard/leagues/page.tsx` | Large |
| 16 | Add Streak Calendar (heatmap component) | New: `components/StreakCalendar.tsx` | Medium |

### 🟢 PHASE 4 — Polish & Complete
| # | Task | File(s) | Estimated Effort |
|---|---|---|---|
| 17 | Update Settings page (notifications + subscription + language) | `dashboard/settings/page.tsx` | Medium |
| 18 | Update Hamburger Menu (full menu with all options) | `Navbar.tsx` | Small |
| 19 | Update Pricing Page (Free/Monthly/Annual/Family comparison) | `(main)/pricing/page.tsx` | Medium |
| 20 | Update Instructor Portal (class creation + student tracking) | `instructor/page.tsx` | Large |
| 21 | Add Personalization (dashboard shows chosen track content) | Multiple files | Large |

---

## 🎨 DESIGN SYSTEM — What We Copy From Brilliant

### Colors (adapted for our brand)
| Element | Brilliant's Color | Our Color |
|---|---|---|
| Primary CTA | Green `#4CAF50` | Our brand blue `#027FFF` |
| Background | White `#FFFFFF` | White `#FFFFFF` |
| Section BG | Light gray `#F5F5F5` | Light gray `#F5F5F5` |
| Headings | Black `#0A0A0A` | Slate `#1E293B` |
| Body text | Gray `#555` | Gray `#64748B` |
| Accent | Green gem | Blue AI chip |
| Keys badge | Blue pill | Blue pill `#027FFF` |
| Streak | Orange/red flame | Orange flame |
| Premium | Purple/iridescent | Purple/gold gradient |

### Typography
- Headings: Large, bold, serif-inspired — we use Tailwind `font-bold text-5xl`
- Body: Clean sans-serif — we use Inter (already in globals)
- Code/math: Mono — Source Code Pro

### Component Patterns
- Cards: `rounded-2xl border border-slate-200 shadow-sm`
- Buttons: `rounded-full` (pill style) — matching Brilliant's pill buttons
- Badges: `rounded-full px-3 py-1` — for keys, streaks, leagues
- Progress bars: `rounded-full bg-blue-500 h-1.5`
- Trust strip: `grid grid-cols-3 border border-slate-200 rounded-xl`

---

## ⚠️ IMPORTANT RULES — Do NOT Violate

1. **Backend is OFF-LIMITS** — frontend team only touches `frontend/` directory
2. **Max 6 courses** on public course catalog grid
3. **`"dev": "next dev --webpack"`** in package.json — never switch to turbopack
4. **Frontend: `localhost:3001`** — Backend: `localhost:8000`
5. **Our 4 disciplines only:** CS & Python, Higher Math, Academic English, Applied Physics
6. **Discuss before building** — show plan, get approval, then implement
7. **Never delete existing working features** — always extend, never replace without backup

---

## 📁 DOCS TO UPDATE

After this plan is approved, these files need updating:

| Doc File | What to Update |
|---|---|
| `docs/05-public-ui-design.md` | Full redesign spec matching Brilliant layout |
| `docs/07-development-roadmap.md` | Replace with Phase 1-4 from this plan |
| `docs/04-frontend-routing-spec.md` | Add new routes: `/you`, `/leagues`, `/welcome` |
| `docs/01-system-overview.md` | Add gamification system overview |
| `frontend/README.md` | Update with new features and running instructions |
| `frontend/AGENTS.md` | Update with new component inventory |

---

## 🔚 SUMMARY — What Brilliant Does That We Need To Copy

```
PUBLIC SITE
✅ Ultra-minimal navbar (Logo + Sign in only)
✅ Big serif headline
✅ Two CTA split (Student vs Teacher/Parent)  
✅ 3-card trust strip
✅ AI tutor intro section with subject toggle
✅ "Grade range" / subject coverage section with tabs
✅ Real testimonials with photos + names + jobs
✅ Dark closing CTA section
✅ 4-column footer

SIGNUP (5 steps — collect BEFORE account creation)
✅ Step 1: Goal selection (4 cards)
✅ Step 2: Subject/track selection (4 disciplines)
✅ Step 3: Experience level (Beginner/Intermediate/Advanced)
✅ Step 4: Account creation (Google/Apple/Email)
✅ Step 5: Welcome + AI tutor intro + keys explained
✅ Premium upsell immediately after account creation

LOGGED-IN NAVBAR
✅ Left: Logo + Home + Courses + You
✅ Right: Start trial + 🔑 Keys + ⚡ Streak + ☰ Hamburger
✅ Sub-header: countdown banner (free/trial users only)
✅ Premium users: no trial button, no keys, clean navbar

HOME DASHBOARD
✅ Up Next card (personalized to their track)
✅ Daily practice section (3 problems)
✅ Daily goal tracker + streak counter
✅ Keys remaining (free users only)
✅ Streak charges counter
✅ League standings sidebar

COURSES PAGE
✅ Subject filter tabs (4 disciplines)
✅ Learning Paths section at top
✅ Course grid (all courses visible, some locked)
✅ Lock icons for sequential courses (free users)

LESSON PLAYER
✅ Steps 1-N with interactive problems
✅ Correct → explanation → advance
✅ Wrong → hint → try again
✅ Lesson end: XP earned + streak maintained
✅ Out of keys screen (free users after 2 lessons)

YOU / PROFILE PAGE
✅ Streak calendar heatmap
✅ XP + League rank
✅ Course progress list
✅ Keys + charges status
✅ Settings shortcut

GAMIFICATION
✅ 🔑 Keys: 2/day free, unlimited premium, midnight reset
✅ ⚡ Streak charges: earn by lesson, max 2, auto-save streak
✅ 🔥 Streak: consecutive days, shown everywhere
✅ ⭐ XP: earned per lesson/problem, used for leagues
✅ 🏆 Leagues: 10 tiers, 30 peers, weekly Monday reset

SETTINGS
✅ Notifications (daily reminder, streak, league)
✅ Subscription management
✅ Language preference
✅ Account deletion

TEACHER PORTAL (our instructor page)
✅ Class creation
✅ Student invitation + tracking
✅ Course assignment
✅ Progress dashboard per student
✅ Free premium for all students
```

---

*This document is the single source of truth for what we are building and in what order.*  
*Do not build anything that is not in this plan without updating this document first.*
