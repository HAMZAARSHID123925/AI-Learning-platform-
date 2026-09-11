import Link from 'next/link';

export default function Home() {
  return (
    <>
<main className="w-full pt-20 bg-surface"><div className="flex flex-col w-full">
{/* Top Decorative Ambient Glow */}
<div className="relative w-full overflow-hidden">
<div className="absolute -top-40 -left-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
<div className="absolute top-20 right-0 w-[32rem] h-[32rem] bg-secondary-fixed-dim/30 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
{/* SECTION 1: HERO (Desktop 2-Column Split) */}
<section className="max-w-[80rem] mx-auto px-3 pt-space-2xl pb-space-3xl relative">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
{/* Left Column: Copy & CTAs */}
<div className="lg:col-span-6 flex flex-col items-start animate-fade-in-up opacity-0-start">
<div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-secondary/10 text-secondary mb-space-md shadow-sm">
<span className="material-symbols-outlined text-[16px]">auto_awesome</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider">Next-Gen Multi-Agent Adaptive Prep</span>
</div>
<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-space-md leading-tight">
            Master IELTS Faster with AI That <span className="italic text-secondary">Adapts</span> to Your Weaknesses.
          </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-space-xl leading-relaxed">
            Unlike static courses, our multi-agent AI analyzes your test errors in real time, generates custom quizzes, and personalizes your curriculum until you hit Band 7.5+.
          </p>
<div className="flex flex-wrap items-center gap-space-md mb-space-lg w-full sm:w-auto">
<Link className="px-space-xl py-space-md rounded-lg font-label-md text-label-md bg-secondary text-on-secondary hover:bg-secondary-container transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5 flex items-center gap-space-xs group" href="/pricing">
<span>Start Free Diagnostic Test</span>
<span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
</Link>
<Link className="px-space-lg py-space-md rounded-lg font-label-md text-label-md bg-surface-container hover:bg-surface-container-high text-on-surface transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex items-center gap-space-xs" href="/how-it-works">
<span>Explore Courses</span>
<span className="material-symbols-outlined text-[18px]">explore</span>
</Link>
</div>
<div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
<span>No credit card required</span>
<span className="mx-1.5 text-outline-variant">•</span>
<span>15-minute diagnostic</span>
<span className="mx-1.5 text-outline-variant">•</span>
<span>Instant AI score breakdown</span>
</div>
</div>
{/* Right Column: Interactive Diagnostic Simulator Card */}
<div className="lg:col-span-6 w-full animate-fade-in-up opacity-0-start delay-200">
<div className="relative rounded-xl bg-surface-container-lowest shadow-xl overflow-hidden hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 hover:-translate-y-1 border border-surface-container-high">
{/* Mac/OS-like Chrome Topbar */}
<div className="bg-surface-container px-space-md py-space-xs flex items-center justify-between">
<div className="flex items-center gap-1.5">
<span className="w-3 h-3 rounded-full bg-error/40 inline-block"></span>
<span className="w-3 h-3 rounded-full bg-amber-400/60 inline-block"></span>
<span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim inline-block"></span>
<span className="font-label-sm text-label-sm text-on-surface font-semibold ml-2">Task 2 Academic Writing</span>
</div>
<div className="flex items-center gap-space-xs bg-surface-container-highest/60 px-space-xs py-0.5 rounded text-on-surface font-caption text-caption">
<span className="material-symbols-outlined text-[14px]">timer</span>
<span>08:45 remaining</span>
</div>
</div>
{/* Student Workspace & Highlight Mock */}
<div className="p-space-lg bg-surface-container-lowest">
<div className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-space-xs font-semibold">Student Active Draft</div>
<p className="font-body-md text-body-md text-on-surface leading-relaxed p-space-md rounded-lg bg-surface-container-low mb-space-md">
                &quot;The unprecedented surge in automated transport systems will inevitably transform metropolitan infrastructure; however, 
                <span className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-medium relative group cursor-help">
                  detractors argue
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex px-2 py-1 bg-inverse-surface text-inverse-on-surface shadow-2xl scale-95 group-hover:scale-100 transition-all duration-300 origin-bottom font-caption text-caption rounded shadow-lg whitespace-nowrap z-20">
                    Agent Alert: Informal transition verb
                  </span>
</span> 
                that socioeconomic stratification may exacerbate commute inequality.&quot;
              </p>
{/* Connected Multi-Agent Evaluator Panel */}
<div className="rounded-lg bg-primary-container text-surface-bright p-space-md relative overflow-hidden shadow-inner">
<div className="flex items-center justify-between mb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim animate-ping"></span>
<span className="font-label-md text-label-md text-surface-bright font-semibold">⚡ Multi-Agent Evaluator</span>
</div>
<span className="font-caption text-caption text-secondary-fixed bg-secondary/30 px-space-xs py-0.5 rounded">Analyzing Response...</span>
</div>
{/* Sub-score Gauges */}
<div className="space-y-space-xs mb-space-md">
<div>
<div className="flex justify-between font-caption text-caption mb-1">
<span className="text-surface-variant font-medium">Grammar &amp; Accuracy</span>
<span className="text-tertiary-fixed-dim font-semibold">85% Strong</span>
</div>
<div className="w-full h-1.5 rounded-full bg-inverse-surface overflow-hidden">
<div className="h-full bg-tertiary-fixed-dim rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
</div>
</div>
<div>
<div className="flex justify-between font-caption text-caption mb-1">
<span className="text-surface-variant font-medium">Lexical Resource</span>
<span className="text-amber-300 font-semibold">40% Focus Needed</span>
</div>
<div className="w-full h-1.5 rounded-full bg-inverse-surface overflow-hidden">
<div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: '40%' }}></div>
</div>
</div>
<div>
<div className="flex justify-between font-caption text-caption mb-1">
<span className="text-surface-variant font-medium">Coherence &amp; Cohesion</span>
<span className="text-secondary-fixed-dim font-semibold">78% On Track</span>
</div>
<div className="w-full h-1.5 rounded-full bg-inverse-surface overflow-hidden">
<div className="h-full bg-secondary-container rounded-full transition-all duration-1000" style={{ width: '78%' }}></div>
</div>
</div>
</div>
{/* Agent Insight bubble */}
<div className="p-space-xs rounded bg-inverse-surface/80 flex items-start gap-space-xs text-surface-variant">
<span className="material-symbols-outlined text-secondary-fixed text-[18px] shrink-0 mt-0.5">lightbulb</span>
<span className="font-caption text-caption leading-tight">
<strong className="text-surface-bright">Agent Recommendation:</strong> Identified repetitive sentence structures in Body Paragraph 1. Generating 3 targeted drill questions.
                  </span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
