"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, Video, Users, Clock, 
  PlayCircle, ChevronRight, CheckCircle2, ArrowLeft,
  Mic, MicOff, VideoOff, MessageSquare, Hand, ScreenShare,
  PhoneOff, Send, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { toast } from '@/components/ToastProvider';
import DashboardSidebar from '@/components/DashboardSidebar';

interface LiveSessionItem {
  id: string;
  title: string;
  scheduled_at: string;
  max_participants?: number;
  instructor_name?: string;
  status?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  role: 'instructor' | 'student';
  text: string;
  time: string;
}

export default function LiveClassesPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [inClassroom, setInClassroom] = useState(false);
  const [activeSession, setActiveSession] = useState<LiveSessionItem | null>(null);
  const [liveSessions, setLiveSessions] = useState<LiveSessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [rsvpdSessions, setRsvpdSessions] = useState<Record<string, boolean>>({});
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Sarah Jenkins (IELTS Lead)',
      role: 'instructor',
      text: 'Welcome everyone! Today we are doing a deep dive into speaking Part 3 and high-level abstract vocabulary.',
      time: '2:01 PM'
    },
    {
      id: '2',
      sender: 'Hamza (You)',
      role: 'student',
      text: 'Excited for today\'s session! Can we cover counter-argument structures as well?',
      time: '2:03 PM'
    },
    {
      id: '3',
      sender: 'Sarah Jenkins (IELTS Lead)',
      role: 'instructor',
      text: 'Absolutely Hamza, we will do live speaking drills in 10 minutes.',
      time: '2:04 PM'
    }
  ]);

  const loadSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const res = await fetchWithAuth('/live-sessions');
      if (res.ok) {
        const data = await res.json();
        const items: LiveSessionItem[] = Array.isArray(data) ? data : (data.items || []);
        setLiveSessions(items);
        if (items.length > 0) {
          setActiveSession(items[0]);
        }
      }
    } catch (err) {
      console.warn("Using offline live sessions catalog:", err);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleJoinVirtualRoom = (session?: LiveSessionItem) => {
    if (session) setActiveSession(session);
    setInClassroom(true);
    toast.success("Connected to Classroom", `Audio/Video streams connected to "${session?.title || activeSession?.title || 'Live Virtual Classroom'}".`);
  };

  const handleToggleRsvp = (sessionId: string) => {
    setRsvpdSessions(prev => {
      const next = !prev[sessionId];
      toast.success(
        next ? "RSVP Confirmed! 📅" : "RSVP Cancelled", 
        next ? "Added to your study calendar with live notifications enabled." : "Session removed from confirmed calendar."
      );
      return { ...prev, [sessionId]: next };
    });
  };

  const handleLeaveRoom = () => {
    setInClassroom(false);
    toast.info("Classroom Disconnected", "You have left the live session.");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Hamza (You)',
      role: 'student',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  const toggleHandRaise = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    if (next) {
      toast.info("Hand Raised ✋", "Instructor Sarah has been notified that you have a question.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] text-slate-800 font-sans">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 lg:p-10 bg-[#F0F4F8]">
        
        {/* If inside the interactive classroom */}
        {inClassroom ? (
          <div className="flex flex-col h-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
            {/* Classroom Top Bar */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-6 py-4 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Mastering IELTS Speaking Part 3 • Live Session</h2>
                  <p className="text-xs text-slate-500">Instructor: Sarah Jenkins • 24 Students Active</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setChatOpen(p => !p)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    chatOpen ? 'bg-blue-50 text-[#027FFF] border border-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat ({chatMessages.length})</span>
                </button>

                <button
                  onClick={handleLeaveRoom}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Leave Classroom</span>
                </button>
              </div>
            </div>

            {/* Video Feed & Interactive Stage */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[460px]">
              
              {/* Main Instructor Stage & Participant Tiles */}
              <div className={`flex flex-col gap-4 ${chatOpen ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                
                {/* Main Video Screen */}
                <div className="relative flex-1 bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center group">
                  
                  {/* Instructor Mock Video Feed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent flex flex-col justify-between p-6">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        Instructor Screen • 1080p HD
                      </span>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-mono">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        00:34:12
                      </div>
                    </div>

                    {/* Stage Presentation Slide */}
                    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-md max-w-lg shadow-2xl mx-auto my-auto text-white">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                        <Sparkles className="w-4 h-4" /> Live Lesson Board
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">Extending Abstract Responses</h3>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc ml-4">
                        <li>Start with a direct claim (*&quot;From my perspective...&quot;*)</li>
                        <li>Provide hypothetical reasoning (*&quot;If governments were to implement...&quot;*)</li>
                        <li>Contrasting perspective (*&quot;Conversely, skeptics might argue that...&quot;*)</li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
                          SJ
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">Sarah Jenkins</p>
                          <p className="text-[10px] text-slate-400">Head of IELTS Coaching</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Self-Preview in Corner */}
                  <div className="absolute bottom-5 right-5 w-40 h-28 bg-slate-800 border-2 border-slate-600 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-2.5 z-20">
                    <div className="flex justify-between items-center text-[10px] text-white font-bold">
                      <span>You</span>
                      {!isMicOn && <MicOff className="w-3 h-3 text-red-400" />}
                    </div>
                    <div className="flex items-center justify-center">
                      {isVideoOn ? (
                        <div className="w-10 h-10 rounded-full bg-[#027FFF] text-white font-bold flex items-center justify-center text-sm">
                          H
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Camera Off</span>
                      )}
                    </div>
                    <div className="text-[9px] text-emerald-400 font-bold">Good Quality</div>
                  </div>

                </div>

                {/* Media Control Bar */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-center gap-4 shadow-sm">
                  <button
                    onClick={() => setIsMicOn(p => !p)}
                    className={`p-3.5 rounded-2xl font-bold transition-all ${
                      isMicOn ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                    title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setIsVideoOn(p => !p)}
                    className={`p-3.5 rounded-2xl font-bold transition-all ${
                      isVideoOn ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                    title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={toggleHandRaise}
                    className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                      isHandRaised 
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 animate-bounce' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Hand className="w-4 h-4" />
                    <span>{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
                  </button>

                  <button
                    onClick={() => toast.info("Screen Share", "Screen sharing is enabled for instructor and designated presenters.")}
                    className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                    title="Screen Share"
                  >
                    <ScreenShare className="w-5 h-5" />
                  </button>
                </div>

              </div>

              {/* In-Room Live Chat Panel */}
              {chatOpen && (
                <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#027FFF]" /> Classroom Discussion
                      </h3>
                      <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Live</span>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                      {chatMessages.map(msg => (
                        <div 
                          key={msg.id} 
                          className={`p-3 rounded-2xl text-xs ${
                            msg.role === 'instructor' 
                              ? 'bg-purple-50/80 border border-purple-200/70 text-purple-950' 
                              : 'bg-slate-50 border border-slate-200/60 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold ${msg.role === 'instructor' ? 'text-purple-700' : 'text-slate-800'}`}>
                              {msg.sender}
                            </span>
                            <span className="text-[10px] text-slate-400">{msg.time}</span>
                          </div>
                          <p className="leading-relaxed text-slate-700">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Send Input Form */}
                  <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Ask instructor Sarah a question..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#027FFF] focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 disabled:opacity-40 text-white font-bold transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        ) : (
          /* Normal Live Classes Dashboard View */
          <div>
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
                    ACTIVE NOW • READY TO JOIN
                  </div>
                  
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">
                    {activeSession?.title || 'Mastering IELTS Speaking Part 3 & Abstract Lexicon'}
                  </h2>
                  <p className="text-slate-600 mb-6 max-w-xl leading-relaxed text-sm">
                    Interactive high-register seminar with live examiner audio feedback, spontaneous conversation drills, and Band 8.5+ cadence calibration.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#027FFF]" />
                      {activeSession?.scheduled_at ? new Date(activeSession.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today, 2:00 PM - 3:30 PM'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#027FFF]" />
                      {activeSession?.max_participants || 30} Max Participants
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full lg:w-auto">
                  <button 
                    onClick={() => handleJoinVirtualRoom(activeSession || undefined)}
                    className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-sm hover:shadow-md text-sm"
                  >
                    <Video className="w-5 h-5" />
                    Enter Interactive Classroom
                  </button>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="flex items-center justify-between border-b border-slate-200 mb-8">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setActiveTab('upcoming')}
                  className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'upcoming' ? 'border-[#027FFF] text-[#027FFF]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                  Upcoming Schedule ({liveSessions.length || 2})
                </button>
                <button 
                  onClick={() => setActiveTab('past')}
                  className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'past' ? 'border-[#027FFF] text-[#027FFF]' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                  Past Recordings
                </button>
              </div>

              <button 
                onClick={loadSessions} 
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#027FFF] font-semibold transition-colors pb-4"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSessions ? 'animate-spin' : ''}`} /> Refresh Schedule
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'upcoming' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveSessions.length > 0 ? (
                  liveSessions.map((sess) => {
                    const isRsvpd = !!rsvpdSessions[sess.id];
                    const dateFormatted = new Date(sess.scheduled_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={sess.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-[#027FFF] transition-all shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                <CalendarIcon className="w-5 h-5 text-[#027FFF]" />
                              </div>
                              <div>
                                <h3 className="text-slate-900 font-bold text-lg">{sess.title}</h3>
                                <p className="text-xs text-slate-500 font-medium">Examiner-Led Workshop</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {dateFormatted}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                              <Users className="w-4 h-4 text-slate-400" />
                              {sess.max_participants || 30} Available Seats
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleRsvp(sess.id)}
                            className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                              isRsvpd
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-blue-50 border-blue-200 text-[#027FFF] hover:bg-blue-100'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" /> {isRsvpd ? 'RSVP Confirmed ✓' : 'Confirm RSVP'}
                          </button>
                          <button
                            onClick={() => handleJoinVirtualRoom(sess)}
                            className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <Video className="w-3.5 h-3.5 text-emerald-400" /> Join
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    {/* Fallback mock cards if database is freshly seeded */}
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
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Clock className="w-4 h-4 text-slate-400" />
                          Tomorrow • 4:00 PM - 5:00 PM
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <Users className="w-4 h-4 text-slate-400" />
                          Faculty Lead (18 enrolled)
                        </div>
                      </div>
                      <button 
                        onClick={() => handleToggleRsvp('fallback-1')}
                        className="w-full py-3 rounded-xl bg-blue-50 border border-blue-200 text-[#027FFF] font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {rsvpdSessions['fallback-1'] ? 'RSVP Confirmed ✓' : 'Confirm RSVP'}
                      </button>
                    </div>
                  </>
                )}

                {/* Card 2 */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:border-[#027FFF] transition-all shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100">
                        <CalendarIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold text-lg">Pronunciation Masterclass</h3>
                        <p className="text-xs text-slate-500 font-medium">Intonation &amp; Connected Speech</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Thursday • 6:00 PM - 7:30 PM
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Users className="w-4 h-4 text-slate-400" />
                      Instructor David (32 enrolled)
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.success("RSVP Saved!", "You are registered for Thursday's Pronunciation Masterclass.")}
                    className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
                  >
                    Reserve My Seat
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
          </div>
        )}

      </main>
    </div>
  );
}
