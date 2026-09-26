# Pen & Page Academia — Public UI Design Specification
## Brilliant.org-Inspired Layout — Full Screen-by-Screen Design Guide

> **Platform:** Pen & Page Academia  
> **Inspiration:** Brilliant.org (studied A to Z — see `docs/BRILLIANT-INSPIRED-MASTER-PLAN.md`)  
> **Our 4 disciplines:** Academic English · Higher Mathematics · Computer Science · Applied Physics

---

## 🌐 PAGE 1: PUBLIC LANDING PAGE (`/`)

### NAVBAR — Public (Not Logged In)
```
[PPAcademia Logo]                              [Sign in]
─────────────────────────────────────────────────────────
```
- Pure white background, `border-b border-slate-100`
- Logo: left-aligned, our brand mark + "Pen & Page Academia"
- Sign in: right-aligned, plain text link `text-slate-700 hover:text-blue-600`
- NO other navigation links (Brilliant rule: ultra-minimal public navbar)
- Height: `h-16` sticky top

---

### SECTION 1: HERO
```
LEFT SIDE:
──────────
[Small label] "Get started for free."

[Big Serif Headline]
"Your personal tutor for
 English, Math, Physics & CS"

[Subheadline]
"Interactive lessons, AI-powered guidance,
 and real progress tracking — designed for
 every level from foundation to university."

[TWO BUTTONS side by side]
🟦 [I'm a Student]          ⬜ [I'm a Teacher or Parent]
   (filled, brand blue)        (outlined, white bg)

[App badge row — optional]
[📱 App Store]  [▶ Google Play]

RIGHT SIDE:
──────────
[Interactive lesson preview card]
Shows a sample lesson widget — e.g:
"What type of clause is this sentence?"
  ○ Independent   ● Dependent   ○ Relative
  [Check Answer]
```

**Design specs:**
- Headline: `text-5xl font-bold leading-tight text-slate-900`
- Subheadline: `text-lg text-slate-500 mt-4 max-w-xl`
- "I'm a Student" button: `rounded-full bg-blue-600 text-white px-8 py-3 font-semibold`
- "I'm a Teacher or Parent" button: `rounded-full border-2 border-slate-300 text-slate-700 px-8 py-3`
- Background: white, NO hero gradient (clean like Brilliant)

---

### SECTION 2: TRUST STRIP
```
┌──────────────────┬──────────────────┬───────────────────┐
│  🏆              │  ⭐⭐⭐⭐⭐        │  🌍               │
│  Fully accredited│  98.4% success   │  10,000+          │
│  Cambridge       │  rate            │  students         │
│  calibrated      │  100,000+ problems│  worldwide       │
└──────────────────┴──────────────────┴───────────────────┘
```
- `grid grid-cols-3 border border-slate-200 rounded-2xl divide-x`
- Each cell: `p-6 text-center`
- Icon: large emoji or custom SVG, `text-4xl mb-2`
- Title: `font-bold text-slate-900 text-lg`
- Subtitle: `text-slate-500 text-sm`

---

### SECTION 3: AI STUDY BUDDY INTRO
```
[Centered AI chip icon — our mascot logo]

"Meet Your AI Study Buddy"

Toggle row:  [English]  [Math]  [CS]  [Physics]
             ↑ dark filled = selected

LEFT TEXT (changes per tab):
"A visual, interactive tutor for Academic English"
• Explains WHY your essay logic is weak
• Gives Socratic hints — never just the answer
• Tracks your clause construction in real time

RIGHT: Screenshot or animated preview
of our AI Study Buddy in action
```
**Design:**
- Icon: centered, `w-16 h-16 rounded-2xl bg-blue-600 mx-auto mb-6`
- Heading: `text-3xl font-bold text-slate-900 text-center`
- Toggle: `flex gap-2 bg-slate-100 p-1 rounded-full mx-auto w-fit`
- Active tab: `bg-slate-900 text-white rounded-full px-5 py-2`

---

### SECTION 4: SUBJECT COVERAGE
```
"From Foundation Level to University and Beyond"

Filter tabs:
[Computer Science] [Mathematics] [Academic English ●] [Physics]
                                  ^ selected = dark

LEFT COLUMN:                    RIGHT COLUMN:
Covered topics list:            Interactive lesson preview
• Academic writing              (animated/screenshot)
• Clause construction
• IELTS essay structure
• Rhetoric & argumentation
• Grammar mastery
• Vocabulary in context
```
**Design:** Two-column, `grid grid-cols-2 gap-12`  
- Background: `bg-slate-50` full-width section  

