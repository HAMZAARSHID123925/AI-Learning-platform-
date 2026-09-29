"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, Video, AlertCircle, BookOpen, Search, 
  ChevronRight, ArrowRight, BrainCircuit, CheckCircle, Clock,
  FileCheck2, Sliders, MessageSquare, Award, Sparkles, Send,
  Play, Pause, RotateCcw, CheckCircle2, ChevronDown, Check,
  BarChart3, Edit3, X, UploadCloud, Plus, Calendar, Star, Filter, TrendingUp,
  GraduationCap, Layers, ShieldCheck
} from 'lucide-react';
import TeacherSidebar from '@/components/TeacherSidebar';
import { toast } from '@/components/ToastProvider';
import { courses as platformCourses } from '@/data/courses';

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

const INITIAL_COURSES: CourseItem[] = platformCourses.slice(0, 8).map((pc) => ({
  id: pc.id,
  title: `${pc.title} (Grade ${pc.grade})`,
  category: pc.subject === 'cs' ? 'Computer Science' : pc.subject === 'math' ? 'Mathematics' : pc.subject === 'science' ? 'Science' : 'English',
  description: `Official Grade ${pc.grade} curriculum covering ${pc.moduleTitles?.join(', ') || 'core principles and problem solving'}.`,
  modulesCount: pc.moduleTitles?.length || 4,
  studentsCount: 35 + pc.lessonCount * 2,
  status: 'published',
  createdDate: 'Academic Year 2026'
}));

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: "sub-1",
    studentName: "Hamza Arshid",
    studentEmail: "student@penpage.academy",
    courseTitle: "Digital Basics (Grade 3)",
    subject: "Computer Science",
    taskTitle: "Module 2: Python Function for Recursive Loops",
    submittedAt: "Today, 2:15 PM",
    status: "PENDING_REVIEW",
    submissionText: `def fibonacci_sequence(n):\n    if n <= 0: return []\n    if n == 1: return [0]\n    seq = [0, 1]\n    for i in range(2, n):\n        seq.append(seq[-1] + seq[-2])\n    return seq\n\n# Verification test\nprint(fibonacci_sequence(8)) # [0, 1, 1, 2, 3, 5, 8, 13]`
  },
  {
    id: "sub-2",
    studentName: "Sarah Chen",
    studentEmail: "sarah.c@utoronto.ca",
    courseTitle: "Reading Skills & Story Analysis (Grade 3)",
    subject: "English",
    taskTitle: "Module 1: Descriptive Characterization & Main Idea",
    submittedAt: "Today, 11:30 AM",
    status: "PENDING_REVIEW",
    submissionText: `The protagonist exhibits profound internal conflict as the ecosystem surrounding their village begins to shift. Through rich descriptive sensory clues, the narrative establishes that environmental preservation requires immediate community collaboration.`
  },
  {
    id: "sub-3",
    studentName: "Marcus Sterling",
    studentEmail: "marcus.s@outlook.com",
    courseTitle: "Fractions & Problem Solving (Grade 3)",
    subject: "Mathematics",
    taskTitle: "Problem Set 4: Unlike Denominators",
    submittedAt: "Yesterday, 4:50 PM",
    status: "GRADED",
    score: 95,
    grade: "Grade A+",
    feedback: "Exceptional mastery of least common multiples and simplifying fractions.",
    submissionText: `Step 1: Find LCM of 4 and 6 = 12\nStep 2: 3/4 = 9/12\nStep 3: 1/6 = 2/12\nStep 4: 9/12 + 2/12 = 11/12 (Simplified form)`
  }
];

const INITIAL_ROSTER: StudentRosterItem[] = [
  { id: "stu-1", name: "Hamza Arshid", email: "student@penpage.academy", enrolledCourse: "Digital Basics (Grade 3)", progressPct: 88, weakArea: "Recursive Logic", status: "Active", joinedDate: "Sep 01, 2026" },
  { id: "stu-2", name: "Sarah Chen", email: "sarah.c@utoronto.ca", enrolledCourse: "Reading Skills (Grade 3)", progressPct: 92, weakArea: "Inference Questions", status: "Active", joinedDate: "Aug 28, 2026" },
  { id: "stu-3", name: "Marcus Sterling", email: "marcus.s@outlook.com", enrolledCourse: "Fractions (Grade 3)", progressPct: 74, weakArea: "Word Problems", status: "Needs Attention", joinedDate: "Sep 04, 2026" },
  { id: "stu-4", name: "Elena Rostova", email: "elena.r@gmail.com", enrolledCourse: "Plants & Animals (Grade 3)", progressPct: 95, weakArea: "Food Chains", status: "Active", joinedDate: "Aug 15, 2026" },
  { id: "stu-5", name: "Liam O'Connor", email: "liam.oc@outlook.com", enrolledCourse: "Adding & Subtracting (Grade 2)", progressPct: 62, weakArea: "Carryover Arithmetic", status: "Needs Attention", joinedDate: "Sep 10, 2026" }
];

