"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, Video, AlertCircle, BookOpen, Search, 
  ChevronRight, ArrowRight, BrainCircuit, CheckCircle, Clock,
  FileCheck2, Sliders, MessageSquare, Award, Sparkles, Send,
  Play, Pause, RotateCcw, CheckCircle2, ChevronDown, Check,
  BarChart3, Edit3, X, UploadCloud, Plus, Calendar, Star, Filter, TrendingUp
} from 'lucide-react';
import TeacherSidebar from '@/components/TeacherSidebar';
import { toast } from '@/components/ToastProvider';

interface CourseItem {
  id: string;
  title: string;
  category: string;
  description: string;
  modulesCount: number;
  studentsCount: number;
  status: 'published' | 'draft';
  createdDate: string;
}

interface StudentSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  subject: string;
  taskTitle: string;
  submittedAt: string;
  status: 'PENDING_REVIEW' | 'GRADED';
  submissionText: string;
  score?: number;
  grade?: string;
  feedback?: string;
}

interface StudentRosterItem {
  id: string;
  name: string;
  email: string;
  enrolledCourse: string;
  progressPct: number;
  weakArea: string;
  status: 'Active' | 'Needs Attention';
  joinedDate: string;
}

interface LiveSession {
  id: string;
  title: string;
  subject: string;
  scheduledTime: string;
  participantsCount: number;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
}

const INITIAL_COURSES: CourseItem[] = [
  {
    id: "c-1",
    title: "Introduction to Computer Science & Python",
    category: "Computer Science",
    description: "Learn Python syntax, algorithms, data structures, and practical coding logic.",
    modulesCount: 6,
    studentsCount: 42,
    status: "published",
    createdDate: "Sep 01, 2026"
  },
  {
    id: "c-2",
    title: "English Grammar & Academic Writing",
    category: "English & Languages",
    description: "Cohesive writing, advanced grammar, sentence structure, and vocabulary precision.",
    modulesCount: 5,
    studentsCount: 38,
    status: "published",
    createdDate: "Sep 05, 2026"
  },
  {
    id: "c-3",
    title: "Algebra & Problem Solving Masterclass",
    category: "Mathematics",
    description: "Linear algebra, quadratic equations, calculus principles, and geometry.",
    modulesCount: 8,
    studentsCount: 29,
    status: "published",
    createdDate: "Aug 20, 2026"
  },
  {
    id: "c-4",
    title: "General Science & Physics Fundamentals",
    category: "Science",
    description: "Mechanics, energy transformations, light physics, and experimental design.",
    modulesCount: 4,
    studentsCount: 18,
    status: "draft",
    createdDate: "Sep 12, 2026"
  }
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: "sub-1",
    studentName: "Hamza Arshid",
    studentEmail: "student@penpage.academy",
    courseTitle: "Introduction to Computer Science & Python",
    subject: "Computer Science",
    taskTitle: "Module 3: Binary Search Algorithm in Python",
    submittedAt: "Today, 2:15 PM",
    status: "PENDING_REVIEW",
    submissionText: `def binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\n# Test verification\nprint(binary_search([1, 3, 5, 7, 9, 11], 7)) # Returns index 3`
  },
  {
    id: "sub-2",
    studentName: "Sarah Chen",
    studentEmail: "sarah.c@utoronto.ca",
    courseTitle: "English Grammar & Academic Writing",
    subject: "English",
    taskTitle: "Essay: The Role of Renewable Energy in Economic Stability",
    submittedAt: "Today, 11:30 AM",
    status: "PENDING_REVIEW",
    submissionText: `In contemporary economies, the transition toward renewable energy infrastructure serves as both an environmental imperative and a catalyst for long-term fiscal resilience. By decoupling energy generation from volatile fossil fuel markets, nations foster domestic employment and predictable industrial overheads.`
  },
  {
    id: "sub-3",
    studentName: "Marcus Sterling",
    studentEmail: "marcus.s@outlook.com",
    courseTitle: "Algebra & Problem Solving Masterclass",
    subject: "Mathematics",
    taskTitle: "Problem Set 4: Definite Integrals and Area Under Curves",
    submittedAt: "Yesterday, 6:40 PM",
    status: "GRADED",
    submissionText: `Problem 1: Definite integral of 3x^2 from x=0 to x=4.\nAnti-derivative: F(x) = x^3.\nF(4) - F(0) = 4^3 - 0 = 64.\n\nProblem 2: Definite integral of (2x + 5) from 1 to 3.\nAnti-derivative: F(x) = x^2 + 5x.\nF(3) = 9 + 15 = 24. F(1) = 1 + 5 = 6.\nResult: 24 - 6 = 18.`,
    score: 95,
    grade: "Grade A+",
    feedback: "Flawless step-by-step substitution and arithmetic verification. Keep up the high standard!"
  }
];

