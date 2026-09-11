"use client";

import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>

<main className="min-h-screen bg-surface text-on-surface selection:bg-secondary-container selection:text-on-secondary-container relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
  {/* Ambient Glow Effects matching theme */}
  <div className="absolute top-20 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[46rem] h-[26rem] bg-secondary-fixed-dim/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
  <div className="absolute top-[45%] right-8 w-[32rem] h-[24rem] bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
  <div className="absolute bottom-40 left-12 w-[34rem] h-[22rem] bg-secondary-fixed-dim/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

  <div className="max-w-[80rem] mx-auto space-y-24">

    {/* 1. Hero Header */}
    <section className="text-center max-w-3xl mx-auto pt-6 space-y-6">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
        Institutional Mission &amp; Pedagogy
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-tight">
        Democratizing Elite<br />
        <span className="text-secondary">Institutional Prep.</span>
      </h1>

      <p className="text-base sm:text-lg text-on-surface-variant font-normal leading-relaxed max-w-2xl mx-auto">
        We are on a mission to replace subjective, cost-prohibitive human tutoring with autonomous multi-agent intelligence—calibrated strictly to official Cambridge, British Council, and IDP rubrics with zero examiner bias.
      </p>

      {/* Key Quantitative Metrics Strip */}
      <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm text-center">
          <span className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">98.4%</span>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">Rubric Consensus</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm text-center">
          <span className="font-serif text-2xl sm:text-3xl font-bold text-secondary">45,000+</span>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">Audited Transcripts</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm text-center">
          <span className="font-serif text-2xl sm:text-3xl font-bold text-on-surface">&lt;10s</span>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">Evaluation Latency</p>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm text-center">
          <span className="font-serif text-2xl sm:text-3xl font-bold text-secondary">85%</span>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">Cost Reduction</p>
        </div>
      </div>
    </section>

    {/* 2. Our Story / The Problem (Split-Pane Section) */}
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
      {/* Left: Story Narrative & The Problem */}
      <div className="lg:col-span-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-container text-secondary text-xs font-semibold uppercase tracking-wider">
          The Origin
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-on-surface leading-snug">
          Examiners saw the flaw in traditional testing. AI researchers built the solution.
        </h2>
        <div className="space-y-4 text-base text-on-surface-variant leading-relaxed">
          <p>
            For decades, high-stakes IELTS candidates had only two flawed choices: pay upwards of <strong>$50 to $100 per hour</strong> for private tutoring that takes days to return marked essays, or resort to static video courses and generic answer keys with zero actionable feedback.
          </p>
          <p>
            Worse yet, human assessment suffers from subjective variance. A candidate might receive a Band 6.5 from one tutor on Monday and a Band 7.5 from another on Tuesday. The inconsistency turns immigration, medical licensing, and university matriculation into a gamble.
          </p>
          <p>
            In 2024, former senior IELTS examiners partnered with NLP research scientists to build <strong>IELTS.AI</strong>: an ensemble of four specialized neural agents executing discrete rubric evaluations in parallel, backed by dynamic vector retrieval of verified examiner notes.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-6 text-sm text-on-surface">
          <div className="flex items-center gap-2 font-medium">
            <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            Cambridge 2026 Calibrated
          </div>
          <div className="flex items-center gap-2 font-medium">
            <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            Zero Rote Memorization
          </div>
          <div className="flex items-center gap-2 font-medium">
            <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            Closed-Loop Diagnostic Gating
          </div>
        </div>
      </div>

      {/* Right: Sleek Visual / Graphic Representation */}
      <div className="lg:col-span-6">
        <div className="relative rounded-3xl overflow-hidden border border-outline-variant/60 bg-surface-container-lowest shadow-xl p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/50 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="font-serif text-sm font-bold text-on-surface">Assessment Architecture Analysis</span>
              </div>
              <span className="text-xs bg-tertiary-container text-on-tertiary-container px-2.5 py-1 rounded-full font-semibold">Live Pipeline</span>
            </div>

            {/* Visual Split Metric Comparison */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                  <span>Legacy Human Tutoring</span>
                  <span className="text-rose-600 font-bold">48-72h Latency • ±1.0 Band Drift</span>
                </div>
                <div className="w-full bg-outline-variant/40 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-2 rounded-full w-[35%]"></div>
                </div>
                <p className="text-[12px] text-on-surface-variant">Subjective to fatigue, halo effects, and arbitrary single-tutor preferences.</p>
              </div>

              <div className="p-4 rounded-2xl bg-secondary-container/40 border border-secondary/30 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-on-secondary-container">
                  <span>IELTS.AI Multi-Agent Consensus</span>
                  <span className="text-secondary font-bold">&lt;10s Latency • 98.4% Consensus</span>
                </div>
                <div className="w-full bg-secondary-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-2 rounded-full w-[98.4%]"></div>
                </div>
                <p className="text-[12px] text-on-surface-variant">4 specialized sub-agents independently mark Task Achievement, Coherence, Lexicon, and Grammar.</p>
              </div>
            </div>

            {/* Quote badge */}
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/50 text-xs text-on-surface-variant leading-relaxed italic">
              &quot;We didn&apos;t set out to build another study app. We set out to give every aspiring scholar and immigrant the rigorous, honest assessment standard once reserved for elite private academies.&quot;
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* 3. Our Core Pillars (Grid of 3 Cards) */}
    <section className="space-y-10 pt-4">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary-container text-on-secondary-container text-xs font-semibold uppercase tracking-wider">
          Foundational Principles
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-on-surface">The Three Pillars of Institutional AI</h2>
        <p className="text-sm sm:text-base text-on-surface-variant">
          Built without compromise for candidates whose futures depend on meeting rigid band targets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Pillar 1: Zero Examiner Bias */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center font-serif text-xl font-bold">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">98.4% Consensus Audited</span>
              <h3 className="font-serif text-2xl font-bold text-on-surface">Zero Examiner Bias</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Human scorers fluctuate with fatigue, accent familiarity, and cognitive heuristics. IELTS.AI executes parallel multi-agent evaluation where individual rubric criteria are independently verified and reconciled by referee nodes.
            </p>
          </div>
          <div className="pt-6 border-t border-outline-variant/40 mt-6">
            <span className="text-xs font-semibold text-secondary flex items-center gap-1.5">
              Audited against 45,000+ transcripts ➔
            </span>
          </div>
        </div>

        {/* Pillar 2: Uncompromising Rigor */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-container text-on-surface flex items-center justify-center font-serif text-xl font-bold">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">2026 Cambridge Benchmark</span>
              <h3 className="font-serif text-2xl font-bold text-on-surface">Uncompromising Rigor</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Generic LLMs inflate candidate scores with polite hallucinations. Our proprietary RAG pipeline anchors every diagnostic to official British Council band descriptors (0–9) and enforces rigorous closed-loop gating on grammatical deficits.
            </p>
          </div>
          <div className="pt-6 border-t border-outline-variant/40 mt-6">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              Exact CEFR C1 &amp; C2 calibrations ➔
            </span>
          </div>
        </div>

        {/* Pillar 3: Global Accessibility */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-serif text-xl font-bold">
              <svg className="w-6 h-6 text-on-tertiary-container" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">Democratized Access</span>
              <h3 className="font-serif text-2xl font-bold text-on-surface">Global Accessibility</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Elite $600/month private tutoring should not be the gatekeeper to studying or working abroad. We deliver instant, unlimited 24/7 examiner assessments and personalized remediation for less than the cost of a single private tutor lesson.
            </p>
          </div>
          <div className="pt-6 border-t border-outline-variant/40 mt-6">
            <span className="text-xs font-semibold text-secondary flex items-center gap-1.5">
              Available in 140+ countries 24/7 ➔
            </span>
          </div>
        </div>
      </div>
    </section>

    {/* 4. The Team / Advisory Board */}
    <section className="space-y-10 pt-4">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-container text-secondary text-xs font-semibold uppercase tracking-wider">
          Academic Leadership
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-on-surface">Built by Examiners &amp; AI Researchers</h2>
        <p className="text-sm sm:text-base text-on-surface-variant">
          Our cross-disciplinary board unites decades of certified IELTS marking with frontier neural language evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Advisor 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow text-center">
          <div className="space-y-4">
            {/* Professional Silhouette / Headshot Placeholder */}
            <div className="w-24 h-24 mx-auto rounded-full bg-surface-container flex items-center justify-center text-secondary border-2 border-outline-variant/60 overflow-hidden shadow-inner">
              <svg className="w-14 h-14 text-on-surface-variant/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-on-surface">Dr. Marcus Vance</h3>
              <p className="text-xs font-semibold text-secondary tracking-wide uppercase mt-0.5">Former British Council Assessor</p>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              18+ years senior examiner across London and Singapore. Led official calibration workshops for over 250 test center assessors.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/40 text-[11px] text-on-surface-variant font-medium">
            M.A. Applied Linguistics, Oxford
          </div>
        </div>

        {/* Advisor 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-surface-container flex items-center justify-center text-secondary border-2 border-outline-variant/60 overflow-hidden shadow-inner">
              <svg className="w-14 h-14 text-on-surface-variant/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-on-surface">Elena Rostova, Ph.D.</h3>
              <p className="text-xs font-semibold text-secondary tracking-wide uppercase mt-0.5">Head of NLP Engineering</p>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pioneered consensus-driven multi-agent LLM arbitration for automated grammatical error correction and syntactic evaluation.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/40 text-[11px] text-on-surface-variant font-medium">
            Ex-DeepMind Research Fellow, Cambridge
          </div>
        </div>

        {/* Advisor 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-surface-container flex items-center justify-center text-secondary border-2 border-outline-variant/60 overflow-hidden shadow-inner">
              <svg className="w-14 h-14 text-on-surface-variant/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-on-surface">Julian Chen, Ed.M.</h3>
              <p className="text-xs font-semibold text-secondary tracking-wide uppercase mt-0.5">Lead Curriculum Architect</p>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Designed adaptive diagnostic pathways that have propelled 12,000+ candidates past the stubborn Band 6.5 writing ceiling into Band 7.5+.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/40 text-[11px] text-on-surface-variant font-medium">
            Harvard Graduate School of Education
          </div>
        </div>

        {/* Advisor 4 */}
        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-surface-container flex items-center justify-center text-secondary border-2 border-outline-variant/60 overflow-hidden shadow-inner">
              <svg className="w-14 h-14 text-on-surface-variant/40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-on-surface">Sarah Al-Mansoor</h3>
              <p className="text-xs font-semibold text-secondary tracking-wide uppercase mt-0.5">Examiner Standards Auditor</p>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Certified IDP test coordinator overseeing international compliance and psychometric accuracy across computer-delivered test environments.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/40 text-[11px] text-on-surface-variant font-medium">
            B.A. English Philology, Sydney
          </div>
        </div>
      </div>
    </section>

    {/* 5. Final Call to Action (Bold bg-primary banner) */}
    <section className="bg-primary text-on-primary rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
      {/* Subtle Decorative Accent Background Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mx-auto space-y-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-medium tracking-wide uppercase backdrop-blur-sm">
          Strict Cambridge Rubric Alignment
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Experience the IELTS.AI Difference.
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Discover your authentic band score across all 4 criteria in under 10 minutes. Receive a customized adaptive remediation roadmap with zero credit card required.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-secondary text-on-secondary font-semibold text-sm hover:bg-secondary/90 transition-all shadow-lg hover:shadow-secondary/30 flex items-center justify-center gap-2">
            Start Free Diagnostic Test
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </Link>
          <Link href="/courses" className="w-full sm:w-auto px-6 py-4 rounded-xl border border-outline-variant/30 text-white font-medium text-sm hover:bg-white/10 transition-colors">
            Explore Course Curriculum
          </Link>
        </div>

        <div className="pt-3 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            Instant CEFR breakdown
          </span>
        </div>
      </div>
    </section>

  </div>
</main>

    </>
  );
}
