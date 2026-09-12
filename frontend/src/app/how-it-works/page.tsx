import Link from 'next/link';

export default function HowItWorks() {
  return (
    <div className="flex flex-col min-h-screen pt-20 bg-surface">
      
            {/* 1. STRIKING HERO SECTION */}
      <section className="relative w-full overflow-hidden py-12 lg:py-16 bg-gradient-to-br from-[#001F3F] via-[#003366] to-[#027FFF] text-white shadow-2xl">
        {/* Abstract Network Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent bg-[length:20px_20px]"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-[80rem] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white font-label-sm text-[13px] mb-8 border border-white/20 shadow-inner">
              <span className="material-symbols-outlined text-[16px] text-amber-400">memory</span>
              <span className="tracking-widest uppercase font-bold text-amber-400">PPAcademia AI Engine</span>
            </div>
            
            <h1 className="font-display-lg text-[40px] md:text-[56px] leading-[1.1] font-bold tracking-tight mb-6">
              The intelligent engine behind your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">success.</span>
            </h1>
            
            <p className="font-body-lg text-[18px] md:text-[20px] leading-relaxed text-white/80 max-w-xl mb-10">
              PPAcademia AI isn&apos;t just a static course—it&apos;s a living, breathing ecosystem of specialized agents that analyze your every keystroke and adapt in real-time.
            </p>
            
            <Link href="/signup" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-[#003366] font-label-md text-[18px] font-bold hover:bg-surface-container-lowest transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:-translate-y-1 group">
              <span>Experience the Dashboard</span>
              <span className="material-symbols-outlined text-[24px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          {/* Right Side Visual */}
          <div className="relative hidden lg:flex items-center justify-center animate-fade-in-up delay-200">
             <div className="relative w-full aspect-square max-w-[500px]">
                {/* Central Node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full shadow-[0_0_80px_rgba(255,255,255,0.5)] flex items-center justify-center z-20 border-4 border-[#027FFF]">
                  <span className="material-symbols-outlined text-[48px] text-[#003366]">psychology</span>
                </div>
                
                {/* Orbiting Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/20 animate-[spin_10s_linear_infinite]">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-amber-400 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.5)] flex items-center justify-center">
                     <span className="material-symbols-outlined text-[24px] text-[#003366]">bolt</span>
                   </div>
                </div>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/10 animate-[spin_15s_linear_infinite_reverse]">
                   <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 bg-[#027FFF] rounded-full shadow-[0_0_20px_rgba(2,127,255,0.5)] flex items-center justify-center border-2 border-white">
                     <span className="material-symbols-outlined text-[28px] text-white">analytics</span>
                   </div>
                   <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)] flex items-center justify-center border-2 border-white">
                     <span className="material-symbols-outlined text-[24px] text-[#003366]">fact_check</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>

{/* 2. THE 4 AI AGENTS (MODERN CARDS) */}
      <section className="w-full max-w-[80rem] mx-auto px-4 py-space-3xl">
        <div className="text-center mb-space-2xl animate-fade-in-up delay-100">
          <h2 className="font-headline-xl text-[36px] font-bold text-on-surface mb-space-sm">The 4 Core AI Agents</h2>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
            Our proprietary architecture uses four distinct AI agents working in parallel to monitor, challenge, and elevate your performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {/* Agent 1 */}
          <div className="group p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 hover:border-secondary/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-100">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-space-lg group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[28px]">search_insights</span>
            </div>
            <h3 className="font-headline-sm text-[22px] font-bold text-on-surface mb-space-sm">Diagnostic Evaluator</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed mb-space-md">
              Scans your initial inputs to construct a highly granular baseline of your Lexical Resource, Grammatical Range, and Coherence.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-caption text-[12px]">Gap Analysis</span>
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-caption text-[12px]">Baseline Scoring</span>
            </div>
          </div>

          {/* Agent 2 */}
          <div className="group p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 hover:border-secondary/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-200">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-space-lg group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[28px]">route</span>
            </div>
            <h3 className="font-headline-sm text-[22px] font-bold text-on-surface mb-space-sm">Progression Coordinator</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed mb-space-md">
              Dynamically maps out your daily curriculum. If you struggle with passive voice, it injects three micro-drills before your next essay.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-caption text-[12px]">Curriculum Routing</span>
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-caption text-[12px]">Adaptive Sequencing</span>
            </div>
          </div>

          {/* Agent 3 */}
          <div className="group p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 hover:border-secondary/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-300">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-space-lg group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[28px]">rate_review</span>
            </div>
            <h3 className="font-headline-sm text-[22px] font-bold text-on-surface mb-space-sm">Real-time Assessor</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed mb-space-md">
              Evaluates your writing and speaking submissions in under 10 seconds, leaving strict, Cambridge-aligned margin notes and band estimates.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-caption text-[12px]">Instant Grading</span>
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-caption text-[12px]">Rubric Alignment</span>
            </div>
          </div>

          {/* Agent 4 */}
          <div className="group p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 hover:border-secondary/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up delay-400">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-space-lg group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-[28px]">smart_toy</span>
            </div>
            <h3 className="font-headline-sm text-[22px] font-bold text-on-surface mb-space-sm">Distractor Synthesizer</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed mb-space-md">
              Monitors the exact traps you fall for in Reading/Listening tests, and generates custom questions that force you to confront those exact traps.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-caption text-[12px]">Cognitive Trap Gen</span>
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-caption text-[12px]">Memory Retention</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRADITIONAL VS AI (MODERN SPLIT VIEW) */}
      <section className="w-full bg-surface-container-low py-space-3xl border-y border-outline-variant/20">
        <div className="max-w-[80rem] mx-auto px-4">
          <div className="text-center mb-space-2xl">
            <h2 className="font-headline-xl text-[36px] font-bold text-on-surface">Why PPAcademia AI?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl">
            {/* The Old Way */}
            <div className="bg-surface-container p-space-xl rounded-3xl border border-outline-variant/20 opacity-80">
              <div className="flex items-center gap-3 mb-space-lg border-b border-outline-variant/20 pb-space-md">
                <span className="material-symbols-outlined text-[28px] text-error">cancel</span>
                <h3 className="font-headline-sm text-[24px] font-bold text-on-surface">Static Courses</h3>
              </div>
              <ul className="space-y-space-md">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-outline mt-1">remove</span>
                  <p className="font-body-sm text-on-surface-variant">One-size-fits-all linear syllabus.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-outline mt-1">remove</span>
                  <p className="font-body-sm text-on-surface-variant">Recycled PDFs and memorized answers.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-outline mt-1">remove</span>
                  <p className="font-body-sm text-on-surface-variant">48–72 hours delayed grading turnaround.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-outline mt-1">remove</span>
                  <p className="font-body-sm text-on-surface-variant">Generic feedback without prescriptive drills.</p>
                </li>
              </ul>
            </div>

            {/* The New Way */}
            <div className="bg-surface-container-lowest p-space-xl rounded-3xl border-2 border-secondary shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-space-lg border-b border-secondary/20 pb-space-md">
                <span className="material-symbols-outlined text-[28px] text-secondary">check_circle</span>
                <h3 className="font-headline-sm text-[24px] font-bold text-on-surface">PPAcademia AI Dashboard</h3>
              </div>
              <ul className="space-y-space-md relative z-10">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-1">check</span>
                  <p className="font-body-sm text-on-surface">Dynamic path reconfigures after every question.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-1">check</span>
                  <p className="font-body-sm text-on-surface">On-demand generation with zero prompt reuse.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-1">check</span>
                  <p className="font-body-sm text-on-surface">Sub-10-second grading by parallel AI agents.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-1">check</span>
                  <p className="font-body-sm text-on-surface">Granular heatmaps and automatic remediation.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="max-w-[80rem] mx-auto px-4 py-space-3xl text-center">
        <h2 className="font-headline-xl text-[36px] font-bold text-on-surface mb-space-md">Ready to access the dashboard?</h2>
        <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto mb-space-xl">
          Join the platform and take our free diagnostic evaluation to generate your personalized learning roadmap instantly.
        </p>
        <Link href="/signup" className="inline-flex items-center gap-space-xs px-space-2xl py-space-md rounded-xl bg-secondary text-white font-label-md text-[16px] font-bold hover:bg-secondary-container transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          <span>Create Student Account</span>
          <span className="material-symbols-outlined text-[20px]">login</span>
        </Link>
      </section>

    </div>
  );
}