</div>
{/* SECTION 2: METRICS & SOCIAL PROOF BAR */}
<section className="w-full bg-surface-container-low py-space-xl animate-fade-in-up opacity-0-start delay-300">
<div className="max-w-[80rem] mx-auto px-3">
<div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-surface-container flex flex-col">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-headline-xl text-headline-xl text-secondary font-bold">98%</span>
<span className="material-symbols-outlined text-secondary text-[24px]">verified</span>
</div>
<span className="font-title-md text-title-md text-on-surface mb-0.5">Target Band Success</span>
<span className="font-caption text-caption text-on-surface-variant">Candidates achieving target band within 6 weeks</span>
</div>
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-surface-container flex flex-col">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-headline-xl text-headline-xl text-on-surface font-bold">50,000+</span>
<span className="material-symbols-outlined text-on-surface-variant text-[24px]">assignment_turned_in</span>
</div>
<span className="font-title-md text-title-md text-on-surface mb-0.5">Diagnostics Taken</span>
<span className="font-caption text-caption text-on-surface-variant">Precise benchmark data across 140 nations</span>
</div>
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-surface-container flex flex-col">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-headline-xl text-headline-xl text-tertiary-container font-bold">7.5+</span>
<span className="material-symbols-outlined text-tertiary-fixed-dim text-[24px]">military_tech</span>
</div>
<span className="font-title-md text-title-md text-on-surface mb-0.5">Average Score</span>
<span className="font-caption text-caption text-on-surface-variant">Academic and General Training overall average</span>
</div>
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-surface-container flex flex-col">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-headline-xl text-headline-xl text-secondary-container font-bold">24/7</span>
<span className="material-symbols-outlined text-secondary-container text-[24px]">forum</span>
</div>
<span className="font-title-md text-title-md text-on-surface mb-0.5">Instant AI Feedback</span>
<span className="font-caption text-caption text-on-surface-variant">Continuous speaking and writing rubric scoring</span>
</div>
</div>
</div>
</section>
{/* SECTION 3: HOW IT WORKS (Connected Loop) */}
<section className="max-w-[80rem] mx-auto px-3 py-space-3xl">
<div className="text-center max-w-2xl mx-auto mb-space-2xl">
<span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase font-bold">The Adaptive Engine</span>
<h2 className="font-headline-xl text-headline-xl text-on-surface mt-space-xxs mb-space-xs">
        A Closed-Loop Learning Journey Built Around You
      </h2>
