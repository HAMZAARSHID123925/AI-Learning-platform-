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

const INITIAL_COURSES: CourseItem[] = platformCourses.map((pc) => ({
  id: pc.id,
  title: `${pc.title} (Grade ${pc.grade})`,
  category: pc.subject === 'cs' ? 'Computer Science' : pc.subject === 'math' ? 'Mathematics' : pc.subject === 'science' ? 'Science' : 'English',
  description: `Official Grade ${pc.grade} curriculum covering ${pc.moduleTitles?.join(', ') || 'foundational concepts and exercises'}.`,
  modulesCount: pc.moduleTitles?.length || 3,
  studentsCount: 22 + pc.lessonCount * 2,
  status: 'published',
  createdDate: 'Academic Year 2026'
}));

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: "sub-1",
    studentName: "Alex Johnson",
    studentEmail: "alex.j@penpage.academy",
    courseTitle: "Fractions & Problem Solving (Grade 3)",
    subject: "Mathematics",
    taskTitle: "Problem Set 2: Identifying Parts of a Whole & Number Lines",
    submittedAt: "Today, 1:40 PM",
    status: "PENDING_REVIEW",
    submissionText: `Question 1: If a pizza has 8 slices and I eat 3 slices, the fraction eaten is 3/8.\nQuestion 2: 2/4 is equal to 1/2 because both represent half of the circle.\nQuestion 3: On the 0 to 1 number line, 3/4 is located three tick marks past zero when divided into quarters.`
  },
  {
    id: "sub-2",
    studentName: "Emma Watson",
    studentEmail: "emma.w@penpage.academy",
    courseTitle: "Reading Skills & Stories (Grade 3)",
    subject: "English",
    taskTitle: "Story Analysis: Finding the Main Idea & Supporting Clues",
    submittedAt: "Today, 11:15 AM",
    status: "PENDING_REVIEW",
    submissionText: `The main idea of the story is that working together helps save the community garden. The author shows this when the children bring water cans and their neighbors provide seeds. The lesson teaches teamwork and caring for nature.`
  },
  {
    id: "sub-3",
    studentName: "Liam Smith",
    studentEmail: "liam.smith@penpage.academy",
    courseTitle: "Digital Basics (Grade 3)",
    subject: "Computer Science",
    taskTitle: "Online Safety Challenge: Creating Strong Passwords",
    submittedAt: "Yesterday, 3:30 PM",
    status: "GRADED",
    score: 96,
    grade: "Grade A+",
    feedback: "Superb job! You clearly understand why passwords shouldn't include personal info and how to stay kind and safe online.",
    submissionText: `Rule 1: Never share passwords with friends, only parents or teachers.\nRule 2: Use a mix of capital letters, lowercase, and numbers.\nRule 3: Always click log out when using a shared school tablet.`
  }
];

const INITIAL_ROSTER: StudentRosterItem[] = [
  { id: "stu-1", name: "Alex Johnson", email: "alex.j@penpage.academy", enrolledCourse: "Fractions (Grade 3)", progressPct: 75, weakArea: "Equivalent Fractions", status: "Active", joinedDate: "Sep 01, 2026" },
  { id: "stu-2", name: "Emma Watson", email: "emma.w@penpage.academy", enrolledCourse: "Reading Skills (Grade 3)", progressPct: 88, weakArea: "Inference Questions", status: "Active", joinedDate: "Aug 28, 2026" },
  { id: "stu-3", name: "Liam Smith", email: "liam.smith@penpage.academy", enrolledCourse: "Digital Basics (Grade 3)", progressPct: 65, weakArea: "Typing Speed", status: "Needs Attention", joinedDate: "Sep 04, 2026" },
  { id: "stu-4", name: "Sophia Garcia", email: "sophia.g@penpage.academy", enrolledCourse: "Plants & Animals (Grade 3)", progressPct: 92, weakArea: "Food Chains", status: "Active", joinedDate: "Aug 15, 2026" },
  { id: "stu-5", name: "Noah Miller", email: "noah.m@penpage.academy", enrolledCourse: "Multiplication Facts (Grade 3)", progressPct: 58, weakArea: "7x & 8x Times Tables", status: "Needs Attention", joinedDate: "Sep 10, 2026" }
];

