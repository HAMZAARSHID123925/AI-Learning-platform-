"use client";
import { fetchWithAuth } from "@/lib/api";


import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle, PlayCircle, FileText, Download, 
  MessageSquare, ChevronRight, Video
} from 'lucide-react';
import { toast } from '@/components/ToastProvider';

export default function LessonPlayerPage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'transcript'>('video');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleComplete = async () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    
    if (nextState) {
      try {
        setIsSubmitting(true);
  
  

        // Fetch courses to get first available lesson id if none in URL
        const coursesRes = await fetchWithAuth('/students/me/dashboard', {
        });
        const dData = await coursesRes.json();
        const lessonId = dData?.next_recommended_lesson?.id;
        
        if (lessonId) {
          await fetchWithAuth(`/lessons/${lessonId}/complete`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ time_spent_seconds: 120 })
          });
        }
        toast.success('Lesson Completed! 🎉', 'Your progress has been recorded on the blockchain/AI engine.');
      } catch (err) {
        console.error("Failed to mark lesson complete in backend:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#050B14] text-slate-200 overflow-hidden font-sans">
      
      {/* SIDEBAR: LESSON PLAYLIST */}
      <aside className="w-80 flex-shrink-0 border-r border-white/5 bg-[#0f182c] flex flex-col hidden lg:flex">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Modules</span>
          </Link>
        </div>
        
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white mb-2">Module 1: Advanced Vocabulary</h2>
          <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
            <div className={`bg-emerald-500 h-1.5 rounded-full ${isCompleted ? 'w-[100%]' : 'w-[25%]'} transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]`}></div>
          </div>
          <p className="text-xs text-slate-500">{isCompleted ? '100% Completed' : '25% Completed'}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Active Lesson */}
          <div className="p-4 bg-[#027FFF]/10 border-l-2 border-[#027FFF] cursor-pointer">
            <div className="flex items-start gap-3">
              <PlayCircle className="w-5 h-5 text-[#5BC0EB] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white mb-1">1. Master the Lexical Resource</h4>
                <p className="text-xs text-slate-400">12 mins • Video</p>
              </div>
            </div>
          </div>
          
          {/* Locked/Upcoming Lesson */}
          <div className="p-4 hover:bg-white/[0.02] cursor-pointer transition-colors border-l-2 border-transparent">
            <div className="flex items-start gap-3 opacity-60">
              <FileText className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-1">2. Uncommon Idioms List</h4>
                <p className="text-xs text-slate-500">PDF Document</p>
              </div>
            </div>
          </div>

          <div className="p-4 hover:bg-white/[0.02] cursor-pointer transition-colors border-l-2 border-transparent">
            <div className="flex items-start gap-3 opacity-60">
              <Video className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-1">3. Phrasal Verbs in Context</h4>
                <p className="text-xs text-slate-500">18 mins • Video</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN LESSON AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Video Player Area */}
        <div className="w-full bg-black aspect-video relative flex items-center justify-center border-b border-white/5">
          {/* Fake Video Player Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1221] to-[#0f182c] flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all hover:scale-110 mb-4 backdrop-blur-md border border-white/10">
              <PlayCircle className="w-10 h-10 text-white ml-1" />
            </div>
            <p className="text-slate-400 font-medium tracking-wide">Video Player Module</p>
          </div>
        </div>

        {/* Lesson Details */}
        <div className="max-w-5xl mx-auto w-full p-8 flex-1">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">Master the Lexical Resource</h1>
              <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                In this lesson, you will learn exactly what examiners look for when grading your vocabulary in both the Speaking and Writing modules.
              </p>
            </div>
            
            <button 
              onClick={handleToggleComplete}
              disabled={isSubmitting}
              className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                isCompleted 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#027FFF] hover:bg-[#026bd6] text-white shadow-[0_0_20px_rgba(2,127,255,0.3)] hover:-translate-y-1'
              }`}
            >
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : null}
              {isCompleted ? 'Completed' : 'Mark as Complete'}
            </button>
          </div>

          {/* Lesson Tabs */}
          <div className="flex items-center gap-8 border-b border-white/10 mb-8">
            <button 
              onClick={() => setActiveTab('video')}
              className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'video' ? 'border-[#5BC0EB] text-[#5BC0EB]' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('transcript')}
              className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'transcript' ? 'border-[#5BC0EB] text-[#5BC0EB]' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Transcript
            </button>
          </div>

          {/* Tab Content */}
          <div className="prose prose-invert max-w-none">
            {activeTab === 'video' ? (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Lesson Resources</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0f182c] w-full max-w-sm hover:border-[#027FFF]/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-rose-400" />
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#5BC0EB] transition-colors">Lexical_Guide.pdf</p>
                        <p className="text-xs text-slate-500">2.4 MB</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-400 group-hover:text-white" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0f182c] border border-white/5 rounded-2xl p-6 text-slate-400 leading-loose">
                <p><span className="text-[#5BC0EB] font-bold">00:00</span> Welcome to module one. Today we are going to dive deep into the Lexical Resource criterion...</p>
                <p><span className="text-[#5BC0EB] font-bold">01:15</span> A lot of students make the mistake of using &quot;big words&quot; incorrectly. Examiners are actually looking for precision...</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