<p className="font-body-md text-body-md text-on-surface-variant">
        Our multi-agent system observes your exact rubric shortcomings, adjusts lesson difficulty dynamically, and ensures complete mastery before moving ahead.
      </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg relative">
{/* Step 01 */}
<div className="p-space-xl rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container relative flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
<div>
<div className="flex items-center justify-between mb-space-lg">
<span className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center font-headline-sm text-headline-sm text-secondary font-bold">
              01
            </span>
<span className="material-symbols-outlined text-[28px] text-on-surface-variant group-hover:text-secondary transition-colors">menu_book</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Study Authentic Lessons</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-md">
            Interactive notes, curated video modules, and high-scoring sample essays aligned directly to authentic IELTS British Council and IDP rubric standards.
          </p>
</div>
<div className="w-full pt-space-md bg-surface-container-low/50 px-space-sm pb-space-sm rounded-lg flex items-center justify-between text-on-surface-variant font-caption text-caption">
<span>Official Cambridge Rubric</span>
<span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
</div>
</div>
{/* Step 02 */}
<div className="p-space-xl rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container relative flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
<div>
<div className="flex items-center justify-between mb-space-lg">
<span className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center font-headline-sm text-headline-sm text-secondary font-bold">
              02
            </span>
<span className="material-symbols-outlined text-[28px] text-on-surface-variant group-hover:text-secondary transition-colors">psychology</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">AI Checkpoint Tests</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-md">
            RAG-powered dynamic quizzes synthesized precisely from your historical error logs, grammar pitfalls, and distractor response tendencies.
          </p>
</div>
<div className="w-full pt-space-md bg-surface-container-low/50 px-space-sm pb-space-sm rounded-lg flex items-center justify-between text-on-surface-variant font-caption text-caption">
<span>Personalized Distractor Models</span>
<span className="material-symbols-outlined text-[16px] text-secondary">query_stats</span>
</div>
</div>
{/* Step 03 */}
<div className="p-space-xl rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container relative flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
<div>
<div className="flex items-center justify-between mb-space-lg">
<span className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center font-headline-sm text-headline-sm text-secondary font-bold">
              03
            </span>
<span className="material-symbols-outlined text-[28px] text-on-surface-variant group-hover:text-secondary transition-colors">build_circle</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Adaptive Weakness Repair</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-md">
            Advanced lessons unlock only when competency is validated. The system immediately prescribes micro-drills to fix specific lexical gaps.
          </p>