---

### SECTION 5: "ALWAYS ON YOUR SCHEDULE"
```
LEFT: Real photo of student studying
RIGHT:
"Learn in 15 minutes a day or binge for hours.
 Your AI Study Buddy never sleeps."

• Daily streak keeps you consistent
• 2 free lessons every day
• Midnight key reset — fresh start daily
• iOS widget to track your streak
```

---

### SECTION 6: "BUILT WITH EXPERTS"
```
"Designed with leading education standards"

Logo strip: [Cambridge] [IELTS] [IDP] [Common Core] [AQA]

RIGHT: Photo of tutors/campus
```

---

### SECTION 7: TESTIMONIALS
```
"Loved by Students of All Ages"
                    ● ○ ○ ○    ← pagination dots

[Card 1]                [Card 2]                [Card 3]
[Photo]                 [Photo]                 [Photo]
"I went from band 6    "The Math path took     "CS finally clicked
 to 7.5 in 8 weeks."    me from algebra to      for me after years
                        calculus in 3 months."   of struggle."
— Aisha R.             — Hamid K.               — Sarah L.
  IELTS Student          University Prep          Career Switcher
```
- Cards: `rounded-2xl border border-slate-200 p-6 bg-white`
- Photo: `w-12 h-12 rounded-full object-cover mb-4`
- Quote: `text-slate-700 italic mb-4`
- Name: `font-semibold text-slate-900`
- Title: `text-slate-500 text-sm`

---

### SECTION 8: DARK CLOSING CTA
```
[Full black background #0A0A0A]

"The best learning companion you'll ever have."

[I'm a Student]   [Start for free]
```
- `bg-slate-950 text-white py-32 text-center`
- Heading: `text-5xl font-bold text-white`

---

### FOOTER
```
[Logo + tagline]

Product          Learn              Company          Legal
Courses          English Track      About Us         Privacy Policy
Pricing          Math Track         Careers          Terms of Service
Instructor       CS Track           Blog             Cookie Policy
For Students     Physics Track      Contact Us       Refund Policy

© 2026 Pen & Page Academia. All rights reserved.
[🌐 English ▾]
```
- `bg-slate-900 text-slate-400`
- `grid grid-cols-4 gap-12`

---

## 📝 PAGE 2: SIGNUP PAGE (`/signup`)

### PROGRESS BAR (top of all steps)
```
Step 1 of 4
[━━━━━░░░░░░░]  25%
```

### STEP 1 — Your Goal
```
"Why are you here?"

[Card: 💼 Career Growth]     [Card: 🎓 School & Uni]
Advance professionally       Prep for exams & degrees

[Card: 🔭 Personal Growth]   [Card: 👨‍👩‍👧 For My Child]
Learn out of curiosity       Help my child succeed

[Continue →]  (grayed out until 1 selected)
```
- Cards: `rounded-2xl border-2 border-slate-200 p-6 cursor-pointer`
- Selected: `border-blue-600 bg-blue-50`
- Tap animation: `scale-95 → scale-100` spring effect

### STEP 2 — Your Subject
```
"What do you want to learn?"

[Card: 📖 Academic English]  [Card: 🧮 Higher Mathematics]
IELTS · Writing · Rhetoric   Algebra → Calculus → More

[Card: 💻 Computer Science]  [Card: 🔬 Applied Physics]
Python · Algorithms · AI     Mechanics · Circuits · Quantum
```

### STEP 3 — Your Level
```
"Where are you right now?"

[Card: 🌱 Beginner]
I'm starting from scratch

[Card: ⚡ Intermediate]
I know the basics, want to go deeper

[Card: 🚀 Advanced]
I want challenging, university-level content
```

### STEP 4 — Create Account
```
"Create your account"

[🔵 Continue with Google]
[⬛ Continue with Apple]
─── or ───
[Email input]
[Password input]
[Create account]

By signing up you agree to our Terms & Privacy Policy.
Already have an account? Sign in
```

### STEP 5 — Welcome Screen
```
[AI Study Buddy icon animated]

"Welcome to Pen & Page Academia!"

You chose: 💻 Computer Science
Level: Intermediate
Goal: Career Growth

🔑 You have 2 free lesson keys today

[▶ Start your first lesson]
[Browse all courses]
```

