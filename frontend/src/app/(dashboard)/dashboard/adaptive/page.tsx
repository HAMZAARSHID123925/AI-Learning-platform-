"use client";
import { fetchWithAuth } from "@/lib/api";

import { useEffect, useState } from 'react';
import { 
  BrainCircuit, BookOpen, AlertCircle, CheckCircle, ArrowLeft, 
  Sparkles, Zap, Flame, ShieldAlert, Award, Clock, ChevronRight, Play,
  BarChart2, Target, CheckCircle2, RotateCcw
} from 'lucide-react';
import Link from 'next/link';

import DashboardSidebar from '@/components/DashboardSidebar';

interface WeaknessFlag {
  id: string;
  skill_id: string;
  category: 'Grammar (GRA)' | 'Lexical (LR)' | 'Cohesion (CC)' | 'Fluency (FC)';
  score_at_flag: number;
  threshold: number;
  status: 'Active Gap' | 'Needs Review' | 'Remediating';
  created_at: string;
  recommendedAction: string;
}

const DEFAULT_FLAGS: WeaknessFlag[] = [
  { 
    id: 'flag-1', 
    skill_id: 'Grammatical Inversion & Subjunctive Syntax', 
    category: 'Grammar (GRA)',
    score_at_flag: 0.58, 
    threshold: 0.75, 
    status: 'Active Gap', 
    created_at: 'Today, 14:15',
    recommendedAction: 'Master "Had it not been for..." and negative fronting constructions.'
  },
  { 
    id: 'flag-2', 
    skill_id: 'Task 1 Data Synthesis & Macro Trend Framing', 
    category: 'Cohesion (CC)',
    score_at_flag: 0.62, 
    threshold: 0.80, 
    status: 'Needs Review', 
    created_at: 'Yesterday, 18:30',
    recommendedAction: 'Ensure overview sentence summarizes dominant patterns without citing raw data points.'
  },
  { 
    id: 'flag-3', 
    skill_id: 'Speaking Part 3 Abstract Reasoning Extensions', 
    category: 'Fluency (FC)',
    score_at_flag: 0.65, 
    threshold: 0.80, 
    status: 'Remediating', 
    created_at: 'Sep 14, 11:20',
    recommendedAction: 'Expand answers using concessive counters ("While detractors contend...").'
  }
];

const DEFAULT_PLANS = [
  {
    id: 'plan-1',
    target_skill_id: 'Inversion & Complex Syntax Mastery',
    category: 'Grammar (GRA)',
    title: '3-Day Crash Course: Band 8.5+ Subjunctive Inversions',
    description: 'Master mandatory subject-auxiliary inversions ("Had it not been for...", "Under no circumstances...") to eliminate sentence structure penalties in Task 2 essays.',
    status: 'Ready to Start',
    estimatedTime: '15 Mins',
    bandImpact: '+0.5 GRA Band'
  },
  {
    id: 'plan-2',
    target_skill_id: 'Academic Lexical Register',
    category: 'Lexical Resource (LR)',
    title: 'C2 Nominalization & Academic Collocation Pack',
    description: 'Transform informal descriptors into formal academic nouns and predicates to elevate your Lexical Resource score to Band 8.5+.',
    status: 'In Progress',
    estimatedTime: '10 Mins',
    bandImpact: '+0.5 LR Band'
  },
  {
    id: 'plan-3',
    target_skill_id: 'Task 1 Report Overview Mastery',
    category: 'Task Achievement (TA)',
    title: 'Visual Chart & Flowchart High-Scoring Overview Sprint',
    description: 'Practice identifying macro trends across grouped bar charts and multi-line time series without falling into raw-number listing traps.',
    status: 'Ready to Start',
    estimatedTime: '12 Mins',
    bandImpact: '+0.5 TA Band'
  }
];

