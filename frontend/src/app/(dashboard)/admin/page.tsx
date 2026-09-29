"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, Users, BookOpen, Video, Award, 
  Settings, ShieldAlert, CheckCircle2, AlertCircle, 
  Search, Plus, X, Trash2, Edit2, Check, RefreshCw,
  Server, Lock, Globe, Mail, Eye, Sparkles, Filter,
  ArrowUpRight, Activity, ShieldCheck, ChevronRight,
  GraduationCap, Calendar, Clock, Layers
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { toast } from '@/components/ToastProvider';
import { courses as platformCourses } from '@/data/courses';
import { subjects } from '@/data/subjects';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Instructor' | 'Admin';
  status: 'Active' | 'Suspended';
  enrolledCoursesCount: number;
  joinedDate: string;
}

interface AdminCourse {
  id: string;
  title: string;
  subject: string;
  grade: number;
  instructorName: string;
  modulesCount: number;
  studentsCount: number;
  status: 'published' | 'draft';
  isFeatured: boolean;
  createdDate: string;
}

interface AdminLiveSession {
  id: string;
  title: string;
  subject: string;
  instructorName: string;
  scheduledTime: string;
  attendanceCount: number;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
}

interface AdminCertificate {
  id: string;
  certificateId: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  issueDate: string;
  status: 'VERIFIED' | 'REVOKED';
}

const INITIAL_USERS: AdminUser[] = [
  { id: "usr-1", name: "Alex Johnson", email: "alex.j@penpage.academy", role: "Student", status: "Active", enrolledCoursesCount: 4, joinedDate: "Sep 01, 2026" },
  { id: "usr-2", name: "Sarah Jenkins", email: "sarah.jenkins@penpage.academy", role: "Instructor", status: "Active", enrolledCoursesCount: 0, joinedDate: "Aug 15, 2026" },
  { id: "usr-3", name: "Emma Watson", email: "emma.w@penpage.academy", role: "Student", status: "Active", enrolledCoursesCount: 3, joinedDate: "Aug 28, 2026" },
  { id: "usr-4", name: "Dr. David Miller", email: "david.miller@penpage.academy", role: "Instructor", status: "Active", enrolledCoursesCount: 0, joinedDate: "Aug 10, 2026" },
  { id: "usr-5", name: "Liam Smith", email: "liam.smith@penpage.academy", role: "Student", status: "Active", enrolledCoursesCount: 2, joinedDate: "Sep 04, 2026" },
  { id: "usr-6", name: "Sophia Garcia", email: "sophia.g@penpage.academy", role: "Student", status: "Active", enrolledCoursesCount: 4, joinedDate: "Sep 08, 2026" },
  { id: "usr-7", name: "Head Administrator", email: "admin@penpage.academy", role: "Admin", status: "Active", enrolledCoursesCount: 0, joinedDate: "Jan 01, 2026" },
];

const INITIAL_COURSES: AdminCourse[] = platformCourses.map((pc, idx) => ({
  id: pc.id,
  title: `${pc.title} (Grade ${pc.grade})`,
  grade: pc.grade,
  subject: pc.subject === 'cs' ? 'Computer Science' : pc.subject === 'math' ? 'Mathematics' : pc.subject === 'science' ? 'Science' : 'English',
  instructorName: pc.subject === 'cs' || pc.subject === 'math' ? 'Dr. David Miller' : 'Sarah Jenkins',
  modulesCount: pc.moduleTitles?.length || 3,
  studentsCount: 24 + (idx % 5) * 6,
  status: 'published',
  isFeatured: idx < 4,
  createdDate: 'Academic Year 2026'
}));

const INITIAL_SESSIONS: AdminLiveSession[] = [
  { id: "ls-1", title: "Grade 3: Fractions Fun & Visual Pizza Slices 🍕", subject: "Mathematics", instructorName: "Dr. David Miller", scheduledTime: "Today at 3:30 PM", attendanceCount: 24, status: "UPCOMING" },
  { id: "ls-2", title: "Grade 3: Plant Life Cycles & Habitats Explorer 🌿", subject: "Science", instructorName: "Sarah Jenkins", scheduledTime: "Tomorrow at 10:00 AM", attendanceCount: 28, status: "UPCOMING" },
  { id: "ls-3", title: "Grade 3: Creative Storytelling & Character Voices 📚", subject: "English", instructorName: "Sarah Jenkins", scheduledTime: "Thursday at 2:00 PM", attendanceCount: 22, status: "UPCOMING" },
  { id: "ls-4", title: "Grade 3: Coding Games with Blocks & Arrows 💻", subject: "Computer Science", instructorName: "Dr. David Miller", scheduledTime: "Friday at 4:00 PM", attendanceCount: 30, status: "UPCOMING" }
];