const INITIAL_ROSTER: StudentRosterItem[] = [
  { id: "stu-1", name: "Hamza Arshid", email: "student@penpage.academy", enrolledCourse: "Computer Science & Python", progressPct: 75, weakArea: "Recursive Algorithms", status: "Active", joinedDate: "Sep 01, 2026" },
  { id: "stu-2", name: "Sarah Chen", email: "sarah.c@utoronto.ca", enrolledCourse: "English Grammar & Writing", progressPct: 90, weakArea: "Passive Transformations", status: "Active", joinedDate: "Aug 28, 2026" },
  { id: "stu-3", name: "Marcus Sterling", email: "marcus.s@outlook.com", enrolledCourse: "Calculus & Problem Solving", progressPct: 60, weakArea: "Integration by Parts", status: "Needs Attention", joinedDate: "Sep 04, 2026" },
  { id: "stu-4", name: "Elena Rostova", email: "elena.r@berlin.de", enrolledCourse: "Science & Physics Fundamentals", progressPct: 85, weakArea: "Newton's 3rd Law vectors", status: "Active", joinedDate: "Sep 08, 2026" },
];

const INITIAL_SESSIONS: LiveSession[] = [
  { id: "ls-1", title: "Live Code Review: Data Structures & Hash Maps", subject: "Computer Science", scheduledTime: "Today at 4:00 PM", participantsCount: 28, status: "UPCOMING" },
  { id: "ls-2", title: "Interactive Workshop: Academic Essay Structuring", subject: "English", scheduledTime: "Tomorrow at 11:00 AM", participantsCount: 34, status: "UPCOMING" },
  { id: "ls-3", title: "Calculus Problem Solving: Derivations & Roots", subject: "Mathematics", scheduledTime: "Friday at 2:00 PM", participantsCount: 22, status: "UPCOMING" }
];

