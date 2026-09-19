"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Video, Users, Clock, Calendar as CalendarIcon, PlayCircle, 
  CheckCircle2, Mic, MicOff, VideoOff, MessageSquare, Hand, 
  ScreenShare, PhoneOff, Send, Sparkles, AlertCircle, Check, ArrowRight
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { toast } from '@/components/ToastProvider';

interface LiveSession {
  id: string;
  title: string;
  subject: string;
  instructorName: string;
  instructorTitle: string;
  dateStr: string;
  timeStr: string;
  durationMinutes: number;
  enrolledCount: number;
  maxParticipants: number;
  isLiveNow?: boolean;
  agenda: string[];
}

const MULTI_SUBJECT_LIVE_CLASSES: LiveSession[] = [
  {
    id: "live-cs-1",
    title: "Python Live Coding Lab: Functions, Loops & Debugging",
    subject: "Computer Science",
    instructorName: "Dr. Alex Vance",
    instructorTitle: "Senior Software Engineer & Lecturer",
    dateStr: "Today",
    timeStr: "4:00 PM - 5:15 PM",
    durationMinutes: 75,
    enrolledCount: 24,
    maxParticipants: 35,
    isLiveNow: true,
    agenda: [
      "Live code walkthrough: writing modular functions",
      "Common runtime errors & debugging techniques",
      "Interactive Q&A & live student code review"
    ]
  },
  {
    id: "live-eng-2",
    title: "Conversational English Masterclass: Fluency & Dialogue",
    subject: "English & Languages",
    instructorName: "Sarah Jenkins",
    instructorTitle: "Head of Applied Linguistics",
    dateStr: "Tomorrow",
    timeStr: "5:00 PM - 6:00 PM",
    durationMinutes: 60,
    enrolledCount: 31,
    maxParticipants: 40,
    agenda: [
      "Natural conversational rhythm and thought grouping",
      "Expanding high-register vocabulary in daily speech",
      "1-on-1 breakout room speaking practice"
    ]
  },
  {
    id: "live-math-3",
    title: "Algebra Problem Solving Workshop: Two-Step Equations",
    subject: "Mathematics",
    instructorName: "Prof. David Kumar",
    instructorTitle: "Professor of Applied Mathematics",
    dateStr: "Thursday",
    timeStr: "3:30 PM - 4:45 PM",
    durationMinutes: 75,
    enrolledCount: 19,
    maxParticipants: 30,
    agenda: [
      "Visual proofs and balance methods for equations",
      "Solving complex word problems step-by-step",
      "Speed shortcuts for algebra examinations"
    ]
  },
  {
    id: "live-sci-4",
    title: "General Science Live: Exploring Planetary Physics & Gravity",
    subject: "Science",
    instructorName: "Elena Rostova",
    instructorTitle: "Science Educator & Researcher",
    dateStr: "Friday",
    timeStr: "6:00 PM - 7:00 PM",
    durationMinutes: 60,
    enrolledCount: 22,
    maxParticipants: 35,
    agenda: [
      "Interactive 3D solar system simulation",
      "Gravitational forces and orbital mechanics",
      "Live science experiment demonstration"
    ]
  }
];

const SUBJECT_FILTERS = [
  { id: "all", label: "All Sessions" },
  { id: "Computer Science", label: "💻 Computer Science" },
  { id: "English & Languages", label: "📖 English" },
  { id: "Mathematics", label: "📐 Mathematics" },
  { id: "Science", label: "🔬 Science" }
];

interface ChatMessage {
  id: string;
  sender: string;
  role: 'instructor' | 'student';
  text: string;
  time: string;
}

