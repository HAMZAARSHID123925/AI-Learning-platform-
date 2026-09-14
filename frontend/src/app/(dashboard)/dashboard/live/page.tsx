"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Video, Users, Clock, 
  PlayCircle, ChevronRight, CheckCircle2
} from 'lucide-react';

export default function LiveClassesPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [joining, setJoining] = useState(false);
  
  const handleJoin = async () => {
    try {
      setJoining(true);
      const token = localStorage.getItem('access_token');
      // For the sake of the demo, if we don't have a specific session ID, we fetch the first available one and join it!
      const sessionsRes = await fetch('http://localhost:8000/api/v1/live-sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sessions = await sessionsRes.json();
      if (!sessions || sessions.length === 0) {
        alert("No active live sessions found in database!");
        return;
      }
      
      const sessionId = sessions[0].id;
      const res = await fetch(`http://localhost:8000/api/v1/live-sessions/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.room_url) {
        window.open(data.room_url, '_blank');
      } else if (data.token) {
        alert('WebRTC Room Token: ' + data.token);
      } else {
        alert('Could not join room. Is it active?');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to join room.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050B14] text-slate-200 p-6 lg:p-10">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Live Classes</h1>
        <p className="text-slate-400">Join interactive sessions with expert IELTS and English instructors.</p>
      </div>

      {/* ACTIVE/NEXT CLASS SPOTLIGHT */}
      <div className="mb-12 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#027FFF] to-emerald-500 rounded-[2rem] blur opacity-25 animate-pulse"></div>
        <div className="relative bg-[#0f182c] border border-white/10 rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 relative"></span>
              STARTING IN 15 MINS
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-3">Mastering IELTS Speaking Part 3</h2>
            <p className="text-slate-400 mb-6 max-w-xl leading-relaxed">
              Join Instructor Sarah for an intensive breakdown of Part 3 abstract questions. We will cover advanced vocabulary structures and how to extend your answers naturally.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5BC0EB]" />
                Today, 2:00 PM - 3:30 PM
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5BC0EB]" />
                24 Students Enrolled
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full lg:w-auto">
            <button 
              onClick={handleJoin}
              disabled={joining}
              className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Video className="w-5 h-5" />
              {joining ? 'Connecting...' : 'Join Virtual Room'}
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-8 border-b border-white/10 mb-8">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'upcoming' ? 'border-[#5BC0EB] text-[#5BC0EB]' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Upcoming Schedule
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'past' ? 'border-[#5BC0EB] text-[#5BC0EB]' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Past Recordings
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'upcoming' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1 */}
          <div className="bg-[#0B1221] border border-white/5 rounded-2xl p-6 hover:border-[#027FFF]/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#027FFF]/10 flex items-center justify-center border border-[#027FFF]/20">
                  <CalendarIcon className="w-5 h-5 text-[#027FFF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Advanced Essay Structures</h3>
                  <p className="text-xs text-slate-500">IELTS Academic Writing</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Clock className="w-4 h-4 text-slate-500" />
                Tomorrow, 10:00 AM
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Users className="w-4 h-4 text-slate-500" />
                Instructor David (12 enrolled)
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors">
              RSVP to Session
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0B1221] border border-white/5 rounded-2xl p-6 hover:border-[#027FFF]/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#027FFF]/10 flex items-center justify-center border border-[#027FFF]/20">
                  <CalendarIcon className="w-5 h-5 text-[#027FFF]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">General English: Phrasal Verbs</h3>
                  <p className="text-xs text-slate-500">General English Track</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Clock className="w-4 h-4 text-slate-500" />
                Thursday, 4:00 PM
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Users className="w-4 h-4 text-slate-500" />
                Instructor Emma (8 enrolled)
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-[#027FFF]/10 border border-[#027FFF]/20 text-[#5BC0EB] font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> RSVP Confirmed
            </button>
          </div>
          
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Recording Card */}
          <div className="bg-[#0B1221] border border-white/5 rounded-2xl p-4 flex gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
            <div className="w-32 h-24 bg-[#0f182c] rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden shrink-0">
              <PlayCircle className="w-8 h-8 text-[#5BC0EB] relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#027FFF]/20 to-transparent"></div>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-white font-bold mb-1 group-hover:text-[#5BC0EB] transition-colors">Speaking Part 2 Deep Dive</h3>
              <p className="text-xs text-slate-500 mb-2">Recorded on Oct 12 • 45 mins</p>
              <div className="text-xs font-semibold text-[#027FFF] flex items-center">
                Watch Recording <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
