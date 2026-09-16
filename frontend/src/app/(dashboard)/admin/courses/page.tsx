"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, Search, Filter, MoreVertical, BookOpen, BrainCircuit, UploadCloud, ChevronRight,
  Users, BarChart2, TrendingUp, CheckCircle, Clock, Sparkles, Sliders, Save, FileText, CheckCircle2,
  ShieldAlert, DollarSign, ToggleLeft, ToggleRight, UserCheck, UserX, AlertTriangle, KeyRound,
  Coins, Activity, Megaphone, Wand2, Download, RefreshCw, Zap, BarChart3, Send, Radio,
  HardDrive, Server, Mail, FileSpreadsheet, Cpu, Layers, Flame, Trash2, UserPlus, MailCheck, Copy, ExternalLink, Check,
  X, ShieldCheck
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { toast } from '@/components/ToastProvider';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Instructor' | 'Admin';
  status: 'active' | 'suspended';
  joinedDate: string;
  targetBand: string;
}

interface StaffInvite {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'Instructor' | 'Lead Examiner' | 'Teaching Assistant';
  assignedCourses: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  token: string;
  createdAt: string;
  expiresAt: string;
}

interface AuditRecord {
  id: string;
  event: string;
  actor: string;
  ip: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

interface AtRiskStudent {
  id: string;
  name: string;
  email: string;
  targetBand: string;
  currentBand: number;
  examDate: string;
  daysRemaining: number;
  trigger: 'Urgent Test Date' | 'Score Dropped' | 'Inactive > 7d';
  urgency: 'high' | 'critical' | 'medium';
}

interface BroadcastItem {
  id: string;
  title: string;
  message: string;
  audience: string;
  urgency: 'normal' | 'high' | 'urgent';
  sentAt: string;
  recipientCount: number;
}

function AdminCoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    'published' | 'drafts' | 'users' | 'revenue' | 'audit' | 'flags' | 'analytics' | 'prompts' | 
    'cost' | 'at-risk' | 'generator' | 'broadcast' | 'health'
  >('published');

