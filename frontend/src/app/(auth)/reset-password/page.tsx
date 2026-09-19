"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ToastProvider';

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

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('Password must contain at least one special symbol (!@#$%^&*...).');
      toast.error('Password Requirement', 'Include at least one special symbol.');
      return;
    }
    
    if (!token) {
      setError('Invalid or missing reset token');
      toast.error('Invalid Token', 'Reset token is missing or expired');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password. The link may have expired.');
      }

      toast.success('Password Reset Successful!', 'Redirecting you to login...');
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2000);
    } catch (err: unknown) {
      const msg = (err as Error).message || 'An error occurred. Please try again.';
      setError(msg);
      toast.error('Reset Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-[#0f182c] border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-[0_0_40px_rgba(16,185,129,0.1)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
          
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">Password Reset!</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Your password has been successfully updated. Redirecting you to login...
          </p>
          
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-[#0f182c] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-[#027FFF]/5 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">New Password</h2>
          <p className="text-slate-400 text-sm mb-8">
            Please enter your new password below.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200/80 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#0B1221] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#027FFF]/50 focus:border-[#027FFF] transition-all sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-[#0B1221] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#027FFF]/50 focus:border-[#027FFF] transition-all sm:text-sm"
                    placeholder="••••••••"
                  />
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
      </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
