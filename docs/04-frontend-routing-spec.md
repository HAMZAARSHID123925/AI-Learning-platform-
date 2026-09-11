# 04 Frontend Routing Spec

Visual Overview of the 4 Navbar States

1. PUBLIC (Visitor - Not Logged In)
[Logo] LMS    Home    Courses    How It Works    Pricing    About    Contact   [ Log In ]  [ Sign Up ]

2. STUDENT
[Logo] LMS    Dashboard    My Courses    Assessments    AI Tutor    [🔔]  [ 👤 Student ▼ ]

3. TEACHER / INSTRUCTOR
[Logo] LMS    Dashboard    Course Studio   Student Progress   Question Bank   [🔔]  [ 👤 Teacher ▼ ]

4. ADMIN
[Logo] LMS    Overview    Users    Courses    AI Engine Stats    System Settings   [ 👤 Admin ▼ ]


Visual Layout of the Pre-Login Homepage (/)

┌────────────────────────────────────────────────────────────────────────────┐
│ [Logo] LMS    Home    Courses    How It Works    Pricing    About    Contact       [ Log In ]  [ Sign Up ]│
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  HERO SECTION                                                              │
│  "Master IELTS with AI-Powered Adaptive Learning"                          │
│  Identify weak areas, practice personalized quizzes, and boost your score. │
│                                                                            │
│  [ Start Free Practice ➔ ]        [ Browse Sample Lessons ]                 │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  INTERACTIVE "HOW IT WORKS"                                                │
│  Step 1: Read/Watch Lessons                                                │
│  Step 2: Take AI Diagnostic Checkpoint                                     │
│  Step 3: AI Targets Your Weak Grammar & Vocabulary                         │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  COURSE CATALOG PREVIEW (Public Grid)                                      │
│  ┌─────────────────────────┐         ┌─────────────────────────┐           │
│  │ IELTS Academic          │         │ IELTS General Training  │           │
│  │ 4 Modules • 20 Lessons  │         │ 3 Modules • 15 Lessons  │           │
│  │ [ Preview Syllabus 🔒 ] │         │ [ Preview Syllabus 🔒 ] │           │
│  └─────────────────────────┘         └─────────────────────────┘           │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  TRUST & VALUE PROPS                                                       │
│  ✓ 24/7 AI Tutor   ✓ Instant Essay Evaluation   ✓ Real IELTS Band Rubrics │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  CALL TO ACTION (CTA) BANNER                                               │
│  "Ready to achieve your target band score?" [ Create Free Account ]        │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                                    │
│  © 2026 AI-LMS • Privacy Policy • Terms • Contact                          │
└────────────────────────────────────────────────────────────────────────────┘

The Contact Us Page (/contact) Should Include

┌────────────────────────────────────────────────────────────────────────────┐
│ [Logo] LMS    Courses    How It Works    About    Contact   [Log In] [Sign Up]
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│                           Get in Touch With Us                             │
│       Have questions about our IELTS preparation or AI learning engine?    │
│                        We're here to help!                                 │
│                                                                            │
│   ┌───────────────────────────────────┐    ┌───────────────────────────┐   │
│   │           Send a Message          │    │      Contact Info         │   │
│   │                                   │    │                           │   │
│   │ Full Name:                        │    │ 📍 Headquarters:          │   │
│   │ [ John Doe                      ] │    │    123 Education Lane     │   │
│   │                                   │    │    London, UK             │   │
│   │ Email Address:                    │    │                           │   │
│   │ [ john@example.com              ] │    │ ✉️ Support Email:         │   │
│   │                                   │    │    support@ailms.com      │   │
│   │ Subject / Reason:                 │    │                           │   │
│   │ [ Student Inquiry             ▼ ] │    │ 📞 Phone / WhatsApp:      │   │
│   │   • Student Inquiry               │    │    +44 20 7946 0991       │   │
│   │   • Teacher / Instructor Application│  │                           │   │
│   │   • Technical Support             │    │ ⏱ Response Time:         │   │
│   │                                   │    │    Usually within 24 hours│   │
│   │ Message:                          │    └───────────────────────────┘   │
│   │ [ Write your message here...    ] │                                    │
│   │                                   │    ┌───────────────────────────┐   │
│   │ [ Send Message ➔ ]                │    │ FAQs:                     │   │
│   └───────────────────────────────────┘    │ • How does adaptive tests │   │
│                                            │   work?                   │   │
│                                            │ • Can I get a refund?     │   │
│                                            └───────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