const INITIAL_SESSIONS: LiveSession[] = [
  { id: "ls-1", title: "Live Code Review: Data Structures & Hash Maps", subject: "Computer Science", scheduledTime: "Today at 4:00 PM", participantsCount: 28, status: "UPCOMING" },
  { id: "ls-2", title: "Interactive Workshop: Academic Essay Structuring", subject: "English", scheduledTime: "Tomorrow at 11:00 AM", participantsCount: 34, status: "UPCOMING" },
  { id: "ls-3", title: "Calculus & Fractions Problem Solving Clinic", subject: "Mathematics", scheduledTime: "Friday at 2:00 PM", participantsCount: 22, status: "UPCOMING" }
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

  // Submissions & grading state
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(INITIAL_SUBMISSIONS[0]);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [feedbackText, setFeedbackText] = useState<string>("");

  // Live session state
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

  const getSubjectBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'computer science':
      case 'cs':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'mathematics':
      case 'math':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'science':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'english':
      case 'english & languages':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="flex h-screen bg-canvas text-ink font-sans overflow-hidden">
      <TeacherSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Header - Aligned with min-h-24 and Admin Styling */}
        <header className="min-h-24 py-5 px-6 md:px-10 border-b border-line bg-white/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="w-6 h-6 text-emerald-700" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
                  Teacher &amp; Faculty Studio
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-canvas border border-line text-muted uppercase tracking-wider">
                  Academic Portal
                </span>
              </div>
              <p className="text-xs text-muted font-medium">
                PPAcademia Course Authoring, Homework Grading, Live Classes &amp; Student Performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> New Course
            </button>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2.5 rounded-xl bg-canvas hover:bg-slate-200/60 text-ink font-semibold text-xs border border-line flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Video className="w-4 h-4 text-primary" /> Schedule Live
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Executive Faculty Spotlight Banner */}
              <div className="rounded-3xl bg-white border border-line p-7 md:p-8 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/70 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-primary-soft/50 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-emerald-200">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Faculty Workspace
                      </span>
                      <span className="text-xs text-muted font-medium">Academic Year 2026</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                      Welcome to your Instructor Studio
                    </h2>
                    <p className="text-sm text-muted max-w-2xl leading-relaxed">
                      Review live student homework submissions, host interactive masterclasses, design modular course curriculums, and deploy targeted AI assessments across all academic tracks.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="px-3.5 py-1.5 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>127 Active Learners</span>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{pendingSubmissions.length} Pending Homework Tasks</span>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{courses.length} Active Tracks</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-56">
                    <button
                      onClick={() => setShowCreateCourseModal(true)}
                      className="w-full py-3.5 px-5 rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-sm shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Create New Course
                    </button>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="w-full py-3 px-5 rounded-2xl bg-canvas hover:bg-slate-200/60 text-ink font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-line cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-emerald-600" /> Schedule Live Class
                    </button>
                  </div>
                </div>
              </div>

              {/* Bento KPI Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-primary/40 transition-all space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted font-bold uppercase tracking-wider">Total Students</span>
                    <span className="p-2.5 rounded-xl bg-primary-soft text-primary group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-ink tracking-tight">127</p>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +18 enrolled this week
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-amber-300 transition-all space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted font-bold uppercase tracking-wider">Pending Grading</span>
                    <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-ink tracking-tight">{pendingSubmissions.length}</p>
                  <p className="text-xs text-amber-700 font-semibold">Action required today</p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-emerald-300 transition-all space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted font-bold uppercase tracking-wider">Published Courses</span>
                    <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-ink tracking-tight">{courses.length}</p>
                  <p className="text-xs text-muted font-medium">Grades 1–5 (Math, CS, English, Sci)</p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-purple-300 transition-all space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted font-bold uppercase tracking-wider">Live Broadcasts</span>
                    <span className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-105 transition-transform">
                      <Video className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-ink tracking-tight">{sessions.length}</p>
                  <p className="text-xs text-purple-700 font-semibold">Next session today at 4:00 PM</p>
                </div>
              </div>

              {/* Next Live Masterclass Spotlight Bar */}
              <div className="p-6 md:p-7 rounded-3xl bg-white border border-line shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Upcoming Masterclass
                    </span>
                    <span className="text-xs text-muted font-semibold">28 Students Registered</span>
                  </div>
                  <h3 className="text-base font-extrabold text-ink">Live Code Review: Data Structures &amp; Hash Maps</h3>
                  <p className="text-xs text-muted">Scheduled: Today at 4:00 PM • Duration: 60 mins • Instructor: Dr. Alan Turing</p>
                </div>
                <Link
                  href="/dashboard/live"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Video className="w-4 h-4" /> Launch Video Classroom &rarr;
                </Link>
              </div>

              {/* Two-Column Deck: Fast Grading Desk & Quick Tool Navigator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Fast Grading Stream (7 Cols) */}
                <div className="lg:col-span-7 p-6 md:p-7 rounded-3xl bg-white border border-line shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-ink">Awaiting Review ({pendingSubmissions.length})</h3>
                        <p className="text-[11px] text-muted">Student homework ready for evaluation</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('grading')}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Grading Studio &rarr;
                    </button>
                  </div>

                  <div className="space-y-3">
                    {pendingSubmissions.map((sub) => (
                      <div key={sub.id} className="p-4 rounded-2xl bg-canvas border border-line hover:border-slate-300 transition-all flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ink">{sub.studentName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              Needs Grade
                            </span>
                          </div>
                          <p className="text-xs text-muted font-medium">{sub.taskTitle}</p>
                          <p className="text-[10px] text-subtle font-mono">Submitted {sub.submittedAt}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setActiveTab('grading');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-strong text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer transition-all"
                        >
                          Grade Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Faculty Quick Tool Matrix (5 Cols) */}
                <div className="lg:col-span-5 p-6 md:p-7 rounded-3xl bg-white border border-line shadow-xs space-y-4">
                  <div className="border-b border-line pb-3.5">
                    <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Teacher Control Matrix
                    </h3>
                    <p className="text-[11px] text-muted">Direct shortcuts to faculty teaching modules</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="p-4 rounded-2xl bg-canvas hover:bg-emerald-50 border border-line hover:border-emerald-300 text-left transition-all group cursor-pointer"
                    >
                      <BookOpen className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-ink">Course Studio</p>
                      <p className="text-[10px] text-muted mt-0.5">Lessons &amp; Syllabus</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('ai_quizzes')}
                      className="p-4 rounded-2xl bg-canvas hover:bg-purple-50 border border-line hover:border-purple-300 text-left transition-all group cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-ink">AI Quiz Bank</p>
                      <p className="text-[10px] text-muted mt-0.5">Generate Questions</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('roster')}
                      className="p-4 rounded-2xl bg-canvas hover:bg-amber-50 border border-line hover:border-amber-300 text-left transition-all group cursor-pointer"
                    >
                      <Users className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-ink">Student Roster</p>
                      <p className="text-[10px] text-muted mt-0.5">Weak Spots &amp; CRM</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('classes')}
                      className="p-4 rounded-2xl bg-canvas hover:bg-primary-soft/50 border border-line hover:border-primary/40 text-left transition-all group cursor-pointer"
                    >
                      <Video className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-ink">Live Schedule</p>
                      <p className="text-[10px] text-muted mt-0.5">Virtual Classrooms</p>
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
                  <h2 className="text-lg font-extrabold text-ink tracking-tight">My Authoring Courses</h2>
                  <p className="text-xs text-muted">Create, edit syllabus, and manage published courses across all academic subjects</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex bg-white p-1 rounded-xl border border-line shadow-xs">
                    {(['all', 'published', 'draft'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setCourseFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                          courseFilter === f ? 'bg-ink text-white shadow-xs' : 'text-muted hover:text-ink'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowCreateCourseModal(true)}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" /> New Course
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCourses.map((c) => (
                  <div key={c.id} className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-slate-300 transition-all space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getSubjectBadge(c.category)}`}>
                        {c.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                        c.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-canvas text-muted border-line'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-ink leading-snug">{c.title}</h3>
                      <p className="text-xs text-muted mt-1 line-clamp-2">{c.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-line text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-subtle" />
                        {c.modulesCount} Modules
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-subtle" />
                        {c.studentsCount} Students Enrolled
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/dashboard/courses"
                        className="flex-1 py-2 rounded-xl bg-canvas hover:bg-slate-200/60 text-ink font-semibold text-xs text-center transition-colors border border-line"
                      >
                        Preview Curriculum &rarr;
                      </Link>
                      <button
                        onClick={() => {
                          setCourses(prev => prev.map(item => item.id === c.id ? { ...item, status: item.status === 'published' ? 'draft' : 'published' } : item));
                          toast.success("Status Updated", `"${c.title}" is now ${c.status === 'published' ? 'Draft' : 'Published'}.`);
                        }}
                        className="px-3 py-2 rounded-xl border border-line text-muted hover:text-ink font-semibold text-xs cursor-pointer hover:bg-canvas transition-colors"
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
                <h2 className="text-lg font-extrabold text-ink tracking-tight">Student Assignment Grading Studio</h2>
                <p className="text-xs text-muted">Review student homework submissions, assign score percentages, and write helpful feedback</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Submissions Queue */}
                <div className="lg:col-span-4 space-y-3">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider block">
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
                            isSel ? 'bg-primary-soft border-primary/40 shadow-xs' : 'bg-white border-line text-ink hover:bg-canvas'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-canvas border border-line text-muted uppercase">
                              {sub.subject}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              sub.status === 'GRADED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {sub.status === 'GRADED' ? 'Graded' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-ink line-clamp-1">{sub.studentName}</p>
                          <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{sub.taskTitle}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Submission Workspace & Feedback Form */}
                {selectedSub && (
                  <div className="lg:col-span-8 p-6 md:p-8 rounded-3xl bg-white border border-line shadow-xs space-y-6">
                    <div className="border-b border-line pb-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary bg-primary-soft px-3 py-1 rounded-full border border-primary/20">
                          {selectedSub.courseTitle}
                        </span>
                        <span className="text-xs text-subtle">{selectedSub.submittedAt}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-ink mt-2">{selectedSub.taskTitle}</h3>
                      <p className="text-xs text-muted font-medium">Student: <strong className="text-ink">{selectedSub.studentName}</strong> ({selectedSub.studentEmail})</p>
                    </div>

                    {/* Student Solution Box */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-muted uppercase tracking-wider block">Student Solution / Code:</span>
                      <div className="p-4 rounded-2xl bg-[#181A20] text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-zinc-800">
                        {selectedSub.submissionText}
                      </div>
                    </div>

                    {/* Score & Grading Slider */}
                    <div className="p-5 rounded-2xl bg-canvas border border-line space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink uppercase">Award Score Percentage:</span>
                        <span className="text-2xl font-extrabold text-primary">{gradeScore}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="1"
                        value={gradeScore}
                        onChange={(e) => setGradeScore(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />

                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-bold text-ink block">Teacher Written Feedback:</label>
                        <textarea
                          rows={3}
                          placeholder="Provide constructive feedback, praise strong logic, and suggest improvements..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-white border border-line text-xs text-ink focus:outline-none focus:border-primary"
                        />
                      </div>

                      <button
                        onClick={handlePublishGrade}
                        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
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
                  <h2 className="text-lg font-extrabold text-ink tracking-tight">Virtual Classroom Schedules</h2>
                  <p className="text-xs text-muted">Host live video masterclasses, conduct interactive code walkthroughs, and take attendance</p>
                </div>

                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" /> Schedule New Session
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {sessions.map((sess) => (
                  <div key={sess.id} className="p-6 rounded-3xl bg-white border border-line shadow-xs space-y-4 hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getSubjectBadge(sess.subject)}`}>
                        {sess.subject}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {sess.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-ink leading-snug">{sess.title}</h3>

                    <div className="space-y-1 text-xs text-muted">
                      <p className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-subtle" /> {sess.scheduledTime}
                      </p>
                      <p className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-subtle" /> {sess.participantsCount} Registered Students
                      </p>
                    </div>

                    <Link
                      href="/dashboard/live"
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs text-center block transition-all shadow-xs"
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
                  <h2 className="text-lg font-extrabold text-ink tracking-tight">Enrolled Student Directory</h2>
                  <p className="text-xs text-muted">Monitor course progress, pinpoint topic weaknesses, and send targeted drill recommendations</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by student or course..."
                    value={searchRoster}
                    onChange={(e) => setSearchRoster(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-line text-xs text-ink placeholder-subtle focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-canvas/60 text-[11px] font-bold text-muted uppercase tracking-wider">
                      <th className="p-4">Student</th>
                      <th className="p-4">Enrolled Course</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4">Identified Weak Spot</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60 text-xs">
                    {filteredRoster.map((stu) => (
                      <tr key={stu.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-canvas border border-line font-extrabold text-ink flex items-center justify-center text-xs shrink-0">
                              {stu.name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-ink">{stu.name}</div>
                              <span className="text-[11px] text-subtle font-normal">{stu.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted font-medium">{stu.enrolledCourse}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-canvas border border-line rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${stu.progressPct}%` }} />
                            </div>
                            <span className="font-bold text-ink">{stu.progressPct}%</span>
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
                            className="px-3 py-1.5 rounded-xl bg-canvas hover:bg-primary hover:text-white border border-line text-ink font-semibold text-[11px] transition-all cursor-pointer"
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
                <h2 className="text-lg font-extrabold text-ink tracking-tight">AI Test Author &amp; Question Bank Creator</h2>
                <p className="text-xs text-muted">Generate verified multiple-choice questions for any topic and publish directly to course tests</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-line shadow-xs space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink block">Select Subject:</label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink focus:outline-none"
                    >
                      <option value="Computer Science & Python">Computer Science &amp; Python</option>
                      <option value="English & Languages">English &amp; Communication</option>
                      <option value="Mathematics & Calculus">Mathematics &amp; Problem Solving</option>
                      <option value="General Science">General Science &amp; Physics</option>
                      <option value="Business & Finance">Business &amp; Finance</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink block">Topic / Lesson Name:</label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-medium text-ink focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink block">Number of Questions:</label>
                    <select
                      value={aiNumQ}
                      onChange={(e) => setAiNumQ(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink focus:outline-none"
                    >
                      <option value={3}>3 Questions (Quick Drill)</option>
                      <option value={5}>5 Questions (Standard Quiz)</option>
                      <option value={10}>10 Questions (Full Test)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateTeacherQuiz}
                    disabled={isGeneratingAi}
                    className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    {isGeneratingAi ? "Generating AI Questions..." : "Generate AI Question Bank"}
                  </button>
                </div>

                <div className="lg:col-span-7 space-y-3">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider block">
                    Generated Question Bank Preview:
                  </span>

                  {generatedQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {generatedQuestions.map((q, idx) => (
                        <div key={q.id} className="p-5 rounded-2xl bg-white border border-line shadow-xs space-y-3">
                          <span className="text-xs font-bold text-primary uppercase">Question {idx + 1}</span>
                          <h4 className="text-sm font-bold text-ink">{q.prompt}</h4>
                          <div className="space-y-1.5">
                            {q.options.map((opt: string, optIdx: number) => (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                                  optIdx === q.correct ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-canvas border-line text-ink'
                                }`}
                              >
                                <span className="w-5 h-5 rounded-md bg-white text-center font-bold text-[10px] flex items-center justify-center border border-line">
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
                        className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                      >
                        Publish All to Course Exam Bank
                      </button>
                    </div>
                  ) : (
                    <div className="p-10 rounded-3xl bg-white border border-line text-center space-y-2">
                      <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                      <p className="text-xs font-bold text-ink">No questions generated yet</p>
                      <p className="text-[11px] text-muted">Configure your topic on the left and click "Generate AI Question Bank".</p>
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in duration-200 border border-line">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-ink">Create New Course</h3>
              <button onClick={() => setShowCreateCourseModal(false)} className="text-subtle hover:text-ink p-1 rounded-lg hover:bg-canvas">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Course Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Python Programming: From Zero to Hero"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-medium text-ink focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Academic Subject Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink focus:outline-none"
                >
                  <option value="Computer Science">💻 Computer Science</option>
                  <option value="English & Languages">📖 English &amp; Languages</option>
                  <option value="Mathematics">📐 Mathematics</option>
                  <option value="Science">🔬 Science</option>
                  <option value="Business & Finance">📊 Business &amp; Finance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Course Description:</label>
                <textarea
                  rows={3}
                  placeholder="Summarize course outcomes and target learning goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-line text-muted hover:text-ink font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in duration-200 border border-line">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-ink">Schedule Virtual Classroom</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-subtle hover:text-ink p-1 rounded-lg hover:bg-canvas">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSession} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Session Topic Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Masterclass: Dynamic Programming in Python"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-medium text-ink focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Subject Track:</label>
                <select
                  value={sessionSubject}
                  onChange={(e) => setSessionSubject(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink focus:outline-none"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Date &amp; Time:</label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow at 3:00 PM"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-medium text-ink focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-line text-muted hover:text-ink font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs"
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
