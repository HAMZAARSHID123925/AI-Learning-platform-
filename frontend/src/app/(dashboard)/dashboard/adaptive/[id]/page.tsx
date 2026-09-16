"use client";
import { fetchWithAuth } from "@/lib/api";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, Loader2, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ToastProvider';

import DashboardSidebar from '@/components/DashboardSidebar';

export default function RemediationStudyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPlan = async () => {
      try {
        const res = await fetchWithAuth(`/remediation-plans/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPlan(data);
          return;
        }
      } catch (err) {
        console.warn("Using offline fallback plan:", err);
      }

      // Rich Fallback Content for offline / mock remediation
      setPlan({
        id: id,
        remedial_course_title: 'Band 8.5+ Subjunctive Inversions & Hypothetical Syntax',
        remedial_course_markdown: `# Master Band 8.5+ Conditional Inversions

### 🎯 Examiner Rationale
In IELTS Task 2 Academic Writing, standard "If" conditional sentences limit your score to **Band 6.5 - 7.0** under *Grammatical Range & Accuracy (GRA)*. To secure **Band 8.5+**, examiners expect candidates to employ **hypothetical subjunctive inversion**.

---

### 1. Inversion Formula & Rules

#### Rule A: Past Unreal Conditional (Third Conditional)
- **Standard**: *If the government had intervened earlier, the economic crisis would have been mitigated.*
- **Band 8.5 Inverted**: **Had the government intervened earlier, the economic crisis would have been mitigated.**

#### Rule B: Present / Future Hypothetical (Second Conditional)
- **Standard**: *If healthcare authorities were to allocate more funds...*
- **Band 8.5 Inverted**: **Were healthcare authorities to allocate more funds...**

#### Rule C: Negative Fronting Adverbials
- **Standard**: *Students should not neglect academic cohesion under any circumstances.*
- **Band 8.5 Inverted**: **Under no circumstances should students neglect academic cohesion.**

---

### 2. Examiner Sample Task 2 Application
> *"Were national administrations to implement stringent carbon caps, industrial emissions would decline precipitously. Had it not been for previous regulatory interventions, contemporary climate degradation would be significantly worse."*

---

### 3. Checkpoint Action
Read the syntax transformations above, then click **"Complete Study & Launch Calibration Drill"** below to test your mastery in the simulator.
`
      });
      setLoading(false);
    };
    fetchPlan();
  }, [id]);

  const handleComplete = async () => {
    try {
      setCompleting(true);

      const res = await fetchWithAuth(`/remediation-plans/${id}/complete-study`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.retest_id) {
        toast.success('Study Material Completed!', 'Launching your recalibration drill...');
        router.push(`/dashboard/simulator?retest=${data.retest_id}`);
      } else {
        toast.success('Study Completed!', data.message || 'Recalibration updated.');
        router.push('/dashboard/adaptive');
      }
    } catch (err) {
      console.error(err);
      toast.error('Submission Error', 'Failed to mark study complete.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F4F8] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#027FFF]" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F4F8] text-slate-500">
        Course not found.
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      {/* SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        <div className="mb-8">
          <Link href="/dashboard/adaptive" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Adaptive Engine
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#027FFF] text-xs font-bold mb-3">
            <BrainCircuit className="w-3.5 h-3.5" /> AI GENERATED COURSE
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {plan.remedial_course_title}
          </h1>
        </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-12 mb-10 shadow-sm">
        {plan.remedial_course_markdown.split('\n').map((line: string, i: number) => {
          if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-6 mb-3 text-slate-900 border-b border-slate-100 pb-2">{line.substring(2)}</h1>;
          if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-slate-900">{line.substring(3)}</h2>;
          if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold mt-4 mb-2 text-slate-800">{line.substring(4)}</h3>;
          if (line.startsWith('- ')) return <li key={i} className="ml-6 list-disc mb-1.5 text-slate-600 text-sm leading-relaxed">{line.substring(2)}</li>;
          if (line.trim() === '') return <br key={i} />;
          return <p key={i} className="mb-3 leading-relaxed text-slate-600 text-sm">{line}</p>;
        })}
      </div>

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <button 
            onClick={handleComplete}
            disabled={completing || plan.study_completed}
            className="flex items-center gap-2.5 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
          >
            {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {plan.study_completed ? "Study Completed" : "Mark as Studied & Take Retest"}
          </button>
        </div>
      </main>
    </div>
  );
}