</div>
<div className="w-full pt-space-md bg-surface-container-low/50 px-space-sm pb-space-sm rounded-lg flex items-center justify-between text-on-surface-variant font-caption text-caption">
<span>Automated Remediation Loop</span>
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">verified</span>
</div>
</div>
</div>
<div className="mt-space-xl text-center">
<Link className="inline-flex items-center gap-space-xs font-label-md text-label-md text-secondary hover:text-secondary-container transition-colors group" href="/how-it-works">
<span>Learn How Our Adaptive AI Works Behind the Scenes</span>
<span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
</Link>
</div>
</section>
{/* SECTION 4: FEATURED COURSES (Side-by-Side Cards) */}
<section className="w-full bg-surface-container-low py-space-3xl">
<div className="max-w-[80rem] mx-auto px-3">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl">
<div>
<span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase font-bold">Proven Curriculum</span>
<h2 className="font-headline-xl text-headline-xl text-on-surface mt-space-xxs">Targeted Prep for Every Test Taker</h2>
</div>
<Link className="inline-flex items-center gap-space-xs font-label-md text-label-md text-secondary hover:underline mt-space-sm md:mt-0" href="/pricing">
<span>View All Courses</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</Link>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{/* Course Card A */}
<div className="p-space-xl rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-surface-container flex flex-col justify-between group">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="px-space-xs py-0.5 rounded font-label-sm text-label-sm bg-secondary/10 text-secondary uppercase font-semibold">Comprehensive Track</span>
<div className="flex items-center gap-space-xs text-on-surface-variant font-caption text-caption">
<span className="material-symbols-outlined text-[16px]">menu_book</span>
<span>4 Modules • 24 Lessons</span>
</div>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">IELTS Academic Complete Masterclass</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
              Engineered specifically for university admissions and professional registrations demanding Band 7.5 to 9.0 performance across all modules.
            </p>
<ul className="space-y-space-sm mb-space-xl">
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Band 8.0+ Academic Vocabulary &amp; Lexical Collocation banks</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Task 1 graph synthesis analysis &amp; Task 2 structured argumentative feedback</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">12 Full-length AI diagnostic mock tests with detailed Examiner Rubric scoring</span>
</li>
</ul>
</div>
<div className="pt-space-md flex items-center justify-between">
<div>
<span className="font-caption text-caption text-on-surface-variant block">Target Level</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">All Band Targets</span>
</div>
<Link className="px-space-lg py-space-xs rounded-lg font-label-md text-label-md bg-on-surface text-surface hover:bg-on-surface-variant transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" href="/courses">
              Preview Syllabus
            </Link>
</div>
</div>
{/* Course Card B */}
<div className="p-space-xl rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-surface-container flex flex-col justify-between group">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="px-space-xs py-0.5 rounded font-label-sm text-label-sm bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant uppercase font-semibold">Fast-Track</span>
<div className="flex items-center gap-space-xs text-on-surface-variant font-caption text-caption">
<span className="material-symbols-outlined text-[16px]">menu_book</span>
<span>3 Modules • 18 Lessons</span>
</div>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">IELTS General Training Accelerator</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
              Optimized for Express Entry, skilled migration visas, and secondary work permits requiring rapid, bulletproof Band 7.0+ score benchmarks.
            </p>
<ul className="space-y-space-sm mb-space-xl">
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Formal &amp; informal letter writing high-scoring templates</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">High-speed workplace reading &amp; skimming tactical drills</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Conversational AI speaking simulator targeting fluency &amp; phonology</span>
</li>
</ul>
</div>
<div className="pt-space-md flex items-center justify-between">
<div>
<span className="font-caption text-caption text-on-surface-variant block">Target Level</span>
<span className="font-label-md text-label-md text-on-surface font-semibold">Immigration &amp; Work</span>
</div>
<Link className="px-space-lg py-space-xs rounded-lg font-label-md text-label-md bg-on-surface text-surface hover:bg-on-surface-variant transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" href="/how-it-works">
              Preview Syllabus
            </Link>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 5: TRADITIONAL LMS VS ADAPTIVE AI */}
<section className="max-w-[80rem] mx-auto px-3 py-space-3xl">
<div className="text-center max-w-2xl mx-auto mb-space-2xl">
<span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase font-bold">Uncompromising Efficiency</span>
<h2 className="font-headline-xl text-headline-xl text-on-surface mt-space-xxs mb-space-xs">
        Static Courses vs. Our Multi-Agent AI
      </h2>