const INITIAL_SESSIONS: LiveSession[] = [
  { id: "ls-1", title: "Grade 3: Fractions Fun & Visual Pizza Slices 🍕", subject: "Mathematics", scheduledTime: "Today at 3:30 PM", participantsCount: 24, status: "UPCOMING" },
  { id: "ls-2", title: "Grade 3: Plant Life Cycles & Habitats Explorer 🌿", subject: "Science", scheduledTime: "Tomorrow at 10:00 AM", participantsCount: 28, status: "UPCOMING" },
  { id: "ls-3", title: "Grade 3: Creative Storytelling & Character Voices 📚", subject: "English", scheduledTime: "Thursday at 2:00 PM", participantsCount: 22, status: "UPCOMING" }
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
    <div className="flex min-h-screen bg-canvas text-ink font-sans">
      <TeacherSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 space-y-8 h-screen overflow-y-auto">

        {/* ── TOP PAGE HEADER ── */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-line/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 font-extrabold flex items-center justify-center text-lg shadow-xs border border-emerald-200/80">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">Teacher Studio</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Classroom Active
                </span>
              </div>
              <p className="text-xs text-muted font-medium mt-0.5">Academic Year 2026 • Grade 3 Faculty Instructor</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-ink font-bold text-xs border border-line flex items-center gap-2 cursor-pointer transition-all shadow-xs hover:border-slate-300"
            >
              <Video className="w-4 h-4 text-emerald-600" />
              <span>Schedule Live</span>
            </button>
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-sm shadow-primary/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Course</span>
            </button>
          </div>
        </header>

        {/* ── CONTENT BODY ── */}
        <div className="w-full space-y-8">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* ─── HERO BANNER ─── */}
              <div className="relative rounded-3xl overflow-hidden border border-emerald-900/20 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a2718] via-[#0d3321] to-[#1a4731]" />
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                <div className="relative z-10 px-8 py-8 md:px-10 md:py-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="space-y-3 flex-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                      <Sparkles className="w-3 h-3" /> Grade 3 Faculty Classroom
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Welcome back, Teacher! 👨‍🏫
                    </h2>
                    <p className="text-sm text-emerald-100/80 max-w-xl leading-relaxed">
                      You have <span className="text-white font-semibold">{pendingSubmissions.length} homework submission{pendingSubmissions.length !== 1 ? 's' : ''}</span> awaiting review and <span className="text-white font-semibold">{sessions.length} live class{sessions.length !== 1 ? 'es' : ''}</span> scheduled this week.
                    </p>
                    <div className="flex items-center gap-3 pt-1 flex-wrap">
                      <button
                        onClick={() => setActiveTab('grading')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" /> Review Homework
                      </button>
                      <button
                        onClick={() => setActiveTab('roster')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" /> My Students
                      </button>
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" /> Schedule Live
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
                    <div className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-center min-w-[110px]">
                      <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Students</p>
                      <p className="text-3xl font-extrabold text-white mt-1">{roster.length}</p>
                      <p className="text-[10px] text-emerald-300/70 font-medium mt-0.5">Enrolled</p>
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-center min-w-[110px]">
                      <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">To Grade</p>
                      <p className="text-3xl font-extrabold text-white mt-1">{pendingSubmissions.length}</p>
                      <p className="text-[10px] text-amber-300/70 font-medium mt-0.5">Pending</p>
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-center min-w-[110px]">
                      <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Live Classes</p>
                      <p className="text-3xl font-extrabold text-white mt-1">{sessions.length}</p>
                      <p className="text-[10px] text-emerald-300/70 font-medium mt-0.5">This Week</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── 3 KPI BENTO CARDS ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Students */}
                <div
                  onClick={() => setActiveTab('roster')}
                  className="group relative p-6 rounded-3xl bg-white border border-line shadow-xs cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300/70"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-blue-100/80 text-primary shadow-xs group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">Students</span>
                    </div>
                    <p className="text-4xl font-extrabold text-ink tracking-tight">{roster.length}</p>
                    <p className="text-xs text-muted font-medium mt-1.5">Enrolled in My Classes</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-primary font-bold group-hover:opacity-100 opacity-0 transition-opacity">
                      View roster <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Homework */}
                <div
                  onClick={() => setActiveTab('grading')}
                  className="group relative p-6 rounded-3xl bg-white border border-line shadow-xs cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300/70"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-amber-100/80 text-amber-700 shadow-xs group-hover:scale-110 transition-transform">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      {pendingSubmissions.length > 0 && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">Pending</span>
                      )}
                    </div>
                    <p className="text-4xl font-extrabold text-ink tracking-tight">{pendingSubmissions.length}</p>
                    <p className="text-xs text-muted font-medium mt-1.5">Homework to Grade</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-amber-700 font-bold group-hover:opacity-100 opacity-0 transition-opacity">
                      Go to grading <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Live Sessions */}
                <div
                  onClick={() => setShowScheduleModal(true)}
                  className="group relative p-6 rounded-3xl bg-white border border-line shadow-xs cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300/70"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-emerald-100/80 text-emerald-700 shadow-xs group-hover:scale-110 transition-transform">
                        <Video className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Live</span>
                    </div>
                    <p className="text-4xl font-extrabold text-ink tracking-tight">{sessions.length}</p>
                    <p className="text-xs text-muted font-medium mt-1.5">Scheduled Live Classes</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-emerald-700 font-bold group-hover:opacity-100 opacity-0 transition-opacity">
                      Schedule new <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── NEXT LIVE SESSION SPOTLIGHT ─── */}
              {sessions[0] && (
                <div className="relative rounded-3xl overflow-hidden border border-line shadow-xs bg-white">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/60 to-white pointer-events-none" />
                  <div className="relative z-10 p-6 md:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Next Live Class
                        </span>
                        <span className="text-xs text-muted font-semibold">{sessions[0].participantsCount} Students</span>
                      </div>
                      <h3 className="text-base font-extrabold text-ink">{sessions[0].title}</h3>
                      <p className="text-xs text-muted">{sessions[0].scheduledTime} · {sessions[0].subject}</p>
                    </div>
                    <Link
                      href="/dashboard/live"
                      className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-sm shadow-primary/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Video className="w-4 h-4" /> Start Classroom →
                    </Link>
                  </div>
                </div>
              )}

              {/* ─── TWO-COLUMN COMMAND HUB ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                {/* Left 7: Pending Homework Stream */}
                <div className="lg:col-span-7 p-6 md:p-7 rounded-3xl bg-white border border-line shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 text-amber-700 flex items-center justify-center border border-amber-200/80 shadow-xs">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-ink">Awaiting Review</h3>
                        <p className="text-[11px] text-muted">{pendingSubmissions.length} student submission{pendingSubmissions.length !== 1 ? 's' : ''} to evaluate</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('grading')}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      Grading Studio <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {pendingSubmissions.length === 0 && (
                      <div className="py-8 text-center">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm font-bold text-ink">All caught up!</p>
                        <p className="text-xs text-muted mt-0.5">No pending submissions right now.</p>
                      </div>
                    )}
                    {pendingSubmissions.map((sub) => (
                      <div key={sub.id} className="p-4 rounded-2xl bg-canvas border border-line hover:border-slate-300 hover:shadow-xs transition-all flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 text-amber-800 font-black flex items-center justify-center text-sm border border-amber-200/70 shrink-0">
                            {sub.studentName[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-ink">{sub.studentName}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Needs Grade</span>
                            </div>
                            <p className="text-xs text-muted font-medium truncate mt-0.5">{sub.taskTitle}</p>
                            <p className="text-[10px] text-muted/70 font-mono mt-0.5">Submitted {sub.submittedAt}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelectedSub(sub); setActiveTab('grading'); }}
                          className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-strong text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer transition-all"
                        >
                          Grade Now
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Recent Graded */}
                  {submissions.filter(s => s.status === 'GRADED').length > 0 && (
                    <div className="mt-4 pt-4 border-t border-line">
                      <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-3">Recently Graded</p>
                      {submissions.filter(s => s.status === 'GRADED').map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-canvas transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs border border-emerald-200/70">
                              {sub.studentName[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-ink">{sub.studentName}</p>
                              <p className="text-[10px] text-muted truncate max-w-[200px]">{sub.taskTitle}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-extrabold text-emerald-700">{sub.score}%</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{sub.grade}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right 5: Student Roster + Quick Nav */}
                <div className="lg:col-span-5 space-y-5">

                  {/* My Students Roster Strip */}
                  <div className="p-6 rounded-3xl bg-white border border-line shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-primary flex items-center justify-center border border-blue-200/80 shadow-xs">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-ink">My Students</h3>
                          <p className="text-[11px] text-muted">{roster.length} enrolled in your classes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('roster')}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                      >
                        Full Roster <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {roster.slice(0, 4).map((stu) => (
                        <div key={stu.id} className="flex items-center justify-between p-3 rounded-2xl bg-canvas border border-line hover:border-slate-300 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-800 font-bold flex items-center justify-center text-xs border border-blue-200/70 shrink-0">
                              {stu.name[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-ink truncate">{stu.name}</p>
                              <p className="text-[10px] text-muted truncate">{stu.enrolledCourse}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${stu.progressPct >= 80 ? 'bg-emerald-400' : stu.progressPct >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                  style={{ width: `${stu.progressPct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-muted">{stu.progressPct}%</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stu.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              {stu.status === 'Active' ? '✓' : '!'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Nav Grid */}
                  <div className="p-6 rounded-3xl bg-white border border-line shadow-xs">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/80 shadow-xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-ink">Quick Actions</h3>
                        <p className="text-[11px] text-muted">Shortcuts to your classroom tools</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveTab('roster')}
                        className="p-4 rounded-2xl bg-canvas hover:bg-blue-50 border border-line hover:border-blue-200 text-left transition-all group cursor-pointer"
                      >
                        <Users className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-ink">My Students</p>
                        <p className="text-[10px] text-muted mt-0.5">{roster.length} Enrolled</p>
                      </button>

                      <button
                        onClick={() => setActiveTab('grading')}
                        className="p-4 rounded-2xl bg-canvas hover:bg-amber-50 border border-line hover:border-amber-200 text-left transition-all group cursor-pointer"
                      >
                        <FileCheck2 className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-ink">Homework</p>
                        <p className="text-[10px] text-muted mt-0.5">{pendingSubmissions.length} To Review</p>
                      </button>

                      <Link
                        href="/dashboard/live"
                        className="p-4 rounded-2xl bg-canvas hover:bg-emerald-50 border border-line hover:border-emerald-200 text-left transition-all group cursor-pointer"
                      >
                        <Video className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-ink">Live Class</p>
                        <p className="text-[10px] text-muted mt-0.5">Start Session</p>
                      </Link>

                      <Link
                        href="/dashboard/courses"
                        className="p-4 rounded-2xl bg-canvas hover:bg-purple-50 border border-line hover:border-purple-200 text-left transition-all group cursor-pointer"
                      >
                        <BookOpen className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-ink">Curriculum</p>
                        <p className="text-[10px] text-muted mt-0.5">Classes 1–5</p>
                      </Link>
                    </div>
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
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-amber-500" />
                    Grading Studio
                  </h2>
                  <p className="text-xs text-muted mt-0.5">Review submissions, award scores, and publish feedback to students</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    {pendingSubmissions.length} Pending
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {submissions.filter(s => s.status === 'GRADED').length} Graded
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left: Submissions Queue */}
                <div className="lg:col-span-4 space-y-3">
                  <p className="text-[11px] font-black text-muted uppercase tracking-widest px-1">
                    Submissions Queue ({submissions.length})
                  </p>
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
                          className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'bg-primary-soft border-primary/40 shadow-sm'
                              : 'bg-white border-line hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                              sub.subject === 'Mathematics' ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : sub.subject === 'English' ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : sub.subject === 'Computer Science' ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {sub.subject}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              sub.status === 'GRADED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {sub.status === 'GRADED' ? 'Graded' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl font-black flex items-center justify-center text-xs shrink-0 ${
                              isSel ? 'bg-primary text-white' : 'bg-canvas border border-line text-ink'
                            }`}>
                              {sub.studentName[0]}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-bold truncate ${isSel ? 'text-primary' : 'text-ink'}`}>{sub.studentName}</p>
                              <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{sub.taskTitle}</p>
                            </div>
                          </div>
                          {sub.status === 'GRADED' && sub.score !== undefined && (
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${sub.score}%` }} />
                              </div>
                              <span className="text-[10px] font-extrabold text-emerald-700">{sub.score}%</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Submission Workspace */}
                {selectedSub && (
                  <div className="lg:col-span-8 space-y-5">
                    {/* Submission Header Card */}
                    <div className="p-6 rounded-3xl bg-white border border-line shadow-xs">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-primary bg-primary-soft px-3 py-1 rounded-full border border-primary/20">
                              {selectedSub.courseTitle}
                            </span>
                            <span className="text-xs text-muted">{selectedSub.submittedAt}</span>
                          </div>
                          <h3 className="text-lg font-extrabold text-ink leading-snug">{selectedSub.taskTitle}</h3>
                          <p className="text-xs text-muted">
                            Student: <strong className="text-ink">{selectedSub.studentName}</strong>
                            <span className="font-mono ml-1 opacity-70">({selectedSub.studentEmail})</span>
                          </p>
                        </div>
                        {selectedSub.status === 'GRADED' && (
                          <div className="text-center px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 shrink-0">
                            <p className="text-2xl font-extrabold text-emerald-700">{selectedSub.score}%</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{selectedSub.grade}</p>
                          </div>
                        )}
                      </div>

                      {/* Student Solution */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-black text-muted uppercase tracking-widest">Student Solution:</span>
                        <div className="p-4 rounded-2xl bg-[#0d1117] text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-zinc-800/80">
                          {selectedSub.submissionText}
                        </div>
                      </div>
                    </div>

                    {/* Grading Panel */}
                    {selectedSub.status !== 'GRADED' ? (
                      <div className="p-6 rounded-3xl bg-white border border-line shadow-xs space-y-5">
                        <div className="flex items-center gap-3 pb-4 border-b border-line">
                          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Star className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-ink">Award Score & Feedback</h4>
                            <p className="text-[11px] text-muted">Set a percentage and write personalised feedback</p>
                          </div>
                        </div>

                        {/* Score Slider */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink uppercase tracking-wide">Score Percentage</span>
                            <span className={`text-3xl font-extrabold tabular-nums ${
                              gradeScore >= 90 ? 'text-emerald-600' : gradeScore >= 75 ? 'text-primary' : gradeScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                            }`}>{gradeScore}%</span>
                          </div>
                          <div className="relative">
                            <input
                              type="range"
                              min="50"
                              max="100"
                              step="1"
                              value={gradeScore}
                              onChange={(e) => setGradeScore(parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-[10px] text-muted font-bold mt-1.5 px-0.5">
                              <span>50</span><span>60</span><span>70</span><span>80</span><span>90</span><span>100</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {[
                              { label: 'A+', min: 90, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                              { label: 'A', min: 80, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                              { label: 'B', min: 70, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                              { label: 'C', min: 50, color: 'bg-rose-50 border-rose-200 text-rose-700' },
                            ].map(g => (
                              <button
                                key={g.label}
                                onClick={() => setGradeScore(g.min)}
                                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                  gradeScore >= g.min && (g.label === 'A+' ? gradeScore >= 90 : g.label === 'A' ? gradeScore >= 80 && gradeScore < 90 : g.label === 'B' ? gradeScore >= 70 && gradeScore < 80 : gradeScore < 70)
                                    ? g.color + ' shadow-xs scale-105'
                                    : 'bg-canvas border-line text-muted hover:border-slate-300'
                                }`}
                              >
                                {g.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Feedback */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-ink block">Teacher Written Feedback</label>
                          <textarea
                            rows={4}
                            placeholder="Provide constructive feedback, praise strong logic, and suggest improvements..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="w-full p-3.5 rounded-2xl bg-canvas border border-line text-xs text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                          />
                        </div>

                        <button
                          onClick={handlePublishGrade}
                          className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold text-sm shadow-sm shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-95"
                        >
                          <CheckCircle2 className="w-4.5 h-4.5" />
                          Publish Grade & Send Feedback
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-xs space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-emerald-900">Already Graded</h4>
                            <p className="text-xs text-emerald-700">Score & feedback already published to {selectedSub.studentName}</p>
                          </div>
                          <div className="ml-auto text-center">
                            <p className="text-2xl font-extrabold text-emerald-700">{selectedSub.score}%</p>
                            <p className="text-[10px] font-bold text-emerald-600">{selectedSub.grade}</p>
                          </div>
                        </div>
                        {selectedSub.feedback && (
                          <div className="p-4 rounded-2xl bg-white/70 border border-emerald-200/60">
                            <p className="text-[11px] font-black text-emerald-700 uppercase tracking-wider mb-1.5">Published Feedback</p>
                            <p className="text-xs text-ink leading-relaxed">{selectedSub.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
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
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Enrolled Student Directory
                  </h2>
                  <p className="text-xs text-muted mt-0.5">Monitor course progress, pinpoint weak areas, and assign targeted drills</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by student or course..."
                    value={searchRoster}
                    onChange={(e) => setSearchRoster(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-line text-xs text-ink placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Summary row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-line shadow-xs text-center">
                  <p className="text-2xl font-extrabold text-ink">{roster.length}</p>
                  <p className="text-[11px] text-muted font-semibold mt-0.5">Total Students</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs text-center">
                  <p className="text-2xl font-extrabold text-emerald-700">{roster.filter(s => s.status === 'Active').length}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Active</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs text-center">
                  <p className="text-2xl font-extrabold text-amber-700">{roster.filter(s => s.status === 'Needs Attention').length}</p>
                  <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Need Attention</p>
                </div>
              </div>

              {/* Student Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRoster.map((stu) => (
                  <div
                    key={stu.id}
                    className={`p-5 rounded-3xl bg-white border shadow-xs hover:shadow-sm transition-all space-y-4 ${
                      stu.status === 'Needs Attention' ? 'border-amber-200/80 hover:border-amber-300' : 'border-line hover:border-slate-300'
                    }`}
                  >
                    {/* Student Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl font-black flex items-center justify-center text-sm border shrink-0 ${
                          stu.status === 'Active'
                            ? 'bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-800 border-blue-200/80'
                            : 'bg-gradient-to-br from-amber-100 to-orange-50 text-amber-800 border-amber-200/80'
                        }`}>
                          {stu.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-ink">{stu.name}</p>
                          <p className="text-[11px] text-muted font-mono">{stu.email}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${
                        stu.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {stu.status === 'Active' ? '✓ Active' : '⚠ Needs Attention'}
                      </span>
                    </div>

                    {/* Course + Progress */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted font-medium">{stu.enrolledCourse}</span>
                        <span className={`text-sm font-extrabold ${
                          stu.progressPct >= 80 ? 'text-emerald-600' : stu.progressPct >= 60 ? 'text-primary' : 'text-rose-600'
                        }`}>{stu.progressPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            stu.progressPct >= 80 ? 'bg-emerald-400' : stu.progressPct >= 60 ? 'bg-primary' : 'bg-rose-400'
                          }`}
                          style={{ width: `${stu.progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Weak Spot + Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-line/60">
                      <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Weak Area</p>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                          {stu.weakArea}
                        </span>
                      </div>
                      <button
                        onClick={() => toast.success("Targeted Drill Assigned! 🎯", `Drill on "${stu.weakArea}" assigned to ${stu.name}.`)}
                        className="px-4 py-2 rounded-xl bg-canvas hover:bg-primary hover:text-white border border-line text-ink font-bold text-xs transition-all cursor-pointer"
                      >
                        Assign Drill
                      </button>
                    </div>
                  </div>
                ))}
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