export default function LiveClassesPage() {
  const [sessions] = useState<LiveSession[]>(MULTI_SUBJECT_LIVE_CLASSES);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [rsvpd, setRsvpd] = useState<Record<string, boolean>>({ "live-cs-1": true });
  
  // Virtual Classroom Modal State
  const [inClassroom, setInClassroom] = useState(false);
  const [activeSession, setActiveSession] = useState<LiveSession | null>(MULTI_SUBJECT_LIVE_CLASSES[0]);
  const [studioTab, setStudioTab] = useState<'stream' | 'whiteboard' | 'code'>('stream');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Dr. Alex Vance (Instructor)',
      role: 'instructor',
      text: 'Welcome everyone! Let me share my screen and we will begin our live coding lab in 2 minutes.',
      time: '4:01 PM'
    },
    {
      id: '2',
      sender: 'Student (You)',
      role: 'student',
      text: 'Hello Dr. Alex! Can we review recursive functions today as well?',
      time: '4:03 PM'
    }
  ]);

  const filteredSessions = sessions.filter(s => {
    if (selectedSubject === "all") return true;
    return s.subject.toLowerCase() === selectedSubject.toLowerCase();
  });

  const handleToggleRsvp = (sessionId: string) => {
    setRsvpd(prev => {
      const next = !prev[sessionId];
      toast.success(
        next ? "RSVP Confirmed! 📅" : "RSVP Cancelled",
        next ? "Added to your study calendar with reminders." : "Session removed from confirmed calendar."
      );
      return { ...prev, [sessionId]: next };
    });
  };

  const handleJoinVirtualRoom = (session: LiveSession) => {
    setActiveSession(session);
    setInClassroom(true);
    toast.success("Connected to Classroom", `Joined live session: "${session.title}"`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Student (You)',
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
      toast.info("Hand Raised ✋", "Instructor notified that you have a question.");
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* If inside Virtual Classroom */}
        {inClassroom && activeSession ? (
          <div className="flex-1 flex flex-col p-6 space-y-4 max-w-7xl w-full mx-auto animate-in fade-in zoom-in-95">
            {/* Top Bar */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <div>
                  <h2 className="text-sm font-black text-slate-900">{activeSession.title}</h2>
                  <p className="text-[11px] text-slate-500">Instructor: {activeSession.instructorName} • {activeSession.subject}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {activeSession.enrolledCount} Active Students
                </span>

                <button
                  onClick={() => setInClassroom(false)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneOff className="w-3.5 h-3.5" /> Leave Room
                </button>
              </div>
            </div>

            {/* Video + Workspace Studio Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[500px]">
              {/* Main Stage: Video Stream, Whiteboard, or Collaborative Code Editor */}
              <div className="lg:col-span-2 rounded-3xl bg-slate-950 border border-slate-900 flex flex-col justify-between p-6 relative overflow-hidden shadow-lg">
                {/* Stage Mode Switcher */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-md flex items-center gap-2 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Room Active
                    </span>
                    <span className="text-[11px] text-white/80 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm hidden sm:inline">
                      HD 1080p WebRTC
                    </span>
                  </div>

                  <div className="flex items-center bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 gap-1 text-xs">
                    <button
                      onClick={() => setStudioTab('stream')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        studioTab === 'stream' ? 'bg-[#027FFF] text-white' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      📹 Video Stream
                    </button>
                    <button
                      onClick={() => setStudioTab('whiteboard')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        studioTab === 'whiteboard' ? 'bg-[#027FFF] text-white' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      🎨 Whiteboard
                    </button>
                    <button
                      onClick={() => setStudioTab('code')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        studioTab === 'code' ? 'bg-[#027FFF] text-white' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      💻 Code Lab
                    </button>
                  </div>
                </div>

                {/* Center Content based on selected Studio Tab */}
                {studioTab === 'stream' && (
                  <div className="flex flex-col items-center justify-center my-auto space-y-4 relative z-10 py-10 animate-in fade-in">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-3xl flex items-center justify-center shadow-2xl border-2 border-white/20">
                      {activeSession.instructorName[0]}
                    </div>
                    <div className="text-center">
                      <p className="text-white font-black text-lg">{activeSession.instructorName}</p>
                      <p className="text-xs text-slate-400">{activeSession.instructorTitle}</p>
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Instructor Screen &amp; Audio Broadcast Running
                      </div>
                    </div>
                  </div>
                )}

                {studioTab === 'whiteboard' && (
                  <div className="flex-1 my-4 bg-slate-900/90 rounded-2xl border border-white/10 p-4 flex flex-col relative z-10 animate-in fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">🎨 Collaborative Canvas</span>
                        <span className="text-[10px] text-slate-400">Multi-user real-time diagramming</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => toast.success("Canvas Cleared", "Whiteboard reset.")}
                          className="px-2.5 py-1 rounded-lg bg-white/10 text-white/80 hover:text-white text-[11px] font-bold"
                        >
                          Clear
                        </button>
                        <button 
                          onClick={() => toast.success("Diagram Exported", "Whiteboard diagram saved to your study notes.")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                        >
                          Save Snapshot
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 rounded-xl bg-slate-950 border border-white/10 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="space-y-3 max-w-md">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Interactive Instructor Board</h4>
                        <p className="text-xs text-slate-400">
                          Dr. Vance is annotating algorithm flowcharts and function execution stacks. All notes are saved to your session recap.
                        </p>
                        <div className="flex justify-center gap-2 pt-2">
                          <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-mono text-cyan-300">def calculate_fibonacci(n):</span>
                          <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-mono text-emerald-300">O(2^n) ➔ O(n)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {studioTab === 'code' && (
                  <div className="flex-1 my-4 bg-[#0F172A] rounded-2xl border border-white/10 p-4 flex flex-col relative z-10 animate-in fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400 font-mono">main.py</span>
                        <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded">Python 3.12 Live Sandbox</span>
                      </div>
                      <button 
                        onClick={() => toast.success("Code Executed! 🚀", "Output: [0, 1, 1, 2, 3, 5, 8, 13] (Execution time: 0.04s)")}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> Run Code
                      </button>
                    </div>
                    <div className="flex-1 bg-[#020617] rounded-xl p-4 font-mono text-xs text-slate-200 overflow-y-auto space-y-1">
                      <p className="text-slate-500"># Live collaborative coding session with Dr. Alex Vance</p>
                      <p><span className="text-purple-400">def</span> <span className="text-blue-400">generate_fibonacci</span>(limit: <span className="text-amber-400">int</span>):</p>
                      <p className="pl-4">sequence = [0, 1]</p>
                      <p className="pl-4"><span className="text-purple-400">while</span> <span className="text-cyan-400">len</span>(sequence) &lt; limit:</p>
                      <p className="pl-8">next_val = sequence[-1] + sequence[-2]</p>
                      <p className="pl-8">sequence.append(next_val)</p>
                      <p className="pl-4"><span className="text-purple-400">return</span> sequence</p>
                      <p className="pt-2 text-emerald-400">print(&quot;Fibonacci Series:&quot;, generate_fibonacci(8))</p>
                    </div>
                  </div>
                )}

                {/* In-Room Controls Bar */}
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10 relative z-10">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-3 rounded-2xl transition-all cursor-pointer ${
                      isMicOn ? "bg-white/15 text-white hover:bg-white/25" : "bg-rose-600 text-white"
                    }`}
                    title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-3 rounded-2xl transition-all cursor-pointer ${
                      isVideoOn ? "bg-white/15 text-white hover:bg-white/25" : "bg-rose-600 text-white"
                    }`}
                    title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={toggleHandRaise}
                    className={`p-3 rounded-2xl transition-all cursor-pointer ${
                      isHandRaised ? "bg-amber-500 text-white" : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                    title="Raise Hand"
                  >
                    <Hand className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => toast.info("Screen Sharing", "Screen sharing stream initialized.")}
                    className="p-3 rounded-2xl bg-white/15 text-white hover:bg-white/25 transition-all cursor-pointer"
                    title="Share Screen"
                  >
                    <ScreenShare className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Live Chat & Questions Box */}
              <div className="rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#027FFF]" /> Live Class Chat
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-80">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-bold ${msg.role === 'instructor' ? 'text-[#027FFF]' : 'text-slate-800'}`}>
                          {msg.sender}
                        </span>
                        <span className="text-slate-400 text-[10px]">{msg.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {msg.text}
                      </p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#027FFF]"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#027FFF] text-white hover:bg-blue-600 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* Main Live Schedule Feed */
          <>
            {/* Top Header */}
            <header className="h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shadow-xs">
                  <Video className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                    Live Classes &amp; Virtual Workshops
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">Join interactive live audio/video sessions with certified teachers</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard"
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  Back to Overview
                </Link>
              </div>
            </header>

            <div className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
              
              {/* Active Now Banner (If Live) */}
              {sessions.find(s => s.isLiveNow) && (
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE NOW • ACTIVE SESSION
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-white">
                      {sessions[0].title}
                    </h2>
                    <p className="text-xs text-rose-100 max-w-xl">
                      Instructor: <strong>{sessions[0].instructorName}</strong> • {sessions[0].timeStr} ({sessions[0].enrolledCount} Students in Room)
                    </p>
                  </div>

                  <button
                    onClick={() => handleJoinVirtualRoom(sessions[0])}
                    className="px-6 py-3.5 rounded-2xl bg-white text-rose-600 font-black text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all hover:bg-rose-50 hover:scale-105 shrink-0"
                  >
                    <PlayCircle className="w-5 h-5 fill-rose-600 text-white" /> Enter Classroom Now
                  </button>
                </div>
              )}

              {/* Subject Category Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SUBJECT_FILTERS.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSubject(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSubject === cat.id
                        ? "bg-[#027FFF] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Live Classes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSessions.map(session => {
                  const isRsvpd = rsvpd[session.id];
                  return (
                    <div
                      key={session.id}
                      className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 hover:shadow-md transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                            {session.subject}
                          </span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {session.durationMinutes} Mins
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {session.title}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium">
                          Instructor: <strong className="text-slate-800">{session.instructorName}</strong> ({session.instructorTitle})
                        </p>

                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs text-slate-600">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Session Schedule</span>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#027FFF]" />
                            {session.dateStr} • {session.timeStr}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">
                          {session.enrolledCount}/{session.maxParticipants} enrolled
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRsvp(session.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isRsvpd
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {isRsvpd ? "✓ RSVP Confirmed" : "RSVP Seat"}
                          </button>

                          <button
                            onClick={() => handleJoinVirtualRoom(session)}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" /> Join Room
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
