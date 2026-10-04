"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ToastProvider';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // UI TESTING MOCK
      if (false) {
        setTimeout(() => {
          setIsSuccess(true);
          setIsLoading(false);
        }, 800);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset link.');
      }

      toast.success('Reset Email Sent!', 'Check your inbox for the password reset instructions.');
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = (err as Error).message || 'An error occurred. Please try again.';
      setError(msg);
      toast.error('Request Failed', msg);
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
          
          <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            We&apos;ve sent a password reset link to <span className="font-semibold text-white">{email}</span>. Please click the link to reset your password.
          </p>
          
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
      <Link 
        href="/login" 
        className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Login
      </Link>

      <div className="bg-[#0f182c] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-[#027FFF]/5 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Reset Password</h2>
          <p className="text-slate-400 text-sm mb-8">
            Enter the email associated with your account and we&apos;ll send you a secure link to reset your password.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200/80 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-[#0B1221] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#027FFF]/50 focus:border-[#027FFF] transition-all sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(2,127,255,0.3)] text-sm font-bold text-white bg-gradient-to-r from-[#027FFF] to-[#026bd6] hover:from-[#026bd6] hover:to-[#0259b3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#027FFF] focus:ring-offset-[#0f182c] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
      </div>
  );
}