---

## 🔐 PAGE 3: LOGIN PAGE (`/login`) — Keep as-is
No changes needed to login page structure.  
Just ensure it links back to new signup flow.

---

## 📚 PAGE 4: COURSES PAGE (`/courses`)

### Subject Filter Tabs
```
[ All ●]  [ Academic English ]  [ Mathematics ]  [ Computer Science ]  [ Applied Physics ]
```
- `flex gap-2 border-b border-slate-200 pb-0`
- Active: `border-b-2 border-blue-600 text-blue-600 font-semibold`

### Learning Paths Section
```
📍 Learning Paths

┌────────────────────────────┐  ┌────────────────────────────┐
│ 📖 English Path            │  │ 🧮 Math Path               │
│ Foundation →               │  │ Pre-Algebra →              │
│ Academic Writing →         │  │ Algebra →                  │
│ Rhetoric →                 │  │ Calculus →                 │
│ IELTS Mastery              │  │ Linear Algebra             │
│ [Start Path →]             │  │ [Start Path →]             │
└────────────────────────────┘  └────────────────────────────┘

┌────────────────────────────┐  ┌────────────────────────────┐
│ 💻 CS Path                 │  │ 🔬 Physics Path            │
│ Python Intro →             │  │ Everyday Physics →         │
│ Algorithms →               │  │ Mechanics →                │
│ Data Structures →          │  │ Circuits →                 │
│ AI Fundamentals            │  │ Quantum Basics             │
│ [Start Path →]             │  │ [Start Path →]             │
└────────────────────────────┘  └────────────────────────────┘
```

### Course Grid (All Courses — max 6 on public page)
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ 📖       │  │ 🧮       │  │ 💻       │
│ Academic │  │ Algebra  │  │ Python   │
│ Writing  │  │ Mastery  │  │ Basics   │
│          │  │          │  │          │
│ Beginner │  │ Intermed.│  │ Beginner │
│ 12 less. │  │ 18 less. │  │ 24 less. │
│ [Start]  │  │ [Start]  │  │ [Start]  │
└──────────┘  └──────────┘  └──────────┘
```
- Card: `rounded-2xl border border-slate-200 p-5 hover:shadow-md transition`
- 🔒 locked courses (free sequential): show `opacity-60` with lock badge
- Premium courses: `border-amber-200 bg-amber-50`

---

## 💳 PAGE 5: PRICING PAGE (`/pricing`)

```
"Choose Your Plan"

┌──────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│   Free       │  │   Premium ⭐          │  │   Family 👪      │
│              │  │   (Most Popular)      │  │                  │
│   $0         │  │   $20/mo (annual)     │  │   $40/mo         │
│   forever    │  │   or $30/mo monthly   │  │   up to 6 people │
│              │  │                       │  │                  │
│ ✓ 2 lessons  │  │ ✓ Unlimited lessons   │  │ ✓ All Premium    │
│   per day    │  │ ✓ Full AI Study Buddy │  │   for each       │
│ ✓ All 4      │  │ ✓ Jump to any lesson  │  │ ✓ Up to 6 seats  │
│   subjects   │  │ ✓ No ads              │  │ ✓ Parent dash    │
│ ✓ Streaks    │  │ ✓ Streak charges      │  │ ✓ Progress view  │
│   & XP       │  │ ✓ League competitions │  │   per member     │
│              │  │                       │  │                  │
│ [Get started]│  │ [Start 7-day trial]   │  │ [Start trial]    │
└──────────────┘  └──────────────────────┘  └──────────────────┘

                  Educator? Apply for FREE access →
```

---

## 🏠 PAGE 6: DASHBOARD HOME (`/dashboard`)

### Layout: 2-column (main + right sidebar)

**MAIN COLUMN:**
```
👋 Good morning, Alex

📌 UP NEXT
┌─────────────────────────────────────────┐
│ 💻 Python Fundamentals                  │
│ Lesson 3: Lists & Loops                 │
│ ━━━━━━━░░░░░░░  20% complete           │
│ ~10 minutes  [🔑 Uses 1 key]           │  ← hidden for premium
│              [Continue →]              │
└─────────────────────────────────────────┘

🧠 DAILY PRACTICE
┌─────────────────────────────────────────┐
│ 3 quick problems · ~8 mins              │
│ Based on: Python · Clause Writing       │
│ [🔑 Uses 1 key]                        │  ← hidden for premium
│ [Start Practice]                        │
└─────────────────────────────────────────┘

