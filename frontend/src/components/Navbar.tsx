"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getStoredAccessToken, clearAuthSession } from '@/lib/auth-storage';
import { getKeysData, getStreakData } from '@/lib/gamification';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [keysCount, setKeysCount] = useState(1);
  const [chargesCount, setChargesCount] = useState(1);
  const [timeLeft, setTimeLeft] = useState('1d 18h 53m 15s');
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  // Marketing pages where the public floating pill navbar is displayed
  const isStrictlyPublicMarketingPage = 
    pathname === '/' || 
    pathname === '/about' || 
    pathname === '/contact' || 
    pathname === '/how-it-works' || 
    pathname === '/diagnostic';

  useEffect(() => {
    const token = getStoredAccessToken();
    setIsLoggedIn(!!token);

    if (token) {
      const keys = getKeysData();
      const streak = getStreakData();
      setKeysCount(keys.remaining || 1);
      setChargesCount(streak.charges || 1);
    }

    // Scroll listener: switches between top dock and floating pill with "Get started"
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Countdown ticker
    const interval = setInterval(() => {
      const now = new Date();
      const hours = 18 - (now.getHours() % 18);
      const minutes = 59 - now.getMinutes();
      const seconds = 59 - now.getSeconds();
      setTimeLeft(`1d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, [pathname]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // 1. PUBLIC (Logged Out) NAVBAR:
  // At Top: Exactly matches user screenshot media_1790336218074.png (White pill with "Brilliant" + "Sign in")
  // On Scroll (>40px): Exactly matches user screenshot media_1790333985608.png (White floating pill with "Brilliant" + "Sign in" + black "Get started" pill)
  if (isStrictlyPublicMarketingPage || !isLoggedIn) {
    return (
      <header className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 pointer-events-none">
        <div className={`w-full flex justify-center transition-all duration-300 ${isScrolled ? 'pt-3 px-3 sm:px-6' : 'pt-4 px-3 sm:px-6'}`}>
          <div
            className={`pointer-events-auto transition-all duration-300 flex items-center justify-between w-full max-w-[1360px] bg-white rounded-full border border-[#e5e7eb] px-5 sm:px-8 ${
              isScrolled
                ? 'h-[52px] shadow-[0_8px_30px_rgb(0,0,0,0.08)]'
                : 'h-[58px] shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
            }`}
          >
            {/* Left: Our Official Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Pen & Page Academia Logo"
                className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-extrabold text-[20px] sm:text-[22px] tracking-tight text-[#111827] font-serif-heading">
                Pen &amp; Page
              </span>
            </Link>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`text-xs sm:text-sm font-semibold text-[#111827] px-4 py-1.5 rounded-full hover:bg-slate-100 transition-colors ${
                  !isScrolled ? 'border border-[#e5e7eb] bg-white shadow-2xs hover:border-[#d1d5db]' : ''
                }`}
              >
                Sign in
              </Link>

              {/* "Get started" button appears when scrolled down! (media_1790333985608.png) */}
              {isScrolled && (
                <Link
                  href="/signup"
                  className="text-xs sm:text-sm font-bold text-white bg-[#111827] hover:bg-black px-4 sm:px-5 py-1.5 sm:py-2 rounded-full transition-all shadow-xs animate-in fade-in zoom-in-95 duration-200"
                >
                  Get started
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 2. LOGGED-IN NAVBAR: Pixel-perfect replica of user screenshot media_1790328470260.png
  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white border-b border-[#e5e7eb]">
        {/* Main Navbar Row */}
        <div className="h-16 max-w-[1240px] mx-auto px-6 flex items-center justify-between">
          
          {/* Left: Our Official Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Pen & Page Academia Logo"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-extrabold text-[20px] sm:text-[22px] tracking-tight text-[#111827] font-serif-heading">
                Pen &amp; Page
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-6">
              {/* Home */}
              <Link
                href="/dashboard"
                className={`relative flex items-center gap-2 py-5 text-sm font-semibold transition-colors ${
                  pathname === '/dashboard' ? 'text-[#111827]' : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
                {pathname === '/dashboard' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#111827] rounded-full" />
                )}
              </Link>

              {/* Courses */}
              <Link
                href="/courses"
                className={`relative flex items-center gap-2 py-5 text-sm font-semibold transition-colors ${
                  pathname === '/courses' ? 'text-[#111827]' : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Courses</span>
                {pathname === '/courses' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#111827] rounded-full" />
                )}
              </Link>

              {/* You */}
              <Link
                href="/dashboard/analytics"
                className={`relative flex items-center gap-2 py-5 text-sm font-semibold transition-colors ${
                  pathname === '/dashboard/analytics' ? 'text-[#111827]' : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>You</span>
                {pathname === '/dashboard/analytics' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#111827] rounded-full" />
                )}
              </Link>
            </nav>
          </div>

          {/* Right: Rainbow Start Trial + 1 Key + 1 Lightning + Hamburger */}
          <div className="flex items-center gap-3">
            
            {/* Rainbow Outline "Start trial" Button (Pixel-perfect from screenshot) */}
            <Link
              href="/pricing"
              className="relative p-[1.5px] rounded-full bg-gradient-to-r from-[#818cf8] via-[#ec4899] to-[#f59e0b] shadow-2xs hover:shadow-xs transition-shadow"
            >
              <span className="block px-4 py-1.5 rounded-full bg-white text-xs font-bold text-[#1e1b4b] hover:bg-slate-50/80 transition-colors">
                Start trial
              </span>
            </Link>

            {/* 🔑 Keys Pill: "1 🔑" (matching screenshot: bordered oval with yellow key) */}
            <div 
              title={`${keysCount} key available`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-white text-xs font-bold text-[#111827] shadow-2xs"
            >
              <span>{keysCount}</span>
              <span className="text-[#f59e0b] text-sm">🔑</span>
            </div>

            {/* ⚡ Streak Lightning Pill: "1 ⚡" (matching screenshot: bordered oval with yellow/lime bolt) */}
            <div 
              title={`${chargesCount} streak charge available`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-white text-xs font-bold text-[#111827] shadow-2xs"
            >
              <span>{chargesCount}</span>
              <span className="text-[#84cc16] text-sm">⚡</span>
            </div>

            {/* Hamburger Icon */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-[#111827] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Navigation Menu"
            >
              <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sub-Navbar Countdown Banner */}
        <div className="w-full bg-gradient-to-r from-[#ede9fe] via-[#fce7f3] to-[#fef3c7] border-t border-slate-200/60 py-2 px-4 text-center text-xs font-medium text-[#111827] flex items-center justify-center gap-2">
          <span className="text-base select-none">💎</span>
          <span>Try Premium FREE for 7 days. Offer ends in <strong className="font-bold">{timeLeft}</strong>.</span>
          <Link 
            href="/pricing" 
            className="font-bold text-[#4338ca] underline decoration-[#ec4899] underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Start trial
          </Link>
        </div>
      </header>

      {/* Slide-out Menu for Logged In User */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-2xs flex justify-end">
          <div className="w-72 bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-slideIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-base">Account Menu</span>
                <button onClick={closeMobileMenu} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
              </div>

              <div className="space-y-1 text-sm font-medium">
                <Link href="/dashboard" onClick={closeMobileMenu} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700">
                  <span>🏠</span> Home
                </Link>
                <Link href="/courses" onClick={closeMobileMenu} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700">
                  <span>📚</span> Courses
                </Link>
                <Link href="/dashboard/analytics" onClick={closeMobileMenu} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700">
                  <span>👤</span> You / Profile
                </Link>
                <Link href="/dashboard/settings" onClick={closeMobileMenu} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700">
                  <span>⚙️</span> Settings
                </Link>
                <Link href="/pricing" onClick={closeMobileMenu} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-purple-700 font-bold">
                  <span>💎</span> Start Trial
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  clearAuthSession();
                  setIsLoggedIn(false);
                  closeMobileMenu();
                  window.location.href = '/';
                }}
                className="w-full py-2.5 px-4 rounded-xl text-left text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
