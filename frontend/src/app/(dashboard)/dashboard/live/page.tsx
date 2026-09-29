"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Video, Calendar as CalendarIcon, PlayCircle, 
  Mic, MicOff, VideoOff, Hand, PhoneOff, Send, Clock
} from 'lucide-react';
import { toast } from '@/components/ToastProvider';
import { useLearning } from '@/contexts/LearningContext';
import { Grade } from '@/types/learning';

interface LiveSession {
  id: string;
  title: string;
  subject: string;
  subjectTag: string;
  grade: Grade;
  instructorName: string;
  dateStr: string;
  timeStr: string;
  durationMinutes: number;
  enrolledCount: number;
  isLiveNow?: boolean;
  color: string;
  emoji: string;
}

const ALL_LIVE_CLASSES: LiveSession[] = [
  // Grade 1 Classes
  {
    id: "live-g1-1",
    title: "Counting Fun: Numbers 1 to 100",
    subject: "math",
    subjectTag: "Math",
    grade: 1,
    instructorName: "Sir Alex",
    dateStr: "Today",
    timeStr: "4:00 PM",
    durationMinutes: 30,
    enrolledCount: 18,
    isLiveNow: true,
    color: "bg-blue-50 text-blue-800 border-blue-200",
    emoji: "🔢"
  },
  {
    id: "live-g1-2",
    title: "My 5 Senses: Seeing & Hearing",
    subject: "science",
    subjectTag: "Science",
    grade: 1,
    instructorName: "Miss Sarah",
    dateStr: "Tomorrow",
    timeStr: "5:00 PM",
    durationMinutes: 30,
    enrolledCount: 22,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    emoji: "👀"
  },
  {
    id: "live-g1-3",
    title: "Phonics & First ABC Words",
    subject: "english",
    subjectTag: "English",
    grade: 1,
    instructorName: "Miss Eleanor",
    dateStr: "Thursday",
    timeStr: "4:00 PM",
    durationMinutes: 30,
    enrolledCount: 15,
    color: "bg-purple-50 text-purple-800 border-purple-200",
    emoji: "📖"
  },
  {
    id: "live-g1-4",
    title: "Meet the Computer & Mouse",
    subject: "cs",
    subjectTag: "Computer",
    grade: 1,
    instructorName: "Sir Alan",
    dateStr: "Friday",
    timeStr: "4:00 PM",
    durationMinutes: 30,
    enrolledCount: 20,
    color: "bg-amber-50 text-amber-800 border-amber-200",
    emoji: "💻"
  },

  // Grade 2 Classes
  {
    id: "live-g2-1",
    title: "Adding & Subtracting to 100",
    subject: "math",
    subjectTag: "Math",
    grade: 2,
    instructorName: "Sir Alex",
    dateStr: "Today",
    timeStr: "4:00 PM",
    durationMinutes: 35,
    enrolledCount: 21,
    isLiveNow: true,
    color: "bg-blue-50 text-blue-800 border-blue-200",
    emoji: "➕"
  },
  {
    id: "live-g2-2",
    title: "Four Seasons & Fun Weather",
    subject: "science",
    subjectTag: "Science",
    grade: 2,
    instructorName: "Miss Sarah",
    dateStr: "Tomorrow",
    timeStr: "5:00 PM",
    durationMinutes: 35,
    enrolledCount: 24,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    emoji: "☀️"
  },

  // Grade 3 Classes
  {
    id: "live-g3-1",
    title: "Fractions & Shapes Workshop",
    subject: "math",
    subjectTag: "Math",
    grade: 3,
    instructorName: "Sir Alex",
    dateStr: "Today",
    timeStr: "4:00 PM",
    durationMinutes: 40,
    enrolledCount: 26,
    isLiveNow: true,
    color: "bg-blue-50 text-blue-800 border-blue-200",
    emoji: "📐"
  },
  {
    id: "live-g3-2",
    title: "Plants, Animals & Nature Quiz",
    subject: "science",
    subjectTag: "Science",
    grade: 3,
    instructorName: "Miss Sarah",
    dateStr: "Tomorrow",
    timeStr: "5:00 PM",
    durationMinutes: 40,
    enrolledCount: 30,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    emoji: "🌱"
  },
  {
    id: "live-g3-3",
    title: "Story Reading & New Words",
    subject: "english",
    subjectTag: "English",
    grade: 3,
    instructorName: "Miss Eleanor",
    dateStr: "Thursday",
    timeStr: "4:00 PM",
    durationMinutes: 40,
    enrolledCount: 22,
    color: "bg-purple-50 text-purple-800 border-purple-200",
    emoji: "📚"
  },
  {
    id: "live-g3-4",
    title: "Coding Games with Scratch",
    subject: "cs",
    subjectTag: "Computer",
    grade: 3,
    instructorName: "Sir Alan",
    dateStr: "Friday",
    timeStr: "4:00 PM",
    durationMinutes: 40,
    enrolledCount: 28,
    color: "bg-amber-50 text-amber-800 border-amber-200",
    emoji: "🎮"
  },

  // Grade 4 & 5 Classes
  {
    id: "live-g4-1",
    title: "Long Multiplication & Puzzles",
    subject: "math",
    subjectTag: "Math",
    grade: 4,
    instructorName: "Sir Alex",
    dateStr: "Today",
    timeStr: "4:00 PM",
    durationMinutes: 45,
    enrolledCount: 19,
    isLiveNow: true,
    color: "bg-blue-50 text-blue-800 border-blue-200",
    emoji: "✖️"
  },
  {
    id: "live-g5-1",
    title: "Decimals, Planets & Solar System",
    subject: "science",
    subjectTag: "Science",
    grade: 5,
    instructorName: "Miss Sarah",
    dateStr: "Tomorrow",
    timeStr: "5:00 PM",
    durationMinutes: 45,
    enrolledCount: 25,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    emoji: "🪐"
  }
];

