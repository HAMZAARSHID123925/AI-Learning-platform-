"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // UI TESTING MOCK
      if (false) {
        setTimeout(() => {
          localStorage.setItem('access_token', 'mock_ui_token');
          router.push('/dashboard');
        }, 800);
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      localStorage.setItem('access_token', data.access_token);
      
      const roles: string[] = data.user?.roles || [];
      const primaryRole = roles[0] || 'Student';
      localStorage.setItem('user_role', primaryRole);
      localStorage.setItem('user_name', `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim() || data.user?.email || 'User');

      if (roles.includes('Admin')) {
        router.push('/admin/courses');
      } else if (roles.includes('Instructor') || roles.includes('Teacher')) {
        router.push('/instructor');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full">

    {/*  =========================================================================  */}
    {/*  LEFT PANEL: The Branding Side (Hidden on mobile, 50% width on desktop)   */}
    {/*  =========================================================================  */}
    <aside className="relative hidden lg:flex lg:w-1/2 bg-[#0B1221] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden select-none">
      
      {/*  Glowing Ambient Glass Lights & Radial Gradients  */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#5BC0EB] rounded-full blur-3xl opacity-20 pointer-events-none animate-pulse" style={{ animationDuration: "8s" }}></div>
      <div className="absolute top-1/2 -right-32 w-[34rem] h-[34rem] bg-[#027FFF] rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-24 left-1/4 w-[30rem] h-[30rem] bg-[#5BC0EB] rounded-full blur-[100px] opacity-15 pointer-events-none"></div>

      {/*  Subtle background geometric grid  */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/*  Top Section: Brand Logo & Institutional Tag  */}
      <header className="relative z-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#027FFF] to-[#5BC0EB] p-0.5 shadow-lg shadow-[#027FFF]/30 transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#0B1221] rounded-[10px] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#5BC0EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              PPAcademia
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#027FFF]/20 text-[#5BC0EB] font-semibold border border-[#027FFF]/30">AI</span>
            </span>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Cambridge &amp; IDP Calibrated</span>
          </div>
        </Link>

        {/*  Badge  */}
        <div className="custom-glass-chip px-3.5 py-1.5 rounded-full flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-300">Audited 98.4% Accuracy</span>
        </div>
      </header>

      {/*  Middle Section: Hero Value Proposition  */}
      <div className="relative z-10 my-auto py-12 max-w-xl">
        {/*  Pill tag  */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full custom-glass border border-white/10 text-xs font-medium text-[#5BC0EB] mb-6 shadow-sm">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Autonomous 4-Agent Evaluation Engine
        </div>

        <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
          Master your language proficiency with <span className="bg-gradient-to-r from-white via-slate-100 to-[#5BC0EB] bg-clip-text text-transparent">AI precision.</span>
        </h1>

        <p className="mt-5 text-base xl:text-lg text-slate-400 leading-relaxed font-normal">
          Accelerate your IELTS preparation with verified multi-agent rubric feedback, real-time phonology analysis, and personalized adaptive study loops calibrated to official examiner standards.
        </p>

        {/*  Feature Points  */}
        <div className="mt-8 grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <div className="w-5 h-5 rounded-full bg-[#027FFF]/20 flex items-center justify-center shrink-0 border border-[#027FFF]/30">
              <svg className="w-3 h-3 text-[#5BC0EB]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span>Instant &lt;10s Rubric Scores</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <div className="w-5 h-5 rounded-full bg-[#027FFF]/20 flex items-center justify-center shrink-0 border border-[#027FFF]/30">
              <svg className="w-3 h-3 text-[#5BC0EB]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span>Targeted 3-Min Micro-Drills</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <div className="w-5 h-5 rounded-full bg-[#027FFF]/20 flex items-center justify-center shrink-0 border border-[#027FFF]/30">
              <svg className="w-3 h-3 text-[#5BC0EB]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span>Cambridge 2026 Standards</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <div className="w-5 h-5 rounded-full bg-[#027FFF]/20 flex items-center justify-center shrink-0 border border-[#027FFF]/30">
              <svg className="w-3 h-3 text-[#5BC0EB]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <span>Zero Examiner Subjectivity</span>
          </div>
        </div>
      </div>

      {/*  Bottom Section: Testimonial Glassmorphism Card  */}
      <footer className="relative z-10 pt-4">
        <div className="custom-glass rounded-2xl p-6 border border-white/10 shadow-2xl relative">
          {/*  Quote Icon  */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-amber-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <span className="ml-1 text-xs font-semibold text-white/90">5.0</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Official IELTS Result Verified
            </span>
          </div>

          <blockquote className="text-sm font-medium text-slate-200 leading-relaxed italic">
            &ldquo;PPAcademia got me my Band 8 in just 3 weeks. The instant examiner diagnostic pointed out exact coherence flaws my tutor never caught.&rdquo;
          </blockquote>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#027FFF] to-[#5BC0EB] flex items-center justify-center font-bold text-xs text-white shadow-inner">
                DR
              </div>
              <div>
                <p className="text-xs font-bold text-white">Dr. Rohit Mehta</p>
                <p className="text-[11px] text-slate-400">GMC Medical Registration Candidate</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-[#5BC0EB] block">Band 8.0</span>
              <span className="text-[10px] text-slate-400">Score Achieved</span>
            </div>
          </div>
        </div>
      </footer>
    </aside>


    {/*  =========================================================================  */}
    {/*  RIGHT PANEL: The Form Side (100% Mobile, 50% Desktop)                       */}
    {/*  =========================================================================  */}
    <main className="w-full lg:w-1/2 h-full bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-20 relative overflow-y-auto">
      
      {/*  Top Mobile Brand Header (Visible only on mobile/tablet)  */}
      <div className="w-full flex lg:hidden items-center justify-between pb-8 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#0B1221] flex items-center justify-center text-[#5BC0EB]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            PPAcademia <span className="text-[#027FFF]">AI</span>
          </span>
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
          Band 7.5+ Portal
        </span>
      </div>

      {/*  Centered Form Container  */}
      <div className="my-auto py-8 w-full max-w-[440px] mx-auto">
        
        {/*  Header  */}
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to Website
          </Link>
        </div>
        <header className="mb-8 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold mb-3">
            <svg className="w-3.5 h-3.5 text-[#027FFF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            Candidate &amp; Institutional Sign-In
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-normal">
            Please enter your details to access your adaptive IELTS portal.
          </p>
        </header>

        {/*  Form Element  */}
        <form action="#" method="POST" className="space-y-5" onSubmit={handleLogin}>
          
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {/*  Email Field  */}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                name="email" 
                required
                placeholder="name@university.edu"
                className="block w-full rounded-xl bg-slate-50 border border-slate-200 py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-300 focus:bg-white focus:border-[#027FFF] focus:ring-4 focus:ring-[#027FFF]/15 focus-visible:outline-none"
              />
            </div>
          </div>

          {/*  Password Field  */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-[#027FFF] hover:text-[#026bd6] focus-visible:outline-none focus-visible:underline transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                name="password" 
                required
                placeholder="••••••••••••"
                className="block w-full rounded-xl bg-slate-50 border border-slate-200 py-3.5 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-300 focus:bg-white focus:border-[#027FFF] focus:ring-4 focus:ring-[#027FFF]/15 focus-visible:outline-none"
              />
              {/*  Toggle Visibility Button  */}
              <button 
                type="button" 
                aria-label="Toggle password visibility"
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus-visible:outline-none"
                onClick={() => { const p = document.getElementById("password") as HTMLInputElement; p.type = p.type === "password" ? "text" : "password"; }}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
          </div>

          {/*  Remember Me & Single-Session Checkbox  */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                name="remember" 
                defaultChecked
                className="w-4 h-4 rounded border-slate-300 text-[#027FFF] focus:ring-[#027FFF] focus:ring-offset-0 transition-colors cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600">Remember this browser for 30 days</span>
            </label>
          </div>

          {/*  Submit Button  */}
          <div className="pt-2">
            <button 
              type="submit" disabled={loading} 
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#027FFF] hover:bg-[#026bd6] text-white font-bold text-sm shadow-[0_8px_20px_rgba(2,127,255,0.25)] hover:shadow-[0_12px_24px_rgba(2,127,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#027FFF]/30"
            >
              <span>{loading ? "Signing in..." : "Sign in to Assessment Portal"}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </div>

          {/*  Divider: Or continue with  */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/*  Social Buttons: Google & Microsoft  */}
          <div className="grid grid-cols-2 gap-3.5">
            
            {/*  Google Button  */}
            <button 
              type="button" 
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm hover:border-slate-300 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#027FFF]/30"
            >
              {/*  Official Google Color Icon  */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google</span>
            </button>

            {/*  Microsoft Button  */}
            <button 
              type="button" 
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm hover:border-slate-300 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#027FFF]/30"
            >
              {/*  Official Microsoft 4-Color Grid Icon  */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              <span>Microsoft</span>
            </button>
          </div>

        </form>

        {/*  Don&apos;t have an account Footer Link  */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account? 
            <Link href="/signup" className="font-bold text-[#027FFF] hover:text-[#026bd6] focus-visible:outline-none focus-visible:underline transition-colors ml-1">
              Start Free 7-Day Trial &rarr;
            </Link>
          </p>
        </div>

        {/*  Institutional Single Sign-On (SSO) Callout  */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <span>University or Enterprise student?</span>
          <Link href="#sso" className="font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Log in via Institutional SSO
          </Link>
        </div>

      </div>

      {/*  Legal & Security Assurance Footer  */}
      <footer className="w-full pt-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd"/>
          </svg>
          <span>256-Bit TLS &amp; GDPR Compliant Encryption</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link href="#privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="#support" className="hover:text-slate-600 transition-colors">Support Desk</Link>
        </div>
      </footer>

    </main>
  </div>
  );
}
