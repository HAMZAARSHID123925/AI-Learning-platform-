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
  { id: "usr-1", name: "Hamza Arshid", email: "student@penpage.academy", role: "Student", status: "Active", enrolledCoursesCount: 4, joinedDate: "Sep 01, 2026" },
  { id: "usr-2", name: "Dr. Alan Turing", email: "alan@penpage.academy", role: "Instructor", status: "Active", enrolledCoursesCount: 0, joinedDate: "Aug 15, 2026" },
  { id: "usr-3", name: "Sarah Chen", email: "sarah.c@utoronto.ca", role: "Student", status: "Active", enrolledCoursesCount: 2, joinedDate: "Aug 28, 2026" },
  { id: "usr-4", name: "Prof. Eleanor Vance", email: "eleanor@penpage.academy", role: "Instructor", status: "Active", enrolledCoursesCount: 0, joinedDate: "Aug 10, 2026" },
  { id: "usr-5", name: "Marcus Sterling", email: "marcus.s@outlook.com", role: "Student", status: "Active", enrolledCoursesCount: 3, joinedDate: "Sep 04, 2026" },
  { id: "usr-6", name: "System Administrator", email: "admin@penpage.academy", role: "Admin", status: "Active", enrolledCoursesCount: 0, joinedDate: "Jan 01, 2026" },
];

const INITIAL_COURSES: AdminCourse[] = platformCourses.slice(0, 8).map((pc, idx) => ({
  id: pc.id,
  title: pc.title,
  grade: pc.grade,
  subject: pc.subject === 'cs' ? 'Computer Science' : pc.subject === 'math' ? 'Mathematics' : pc.subject === 'science' ? 'Science' : 'English',
  instructorName: pc.subject === 'cs' ? 'Dr. Alan Turing' : pc.subject === 'english' ? 'Prof. Eleanor Vance' : pc.subject === 'math' ? 'Dr. Alex Vance' : 'Dr. Sarah Jenkins',
  modulesCount: pc.moduleTitles?.length || 4,
  studentsCount: 30 + idx * 12,
  status: 'published',
  isFeatured: idx < 3,
  createdDate: 'Academic Year 2026'
}));

const INITIAL_SESSIONS: AdminLiveSession[] = [
  { id: "ls-1", title: "Live Code Review: Data Structures & Hash Maps", subject: "Computer Science", instructorName: "Dr. Alan Turing", scheduledTime: "Today at 4:00 PM", attendanceCount: 28, status: "UPCOMING" },
  { id: "ls-2", title: "Interactive Workshop: Academic Essay Structuring", subject: "English", instructorName: "Prof. Eleanor Vance", scheduledTime: "Tomorrow at 11:00 AM", attendanceCount: 34, status: "UPCOMING" },
  { id: "ls-3", title: "Calculus & Fractions Problem Solving", subject: "Mathematics", instructorName: "Dr. Alex Vance", scheduledTime: "Friday at 2:00 PM", attendanceCount: 22, status: "UPCOMING" }
];

