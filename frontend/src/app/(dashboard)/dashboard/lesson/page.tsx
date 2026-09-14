"use client";
import { fetchWithAuth } from "@/lib/api";

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle, PlayCircle, FileText, Download, 
  ChevronRight, Video
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

        const coursesRes = await fetchWithAuth('/students/me/dashboard');
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
        toast.success('Lesson Completed! 🎉', 'Your progress has been recorded on the AI engine.');
      } catch (err) {
        console.error("Failed to mark lesson complete in backend:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      
      {/* SIDEBAR: LESSON PLAYLIST */}
      <aside className="w-80 flex-shrink-0 border-r border-slate-200/80 bg-white flex flex-col hidden lg:flex shadow-sm">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </Link>
        </div>
        
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-2">Module 1: Advanced Vocabulary</h2>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
            <div className={`bg-emerald-500 h-1.5 rounded-full ${isCompleted ? 'w-[100%]' : 'w-[25%]'} transition-all duration-500`}></div>
          </div>
          <p className="text-xs text-slate-500 font-medium">{isCompleted ? '100% Completed' : '25% Completed'}</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {/* Active Lesson */}
          <div className="p-4 bg-blue-50/60 border-l-4 border-[#027FFF] cursor-pointer">
            <div className="flex items-start gap-3">
              <PlayCircle className="w-5 h-5 text-[#027FFF] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-0.5">1. Master the Lexical Resource</h4>
                <p className="text-xs text-slate-500 font-medium">12 mins • Video</p>
              </div>
            </div>
          </div>
          
          {/* Upcoming Lesson */}
          <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4 border-transparent">
            <div className="flex items-start gap-3 opacity-70">
              <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-0.5">2. Uncommon Idioms List</h4>
                <p className="text-xs text-slate-400">PDF Document</p>
              </div>
            </div>
          </div>

          <div className="p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4 border-transparent">
            <div className="flex items-start gap-3 opacity-70">
              <Video className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-0.5">3. Phrasal Verbs in Context</h4>
                <p className="text-xs text-slate-400">18 mins • Video</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN LESSON AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F8FAFC]">
        
        {/* Video Player Area */}
        <div className="w-full bg-slate-900 aspect-video max-h-[440px] relative flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all hover:scale-110 mb-3 backdrop-blur-md border border-white/20">
              <PlayCircle className="w-8 h-8 text-white ml-0.5" />
            </div>
            <p className="text-slate-300 font-semibold text-sm">Play Lesson Video</p>
          </div>
        </div>

        {/* Lesson Details */}
        <div className="max-w-5xl mx-auto w-full p-8 flex-1">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Master the Lexical Resource</h1>
              <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                In this lesson, you will learn exactly what examiners look for when grading your vocabulary in both the Speaking and Writing modules.
              </p>
            </div>
            
            <button 
              onClick={handleToggleComplete}
              disabled={isSubmitting}
              className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                isCompleted 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-[#027FFF] hover:bg-blue-600 text-white'
              }`}
            >
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : null}
              {isCompleted ? 'Completed' : 'Mark as Complete'}
            </button>
          </div>

          {/* Lesson Tabs */}
          <div className="flex items-center gap-8 border-b border-slate-200 mb-6">
            <button 
              onClick={() => setActiveTab('video')}
              className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'video' ? 'border-[#027FFF] text-[#027FFF]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('transcript')}
              className={`pb-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'transcript' ? 'border-[#027FFF] text-[#027FFF]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              Transcript
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'video' ? (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">Lesson Resources</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white w-full max-w-sm hover:border-[#027FFF] transition-colors cursor-pointer shadow-sm group">
                    <div className="flex items-center gap-3">
                      <FileText className="w-7 h-7 text-rose-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-[#027FFF] transition-colors">Lexical_Guide.pdf</p>
                        <p className="text-xs text-slate-400 font-medium">2.4 MB</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600 text-sm leading-relaxed shadow-sm">
                <p className="mb-3"><span className="text-[#027FFF] font-bold">00:00</span> Welcome to module one. Today we are going to dive deep into the Lexical Resource criterion...</p>
                <p><span className="text-[#027FFF] font-bold">01:15</span> A lot of students make the mistake of using &quot;big words&quot; incorrectly. Examiners are actually looking for precision...</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