export default function InstructorDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'grading' | 'classes' | 'roster' | 'ai_quizzes'>('overview');

  // Courses state
  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);
  const [courseFilter, setCourseFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Computer Science");
  const [newDesc, setNewDesc] = useState("");

  // Grading state
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(INITIAL_SUBMISSIONS[0]);
  const [gradeScore, setGradeScore] = useState(90);
  const [feedbackText, setFeedbackText] = useState("");

  // Live sessions state
  const [sessions, setSessions] = useState<LiveSession[]>(INITIAL_SESSIONS);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionSubject, setSessionSubject] = useState("Computer Science");
  const [sessionTime, setSessionTime] = useState("");

  // Student roster state
  const [roster, setRoster] = useState<StudentRosterItem[]>(INITIAL_ROSTER);
  const [searchRoster, setSearchRoster] = useState("");

  // AI Quiz Generator state
  const [aiSubject, setAiSubject] = useState("Computer Science & Python");
  const [aiTopic, setAiTopic] = useState("Binary Trees & Recursion");
  const [aiNumQ, setAiNumQ] = useState(5);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  // Create Course Handler
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCourse: CourseItem = {
      id: `c-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim() || "Comprehensive multi-subject course syllabus with interactive lessons and quizzes.",
      modulesCount: 4,
      studentsCount: 0,
      status: "published",
      createdDate: "Just Now"
    };

    setCourses(prev => [newCourse, ...prev]);
    setShowCreateCourseModal(false);
    setNewTitle("");
    setNewDesc("");
    toast.success("Course Created & Published! 🚀", `"${newCourse.title}" is now ready for students.`);
  };

  // Submit Grade Handler
  const handlePublishGrade = () => {
    if (!selectedSub) return;

    const letterGrade = gradeScore >= 90 ? "Grade A+" : gradeScore >= 80 ? "Grade A" : gradeScore >= 70 ? "Grade B" : "Grade C";

    const updated = {
      ...selectedSub,
      status: "GRADED" as const,
      score: gradeScore,
      grade: letterGrade,
      feedback: feedbackText || "Good effort. Review the module checklist for full marks on formatting."
    };

    setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? updated : s));
    setSelectedSub(updated);
    toast.success("Grade Dispatched! 🎓", `${letterGrade} (${gradeScore}%) and feedback published for ${selectedSub.studentName}.`);
  };

  // Schedule Session Handler
  const handleScheduleSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    const newSess: LiveSession = {
      id: `ls-${Date.now()}`,
      title: sessionTitle.trim(),
      subject: sessionSubject,
      scheduledTime: sessionTime || "Tomorrow at 3:00 PM",
      participantsCount: 0,
      status: "UPCOMING"
    };

    setSessions(prev => [newSess, ...prev]);
    setShowScheduleModal(false);
    setSessionTitle("");
    setSessionTime("");
    toast.success("Live Class Scheduled! 🎥", `"${newSess.title}" is now on the schedule.`);
  };

  // Generate AI Quiz Handler
  const handleGenerateTeacherQuiz = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setGeneratedQuestions([
        {
          id: 1,
          prompt: `In ${aiTopic}, what is the primary prerequisite concept required before starting?`,
          options: ["Foundational variable scoping", "Unrelated graphics rendering", "Network protocol headers", "Ignoring base cases"],
          correct: 0,
          explanation: "Conceptual prerequisite understanding is essential for topic mastery."
        },
        {
          id: 2,
          prompt: `Which approach ensures optimal algorithmic complexity when working with ${aiTopic}?`,
          options: ["Divide and conquer recursion with memoization", "Brute-force nested loops", "Random shuffling", "Hardcoded lookups"],
          correct: 0,
          explanation: "Divide and conquer provides logarithmic or linear efficiency compared to polynomial brute-force methods."
        },
        {
          id: 3,
          prompt: `What is the standard debugging strategy if an edge case fails in ${aiTopic}?`,
          options: ["Isolate boundary test values with assertions", "Delete the test suite", "Restart the server randomly", "Switch languages"],
          correct: 0,
          explanation: "Boundary testing reveals off-by-one errors and zero/null state failures."
        }
      ]);
      setIsGeneratingAi(false);
      toast.success("AI Quiz Created! 🤖", `Generated 3 verified questions on ${aiTopic}.`);
    }, 600);
  };

  const filteredCourses = courses.filter(c => courseFilter === 'all' ? true : c.status === courseFilter);
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING_REVIEW');
  const filteredRoster = roster.filter(s => s.name.toLowerCase().includes(searchRoster.toLowerCase()) || s.enrolledCourse.toLowerCase().includes(searchRoster.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      <TeacherSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                Teacher &amp; Faculty Studio
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Course Authoring, Homework Grading, Live Classes &amp; Student Performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Create Course
            </button>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Video className="w-4 h-4" /> Schedule Class
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Executive Faculty Spotlight Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-7 md:p-9 shadow-xl border border-slate-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#027FFF]/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-400/15 backdrop-blur-md px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-emerald-400/20">
                        <Sparkles className="w-3 h-3 text-amber-300" /> Faculty Command Center
                      </span>
                      <span className="text-xs text-slate-300 font-medium">Academic Year 2026</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                      Welcome to your Instructor Studio
                    </h2>
                    <p className="text-xs text-slate-300 max-w-xl">
                      Monitor live student submissions, host interactive masterclasses, design modular course curriculums, and deploy targeted AI assessments.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-blue-400" /> 127 Active Learners
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> {pendingSubmissions.length} Pending Submissions
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> {courses.length} Active Tracks
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-56">
                    <button
                      onClick={() => setShowCreateCourseModal(true)}
                      className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> New Course
                    </button>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="w-full py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/15 cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-cyan-300" /> Schedule Live
                    </button>
                  </div>
                </div>
              </div>

              {/* Bento KPI Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider">Total Students</span>
                    <span className="p-2 rounded-xl bg-blue-50 text-[#027FFF] border border-blue-200/60">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">127</p>
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +18 enrolled this week
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider">Pending Grading</span>
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{pendingSubmissions.length}</p>
                  <p className="text-xs text-amber-600 font-bold">Action required today</p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider">Published Courses</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                      <BookOpen className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{courses.length}</p>
                  <p className="text-xs text-slate-500 font-medium">Across CS, Math &amp; English</p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-wider">Live Broadcasts</span>
                    <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60">
                      <Video className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{sessions.length}</p>
                  <p className="text-xs text-purple-600 font-bold">Next session today at 4 PM</p>
                </div>
              </div>

              {/* Next Live Masterclass Spotlight Bar */}
              <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 border border-blue-700/40">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-400/20 px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 border border-cyan-400/30">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> Next Masterclass
                    </span>
                    <span className="text-xs text-blue-200 font-bold">28 Students Enrolled</span>
                  </div>
                  <h3 className="text-lg font-black text-white">Live Code Review: Data Structures &amp; Hash Maps</h3>
                  <p className="text-xs text-slate-300">Scheduled: Today at 4:00 PM • Duration: 60 mins</p>
                </div>
                <Link
                  href="/dashboard/live"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-[#027FFF] hover:from-cyan-600 hover:to-blue-600 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Video className="w-4 h-4" /> Open Faculty Studio &rarr;
                </Link>
              </div>

              {/* Two-Column Deck: Fast Grading Desk & Quick Tool Navigator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Fast Grading Stream (7 Cols) */}
                <div className="lg:col-span-7 p-6 md:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Awaiting Your Review ({pendingSubmissions.length})</h3>
                        <p className="text-[11px] text-slate-500">Student homework ready for evaluation</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('grading')}
                      className="text-xs font-bold text-[#027FFF] hover:underline"
                    >
                      Grading Studio &rarr;
                    </button>
                  </div>

                  <div className="space-y-3">
                    {pendingSubmissions.map((sub) => (
                      <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{sub.studentName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800">
                              Needs Grade
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">{sub.taskTitle}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Submitted {sub.submittedAt}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setActiveTab('grading');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer transition-all"
                        >
                          Grade Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Faculty Quick Tool Matrix (5 Cols) */}
                <div className="lg:col-span-5 p-6 md:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#027FFF]" /> Teacher Control Matrix
                    </h3>
                    <p className="text-[11px] text-slate-500">Direct shortcuts to key teaching modules</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 text-left transition-all group cursor-pointer"
                    >
                      <BookOpen className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-black text-slate-900">Course Studio</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Edit lessons &amp; syllabus</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('ai_quizzes')}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-200 text-left transition-all group cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-black text-slate-900">AI Quiz Bank</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Generate question sets</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('roster')}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-200 text-left transition-all group cursor-pointer"
                    >
                      <Users className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-black text-slate-900">Student Roster</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Class weak spots &amp; CRM</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('classes')}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 text-left transition-all group cursor-pointer"
                    >
                      <Video className="w-5 h-5 text-[#027FFF] mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-black text-slate-900">Live Schedule</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Manage virtual rooms</p>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: COURSE STUDIO */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">My Authoring Courses</h2>
                  <p className="text-xs text-slate-500">Create, edit syllabus, and manage published courses across all academic subjects</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                    {(['all', 'published', 'draft'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setCourseFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                          courseFilter === f ? 'bg-[#027FFF] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowCreateCourseModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> New Course
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCourses.map((c) => (
                  <div key={c.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#027FFF] uppercase">
                        {c.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        c.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-snug">{c.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <span>{c.modulesCount} Modules</span>
                      <span>{c.studentsCount} Students Enrolled</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/dashboard/lesson"
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition-colors"
                      >
                        Edit Syllabus
                      </Link>
                      <button
                        onClick={() => {
                          setCourses(prev => prev.map(item => item.id === c.id ? { ...item, status: item.status === 'published' ? 'draft' : 'published' } : item));
                          toast.success("Status Updated", `"${c.title}" is now ${c.status === 'published' ? 'Draft' : 'Published'}.`);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                      >
                        {c.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGNMENT GRADING */}
          {activeTab === 'grading' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Student Assignment Grading Studio</h2>
                <p className="text-xs text-slate-500">Review student homework submissions, assign score percentages, and write helpful feedback</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Submissions Queue */}
                <div className="lg:col-span-4 space-y-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Submissions Queue ({submissions.length})
                  </span>

                  <div className="space-y-2.5">
                    {submissions.map((sub) => {
                      const isSel = selectedSub?.id === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelectedSub(sub);
                            setGradeScore(sub.score || 90);
                            setFeedbackText(sub.feedback || "");
                          }}
                          className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-xs ${
                            isSel ? 'bg-blue-50/80 border-[#027FFF] shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                              {sub.subject}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              sub.status === 'GRADED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {sub.status === 'GRADED' ? 'Graded' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{sub.studentName}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{sub.taskTitle}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Submission Workspace & Feedback Form */}
                {selectedSub && (
                  <div className="lg:col-span-8 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#027FFF] bg-blue-50 px-2.5 py-0.5 rounded-full">
                          {selectedSub.courseTitle}
                        </span>
                        <span className="text-xs text-slate-400">{selectedSub.submittedAt}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-2">{selectedSub.taskTitle}</h3>
                      <p className="text-xs text-slate-500 font-medium">Student: <strong>{selectedSub.studentName}</strong> ({selectedSub.studentEmail})</p>
                    </div>

                    {/* Student Solution Box */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Student Solution / Code:</span>
                      <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {selectedSub.submissionText}
                      </div>
                    </div>

                    {/* Score & Grading Slider */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase">Award Score Percentage:</span>
                        <span className="text-2xl font-black text-[#027FFF]">{gradeScore}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="1"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#027FFF]"
                      />

                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-bold text-slate-700 block">Teacher Written Feedback:</label>
                        <textarea
                          rows={3}
                          placeholder="Provide constructive feedback, praise strong logic, and suggest improvements..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#027FFF]"
                        />
                      </div>

                      <button
                        onClick={handlePublishGrade}
                        className="w-full py-3 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        Publish Grade &amp; Send Feedback to Student
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LIVE CLASS HOST */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Virtual Classroom Schedules</h2>
                  <p className="text-xs text-slate-500">Host live video masterclasses, conduct interactive code walkthroughs, and take attendance</p>
                </div>

                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Schedule New Session
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sessions.map((sess) => (
                  <div key={sess.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 uppercase">
                        {sess.subject}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> {sess.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{sess.title}</h3>

                    <div className="space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {sess.scheduledTime}
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {sess.participantsCount} Registered Students
                      </p>
                    </div>

                    <Link
                      href="/dashboard/live"
                      className="w-full py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs text-center block transition-all shadow-xs"
                    >
                      Launch Video Classroom
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STUDENT ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Enrolled Student Directory</h2>
                  <p className="text-xs text-slate-500">Monitor course progress, pinpoint topic weaknesses, and send targeted drill recommendations</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by student or course..."
                    value={searchRoster}
                    onChange={(e) => setSearchRoster(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#027FFF]"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Student</th>
                      <th className="p-4">Enrolled Course</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4">Identified Weak Spot</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredRoster.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          <div>{stu.name}</div>
                          <span className="text-[11px] text-slate-400 font-normal">{stu.email}</span>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{stu.enrolledCourse}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#027FFF] rounded-full" style={{ width: `${stu.progressPct}%` }} />
                            </div>
                            <span className="font-bold text-slate-700">{stu.progressPct}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                            {stu.weakArea}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => toast.success("Targeted Drill Assigned! 🎯", `Assigned custom revision drill on "${stu.weakArea}" to ${stu.name}.`)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#027FFF] hover:bg-[#027FFF] hover:text-white font-bold text-[11px] transition-all cursor-pointer"
                          >
                            Assign Drill
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: AI QUIZ CREATOR */}
          {activeTab === 'ai_quizzes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">AI Test Author &amp; Question Bank Creator</h2>
                <p className="text-xs text-slate-500">Generate verified multiple-choice questions for any topic and publish directly to course tests</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Select Subject:</label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="Computer Science & Python">Computer Science &amp; Python</option>
                      <option value="English & Languages">English &amp; Communication</option>
                      <option value="Mathematics & Calculus">Mathematics &amp; Problem Solving</option>
                      <option value="General Science">General Science &amp; Physics</option>
                      <option value="Business & Finance">Business &amp; Finance</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Topic / Lesson Name:</label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#027FFF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Number of Questions:</label>
                    <select
                      value={aiNumQ}
                      onChange={(e) => setAiNumQ(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                    >
                      <option value={3}>3 Questions (Quick Drill)</option>
                      <option value={5}>5 Questions (Standard Quiz)</option>
                      <option value={10}>10 Questions (Full Test)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateTeacherQuiz}
                    disabled={isGeneratingAi}
                    className="w-full py-3.5 rounded-2xl bg-[#027FFF] hover:bg-blue-600 text-white font-black text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    {isGeneratingAi ? "Generating AI Questions..." : "Generate AI Question Bank"}
                  </button>
                </div>

                <div className="lg:col-span-7 space-y-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Generated Question Bank Preview:
                  </span>

                  {generatedQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {generatedQuestions.map((q, idx) => (
                        <div key={q.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                          <span className="text-xs font-black text-[#027FFF] uppercase">Question {idx + 1}</span>
                          <h4 className="text-sm font-bold text-slate-900">{q.prompt}</h4>
                          <div className="space-y-1.5">
                            {q.options.map((opt: string, optIdx: number) => (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                                  optIdx === q.correct ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="w-5 h-5 rounded-md bg-white text-center font-bold text-[10px] flex items-center justify-center border border-slate-200">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => toast.success("Saved to Course Test Bank! 📚", `Questions successfully appended to "${aiTopic}" syllabus.`)}
                        className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        Publish All to Course Exam Bank
                      </button>
                    </div>
                  ) : (
                    <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
                      <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">No questions generated yet</p>
                      <p className="text-[11px] text-slate-400">Configure your topic on the left and click "Generate AI Question Bank".</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* CREATE COURSE MODAL */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Create New Course</h3>
              <button onClick={() => setShowCreateCourseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Course Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Python Programming: From Zero to Hero"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#027FFF]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Academic Subject Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Computer Science">💻 Computer Science</option>
                  <option value="English & Languages">📖 English &amp; Languages</option>
                  <option value="Mathematics">📐 Mathematics</option>
                  <option value="Science">🔬 Science</option>
                  <option value="Business & Finance">📊 Business &amp; Finance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Course Description:</label>
                <textarea
                  rows={3}
                  placeholder="Summarize course outcomes and target learning goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#027FFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE LIVE SESSION MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">Schedule Virtual Classroom</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSession} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Session Topic Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Masterclass: Dynamic Programming in Python"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#027FFF]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Subject Track:</label>
                <select
                  value={sessionSubject}
                  onChange={(e) => setSessionSubject(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Date &amp; Time:</label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow at 3:00 PM"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#027FFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#027FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
