import Link from 'next/link';

export default function Home() {
  return (
    <main className="w-full bg-surface overflow-hidden pt-20">
      
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative w-full max-w-[80rem] mx-auto px-4 pt-4 md:pt-8 pb-20 lg:pb-32">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left: Copy & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-lowest border border-secondary/20 shadow-sm mb-6 group">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-sm text-[12px] uppercase tracking-widest font-bold text-secondary">
                The Next Evolution in EdTech
              </span>
            </div>
            
            <h1 className="font-display-lg text-[48px] md:text-[64px] lg:text-[72px] leading-[1.05] tracking-tight text-on-surface mb-6 font-bold">
              AI-Powered <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-container">
                Academic Mastery.
              </span>
            </h1>
            
            <p className="font-body-lg text-[18px] md:text-[20px] leading-relaxed text-on-surface-variant max-w-xl mb-10">
              Welcome to the Pen & Page Academia intelligent dashboard. 
              Our multi-agent system instantly analyzes your submissions, spots hidden weaknesses, and dynamically builds your fastest path to success.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                href="/diagnostic" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-secondary text-white font-label-md text-[16px] font-bold hover:bg-secondary-container transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 group"
              >
                <span>Take Free Diagnostic Test</span>
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link 
                href="/courses" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-label-md text-[16px] font-bold hover:bg-surface-container transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px] text-secondary">school</span>
                <span>Explore Courses</span>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-5 mt-8 font-caption text-[13px] text-on-surface-variant font-medium">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">timer</span>
                <span>15-Minute Benchmark</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                <span>Real-Time Band Prediction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">psychology</span>
                <span>AI Remediation Plan</span>
              </div>
            </div>
          </div>

          {/* Right: Premium Interactive Visual */}
          <div className="lg:col-span-6 w-full animate-fade-in-up delay-200">
            <div className="relative w-full rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant/20 p-2 overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
              {/* Fake Mac Topbar */}
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-t-xl mb-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim"></div>
                <div className="mx-auto font-label-sm text-[12px] text-on-surface-variant font-medium">Student_Workspace.app</div>
              </div>
              
              <div className="bg-surface rounded-xl p-6 border border-outline-variant/10">
                <div className="flex justify-between items-center mb-6 border-b border-outline-variant/20 pb-4">
                   <h3 className="font-headline-sm text-[20px] font-bold text-on-surface">Writing Module Assessment</h3>
                   <span className="px-3 py-1 rounded-full bg-tertiary-fixed-dim/20 text-tertiary-container font-label-sm text-[12px] font-bold flex items-center gap-1">
                     <span className="material-symbols-outlined text-[14px]">bolt</span> Analyzed in 1.2s
                   </span>
                </div>
                
                <p className="font-body-md text-[15px] leading-loose text-on-surface mb-6">
                  &quot;The rapid integration of neural networks in urban planning will <span className="relative inline-block group cursor-pointer bg-secondary/10 text-secondary border-b-2 border-secondary font-semibold">
                    expedite
                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex w-48 flex-col gap-1 p-3 bg-inverse-surface text-inverse-on-surface shadow-2xl rounded-lg text-[12px] font-body-sm z-20">
                      <strong className="text-tertiary-fixed-dim border-b border-outline-variant/20 pb-1 mb-1 block">Agent Recommendation</strong>
                      Excellent lexical choice. Shows advanced C1 proficiency.
                    </span>
                  </span> infrastructure development, though <span className="relative inline-block group cursor-pointer bg-amber-100 text-amber-900 border-b-2 border-amber-500 font-semibold">
                    some people think
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex w-48 flex-col gap-1 p-3 bg-inverse-surface text-inverse-on-surface shadow-2xl rounded-lg text-[12px] font-body-sm z-20">
                      <strong className="text-amber-300 border-b border-outline-variant/20 pb-1 mb-1 block">Tone Adjustment</strong>
                      Consider using &apos;critics argue&apos; or &apos;detractors maintain&apos; for academic register.
                    </span>
                  </span> it may isolate rural communities.&quot;
                </p>

                {/* AI Grading Bars */}
                <div className="space-y-4 bg-surface-container-low p-4 rounded-xl">
                  <div>
                    <div className="flex justify-between font-label-sm text-[12px] mb-1">
                      <span className="font-bold text-on-surface">Grammar & Accuracy</span>
                      <span className="text-tertiary-container font-bold">85%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-outline-variant/30 overflow-hidden">
                      <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-sm text-[12px] mb-1">
                      <span className="font-bold text-on-surface">Lexical Resource</span>
                      <span className="text-secondary font-bold">92%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-outline-variant/30 overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-label-sm text-[12px] mb-1">
                      <span className="font-bold text-on-surface">Coherence</span>
                      <span className="text-amber-500 font-bold">60%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-outline-variant/30 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / METRICS STRIP */}
      <section className="w-full bg-surface-container-lowest border-y border-outline-variant/20 py-10">
        <div className="max-w-[80rem] mx-auto px-4 flex flex-wrap items-center justify-center gap-12 lg:gap-24 opacity-70">
           <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-[32px] text-on-surface-variant">psychology</span>
             <span className="font-headline-sm text-[20px] font-bold text-on-surface-variant">Multi-Agent AI</span>
           </div>
           <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-[32px] text-on-surface-variant">bolt</span>
             <span className="font-headline-sm text-[20px] font-bold text-on-surface-variant">Sub-second Grading</span>
           </div>
           <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-[32px] text-on-surface-variant">balance</span>
             <span className="font-headline-sm text-[20px] font-bold text-on-surface-variant">Cambridge Rubric</span>
           </div>
        </div>
      </section>

      {/* 3. DEDICATED DIAGNOSTIC CTA SHOWCASE BANNER */}
      <section className="w-full max-w-[80rem] mx-auto px-4 py-16">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#001F3F] via-[#002B5B] to-[#027FFF] text-white p-8 md:p-14 shadow-2xl overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 flex flex-col items-start gap-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 font-label-sm text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>Zero Cost • Instant Result</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Discover Your True IELTS &amp; CEFR Band in 15 Minutes
              </h2>
              <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
                Take our calibrated diagnostic benchmark across Grammar, Lexical Precision, and Reading comprehension. Receive an instant examiner score breakdown and a custom-tailored study roadmap.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/diagnostic"
                  className="px-8 py-4 rounded-xl bg-white text-[#001F3F] hover:bg-slate-100 font-bold text-base transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 flex items-center gap-2 group"
                >
                  <span>Start Free Diagnostic Benchmark</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <span className="text-xs text-white/60 font-medium">No credit card or download required</span>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-xs uppercase font-bold text-white/70">Estimated Band</span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">Calibrated</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-white">Band 7.5</span>
                <span className="text-xs text-white/70">Target: Band 8.0</span>
              </div>
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between text-white/80">
                  <span>Grammar &amp; Range</span>
                  <span className="font-bold text-white">88%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/20">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '88%' }}></div>
                </div>
                <div className="flex justify-between text-white/80 pt-1">
                  <span>Lexical Precision</span>
                  <span className="font-bold text-white">74%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/20">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '74%' }}></div>
                </div>
              </div>
            </div>
          </div>
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
<h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">Academic English Complete Masterclass</h3>
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
<h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">General English Accelerator</h3>
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
<span className="font-headline-sm text-headline-sm text-on-surface">PPAcademia AI Platform</span>
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

