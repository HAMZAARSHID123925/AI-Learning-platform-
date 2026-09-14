"use client";
import { fetchWithAuth } from "@/lib/api";


import { useEffect, useState } from 'react';
import { BrainCircuit, Target, AlertCircle, BookOpen, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdaptiveLearningPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
  
  
        
        const [flagsRes, plansRes] = await Promise.all([
          fetchWithAuth('/students/me/weakness-flags', {
          }),
          fetchWithAuth('/students/me/remediation-plans', {
          })
        ]);

        const flagsData = await flagsRes.json();
        const plansData = await plansRes.json();
        
        if (Array.isArray(flagsData)) setFlags(flagsData);
        if (Array.isArray(plansData)) setPlans(plansData);

      } catch (err) {
        console.error("Failed to fetch adaptive data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#050B14] text-slate-200 p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-[#5BC0EB]" /> Adaptive Engine
        </h1>
        <p className="text-slate-400">AI-generated remediation courses based on your diagnosed weaknesses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Weakness Flags */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Diagnosed Weaknesses
          </h2>
          
          {loading ? (
            <div className="text-slate-500">Scanning telemetry...</div>
          ) : flags.length === 0 ? (
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 text-center text-slate-400">
              No weaknesses detected! Great job.
            </div>
          ) : (
            flags.map(flag => (
              <div key={flag.id} className="bg-[#0B1221] border border-red-500/20 rounded-2xl p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 text-xs font-bold uppercase">
                    {flag.status}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(flag.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-white mt-1">Skill ID: {flag.skill_id.substring(0,8)}</h3>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <span className="text-red-400">Score: {(flag.score_at_flag * 10).toFixed(1)}/10</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">Threshold: {(flag.threshold * 10).toFixed(1)}/10</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Remediation Courses */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-[#027FFF]" /> Custom Remedial Courses
          </h2>
          
          {loading ? (
            <div className="text-slate-500">Generating AI courses...</div>
          ) : plans.length === 0 ? (
            <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-10 text-center text-slate-400 flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-emerald-500/50 mb-4" />
              You have no active remediation plans.
            </div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} className="bg-[#0f182c] border border-[#027FFF]/30 rounded-3xl p-6 lg:p-8 flex flex-col gap-4 hover:shadow-[0_0_30px_rgba(2,127,255,0.1)] transition-all">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#027FFF]/10 border border-[#027FFF]/20 text-[#027FFF] text-xs font-bold">
                    <BrainCircuit className="w-4 h-4" /> AI GENERATED COURSE
                  </div>
                  <span className="text-xs text-slate-500">Retest Attempts: {plan.retest_attempt_count}/3</span>
                </div>
                
                <h3 className="text-2xl font-bold text-white">{plan.remedial_course_title}</h3>
                
                <div className="bg-[#0B1221] p-4 rounded-xl border border-white/5 text-sm text-slate-300 max-h-40 overflow-hidden relative">
                  <div className="whitespace-pre-wrap">{plan.remedial_course_markdown.substring(0, 300)}...</div>
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0B1221] to-transparent"></div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <Link href={`/dashboard/adaptive/${plan.id}`} className="px-6 py-3 bg-[#027FFF] hover:bg-blue-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Start Course
                  </Link>
                  {!plan.study_completed && (
                    <span className="text-sm text-amber-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Study required before retest unlocks
                    </span>
                  )}
                  {plan.study_completed && !plan.instructor_escalated && (
                    <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-colors flex items-center gap-2">
                      <RefreshCw className="w-5 h-5" /> Take Retest
                    </button>
                  )}
                  {plan.instructor_escalated && (
                    <span className="text-sm text-red-500 flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4" /> Instructor Escalated
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
