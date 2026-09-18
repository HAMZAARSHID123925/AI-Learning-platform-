"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-surface-container/50">
      <div className="h-20 max-w-[80rem] mx-auto px-4 flex items-center justify-between gap-space-lg">
        {/* Logo */}
        <div className="flex items-center gap-space-sm">
          <Link href="/" onClick={closeMobileMenu}>
            <img 
              alt="Pen & Page Academia Logo" 
              className="h-12 w-auto object-contain" 
              src="/logo.png"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name}
                href={link.href}
                className={`font-label-md text-[14px] transition-colors ${
                  isActive ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Buttons & Diagnostic Pill */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Link 
              href="/diagnostic"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-[13px] font-bold text-white bg-gradient-to-r from-[#027FFF] to-[#005bb5] hover:from-blue-600 hover:to-blue-700 shadow-[0_4px_14px_rgba(2,127,255,0.3)] hover:shadow-[0_6px_20px_rgba(2,127,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>Free Diagnostic</span>
              <span className="material-symbols-outlined text-[15px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 border-l border-slate-200/80 pl-3">
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-xl font-label-md text-[14px] font-bold text-slate-700 hover:text-[#027FFF] hover:bg-slate-100/80 transition-all duration-200"
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 rounded-xl bg-blue-50/90 hover:bg-blue-100/80 text-[#027FFF] border border-blue-200/80 font-label-md text-[14px] font-bold transition-all hover:shadow-xs hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Header Right: Compact Diagnostic Pill + Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link 
            href="/diagnostic" 
            onClick={closeMobileMenu}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#027FFF] to-[#005bb5] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>Diagnostic</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={toggleMobileMenu} 
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Full-Featured Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed left-0 right-0 top-20 h-[calc(100dvh-5rem)] bg-white z-[9999] overflow-y-auto border-t border-slate-200 shadow-2xl flex flex-col justify-between">
          
          <div className="p-4 space-y-4">
            {/* Top Admissions / Cohort Ticker Strip */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-bold">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="tracking-wider uppercase">ADMISSIONS OPEN 2026</span>
              </div>
              <span className="text-slate-400 font-semibold">Academic Curriculum</span>
            </div>

            {/* Navigation List Links */}
            <nav className="space-y-1.5">
              {/* Home */}
              <Link
                href="/"
                onClick={closeMobileMenu}
                className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between text-sm font-bold transition-all ${
                  pathname === '/'
                    ? 'bg-blue-50 text-[#027FFF] border border-blue-200'
                    : 'bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#027FFF]"></span>
                  <span>Home</span>
                </div>
                {pathname === '/' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#027FFF] text-[10px] font-extrabold uppercase">
                    Active
                  </span>
                )}
              </Link>

              {/* Courses */}
              <Link
                href="/courses"
                onClick={closeMobileMenu}
                className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all ${
                  pathname === '/courses'
                    ? 'bg-blue-50 text-[#027FFF] font-bold border border-blue-200'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">menu_book</span>
                  <span>Courses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wide">
                    POPULAR
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
                </div>
              </Link>

              {/* Pricing & Plans */}
              <Link
                href="/pricing"
                onClick={closeMobileMenu}
                className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all ${
                  pathname === '/pricing'
                    ? 'bg-blue-50 text-[#027FFF] font-bold border border-blue-200'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">sell</span>
                  <span>Pricing &amp; Plans</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
              </Link>

              {/* How It Works */}
              <Link
                href="/how-it-works"
                onClick={closeMobileMenu}
                className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all ${
                  pathname === '/how-it-works'
                    ? 'bg-blue-50 text-[#027FFF] font-bold border border-blue-200'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">bolt</span>
                  <span>How It Works</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
              </Link>

              {/* About Us */}
              <Link
                href="/about"
                onClick={closeMobileMenu}
                className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all ${
                  pathname === '/about'
                    ? 'bg-blue-50 text-[#027FFF] font-bold border border-blue-200'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">domain</span>
                  <span>About Us</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className={`w-full px-4 py-3.5 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all ${
                  pathname === '/contact'
                    ? 'bg-blue-50 text-[#027FFF] font-bold border border-blue-200'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                  <span>Contact</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                  Available
                </span>
              </Link>
            </nav>

            {/* Diagnostic Card Promo in Menu */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-blue-50/80 to-blue-100/40 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-[#027FFF] text-[10px] font-extrabold uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#027FFF] animate-pulse"></span>
                  Recommended First Step
                </span>
                <span className="text-[11px] font-semibold text-slate-500">Takes 5 mins</span>
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  Student Academic Diagnostic
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Assess your IELTS &amp; English proficiency baseline with personalized AI growth insights.
                </p>
              </div>

              <Link
                href="/diagnostic"
                onClick={closeMobileMenu}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-[#027FFF] text-xs font-bold transition-all shadow-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-200 group-hover:bg-[#027FFF] transition-colors"></span>
                  <span>Take Free Diagnostic</span>
                </div>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Bottom Action Buttons & Support Strip */}
          <div className="p-5 bg-gradient-to-b from-slate-50 to-slate-100/80 border-t border-slate-200/80 space-y-3">
            <Link 
              href="/signup" 
              onClick={closeMobileMenu}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#027FFF] to-[#005bb5] hover:from-blue-600 hover:to-blue-700 text-white font-extrabold text-[15px] shadow-[0_6px_20px_rgba(2,127,255,0.35)] transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              <span>Sign Up Free</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>

            <Link 
              href="/login" 
              onClick={closeMobileMenu}
              className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-[14px] transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:border-slate-300 active:scale-[0.99]"
            >
              <span>Already have an account?</span>
              <span className="text-[#027FFF] font-extrabold">Log In &rarr;</span>
            </Link>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">support_agent</span>
                <span>Advisor Support</span>
              </span>
              <span>•</span>
              <span>Accredited Academic Curriculum</span>
            </div>
          </div>

        </div>
      )}
    </header>
  );
}