{/* SECTION 7: PEDAGOGICAL MISSION */}
<section className="max-w-[80rem] mx-auto px-3 py-space-2xl text-center">
<div className="inline-flex items-center gap-space-xs p-space-xs px-space-md rounded-full bg-surface-container mb-space-md">
<span className="material-symbols-outlined text-secondary text-[20px]">school</span>
<span className="font-caption text-caption text-on-surface font-semibold uppercase tracking-wider">Engineered for Pedagogical Rigor</span>
</div>
<p className="font-headline-md text-headline-md text-on-surface max-w-3xl mx-auto leading-snug">
      We believe high-stakes test preparation should not be a gamble. By combining institutional psychometrics with multi-agent continuous assessment, we unlock academic potential for ambitious scholars across the globe.
    </p>

</section>
{/* SECTION 8: PRE-FOOTER HIGH-IMPACT BANNER */}
<section className="max-w-[80rem] mx-auto px-3 pb-space-3xl">
<div className="rounded-xl bg-inverse-surface text-inverse-on-surface shadow-2xl scale-95 group-hover:scale-100 transition-all duration-300 origin-bottom p-space-2xl relative overflow-hidden shadow-2xl">
{/* Subtle Decorative SVG Background pattern */}
<div className="absolute -right-16 -bottom-16 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-space-xl">
<div className="max-w-xl">
<h2 className="font-headline-xl text-headline-xl text-surface-bright mb-space-xs">
            Ready to Discover Your True Language Proficiency Level?
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

</main>
  );
}