<p className="font-body-md text-body-md text-on-surface-variant">
        See how individualized agent routing eliminates weeks of wasted study time spent reviewing concepts you already know.
      </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl items-stretch">
{/* Traditional LMS Card */}
<div className="p-space-xl rounded-xl bg-surface-container-high/40 flex flex-col justify-between hover:bg-surface-container-high/60 transition-colors duration-300">
<div>
<div className="flex items-center gap-space-xs mb-space-md text-on-surface-variant">
<span className="material-symbols-outlined text-error text-[24px]">cancel</span>
<span className="font-headline-sm text-headline-sm text-on-surface">Traditional Static LMS</span>
</div>
<ul className="space-y-space-md">
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">close</span>
<span className="font-body-md text-body-md text-on-surface-variant"><strong>Rigid Generic Curriculum:</strong> Forced to follow identical modules irrespective of individual proficiency.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">close</span>
<span className="font-body-md text-body-md text-on-surface-variant"><strong>Passive Materials:</strong> Outdated PDF printouts and non-interactive one-way recorded lectures.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">close</span>
<span className="font-body-md text-body-md text-on-surface-variant"><strong>Slow Turnaround:</strong> 48 to 72 hours wait time for essay reviews and speaking ratings.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">close</span>
<span className="font-body-md text-body-md text-on-surface-variant"><strong>No Weakness Remediation:</strong> Zero targeted repetition or spaced-retrieval review for repeated mistakes.</span>
</li>
</ul>
</div>
<div className="mt-space-xl pt-space-md text-caption font-caption text-on-surface-variant uppercase tracking-wider">
          Average prep required: 16–20 Weeks
        </div>
</div>
{/* Our Adaptive AI Card */}
<div className="p-space-xl rounded-xl bg-surface-container-lowest shadow-xl hover:shadow-2xl hover:shadow-secondary/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden border border-secondary/10">
<div className="absolute top-0 right-0 bg-secondary text-on-secondary px-space-md py-1 rounded-bl-lg font-label-sm text-label-sm font-bold tracking-wider">
          10X SPEED
        </div>
<div>
<div className="flex items-center gap-space-xs mb-space-md text-secondary">
<span className="material-symbols-outlined text-[24px]">check_circle</span>
<span className="font-headline-sm text-headline-sm text-on-surface">IELTS.AI Adaptive Platform</span>
</div>
<ul className="space-y-space-md">
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">check</span>
<span className="font-body-md text-body-md text-on-surface"><strong>Hyper-Personalized Path:</strong> The syllabus recalibrates dynamically after every checkpoint quiz and essay submission.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">check</span>
<span className="font-body-md text-body-md text-on-surface"><strong>Dynamic RAG Synthesis:</strong> Custom exercises generated specifically to resolve your exact grammatical and lexical faults.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">check</span>
<span className="font-body-md text-body-md text-on-surface"><strong>Instant Feedback in 10s:</strong> Comprehensive 4-criteria rubric evaluation and sentence-by-sentence corrections.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">check</span>
<span className="font-body-md text-body-md text-on-surface"><strong>Automated Weakness Repair:</strong> System locks progression until proven resolution of identified Band 7.5+ gaps.</span>
</li>
</ul>
</div>
<div className="mt-space-xl pt-space-md text-caption font-caption text-secondary font-bold uppercase tracking-wider">
          Average prep required: 4–6 Weeks
        </div>
</div>
</div>
</section>
{/* SECTION 6: STUDENT TESTIMONIALS */}
<section className="w-full bg-surface-container-low py-space-3xl">
<div className="max-w-[80rem] mx-auto px-3">
<div className="text-center max-w-2xl mx-auto mb-space-2xl">
<span className="font-label-sm text-label-sm text-secondary tracking-widest uppercase font-bold">Student Success</span>
<h2 className="font-headline-xl text-headline-xl text-on-surface mt-space-xxs mb-space-xs">
          Real Band Scores. Verified Results.
        </h2>
