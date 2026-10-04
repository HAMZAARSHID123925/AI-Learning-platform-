"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ToastProvider';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center text-slate-400">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Validation Error', 'Passwords do not match');
      return;
    }

    if (password.length < 10) {
      setError('Password must be at least 10 characters long.');
      toast.error('Password Requirement', 'Minimum 10 characters required.');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      setError('Password must contain both uppercase and lowercase letters.');
      toast.error('Password Requirement', 'Include uppercase and lowercase letters.');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one numeric digit.');
      toast.error('Password Requirement', 'Include at least one digit.');
      return;
    }

    if (!token) {
      setError('Invalid or expired reset link. Please request a new one.');
      toast.error('Invalid Link', 'No valid reset token found in URL.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast.success('Password Reset Successful', 'You can now log in with your new password.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
        toast.error('Error', data.message || 'Could not reset password. Link may be expired.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network Error', 'Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#027FFF]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Password Successfully Reset</h2>
          <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">
            Your password has been securely updated. Redirecting you to login in a few seconds...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#027FFF] to-[#026bd6] text-white text-sm font-bold shadow-[0_0_20px_rgba(2,127,255,0.3)] hover:scale-[1.02] transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#027FFF]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>
        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-[#027FFF]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Set New Password</h2>
        <p className="mt-2 text-sm text-slate-400">
          Create a strong password for your PPAcademia account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0f172a]/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/5">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#027FFF] focus:ring-1 focus:ring-[#027FFF] transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#027FFF] focus:ring-1 focus:ring-[#027FFF] transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1e293b]/30 border border-white/5 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className={`flex items-center gap-1.5 ${password.length >= 10 ? 'text-emerald-400' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 10 ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  10+ Characters
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-400' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  Upper &amp; Lowercase
                </div>
                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-emerald-400' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  1+ Number
                </div>
                <div className={`flex items-center gap-1.5 ${password && password === confirmPassword ? 'text-emerald-400' : ''}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${password && password === confirmPassword ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  Passwords Match
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(2,127,255,0.3)] text-sm font-bold text-white bg-gradient-to-r from-[#027FFF] to-[#026bd6] hover:from-[#026bd6] hover:to-[#0259b3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#027FFF] focus:ring-offset-[#0f182c] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