  // Synchronize activeTab with URL query parameter ?tab=...
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['published', 'drafts', 'users', 'revenue', 'audit', 'flags', 'prompts', 'cost', 'at-risk', 'generator', 'broadcast', 'health'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    } else if (!tabParam) {
      setActiveTab('published');
    }
  }, [searchParams]);

  const handleSelectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const newUrl = tab === 'published' ? '/admin/courses' : `/admin/courses?tab=${tab}`;
      window.history.pushState(null, '', newUrl);
    }
  };
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState<any | null>(null);
  const [selectedCourseForCohort, setSelectedCourseForCohort] = useState<any | null>(null);

  // Curriculum Builder State
  const [modulesList, setModulesList] = useState<Array<{
    id: string;
    title: string;
    lessons: Array<{ id: string; title: string; type: 'video' | 'quiz' | 'doc'; duration: string }>;
  }>>([
    {
      id: 'm-1',
      title: 'Module 1: Task 2 Advanced Lexical & GRA Inversion',
      lessons: [
        { id: 'l-1', title: 'Video: Mastering Inverted Syntax for Band 8.5', type: 'video', duration: '12 mins' },
        { id: 'l-2', title: 'Interactive Checkpoint: Conditionals & Inversion Quiz', type: 'quiz', duration: '5 mins' },
        { id: 'l-3', title: 'Cambridge Scoring Rubric Cheatsheet (PDF)', type: 'doc', duration: '3 mins' }
      ]
    },
    {
      id: 'm-2',
      title: 'Module 2: Coherence & Discourse Linkers',
      lessons: [
        { id: 'l-4', title: 'Video: Eliminating Repetitive Transitions', type: 'video', duration: '15 mins' },
        { id: 'l-5', title: 'Diagnostic Exercise: Paragraph Flow Drill', type: 'quiz', duration: '8 mins' }
      ]
    }
  ]);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('m-1');
  const [newLessonType, setNewLessonType] = useState<'video' | 'quiz' | 'doc'>('video');

  // Cohort Assigner State
  const [cohortName, setCohortName] = useState('Fall 2026 Band 8.0 Fast-Track');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(['usr-1', 'usr-3']);

  // Teacher / Staff Invitation State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [userSubTab, setUserSubTab] = useState<'roster' | 'invites' | 'instructors'>('roster');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDepartment, setInviteDepartment] = useState('IELTS Academic Writing & Speaking');
  const [inviteRole, setInviteRole] = useState<'Instructor' | 'Lead Examiner' | 'Teaching Assistant'>('Instructor');
  const [inviteCourses, setInviteCourses] = useState<string[]>(['IELTS Academic Writing Masterclass']);
  const [inviteNote, setInviteNote] = useState('We are excited to invite you to join Pen & Page Academia as a certified instructor.');
  const [staffInvites, setStaffInvites] = useState<StaffInvite[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('staff_invites');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'inv-1',
        name: 'Prof. Alistair Finch',
        email: 'finch@oxford.ac.uk',
        department: 'IELTS Academic Writing & Lexical Mastery',
        role: 'Instructor',
        assignedCourses: ['IELTS Academic Writing Masterclass'],
        status: 'ACCEPTED',
        token: 'inst_oxf_9921',
        createdAt: 'Aug 14, 2026',
        expiresAt: 'Aug 21, 2026'
      },
      {
        id: 'inv-2',
        name: 'Dr. Rebecca Thornton',
        email: 'r.thornton@cambridge-ielts.org',
        department: 'Speaking Part 2/3 & Phonetics',
        role: 'Lead Examiner',
        assignedCourses: ['Speaking Part 2 & 3 Fluency Bootcamp'],
        status: 'PENDING',
        token: 'inst_cam_8832',
        createdAt: 'Sep 12, 2026',
        expiresAt: 'Sep 19, 2026'
      }
    ];
  });

  const handleSendTeacherInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Required Fields', 'Please provide teacher name and email.');
      return;
    }
    const token = 'inst_inv_' + Math.random().toString(36).substring(2, 10);
    const newInvite: StaffInvite = {
      id: 'inv_' + Date.now(),
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      department: inviteDepartment,
      role: inviteRole,
      assignedCourses: inviteCourses.length ? inviteCourses : ['General English Communicative Fluency'],
      status: 'PENDING',
      token,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updated = [newInvite, ...staffInvites];
    setStaffInvites(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('staff_invites', JSON.stringify(updated));
    }

    const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/signup?invite=${token}&email=${encodeURIComponent(newInvite.email)}&role=instructor`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink).catch(() => {});
    }

    toast.success('Instructor Invite Dispatched! ✉️', `Invitation link for "${inviteName}" generated and copied to clipboard.`);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    setUserSubTab('invites');
  };

  const handleCopyInviteLink = (invite: StaffInvite) => {
    const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'}/signup?invite=${invite.token}&email=${encodeURIComponent(invite.email)}&role=instructor`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
      toast.success('Invite Link Copied 📋', `Direct registration URL copied for ${invite.name}.`);
    }
  };

  const handleResendInvite = (invite: StaffInvite) => {
    toast.success('Invite Re-sent 📨', `Fresh invitation email dispatched to ${invite.email}.`);
  };

  const handleRevokeInvite = (inviteId: string) => {
    if (!confirm('Are you sure you want to revoke this teacher invitation?')) return;
    const updated = staffInvites.map(i => i.id === inviteId ? { ...i, status: 'REVOKED' as const } : i);
    setStaffInvites(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('staff_invites', JSON.stringify(updated));
    }
    toast.info('Invitation Revoked 🚫', 'Instructor invite link has been deactivated.');
  };

  // RBAC Route Guard: Admin privileges required
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = (localStorage.getItem('user_role') || 'student').toLowerCase();
      if (role !== 'admin' && role !== 'superadmin') {
        toast.error("Access Restricted 🔒", "Administrator privileges required to access Admin Studio.");
        router.push('/dashboard');
      }
    }
  }, [router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('Examiner-curated course syllabus with interactive lessons, practice tests, and AI rubric grading.');
  const [newCategory, setNewCategory] = useState('IELTS Preparation');
  const [newTargetBand, setNewTargetBand] = useState('Band 7.5+');
  const [newPrice, setNewPrice] = useState('$49.00');
  const [newDuration, setNewDuration] = useState('6 Weeks / 30 Hours');
  const [newInstructor, setNewInstructor] = useState('Hamza Arshid (Lead Assessor)');
  const [newLevel, setNewLevel] = useState('Intermediate to Advanced');
  const [newStatus, setNewStatus] = useState<'published' | 'draft'>('published');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // User Management State
  const [usersList, setUsersList] = useState<UserRecord[]>([
    { id: 'usr-1', name: 'Dr. Rohit Mehta', email: 'rohit.mehta@nhs.uk', role: 'Student', status: 'active', joinedDate: 'Sep 02, 2026', targetBand: '8.0' },
    { id: 'usr-2', name: 'Prof. Alistair Finch', email: 'finch@oxford.ac.uk', role: 'Instructor', status: 'active', joinedDate: 'Aug 14, 2026', targetBand: 'Staff' },
    { id: 'usr-3', name: 'Sarah Chen', email: 'sarah.c@utoronto.ca', role: 'Student', status: 'active', joinedDate: 'Sep 09, 2026', targetBand: '7.5' },
    { id: 'usr-4', name: 'Hamza Arshid', email: 'admin@ppacademia.com', role: 'Admin', status: 'active', joinedDate: 'Aug 01, 2026', targetBand: 'System' },
    { id: 'usr-5', name: 'Marcus Sterling', email: 'marcus.s@outlook.com', role: 'Student', status: 'suspended', joinedDate: 'Aug 29, 2026', targetBand: '6.5' }
  ]);
  const [userSearch, setUserSearch] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([
    { id: 'log-1', event: 'AUTH_LOGIN_SUCCESS', actor: 'rohit.mehta@nhs.uk', ip: '192.168.1.42', timestamp: '2 mins ago', status: 'SUCCESS' },
    { id: 'log-2', event: 'ROLE_PROMOTION', actor: 'admin@ppacademia.com', ip: '127.0.0.1', timestamp: '14 mins ago', status: 'SUCCESS' },
    { id: 'log-3', event: 'FAILED_LOGIN_ATTEMPT', actor: 'unknown_ip@bot.net', ip: '45.134.22.10', timestamp: '1 hour ago', status: 'ALERT' },
    { id: 'log-4', event: 'ASSESSMENT_EVAL_COMPLETE', actor: 'sarah.c@utoronto.ca', ip: '192.168.1.88', timestamp: '2 hours ago', status: 'SUCCESS' },
    { id: 'log-5', event: 'PASSWORD_RESET_REQUEST', actor: 'marcus.s@outlook.com', ip: '82.102.14.3', timestamp: '3 hours ago', status: 'WARNING' }
  ]);

  // System Feature Flags State
  const [featureFlags, setFeatureFlags] = useState({
    aiGradingEngine: true,
    speechRealTimeTTS: true,
    peerSpeakingRooms: true,
    studentCertificateExport: true,
    maintenanceMode: false
  });

  // AI Prompt Tuning State
  const [speakingPrompt, setSpeakingPrompt] = useState(
    "You are a Senior Certified British Council IELTS Speaking Examiner. Evaluate the candidate's speech response using the official 9-Band Rubric across Fluency, Lexical Resource, Grammar, and Pronunciation."
  );
  const [writingPrompt, setWritingPrompt] = useState(
    "You are a Cambridge Academic Writing Assessor. Grade Task 1 reports and Task 2 discursive essays strictly according to Task Response, Coherence/Cohesion, Vocabulary, and Grammatical Range."
  );
  const [temperature, setTemperature] = useState(0.3);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);

  // AI Cost & Token Observability State
  const [dailyBudgetCap, setDailyBudgetCap] = useState(50);
  const [autoFallback, setAutoFallback] = useState(true);

  // At-Risk Candidate State
  const [atRiskList, setAtRiskList] = useState<AtRiskStudent[]>([
    { id: 'ar-1', name: 'Dr. Rohit Mehta', email: 'rohit.mehta@nhs.uk', targetBand: '8.0', currentBand: 6.5, examDate: '2026-10-04', daysRemaining: 18, trigger: 'Score Dropped', urgency: 'high' },
    { id: 'ar-2', name: 'Marcus Sterling', email: 'marcus.s@outlook.com', targetBand: '7.5', currentBand: 6.0, examDate: '2026-09-28', daysRemaining: 12, trigger: 'Urgent Test Date', urgency: 'critical' },
    { id: 'ar-3', name: 'Priya Sharma', email: 'priya.s@delhi.edu', targetBand: '8.5', currentBand: 7.0, examDate: '2026-10-15', daysRemaining: 29, trigger: 'Inactive > 7d', urgency: 'medium' }
  ]);

  // AI Exam Generator State
  const [genModule, setGenModule] = useState<'task1' | 'task2' | 'reading' | 'speaking'>('task1');
  const [genTopic, setGenTopic] = useState('Global Renewable Energy Adoption (2018–2025)');
  const [isGenerating, setIsGenerating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

  // Broadcasts State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastUrgency, setBroadcastUrgency] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [broadcastAudience, setBroadcastAudience] = useState<string>('All Students');
  const [broadcastsList, setBroadcastsList] = useState<BroadcastItem[]>([
    { id: 'bc-1', title: 'New Cambridge C2 Transformation Drills Added', message: '15 new official Key Word Transformation sets are now available in your practice studio.', audience: 'All Students', urgency: 'normal', sentAt: 'Yesterday, 14:30', recipientCount: 240 },
    { id: 'bc-2', title: 'Live Speaking Masterclass Reminder', message: 'Join Lead Assessor Hamza Arshid tonight at 19:00 UTC for Part 3 Abstract Reasoning.', audience: 'IELTS Academic Fast-Track', urgency: 'high', sentAt: 'Sep 14, 18:00', recipientCount: 120 }
  ]);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalAdmins: 0,
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalSessions: 0,
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const handleRoleChange = (userId: string, newRole: 'Student' | 'Instructor' | 'Admin') => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast.success("Role Updated", `User role updated to ${newRole}`);
  };

  const handleToggleStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        toast.success("Account Status Changed", `User is now ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleToggleFlag = (key: keyof typeof featureFlags) => {
    setFeatureFlags(prev => {
      const nextVal = !prev[key];
      toast.success("Feature Flag Updated", `${key} is now ${nextVal ? 'ENABLED' : 'DISABLED'}`);
      return { ...prev, [key]: nextVal };
    });
  };

  const INITIAL_DEFAULT_COURSES = [
    { id: '1', title: 'IELTS Academic Writing Masterclass', status: 'published', module_count: 6, students: 480, category: 'IELTS Academic', price: '$49.00', target_band: 'Band 8.0+' },
    { id: '2', title: 'Speaking Part 2 & 3 Fluency Bootcamp', status: 'published', module_count: 8, students: 720, category: 'Spoken English', price: '$39.00', target_band: 'Band 7.5+' },
    { id: '3', title: 'Advanced Lexical Collocations for Band 8.5', status: 'draft', module_count: 4, students: 0, category: 'Grammar & Vocabulary', price: '$29.00', target_band: 'Band 8.5+' }
  ];

  const fetchCourses = useCallback(async () => {
    try {
      let localList: any[] = [];
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('admin_courses');
        if (saved) {
          try {
            localList = JSON.parse(saved);
          } catch {
            localList = [];
          }
        }
      }

      let remoteItems: any[] = [];
      try {
        const res = await fetchWithAuth('/courses?page_size=100');
        if (res.ok) {
          const data = await res.json();
          if (data.items) {
            remoteItems = data.items;
          }
        }
      } catch {
        // Backend offline or local fallback
      }

      // Merge local courses, remote items, and initial defaults without duplicates
      const combined = [...localList];
      [...remoteItems, ...INITIAL_DEFAULT_COURSES].forEach(item => {
        if (!combined.some(c => c.id === item.id || c.title === item.title)) {
          combined.push(item);
        }
      });

      setCourses(combined);
      if (typeof window !== 'undefined' && localList.length === 0) {
        localStorage.setItem('admin_courses', JSON.stringify(combined));
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const [usersRes, coursesRes, sessionsRes] = await Promise.all([
        fetchWithAuth('/users'),
        fetchWithAuth('/courses?page_size=1000'),
        fetchWithAuth('/live-sessions'),
      ]);

      if (usersRes.ok) {
        const users = await usersRes.json();
        const arr = Array.isArray(users) ? users : [];
        const students = arr.filter((u: { roles?: string[] }) => u.roles?.includes('Student') && !u.roles?.includes('Admin') && !u.roles?.includes('Instructor'));
        const instructors = arr.filter((u: { roles?: string[] }) => u.roles?.includes('Instructor'));
        const admins = arr.filter((u: { roles?: string[] }) => u.roles?.includes('Admin'));
        setAnalytics(prev => ({ ...prev, totalUsers: arr.length, totalStudents: students.length, totalInstructors: instructors.length, totalAdmins: admins.length }));
      }
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        const items = data.items || [];
        const published = items.filter((c: { status?: string }) => c.status === 'published').length;
        const drafts = items.filter((c: { status?: string }) => c.status !== 'published').length;
        setAnalytics(prev => ({ ...prev, totalCourses: items.length, publishedCourses: published, draftCourses: drafts }));
      }
      if (sessionsRes.ok) {
        const sessions = await sessionsRes.json();
        setAnalytics(prev => ({ ...prev, totalSessions: Array.isArray(sessions) ? sessions.length : 0 }));
      }
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab, fetchAnalytics]);

  const handlePublishCourse = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    try {
      fetchWithAuth(`/courses/${courseId}/publish`, { method: 'POST' }).catch(() => {});
      
      setCourses(prev => {
        const updated = prev.map(c => c.id === courseId ? { ...c, status: 'published' } : c);
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_courses', JSON.stringify(updated));
        }
        return updated;
      });
      toast.success('Course Published! 🚀', 'Course is now live on the public catalog and student dashboard.');
    } catch (error) {
      console.error('Failed to publish', error);
    }
  };

  const handleUnpublishCourse = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    try {
      fetchWithAuth(`/courses/${courseId}/unpublish`, { method: 'POST' }).catch(() => {});
      
      setCourses(prev => {
        const updated = prev.map(c => c.id === courseId ? { ...c, status: 'draft' } : c);
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_courses', JSON.stringify(updated));
        }
        return updated;
      });
      toast.info('Reverted to Draft 📝', 'Course unpublished. It is no longer visible on the public site or student dashboard.');
    } catch (error) {
      console.error('Failed to unpublish', error);
    }
  };

  const handleDeleteCourse = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    setCourses(prev => {
      const updated = prev.filter(c => c.id !== courseId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_courses', JSON.stringify(updated));
      }
      return updated;
    });
    toast.success("Course Deleted 🗑️", "Course has been removed from catalog.");
  };

  const handleCreateCourse = async (overrideStatus?: 'published' | 'draft') => {
    if (!newTitle.trim()) {
      toast.error("Title Required", "Please enter a course title.");
      return;
    }
    setIsSubmitting(true);
    const finalStatus = overrideStatus || newStatus;
    
    const newCourseObj = { 
      id: 'course_' + Date.now(), 
      title: newTitle.trim(), 
      description: newDescription.trim() || 'Examiner-curated course syllabus with interactive quizzes and AI assessments.',
      category: newCategory,
      target_band: newTargetBand,
      price: newPrice,
      duration: newDuration,
      instructor: newInstructor,
      level: newLevel,
      status: finalStatus, 
      module_count: 4, 
      students: 0,
      thumbnail_url: selectedFile ? URL.createObjectURL(selectedFile) : undefined
    };

    // 1. Immediately store in state and localStorage
    setCourses(prev => {
      const updated = [newCourseObj, ...prev.filter(c => c.id !== newCourseObj.id)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_courses', JSON.stringify(updated));
      }
      return updated;
    });

    // 2. Set active tab so admin sees it immediately in Published or Drafts
    handleSelectTab(finalStatus === 'published' ? 'published' : 'drafts');

    // 3. Sync to backend API if available
    try {
      await fetchWithAuth('/courses', {
        method: 'POST',
        body: JSON.stringify({ 
          title: newTitle.trim(), 
          description: newDescription.trim(),
          category: newCategory,
          target_band: newTargetBand,
          price: newPrice,
          status: finalStatus
        }),
      });
    } catch {
      // offline dev mode
    }

    toast.success(
      finalStatus === 'published' ? 'Course Published! 🚀' : 'Course Saved as Draft 📝', 
      `"${newTitle}" is now visible under ${finalStatus === 'published' ? 'Published' : 'Drafts'} and on the public catalog!`
    );

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('Examiner-curated course syllabus with interactive lessons, practice tests, and AI rubric grading.');
    setSelectedFile(null);
    setIsSubmitting(false);
  };

  const handleSavePrompts = () => {
    setIsSavingPrompt(true);
    setTimeout(() => {
      setIsSavingPrompt(false);
      toast.success("AI Model Tuning Saved ✨", "Multi-Agent System Prompts & Temperature updated across all simulators.");
    }, 600);
  };

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden text-slate-800">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-[#0F172A] flex flex-col justify-between hidden md:flex shadow-2xl z-20">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-700 shadow-md">
                <img 
                  src="/logo.png" 
                  alt="Pen & Page Academia" 
                  className="h-8 w-auto object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors">Admin Studio</span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Management</span>
              </div>
            </Link>
          </div>
          
          <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-1 px-2.5">Curriculum &amp; AI</div>
            <button 
              onClick={() => handleSelectTab('published')} 
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${['published', 'drafts'].includes(activeTab) ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Courses &amp; Content
            </button>
            <button 
              onClick={() => handleSelectTab('generator')} 
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === 'generator' ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              AI Exam Generator
            </button>
            <button 
              onClick={() => handleSelectTab('prompts')}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === 'prompts' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              AI Prompt Tuning
            </button>
            <button 
              onClick={() => handleSelectTab('cost')}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === 'cost' ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              AI Cost &amp; Tokens
            </button>

            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-3 px-2.5">Student Operations</div>
            <button 
              onClick={() => handleSelectTab('at-risk')}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === 'at-risk' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              At-Risk Radar
            </button>
            <button 
              onClick={() => handleSelectTab('broadcast')}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === 'broadcast' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Announcements
            </button>
            <button 
              onClick={() => handleSelectTab('users')}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              User Directory
            </button>

            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-3 px-2.5">System &amp; Business</div>
            <button 
              onClick={() => handleSelectTab('revenue')}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === 'revenue' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Revenue &amp; Plans
            </button>
            <button 
              onClick={() => handleSelectTab('health')}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === 'health' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Health &amp; Exporters
            </button>
            <button 
              onClick={() => handleSelectTab('flags')}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === 'flags' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Feature Flags
            </button>
            <button 
              onClick={() => handleSelectTab('audit')}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${activeTab === 'audit' ? 'bg-red-700 text-white shadow-md shadow-red-700/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Audit Trail
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white font-semibold transition-colors text-sm">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F0F4F8]">
        
        {/* HEADER */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200/80 bg-white shadow-sm">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {activeTab === 'prompts' ? 'AI Evaluator Tuning & Prompt Engineering' :
               activeTab === 'cost' ? 'AI Token Consumption & Cloud Cost Observability' :
               activeTab === 'at-risk' ? 'At-Risk Student Radar & Intervention Cockpit' :
               activeTab === 'generator' ? 'AI Exam & Question Bank Generator 🪄' :
               activeTab === 'broadcast' ? 'Global Student Announcements & Broadcaster 📢' :
               activeTab === 'health' ? 'Infrastructure Health & 1-Click Data Exporters 🩺' :
               activeTab === 'users' ? 'User Directory & Role-Based Access Control' :
               activeTab === 'revenue' ? 'Subscription & Revenue Telemetry' :
               activeTab === 'audit' ? 'Security & FERPA Compliance Audit Trail' :
               activeTab === 'flags' ? 'Global Feature Flags & Kill Switches' :
               'Course Management & Curriculum Studio'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === 'prompts' ? 'Multi-Agent Scoring Rubric & Temperature Calibration' :
               activeTab === 'cost' ? 'Real-Time LLM Token Tracking, Audio Minutes & Budget Caps' :
               activeTab === 'at-risk' ? 'Automated Early Detection for Upcoming Exams & Score Dips' :
               activeTab === 'generator' ? '1-Click Synthesis of Authentic Task 1 Charts, Essays & Reading Batteries' :
               activeTab === 'broadcast' ? 'Send Instant Targeted Bulletins to Enrolled Cohorts' :
               activeTab === 'health' ? 'Database Latency, API Uptime & Encrypted Backup Downloads' :
               activeTab === 'users' ? 'Candidate, Instructor and Administrator Permissions' :
               activeTab === 'revenue' ? 'Monthly Recurring Revenue (MRR) & Institutional Licensing' :
               activeTab === 'audit' ? 'Encrypted Transactional Event Logs in PostgreSQL' :
               activeTab === 'flags' ? 'Instant Zero-Downtime Service Throttling' :
               'Platform Curriculum & Syllabus Administration'}
            </p>
          </div>
          {['published', 'drafts'].includes(activeTab) && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </button>
          )}
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB: PROMPTS TUNING */}
          {activeTab === 'prompts' && (
            <div className="space-y-6 max-w-4xl animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" /> Speaking Evaluator System Prompt
                    </h2>
                    <p className="text-xs text-slate-500">Defines how the multi-agent LLM evaluates audio transcriptions against IELTS Part 2/3 criteria.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">Live Agent</span>
                </div>

                <textarea
                  value={speakingPrompt}
                  onChange={e => setSpeakingPrompt(e.target.value)}
                  rows={4}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed outline-none focus:bg-white focus:border-emerald-600 transition-colors"
                />

                <div className="pt-4 border-t border-slate-100">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-purple-600" /> Writing Task 1 &amp; 2 Evaluator Prompt
                  </h2>
                  <p className="text-xs text-slate-500 mb-3">Controls strictness and vocabulary collocation suggestions in the Writing Studio.</p>

                  <textarea
                    value={writingPrompt}
                    onChange={e => setWritingPrompt(e.target.value)}
                    rows={4}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed outline-none focus:bg-white focus:border-purple-600 transition-colors"
                  />
                </div>

                {/* Hyperparameters */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="w-full sm:w-1/2">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Model Temperature</span>
                      <span className="text-purple-600">{temperature} (Determinate / Low Hallucination)</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.0" 
                      max="1.0" 
                      step="0.05" 
                      value={temperature}
                      onChange={e => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-purple-600" 
                    />
                  </div>

                  <button
                    onClick={handleSavePrompts}
                    disabled={isSavingPrompt}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all self-end"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingPrompt ? 'Saving Parameters...' : 'Save AI Parameters'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COURSES & CONTENT (PUBLISHED / DRAFTS) */}
          {['published', 'drafts'].includes(activeTab) && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Tabs & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit shadow-2xs">
                  <button 
                    onClick={() => handleSelectTab('published')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'published' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Published ({courses.filter(c => c.status === 'published').length})
                  </button>
                  <button 
                    onClick={() => handleSelectTab('drafts')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'drafts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Drafts ({courses.filter(c => c.status !== 'published').length})
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search courses..." 
                      className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 w-64 shadow-xs"
                    />
                  </div>
                  <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 shadow-xs transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* COURSE LIST (TABLE) — with responsive horizontal scroll wrapper */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[960px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Track</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Content</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Students</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">Loading courses…</td></tr>
                      ) : courses.filter(c => activeTab === 'published' ? c.status === 'published' : c.status !== 'published').length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">No courses found in this view.</td></tr>
                      ) : (
                        courses.filter(c => activeTab === 'published' ? c.status === 'published' : c.status !== 'published').map((course) => (
                        <tr key={course.id} className="hover:bg-slate-50/60 transition-colors group cursor-pointer">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                              </div>
                              <span className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{course.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                              {course.category || 'IELTS Prep'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{course.module_count || 4} Modules</p>
                              <p className="text-xs text-slate-500">Video &amp; Quizzes</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${course.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                              {course.status === 'published' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                            {(course.students || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap pr-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCourseForCurriculum(course);
                                setShowCurriculumModal(true);
                              }}
                              className="px-3 py-1.5 mr-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200 shadow-2xs"
                            >
                              Edit Curriculum
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCourseForCohort(course);
                                setShowCohortModal(true);
                              }}
                              className="px-3 py-1.5 mr-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors border border-purple-200 shadow-2xs"
                            >
                              Assign Cohort
                            </button>

                            {course.status === 'published' ? (
                              <button 
                                onClick={(e) => handleUnpublishCourse(e, course.id)}
                                className="px-3 py-1.5 mr-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors border border-amber-200 shadow-2xs"
                                title="Revert to Draft (removes from public catalog)"
                              >
                                Unpublish
                              </button>
                            ) : (
                              <button 
                                onClick={(e) => handlePublishCourse(e, course.id)}
                                className="px-3 py-1.5 mr-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm"
                                title="Make live on public catalog & student dashboard"
                              >
                                Publish
                              </button>
                            )}

                            <button
                              onClick={(e) => handleDeleteCourse(e, course.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors inline-flex items-center justify-center align-middle"
                              title="Delete Course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

              {/* TAB: USERS & ROLES */}
              {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">User Management &amp; Teacher Onboarding</h2>
                      <p className="text-xs text-slate-500">Invite instructors, enforce role-based access, and oversee student cohorts</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search users or faculty..."
                          className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 w-56 shadow-xs"
                        />
                      </div>

                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        + Invite Teacher
                      </button>
                    </div>
                  </div>

                  {/* Sub-Tabs: Roster vs Pending Invites vs Faculty */}
                  <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit shadow-2xs">
                    <button
                      onClick={() => setUserSubTab('roster')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${userSubTab === 'roster' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      All Accounts ({usersList.length})
                    </button>
                    <button
                      onClick={() => setUserSubTab('invites')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${userSubTab === 'invites' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-purple-600" />
                      Pending Teacher Invites ({staffInvites.filter(i => i.status === 'PENDING').length})
                    </button>
                    <button
                      onClick={() => setUserSubTab('instructors')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${userSubTab === 'instructors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Certified Instructors ({usersList.filter(u => u.role === 'Instructor').length})
                    </button>
                  </div>

                  {/* VIEW: PENDING TEACHER INVITATIONS */}
                  {userSubTab === 'invites' && (
                    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full min-w-[900px] text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher / Candidate</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department &amp; Role</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Courses</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expires</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Invite Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {staffInvites.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                                  No pending teacher invitations. Click <strong>+ Invite Teacher</strong> above to dispatch onboarding links.
                                </td>
                              </tr>
                            ) : (
                              staffInvites.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 text-sm">{inv.name}</div>
                                    <div className="text-xs text-slate-500 font-mono">{inv.email}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-xs font-bold text-slate-800">{inv.department}</p>
                                    <span className="text-[11px] font-semibold text-purple-600">{inv.role}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                      {inv.assignedCourses.map((c, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                                      inv.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      inv.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                      'bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}>
                                      {inv.status === 'ACCEPTED' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                                      {inv.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                    {inv.expiresAt}
                                  </td>
                                  <td className="px-6 py-4 text-right whitespace-nowrap pr-6">
                                    {inv.status === 'PENDING' && (
                                      <>
                                        <button
                                          onClick={() => handleCopyInviteLink(inv)}
                                          className="px-3 py-1.5 mr-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors border border-purple-200 shadow-2xs inline-flex items-center gap-1"
                                          title="Copy Registration URL"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                          Copy Link
                                        </button>
                                        <button
                                          onClick={() => handleResendInvite(inv)}
                                          className="px-3 py-1.5 mr-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200 shadow-2xs"
                                        >
                                          Resend
                                        </button>
                                        <button
                                          onClick={() => handleRevokeInvite(inv.id)}
                                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors border border-red-200 shadow-2xs"
                                        >
                                          Revoke
                                        </button>
                                      </>
                                    )}
                                    {inv.status === 'ACCEPTED' && (
                                      <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                                        <Check className="w-3.5 h-3.5" /> Onboarded
                                      </span>
                                    )}
                                    {inv.status === 'REVOKED' && (
                                      <span className="text-xs font-semibold text-slate-400">Revoked</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* VIEW: ROSTER TABLE (ALL OR FILTERED) */}
                  {userSubTab !== 'invites' && (
                    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full min-w-[900px] text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate / Staff</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role Access</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target Band</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-6">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {usersList
                              .filter(u => userSubTab === 'instructors' ? u.role === 'Instructor' : true)
                              .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                              .map((u) => (
                              <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                                  <div className="text-xs text-slate-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <select 
                                    value={u.role}
                                    onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                                      u.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                      u.role === 'Instructor' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                      'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}
                                  >
                                    <option value="Student">Student</option>
                                    <option value="Instructor">Instructor</option>
                                    <option value="Admin">Admin</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                                  {u.targetBand}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                                    u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}>
                                    {u.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                    {u.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                  {u.joinedDate}
                                </td>
                                <td className="px-6 py-4 text-right pr-6">
                                  <button 
                                    onClick={() => handleToggleStatus(u.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                    }`}
                                  >
                                    {u.status === 'active' ? 'Suspend' : 'Activate'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: REVENUE & PLANS */}
              {activeTab === 'revenue' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Subscription &amp; Revenue Telemetry</h2>
                    <p className="text-xs text-slate-500">Real-time breakdown of MRR, active student tier conversions, and institutional licenses</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Recurring (MRR)</p>
                      <p className="text-3xl font-extrabold text-slate-900">$18,450</p>
                      <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> +24% vs last month
                      </p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Pro Subscribers</p>
                      <p className="text-3xl font-extrabold text-slate-900">382</p>
                      <p className="text-xs text-slate-500 font-medium mt-2">Band 7.5+ Accelerator Plan</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Enterprise / Uni Seats</p>
                      <p className="text-3xl font-extrabold text-slate-900">120</p>
                      <p className="text-xs text-purple-600 font-bold mt-2">4 Partner Colleges</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Free Trial Conversions</p>
                      <p className="text-3xl font-extrabold text-slate-900">38.4%</p>
                      <p className="text-xs text-emerald-600 font-bold mt-2">Top 5% in EdTech</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Security &amp; FERPA Compliance Audit Trail</h2>
                    <p className="text-xs text-slate-500">Every authentication attempt, role alteration, and grading transaction recorded in PostgreSQL</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event Name</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actor / User</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-xs">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">
                              {log.event}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {log.actor}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {log.ip}
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-sans">
                              {log.timestamp}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`px-2 py-0.5 rounded-md font-sans text-[11px] font-bold ${
                                log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                                log.status === 'ALERT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: SYSTEM FEATURE FLAGS */}
              {activeTab === 'flags' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Global Feature Flags &amp; Kill Switches</h2>
                    <p className="text-xs text-slate-500">Instantly activate or throttle AI evaluation modules and student tools globally without redeploying</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'aiGradingEngine' as const, title: 'AI 4-Pillar Evaluation Engine', desc: 'Auto-grade essays and speaking simulator recordings via Claude/Llama APIs' },
                      { key: 'speechRealTimeTTS' as const, title: 'Native British Voice Synthesis (TTS)', desc: 'Pronunciation audio generation for vocabulary and mock listening tests' },
                      { key: 'peerSpeakingRooms' as const, title: '1-on-1 Peer Speaking Club Matcher', desc: 'Live student-to-student WebRTC audio stages and cue card shuffler' },
                      { key: 'studentCertificateExport' as const, title: 'Official IELTS Readiness PDF Export', desc: 'Allow candidates to generate and download signed readiness certificates' },
                      { key: 'maintenanceMode' as const, title: 'Global Platform Maintenance Banner', desc: 'Display scheduled maintenance warning to candidate portals' },
                    ].map((flag) => {
                      const enabled = featureFlags[flag.key];
                      return (
                        <div key={flag.key} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-bold text-slate-900 mb-1">{flag.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{flag.desc}</p>
                          </div>
                          <button
                            onClick={() => handleToggleFlag(flag.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                              enabled ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            <span>{enabled ? 'Active' : 'Disabled'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: AI COST & TOKEN OBSERVABILITY */}
              {activeTab === 'cost' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">AI Token Consumption &amp; Cloud Cost Observability</h2>
                    <p className="text-xs text-slate-500">Live multi-model token burn rate, Whisper audio minutes, and automated cost throttling caps</p>
                  </div>

                  {/* High-level Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Month-to-Date Spend</span>
                        <Coins className="w-4 h-4 text-teal-600" />
                      </div>
                      <p className="text-3xl font-extrabold text-slate-900">$342.80</p>
                      <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> -12% vs last month (optimized)
                      </p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Burn Rate</span>
                        <Zap className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-3xl font-extrabold text-slate-900">$18.40</p>
                      <p className="text-xs text-slate-500 font-medium mt-2">Cap: ${dailyBudgetCap}.00/day</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tokens Processed</span>
                        <Cpu className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-3xl font-extrabold text-slate-900">1.42M</p>
                      <p className="text-xs text-purple-600 font-bold mt-2">GPT-4o &amp; Claude 3.5</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Whisper Audio STT</span>
                        <Radio className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-3xl font-extrabold text-slate-900">142m</p>
                      <p className="text-xs text-slate-500 font-medium mt-2">48 Candidate Drills</p>
                    </div>
                  </div>

                  {/* Cost by Feature Breakdown */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-teal-600" /> Cost Allocation by AI Feature
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Writing Evaluator (GPT-4o)</span>
                          <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">$9.80 / day</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-full rounded-full w-[55%]"></div>
                        </div>
                        <p className="text-[11px] text-slate-500">114 essays scored with detailed 4-criteria rubric and sentence polisher.</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Speaking Transcriber (Whisper)</span>
                          <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">$5.40 / day</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full w-[30%]"></div>
                        </div>
                        <p className="text-[11px] text-slate-500">142 minutes of candidate audio transcribed with WPM and filler telemetry.</p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">AI Tutor Copilot (Claude)</span>
                          <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">$3.20 / day</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full w-[15%]"></div>
                        </div>
                        <p className="text-[11px] text-slate-500">268 interactive student chats &amp; grammar transformation queries.</p>
                      </div>
                    </div>
                  </div>

                  {/* Budget Cap & Safeguards */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" /> Automated Budget Throttling &amp; Fallback
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Daily Spend Cap Ceiling</span>
                          <span className="text-teal-600 font-mono text-sm">${dailyBudgetCap}.00 USD</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          step="5"
                          value={dailyBudgetCap}
                          onChange={(e) => setDailyBudgetCap(Number(e.target.value))}
                          className="w-full accent-teal-600"
                        />
                        <p className="text-[11px] text-slate-500">
                          If daily AI spend crosses ${dailyBudgetCap}.00, the system automatically enables non-critical request caching and alerts administrators.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">Auto-Fallback to GPT-4o-mini on Surge</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Reduces token cost by 90% during peak mock exam traffic hours</p>
                        </div>
                        <button
                          onClick={() => {
                            setAutoFallback(prev => !prev);
                            toast.success("Cost Safeguard Updated", `Auto-fallback is now ${!autoFallback ? 'ENABLED' : 'DISABLED'}`);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            autoFallback ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {autoFallback ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: AT-RISK STUDENT RADAR */}
              {activeTab === 'at-risk' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">At-Risk Student Radar &amp; Intervention Cockpit</h2>
                    <p className="text-xs text-slate-500">Automated early detection for candidates with upcoming official test dates and stagnant band scores</p>
                  </div>

                  {/* Band Distribution Overview */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-600" /> Platform Band Score Distribution (240 Active Students)
                    </h3>
                    <div className="grid grid-cols-5 gap-3 pt-2 text-center">
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                        <span className="text-[11px] text-rose-700 font-bold block mb-1">Band &lt; 6.0</span>
                        <span className="text-2xl font-black text-rose-900 font-mono">18</span>
                        <span className="text-[10px] text-rose-600 block mt-1">Needs Remediation</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                        <span className="text-[11px] text-amber-700 font-bold block mb-1">Band 6.0–6.5</span>
                        <span className="text-2xl font-black text-amber-900 font-mono">54</span>
                        <span className="text-[10px] text-amber-600 block mt-1">B2 Threshold</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                        <span className="text-[11px] text-blue-700 font-bold block mb-1">Band 7.0–7.5</span>
                        <span className="text-2xl font-black text-[#027FFF] font-mono">112</span>
                        <span className="text-[10px] text-blue-600 block mt-1">C1 Proficient</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                        <span className="text-[11px] text-purple-700 font-bold block mb-1">Band 8.0–8.5</span>
                        <span className="text-2xl font-black text-purple-900 font-mono">46</span>
                        <span className="text-[10px] text-purple-600 block mt-1">C2 Mastery</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[11px] text-emerald-700 font-bold block mb-1">Band 9.0</span>
                        <span className="text-2xl font-black text-emerald-900 font-mono">10</span>
                        <span className="text-[10px] text-emerald-600 block mt-1">Expert User</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Candidates Table */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-500" /> High-Priority Intervention Queue ({atRiskList.length} Flagged)
                      </h3>
                      <button
                        onClick={() => toast.success("Batch Alert Sent 🎯", "Automated practice reminders dispatched to all flagged candidates.")}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Batch Remind All
                      </button>
                    </div>

                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target vs Current</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Date</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Trigger</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Quick Intervention</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {atRiskList.map((stu) => (
                          <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{stu.name}</p>
                              <p className="text-[11px] text-slate-500">{stu.email}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 font-mono">
                                <span className="font-bold text-rose-600">{stu.currentBand.toFixed(1)}</span>
                                <span className="text-slate-400">→</span>
                                <span className="font-bold text-emerald-600">{stu.targetBand}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800">{stu.examDate}</p>
                              <p className="text-[11px] font-bold text-rose-600">{stu.daysRemaining} Days Left</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                stu.urgency === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                stu.urgency === 'high' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {stu.trigger}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => toast.success("Intervention Assigned! 🎯", `Assigned Band ${stu.targetBand} Diagnostic Recovery pack to ${stu.name}.`)}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs inline-flex items-center gap-1.5"
                              >
                                <Zap className="w-3.5 h-3.5" /> Send Study Plan
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: AI EXAM GENERATOR */}
              {activeTab === 'generator' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">AI Exam &amp; Question Bank Generator</h2>
                    <p className="text-xs text-slate-500">1-click synthesis of authentic Cambridge Task 1 visual reports, Task 2 essays, and Part 2 cue cards</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Target Exam Module</label>
                        <select
                          value={genModule}
                          onChange={(e) => setGenModule(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-pink-600"
                        >
                          <option value="task1">IELTS Academic Task 1 (Visual Chart &amp; Report)</option>
                          <option value="task2">IELTS Academic Task 2 (Discursive Essay)</option>
                          <option value="reading">IELTS Reading (Academic Passage &amp; T/F/NG)</option>
                          <option value="speaking">IELTS Speaking (Part 2 Cue Card Drill)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Subject / Academic Topic</label>
                        <input
                          type="text"
                          value={genTopic}
                          onChange={(e) => setGenTopic(e.target.value)}
                          placeholder="e.g. Artificial Intelligence in Healthcare or Urban Transport"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-pink-600"
                        />
                      </div>
                    </div>

                    <button
                      disabled={isGenerating}
                      onClick={() => {
                        setIsGenerating(true);
                        setTimeout(() => {
                          setIsGenerating(false);
                          setGeneratedResult({
                            title: `Official Assessment: ${genTopic}`,
                            module: genModule.toUpperCase(),
                            prompt: genModule === 'task1' 
                              ? `The grouped bar chart illustrates global investments in renewable energy infrastructure across 5 OECD nations between 2018 and 2025. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.`
                              : `Some economists assert that universal automated AI adoption will accelerate wealth disparity, while others contend it will democratize access to high-tier education and medical services. Discuss both views and give your opinion.`,
                            modelAnswerBand: 9.0,
                            overviewTip: "Identify the dominant macro trend across OECD cohorts without citing raw data points in the initial overview sentence.",
                            recommendedCollocations: ["experienced an unprecedented surge", "outstripped comparative benchmarks", "exerted a transformative influence"]
                          });
                          toast.success("Exam Question Synthesized! 🪄", "Calibrated against Cambridge 2026 Band 9.0 rubric.");
                        }, 900);
                      }}
                      className="px-8 py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-all shadow-md shadow-pink-600/20 flex items-center gap-2"
                    >
                      <Wand2 className="w-4 h-4" />
                      {isGenerating ? "Synthesizing Band 9.0 Question..." : "Synthesize Exam Question 🪄"}
                    </button>
                  </div>

                  {/* Generated Output Preview */}
                  {generatedResult && (
                    <div className="bg-white border border-pink-200 rounded-3xl p-6 lg:p-8 shadow-md space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                      <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-pink-700 uppercase">
                          <CheckCircle2 className="w-4 h-4 text-pink-600" />
                          Generated {generatedResult.module} Question
                        </div>
                        <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-black border border-pink-200 font-mono">
                          Band {generatedResult.modelAnswerBand} Calibrated
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 mb-2">{generatedResult.title}</h3>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-serif leading-relaxed">
                          {generatedResult.prompt}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-2">
                          Examiner Collocation Key (Band 8.5+)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {generatedResult.recommendedCollocations.map((col: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                              ✨ {col}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                        <button
                          onClick={() => {
                            toast.success("Attached to Curriculum! 📚", "Question is now live in the student practice bank.");
                            setGeneratedResult(null);
                          }}
                          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                        >
                          Save to Course Question Bank
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: GLOBAL STUDENT ANNOUNCEMENTS */}
              {activeTab === 'broadcast' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Global Student Announcements &amp; Broadcaster</h2>
                    <p className="text-xs text-slate-500">Dispatch instant notifications, test countdown alerts, and live masterclass reminders to students</p>
                  </div>

                  {/* Broadcast Composer */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-blue-600" /> Compose New Bulletin
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Target Audience</label>
                        <select
                          value={broadcastAudience}
                          onChange={(e) => setBroadcastAudience(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                        >
                          <option value="All Students">All Registered Students (240)</option>
                          <option value="IELTS Academic Fast-Track">IELTS Academic Fast-Track (120)</option>
                          <option value="Cambridge C2 Mastery">Cambridge C2 Mastery (45)</option>
                          <option value="At-Risk Candidates">At-Risk Candidates with Exams &lt; 14d (18)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Priority Level</label>
                        <select
                          value={broadcastUrgency}
                          onChange={(e) => setBroadcastUrgency(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                        >
                          <option value="normal">Normal Information (Dashboard Feed)</option>
                          <option value="high">High Priority (Toast + Banner)</option>
                          <option value="urgent">Critical Alert (Modal Pop-up on Login)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Bulletin Title</label>
                      <input
                        type="text"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="e.g. Cambridge C2 Inversion Masterclass Tonight at 19:00 UTC"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Message Body</label>
                      <textarea
                        rows={3}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type message content for student notifications..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <button
                      disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
                      onClick={() => {
                        const newBc: BroadcastItem = {
                          id: `bc-${Date.now()}`,
                          title: broadcastTitle,
                          message: broadcastMessage,
                          audience: broadcastAudience,
                          urgency: broadcastUrgency,
                          sentAt: 'Just Now',
                          recipientCount: broadcastAudience === 'All Students' ? 240 : 120
                        };
                        setBroadcastsList([newBc, ...broadcastsList]);
                        setBroadcastTitle('');
                        setBroadcastMessage('');
                        toast.success("Broadcast Dispatched! 📢", `Delivered to ${newBc.recipientCount} candidates.`);
                      }}
                      className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Dispatch Global Announcement
                    </button>
                  </div>

                  {/* Past Broadcasts Table */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Broadcast History</h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Announcement</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target Audience</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Recipients</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Sent Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {broadcastsList.map((bc) => (
                          <tr key={bc.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{bc.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{bc.message}</p>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700">
                              {bc.audience}
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-blue-600">
                              {bc.recipientCount} Students
                            </td>
                            <td className="px-6 py-4 text-right text-slate-500">
                              {bc.sentAt}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: SYSTEM HEALTH & 1-CLICK EXPORTERS */}
              {activeTab === 'health' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">System Infrastructure Health &amp; Data Exporters</h2>
                    <p className="text-xs text-slate-500">Real-time database latency, API gateway diagnostics, and 1-click encrypted CSV exports</p>
                  </div>

                  {/* Service Health Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'PostgreSQL Primary DB', status: 'Operational', latency: '12ms', color: 'emerald' },
                      { name: 'Redis Cache & Sessions', status: 'Operational', latency: '3ms', color: 'emerald' },
                      { name: 'OpenAI GPT-4o Evaluator', status: 'Operational', latency: '210ms', color: 'emerald' },
                      { name: 'Deepgram Whisper STT', status: 'Operational', latency: '165ms', color: 'emerald' },
                      { name: 'LiveKit WebRTC Audio Stage', status: 'Operational', latency: '48ms', color: 'emerald' },
                      { name: 'Stripe Webhook Gateway', status: 'Operational', latency: '99.98% Uptime', color: 'emerald' },
                    ].map((svc) => (
                      <div key={svc.name} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-xs font-bold text-slate-900">{svc.name}</p>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">Latency / Status: <strong className="text-slate-800">{svc.latency}</strong></p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                          {svc.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 1-Click Data Exporters */}
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-cyan-600" /> 1-Click Encrypted Data Backups &amp; CSV Exporters
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">Student Directory (CSV)</p>
                          <p className="text-[11px] text-slate-500 mt-1">Export 240 active candidate records with target bands, emails, and enrolled tracks.</p>
                        </div>
                        <button
                          onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8,ID,Name,Email,Role,TargetBand\nusr-1,Dr. Rohit Mehta,rohit.mehta@nhs.uk,Student,8.0\nusr-3,Sarah Chen,sarah.c@utoronto.ca,Student,7.5";
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "students_export.csv");
                            document.body.appendChild(link);
                            link.click();
                            toast.success("Export Downloaded", "students_export.csv saved.");
                          }}
                          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Student CSV
                        </button>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">Assessment History (CSV)</p>
                          <p className="text-[11px] text-slate-500 mt-1">Export complete mock exam scores, 4-criteria breakdowns, and examiner notes.</p>
                        </div>
                        <button
                          onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8,TestID,Candidate,Module,OverallBand,Date\ntest-101,Hamza Arshid,Speaking Mock #4,7.5,2026-09-16\ntest-102,Sarah Chen,Writing Task 2,8.0,2026-09-15";
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "assessments_export.csv");
                            document.body.appendChild(link);
                            link.click();
                            toast.success("Export Downloaded", "assessments_export.csv saved.");
                          }}
                          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Assessments CSV
                        </button>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">FERPA Audit Log Trail (CSV)</p>
                          <p className="text-[11px] text-slate-500 mt-1">Export transactional access events, role elevations, and IP logs for compliance.</p>
                        </div>
                        <button
                          onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8,Event,Actor,IP,Timestamp,Status\nAUTH_LOGIN,rohit.mehta@nhs.uk,192.168.1.42,2 mins ago,SUCCESS\nROLE_PROMOTION,admin@ppacademia.com,127.0.0.1,14 mins ago,SUCCESS";
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "audit_logs.csv");
                            document.body.appendChild(link);
                            link.click();
                            toast.success("Export Downloaded", "audit_logs.csv saved.");
                          }}
                          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Audit CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

        </div>
      </main>

      {/* CREATE COURSE MODAL OVERLAY */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Create &amp; Configure New Course
                </h2>
                <p className="text-xs text-slate-500">Design syllabus, target band score, pricing model, and media assets.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Course Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="e.g. IELTS Academic Writing Task 2 Masterclass" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 text-sm font-medium transition-colors" 
                />
              </div>

              {/* Description & Syllabus Overview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description &amp; Syllabus Overview
                </label>
                <textarea 
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe what students will achieve in this course..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 text-sm font-medium transition-colors resize-none"
                />
              </div>

              {/* 2-Column: Track Category & Target Band */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Track Alignment / Category
                  </label>
                  <select 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 text-sm font-medium transition-colors"
                  >
                    <option>IELTS Preparation</option>
                    <option>IELTS Academic</option>
                    <option>IELTS General Training</option>
                    <option>General English</option>
                    <option>Business English &amp; Fluency</option>
                    <option>Grammar &amp; Vocabulary Booster</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Target Band / Level
                  </label>
                  <select 
                    value={newTargetBand} 
                    onChange={(e) => setNewTargetBand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 text-sm font-medium transition-colors"
                  >
                    <option>Band 7.5+</option>
                    <option>Band 8.0+ (Elite)</option>
                    <option>Band 8.5+</option>
                    <option>Band 6.5 - 7.0 (Target)</option>
                    <option>C1 Advanced (CEFR)</option>
                    <option>B2 Upper Intermediate</option>
                  </select>
                </div>
              </div>

              {/* 2-Column: Pricing Tier & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Pricing &amp; Access Tier
                  </label>
                  <select 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 text-sm font-medium transition-colors"
                  >
                    <option>$49.00 (Standard)</option>
                    <option>$0 (Free Access)</option>
                    <option>$79.00 (Pro Cohort)</option>
                    <option>$129.00 (1-on-1 Mentored)</option>
                    <option>Included in Pro Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Course Duration &amp; Hours
                  </label>
                  <select 
                    value={newDuration} 
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 text-sm font-medium transition-colors"
                  >
                    <option>6 Weeks / 30 Hours</option>
                    <option>4 Weeks / 20 Hours (Crash Course)</option>
                    <option>8 Weeks / 45 Hours (Comprehensive)</option>
                    <option>12 Weeks / 60 Hours (Full Diploma)</option>
                  </select>
                </div>
              </div>

              {/* 2-Column: Lead Instructor & Course Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Assigned Lead Instructor
                  </label>
                  <select 
                    value={newInstructor} 
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 text-sm font-medium transition-colors"
                  >
                    <option>Hamza Arshid (Lead Assessor)</option>
                    <option>Prof. Alistair Finch (Oxford / British Council)</option>
                    <option>Sarah Jenkins (Senior IELTS Examiner)</option>
                    <option>Dr. Rohit Mehta (IELTS Medical Track)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Difficulty Level
                  </label>
                  <select 
                    value={newLevel} 
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-600 text-sm font-medium transition-colors"
                  >
                    <option>Intermediate to Advanced</option>
                    <option>All Levels Welcome</option>
                    <option>Advanced Masterclass</option>
                    <option>Foundation / Beginner</option>
                  </select>
                </div>
              </div>

              {/* Initial Asset Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Course Syllabus / Introductory Video Asset
                </label>
                <label className="border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 cursor-pointer transition-colors group relative">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept="video/mp4,application/pdf,text/markdown"
                  />
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-slate-900 font-bold">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag & drop file'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB uploaded` : 'MP4 Video Lecture, PDF Syllabus, or Markdown (Max 100MB)'}
                  </p>
                </label>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Cancel
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleCreateCourse('draft')} 
                  disabled={isSubmitting || !newTitle.trim()} 
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 text-sm font-bold transition-colors shadow-sm"
                >
                  Save as Draft
                </button>
                <button 
                  onClick={() => handleCreateCourse('published')} 
                  disabled={isSubmitting || !newTitle.trim()} 
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Create &amp; Publish Course
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CURRICULUM & LESSON BUILDER MODAL */}
      {showCurriculumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Curriculum &amp; Lesson Builder</h2>
                <p className="text-xs text-slate-500">{selectedCourseForCurriculum?.title || 'IELTS Academic Course'}</p>
              </div>
              <button onClick={() => setShowCurriculumModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Existing Modules & Lessons */}
              <div className="space-y-4">
                {modulesList.map((mod, modIdx) => (
                  <div key={mod.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        {mod.title}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                        {mod.lessons.length} Lessons
                      </span>
                    </div>

                    <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                      {mod.lessons.map((les) => (
                        <div key={les.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              les.type === 'video' ? 'bg-blue-100 text-blue-700' :
                              les.type === 'quiz' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {les.type.toUpperCase()}
                            </span>
                            <span className="font-medium text-slate-800">{les.title}</span>
                          </div>
                          <span className="text-slate-400 font-medium">{les.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Lesson to Module Form */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                <p className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add New Lesson to Curriculum
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select 
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none"
                  >
                    {modulesList.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>

                  <input 
                    type="text"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="Lesson Title (e.g. Video: Speaking Part 3 Strategy)"
                    className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    {(['video', 'quiz', 'doc'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewLessonType(t)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          newLessonType === t ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newLessonTitle.trim()) return;
                      setModulesList(prev => prev.map(m => {
                        if (m.id === selectedModuleId) {
                          return {
                            ...m,
                            lessons: [...m.lessons, {
                              id: 'les-' + Date.now(),
                              title: newLessonTitle.trim(),
                              type: newLessonType,
                              duration: '10 mins'
                            }]
                          };
                        }
                        return m;
                      }));
                      toast.success("Lesson Added", `"${newLessonTitle}" attached to module.`);
                      setNewLessonTitle('');
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Save Lesson
                  </button>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowCurriculumModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Close &amp; Save Curriculum
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BULK COHORT ASSIGNER MODAL */}
      {showCohortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Assign Course to Student Cohort</h2>
                <p className="text-xs text-slate-500">{selectedCourseForCohort?.title || 'Selected Course'}</p>
              </div>
              <button onClick={() => setShowCohortModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Cohort / Batch Label</label>
                <input 
                  type="text"
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Students to Enroll ({selectedStudentIds.length} Selected)</label>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
                  {usersList.filter(u => u.role === 'Student').map((stu) => {
                    const isChecked = selectedStudentIds.includes(stu.id);
                    return (
                      <div 
                        key={stu.id}
                        onClick={() => {
                          setSelectedStudentIds(prev => isChecked ? prev.filter(id => id !== stu.id) : [...prev, stu.id]);
                        }}
                        className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors text-xs ${isChecked ? 'bg-purple-50/60' : 'hover:bg-slate-50'}`}
                      >
                        <div>
                          <p className="font-bold text-slate-900">{stu.name}</p>
                          <p className="text-[11px] text-slate-500">{stu.email} • Target Band {stu.targetBand}</p>
                        </div>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-purple-600 rounded border-slate-300 pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowCohortModal(false)} className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900">Cancel</button>
              <button 
                onClick={() => {
                  toast.success("Cohort Enrolled! 🎓", `Successfully assigned ${selectedStudentIds.length} students to "${cohortName}".`);
                  setShowCohortModal(false);
                }} 
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Enroll & Notify Cohort
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEACHER INVITATION MODAL */}
      {/* ========================================================================= */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Invite Teacher / Examiner</h3>
                  <p className="text-xs text-slate-500 font-medium">Issue secure onboard link with role permissions and assigned courses</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Teacher Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Pendelton"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-purple-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="examiner@cambridge-ielts.org"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-purple-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Staff Role Assignment
                  </label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-purple-600 transition-colors"
                  >
                    <option value="Instructor">Certified Instructor</option>
                    <option value="Lead Examiner">Lead IELTS Assessor</option>
                    <option value="Teaching Assistant">Teaching Assistant / Mentor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Department / Specialty
                  </label>
                  <select 
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-purple-600 transition-colors"
                  >
                    <option>IELTS Academic Writing & Speaking</option>
                    <option>IELTS General Training & Reading</option>
                    <option>PTE & OET Medical English</option>
                    <option>Grammar & Pronunciation Masterclass</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assigned Courses & Cohorts
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {courses.map(course => {
                    const isSelected = inviteCourses.includes(course.title);
                    return (
                      <label 
                        key={course.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                          isSelected ? 'bg-purple-100 text-purple-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInviteCourses(prev => [...prev, course.title]);
                            } else {
                              setInviteCourses(prev => prev.filter(c => c !== course.title));
                            }
                          }}
                          className="w-3.5 h-3.5 text-purple-600 rounded border-slate-300"
                        />
                        <span className="truncate">{course.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Welcome Note & Onboarding Briefing (Optional)
                </label>
                <textarea 
                  rows={2}
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  placeholder="Welcome to Pen & Page Academy! You have been granted examiner privileges for the Band 8.5 Masterclass cohort."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-600 transition-colors resize-none"
                />
              </div>

              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                  The teacher will receive an onboarding invite link with an encrypted authorization token. Once registered, their account will immediately be verified as <strong className="font-bold">Instructor</strong> and given access to the Instructor Assessment Studio.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendTeacherInvite}
                disabled={isSubmitting || !inviteEmail.trim() || !inviteName.trim()}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-black transition-all shadow-md shadow-purple-200 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating Token...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Official Invitation 🚀
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#F0F4F8] flex items-center justify-center text-slate-400 font-semibold">Loading Admin Studio...</div>}>
      <AdminCoursesContent />
    </Suspense>
  );
}
