"use client";
import { fetchWithAuth } from "@/lib/api";

import { useEffect, useState } from 'react';
import { BrainCircuit, BookOpen, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import DashboardSidebar from '@/components/DashboardSidebar';

export default function AdaptiveLearningPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [flags, setFlags] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flagsRes, plansRes] = await Promise.all([
          fetchWithAuth('/students/me/weakness-flags'),
          fetchWithAuth('/students/me/remediation-plans'),
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
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      {/* SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-[#027FFF]" /> Adaptive Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">AI-generated targeted remediation courses diagnosed from your mock exams and simulators.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Weakness Flags */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Diagnosed Weaknesses
          </h2>
          
          {loading ? (
            <div className="text-slate-400 text-sm">Scanning telemetry...</div>
          ) : flags.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center text-slate-500 shadow-sm">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No weaknesses detected! Great job.
            </div>
          ) : (
            flags.map(flag => (
              <div key={flag.id} className="bg-white border border-red-200/80 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-bold uppercase border border-red-200">
                    {flag.status}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(flag.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-slate-900 mt-1">Skill ID: {flag.skill_id.substring(0,8)}</h3>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <span className="text-red-600 font-bold">Score: {(flag.score_at_flag * 10).toFixed(1)}/10</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500 font-medium">Threshold: {(flag.threshold * 10).toFixed(1)}/10</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Remediation Courses & SRS Micro-Drills */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Spaced Repetition (SRS) Flashcards Battery */}
          <div className="bg-gradient-to-br from-slate-900 via-[#0F172A] to-slate-900 text-white rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
                <BrainCircuit className="w-3.5 h-3.5" /> Spaced Repetition (SRS) Micro-Drills
              </span>
              <span className="text-xs font-bold text-slate-400">3 Cards Due Today</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Grammar (GRA)</span>
                <h4 className="text-sm font-bold text-white mt-1 mb-1">Inversion Drills</h4>
                <p className="text-[11px] text-slate-400">Rare conditional inversion structures (*Were he to...*).</p>
                <div className="mt-3 text-[10px] font-extrabold text-cyan-400 flex items-center gap-1">Review 3 Mins →</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Lexical (LR)</span>
                <h4 className="text-sm font-bold text-white mt-1 mb-1">C2 Collocations</h4>
                <p className="text-[11px] text-slate-400">Replacing simple verbs with academic predicates.</p>
                <div className="mt-3 text-[10px] font-extrabold text-cyan-400 flex items-center gap-1">Review 2 Mins →</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer">
                <span className="text-[10px] font-bold text-purple-400 uppercase">Coherence (CC)</span>
                <h4 className="text-sm font-bold text-white mt-1 mb-1">Discourse Linkers</h4>
                <p className="text-[11px] text-slate-400">Counter-argument transition phrases for Task 2.</p>
                <div className="mt-3 text-[10px] font-extrabold text-cyan-400 flex items-center gap-1">Review 4 Mins →</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-[#027FFF]" /> Custom Remedial Courses
            </h2>
            
            {loading ? (
              <div className="text-slate-400 text-sm">Generating AI courses...</div>
            ) : plans.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-500 flex flex-col items-center shadow-sm">
                <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                <p className="font-bold text-slate-800">You have no active remediation plans.</p>
                <p className="text-xs text-slate-400 mt-1">Practice drills in the Speaking Simulator to calibrate new recommendations.</p>
              </div>
            ) : (
              plans.map(plan => (
                <div key={plan.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 flex flex-col gap-4 shadow-sm hover:border-[#027FFF] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[#027FFF] text-xs font-bold uppercase border border-blue-200">
                      {plan.target_skill_id}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Status: {plan.status}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{plan.description}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Auto-generated by Adaptive Engine</span>
                    <Link 
                      href={`/dashboard/adaptive/${plan.id}`}
                      className="px-5 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      Start Remediation →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
      </main>
    </div>
  );
}
