"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ToastProvider';
import { saveAuthSession } from '@/lib/auth-storage';

export default function SignupPage() {
  const router = useRouter();

  // Mode: 'learner' | 'educator_parent'
  const [userType, setUserType] = useState<'learner' | 'educator_parent'>('learner');

  // Exact Brilliant Steps:
  // 0: Tutor Greeting ("Hi, I’m Koji! I’ll be your personal tutor.")
  // 1: Motivation ("What motivates you to learn?")
  // 2: Voice Calibration ("How do you want me to sound?")
  // 3: Subject ("What do you want to learn first?")
  // 4: Skill Level ("What level of programming / math are you currently at?")
  // 5: Daily Goal ("What’s your daily learning goal?")
  // 6: Schedule Habit ("How will learning fit into your day?")
  // 7: Registration ("Almost there! Ask a parent or guardian / email permission")
  // 8: Welcome / First Steps & Upsell Modal
  const [step, setStep] = useState(0);

  // Learner selections (Unselected by default, exactly matching Brilliant.org flow)
  const [goal, setGoal] = useState<string | null>(null);
  const [voiceSound, setVoiceSound] = useState<'melodic' | 'deep'>('melodic');
  const [voiceOn, setVoiceOn] = useState<boolean>(true);
  const [track, setTrack] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [grade, setGrade] = useState<number>(1);
  const [dailyTime, setDailyTime] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState<string | null>(null);

  // Educator / Parent specific selections
  const [educatorRole, setEducatorRole] = useState<'parent' | 'homeschooling' | 'teacher' | 'learning_for_myself' | null>(null);
  const [institutionName, setInstitutionName] = useState('');
  const [studentCount, setStudentCount] = useState('1-30');

  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInstructorInvite, setIsInstructorInvite] = useState(false);

  // Premium upsell modal state after account creation
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite');
      const emailParam = params.get('email');
      const roleParam = params.get('role');

      if (roleParam === 'instructor' || roleParam === 'teacher' || roleParam === 'parent' || invite) {
        setUserType('educator_parent');
        setIsInstructorInvite(true);
        if (roleParam === 'parent') setEducatorRole('parent');
        if (roleParam === 'instructor' || roleParam === 'teacher') setEducatorRole('teacher');
        if (emailParam) setEmail(decodeURIComponent(emailParam));
      } else {
        setUserType('learner');
      }
    }
  }, []);

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);

  const handleNextStep = () => {
    if (step === 1) {
      if (userType === 'learner' && !goal) {
        toast.error('Selection Required', 'Please choose an option to continue.');
        return;
      }
      if (userType === 'educator_parent' && !educatorRole) {
        toast.error('Selection Required', 'Please choose an option to continue.');
        return;
      }
    }
    if (step === 2 && !voiceSound) {
      toast.error('Selection Required', 'Please select a voice style.');
      return;
    }
    if (step === 3 && !track) {
      toast.error('Selection Required', 'Please select what you want to learn first.');
      return;
    }
    if (step === 4 && !level) {
      toast.error('Selection Required', 'Please select your current experience level.');
      return;
    }
    if (step === 5 && !dailyTime) {
      toast.error('Selection Required', 'Please choose your daily learning goal.');
      return;
    }
    if (step === 6 && !scheduleTime) {
      toast.error('Selection Required', 'Please select how learning fits into your day.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim() || 'Welcome2026!';
    const emailPrefix = cleanEmail.split('@')[0] || 'Learner';
    const cleanFirst = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    const cleanLast = 'Student';

    if (!cleanEmail) {
      setError('Please provide a valid email address.');
      toast.error('Email Required', 'Please enter your email to finish.');
      return;
    }

    setLoading(true);

    try {
      let response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          first_name: cleanFirst,
          last_name: cleanLast,
        }),
      }).catch(() => null);

      if (!response || !response.ok) {
        const fastapiRes = await fetch('http://localhost:8000/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
            first_name: cleanFirst,
            last_name: cleanLast,
          }),
        }).catch(() => null);

        if (fastapiRes && fastapiRes.ok) {
          response = fastapiRes;
        }
      }

      if (response && response.ok) {
        const fullName = `${cleanFirst} ${cleanLast}`.trim() || (userType === 'learner' ? 'Learner' : 'Educator');
        let role = 'Student';
        if (cleanEmail.includes('admin')) {
          role = 'Admin';
        } else if (
          userType === 'educator_parent' ||
          cleanEmail.includes('instructor') ||
          cleanEmail.includes('teacher') ||
          isInstructorInvite
        ) {
          role = 'Instructor';
        }

        saveAuthSession('dev_token_' + Date.now());

        // Store Brilliant-style personalization preferences
        if (typeof window !== 'undefined') {
          localStorage.setItem('onboarding_user_type', userType);
          localStorage.setItem('onboarding_goal', goal || 'school');
          localStorage.setItem('onboarding_voice_sound', voiceSound);
          localStorage.setItem('onboarding_voice_on', String(voiceOn));
          localStorage.setItem('onboarding_track', track || 'math');
          localStorage.setItem('onboarding_level', level || 'beginner');
          localStorage.setItem('student_grade', String(grade));
          localStorage.setItem('onboarding_daily_time', dailyTime || '15');
          localStorage.setItem('onboarding_schedule_time', scheduleTime || 'morning');
          if (userType === 'educator_parent') {
            localStorage.setItem('onboarding_institution', institutionName);
            localStorage.setItem('onboarding_student_count', studentCount);
            localStorage.setItem('onboarding_educator_role', educatorRole || 'teacher');
          }

          // Seed default daily keys (2 free keys) and streak charges
          if (!localStorage.getItem('daily_keys')) {
            localStorage.setItem('daily_keys', JSON.stringify({ remaining: 2, lastReset: new Date().toISOString().split('T')[0] }));
          }
          if (!localStorage.getItem('streak_data')) {
            localStorage.setItem('streak_data', JSON.stringify({ count: 1, lastActive: new Date().toISOString().split('T')[0], charges: 1 }));
          }
        }

        toast.success('Account Created! 🎉', `Welcome to Pen & Page Academia, ${fullName}!`);

        // If instructor or admin, route directly
        if (role === 'Admin') {
          router.push('/admin/courses');
          return;
        }
        if (role === 'Instructor') {
          router.push('/instructor');
          return;
        }

        // Show Brilliant-style Welcome step (Step 8) + Upsell Modal
        setStep(8);
        setShowUpsell(true);
        return;
      }

      const data = response ? await response.json().catch(() => ({})) : {};
      let msg = 'Registration failed. Please check your information.';
      if (typeof data.detail === 'string') msg = data.detail;
      else if (data.message) msg = data.message;
      else if (response && response.status === 409) msg = 'An account with this email address already exists.';
      throw new Error(msg);
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Unable to reach the registration service.';
      setError(msg);
      toast.error('Registration Notice', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-between text-[#111827] antialiased selection:bg-[#18b84d]/20">
      
      {/* STEP 0: AI STUDY BUDDY WELCOME (Our platform's 24/7 personal tutor greeting) */}
      {step === 0 && (
        <div className="flex-1 flex flex-col justify-between items-center w-full max-w-[800px] mx-auto px-4 py-8 animate-in fade-in duration-200 min-h-[85vh]">
          {/* Top spacer */}
          <div className="w-full h-8" />

          {/* Centered AI Mascot & Speech */}
          <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto">
            {/* Vibrant Diamond Mascot */}
            <div className="w-24 h-24 bg-gradient-to-tr from-[#65d341] via-[#22c55e] to-[#15803d] rounded-[30px] rotate-45 flex items-center justify-center shadow-xl shadow-green-500/25 mb-4 animate-bounce">
              <div className="w-10 h-10 bg-white rounded-xl -rotate-45 flex items-center justify-center shadow-xs">
                <div className="w-5 h-5 bg-[#111827] rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full ml-auto mr-0.5 mb-0.5" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight font-serif-heading">
                Hi, I’m your AI Study Buddy!
              </h1>
              <p className="text-[#4b5563] text-lg sm:text-xl font-medium">
                I’ll be your personal co-pilot.
              </p>
            </div>
          </div>

          {/* Bottom Centered 3D Pill Button */}
          <div className="w-full flex justify-center pb-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full max-w-[280px] h-[52px] rounded-full bg-[#111827] hover:bg-black text-white font-bold text-base shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER WITH BACK ARROW & 3 SEGMENTED PROGRESS BARS (Matching media_1790420567025.png & media_1790420714785.png) */}
      {step >= 1 && step <= 7 && (
        <header className="w-full max-w-[1100px] mx-auto pt-6 px-4 sm:px-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#111827] hover:bg-black/5 transition-colors cursor-pointer text-xl font-bold"
            aria-label="Go back"
          >
            ‹
          </button>

          {/* 3 Segmented Pill Progress Bars */}
          <div className="flex-1 flex items-center gap-2.5">
            {/* Segment 1: Steps 1, 2, 3 (Motivation, Voice, Subject) */}
            <div className="flex-1 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className={`h-full bg-[#18b84d] transition-all duration-300 rounded-full ${
                  step >= 3
                    ? 'w-full'
                    : step === 2
                    ? 'w-2/3'
                    : step === 1
                    ? 'w-1/3'
                    : 'w-0'
                }`}
              />
            </div>
            {/* Segment 2: Steps 4, 5, 6 (Level, Daily Goal, Schedule Time) */}
            <div className="flex-1 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className={`h-full bg-[#18b84d] transition-all duration-300 rounded-full ${
                  step >= 6
                    ? 'w-full'
                    : step === 5
                    ? 'w-2/3'
                    : step === 4
                    ? 'w-1/3'
                    : 'w-0'
                }`}
              />
            </div>
            {/* Segment 3: Step 7 (Almost There / Email submission) */}
            <div className="flex-1 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className={`h-full bg-[#18b84d] transition-all duration-300 rounded-full ${
                  step >= 7 ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          </div>

          {/* Audio Speaker icon on top right (Present on Brilliant onboarding when voice enabled) */}
          <div className="w-9 flex items-center justify-center text-[#111827]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </div>
        </header>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 w-full max-w-[1100px] mx-auto">
        
        {/* STEP 1: MOTIVATION / PURPOSE */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
            {/* Mascot + Question Heading */}
            <div className="flex items-center gap-4 mb-10 sm:mb-12">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#65d341] via-[#22c55e] to-[#15803d] rounded-[16px] rotate-45 flex items-center justify-center shadow-md shadow-green-500/15">
                <div className="w-5 h-5 bg-white rounded-md -rotate-45 flex items-center justify-center shadow-xs">
                  <div className="w-2.5 h-2.5 bg-[#111827] rounded-xs flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full ml-auto mr-0.5 mb-0.5" />
                  </div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                {userType === 'learner' ? 'What motivates you to learn?' : 'First, what brings you to Pen & Page?'}
              </h1>
            </div>

            {/* A: LEARNER CARDS (Exact match to media_1790401827298.png) */}
            {userType === 'learner' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-[960px] mb-14">
                {[
                  {
                    id: 'school',
                    title: 'Excelling in school',
                    svg: (
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                          <rect x="18" y="10" width="34" height="44" rx="4" fill="#67e8f9" />
                          <rect x="14" y="10" width="8" height="44" rx="3" fill="#64748b" />
                          <rect x="26" y="18" width="12" height="6" rx="1.5" fill="#334155" />
                          <line x1="26" y1="32" x2="44" y2="32" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
                          <line x1="26" y1="38" x2="40" y2="38" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    id: 'career',
                    title: 'Professional growth',
                    svg: (
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                          <rect x="12" y="14" width="40" height="36" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
                          <line x1="22" y1="14" x2="22" y2="50" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="32" y1="14" x2="32" y2="50" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="42" y1="14" x2="42" y2="50" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="12" y1="26" x2="52" y2="26" stroke="#e2e8f0" strokeWidth="1" />
                          <line x1="12" y1="38" x2="52" y2="38" stroke="#e2e8f0" strokeWidth="1" />
                          <path d="M16 46 L28 34 L38 40 L48 20" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M38 20 H48 V30" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    id: 'curiosity',
                    title: 'Staying sharp',
                    svg: (
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                          <circle cx="34" cy="32" r="18" fill="#fce7f3" stroke="#f472b6" strokeWidth="2.5" />
                          <circle cx="34" cy="32" r="12" fill="#f3e8ff" stroke="#c084fc" strokeWidth="2.5" />
                          <circle cx="34" cy="32" r="6" fill="#a855f7" />
                          <path d="M16 44 L28 36" stroke="#9333ea" strokeWidth="2.5" strokeLinecap="round" />
                          <polygon points="14,46 16,40 22,46" fill="#c084fc" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    id: 'family',
                    title: 'Helping my child learn',
                    svg: (
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                          <g transform="rotate(45 32 32)">
                            <path d="M32 10 C24 22 22 34 22 42 H42 C42 34 40 22 32 10 Z" fill="#94a3b8" />
                            <circle cx="32" cy="24" r="3.5" fill="#e2e8f0" />
                            <path d="M22 36 L15 44 L22 43 Z" fill="#64748b" />
                            <path d="M42 36 L49 44 L42 43 Z" fill="#64748b" />
                            <path d="M26 42 Q32 54 38 42 Z" fill="#f87171" opacity="0.85" />
                          </g>
                        </svg>
                      </div>
                    ),
                  },
                ].map((item) => {
                  const selected = goal === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id)}
                      className={`h-[240px] rounded-[28px] p-6 sm:p-7 flex flex-col items-center justify-center text-center gap-6 transition-all cursor-pointer select-none ${
                        selected
                          ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 border-[#111827] scale-[1.02]'
                          : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                      }`}
                    >
                      {item.svg}
                      <div className="font-bold text-[#111827] text-sm sm:text-base leading-snug max-w-[130px]">
                        {item.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* B: TEACHER & PARENT CARDS (Exact match to media_1790421813870.png) */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-[960px] mb-14">
                {[
                  {
                    id: 'parent',
                    title: 'I’m a parent',
                    svg: (
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                          <polygon points="32,8 39,23 55,25 43,37 46,53 32,45 18,53 21,37 9,25 25,23" fill="#facc15" stroke="#eab308" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    id: 'homeschooling',
                    title: 'I’m homeschooling',
                    svg: (
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                          <rect x="18" y="10" width="34" height="44" rx="4" fill="#67e8f9" />
                          <rect x="14" y="10" width="8" height="44" rx="3" fill="#64748b" />
                          <rect x="26" y="18" width="12" height="6" rx="1.5" fill="#334155" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    id: 'teacher',
                    title: 'I’m a teacher',
                    svg: (
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                          <path d="M32 12 C30 18 34 20 32 24 C22 24 16 32 16 44 C16 54 26 56 32 56 C38 56 48 54 48 44 C48 32 42 24 32 24 Z" fill="#ef4444" />
                          <path d="M32 12 C32 8 36 6 38 6" stroke="#84cc16" strokeWidth="3" strokeLinecap="round" />
                          <path d="M34 10 C38 10 42 12 40 16 C36 16 34 12 34 10 Z" fill="#84cc16" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    id: 'learning_for_myself',
                    title: 'I’m learning for myself',
                    svg: (
                      <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                          <circle cx="34" cy="32" r="18" fill="#fce7f3" stroke="#f472b6" strokeWidth="2.5" />
                          <circle cx="34" cy="32" r="12" fill="#f3e8ff" stroke="#c084fc" strokeWidth="2.5" />
                          <circle cx="34" cy="32" r="6" fill="#a855f7" />
                          <path d="M16 44 L28 36" stroke="#9333ea" strokeWidth="2.5" strokeLinecap="round" />
                          <polygon points="14,46 16,40 22,46" fill="#c084fc" />
                        </svg>
                      </div>
                    ),
                  },
                ].map((item) => {
                  const selected = educatorRole === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEducatorRole(item.id as any)}
                      className={`h-[240px] rounded-[28px] p-6 sm:p-7 flex flex-col items-center justify-center text-center gap-6 transition-all cursor-pointer select-none ${
                        selected
                          ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 border-[#111827] scale-[1.02]'
                          : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                      }`}
                    >
                      {item.svg}
                      <div className="font-bold text-[#111827] text-sm sm:text-base leading-snug max-w-[130px]">
                        {item.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Bottom Centered Pill Button */}
            <button
              type="button"
              disabled={userType === 'learner' ? !goal : !educatorRole}
              onClick={handleNextStep}
              className={`w-full max-w-[280px] h-[52px] rounded-full font-bold text-sm sm:text-base transition-all flex items-center justify-center select-none ${
                (userType === 'learner' ? !goal : !educatorRole)
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#111827] hover:bg-black text-white shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none cursor-pointer'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2: VOICE CALIBRATION (Learner) OR EDUCATOR RECOGNITION (Educator - media_1790421841681.png) */}
        {step === 2 && userType === 'educator_parent' ? (
          <div className="w-full max-w-[840px] flex flex-col items-center animate-in fade-in duration-200 py-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center w-full mb-12">
              {/* Left Column: Holographic Badge with Mascot */}
              <div className="md:col-span-5 flex justify-center">
                <div className="w-48 h-48 relative flex items-center justify-center">
                  {/* Glowing Mascot behind */}
                  <div className="absolute top-0 w-24 h-24 bg-gradient-to-tr from-[#65d341] via-[#22c55e] to-[#15803d] rounded-[28px] rotate-45 flex items-center justify-center opacity-85 shadow-lg">
                    <div className="w-8 h-8 bg-white rounded-md -rotate-45 flex items-center justify-center shadow-xs">
                      <div className="w-3.5 h-3.5 bg-[#111827] rounded-xs flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto mr-0.5 mb-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Blue Hexagon Checkmark Badge on Pedestal */}
                  <div className="absolute bottom-2 w-32 h-32 flex flex-col items-center justify-center">
                    <div className="w-16 h-20 bg-gradient-to-b from-[#60a5fa] to-[#2563eb] rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/30 transform rotate-12">
                      <span className="text-white text-3xl font-extrabold -rotate-12">✓</span>
                    </div>
                    {/* Glowing Pedestal */}
                    <div className="w-28 h-6 bg-gradient-to-r from-blue-300 via-indigo-400 to-blue-300 rounded-full blur-xs opacity-70 mt-2" />
                  </div>
                </div>
              </div>

              {/* Right Column: Copy matching screenshot */}
              <div className="md:col-span-7 text-left space-y-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                  You’ll fit right in
                </h1>
                <p className="text-[#4b5563] text-sm sm:text-base leading-relaxed">
                  Teachers around the world use Pen &amp; Page to help their students hone their problem-solving and academic rhetoric skills.
                </p>
                <p className="text-[#4b5563] text-sm sm:text-base leading-relaxed">
                  If you teach students in school, sixth-form, or test prep, you and your students may be eligible to use Pen &amp; Page through our grant-funded Educators program.
                </p>
              </div>
            </div>

            {/* Dual Action Buttons (Exact match to screenshot bottom) */}
            <div className="flex flex-col items-center gap-3 w-full max-w-[340px]">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-[52px] rounded-full bg-[#111827] hover:bg-black text-white font-bold text-base shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center cursor-pointer select-none"
              >
                Go to Pen &amp; Page for Educators
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-[50px] rounded-full border border-[#d1d5db] hover:border-[#9ca3af] bg-white text-[#111827] font-semibold text-base transition-all flex items-center justify-center cursor-pointer select-none"
              >
                Continue
              </button>
            </div>
          </div>
        ) : step === 2 && (
          <div className="w-full max-w-[620px] flex flex-col items-center animate-in fade-in duration-200">
            <div className="text-center space-y-2 mb-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-serif-heading">
                How do you want me to sound?
              </h1>
              <p className="text-[#6b7280] text-sm sm:text-base">
                Turn up your volume if you can’t hear me.
              </p>
            </div>

            {/* 2 Voice Cards: Melodic vs Deep */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-[480px] mb-8">
              {/* Melodic */}
              <button
                type="button"
                onClick={() => setVoiceSound('melodic')}
                className={`h-[240px] rounded-[28px] p-6 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none ${
                  voiceSound === 'melodic'
                    ? 'bg-gradient-to-b from-[#eafaf1] to-[#d4f6e5] border-2 border-[#18b84d] shadow-[0_8px_30px_rgb(24,184,77,0.15)] scale-[1.02]'
                    : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                }`}
              >
                <div className="my-auto">
                  {/* Glowing Mascot */}
                  <div className="w-14 h-14 bg-gradient-to-tr from-[#65d341] via-[#22c55e] to-[#15803d] rounded-[18px] rotate-45 flex items-center justify-center shadow-lg shadow-green-500/25 mx-auto mb-2">
                    <div className="w-6 h-6 bg-white rounded-md -rotate-45 flex items-center justify-center shadow-xs">
                      <div className="w-3 h-3 bg-[#111827] rounded-xs flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full ml-auto mr-0.5 mb-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="font-bold text-[#111827] text-base">
                  Melodic
                </div>
              </button>

              {/* Deep */}
              <button
                type="button"
                onClick={() => setVoiceSound('deep')}
                className={`h-[240px] rounded-[28px] p-6 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none ${
                  voiceSound === 'deep'
                    ? 'bg-gradient-to-b from-[#f3f4f6] to-[#e5e7eb] border-2 border-[#111827] shadow-[0_8px_30px_rgb(0,0,0,0.08)] scale-[1.02]'
                    : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                }`}
              >
                <div className="my-auto" />
                <div className="font-bold text-[#111827] text-base">
                  Deep
                </div>
              </button>
            </div>

            {/* Voice On/Off Toggle */}
            <div className="flex items-center gap-3 mb-10 select-none">
              <span className="text-sm font-semibold text-[#111827]">Voice on</span>
              <button
                type="button"
                onClick={() => setVoiceOn(!voiceOn)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                  voiceOn ? 'bg-[#99f6e4]' : 'bg-slate-300'
                }`}
                aria-label="Toggle voice"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    voiceOn ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full max-w-[280px] h-[52px] rounded-full bg-[#111827] hover:bg-black text-white font-bold text-base shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center cursor-pointer select-none"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 3: SUBJECT SELECTION (Exact match to media_1790420645877.png) */}
        {step === 3 && (
          <div className="w-full max-w-[800px] flex flex-col items-center animate-in fade-in duration-200">
            {/* Mascot + Heading */}
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#65d341] via-[#22c55e] to-[#15803d] rounded-[16px] rotate-45 flex items-center justify-center shadow-md shadow-green-500/15">
                <div className="w-5 h-5 bg-white rounded-md -rotate-45 flex items-center justify-center shadow-xs">
                  <div className="w-2.5 h-2.5 bg-[#111827] rounded-xs flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full ml-auto mr-0.5 mb-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                  What do you want to learn first?
                </h1>
                <p className="text-[#6b7280] text-sm mt-0.5">
                  You can make progress in both subjects later on
                </p>
              </div>
            </div>

            {/* 4 Core Platform Tracks (Academic English, CS & Python, Higher Math, Applied Physics) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1020px] my-10">
              {/* 1. Academic English & IELTS */}
              <button
                type="button"
                onClick={() => setTrack('english')}
                className={`h-[280px] rounded-[32px] p-6 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none ${
                  track === 'english'
                    ? 'bg-gradient-to-b from-[#eff6ff] to-[#dbeafe] shadow-[0_12px_40px_rgb(2,127,255,0.2)] border-2 border-[#027FFF] scale-[1.03]'
                    : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                }`}
              >
                <div className="w-16 h-16 relative flex items-center justify-center my-auto">
                  <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                    <rect x="14" y="12" width="36" height="42" rx="4" fill="#3b82f6" />
                    <rect x="18" y="16" width="28" height="34" rx="2" fill="#ffffff" />
                    <line x1="22" y1="24" x2="42" y2="24" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="22" y1="30" x2="38" y2="30" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="22" y1="36" x2="40" y2="36" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
                    <polygon points="40,38 46,38 46,46 43,43 40,46" fill="#ef4444" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-[#111827] text-base leading-snug">
                    Academic English &amp; IELTS
                  </div>
                  <p className="text-[#6b7280] text-xs mt-1">
                    Essay cohesion, clause mastery &amp; band 8+ rhetoric
                  </p>
                </div>
              </button>

              {/* 2. Computer Science & Coding */}
              <button
                type="button"
                onClick={() => setTrack('cs')}
                className={`h-[280px] rounded-[32px] p-6 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none ${
                  track === 'cs'
                    ? 'bg-gradient-to-b from-[#faf5ff] to-[#f3e8ff] shadow-[0_12px_40px_rgb(168,85,247,0.2)] border-2 border-[#a855f7] scale-[1.03]'
                    : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                }`}
              >
                <div className="w-16 h-16 relative flex items-center justify-center my-auto">
                  <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                    <rect x="18" y="24" width="28" height="20" rx="3" fill="#8b5cf6" />
                    <rect x="22" y="27" width="20" height="12" rx="1.5" fill="#ffffff" />
                    <path d="M12 46 C12 44 16 44 20 44 H44 C48 44 52 44 52 46 L50 48 H14 Z" fill="#6d28d9" />
                    <path d="M38 16 C38 12 32 12 30 16 C28 20 22 20 22 26 C22 30 26 32 30 32" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="28" cy="18" r="1.5" fill="#ffffff" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-[#111827] text-base leading-snug">
                    Computer Science &amp; Python
                  </div>
                  <p className="text-[#6b7280] text-xs mt-1">
                    Loops, algorithms, data structures &amp; AI logic
                  </p>
                </div>
              </button>

              {/* 3. Higher Mathematics */}
              <button
                type="button"
                onClick={() => setTrack('math')}
                className={`h-[280px] rounded-[32px] p-6 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none ${
                  track === 'math'
                    ? 'bg-gradient-to-b from-[#effdf4] to-[#dcfce7] shadow-[0_12px_40px_rgb(34,197,94,0.2)] border-2 border-[#22c55e] scale-[1.03]'
                    : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                }`}
              >
                <div className="w-16 h-16 relative flex items-center justify-center my-auto">
                  <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                    <polygon points="32,10 40,24 54,24 44,34 48,48 32,40 16,48 20,34 10,24 24,24" fill="#22c55e" />
                    <polygon points="32,10 40,24 32,40 24,24" fill="#15803d" opacity="0.85" />
                    <polygon points="40,24 54,24 44,34 32,40" fill="#86efac" />
                    <polygon points="20,34 10,24 24,24 32,40" fill="#bbf7d0" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-[#111827] text-base leading-snug">
                    Higher Mathematics
                  </div>
                  <p className="text-[#6b7280] text-xs mt-1">
                    Visual algebra, coordinate geometry &amp; calculus
                  </p>
                </div>
              </button>

              {/* 4. Applied Physics */}
              <button
                type="button"
                onClick={() => setTrack('physics')}
                className={`h-[280px] rounded-[32px] p-6 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none ${
                  track === 'physics'
                    ? 'bg-gradient-to-b from-[#fffbeb] to-[#fef3c7] shadow-[0_12px_40px_rgb(245,158,11,0.2)] border-2 border-[#f59e0b] scale-[1.03]'
                    : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                }`}
              >
                <div className="w-16 h-16 relative flex items-center justify-center my-auto">
                  <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                    <ellipse cx="32" cy="32" rx="22" ry="8" stroke="#f59e0b" strokeWidth="2.5" transform="rotate(-30 32 32)" />
                    <ellipse cx="32" cy="32" rx="22" ry="8" stroke="#f59e0b" strokeWidth="2.5" transform="rotate(30 32 32)" />
                    <circle cx="32" cy="32" r="7" fill="#d97706" />
                    <circle cx="48" cy="24" r="3" fill="#fbbf24" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-[#111827] text-base leading-snug">
                    Applied Physics
                  </div>
                  <p className="text-[#6b7280] text-xs mt-1">
                    Momentum vectors, circuits &amp; wave dynamics
                  </p>
                </div>
              </button>
            </div>

            <button
              type="button"
              disabled={!track}
              onClick={handleNextStep}
              className={`w-full max-w-[280px] h-[52px] rounded-full font-bold text-base transition-all flex items-center justify-center select-none ${
                !track
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#111827] hover:bg-black text-white shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none cursor-pointer'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 4: DYNAMIC SKILL LEVEL CALIBRATION BY SUBJECT */}
        {step === 4 && (
          <div className="w-full max-w-[960px] flex flex-col items-center animate-in fade-in duration-200">
            {/* Mascot + Heading */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#65d341] via-[#22c55e] to-[#15803d] rounded-[16px] rotate-45 flex items-center justify-center shadow-md shadow-green-500/15">
                <div className="w-5 h-5 bg-white rounded-md -rotate-45 flex items-center justify-center shadow-xs">
                  <div className="w-2.5 h-2.5 bg-[#111827] rounded-xs flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full ml-auto mr-0.5 mb-0.5" />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                {track === 'english' && 'What level of English & writing are you currently at?'}
                {track === 'cs' && 'What level of programming are you currently at?'}
                {track === 'math' && 'What level of math are you currently at?'}
                {track === 'physics' && 'What level of physics are you currently at?'}
              </h1>
            </div>

            {/* 4 Cards with Domain Snippets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-12">
              {(() => {
                const getOptions = () => {
                  if (track === 'english') {
                    return [
                      {
                        id: 'beginner',
                        snippet: 'Subject + Verb + Object',
                        title: 'Foundations',
                        desc: 'Grammar basics, tenses, and simple clause structures.',
                      },
                      {
                        id: 'novice',
                        snippet: 'Although ..., they ...',
                        title: 'Intermediate',
                        desc: 'Compound sentences, transitions, and paragraph flow.',
                      },
                      {
                        id: 'intermediate',
                        snippet: 'Band 7.0 IELTS Rubric',
                        title: 'Academic Prep',
                        desc: 'Complex subordinating clauses and Task 2 essays.',
                      },
                      {
                        id: 'advanced',
                        snippet: 'Cohesion & Rhetoric',
                        title: 'Band 8.5+ Rigor',
                        desc: 'Collegiate discourse, nuances, and syntactic fluency.',
                      },
                    ];
                  }
                  if (track === 'cs') {
                    return [
                      {
                        id: 'beginner',
                        snippet: 'print("hello")',
                        title: 'Beginner',
                        desc: 'I want to start from the basics.',
                      },
                      {
                        id: 'novice',
                        snippet: 'if b > a:\n  print(b)',
                        title: 'Novice',
                        desc: 'I’ve seen, but not touched code before.',
                      },
                      {
                        id: 'intermediate',
                        snippet: 'for i in range(5):',
                        title: 'Intermediate',
                        desc: 'I can write simple programs with loops.',
                      },
                      {
                        id: 'advanced',
                        snippet: 'def binary_search(arr):',
                        title: 'Advanced',
                        desc: 'I’ve written algorithms and structured programs.',
                      },
                    ];
                  }
                  if (track === 'physics') {
                    return [
                      {
                        id: 'beginner',
                        snippet: 'Speed = Distance / Time',
                        title: 'Foundations',
                        desc: 'Everyday motion, forces, and basic energy concepts.',
                      },
                      {
                        id: 'novice',
                        snippet: 'F = m · a',
                        title: 'Newtonian Basics',
                        desc: 'Newton’s three laws, gravity, and free-body diagrams.',
                      },
                      {
                        id: 'intermediate',
                        snippet: 'V = I · R & Circuits',
                        title: 'Circuits & Waves',
                        desc: 'Resistor networks, harmonic oscillation, and optics.',
                      },
                      {
                        id: 'advanced',
                        snippet: 'p₁ + p₂ = p₁\' + p₂\'',
                        title: 'Advanced AP / Collegiate',
                        desc: 'Elastic collisions, thermodynamics, and electromagnetism.',
                      },
                    ];
                  }
                  // Default: Math
                  return [
                    {
                      id: 'beginner',
                      snippet: '2 + 3 × 4 = ?',
                      title: 'Beginner',
                      desc: 'I want to start from arithmetic fundamentals.',
                    },
                    {
                      id: 'novice',
                      snippet: '3x + 5 = 20',
                      title: 'Algebra Foundations',
                      desc: 'Solving linear equations and variable relationships.',
                    },
                    {
                      id: 'intermediate',
                      snippet: 'f(x) = x² - 4x + 3',
                      title: 'Pre-Calculus',
                      desc: 'Polynomial curves, coordinate geometry, and functions.',
                    },
                    {
                      id: 'advanced',
                      snippet: '∫ 2x · e^(x²) dx',
                      title: 'Higher Calculus',
                      desc: 'Derivatives, integrals, and collegiate mathematical rigor.',
                    },
                  ];
                };

                return getOptions().map((item) => {
                  const selected = level === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLevel(item.id)}
                      className={`h-[240px] rounded-[28px] p-6 flex flex-col justify-between text-center transition-all cursor-pointer select-none ${
                        selected
                          ? 'bg-gradient-to-b from-[#faf5ff] to-[#f3e8ff] shadow-[0_10px_35px_rgb(168,85,247,0.18)] border-2 border-[#a855f7] scale-[1.02]'
                          : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                      }`}
                    >
                      {/* Code / Math / English Snippet in Mono */}
                      <div className="h-16 flex items-center justify-center font-mono text-xs sm:text-sm text-slate-700 whitespace-pre">
                        {item.snippet}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-[#111827] text-base">
                          {item.title}
                        </div>
                        <p className="text-[#6b7280] text-xs leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>

            {/* Grade Level Selection (Classes 1 - 5) */}
            <div className="w-full max-w-[560px] bg-slate-50 border border-slate-200/80 rounded-3xl p-5 mb-10 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Primary School Grade
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                Which class/grade are you in? 🎒
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Your dashboard, courses, and live classes will be set to this class.
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((g) => {
                  const isSelected = grade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center border cursor-pointer ${
                        isSelected
                          ? 'bg-[#111827] text-white border-[#111827] shadow-sm scale-[1.03]'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold opacity-70">Class</span>
                      <span className="text-base font-black">{g}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={!level}
              onClick={handleNextStep}
              className={`w-full max-w-[280px] h-[52px] rounded-full font-bold text-base transition-all flex items-center justify-center select-none ${
                !level
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#111827] hover:bg-black text-white shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none cursor-pointer'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 5: DAILY LEARNING GOAL (Exact match to media_1790420714785.png) */}
        {step === 5 && (
          <div className="w-full max-w-[960px] flex flex-col items-center animate-in fade-in duration-200">
            {/* Mascot + Heading */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#65d341] via-[#22c55e] to-[#15803d] rounded-[16px] rotate-45 flex items-center justify-center shadow-md shadow-green-500/15">
                <div className="w-5 h-5 bg-white rounded-md -rotate-45 flex items-center justify-center shadow-xs">
                  <div className="w-2.5 h-2.5 bg-[#111827] rounded-xs flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full ml-auto mr-0.5 mb-0.5" />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                What’s your daily learning goal?
              </h1>
            </div>

            {/* 4 Stopwatch Timer Cards: 10 min, 20 min, 30 min, 60 min */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-12">
              {[
                { id: '10', label: '10 min', pct: 16 },
                { id: '20', label: '20 min', pct: 33 },
                { id: '30', label: '30 min', pct: 50 },
                { id: '60', label: '60 min', pct: 100 },
              ].map((item) => {
                const selected = dailyTime === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDailyTime(item.id)}
                    className={`h-[220px] rounded-[28px] p-6 flex flex-col items-center justify-center gap-6 transition-all cursor-pointer select-none ${
                      selected
                        ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 border-[#111827] scale-[1.02]'
                        : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                    }`}
                  >
                    {/* Metallic Stopwatch SVG */}
                    <div className="w-16 h-16 relative flex items-center justify-center">
                      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                        <circle cx="32" cy="36" r="22" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2.5" />
                        <circle cx="32" cy="36" r="18" fill="#ffffff" />
                        {/* Purple time wedge */}
                        <path
                          d={
                            item.pct === 100
                              ? "M32 36 L32 18 A18 18 0 1 1 31.9 18 Z"
                              : item.pct === 50
                              ? "M32 36 L32 18 A18 18 0 0 1 32 54 Z"
                              : item.pct === 33
                              ? "M32 36 L32 18 A18 18 0 0 1 47 45 Z"
                              : "M32 36 L32 18 A18 18 0 0 1 47 26 Z"
                          }
                          fill="#c084fc"
                          opacity="0.8"
                        />
                        {/* Top Stopwatch button */}
                        <rect x="29" y="8" width="6" height="5" rx="1.5" fill="#64748b" />
                        <rect x="27" y="6" width="10" height="2.5" rx="1" fill="#475569" />
                      </svg>
                    </div>
                    <div className="font-bold text-[#111827] text-base sm:text-lg">
                      {item.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!dailyTime}
              onClick={handleNextStep}
              className={`w-full max-w-[280px] h-[52px] rounded-full font-bold text-base transition-all flex items-center justify-center select-none ${
                !dailyTime
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#111827] hover:bg-black text-white shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none cursor-pointer'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 6: HOW WILL LEARNING FIT INTO YOUR DAY? (Exact match to media_1790420731549.png) */}
        {step === 6 && (
          <div className="w-full max-w-[960px] flex flex-col items-center animate-in fade-in duration-200">
            {/* Mascot + Heading */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#65d341] via-[#22c55e] to-[#15803d] rounded-[16px] rotate-45 flex items-center justify-center shadow-md shadow-green-500/15">
                <div className="w-5 h-5 bg-white rounded-md -rotate-45 flex items-center justify-center shadow-xs">
                  <div className="w-2.5 h-2.5 bg-[#111827] rounded-xs flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full ml-auto mr-0.5 mb-0.5" />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                How will learning fit into your day?
              </h1>
            </div>

            {/* 4 Time of Day Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-12">
              {[
                {
                  id: 'morning',
                  label: 'Morning routine',
                  svg: (
                    <div className="w-16 h-16 relative flex items-center justify-center">
                      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                        <polygon points="12,48 24,28 34,48" fill="#94a3b8" />
                        <polygon points="26,48 38,24 50,48" fill="#64748b" />
                        <circle cx="44" cy="24" r="8" fill="#f59e0b" />
                        <line x1="44" y1="12" x2="44" y2="15" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                        <line x1="44" y1="33" x2="44" y2="36" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                        <line x1="32" y1="24" x2="35" y2="24" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                        <line x1="53" y1="24" x2="56" y2="24" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  ),
                },
                {
                  id: 'afternoon',
                  label: 'Afternoon break',
                  svg: (
                    <div className="w-16 h-16 relative flex items-center justify-center">
                      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                        <circle cx="32" cy="32" r="12" fill="#fb923c" />
                        <line x1="32" y1="14" x2="32" y2="18" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="32" y1="46" x2="32" y2="50" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="14" y1="32" x2="18" y2="32" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="46" y1="32" x2="50" y2="32" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="19" y1="19" x2="22" y2="22" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="42" y1="42" x2="45" y2="45" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="19" y1="45" x2="22" y2="42" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="42" y1="22" x2="45" y2="19" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  ),
                },
                {
                  id: 'night',
                  label: 'Nightly ritual',
                  svg: (
                    <div className="w-16 h-16 relative flex items-center justify-center">
                      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                        <path d="M40 18 A16 16 0 1 1 24 48 A16 16 0 0 0 40 18 Z" fill="#818cf8" />
                        <polygon points="46,18 48,22 52,24 48,26 46,30 44,26 40,24 44,22" fill="#cbd5e1" />
                        <polygon points="20,24 21,26 23,27 21,28 20,30 19,28 17,27 19,26" fill="#cbd5e1" />
                      </svg>
                    </div>
                  ),
                },
                {
                  id: 'another',
                  label: 'Another time',
                  svg: (
                    <div className="w-16 h-16 relative flex items-center justify-center">
                      <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                        <circle cx="36" cy="32" r="10" fill="#f59e0b" />
                        <path d="M34 20 A14 14 0 1 1 20 44 A14 14 0 0 0 34 20 Z" fill="#818cf8" />
                      </svg>
                    </div>
                  ),
                },
              ].map((item) => {
                const selected = scheduleTime === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScheduleTime(item.id)}
                    className={`h-[220px] rounded-[28px] p-6 flex flex-col items-center justify-center gap-6 transition-all cursor-pointer select-none ${
                      selected
                        ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 border-[#111827] scale-[1.02]'
                        : 'bg-[#F3F4F6]/85 hover:bg-[#eaecee] border-2 border-transparent'
                    }`}
                  >
                    {item.svg}
                    <div className="font-bold text-[#111827] text-base">
                      {item.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!scheduleTime}
              onClick={handleNextStep}
              className={`w-full max-w-[280px] h-[52px] rounded-full font-bold text-base transition-all flex items-center justify-center select-none ${
                !scheduleTime
                  ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-[#111827] hover:bg-black text-white shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none cursor-pointer'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 7: ALMOST THERE! EMAIL REGISTRATION (Exact match to media_1790420759461.png) */}
        {step === 7 && (
          <div className="w-full max-w-[480px] flex flex-col items-center text-center animate-in fade-in duration-200">
            {/* Mascot with Pencil & Clipboard */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-[#65d341] via-[#22c55e] to-[#15803d] rounded-[26px] rotate-45 flex items-center justify-center shadow-lg shadow-green-500/25">
                <div className="w-9 h-9 bg-white rounded-lg -rotate-45 flex items-center justify-center shadow-xs">
                  <div className="w-4 h-4 bg-[#111827] rounded-xs flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto mr-0.5 mb-0.5" />
                  </div>
                </div>
              </div>

              {/* Pencil sticker top left */}
              <div className="absolute -top-3 -left-3 text-2xl rotate-[-25deg]">
                ✏️
              </div>
              {/* Clipboard sticker bottom right */}
              <div className="absolute -bottom-2 -right-3 text-2xl rotate-[15deg]">
                📋
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mb-3">
              Almost there!
            </h1>
            <p className="text-[#4b5563] text-sm sm:text-base leading-relaxed mb-8 max-w-[420px]">
              Ask a parent or guardian for their email address. We’ll need their permission before you can finish signing up.
            </p>

            {error && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium mb-4">
                {error}
              </div>
            )}

            {/* Email Input & Submit */}
            <form onSubmit={handleCreateAccount} className="w-full space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-5 py-4 rounded-2xl border border-[#d1d5db] focus:outline-none focus:border-[#111827] text-base text-[#111827] placeholder:text-[#9ca3af] bg-white shadow-2xs"
              />

              <button
                type="submit"
                disabled={loading || !email}
                className={`w-full h-[52px] rounded-full font-bold text-base transition-all flex items-center justify-center select-none ${
                  !email || loading
                    ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                    : 'bg-[#111827] hover:bg-black text-white shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none cursor-pointer'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>

            <p className="text-xs text-[#9ca3af] mt-6 leading-relaxed">
              By clicking Submit, I agree to Pen &amp; Page’s{' '}
              <Link href="/terms" className="underline hover:text-[#111827]">Terms</Link> and{' '}
              <Link href="/privacy" className="underline hover:text-[#111827]">Privacy Policy</Link>
            </p>
          </div>
        )}

        {/* STEP 8: WELCOME CONFIRMATION */}
        {step === 8 && (
          <div className="space-y-6 text-center py-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-[#18b84d]/15 text-[#18b84d] rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-xs">
              💎
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight font-serif-heading">
                Welcome to Pen &amp; Page Academia!
              </h1>
              <p className="text-[#6b7280] text-sm sm:text-base max-w-md mx-auto">
                Your personalized curriculum is configured with 2 daily keys and your dedicated AI Study Buddy co-pilot.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-white border border-[#e5e7eb] rounded-2xl text-center">
              <div>
                <div className="text-2xl font-black text-[#111827]">2 🔑</div>
                <div className="text-xs font-semibold text-[#6b7280] mt-0.5">Free Keys Today</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#f97316]">1 🔥</div>
                <div className="text-xs font-semibold text-[#6b7280] mt-0.5">Day 1 Streak</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#18b84d]">Active</div>
                <div className="text-xs font-semibold text-[#6b7280] mt-0.5">AI Study Buddy</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartLearning}
                className="w-full py-4 rounded-full bg-[#18b84d] hover:bg-[#15a344] text-white font-bold text-base shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Start Your First Lesson →
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Brilliant-style 7-Day Premium Upsell Modal */}
      {showUpsell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowUpsell(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 text-sm font-bold"
            >
              ✕
            </button>

            <div className="text-center space-y-4">
              <span className="inline-block bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
                Limited New Learner Offer
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Try Premium FREE for 7 days
              </h2>

              <p className="text-slate-500 text-sm">
                Learn without daily key limits, jump to any advanced module, and unlock unrestricted AI Study Buddy assistance.
              </p>

              <div className="text-left bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Unlimited lessons</strong> every day (no key limits)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Full AI Study Buddy</strong> with step-by-step Socratic hints</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Jump freely</strong> across all 4 disciplines</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Completely ad-free</strong> interactive environment</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 hover:opacity-95 text-white font-bold text-sm shadow-md transition-all"
                >
                  Start 7-Day Free Trial
                </button>
                <button
                  onClick={() => setShowUpsell(false)}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Maybe later, continue with free plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        © 2026 Pen &amp; Page Academia. Inspired by active conceptual problem solving.
      </footer>
    </div>
  );
}