── More Courses ──────────────────────────

[Course card] [Course card] [Course card]  → scroll
```

**RIGHT SIDEBAR:**
```
┌──────────────────┐
│ Today's Goal     │
│   ● ● ○          │
│ 2 of 3 done      │
│                  │
│ 🔥 14 days       │
│ Keep it going!   │
└──────────────────┘

┌──────────────────┐
│ 🔑 2 keys left  │ ← Free users only
│ Resets midnight  │
└──────────────────┘

┌──────────────────┐
│ ⚡ 1 charge      │
│ banked           │
└──────────────────┘

┌──────────────────┐
│ 🏆 Carbon League │
│ You: #8 of 30    │
│ 320 XP this week │
│ [Leaderboard]    │
└──────────────────┘
```

---

## 👤 PAGE 7: YOU / PROFILE PAGE (`/dashboard/you`)

```
┌────────────────────────────────────────────────────────┐
│  [Avatar]  Alex Johnson                                │
│            Free Plan  [Upgrade to Premium]             │
│            Member since September 2026                 │
└────────────────────────────────────────────────────────┘

🔥 STREAK
─────────────────────────────────────────────────────────
Current: 14 days    |    Longest: 21 days

Sep  ▓ ▓ ░ ▓ ▓ ▓ ░
     ▓ ▓ ▓ ░ ▓ ▓ ░
     ░ ▓ ▓ ▓ ▓ ▓ ▓
     ░ ░ ░ ░ ░ ░ ░
                     ← GitHub-style heatmap

⭐ XP THIS WEEK
─────────────────────────────────────────────────────────
320 XP  ·  🏆 Carbon League  ·  Rank #8 of 30
[See full leaderboard →]

📚 MY COURSES
─────────────────────────────────────────────────────────
Python Fundamentals     ████░░░░░░  20%  (2/10 lessons)
Algebra Mastery         ░░░░░░░░░░   0%  (not started)
[Browse more courses →]

🔑 KEYS & CHARGES
─────────────────────────────────────────────────────────
Daily Keys:      🔑 🔑  2/2 remaining today    ← Free only
Streak Charges:  ⚡ ░   1/2 banked

⚙️ [Settings →]
```

---

## 🎮 GAMIFICATION COMPONENT SPECS

### Keys Badge (Navbar)
```tsx
<div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
  <span>🔑</span>
  <span className="text-blue-700 font-semibold text-sm">2</span>
</div>
```

### Streak Badge (Navbar)
```tsx
<div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
  <span>🔥</span>
  <span className="text-orange-700 font-semibold text-sm">14</span>
</div>
```

### Charge Badge (Navbar)
```tsx
<div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1">
  <span>⚡</span>
  <span className="text-yellow-700 font-semibold text-sm">1</span>
</div>
```

### Premium Pill (Free users — "Start trial" button)
```tsx
<button className="rounded-full px-4 py-1.5 text-sm font-semibold 
  bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 
  text-white shadow-sm hover:shadow-md transition">
  Start trial
</button>
```

### Countdown Sub-Banner
```tsx
<div className="w-full bg-gradient-to-r from-purple-100 via-pink-50 to-amber-100 
  border-b border-purple-200 py-2 text-center text-sm">
  💎 Try Premium FREE for 7 days. Offer ends in 
  <span className="font-bold text-purple-700 ml-1">6d 23h 59m 15s</span>
  <button className="ml-4 bg-purple-600 text-white rounded-full px-4 py-0.5 text-xs font-semibold">
    Start trial
  </button>
</div>
```

---

## 🎨 DESIGN TOKEN REFERENCE

| Token | Value | Usage |
|---|---|---|
| `brand-primary` | `#027FFF` (blue) | Primary buttons, active states |
| `brand-dark` | `#1E293B` | Headlines, dark text |
| `brand-light` | `#F8FAFC` | Section backgrounds |
| `success` | `#10B981` | Correct answers, completion |
| `warning` | `#F59E0B` | Streak charges, warnings |
| `danger` | `#EF4444` | Wrong answers, errors |
| `premium` | `purple→blue→teal gradient` | Premium features |
| `streak` | `#F97316` | Streak flame, orange accents |
| `border` | `#E2E8F0` | All card/section borders |
| `radius-card` | `rounded-2xl` | All cards |
| `radius-button` | `rounded-full` | All buttons (pill style) |