const INITIAL_CERTS: AdminCertificate[] = [
  { id: "crt-1", certificateId: "CERT-2026-MATH-G3", studentName: "Alex Johnson", studentEmail: "alex.j@penpage.academy", courseTitle: "Fractions & Problem Solving (Grade 3)", issueDate: "Sep 20, 2026", status: "VERIFIED" },
  { id: "crt-2", certificateId: "CERT-2026-ENG-G3", studentName: "Emma Watson", studentEmail: "emma.w@penpage.academy", courseTitle: "Reading & Narrative Writing (Grade 3)", issueDate: "Sep 18, 2026", status: "VERIFIED" },
  { id: "crt-3", certificateId: "CERT-2026-CS-G3", studentName: "Liam Smith", studentEmail: "liam.smith@penpage.academy", courseTitle: "Digital Basics & Safety (Grade 3)", issueDate: "Sep 15, 2026", status: "VERIFIED" },
  { id: "crt-4", certificateId: "CERT-2026-SCI-G3", studentName: "Sophia Garcia", studentEmail: "sophia.g@penpage.academy", courseTitle: "Plants & Living Things (Grade 3)", issueDate: "Sep 12, 2026", status: "VERIFIED" }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'students' | 'users' | 'courses' | 'live' | 'certificates' | 'settings'>('overview');

  // Users State
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'Student' | 'Instructor' | 'Admin'>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<'Student' | 'Instructor' | 'Admin'>('Student');

  // Courses State
  const [courses, setCourses] = useState<AdminCourse[]>(INITIAL_COURSES);
  const [courseSearch, setCourseSearch] = useState("");
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseSubject, setNewCourseSubject] = useState("Computer Science");
  const [newCourseGrade, setNewCourseGrade] = useState<number>(3);
  const [newCourseInstructor, setNewCourseInstructor] = useState("Faculty Lead");
  const [newCourseDesc, setNewCourseDesc] = useState("");

  // Live Sessions State
  const [sessions, setSessions] = useState<AdminLiveSession[]>(INITIAL_SESSIONS);

  // Certificates State
  const [certificates, setCertificates] = useState<AdminCertificate[]>(INITIAL_CERTS);
  const [certSearch, setCertSearch] = useState("");

  // Platform Settings State
  const [platformName, setPlatformName] = useState("PPAcademia");
  const [supportEmail, setSupportEmail] = useState("support@penpage.academy");
  const [aiEngine, setAiEngine] = useState("Gemini 1.5 Pro (Adaptive)");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Handlers & Derived State
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) || 
    c.subject.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.instructorName.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredCerts = certificates.filter(crt =>
    crt.certificateId.toLowerCase().includes(certSearch.toLowerCase()) ||
    crt.studentName.toLowerCase().includes(certSearch.toLowerCase()) ||
    crt.courseTitle.toLowerCase().includes(certSearch.toLowerCase())
  );

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'Active',
      enrolledCoursesCount: 0,
      joinedDate: 'Just Now'
    };

    setUsers(prev => [newUser, ...prev]);
    setShowAddUserModal(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("Student");
    toast.success("User Provisioned 🎉", `${newUser.name} is now added as ${newUser.role}.`);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        toast.info("Account Status Updated", `${u.name} is now ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleToggleCourseFeatured = (courseId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const nextFeatured = !c.isFeatured;
        toast.info(nextFeatured ? "Course Featured ⭐" : "Course Unfeatured", `"${c.title}" updated.`);
        return { ...c, isFeatured: nextFeatured };
      }
      return c;
    }));
  };

  const handleRevokeCertificate = (certId: string) => {
    setCertificates(prev => prev.map(crt => {
      if (crt.id === certId) {
        const nextStatus = crt.status === 'VERIFIED' ? 'REVOKED' : 'VERIFIED';
        toast.info("Accreditation Updated", `Certificate ${crt.certificateId} is now ${nextStatus}.`);
        return { ...crt, status: nextStatus };
      }
      return crt;
    }));
  };

  const handleSaveSettings = () => {
    toast.success("Settings Saved ⚙️", "Platform global configuration updated successfully.");
  };

  const handleAdminCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const newC: AdminCourse = {
      id: `c-${Date.now()}`,
      title: newCourseTitle.trim(),
      grade: Number(newCourseGrade) || 3,
      subject: newCourseSubject,
      instructorName: newCourseInstructor.trim() || "Faculty Lead",
      modulesCount: 4,
      studentsCount: 0,
      status: "published",
      isFeatured: true,
      createdDate: "Just Now"
    };

    setCourses(prev => [newC, ...prev]);
    setShowCreateCourseModal(false);
    setNewCourseTitle("");
    setNewCourseDesc("");
    toast.success("Master Course Published! 🚀", `"${newC.title}" is now active in the platform catalog.`);
  };

  const getSubjectBadge = (subj: string) => {
    switch (subj.toLowerCase()) {
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
      <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 space-y-8 overflow-y-auto h-screen overflow-y-auto">

        {/* ── TOP PAGE HEADER ── */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-line/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-50 text-purple-700 font-extrabold flex items-center justify-center text-lg shadow-xs border border-purple-200/80">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">School Administration</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live &amp; Operational
                </span>
              </div>
              <p className="text-xs text-muted font-medium mt-0.5">Academic Year 2026 • Classes 1–5 Management &amp; Faculty Supervision</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-ink font-bold text-xs border border-line flex items-center gap-2 cursor-pointer transition-all shadow-xs hover:border-slate-300"
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>Enroll User</span>
            </button>
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-sm shadow-primary/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </button>
          </div>
        </header>

        {/* ── CONTENT BODY ── */}
        <div className="w-full space-y-8">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* ─── HERO BANNER ─── */}
              <div className="relative rounded-3xl overflow-hidden border border-[#302b63]/30 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-purple-500/25 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                <div className="relative z-10 px-8 py-8 md:px-10 md:py-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="space-y-3 flex-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                      <Sparkles className="w-3 h-3" /> Principal &amp; Admin Suite
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Welcome back, Administrator 🎓
                    </h2>
                    <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                      Full oversight across <span className="text-white font-semibold">Classes 1–5</span>. Manage faculty, students, courses, and live sessions from one unified command center.
                    </p>
                    <div className="flex items-center gap-3 pt-1 flex-wrap">
                      <button
                        onClick={() => setActiveTab('teachers')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <GraduationCap className="w-3.5 h-3.5" /> View Faculty
                      </button>
                      <button
                        onClick={() => setActiveTab('students')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" /> View Students
                      </button>
                      <button
                        onClick={() => setActiveTab('courses')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Courses
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
                    <div className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-center min-w-[110px]">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Grade Span</p>
                      <p className="text-3xl font-extrabold text-white mt-1">1–5</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Elementary</p>
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-center min-w-[110px]">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Subjects</p>
                      <p className="text-3xl font-extrabold text-white mt-1">4</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Core Tracks</p>
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-center min-w-[110px]">
                      <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Status</p>
                      <div className="flex items-center justify-center gap-1.5 mt-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-lg font-extrabold text-emerald-300">Live</p>
                      </div>
                      <p className="text-[10px] text-emerald-400 font-medium mt-0.5">Operational</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── 4 KPI BENTO CARDS ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Students */}
                <div
                  onClick={() => { setUserRoleFilter('Student'); setActiveTab('students'); }}
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
                    <p className="text-4xl font-extrabold text-ink tracking-tight">{users.filter(u => u.role === 'Student').length}</p>
                    <p className="text-xs text-muted font-medium mt-1.5">Enrolled Students</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-primary font-bold group-hover:opacity-100 opacity-0 transition-opacity">
                      Manage directory <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Teachers */}
                <div
                  onClick={() => { setUserRoleFilter('Instructor'); setActiveTab('teachers'); }}
                  className="group relative p-6 rounded-3xl bg-white border border-line shadow-xs cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300/70"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-emerald-100/80 text-emerald-700 shadow-xs group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Faculty</span>
                    </div>
                    <p className="text-4xl font-extrabold text-ink tracking-tight">{users.filter(u => u.role === 'Instructor').length}</p>
                    <p className="text-xs text-muted font-medium mt-1.5">Faculty Teachers</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-emerald-700 font-bold group-hover:opacity-100 opacity-0 transition-opacity">
                      View faculty <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Courses */}
                <div
                  onClick={() => setActiveTab('courses')}
                  className="group relative p-6 rounded-3xl bg-white border border-line shadow-xs cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-purple-300/70"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-purple-100/80 text-purple-700 shadow-xs group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">Courses</span>
                    </div>
                    <p className="text-4xl font-extrabold text-ink tracking-tight">{courses.length}</p>
                    <p className="text-xs text-muted font-medium mt-1.5">Published Courses</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-purple-700 font-bold group-hover:opacity-100 opacity-0 transition-opacity">
                      Browse catalog <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Live Sessions */}
                <div
                  onClick={() => setActiveTab('live')}
                  className="group relative p-6 rounded-3xl bg-white border border-line shadow-xs cursor-pointer overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300/70"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-amber-100/80 text-amber-700 shadow-xs group-hover:scale-110 transition-transform">
                        <Video className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">Live</span>
                    </div>
                    <p className="text-4xl font-extrabold text-ink tracking-tight">{sessions.length}</p>
                    <p className="text-xs text-muted font-medium mt-1.5">Live Classrooms</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-amber-700 font-bold group-hover:opacity-100 opacity-0 transition-opacity">
                      Scheduled this week <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── TWO-COLUMN COMMAND HUB ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                {/* Left 7 cols */}
                <div className="lg:col-span-7 space-y-5">

                  {/* Faculty Teachers Card */}
                  <div className="p-6 md:p-7 rounded-3xl bg-white border border-line shadow-xs">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 shadow-xs">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-ink">Faculty Teachers</h3>
                          <p className="text-[11px] text-muted">Active instructors managing classrooms</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setUserRoleFilter('Instructor'); setActiveTab('teachers'); }}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                      >
                        View All <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {users.filter(u => u.role === 'Instructor').map((teacher) => (
                        <div key={teacher.id} className="flex items-center justify-between p-4 rounded-2xl bg-canvas border border-line hover:border-slate-300 hover:shadow-xs transition-all">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-800 font-black flex items-center justify-center text-sm border border-emerald-200/80 shrink-0">
                              {teacher.name[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-ink">{teacher.name}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                              </div>
                              <p className="text-xs text-muted font-mono mt-0.5">{teacher.email}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-ink block">Classes 1–5</span>
                            <span className="text-[10px] text-muted">{teacher.joinedDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Students Quick Strip */}
                  <div className="p-6 rounded-3xl bg-white border border-line shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-primary flex items-center justify-center border border-blue-200/80 shadow-xs">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-ink">Enrolled Students</h3>
                          <p className="text-[11px] text-muted">Recently joined campus members</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setUserRoleFilter('Student'); setActiveTab('students'); }}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                      >
                        All ({users.filter(u => u.role === 'Student').length}) <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {users.filter(u => u.role === 'Student').slice(0, 4).map((stu) => (
                        <div key={stu.id} className="p-3.5 rounded-2xl bg-canvas border border-line text-center space-y-1.5 hover:border-slate-300 hover:shadow-xs transition-all">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-800 font-bold mx-auto flex items-center justify-center text-sm border border-blue-200/70">
                            {stu.name[0]}
                          </div>
                          <p className="text-xs font-bold text-ink truncate">{stu.name.split(' ')[0]}</p>
                          <span className="text-[10px] text-muted block">{stu.enrolledCoursesCount} courses</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right 5 cols */}
                <div className="lg:col-span-5 space-y-5">

                  {/* Curriculum Tracks */}
                  <div className="p-6 md:p-7 rounded-3xl bg-white border border-line shadow-xs">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/80 shadow-xs">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-ink">Curriculum Tracks</h3>
                          <p className="text-[11px] text-muted">Core elementary subjects</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('courses')}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                      >
                        Full Catalog <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { name: 'Mathematics', desc: 'Numbers, fractions & arithmetic', count: 6, icon: '📐', bg: 'bg-gradient-to-r from-blue-50 to-indigo-50', border: 'border-blue-200/60', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
                        { name: 'Science',     desc: 'Plants, habitats & living things', count: 5, icon: '🌿', bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',   border: 'border-emerald-200/60', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        { name: 'English',     desc: 'Reading, spelling & stories',     count: 6, icon: '📚', bg: 'bg-gradient-to-r from-purple-50 to-violet-50',  border: 'border-purple-200/60', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
                        { name: 'Computer Science', desc: 'Typing, logic & digital safety', count: 5, icon: '💻', bg: 'bg-gradient-to-r from-amber-50 to-orange-50', border: 'border-amber-200/60', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
                      ].map((subj, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveTab('courses')}
                          className={`flex items-center justify-between p-3.5 rounded-2xl ${subj.bg} border ${subj.border} cursor-pointer hover:shadow-xs hover:-translate-y-0.5 transition-all`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl shrink-0">{subj.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-ink">{subj.name}</p>
                              <p className="text-[11px] text-muted mt-0.5">{subj.desc}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${subj.badge}`}>{subj.count} lessons</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setShowCreateCourseModal(true)}
                      className="mt-4 w-full py-2.5 rounded-2xl bg-canvas hover:bg-slate-100 text-ink font-bold text-xs border border-line flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-primary" /> Add Course to Catalog
                    </button>
                  </div>

                  {/* Upcoming Live Sessions */}
                  <div className="p-6 rounded-3xl bg-white border border-line shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80 shadow-xs">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-ink">Upcoming Sessions</h3>
                          <p className="text-[11px] text-muted">Live classrooms this week</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('live')}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                      >
                        All <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {sessions.slice(0, 3).map((sess) => (
                        <div key={sess.id} className="flex items-start gap-3 p-3 rounded-2xl bg-canvas border border-line hover:border-slate-300 transition-all">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-ink line-clamp-1">{sess.title.replace(/[🍕🌿📚💻]/g, '').trim()}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] text-muted">{sess.scheduledTime}</span>
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">{sess.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
          {/* TAB 2: FACULTY TEACHERS DIRECTORY */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-emerald-600" />
                    Faculty Teachers Directory
                  </h2>
                  <p className="text-xs text-muted">Manage school instructors, teaching assignments, and faculty credentials</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setNewUserRole('Instructor');
                      setShowAddUserModal(true);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add New Teacher
                  </button>
                </div>
              </div>

              {/* Teachers Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {users.filter(u => u.role === 'Instructor').map((teacher) => (
                  <div key={teacher.id} className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-slate-300 transition-all space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-800 font-black flex items-center justify-center text-base border border-emerald-200/80 shadow-xs shrink-0">
                          {teacher.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-ink">{teacher.name}</span>
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active Faculty
                            </span>
                          </div>
                          <p className="text-xs text-muted font-mono mt-0.5">{teacher.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleUserStatus(teacher.id)}
                        className="px-3 py-1.5 rounded-xl border border-line text-ink hover:bg-canvas font-semibold text-[11px] transition-all cursor-pointer"
                      >
                        {teacher.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>

                    <div className="pt-3 border-t border-line grid grid-cols-2 gap-2 text-xs text-muted">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-subtle block">Assigned Classes</span>
                        <span className="font-bold text-ink">Classes 1–5</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-subtle block">Joined Date</span>
                        <span className="font-semibold text-ink">{teacher.joinedDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ENROLLED STUDENTS DIRECTORY */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    Enrolled Students Directory
                  </h2>
                  <p className="text-xs text-muted">Supervise registered student profiles across Classes 1 through 5</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setNewUserRole('Student');
                      setShowAddUserModal(true);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" /> Enroll New Student
                  </button>
                </div>
              </div>

              {/* Student Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-line shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-canvas border border-line text-xs text-ink placeholder-subtle focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-canvas/60 text-[11px] font-bold text-muted uppercase tracking-wider">
                      <th className="p-4">Student</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Enrolled Class</th>
                      <th className="p-4">Courses Enrolled</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60 text-xs">
                    {users.filter(u => u.role === 'Student' && (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))).map((stu) => (
                      <tr key={stu.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {stu.name[0]}
                            </div>
                            <span className="font-bold text-ink text-sm">{stu.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted font-mono text-[11px]">{stu.email}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Class 3
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-ink">{stu.enrolledCoursesCount || 4} Subjects</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            stu.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stu.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {stu.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(stu.id)}
                            className="px-3 py-1.5 rounded-xl border border-line text-ink hover:bg-canvas font-semibold text-[11px] transition-all cursor-pointer"
                          >
                            {stu.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USER DIRECTORY (LEGACY / ALL) */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-ink tracking-tight">Platform User Accounts</h2>
                  <p className="text-xs text-muted">Supervise student profiles, teacher faculty credentials, and administrative privileges</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" /> Provision User
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-line shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name or email address..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-canvas border border-line text-xs text-ink placeholder-subtle focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'Student', 'Instructor', 'Admin'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        userRoleFilter === role 
                          ? 'bg-ink text-white shadow-xs' 
                          : 'text-muted hover:text-ink hover:bg-canvas'
                      }`}
                    >
                      {role === 'all' ? 'All Roles' : role === 'Instructor' ? 'Teachers' : role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Directory Table */}
              <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-canvas/60 text-[11px] font-bold text-muted uppercase tracking-wider">
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Platform Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60 text-xs">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-canvas border border-line font-extrabold text-ink flex items-center justify-center text-xs shrink-0">
                              {u.name[0]}
                            </div>
                            <span className="font-bold text-ink">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted font-mono text-[11px]">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            u.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            u.role === 'Instructor' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-blue-50 text-primary border-blue-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            u.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted">{u.joinedDate}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className="px-3 py-1.5 rounded-xl border border-line text-ink hover:bg-canvas font-semibold text-[11px] transition-all cursor-pointer"
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COURSE CATALOG CONTROL */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-ink tracking-tight">Platform Course Catalog</h2>
                  <p className="text-xs text-muted">Oversee published multi-subject courses, manage grade coverage, and spotlight courses</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-line text-xs text-ink placeholder-subtle focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <button
                    onClick={() => setShowCreateCourseModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" /> New Course
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCourses.map((c) => (
                  <div key={c.id} className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-slate-300 transition-all space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getSubjectBadge(c.subject)}`}>
                          {c.subject}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-canvas border border-line text-muted">
                          Grade {c.grade}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                        c.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-canvas text-muted border-line'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-ink leading-snug">{c.title}</h3>
                      <p className="text-xs text-muted mt-1">Instructor: <strong className="text-ink font-semibold">{c.instructorName}</strong></p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-line text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-subtle" />
                        {c.modulesCount} Modules
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-subtle" />
                        {c.studentsCount} Active Students
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => handleToggleCourseFeatured(c.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          c.isFeatured 
                            ? 'bg-amber-50 text-amber-800 border border-amber-300' 
                            : 'bg-canvas text-muted hover:text-ink border border-line'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {c.isFeatured ? 'Featured on Home' : 'Feature Course'}
                      </button>

                      <Link
                        href="/dashboard/courses"
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        Catalog View &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LIVE SESSIONS MONITOR */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-ink tracking-tight">Live Virtual Classrooms Telemetry</h2>
                <p className="text-xs text-muted">Supervise active, upcoming, and completed faculty live video sessions</p>
              </div>

              <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-canvas/60 text-[11px] font-bold text-muted uppercase tracking-wider">
                      <th className="p-4">Session Title</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Faculty Instructor</th>
                      <th className="p-4">Scheduled Time</th>
                      <th className="p-4">Registrations</th>
                      <th className="p-4">Live Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60 text-xs">
                    {sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="p-4 font-bold text-ink">{s.title}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSubjectBadge(s.subject)}`}>
                            {s.subject}
                          </span>
                        </td>
                        <td className="p-4 text-muted font-medium">{s.instructorName}</td>
                        <td className="p-4 text-muted font-mono text-[11px]">{s.scheduledTime}</td>
                        <td className="p-4 font-bold text-ink">{s.attendanceCount} Students</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-200 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATES & ACCREDITATION */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-ink tracking-tight">Accreditation &amp; Certificates Hub</h2>
                  <p className="text-xs text-muted">Cryptographically audited registry of official course completion credentials</p>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by ID or student name..."
                    value={certSearch}
                    onChange={(e) => setCertSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-line text-xs text-ink placeholder-subtle focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-canvas/60 text-[11px] font-bold text-muted uppercase tracking-wider">
                      <th className="p-4">Credential ID</th>
                      <th className="p-4">Recipient Student</th>
                      <th className="p-4">Course Title</th>
                      <th className="p-4">Issue Date</th>
                      <th className="p-4">Validation</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60 text-xs">
                    {filteredCerts.map((crt) => (
                      <tr key={crt.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-primary">{crt.certificateId}</td>
                        <td className="p-4 font-bold text-ink">
                          <div>{crt.studentName}</div>
                          <span className="text-[11px] text-subtle font-normal">{crt.studentEmail}</span>
                        </td>
                        <td className="p-4 text-muted font-medium">{crt.courseTitle}</td>
                        <td className="p-4 text-muted">{crt.issueDate}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            crt.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {crt.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleRevokeCertificate(crt.id)}
                            className="px-3 py-1.5 rounded-xl border border-line text-ink hover:bg-canvas font-semibold text-[11px] transition-all cursor-pointer"
                          >
                            {crt.status === 'VERIFIED' ? 'Revoke' : 'Re-Validate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-line shadow-xs max-w-2xl space-y-6">
              <div className="border-b border-line pb-4">
                <h2 className="text-lg font-extrabold text-ink tracking-tight">Platform Global Settings</h2>
                <p className="text-xs text-muted">Configure branding parameters, AI reasoning engines, and maintenance flags</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Platform Brand Identity:</label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-bold text-ink focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Official Platform Support Email:</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-bold text-ink focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Primary AI Tutoring &amp; Assessment Engine:</label>
                  <select
                    value={aiEngine}
                    onChange={(e) => setAiEngine(e.target.value)}
                    className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-bold text-ink focus:outline-none focus:border-primary focus:bg-white transition-all"
                  >
                    <option value="Gemini 1.5 Pro (Adaptive)">Gemini 1.5 Pro (Multimodal &amp; Socratic Reasoning)</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Advanced Pedagogy)</option>
                    <option value="GPT-4o">GPT-4o (General Purpose)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-ink block">Platform Maintenance Mode</span>
                    <span className="text-[11px] text-muted">Restrict access to system administrators during schema deployments.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Save Platform Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* CREATE COURSE MODAL FOR ADMIN */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in duration-200 border border-line">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-ink">Create Master Curriculum Course</h3>
              <button 
                onClick={() => setShowCreateCourseModal(false)} 
                className="text-subtle hover:text-ink p-1 rounded-lg hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Course Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Algorithmic Problem Solving & Python Logic"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-medium text-ink focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink">Academic Subject:</label>
                  <select
                    value={newCourseSubject}
                    onChange={(e) => setNewCourseSubject(e.target.value)}
                    className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink focus:outline-none"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink">Target Grade Level:</label>
                  <select
                    value={newCourseGrade}
                    onChange={(e) => setNewCourseGrade(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Assigned Faculty Lead:</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alan Turing / Faculty Chair"
                  value={newCourseInstructor}
                  onChange={(e) => setNewCourseInstructor(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-medium text-ink focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Curriculum Summary:</label>
                <textarea
                  rows={3}
                  placeholder="Outline module topics, learning outcomes and syllabus scope..."
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs text-ink focus:outline-none focus:border-primary focus:bg-white"
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
                  Publish to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in duration-200 border border-line">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-ink">Provision Platform User</h3>
              <button 
                onClick={() => setShowAddUserModal(false)} 
                className="text-subtle hover:text-ink p-1 rounded-lg hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Full Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Gonzalez"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-medium text-ink focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Email Address:</label>
                <input
                  type="email"
                  placeholder="e.g. maria.g@penpage.academy"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-medium text-ink focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Assigned Role:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink focus:outline-none"
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor / Teacher</option>
                  <option value="Admin">System Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-line text-muted hover:text-ink font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-xs"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
