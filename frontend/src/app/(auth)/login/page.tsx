'use client';

import React, { useState } from "react";

import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon, GraduationCapIcon, Loader2Icon, PresentationIcon, ShieldCheckIcon, BoxIcon } from "lucide-react";
import { Button } from '@/components/shared/Button';
import { Logo } from '@/components/shared/Logo';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { subjectImages } from '@/data/illustrations';
import { Role } from '@/types';
const roles: {
  id: Role;
  label: string;
  hint: string;
  icon: any;
}[] = [{
  id: 'student',
  label: 'Student',
  hint: 'Learn & play',
  icon: GraduationCapIcon
}, {
  id: 'teacher',
  label: 'Teacher',
  hint: 'Run my classes',
  icon: PresentationIcon
}, {
  id: 'admin',
  label: 'Admin',
  hint: 'Manage school',
  icon: ShieldCheckIcon
}];
export default function Login() { return <AuthProvider><LoginInner /></AuthProvider>; }
function LoginInner() {
  const {
    signIn
  } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address';
    if (password.length < 6) next.password = 'Password needs at least 6 characters';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    window.setTimeout(() => {
      signIn(email, role);
      router.push(role === 'student' ? '/onboarding/grade' : role === 'teacher' ? '/instructor' : '/admin');
    }, 500);
  };
  return <div className="grid min-h-screen w-full bg-white lg:grid-cols-[1fr_1.05fr]">
      <main className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="text-4xl font-black tracking-tight text-ink">Welcome back</h1>
          <p className="mt-2 text-lg text-ink-soft">Sign in to keep learning.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-ink">Email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} className="h-12 w-full rounded-2xl border-2 border-line bg-white px-4 text-base text-ink outline-none transition-colors duration-150 placeholder:text-ink-muted focus:border-ink aria-[invalid=true]:border-danger-500" />
              {errors.email && <p id="email-error" className="mt-1.5 text-sm font-semibold text-danger-700">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-ink">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} className="h-12 w-full rounded-2xl border-2 border-line bg-white px-4 pr-12 text-base text-ink outline-none transition-colors duration-150 placeholder:text-ink-muted focus:border-ink aria-[invalid=true]:border-danger-500" />
                <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-ink-muted hover:text-ink">
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="mt-1.5 text-sm font-semibold text-danger-700">{errors.password}</p>}
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-bold text-ink">I am a…</legend>
              <div role="radiogroup" className="grid grid-cols-3 gap-3">
                {roles.map((r) => {
                const active = r.id === role;
                return <button key={r.id} type="button" role="radio" aria-checked={active} onClick={() => setRole(r.id)} className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-4 transition-[border-color,background-color,transform] duration-150 active:scale-[0.97] ${active ? 'border-ink bg-surface' : 'border-line bg-white hover:border-ink/30'}`}>
                      <r.icon className={`h-6 w-6 ${active ? 'text-ink' : 'text-ink-muted'}`} aria-hidden="true" />
                      <span className="text-sm font-extrabold text-ink">{r.label}</span>
                      <span className="text-xs text-ink-muted">{r.hint}</span>
                    </button>;
              })}
              </div>
            </fieldset>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2Icon className="h-5 w-5 animate-spin" aria-label="Signing in" /> : 'Sign in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-muted">Use any email and a 6+ character password to explore.</p>
        </div>
      </main>

      <aside className="relative hidden overflow-hidden bg-brand-500 lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div>
          <p className="max-w-md text-4xl font-black leading-tight text-white">Learn by doing. One small win at a time.</p>
          <p className="mt-4 max-w-sm text-lg text-white/80">Interactive lessons, live classes and an AI buddy that’s always curious with you.</p>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {(['math', 'science', 'english', 'computer'] as const).map((s, i) => <motion.img key={s} src={subjectImages[s]} alt="" initial={{
          opacity: 0,
          y: 12
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.05 * i,
          ease: [0.23, 1, 0.32, 1]
        }} className={`aspect-[4/3] w-full rounded-3xl object-cover shadow-lift ${i % 2 ? 'translate-y-6' : ''}`} />)}
        </div>
      </aside>
    </div>;
}