const SUBJECT_BUTTONS = [
  { id: "all", label: "All Subjects", icon: "✨" },
  { id: "math", label: "Math", icon: "🔢" },
  { id: "science", label: "Science", icon: "🌱" },
  { id: "english", label: "English", icon: "📖" },
  { id: "cs", label: "Computer", icon: "💻" }
];

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isTeacher?: boolean;
}

export default function LiveClassesPage() {
  const { grade, setGrade } = useLearning();
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [joinedClasses, setJoinedClasses] = useState<Record<string, boolean>>({});
  
  // Virtual Classroom State
  const [inClassroom, setInClassroom] = useState(false);
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Teacher',
      text: 'Salam! Welcome to class! We are starting now.',
      isTeacher: true
    }
  ]);

  // Filter classes by selected Grade & Subject
  const gradeClasses = ALL_LIVE_CLASSES.filter(c => c.grade === grade);
  const displayedClasses = gradeClasses.filter(c => 
    selectedSubject === "all" ? true : c.subject === selectedSubject
  );

  const currentLive = displayedClasses.find(c => c.isLiveNow) || gradeClasses.find(c => c.isLiveNow);

  const handleJoinVirtualRoom = (session: LiveSession) => {
    setActiveSession(session);
    setInClassroom(true);
    setJoinedClasses(prev => ({ ...prev, [session.id]: true }));
    toast.success("Joined Class! 🎉", `Welcome to ${session.title}`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text: chatInput.trim()
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-5 sm:py-7 md:py-8 space-y-6">
      
      {/* 1. TOP HEADER: Welcoming & Active Class Badge */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Live Video Classes 🎥
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Class {grade}
            </span>
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-muted">
            Join your teacher live on screen. Tap a class to start!
          </p>
        </div>
      </div>

      {/* 2. BIG SIMPLE "START NOW" BANNER IF CLASS IS LIVE */}
      {currentLive && (
        <div className="p-5 sm:p-6 rounded-3xl bg-blue-50 border-2 border-primary/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
              {currentLive.emoji}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-white px-2 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Now
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-ink truncate mt-0.5">
                {currentLive.title}
              </h2>
              <p className="text-xs text-muted">
                Teacher: <strong className="text-ink">{currentLive.instructorName}</strong> • {currentLive.durationMinutes} mins • {currentLive.enrolledCount} Students inside
              </p>
            </div>
          </div>

          <button
            onClick={() => handleJoinVirtualRoom(currentLive)}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-strong text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shrink-0"
          >
            <Video className="w-5 h-5 text-white" />
            Enter My Class Now
          </button>
        </div>
      )}

      {/* 3. EASY SUBJECT TABS WITH EMOJIS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SUBJECT_BUTTONS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedSubject(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedSubject === tab.id
                ? "bg-ink text-white shadow-xs scale-105"
                : "bg-white border border-line text-muted hover:text-ink hover:bg-canvas"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 4. VERY SIMPLE CHILD CARDS FOR CURRENT GRADE */}
      <div>
        <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">
          Classes for Class {grade}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedClasses.map(c => {
            const hasJoined = joinedClasses[c.id];
            return (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white border border-line shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${c.color} inline-flex items-center gap-1`}>
                      <span>{c.emoji}</span>
                      <span>{c.subjectTag}</span>
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-subtle" />
                      {c.durationMinutes} mins
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-ink leading-snug">
                    {c.title}
                  </h4>

                  <p className="text-xs text-muted">
                    Teacher: <strong className="text-ink">{c.instructorName}</strong>
                  </p>

                  <div className="p-2.5 rounded-2xl bg-canvas border border-line flex items-center justify-between text-xs font-bold text-ink">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      {c.dateStr} at {c.timeStr}
                    </span>
                    <span className="text-[11px] text-muted font-medium">
                      Class {c.grade}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-line flex items-center gap-2">
                  <button
                    onClick={() => handleJoinVirtualRoom(c)}
                    className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <Video className="w-4 h-4 text-white" />
                    {c.isLiveNow ? "Join Class Now" : hasJoined ? "✓ Joined" : "Open Video Room"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. VIRTUAL CLASSROOM FOR CHILDREN (Clean, Simple, Big Buttons) */}
      {inClassroom && activeSession && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] max-h-[720px] shadow-2xl flex flex-col overflow-hidden border border-line">
            
            {/* Top Bar inside Room */}
            <div className="px-5 py-3.5 border-b border-line flex items-center justify-between bg-canvas">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeSession.emoji}</span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-ink">{activeSession.title}</h3>
                  <p className="text-xs text-muted">Teacher: {activeSession.instructorName} • Class {activeSession.grade}</p>
                </div>
              </div>

              <button
                onClick={() => setInClassroom(false)}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PhoneOff className="w-3.5 h-3.5" /> Leave Class
              </button>
            </div>

            {/* Video Stage & Chat */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              
              {/* Teacher Video Screen */}
              <div className="md:col-span-8 bg-[#181A20] text-white flex flex-col justify-between p-5 relative">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Teacher Live Camera 🎥
                  </span>
                  <span className="text-zinc-400">
                    {activeSession.enrolledCount} Friends in Room
                  </span>
                </div>

                {/* Animated Simulation Box */}
                <div className="my-auto text-center space-y-3 py-8">
                  <div className="w-20 h-20 rounded-full bg-primary/20 text-primary border-2 border-primary/40 flex items-center justify-center mx-auto text-4xl shadow-lg">
                    👨‍🏫
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-white">{activeSession.instructorName}</h4>
                    <p className="text-xs text-zinc-300">Teaching Class {activeSession.grade}</p>
                  </div>
                  <div className="inline-block px-4 py-2 rounded-2xl bg-white/10 text-sm text-emerald-300 font-bold border border-white/10">
                    &quot;Listen carefully to today&apos;s fun lesson!&quot;
                  </div>
                </div>

                {/* Big Child Friendly Buttons */}
                <div className="flex items-center justify-center gap-3 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                      isMicOn ? "bg-white text-ink shadow-md" : "bg-rose-600 text-white"
                    }`}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    {isMicOn ? "Mic On" : "Muted"}
                  </button>

                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                      isVideoOn ? "bg-white text-ink shadow-md" : "bg-rose-600 text-white"
                    }`}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    {isVideoOn ? "Camera On" : "Camera Off"}
                  </button>

                  <button
                    onClick={() => {
                      const next = !isHandRaised;
                      setIsHandRaised(next);
                      if (next) toast.info("Hand Raised ✋", "Your teacher saw your hand!");
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                      isHandRaised ? "bg-amber-400 text-ink animate-bounce" : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    <Hand className="w-4 h-4" />
                    {isHandRaised ? "Hand Raised ✋" : "Raise Hand"}
                  </button>
                </div>
              </div>

              {/* Simple Chat Box */}
              <div className="md:col-span-4 bg-white flex flex-col border-t md:border-t-0 md:border-l border-line">
                <div className="p-3.5 border-b border-line flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">Class Messages 💬</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Online</span>
                </div>

                <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto max-h-[300px]">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="space-y-0.5">
                      <span className={`text-[10px] font-bold block ${msg.isTeacher ? 'text-primary' : 'text-ink'}`}>
                        {msg.sender}
                      </span>
                      <p className="text-xs text-ink bg-canvas p-2.5 rounded-xl border border-line">
                        {msg.text}
                      </p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-line flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message to teacher..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-canvas border border-line text-xs focus:outline-none focus:border-primary text-ink"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-primary text-white hover:bg-primary-strong cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