<p className="font-body-md text-body-md text-on-surface-variant">
          See how ambitious professionals and students transformed their IELTS outcomes using our adaptive multi-agent ecosystem.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
{/* Review 1 */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-surface-container flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-md">
<div className="flex text-amber-400">
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
</div>
<span className="px-space-xs py-0.5 rounded font-label-sm text-label-sm bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant font-bold">
                Band 8.5
              </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface leading-relaxed mb-space-lg italic">
              &quot;As a medical graduate, I couldn&apos;t afford to retake the test. The writing agent caught my persistent overuse of passive voice and gave me custom drill sentences. In just 3 weeks, my writing jumped from Band 6.5 to 8.0.&quot;
            </p>
</div>
<div className="flex items-center gap-space-sm pt-space-xs">
<img className="w-10 h-10 rounded-full object-cover shadow-sm" data-alt="Portrait photo of Priya Sharma, professional female medical licensing candidate in smart attire, smiling with confident expression, well-lit studio portrait against a soft slate background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpzdQ8KTBoSrjsI6RiQo7JLgUSKkb2ly38e3bxZ9vlLxJfYoqLy5OBfVNaI_G4hlmqcnhnOoOz1c3FGPmV06zed2t7tjvG1VBBC-SuxiewtUTs3XDU9Jy-rOdG_Ohst_ZCfI-0b4jMWQ4E0Ocg88ozzxS1SjVoRrACSCoNqzXkXxgpVdcFTWOctZ6xG1qIoMgeBFkXo7Z6AlYZYYB8MaUwixls_RyTyZD6KgqJd8YsuzOizasL3zv_7w"/>
<div>
<span className="font-label-md text-label-md text-on-surface font-semibold block">Dr. Priya Sharma</span>
<span className="font-caption text-caption text-on-surface-variant">GMC Registration Candidate</span>
</div>
</div>
</div>
{/* Review 2 */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-surface-container flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-md">
<div className="flex text-amber-400">
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
</div>
<span className="px-space-xs py-0.5 rounded font-label-sm text-label-sm bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant font-bold">
                Band 8.0
              </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface leading-relaxed mb-space-lg italic">
              &quot;The conversational speaking simulations felt like a real human examiner. Getting real-time phonological and lexical corrections without waiting days made my Canadian Express Entry score jump from CLB 7 to CLB 10.&quot;
            </p>
</div>
<div className="flex items-center gap-space-sm pt-space-xs">
<img className="w-10 h-10 rounded-full object-cover shadow-sm" data-alt="Portrait photo of Carlos Mendoza, male software engineer and Express Entry applicant, modern casual business clothing, warm genuine smile, professional indoor lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5QoLFJHxDG4qNtmDOfVq1kETS_YuoROe7tSspzY8lhxv2N3oekQv0m6TkZaH1kz-B6BHvcQ6XuNlqzZM1cCmpnAv6ugFBKX4XUYtkeY3vIloy4i89ZLz9CSi7K6kXuhpWdbVQlDwqTMjgvHjTT-EE_GF1JgLrr15keQQdGRpxCgVDbWgqR-KN20n9F5VZX1Oq1GOFe7fcdTRsrc4Pj96VVKukx2ualIdVOgXeWXE9ykC2DVZPJ2sbRA"/>
<div>
<span className="font-label-md text-label-md text-on-surface font-semibold block">Carlos Mendoza</span>
<span className="font-caption text-caption text-on-surface-variant">Express Entry Applicant</span>
</div>
</div>
</div>
{/* Review 3 */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-surface-container flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-md">
<div className="flex text-amber-400">
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "\'FILL\' 1" }}>star</span>
</div>
<span className="px-space-xs py-0.5 rounded font-label-sm text-label-sm bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant font-bold">
                Band 7.5
              </span>
</div>
<p className="font-body-sm text-body-sm text-on-surface leading-relaxed mb-space-lg italic">
              &quot;Reading tests were always my anxiety trigger. The AI tracked my exact distractor response patterns in True/False/Not Given questions and trained me until my recognition speed doubled.&quot;
            </p>
</div>
<div className="flex items-center gap-space-sm pt-space-xs">
<img className="w-10 h-10 rounded-full object-cover shadow-sm" data-alt="Portrait photo of Lin Wei, female academic postgraduate scholar, glasses, intellectual thoughtful expression, elegant academic background with library aesthetic and soft neutral tones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIV6pnXfcY7kF3vXT0MQPwtdTyqt3-WwAjAL-lXxRUygxm43fzLCP2lz9g_J5TE168iJFBy6mbJOGgzbfucTscPueo7XfIN8ntlgaJOGuA5_H7I0spvAEDXouMeG1XNptFyPqrXhv95EeB_Pea0sDgGLm3krPavffqS7KvR82CfcKwEUm5zNrDeEvgV6R7QUEbH2fAAkdx8EayeXkYo_WaTpRfQF2EACwW-kwB46UjGlISUcYlpIbjgA"/>
<div>
<span className="font-label-md text-label-md text-on-surface font-semibold block">Lin Wei</span>
<span className="font-caption text-caption text-on-surface-variant">Oxford Postgraduate Scholar</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 7: PEDAGOGICAL MISSION */}
<section className="max-w-[80rem] mx-auto px-3 py-space-2xl text-center">
<div className="inline-flex items-center gap-space-xs p-space-xs px-space-md rounded-full bg-surface-container mb-space-md">
<span className="material-symbols-outlined text-secondary text-[20px]">school</span>
<span className="font-caption text-caption text-on-surface font-semibold uppercase tracking-wider">Engineered for Pedagogical Rigor</span>
</div>
<p className="font-headline-md text-headline-md text-on-surface max-w-3xl mx-auto leading-snug">
      We believe high-stakes test preparation should not be a gamble. By combining institutional psychometrics with multi-agent continuous assessment, we unlock academic potential for ambitious scholars across the globe.
    </p>
