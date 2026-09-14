"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, ArrowLeft, Loader2, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function RemedialCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        const res = await fetch(`http://localhost:8000/api/v1/remediation-plans/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.id) {
          setPlan(data);
        }
      } catch (err) {
        console.error("Failed to fetch plan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const handleComplete = async () => {
    try {
      setCompleting(true);
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:8000/api/v1/remediation-plans/${id}/complete-study`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.retest_id) {
        alert(data.message + "\nRedirecting to Retest Simulator...");
        router.push(`/dashboard/simulator?retest=${data.retest_id}`);
      } else {
        alert(data.message);
        router.push('/dashboard/adaptive');
      }
    } catch (err) {
      console.error(err);
      alert("Failed to complete study");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050B14] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050B14] text-slate-400">
        Course not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050B14] text-slate-200 p-6 lg:p-10">
      
      <div className="mb-8">
        <Link href="/dashboard/adaptive" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Adaptive Engine
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#027FFF]/10 border border-[#027FFF]/20 text-[#027FFF] text-xs font-bold mb-4">
          <BrainCircuit className="w-4 h-4" /> AI GENERATED COURSE
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          {plan.remedial_course_title}
        </h1>
      </div>

      <div className="bg-[#0f182c] border border-white/5 rounded-3xl p-8 lg:p-12 mb-10 prose prose-invert max-w-none prose-headings:text-white prose-a:text-[#5BC0EB]">
        {plan.remedial_course_markdown.split('\n').map((line: string, i: number) => {
          if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-8 mb-4 border-b border-white/10 pb-2">{line.substring(2)}</h1>;
          if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.substring(3)}</h2>;
          if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-3">{line.substring(4)}</h3>;
          if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc mb-2">{line.substring(2)}</li>;
          if (line.trim() === '') return <br key={i} />;
          return <p key={i} className="mb-4 leading-relaxed text-slate-300">{line}</p>;
        })}
      </div>

      <div className="flex justify-end border-t border-white/10 pt-8">
        <button 
          onClick={handleComplete}
          disabled={completing || plan.study_completed}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          {completing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          {plan.study_completed ? "Study Completed" : "Mark as Studied & Take Retest"}
        </button>
      </div>
    </div>
  );
}
