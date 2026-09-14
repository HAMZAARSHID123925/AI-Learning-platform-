"use client";
import { fetchWithAuth } from "@/lib/api";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, Video, Users, Clock, 
  PlayCircle, ChevronRight, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { toast } from '@/components/ToastProvider';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function LiveClassesPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [joining, setJoining] = useState(false);
  
  const handleJoin = async () => {
    try {
      setJoining(true);

      const sessionsRes = await fetchWithAuth('/live-sessions');
      const sessions = await sessionsRes.json();
      if (!sessions || sessions.length === 0) {
        toast.warning("No Active Sessions", "No scheduled live classes found at this moment.");
        return;
      }
      
      const sessionId = sessions[0].id;
      const res = await fetchWithAuth(`/live-sessions/${sessionId}/join`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.room_url) {
        toast.success("Connecting to Classroom...", "Opening WebRTC video room.");
        window.open(data.room_url, '_blank');
      } else if (data.token) {
        toast.info("WebRTC Token Generated", data.token);
      } else {
        toast.error("Unable to Join", "Could not connect to live room.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Connection Error", "Failed to join live session.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      {/* SIDEBAR */}
      <DashboardSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live Classes</h1>
            <p className="text-sm text-slate-500 mt-1">Join interactive live audio/video sessions with expert IELTS and English instructors.</p>
          </div>
        </div>

      {/* ACTIVE/NEXT CLASS SPOTLIGHT */}
      <div className="mb-10">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm">
          
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              STARTING IN 15 MINS
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">Mastering IELTS Speaking Part 3</h2>
            <p className="text-slate-600 mb-6 max-w-xl leading-relaxed text-sm">
              Join Instructor Sarah for an intensive breakdown of Part 3 abstract questions. We will cover advanced vocabulary structures and how to extend your answers naturally.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#027FFF]" />
                Today, 2:00 PM - 3:30 PM
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#027FFF]" />
                24 Students Enrolled
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full lg:w-auto">
            <button 
              onClick={handleJoin}
              disabled={joining}
              className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-sm"
            >
              <Video className="w-5 h-5" />
              {joining ? 'Connecting...' : 'Join Virtual Room'}
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'upcoming' ? 'border-[#027FFF] text-[#027FFF]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Upcoming Schedule
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'past' ? 'border-[#027FFF] text-[#027FFF]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Past Recordings
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'upcoming' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-[#027FFF] transition-all shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <CalendarIcon className="w-5 h-5 text-[#027FFF]" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-lg">Advanced Essay Structures</h3>
                  <p className="text-xs text-slate-500 font-medium">IELTS Academic Writing</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                Tomorrow, 10:00 AM
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                Instructor David (12 enrolled)
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition-colors">
              RSVP to Session
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-[#027FFF] transition-all shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <CalendarIcon className="w-5 h-5 text-[#027FFF]" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-lg">General English: Phrasal Verbs</h3>
                  <p className="text-xs text-slate-500 font-medium">General English Track</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                Thursday, 4:00 PM
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                Instructor Emma (8 enrolled)
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-blue-50 border border-blue-200 text-[#027FFF] font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> RSVP Confirmed
            </button>
          </div>
          
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Recording Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm">
            <div className="w-32 h-24 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 relative overflow-hidden shrink-0">
              <PlayCircle className="w-8 h-8 text-[#027FFF] relative z-10" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-slate-900 font-bold mb-1">Speaking Part 2 Deep Dive</h3>
              <p className="text-xs text-slate-500 mb-2">Recorded on Oct 12 • 45 mins</p>
              <div className="text-xs font-bold text-[#027FFF] flex items-center">
                Watch Recording <ChevronRight className="w-4 h-4 ml-0.5" />
              </div>
            </div>
          </div>

        </div>
      )}

      </main>
    </div>
  );
}