<Link className="inline-flex items-center gap-space-xs font-label-md text-label-md text-secondary mt-space-md hover:underline" href="/about">
<span>Read Our Whitepaper on AI Psychometrics</span>
<span className="material-symbols-outlined text-[16px]">open_in_new</span>
</Link>
</section>
{/* SECTION 8: PRE-FOOTER HIGH-IMPACT BANNER */}
<section className="max-w-[80rem] mx-auto px-3 pb-space-3xl">
<div className="rounded-xl bg-inverse-surface text-inverse-on-surface shadow-2xl scale-95 group-hover:scale-100 transition-all duration-300 origin-bottom p-space-2xl relative overflow-hidden shadow-2xl">
{/* Subtle Decorative SVG Background pattern */}
<div className="absolute -right-16 -bottom-16 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-space-xl">
<div className="max-w-xl">
<h2 className="font-headline-xl text-headline-xl text-surface-bright mb-space-xs">
            Ready to Discover Your True IELTS Band?
          </h2>
<p className="font-body-md text-body-md text-inverse-primary leading-relaxed">
            Take the 15-minute diagnostic evaluation. Get an immediate, AI-verified CEFR and Band breakdown along with your customized study path today.
          </p>
</div>
<div className="flex flex-col sm:flex-row items-center gap-space-md shrink-0 w-full md:w-auto">
<Link className="w-full sm:w-auto px-space-xl py-space-md rounded-lg font-label-md text-label-md bg-secondary text-on-secondary hover:bg-secondary-container transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-1 text-center flex items-center justify-center gap-space-xs group" href="/pricing">
<span>Get Started Free</span>
<span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
</Link>
<Link className="w-full sm:w-auto px-space-lg py-space-md rounded-lg font-label-md text-label-md bg-surface-container-highest/20 hover:bg-surface-container-highest/30 text-surface-bright transition-colors text-center" href="/contact">
            Speak to an Advisor
          </Link>
</div>
</div>
</div>
</section>
</div></main>


    </>
  );
}
