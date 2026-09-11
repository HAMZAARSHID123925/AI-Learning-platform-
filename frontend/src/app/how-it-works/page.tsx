"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function HowItWorksPage() {
  const [activeSample, setActiveSample] = useState("band6");

  return (
    <div className="w-full pt-16 bg-surface flex flex-col">

{/* Hero Header Section */}
<section className="relative w-full overflow-hidden bg-surface pt-space-2xl pb-space-3xl">
{/* Ambient subtle background depth circle */}
<div className="absolute -top-24 right-1/4 w-96 h-96 bg-secondary-fixed-dim/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
<div className="absolute top-1/2 left-10 w-72 h-72 bg-tertiary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
<div className="max-w-[80rem] mx-auto px-4 flex flex-col items-center text-center">
{/* Adaptive Engine Pulsing Pill */}
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xxs rounded-full bg-surface-container-low text-secondary font-label-md text-label-md shadow-sm mb-space-lg">
<span className="relative flex h-2 w-2">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
<span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
</span>
<span className="material-symbols-outlined text-[16px]">auto_awesome</span>
<span>Our Adaptive Engine</span>
</div>
{/* Main Headline */}
<h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight max-w-4xl font-semibold">
        How Our AI Agents Personalize Your IELTS Journey
      </h1>
{/* Subtitle */}
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-md leading-relaxed">
        See behind the scenes of how our multi-agent AI evaluates your skills and adapts your curriculum in real-time, matching official British Council examiner accuracy.
      </p>
{/* Live Engine Telemetry Ticker */}
<div className="mt-space-xl flex flex-wrap items-center justify-center gap-x-space-lg gap-y-space-xs px-space-lg py-space-sm bg-surface-container-lowest rounded-xl shadow-md text-on-surface-variant font-label-sm text-label-sm">
<div className="flex items-center gap-space-xs">
<span className="h-2 w-2 rounded-full bg-tertiary-container"></span>
<span className="font-medium text-on-surface">RAG Pipeline:</span>
<span className="text-tertiary-container font-semibold">Active &amp; Vector-Indexed</span>
</div>
<span className="hidden sm:inline text-outline-variant">•</span>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[15px] text-secondary">verified</span>
<span className="font-medium text-on-surface">Cambridge 2026 Rubric Benchmarked</span>
</div>
<span className="hidden sm:inline text-outline-variant">•</span>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[15px] text-secondary">bolt</span>
<span className="font-medium text-on-surface">Latency:</span>
<span className="font-mono text-on-surface font-semibold">&lt;1.2s per Evaluation</span>
</div>
</div>
</div>
</section>
{/* Editorial Architectural Overview Image / Visual Break */}
<section className="max-w-[80rem] mx-auto px-4 w-full -mt-space-xl mb-space-3xl">
<div className="relative rounded-xl overflow-hidden shadow-xl bg-surface-container-lowest">
<div className="grid grid-cols-1 lg:grid-cols-12 min-h-[22rem]">
<div className="lg:col-span-7 p-space-xl lg:p-space-2xl flex flex-col justify-between bg-surface-container-lowest">
<div>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">Institutional Assessment Rigor</span>
<h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface mt-space-xs font-semibold">
              Calibrated on Over 45,000 Cambridge &amp; IDP Exam Transcripts
            </h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-md leading-relaxed">
              Standard LLMs suffer from cognitive hallucinations and lenient grade inflation. IELTS.AI anchors prompt synthesis and evaluation across official examiner annotations, ensuring strict zero-drift adherence to band level thresholds.
            </p>
</div>
<div className="grid grid-cols-3 gap-space-md pt-space-lg">
<div className="bg-surface-container-low p-space-md rounded-lg">
<span className="font-display-lg text-headline-md text-primary font-semibold block">98.4%</span>
<span className="font-caption text-caption text-on-surface-variant">Examiner Agreement</span>
</div>
<div className="bg-surface-container-low p-space-md rounded-lg">
<span className="font-display-lg text-headline-md text-secondary font-semibold block">4 Band</span>
<span className="font-caption text-caption text-on-surface-variant">Discrete Rubric Agents</span>
</div>
<div className="bg-surface-container-low p-space-md rounded-lg">
<span className="font-display-lg text-headline-md text-on-surface font-semibold block">0.5</span>
<span className="font-caption text-caption text-on-surface-variant">Granular Band Delta</span>
</div>
</div>
</div>
<div className="lg:col-span-5 relative min-h-[16rem] lg:min-h-full">
<img className="w-full h-full object-cover" alt="An austere, dignified modern university examination hall with candidates seated at sleek clean testing desks under soft daylight. In the foreground, an academic assessor reviews formal criteria charts. The visual conveys institutional prestige and academic rigor with deep slate and soft blue lighting accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8cWmoN9k24NL7J5UimoUjV_VY8NXaO74xrZpH7UJ7Y60oQT5cv8D0IT_kEQ4wlBtI_oAzslyXT-_EidIQBrVPOPhjwur0BT8_J0MWAO23Fmzoi44mlh6BJYaRidkrsCnIuRj80FONZd-q2iF0-MQQst76g2c5VaJtxb5OnHyDqb0Cv17_ewKhuzoHZIs3YG9mpRIRhvTz3OL_19X3hWrurCXiIE920UerfkAPtGE68xwVHrfv3R4aYw"/>
<div className="absolute inset-0 bg-gradient-to-t from-primary-container/60 via-transparent to-transparent"></div>
<div className="absolute bottom-space-md left-space-md right-space-md p-space-sm bg-surface-container-lowest/90 backdrop-blur-md rounded-lg shadow-sm">
<p className="font-caption text-caption text-on-surface-variant italic">
              &quot;Every submission is analyzed strictly in parallel across Task Achievement, Cohesion, Lexicon, and Grammar.&quot;
            </p>
</div>
</div>
</div>
</div>
</section>
{/* 4-Step Interactive Pipeline Section */}
<section className="w-full bg-surface-container-low py-space-3xl">
<div className="max-w-[80rem] mx-auto px-4">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-md">
<div>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">The Core Engine Architecture</span>
<h2 className="font-display-lg text-headline-xl-mobile md:text-headline-xl text-on-surface font-semibold mt-space-xxs">
            The 4-Step Real-Time Pipeline
          </h2>
</div>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          How data flows from official benchmark archives to adaptive personal mock tests in sub-second cycles.
        </p>
</div>
{/* Pipeline Cards Grid */}
<div className="space-y-space-xl">
{/* STEP 1: RAG Corpus Ingestion */}
<div className="bg-surface-container-lowest rounded-xl p-space-xl lg:p-space-2xl shadow-md grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
<div className="lg:col-span-5 flex flex-col justify-center">
<div className="flex items-center gap-space-sm mb-space-sm">
<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-label-md font-bold">01</span>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Official Rubric &amp; Corpus Ingestion</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
              Smart Curriculum &amp; Knowledge Retrieval (RAG)
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-lg">
              Our AI engine continuously ingests authentic IELTS publications, senior examiner training notes, standard band descriptors, and validated scoring rubrics into a high-dimensional vector space.
            </p>
<div className="flex flex-wrap gap-space-xs">
<span className="px-space-sm py-space-xxs bg-surface-container rounded-md font-caption text-caption text-on-surface font-medium flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-secondary">book</span> Official Cambridge IELTS 14–19
              </span>
<span className="px-space-sm py-space-xxs bg-surface-container rounded-md font-caption text-caption text-on-surface font-medium flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span> British Council Band Descriptors
              </span>
<span className="px-space-sm py-space-xxs bg-surface-container rounded-md font-caption text-caption text-on-surface font-medium flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-secondary">edit_note</span> Examiner Annotations (Tasks 1 &amp; 2)
              </span>
</div>
</div>
<div className="lg:col-span-7 bg-surface-container p-space-lg rounded-xl shadow-inner flex flex-col gap-space-md">
{/* Mock Vector Retrieval Console */}
<div className="flex items-center justify-between pb-space-xs">
<div className="flex items-center gap-space-xs">
<span className="w-3 h-3 rounded-full bg-error inline-block"></span>
<span className="w-3 h-3 rounded-full bg-surface-variant inline-block"></span>
<span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim inline-block"></span>
<span className="font-mono text-caption text-on-surface-variant ml-space-xs">vector-embeddings://cambridge-index-v4.db</span>
</div>
<span className="px-space-xs py-space-xxs bg-surface-container-lowest text-secondary font-label-sm text-caption rounded font-semibold">1,536-dim embeddings</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm font-mono text-caption">
<div className="bg-surface-container-lowest p-space-sm rounded-lg shadow-sm">
<div className="text-secondary font-bold mb-1 flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">search</span> Query Match 0.962
                </div>
<p className="text-on-surface-variant text-[12px] font-sans leading-normal">
                  &quot;Task 2 Band 8.0 Cohesion: Uses a variety of complex sentence structures and linkers with absolute flexibility.&quot;
                </p>
</div>
<div className="bg-surface-container-lowest p-space-sm rounded-lg shadow-sm">
<div className="text-secondary font-bold mb-1 flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">search</span> Query Match 0.941
                </div>
<p className="text-on-surface-variant text-[12px] font-sans leading-normal">
                  &quot;Task 2 Band 6.0 Lexical: Uses an adequate range of vocabulary for the task, but attempts with some inaccuracies.&quot;
                </p>
</div>
</div>
{/* Ingestion visual flow sparkline */}
<div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-secondary">database</span>
<div>
<div className="font-label-md text-label-md text-on-surface font-semibold">Vectorized Knowledge Corpus</div>
<div className="font-caption text-caption text-on-surface-variant">Synchronized with 2026 Academic Writing Specs</div>
</div>
</div>
<span className="text-secondary font-mono font-bold text-caption">LIVE READY</span>
</div>
</div>
</div>
{/* STEP 2: Dynamic Diagnostic Test Generation */}
<div className="bg-surface-container-lowest rounded-xl p-space-xl lg:p-space-2xl shadow-md grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
<div className="lg:col-span-5 order-2 lg:order-1 bg-surface-container p-space-lg rounded-xl shadow-inner">
{/* Mock Dynamic Prompt UI */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="px-space-xs py-space-xxs bg-surface-container-low text-secondary font-label-sm text-caption rounded-md font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">tune</span> Contextual Synthesis
                </span>
<div className="flex items-center gap-space-xs text-on-surface-variant font-mono text-caption">
<span className="material-symbols-outlined text-[14px]">timer</span> 40:00 Target
                </div>
</div>
<div>
<span className="font-caption text-caption text-on-surface-variant uppercase font-semibold tracking-wider">Writing Task 2 Prompt</span>
<h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold mt-space-xxs">
                  Autonomous Urban Transportation &amp; Carbon Neutrality
                </h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed italic bg-surface-container-low p-space-sm rounded-md">
                  &quot;Some experts argue that private vehicular transport must be entirely phased out in municipal centers in favor of public AI transit. To what extent do you agree or disagree?&quot;
                </p>
</div>
<div className="flex items-center justify-between pt-space-xs">
<span className="font-caption text-caption text-on-surface-variant font-medium">Difficulty: Band 7.5 Calibration</span>
<span className="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">refresh</span> 0% Question Duplication
                </span>
</div>
</div>
</div>
<div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
<div className="flex items-center gap-space-sm mb-space-sm">
<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-label-md font-bold">02</span>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Contextual, Non-Repetitive Assessments</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
              Dynamic Diagnostic Test Generation
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
              Static question banks encourage brute-force memorization rather than actual linguistic competency. Our Test Generation Agent writes real-time prompts customized to your historical weaknesses, current CEFR level (B2/C1/C2), and previous lexical traps.
            </p>
<div className="grid grid-cols-2 gap-space-md">
<div className="bg-surface-container-low p-space-sm rounded-lg">
<div className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-secondary">psychology</span>
                  Cognitive Profiling
                </div>
<p className="font-caption text-caption text-on-surface-variant mt-1">Detects past syntactic patterns to test your actual boundary mastery.</p>
</div>
<div className="bg-surface-container-low p-space-sm rounded-lg">
<div className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-secondary">shield</span>
                  Leak-Proof Integrity
                </div>
<p className="font-caption text-caption text-on-surface-variant mt-1">Never re-uses verbatim legacy questions from dated paper tests.</p>
</div>
</div>
</div>
</div>
{/* STEP 3: Multi-Agent Skill Evaluation */}
<div className="bg-surface-container-lowest rounded-xl p-space-xl lg:p-space-2xl shadow-md grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
<div className="lg:col-span-5 flex flex-col justify-center">
<div className="flex items-center gap-space-sm mb-space-sm">
<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-label-md font-bold">03</span>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Real-Time Multi-Dimensional Rubric Scoring</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
              Multi-Agent Skill Evaluation
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
              Rather than using a single generic evaluator, your work is fed into four dedicated micro-agents simultaneously. Each agent holds zero bias and grades exclusively against one official IELTS band descriptor metric.
            </p>
<div className="bg-surface-container-low p-space-md rounded-lg mb-space-md">
<div className="flex items-center gap-space-xs text-on-surface font-label-md font-semibold">
<span className="material-symbols-outlined text-secondary">groups</span>
                Consensus Resolution Layer
              </div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                A fifth arbitrator agent reconciles discrepancies and produces the finalized granular score card with specific inline sentence fixes.
              </p>
</div>
</div>
<div className="lg:col-span-7 bg-surface-container p-space-lg rounded-xl shadow-inner">
{/* Real-time Agent Rubric Breakdown UI Card */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-xs">
<div>
<span className="font-label-sm text-label-sm text-on-surface font-bold">Candidate Submission: Diagnostic #4102</span>
<p className="font-caption text-caption text-on-surface-variant">Writing Task 2 Multi-Agent Consensus</p>
</div>
<span className="px-space-sm py-space-xxs rounded-full bg-secondary-fixed text-on-secondary-fixed font-title-md font-bold text-title-md">
                  Band 7.0 Overall
                </span>
</div>
{/* Skill 1: Task Achievement */}
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="font-medium text-on-surface flex items-center gap-1">
<span className="material-symbols-outlined text-[15px] text-tertiary-container">check_circle</span>
                    Task Achievement / Response
                  </span>
<span className="font-mono font-bold text-tertiary-container">Band 8.5 (90%)</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className="bg-tertiary-container h-full rounded-full transition-all duration-500" style={{ width: '90%' }}></div>
</div>
<span className="font-caption text-caption text-on-surface-variant">&quot;Strong thesis statement, fully developed cohesive progression.&quot;</span>
</div>
{/* Skill 2: Coherence & Cohesion */}
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="font-medium text-on-surface flex items-center gap-1">
<span className="material-symbols-outlined text-[15px] text-secondary">check_circle</span>
                    Coherence &amp; Cohesion
                  </span>
<span className="font-mono font-bold text-secondary">Band 7.5 (78%)</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: '78%' }}></div>
</div>
<span className="font-caption text-caption text-on-surface-variant">&quot;Logical paragraphing, varied cohesive devices with slight over-use.&quot;</span>
</div>
{/* Skill 3: Lexical Resource */}
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="font-medium text-on-surface flex items-center gap-1">
<span className="material-symbols-outlined text-[15px] text-secondary">check_circle</span>
                    Lexical Resource
                  </span>
<span className="font-mono font-bold text-secondary">Band 8.0 (80%)</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
</div>
<span className="font-caption text-caption text-on-surface-variant">&quot;Academic collocations, rare minor repetition in paragraph 3.&quot;</span>
</div>
{/* Skill 4: Grammatical Range & Accuracy (Focus Needed) */}
<div className="flex flex-col gap-1 bg-error-container/20 p-space-xs rounded-lg">
<div className="flex items-center justify-between font-label-sm text-label-sm">
<span className="font-bold text-error flex items-center gap-1">
<span className="material-symbols-outlined text-[15px] text-error">warning</span>
                    Grammatical Range &amp; Accuracy
                  </span>
<span className="font-mono font-bold text-error">Band 5.5 (45% - Focus Needed)</span>
</div>
<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
<div className="bg-error h-full rounded-full transition-all duration-500" style={{ width: '45%' }}></div>
</div>
<span className="font-caption text-caption text-error font-medium">&quot;Frequent complex sentence run-ons, modal verb tense drift.&quot;</span>
</div>
</div>
</div>
</div>
{/* STEP 4: Automated Remediation & Lesson Gating */}
<div className="bg-surface-container-lowest rounded-xl p-space-xl lg:p-space-2xl shadow-md grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
<div className="lg:col-span-5 order-2 lg:order-1 bg-surface-container p-space-lg rounded-xl shadow-inner">
{/* Mock Gating & Remediation Card */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
<div className="p-space-sm bg-surface-container-low rounded-lg flex items-center justify-between">
<div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm">
<span className="material-symbols-outlined text-outline">lock</span>
<span className="font-semibold text-on-surface">Advanced Task 2 Essay Writing</span>
</div>
<span className="font-caption text-caption text-outline uppercase font-bold">Gated</span>
</div>
<div className="p-space-md bg-secondary-fixed/30 rounded-xl flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs text-secondary font-label-md font-bold">
<span className="material-symbols-outlined">bolt</span>
                  Auto-Prescribed Action Path
                </div>
<p className="font-body-sm text-body-sm text-on-surface">
                  12 Targeted Modal Verb Drill Questions prescribed to remediate the sub-60% Grammatical Accuracy deficit before module unlock.
                </p>
<div className="flex items-center justify-between pt-space-xs">
<span className="font-caption text-caption text-on-surface-variant font-medium">Estimated Time: 8 mins</span>
<span className="px-space-sm py-1 rounded bg-secondary text-on-secondary font-label-sm font-semibold text-caption">Start Drill Now</span>
</div>
</div>
<div className="flex items-center gap-space-xs text-tertiary-container font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[16px]">verified</span>
<span>Requires 3 Consecutive Error-Free Submissions to Unlock</span>
</div>
</div>
</div>
<div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
<div className="flex items-center gap-space-sm mb-space-sm">
<span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-label-md font-bold">04</span>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">Closed-Loop Mastery &amp; Dynamic Unlocking</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
              Automated Remediation &amp; Lesson Gating
            </h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
              Passing a module isn&apos;t based on ticking a checkbox or watching a 40-minute video lecture. If any sub-skill drops below the 60% competence threshold, the curriculum engine automatically gates dependent lessons and routes you through targeted, micro-remediation drills.
            </p>
<div className="space-y-space-xs">
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">lock_clock</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
<strong className="text-on-surface font-semibold">Strict Prerequisites:</strong> Prevents candidates from practicing flawed sentence habits at scale.
                </p>
</div>
<div className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">target</span>
<p className="font-body-sm text-body-sm text-on-surface-variant">
<strong className="text-on-surface font-semibold">Surgical Micro-Drills:</strong> Replaces hours of review with hyper-focused 5-minute syntax repair.
                </p>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* Interactive Demo / Live Simulation Section */}
<section className="max-w-[80rem] mx-auto px-4 w-full py-space-3xl">
<div className="bg-surface-container-lowest rounded-xl p-space-xl lg:p-space-2xl shadow-xl">
<div className="text-center max-w-3xl mx-auto mb-space-2xl">
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">Try The Feedback Simulator</span>
<h2 className="font-display-lg text-headline-xl-mobile md:text-headline-xl text-on-surface font-semibold mt-space-xxs">
          Test the Evaluator on Real Candidate Writing
        </h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
          Select an authentic sample response below to witness how the multi-agent system parses grammar, detects subtle discourse errors, and prescribes drills.
        </p>
</div>
{/* Sample Selector Buttons */}
<div className="flex flex-wrap justify-center gap-space-sm mb-space-xl">
<button className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md font-semibold transition-all ${activeSample === 'band6' ? 'bg-secondary text-on-secondary shadow-sm' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`} onClick={() => setActiveSample('band6')}>
          Sample A: Band 6.0 Lexical Drift
        </button>
<button className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md font-semibold transition-all ${activeSample === 'band8' ? 'bg-secondary text-on-secondary shadow-sm' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`} onClick={() => setActiveSample('band8')}>
          Sample B: Band 8.5 Scholarly Prose
        </button>
</div>
{/* Simulator Body Container */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl bg-surface-container-low p-space-lg rounded-xl">
{/* Input Text Pane */}
<div className="lg:col-span-6 flex flex-col justify-between bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
<div>
<div className="flex items-center justify-between mb-space-sm pb-space-xxs">
<span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Candidate Writing Task 2 Excerpt</span>
<span className="font-mono text-caption text-on-surface-variant">
  {activeSample === 'band6' ? '49 Words' : '45 Words'}
</span>
</div>
<p className="font-body-md text-body-md text-on-surface leading-relaxed italic">
  {activeSample === 'band6' ? '"Nowadays many people think that governmental investments should only focus in renewable energy sources like wind and solar panels. Although this is very good for future generations, fossil fuels is still more cheap and reliable for poor developing nations which cannot afford heavy infrastructure."' : '"It is often contended that national budgets ought to prioritize sustainable energy infrastructure over hydrocarbon subsidies. While fiscal prudence dictates interim reliance on conventional power grids in burgeoning economies, the irrevocable ecological degradation of unchecked carbon emissions unequivocally outweighs short-term economic convenience."'}
</p>
</div>
<div className="mt-space-lg pt-space-sm flex items-center justify-between text-on-surface-variant font-caption text-caption">
<span>Evaluated via GPT-4o Multi-Agent IELTS Calibration Node</span>
<span className="text-secondary font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">speed</span> 820ms
            </span>
</div>
</div>
{/* Output Real-Time Diagnosis Pane */}
<div className="lg:col-span-6 flex flex-col gap-space-md">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
<div className="flex items-center justify-between mb-space-xs">
<span className="font-label-md text-label-md text-on-surface font-bold">Consensus Band Estimate</span>
<span className={activeSample === 'band6' ? "font-headline-sm text-headline-sm text-error font-semibold" : "font-headline-sm text-headline-sm text-tertiary-container font-semibold"}>
  {activeSample === 'band6' ? 'Band 6.0' : 'Band 8.5'}
</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
  {activeSample === 'band6' ? 'Prepositional drift ("focus in" instead of "focus on"), morphological error ("more cheap" instead of "cheaper"), and subject-verb mismatch ("fossil fuels is").' : 'Sophisticated syntactic balance with appropriate subordinate concession clauses. Exemplary academic collocation usage ("fiscal prudence", "burgeoning economies", "unequivocally outweighs").'}
</p>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-xs">
<span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Prescribed Remediation</span>
<div className="flex items-center gap-space-xs text-on-surface font-label-md font-semibold">
  {activeSample === 'band6' ? (
    <>
      <span className="material-symbols-outlined text-secondary">assignment_late</span>
      Comparative Forms &amp; Prepositional Verbs (6 Questions)
    </>
  ) : (
    <>
      <span className="material-symbols-outlined text-tertiary-container">check_circle</span>
      Advanced Task 2 Masterclass Unlocked
    </>
  )}
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant">
  {activeSample === 'band6' ? 'Curriculum engine automatically locks Advanced Argumentative Modules until score hits 100% on collocations.' : 'Criterion cleared with distinction. Progress immediately forwarded to Complex Discourse Thesis Synthesis.'}
</p>
</div>
</div>
</div>
</div>
</section>
{/* Comprehensive Feature Comparison Matrix */}
<section className="w-full bg-surface py-space-3xl">
<div className="max-w-[80rem] mx-auto px-4">
<div className="text-center max-w-3xl mx-auto mb-space-2xl">
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold">Institutional Benchmarking</span>
<h2 className="font-display-lg text-headline-xl-mobile md:text-headline-xl text-on-surface font-semibold mt-space-xxs">
          Static LMS vs. Our Adaptive Multi-Agent AI
        </h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
          Discover why traditional IELTS portals fail to produce consistent Band 7.5+ breakthroughs.
        </p>
</div>
{/* Feature Matrix Card */}
<div className="bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left min-w-[640px]">
<thead>
<tr className="bg-surface-container-high">
<th className="py-space-md px-space-lg font-label-md text-label-md text-on-surface font-semibold w-1/4">Feature &amp; Metric</th>
<th className="py-space-md px-space-lg font-label-md text-label-md text-on-surface-variant font-medium w-3/8">Traditional Static LMS / Courses</th>
<th className="py-space-md px-space-lg font-label-md text-label-md text-secondary font-bold w-3/8 bg-surface-container-low">IELTS.AI Adaptive Engine</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
{/* Row 1 */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-space-lg px-space-lg font-label-md text-label-md text-on-surface font-semibold">Curriculum Path</td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface-variant">
                  Rigid, one-size-fits-all linear syllabus. Every student completes the same 30 modules regardless of prior strengths.
                </td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface font-medium bg-surface-container-low">
<span className="inline-flex items-center gap-1 text-secondary font-semibold">
<span className="material-symbols-outlined text-[16px]">psychology</span> Dynamic RAG-adapted path
                  </span>
<br/>Reconfigures lesson sequence after every single question based on error telemetry.
                </td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-space-lg px-space-lg font-label-md text-label-md text-on-surface font-semibold">Question Bank</td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface-variant">
                  Static repository of recycled 5-to-10-year-old PDFs with high answer memorization rates.
                </td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface font-medium bg-surface-container-low">
<span className="inline-flex items-center gap-1 text-secondary font-semibold">
<span className="material-symbols-outlined text-[16px]">autorenew</span> Contextual On-Demand Generation
                  </span>
<br/>Generates authentic fresh prompts tailored to target CEFR bands with zero prompt reuse.
                </td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-space-lg px-space-lg font-label-md text-label-md text-on-surface font-semibold">Grading Speed</td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface-variant">
                  48–72 hours delayed turnaround for manual tutor or outsourced grading feedback.
                </td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface font-medium bg-surface-container-low">
<span className="inline-flex items-center gap-1 text-tertiary-container font-semibold">
<span className="material-symbols-outlined text-[16px]">bolt</span> Sub-10-Second Parallel Agents
                  </span>
<br/>Immediate deep diagnostic feedback while your thought process is still fresh.
                </td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-space-lg px-space-lg font-label-md text-label-md text-on-surface font-semibold">Weakness Targeting</td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface-variant">
                  Generic feedback (&quot;read more articles&quot;, &quot;improve your transitions&quot;) without prescriptive drills.
                </td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface font-medium bg-surface-container-low">
<span className="inline-flex items-center gap-1 text-secondary font-semibold">
<span className="material-symbols-outlined text-[16px]">biotech</span> Granular Syntactic Heatmaps
                  </span>
<br/>Flags exact lexical drift and automatically prescribes targeted 5-minute repair modules.
                </td>
</tr>
{/* Row 5 */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-space-lg px-space-lg font-label-md text-label-md text-on-surface font-semibold">Rubric Alignment</td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface-variant">
                  Subjective human variance; different tutors score the identical essay as Band 6.5 or Band 7.5.
                </td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface font-medium bg-surface-container-low">
<span className="inline-flex items-center gap-1 text-secondary font-semibold">
<span className="material-symbols-outlined text-[16px]">balance</span> Zero-Variance Calibrated Rubric
                  </span>
<br/>Anchored against official 2026 Cambridge Assessment descriptors across all 4 criteria.
                </td>
</tr>
{/* Row 6 */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-space-lg px-space-lg font-label-md text-label-md text-on-surface font-semibold">Retention &amp; Mastery</td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface-variant">
                  One-and-done multiple-choice tests with no accountability for recurring grammar mistakes.
                </td>
<td className="py-space-lg px-space-lg font-body-sm text-body-sm text-on-surface font-medium bg-surface-container-low">
<span className="inline-flex items-center gap-1 text-secondary font-semibold">
<span className="material-symbols-outlined text-[16px]">lock_reset</span> Closed-Loop Mastery Gating
                  </span>
<br/>Locks subsequent modules until you demonstrate verifiable Band 7.5+ proficiency.
                </td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</section>
{/* High-Impact Call-to-Action Card */}
<section className="max-w-[80rem] mx-auto px-4 w-full py-space-3xl">
<div className="relative overflow-hidden rounded-xl bg-primary-container text-on-primary p-space-xl md:p-space-3xl shadow-2xl">
{/* Ambient decorative glow */}
<div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
<div className="relative z-10 max-w-3xl flex flex-col items-start">
<div className="inline-flex items-center gap-space-xs px-space-sm py-space-xxs rounded-full bg-surface-container-lowest/10 text-tertiary-fixed font-label-sm text-label-sm mb-space-md">
<span className="material-symbols-outlined text-[16px]">visibility</span>
<span>Experience It Yourself</span>
</div>
<h2 className="font-display-lg text-headline-xl-mobile md:text-display-lg font-semibold tracking-tight text-on-primary">
          Ready to see your real IELTS strengths and weak points in 10 minutes?
        </h2>
<p className="font-body-lg text-body-lg text-on-primary-container mt-space-md leading-relaxed">
          Take our free diagnostic evaluation and watch our multi-agent engine construct your personalized, gap-free curriculum roadmap in real-time.
        </p>
<div className="mt-space-xl flex flex-col sm:flex-row items-center gap-space-md w-full sm:w-auto">
<Link className="w-full sm:w-auto px-space-xl py-space-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold hover:bg-secondary-container transition-all shadow-md flex items-center justify-center gap-space-xs group" href="/signup">
<span>Take Free 10-Minute Level Check</span>
<span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
</Link>
<Link className="w-full sm:w-auto px-space-lg py-space-sm rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-on-primary font-label-md text-label-md font-medium text-center transition-colors" href="/courses">
            Explore Available Courses
          </Link>
</div>
{/* Trust proof footer */}
<div className="mt-space-xl pt-space-md border-t border-surface-container-lowest/10 flex flex-wrap items-center gap-space-md text-on-primary-container font-caption text-caption">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed">credit_card_off</span> No credit card required
          </span>
<span className="text-surface-container-lowest/20">•</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed">verified</span> Cambridge-aligned rubric
          </span>
<span className="text-surface-container-lowest/20">•</span>
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-tertiary-fixed">bolt</span> Instant CEFR &amp; Band breakdown
          </span>
</div>
</div>
</div>
</section>

    </div>
  );
}