export default function AdaptiveLearningPage() {
  const [flags, setFlags] = useState<WeaknessFlag[]>(DEFAULT_FLAGS);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flagsRes, plansRes] = await Promise.all([
          fetchWithAuth('/students/me/weakness-flags').catch(() => null),
          fetchWithAuth('/students/me/remediation-plans').catch(() => null),
        ]);

        if (flagsRes && flagsRes.ok) {
          const flagsData = await flagsRes.json();
          if (Array.isArray(flagsData) && flagsData.length > 0) setFlags(flagsData);
        }
        if (plansRes && plansRes.ok) {
          const plansData = await plansRes.json();
          if (Array.isArray(plansData) && plansData.length > 0) setPlans(plansData);
        }

      } catch (err) {
        console.warn("Using offline adaptive telemetry:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      {/* SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        
        {/* Top Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <BrainCircuit className="w-8 h-8 text-[#027FFF]" /> Adaptive Learning Engine
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Continuous AI telemetry &amp; automated diagnostic remediation calibrated against official Cambridge Band 9.0 descriptors.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {flags.length} Gaps Detected • Auto-Optimizing
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Diagnosed Skill Gaps & Weakness Flags (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Diagnosed Weakness Flags
              </h2>
              <span className="text-[11px] font-bold text-slate-400 font-mono">Live Telemetry</span>
            </div>
            
            {loading ? (
              <div className="text-slate-400 text-sm">Scanning candidate performance telemetry...</div>
            ) : flags.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center text-slate-500 shadow-sm">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-900">No Weakness Flags Active!</p>
                <p className="text-xs text-slate-400 mt-1">Your recent writing essays and speaking recordings meet all Band 8.0+ criteria.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {flags.map((flag) => {
                  const scoreNum = flag.score_at_flag * 10;
                  const thresholdNum = flag.threshold * 10;
                  const gapPercent = Math.round((flag.score_at_flag / flag.threshold) * 100);

                  return (
                    <div 
                      key={flag.id} 
                      className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase border border-indigo-200">
                          {flag.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                          flag.status === 'Active Gap' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : flag.status === 'Needs Review' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {flag.status}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-slate-900">{flag.skill_id}</h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          💡 <span className="font-medium text-slate-700">{flag.recommendedAction}</span>
                        </p>
                      </div>

                      {/* Score vs Threshold Bar */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                          <span className="text-rose-600 font-bold">Recorded: {scoreNum.toFixed(1)}/10</span>
                          <span className="text-slate-400 font-medium">Target Threshold: {thresholdNum.toFixed(1)}/10</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              gapPercent < 70 ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${gapPercent}%` }}
                          ></div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Spaced Repetition (SRS) Battery & Custom Remediation Courses (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Spaced Repetition (SRS) Flashcards Battery */}
            <div className="bg-gradient-to-br from-[#0B1329] via-[#111C44] to-[#0A1026] text-white rounded-3xl p-6 lg:p-7 border border-blue-900/40 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between relative z-10">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-700/50">
                  <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" /> Spaced Repetition (SRS) Micro-Drills
                </span>
                <span className="text-xs font-bold text-slate-300 font-mono">3 Sets Due for Retention</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 relative z-10">
                
                <Link 
                  href="/dashboard/grammar" 
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/60 hover:bg-white/10 transition-all cursor-pointer group backdrop-blur-md"
                >
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Grammar (GRA)</span>
                  <h4 className="text-xs font-black text-white mt-1 mb-1 group-hover:text-cyan-200 transition-colors">Inversion Drills</h4>
                  <p className="text-[11px] text-slate-300 font-serif">Rare conditional inversion (*Were he to...*).</p>
                  <div className="mt-3 text-[10px] font-black text-cyan-300 flex items-center gap-1">
                    Start 3 Mins &rarr;
                  </div>
                </Link>

                <Link 
                  href="/dashboard/vocabulary" 
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/60 hover:bg-white/10 transition-all cursor-pointer group backdrop-blur-md"
                >
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Lexical (LR)</span>
                  <h4 className="text-xs font-black text-white mt-1 mb-1 group-hover:text-cyan-200 transition-colors">C2 Collocations</h4>
                  <p className="text-[11px] text-slate-300 font-serif">Transform simple verbs into academic predicates.</p>
                  <div className="mt-3 text-[10px] font-black text-cyan-300 flex items-center gap-1">
                    Start 2 Mins &rarr;
                  </div>
                </Link>

                <Link 
                  href="/dashboard/writing" 
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/60 hover:bg-white/10 transition-all cursor-pointer group backdrop-blur-md"
                >
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Coherence (CC)</span>
                  <h4 className="text-xs font-black text-white mt-1 mb-1 group-hover:text-cyan-200 transition-colors">Discourse Linkers</h4>
                  <p className="text-[11px] text-slate-300 font-serif">Counter-argument transition phrases for Task 2.</p>
                  <div className="mt-3 text-[10px] font-black text-cyan-300 flex items-center gap-1">
                    Start 4 Mins &rarr;
                  </div>
                </Link>

              </div>
            </div>

            {/* Custom Remediation Courses */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#027FFF]" /> Prescribed AI Remediation Plans
                </h2>
                <span className="text-xs font-bold text-slate-500">{plans.length} Action Plans</span>
              </div>
              
              <div className="space-y-3.5">
                {plans.map(plan => (
                  <div 
                    key={plan.id} 
                    className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:border-[#027FFF] hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#027FFF] text-xs font-bold uppercase border border-blue-200">
                            {plan.target_skill_id}
                          </span>
                          {plan.bandImpact && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200 font-mono">
                              {plan.bandImpact}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {plan.estimatedTime || '15 Mins'}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#027FFF] transition-colors mb-1">
                        {plan.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {plan.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Auto-calibrated from candidate exam telemetry</span>
                      <Link 
                        href={`/dashboard/adaptive/${plan.id}`}
                        className="px-5 py-2 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-black text-xs transition-all shadow-xs flex items-center gap-1.5"
                      >
                        Start Remediation Course &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