const INITIAL_CERTS: AdminCertificate[] = [
  { id: "crt-1", certificateId: "CERT-2026-MATH-9842", studentName: "Hamza Arshid", studentEmail: "student@penpage.academy", courseTitle: "Fractions & Problem Solving", issueDate: "Sep 15, 2026", status: "VERIFIED" },
  { id: "crt-2", certificateId: "CERT-2026-ENG-4419", studentName: "Sarah Chen", studentEmail: "sarah.c@utoronto.ca", courseTitle: "Reading & Narrative Writing", issueDate: "Aug 28, 2026", status: "VERIFIED" },
  { id: "crt-3", certificateId: "CERT-2026-CS-1102", studentName: "Marcus Sterling", studentEmail: "marcus.s@outlook.com", courseTitle: "Python Algorithms & Logic", issueDate: "Sep 10, 2026", status: "VERIFIED" }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'live' | 'certificates' | 'settings'>('overview');

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
    <div className="flex h-screen bg-canvas text-ink font-sans overflow-hidden">
      <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Executive Header */}
        <header className="min-h-24 py-5 px-6 md:px-10 border-b border-line bg-white/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary border border-primary/20 flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
                  Platform Administration
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-canvas border border-line text-muted uppercase tracking-wider">
                  v2.4 Production
                </span>
              </div>
              <p className="text-xs text-muted font-medium">
                PPAcademia Governance, User Access, Course Integrity &amp; Global Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Executive Welcome Hero Banner */}
              <div className="rounded-3xl bg-white border border-line p-7 md:p-8 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-soft/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-primary bg-primary-soft px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-primary/10">
                        <Activity className="w-3.5 h-3.5" /> Executive Control Center
                      </span>
                      <span className="text-xs text-muted font-medium">Academic Year 2026</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
                      Platform Command &amp; Real-Time Telemetry
                    </h2>
                    <p className="text-sm text-muted max-w-2xl leading-relaxed">
                      Oversee verified student enrollments, faculty course deployments, cryptographically audited credentials, and live classroom streams across the PPAcademia network.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="px-3.5 py-1.5 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>{users.length * 280} Provisioned Users</span>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{courses.length} Curriculum Tracks</span>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-xl bg-canvas border border-line text-xs font-semibold text-ink flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        <span>{certificates.length * 160} Verified Diplomas</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-56">
                    <button
                      onClick={() => setShowCreateCourseModal(true)}
                      className="w-full py-3.5 px-5 rounded-2xl bg-primary hover:bg-primary-strong text-white font-bold text-xs shadow-sm shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Publish New Course
                    </button>
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="w-full py-3 px-5 rounded-2xl bg-canvas hover:bg-slate-200/60 text-ink font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-line cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-primary" /> Provision User
                    </button>
                  </div>
                </div>
              </div>

              {/* Platform Bento KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-primary/40 transition-all space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted font-bold uppercase tracking-wider">Total User Base</span>
                    <span className="p-2.5 rounded-xl bg-primary-soft text-primary group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-ink tracking-tight">{users.length * 280}</p>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 98.4% Active Accounts
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-emerald-300 transition-all space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted font-bold uppercase tracking-wider">Active Curriculum</span>
                    <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-ink tracking-tight">{courses.length}</p>
                  <p className="text-xs text-muted font-medium">Grades 1–10 (Math, CS, English, Sci)</p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-purple-300 transition-all space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted font-bold uppercase tracking-wider">Verified Diplomas</span>
                    <span className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:scale-105 transition-transform">
                      <Award className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-ink tracking-tight">{certificates.length * 160}</p>
                  <p className="text-xs text-purple-700 font-semibold">100% Validated Signatures</p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-line shadow-xs hover:border-cyan-300 transition-all space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted font-bold uppercase tracking-wider">System Availability</span>
                    <span className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 group-hover:scale-105 transition-transform">
                      <Server className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-ink tracking-tight">99.98%</p>
                  <p className="text-xs text-emerald-700 font-semibold">Zero downtime recorded past 90d</p>
                </div>
              </div>

              {/* Two-Column Audit Feed & Platform Governance */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Real-time Platform Audit Stream */}
                <div className="lg:col-span-7 p-6 md:p-7 rounded-3xl bg-white border border-line shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-line/80 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-ink">Live Platform Audit Feed</h3>
                        <p className="text-[11px] text-muted">Real-time platform logs &amp; security events</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { action: "Student Enrollment", desc: "Hamza Arshid enrolled in Computer Science & Python Mastery", time: "5 mins ago", tag: "CS-101", tagColor: "bg-blue-50 text-blue-700 border-blue-200" },
                      { action: "Assignment Graded", desc: "Dr. Alan Turing submitted Grade A (92%) for Sarah Chen", time: "18 mins ago", tag: "Graded", tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                      { action: "Certificate Generated", desc: "Official Certificate CERT-2026-MATH-9842 verified on blockchain", time: "42 mins ago", tag: "Diploma", tagColor: "bg-purple-50 text-purple-700 border-purple-200" },
                      { action: "Live Session Scheduled", desc: "Interactive Essay Workshop scheduled for Tomorrow at 11:00 AM", time: "2 hours ago", tag: "Live", tagColor: "bg-amber-50 text-amber-700 border-amber-200" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-canvas border border-line hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-ink">{item.action}</p>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${item.tagColor}`}>
                                {item.tag}
                              </span>
                            </div>
                            <p className="text-muted text-[11px] mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <span className="text-subtle font-medium text-[11px] shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Control Governance Hub */}
                <div className="lg:col-span-5 p-6 md:p-7 rounded-3xl bg-white border border-line shadow-xs space-y-4">
                  <div className="border-b border-line/80 pb-3.5">
                    <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-primary" /> Platform Governance
                    </h3>
                    <p className="text-[11px] text-muted">Administrative routing and system oversight</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="p-4 rounded-2xl bg-canvas hover:bg-primary-soft/50 border border-line hover:border-primary/40 text-left transition-all group cursor-pointer"
                    >
                      <Users className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-ink">User Directory</p>
                      <p className="text-[10px] text-muted mt-0.5">RBAC &amp; Provisioning</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('courses')}
                      className="p-4 rounded-2xl bg-canvas hover:bg-emerald-50 border border-line hover:border-emerald-300 text-left transition-all group cursor-pointer"
                    >
                      <BookOpen className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-ink">Course Catalog</p>
                      <p className="text-[10px] text-muted mt-0.5">Publish &amp; Spotlight</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('certificates')}
                      className="p-4 rounded-2xl bg-canvas hover:bg-purple-50 border border-line hover:border-purple-300 text-left transition-all group cursor-pointer"
                    >
                      <Award className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-ink">Diplomas</p>
                      <p className="text-[10px] text-muted mt-0.5">Verify &amp; Revoke</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('settings')}
                      className="p-4 rounded-2xl bg-canvas hover:bg-cyan-50 border border-line hover:border-cyan-300 text-left transition-all group cursor-pointer"
                    >
                      <Settings className="w-5 h-5 text-cyan-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-ink">Platform Config</p>
                      <p className="text-[10px] text-muted mt-0.5">AI Engine &amp; Identity</p>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-canvas border border-line flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-ink">Platform Status Check</span>
                      <span className="text-[11px] text-muted block">Database, Redis &amp; Gemini API operational</span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: USER DIRECTORY */}
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
