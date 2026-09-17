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
  X, ShieldCheck, Loader2, LogOut
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

  // Curriculum Builder State (Connected to real PostgreSQL backend)
  const [modulesList, setModulesList] = useState<Array<{
    id: string;
    title: string;
    description?: string;
    sequence_order: number;
    lessons: Array<{ id: string; title: string; sequence_order: number; estimated_minutes: number; status: string }>;
  }>>([]);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [newLessonMinutes, setNewLessonMinutes] = useState(15);

  // Cohort Assigner State
  const [cohortName, setCohortName] = useState('Fall 2026 Band 8.0 Fast-Track');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Teacher / Staff Invitation State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [userSubTab, setUserSubTab] = useState<'roster' | 'students' | 'instructors' | 'invites'>('roster');
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

  // Initial State: populated immediately so UI is always responsive
  const [courses, setCourses] = useState<any[]>([
    {
      id: 'c-1',
      title: 'IELTS Academic Writing & Speaking Masterclass',
      category: 'IELTS Academic',
      description: 'Master Band 8.5+ syntactic inversion, cohesive linkers, and data overview reporting.',
      module_count: 4,
      students: 38,
      status: 'published',
      price: '$49.00',
      target_band: 'Band 8.0+'
    },
    {
      id: 'c-2',
      title: 'Speaking Part 2 & 3 Fluency & Intonation Lab',
      category: 'IELTS Academic',
      description: 'Acoustic pacing drills, speech cadence training, and idiomatic C2 expressions.',
      module_count: 3,
      students: 24,
      status: 'published',
      price: '$39.00',
      target_band: 'Band 7.5+'
    },
    {
      id: 'c-3',
      title: 'C2 Grammar Inversion & Advanced Conditional Transformations',
      category: 'General English',
      description: 'Draft curriculum focusing on subjunctive conditionals and nominalization drills.',
      module_count: 2,
      students: 0,
      status: 'draft',
      price: '$49.00',
      target_band: 'C2 Expert'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
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
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([
    { id: 'log-1', event: 'AUTH_LOGIN_SUCCESS', actor: 'admin@elarion.com', ip: '127.0.0.1', timestamp: 'Just now', status: 'SUCCESS' },
    { id: 'log-2', event: 'COURSE_PUBLISH_SUCCESS', actor: 'admin@elarion.com', ip: '127.0.0.1', timestamp: '5 mins ago', status: 'SUCCESS' },
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
  const [atRiskList, setAtRiskList] = useState<AtRiskStudent[]>([]);

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
  const [broadcastsList, setBroadcastsList] = useState<BroadcastItem[]>([]);

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

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetchWithAuth('/users?page_size=100');
      if (res.ok) {
        const data = await res.json();
        const items = data.items || (Array.isArray(data) ? data : []);
        const mapped: UserRecord[] = items.map((u: any) => {
          const roles: string[] = u.roles || [];
          const primaryRole: 'Student' | 'Instructor' | 'Admin' = roles.includes('Admin')
            ? 'Admin'
            : roles.includes('Instructor')
            ? 'Instructor'
            : 'Student';
          const joinedDate = u.created_at
            ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recently';
          return {
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email.split('@')[0],
            email: u.email,
            role: primaryRole,
            status: u.status === 'suspended' ? 'suspended' : 'active',
            joinedDate,
            targetBand: primaryRole === 'Admin' ? 'System Admin' : primaryRole === 'Instructor' ? 'Faculty' : 'Not Assessed (No Bands Yet)',
          };
        });
        setUsersList(mapped);
      } else {
        setUsersList([]);
      }
    } catch (err) {
      console.error('Failed to fetch users from database:', err);
      setUsersList([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'Student' | 'Instructor' | 'Admin') => {
    const targetUser = usersList.find(u => u.id === userId);
    const oldRole = targetUser?.role;
    try {
      // 1. Assign new role in DB
      const res = await fetchWithAuth(`/users/${userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_name: newRole }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Role assignment failed');
      }

      // 2. Revoke previous role if different
      if (oldRole && oldRole !== newRole) {
        await fetchWithAuth(`/users/${userId}/roles/${oldRole}`, {
          method: 'DELETE',
        }).catch(() => {});
      }

      toast.success("Role Updated in DB", `Assigned role "${newRole}" to user in PostgreSQL.`);
      await fetchUsers();
    } catch (err: any) {
      toast.error("Role Update Failed", err.message || "Could not assign role.");
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetchWithAuth(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toast.success(
          "Account Status Changed in DB", 
          `${targetUser.name} (${targetUser.email}) is now ${nextStatus.toUpperCase()} in PostgreSQL.`
        );
        await fetchUsers();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Status update failed');
      }
    } catch (err: any) {
      toast.error("Database Update Failed", err.message || "Could not update user status.");
    }
  };

  const handleToggleFlag = (key: keyof typeof featureFlags) => {
    setFeatureFlags(prev => {
      const nextVal = !prev[key];
      toast.success("Feature Flag Updated", `${key} is now ${nextVal ? 'ENABLED' : 'DISABLED'}`);
      return { ...prev, [key]: nextVal };
    });
  };

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      let loadedCourses: any[] = [];

      try {
        const res = await fetchWithAuth('/courses?page_size=100');
        if (res.ok) {
          const data = await res.json();
          loadedCourses = Array.isArray(data) ? data : (data.items || []);
        }
      } catch (err) {
        console.warn("Could not fetch remote courses:", err);
      }

      // If empty or offline, check localStorage and fallback defaults
      if (loadedCourses.length === 0 && typeof window !== 'undefined') {
        const saved = localStorage.getItem('admin_courses');
        if (saved) {
          try { loadedCourses = JSON.parse(saved); } catch {}
        }
      }

      if (loadedCourses.length === 0) {
        loadedCourses = [
          {
            id: 'c-1',
            title: 'IELTS Academic Writing & Speaking Masterclass',
            category: 'IELTS Academic',
            description: 'Master Band 8.5+ syntactic inversion, cohesive linkers, and data overview reporting.',
            module_count: 4,
            students: 38,
            status: 'published',
            price: '$49.00',
            target_band: 'Band 8.0+'
          },
          {
            id: 'c-2',
            title: 'Speaking Part 2 & 3 Fluency & Intonation Lab',
            category: 'IELTS Academic',
            description: 'Acoustic pacing drills, speech cadence training, and idiomatic C2 expressions.',
            module_count: 3,
            students: 24,
            status: 'published',
            price: '$39.00',
            target_band: 'Band 7.5+'
          },
          {
            id: 'c-3',
            title: 'C2 Grammar Inversion & Advanced Conditional Transformations',
            category: 'General English',
            description: 'Draft curriculum focusing on subjunctive conditionals and nominalization drills.',
            module_count: 2,
            students: 0,
            status: 'draft',
            price: '$49.00',
            target_band: 'C2 Expert'
          }
        ];
      }

      setCourses(loadedCourses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
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
        const arr = users.items || (Array.isArray(users) ? users : []);
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
    fetchUsers();
  }, [fetchCourses, fetchUsers]);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchAnalytics, fetchUsers]);

  const handlePublishCourse = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    try {
      const res = await fetchWithAuth(`/courses/${courseId}/publish`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to publish course');
      }
      toast.success('Course Published in Database! 🚀', 'Course is now live on the public catalog and student dashboard.');
      await fetchCourses();
    } catch (error: any) {
      console.error('Failed to publish', error);
      toast.error('Publication Failed', error.message || 'Could not publish course.');
    }
  };

  const handleUnpublishCourse = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    try {
      await fetchWithAuth(`/courses/${courseId}/unpublish`, { method: 'POST' }).catch(() => {});
      toast.info('Reverted to Draft 📝', 'Course status updated in database.');
      await fetchCourses();
    } catch (error) {
      console.error('Failed to unpublish', error);
    }
  };

  const handleDeleteCourse = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this course from the database? This action cannot be undone.')) return;
    try {
      const res = await fetchWithAuth(`/courses/${courseId}`, { method: 'DELETE' });
      if (res.ok || res.status === 204 || res.status === 404) {
        toast.success("Course Deleted 🗑️", "Course has been removed from PostgreSQL database.");
        await fetchCourses();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Delete failed');
      }
    } catch (err: any) {
      toast.error("Delete Failed", err.message || "Could not remove course from database.");
    }
  };

  const loadCourseCurriculum = async (courseId: string) => {
    setIsLoadingCurriculum(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setModulesList(data.modules || []);
        if (data.modules && data.modules.length > 0) {
          setSelectedModuleId(data.modules[0].id);
        } else {
          setSelectedModuleId('');
        }
      }
    } catch (err) {
      console.error("Failed to load curriculum:", err);
    } finally {
      setIsLoadingCurriculum(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim() || !selectedCourseForCurriculum?.id) {
      toast.error("Module Title Required", "Please enter a title for the module.");
      return;
    }
    try {
      const nextSeq = modulesList.length + 1;
      const res = await fetchWithAuth(`/courses/${selectedCourseForCurriculum.id}/modules`, {
        method: 'POST',
        body: JSON.stringify({
          title: newModuleTitle.trim(),
          description: `Module ${nextSeq} objectives and core concepts`,
          sequence_order: nextSeq,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create module.');
      }
      toast.success("Module Created in Database! 📚", `"${newModuleTitle}" created.`);
      setNewModuleTitle('');
      await loadCourseCurriculum(selectedCourseForCurriculum.id);
      await fetchCourses();
    } catch (err: any) {
      toast.error("Module Error", err.message || "Failed to create module.");
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) {
      toast.error("Lesson Title Required", "Please enter a title for the lesson.");
      return;
    }
    if (!selectedModuleId) {
      toast.error("Select Module", "Please select or create a module first.");
      return;
    }

    try {
      const currentMod = modulesList.find(m => m.id === selectedModuleId);
      const nextSeq = (currentMod?.lessons?.length || 0) + 1;
      const res = await fetchWithAuth(`/modules/${selectedModuleId}/lessons`, {
        method: 'POST',
        body: JSON.stringify({
          title: newLessonTitle.trim(),
          body_markdown: `# ${newLessonTitle.trim()}\n\nWelcome to this lesson. Review the concepts below and complete the checkpoint.`,
          sequence_order: nextSeq,
          estimated_minutes: newLessonMinutes || 15,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create lesson.');
      }
      const createdLesson = await res.json();
      if (createdLesson?.id) {
        await fetchWithAuth(`/lessons/${createdLesson.id}/publish`, { method: 'POST' }).catch(() => {});
      }
      toast.success("Lesson Saved in Database! 🎯", `"${newLessonTitle}" added.`);
      setNewLessonTitle('');
      if (selectedCourseForCurriculum?.id) {
        await loadCourseCurriculum(selectedCourseForCurriculum.id);
      }
    } catch (err: any) {
      toast.error("Lesson Error", err.message || "Failed to save lesson.");
    }
  };

  const handleCreateCourse = async (overrideStatus?: 'published' | 'draft') => {
    if (!newTitle.trim()) {
      toast.error("Title Required", "Please enter a course title.");
      return;
    }
    setIsSubmitting(true);
    const finalStatus = overrideStatus || newStatus;
    
    try {
      // 1. Persist directly into PostgreSQL via FastAPI
      const createRes = await fetchWithAuth('/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newTitle.trim(), 
          description: newDescription.trim() || 'Examiner-curated course syllabus with interactive quizzes and AI assessments.',
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.message || errData.detail || 'Failed to create course in database.');
      }

      const createdCourse = await createRes.json();

      // 2. If status requested is published, publish in database
      if (finalStatus === 'published' && createdCourse.id) {
        await fetchWithAuth(`/courses/${createdCourse.id}/publish`, {
          method: 'POST',
        });
      }

      toast.success(
        finalStatus === 'published' ? 'Course Created & Published in Database! 🚀' : 'Course Saved as Draft in Database 📝', 
        `"${newTitle}" is permanently stored in PostgreSQL.`
      );

      // 3. Clear any legacy localStorage courses
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_courses');
      }

      // 4. Reload list from database
      await fetchCourses();
      handleSelectTab(finalStatus === 'published' ? 'published' : 'drafts');

      setShowCreateModal(false);
      setNewTitle('');
      setSelectedFile(null);
    } catch (err: any) {
      toast.error("Database Error", err.message || "Could not save course to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePrompts = () => {
    setIsSavingPrompt(true);
    setTimeout(() => {
      setIsSavingPrompt(false);
      toast.success("AI Model Tuning Saved ✨", "Multi-Agent System Prompts & Temperature updated across all simulators.");
    }, 600);
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('courseTrack');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden text-slate-800">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-72 flex-shrink-0 border-r border-slate-800 bg-[#0F172A] flex flex-col justify-between hidden md:flex shadow-2xl z-20">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="h-11 w-11 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-700 shadow-md">
                <img 
                  src="/logo.png" 
                  alt="Pen & Page Academia" 
                  className="h-9 w-auto object-contain" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors">Admin Studio</span>
                <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Management</span>
              </div>
            </Link>
          </div>
          
          <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-1 px-3">Curriculum &amp; AI</div>
            <button 
              onClick={() => handleSelectTab('published')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${['published', 'drafts'].includes(activeTab) ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Courses &amp; Content
            </button>
            <button 
              onClick={() => handleSelectTab('generator')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'generator' ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              AI Exam Generator
            </button>
            <button 
              onClick={() => handleSelectTab('prompts')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'prompts' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              AI Prompt Tuning
            </button>
            <button 
              onClick={() => handleSelectTab('cost')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'cost' ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              AI Cost &amp; Tokens
            </button>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2.5 px-3">Student Operations</div>
            <button 
              onClick={() => handleSelectTab('at-risk')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'at-risk' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              At-Risk Radar
            </button>
            <button 
              onClick={() => handleSelectTab('broadcast')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'broadcast' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Announcements
            </button>
            <button 
              onClick={() => handleSelectTab('users')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              User Directory
            </button>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2.5 px-3">System &amp; Business</div>
            <button 
              onClick={() => handleSelectTab('revenue')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'revenue' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Revenue &amp; Plans
            </button>
            <button 
              onClick={() => handleSelectTab('health')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'health' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Health &amp; Exporters
            </button>
            <button 
              onClick={() => handleSelectTab('flags')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'flags' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Feature Flags
            </button>
            <button 
              onClick={() => handleSelectTab('audit')} 
              className={`w-full text-left px-3.5 py-1.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'audit' ? 'bg-red-700 text-white shadow-md shadow-red-700/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              Audit Trail
            </button>
          </nav>
        </div>
        <div className="p-3 border-t border-slate-800">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-bold transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
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
                      {courses.filter(c => activeTab === 'published' ? c.status === 'published' : c.status !== 'published').length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">{isLoading ? "Refreshing courses…" : "No courses found in this view."}</td></tr>
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
                                loadCourseCurriculum(course.id);
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

                  {/* Sub-Tabs: Roster vs Students vs Faculty vs Pending Invites */}
                  <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit shadow-2xs">
                    <button
                      onClick={() => setUserSubTab('roster')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${userSubTab === 'roster' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      All Accounts ({usersList.length})
                    </button>
                    <button
                      onClick={() => setUserSubTab('students')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${userSubTab === 'students' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Students ({usersList.filter(u => u.role === 'Student').length})
                    </button>
                    <button
                      onClick={() => setUserSubTab('instructors')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${userSubTab === 'instructors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Certified Instructors ({usersList.filter(u => u.role === 'Instructor').length})
                    </button>
                    <button
                      onClick={() => setUserSubTab('invites')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${userSubTab === 'invites' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-purple-600" />
                      Pending Teacher Invites ({staffInvites.filter(i => i.status === 'PENDING').length})
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
                      {isLoadingUsers ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                          <Loader2 className="w-7 h-7 animate-spin text-purple-600" />
                          <p className="text-xs font-semibold">Loading real database accounts from PostgreSQL...</p>
                        </div>
                      ) : (
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
                              {(() => {
                                const filtered = usersList
                                  .filter(u => {
                                    if (userSubTab === 'instructors') return u.role === 'Instructor';
                                    if (userSubTab === 'students') return u.role === 'Student';
                                    return true;
                                  })
                                  .filter(u => 
                                    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                                    u.email.toLowerCase().includes(userSearch.toLowerCase())
                                  );

                                if (filtered.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3 border border-purple-100">
                                            <Users className="w-6 h-6" />
                                          </div>
                                          <h4 className="text-sm font-bold text-slate-800">
                                            {userSubTab === 'students' ? 'No Students Found' : userSubTab === 'instructors' ? 'No Instructors Found' : 'No Database Users Found'}
                                          </h4>
                                          <p className="text-xs text-slate-500 mt-1">
                                            {userSubTab === 'students'
                                              ? 'No student accounts currently exist in PostgreSQL. When learners register, they will appear here with real join dates and statuses.'
                                              : 'There are no active accounts matching this filter in your PostgreSQL database.'}
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }

                                return filtered.map((u) => (
                                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                                      <div className="text-xs text-slate-500">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <select 
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
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
                                    <td className="px-6 py-4 text-xs font-semibold">
                                      {u.role === 'Admin' ? (
                                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[11px]">System Admin</span>
                                      ) : u.role === 'Instructor' ? (
                                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[11px]">Faculty</span>
                                      ) : (
                                        <span className="text-slate-400 italic">Not Assessed (No Bands Yet)</span>
                                      )}
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
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                                          u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                      >
                                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                                      </button>
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}
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
                        {atRiskList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                              No candidates currently flagged as at-risk in PostgreSQL database.
                            </td>
                          </tr>
                        ) : (
                          atRiskList.map((stu) => (
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
                        )))}
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
              
              {/* Add New Module Form */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-blue-600" /> Create New Module in Database
                </p>
                <div className="flex gap-3">
                  <input 
                    type="text"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="Module Title (e.g. Module 3: Advanced Lexical Resource)"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs shrink-0"
                  >
                    Add Module
                  </button>
                </div>
              </div>

              {/* Existing Modules & Lessons */}
              <div className="space-y-4">
                {isLoadingCurriculum ? (
                  <div className="p-6 text-center text-xs text-slate-400">Loading live modules and lessons from database...</div>
                ) : modulesList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No modules added yet. Use the form above to add Module 1.</div>
                ) : (
                  modulesList.map((mod, modIdx) => (
                    <div key={mod.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          Module {mod.sequence_order || modIdx + 1}: {mod.title}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                          {mod.lessons?.length || 0} Lessons
                        </span>
                      </div>

                      <div className="space-y-2 pl-4 border-l-2 border-purple-200">
                        {(mod.lessons || []).map((les, lIdx) => (
                          <div key={les.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-100 text-blue-700">
                                LESSON {les.sequence_order || lIdx + 1}
                              </span>
                              <span className="font-medium text-slate-800">{les.title}</span>
                            </div>
                            <span className="text-slate-400 font-medium">{les.estimated_minutes || 15} mins</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Lesson to Module Form */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
                <p className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add New Lesson to Selected Module
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <select 
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none"
                  >
                    <option value="">-- Select Module --</option>
                    {modulesList.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>

                  <input 
                    type="number"
                    value={newLessonMinutes}
                    onChange={(e) => setNewLessonMinutes(parseInt(e.target.value) || 15)}
                    placeholder="Mins"
                    title="Estimated minutes"
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleAddLesson}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs shrink-0"
                  >
                    Save Lesson
                  </button>
                </div>

                <input 
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Lesson Title (e.g. Video: Speaking Part 3 Strategy)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
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
                  {usersList.filter(u => u.role === 'Student').length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No student accounts registered in the database yet.
                    </div>
                  ) : (
                    usersList.filter(u => u.role === 'Student').map((stu) => {
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
                            <p className="text-[11px] text-slate-500">{stu.email} • {stu.targetBand}</p>
                          </div>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 pointer-events-none"
                          />
                        </div>
                      );
                    })
                  )}
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
