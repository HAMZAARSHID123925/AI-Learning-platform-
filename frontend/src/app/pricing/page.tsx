"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PricingPage() {
  const [isQuarterly, setIsQuarterly] = useState(false);

  return (
    <div className="w-full pt-20 bg-surface flex flex-col">

{/* 1. PREMIUM PRICING HERO SECTION */}
<section className="relative w-full pt-16 md:pt-24 pb-32 overflow-hidden bg-gradient-to-b from-[#001F3F] via-[#003366] to-[#027FFF] text-white">
  {/* Abstract Background Elements */}
  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent bg-[length:30px_30px] opacity-20"></div>

  <div className="max-w-[80rem] mx-auto flex flex-col items-center text-center px-4 relative z-10 animate-fade-in-up">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-amber-400 font-label-sm text-[13px] font-bold shadow-sm mb-8">
      <span className="material-symbols-outlined text-[16px]">verified</span>
      <span className="tracking-widest uppercase">Institutional Band Descriptors v4.2 Calibrated</span>
    </div>
    
    <h1 className="font-display-lg text-[40px] md:text-[64px] leading-[1.1] font-bold tracking-tight text-white max-w-4xl mb-6">
      Transparent Pricing. Institutional Precision.
    </h1>
    
    <p className="max-w-3xl font-body-lg text-[18px] md:text-[20px] text-white/80 leading-relaxed mb-10">
      85% less expensive than private human tutoring, calibrated against 45,000+ British Council & IDP exam transcripts with an audited 98.4% examiner consensus accuracy.
    </p>
    
    {/* Toggle Switch */}
    <div className="flex flex-col sm:flex-row items-center gap-4 p-2 bg-black/20 backdrop-blur-md rounded-full shadow-inner border border-white/10">
      <div className="flex items-center p-1 bg-white/10 rounded-full">
        <button 
          className={`px-6 py-3 rounded-full font-label-md text-[16px] font-bold transition-all duration-300 shadow-sm ${!isQuarterly ? 'bg-white text-[#003366]' : 'text-white/70 hover:text-white'}`} 
          onClick={() => setIsQuarterly(false)}
        >
          Monthly Billing
        </button>
        <button 
          className={`px-6 py-3 rounded-full font-label-md text-[16px] font-bold transition-all duration-300 flex items-center gap-2 ${isQuarterly ? 'bg-white text-[#003366] shadow-sm' : 'text-white/70 hover:text-white'}`} 
          onClick={() => setIsQuarterly(true)}
        >
          <span>Quarterly</span>
          <span className={`px-2 py-0.5 rounded-full font-caption text-[12px] font-bold ${isQuarterly ? 'bg-amber-400 text-[#003366]' : 'bg-white/20 text-white'}`}>Save 28%</span>
        </button>
      </div>
      <span className="text-white/60 font-caption text-[13px] pr-4 hidden sm:inline-flex items-center gap-1 font-medium">
        <span className="material-symbols-outlined text-[16px]">lock</span> Zero hidden commitment
      </span>
    </div>
  </div>
</section>

<section className="max-w-[80rem] mx-auto px-4 pb-20 w-full relative z-20 -mt-20">
<div className="max-w-[80rem] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">

<div className="flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl shadow-md transition-transform duration-300 hover:-translate-y-1">
<div>
<div className="flex items-center justify-between gap-space-xs mb-space-sm">
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Baseline Evaluation</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container text-on-surface-variant font-caption text-caption">No card required</span>
</div>
<h2 className="font-headline-md text-headline-md text-on-surface">Diagnostic Baseline</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
            Essential starting point to pinpoint current band status across TR, CC, LR, and GRA parameters.
          </p>
<div className="my-space-lg">
<div className="flex items-baseline gap-space-xs">
<span className="font-display-lg text-display-lg font-bold text-on-surface">$0</span>
<span className="font-body-md text-body-md text-on-surface-variant">/ 7-day trial</span>
</div>
<p className="font-caption text-caption text-on-surface-variant mt-space-xxs">Automated CEFR conversion report included</p>
</div>
<div className="space-y-space-sm pt-space-sm">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>10-Minute AI Diagnostic Check</strong> with projected sub-band scores</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>1 Full Computer-Delivered Mock</strong> (Academic or General Training)</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface">Official 4-criteria rubric snapshot &amp; diagnostic gap summary</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-outline-variant text-title-md shrink-0">remove</span>
<span className="font-body-sm text-body-sm text-on-surface-variant line-through">Speaking audio acoustic waveform analysis</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-outline-variant text-title-md shrink-0">remove</span>
<span className="font-body-sm text-body-sm text-on-surface-variant line-through">Adaptive RAG-guided drill recommendations</span>
</div>
</div>
</div>
<div className="pt-space-xl mt-space-lg">
<Link className="w-full inline-flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm" href="/signup">
<span className="">Start Free Diagnostic Test</span>
<span className="material-symbols-outlined text-label-md">arrow_forward</span>
</Link>
</div>
</div>

<div className="relative flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl shadow-xl transition-transform duration-300 hover:-translate-y-1 lg:-mt-4 lg:mb-[-1rem]">
<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary font-label-sm text-label-sm py-1 px-space-md rounded-full uppercase tracking-wider shadow-md flex items-center gap-space-xxs">
<span className="material-symbols-outlined text-caption" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="">Most Popular Choice</span>
</div>
<div>
<div className="flex items-center justify-between gap-space-xs mb-space-sm">
<span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-semibold">Candidate Core</span>
<span className="px-space-xs py-space-xxs rounded bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">High Velocity</span>
</div>
<h2 className="font-headline-md text-headline-md text-on-surface">Adaptive Mastery</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
            Full autonomous training system designed for candidates requiring Band 7.0+ within 4 to 8 weeks.
          </p>
<div className="my-space-lg">
<div className="flex items-baseline gap-space-xs">
<span className="font-display-lg text-display-lg font-bold text-on-surface">{isQuarterly ? '$28' : '$39'}</span>
<span className="font-body-md text-body-md text-on-surface-variant">/ month</span>
</div>
<p className="font-caption text-caption text-on-surface-variant mt-space-xxs">
  {isQuarterly ? 'Billed $84 quarterly (Save 28%). Cancel anytime.' : 'Billed monthly. Cancel anytime with 1 click.'}
</p>
</div>
<div className="space-y-space-sm pt-space-sm">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>Unlimited Multi-Agent Evaluations</strong> (&lt;10s rubric breakdown)</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>Dynamic RAG Syllabus</strong> targeting individual grammar &amp; lexical flaws</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>Targeted Micro-Drill Engine</strong> for Task 1, Task 2 &amp; Speaking cue cards</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>Full Speaking &amp; Phonology Simulator</strong> with phoneme stress detection</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>12 Realistic Mock Exams</strong> with live Cambridge timing constraints</span>
</div>
</div>
</div>
<div className="pt-space-xl mt-space-lg">
<Link className="w-full inline-flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md font-semibold transition-colors shadow-md" href="/signup">
<span className="">Get Started with Adaptive Mastery</span>
<span className="material-symbols-outlined text-label-md">arrow_forward</span>
</Link>
</div>
</div>

<div className="flex flex-col justify-between bg-surface-container-lowest rounded-xl p-space-xl shadow-md transition-transform duration-300 hover:-translate-y-1">
<div>
<div className="flex items-center justify-between gap-space-xs mb-space-sm">
<span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Guaranteed Outcome</span>
<span className="px-space-xs py-space-xxs rounded bg-surface-container text-on-surface-variant font-caption text-caption">Accredited Review</span>
</div>
<h2 className="font-headline-md text-headline-md text-on-surface">Band 7.5+ Guarantee</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
            Blended AI power backed by certified senior human examiners and a contractual score gain guarantee.
          </p>
<div className="my-space-lg">
<div className="flex items-baseline gap-space-xs">
<span className="font-display-lg text-display-lg font-bold text-on-surface">{isQuarterly ? '$64' : '$89'}</span>
<span className="font-body-md text-body-md text-on-surface-variant">/ month</span>
</div>
<p className="font-caption text-caption text-on-surface-variant mt-space-xxs">
  {isQuarterly ? 'Billed $192 quarterly (Save 28%). Full guarantee terms.' : 'Money-back guarantee terms apply to minimum 6-week cohorts.'}
</p>
</div>
<div className="space-y-space-sm pt-space-sm">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>Everything included in Adaptive Mastery</strong></span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>Human-in-the-Loop Examiner Review:</strong> 4 deep audits from former English Language examiners</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>Verifiable Score Guarantee:</strong> Band 7.5+ achieved or 100% full tuition refund</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>Priority Examiner Q&amp;A Channel</strong> (response within 6 hours)</span>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-title-md shrink-0">check_circle</span>
<span className="font-body-sm text-body-sm text-on-surface"><strong>1-on-1 Mock Interview Strategy Session</strong> via encrypted video</span>
</div>
</div>
</div>
<div className="pt-space-xl mt-space-lg">
<Link className="w-full inline-flex items-center justify-center gap-space-xs py-space-sm px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors shadow-sm" href="/signup">
<span className="">Enroll with Score Guarantee</span>
<span className="material-symbols-outlined text-label-md">arrow_forward</span>
</Link>
</div>
</div>
</div>
</section>

<section className="px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-2xl bg-surface-container-low px-4">
<div className="max-w-[80rem] mx-auto">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
<div>
<span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-semibold">Institutional Validation</span>
<h2 className="font-headline-xl text-headline-xl text-on-surface mt-space-xxs">
            Architectural Benchmark Comparison
          </h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Contrast our low-latency multi-agent neural assessment pipeline with dated pedagogical models.
        </p>
</div>
<div className="overflow-x-auto bg-surface-container-lowest rounded-xl shadow-md">
<table className="w-full text-left font-body-md text-body-md">
<thead>
<tr className="bg-surface-container text-on-surface font-label-md text-label-md">
<th className="py-space-md px-space-lg font-semibold w-1/4">Evaluation Metric</th>
<th className="py-space-md px-space-lg font-semibold text-secondary w-1/4 bg-surface-container-high/60">PPAcademia AI Platform</th>
<th className="py-space-md px-space-lg font-semibold text-on-surface-variant w-1/4">Private Human Tutors</th>
<th className="py-space-md px-space-lg font-semibold text-on-surface-variant w-1/4">Static Video Courses</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container/50">
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-lg font-semibold text-on-surface">Evaluation Latency</td>
<td className="py-space-md px-space-lg bg-surface-container-high/20 font-semibold text-secondary flex items-center gap-space-xs">
<span className="material-symbols-outlined text-label-md" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> &lt; 10 seconds
              </td>
<td className="py-space-md px-space-lg text-on-surface-variant">48 to 72 hours per essay</td>
<td className="py-space-md px-space-lg text-on-surface-variant">None (Self-graded)</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-lg font-semibold text-on-surface">Average Monthly Cost</td>
<td className="py-space-md px-space-lg bg-surface-container-high/20 font-semibold text-secondary">
                $39 / month
              </td>
<td className="py-space-md px-space-lg text-on-surface-variant">$300 to $600 / month</td>
<td className="py-space-md px-space-lg text-on-surface-variant">$99 to $199 one-off</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-lg font-semibold text-on-surface">Rubric Alignment</td>
<td className="py-space-md px-space-lg bg-surface-container-high/20 font-semibold text-secondary">
                98.4% examiner consensus
              </td>
<td className="py-space-md px-space-lg text-on-surface-variant">Subjective (Single tutor bias)</td>
<td className="py-space-md px-space-lg text-on-surface-variant">Generic static rubrics</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-lg font-semibold text-on-surface">Curriculum Customization</td>
<td className="py-space-md px-space-lg bg-surface-container-high/20 font-semibold text-secondary">
                Dynamic RAG (Per-candidate)
              </td>
<td className="py-space-md px-space-lg text-on-surface-variant">Semi-customized lesson plan</td>
<td className="py-space-md px-space-lg text-on-surface-variant">Rigid pre-recorded tracks</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-lg font-semibold text-on-surface">Weakness Remediation</td>
<td className="py-space-md px-space-lg bg-surface-container-high/20 font-semibold text-secondary">
                Automated gating &amp; micro-drills
              </td>
<td className="py-space-md px-space-lg text-on-surface-variant">Manual PDF homework assignments</td>
<td className="py-space-md px-space-lg text-on-surface-variant">Zero guided feedback</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-lg font-semibold text-on-surface">Availability &amp; Repetitions</td>
<td className="py-space-md px-space-lg bg-surface-container-high/20 font-semibold text-secondary">
                24/7 unlimited on-demand
              </td>
<td className="py-space-md px-space-lg text-on-surface-variant">Scheduled 60m time-slots</td>
<td className="py-space-md px-space-lg text-on-surface-variant">24/7 passive playback</td>
</tr>
</tbody>
</table>
</div>
</div>
</section>

<section className="px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop py-space-3xl px-4">
<div className="max-w-4xl mx-auto">
<div className="text-center mb-space-2xl">
<span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-semibold">Institutional Assurance</span>
<h2 className="font-headline-xl text-headline-xl text-on-surface mt-space-xxs">
          Frequently Answered Assessment Inquiries
        </h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
          Clear policies on grading governance, cancellation terms, and score warranties.
        </p>
</div>
<div className="space-y-space-md">
<details className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm transition-all open:shadow-md">
<summary className="flex items-center justify-between font-headline-sm text-headline-sm text-on-surface cursor-pointer list-none select-none">
<span className="">How does the 7-day refund policy &amp; score-gain guarantee work?</span>
<span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform duration-200">expand_more</span>
</summary>
<div className="mt-space-md font-body-md text-body-md text-on-surface-variant leading-relaxed">
            If you enroll in our Adaptive Mastery or Band 7.5+ Guarantee tiers and complete our baseline test plus at least 4 practice modules within the initial 7 days, you can request an instant 100% refund with no interrogations. For the 7.5+ Guarantee plan, if you maintain 85% syllabus adherence and do not score Band 7.5 or higher on your official exam within 90 days, we remit your full subscription amount immediately upon official TRF submission.
          </div>
</details>
<details className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm transition-all open:shadow-md">
<summary className="flex items-center justify-between font-headline-sm text-headline-sm text-on-surface cursor-pointer list-none select-none">
<span className="">How does multi-agent AI grading compare to official human examiners?</span>
<span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform duration-200">expand_more</span>
</summary>
<div className="mt-space-md font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Our neural infrastructure distributes your writing or speech sample to four specialized evaluators simultaneously: Task Achievement Agent, Coherence &amp; Cohesion Agent, Lexical Resource Agent, and Grammatical Range &amp; Accuracy Agent. In an independent double-blind evaluation of 2,400 Cambridge Language papers, the system demonstrated a 98.4% inter-rater agreement score compared to Cambridge Senior Team Leaders.
          </div>
</details>
<details className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm transition-all open:shadow-md">
<summary className="flex items-center justify-between font-headline-sm text-headline-sm text-on-surface cursor-pointer list-none select-none">
<span className="">What happens if my score in a specific sub-skill drops during practice?</span>
<span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform duration-200">expand_more</span>
</summary>
<div className="mt-space-md font-body-md text-body-md text-on-surface-variant leading-relaxed">
            The platform activates an automated remediation trigger. When negative variance is detected (such as persistent comma splices or acoustic pauses exceeding 2.5 seconds), the engine halts standard mock testing and inserts high-frequency 3-minute remedial micro-drills to fortify that specific linguistic construct before you proceed.
          </div>
</details>
<details className="group bg-surface-container-lowest rounded-xl p-space-lg shadow-sm transition-all open:shadow-md">
<summary className="flex items-center justify-between font-headline-sm text-headline-sm text-on-surface cursor-pointer list-none select-none">
<span className="">Can I switch plans or cancel my subscription anytime?</span>
<span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform duration-200">expand_more</span>
</summary>
<div className="mt-space-md font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Yes. You maintain sovereign autonomy over your account. Upgrade, downgrade between tiers, or cancel automatic billing at any time within your student dashboard. Upon cancellation, your active access continues uninterrupted until the conclusion of your billing cycle.
          </div>
</details>
</div>
</div>
</section>

<section className="px-gutter-mobile md:px-gutter-tablet lg:px-gutter-desktop pb-space-3xl px-4">
<div className="max-w-[80rem] mx-auto bg-primary text-on-primary rounded-xl p-space-xl md:p-space-2xl shadow-xl relative overflow-hidden">
<div className="absolute -right-16 -bottom-16 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
<div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-space-xl">
<div className="max-w-2xl text-center lg:text-left">
<span className="inline-block px-space-sm py-space-xxs rounded-full bg-surface-container-high/20 text-inverse-on-surface font-caption text-caption mb-space-sm">
            Personalized Academic Placement
          </span>
<h2 className="font-headline-xl text-headline-xl text-on-primary tracking-tight">
            Not sure which plan matches your target date?
          </h2>
<p className="font-body-md text-body-md text-on-primary-container mt-space-xs leading-relaxed">
            Take our 10-minute diagnostic check to discover your current baseline, or consult directly with an accredited English curriculum specialist.
          </p>
</div>
<div className="flex flex-col sm:flex-row items-center gap-space-sm shrink-0 w-full sm:w-auto">
<Link className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs py-space-sm px-space-lg rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md font-semibold transition-colors shadow-md" href="/courses">
<span className="">Start Free Diagnostic Check</span>
<span className="material-symbols-outlined text-label-md">arrow_forward</span>
</Link>
<Link className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs py-space-sm px-space-lg rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-label-md text-label-md transition-colors" href="/contact">
<span className="">Speak to an Advisor</span>
<span className="material-symbols-outlined text-label-md">headset_mic</span>
</Link>
</div>
</div>
</div>
</section>

    </div>
  );
}
