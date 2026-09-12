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
    { name: 'About Us', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-surface-container/50">
      <div className="h-20 max-w-[80rem] mx-auto px-3 flex items-center justify-between gap-space-lg">
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
        <nav className="hidden md:flex items-center gap-space-xl">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name}
                href={link.href}
                className={`font-label-md text-label-md transition-colors ${
                  isActive ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Buttons & Mobile Toggle */}
        <div className="flex items-center gap-space-sm">
          <div className="hidden md:flex items-center gap-space-sm">
            <Link href="/login" className="px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all duration-300 hover:text-secondary">
              Log In
            </Link>
            <Link href="/signup" className="px-space-md py-space-xs rounded-lg font-label-md text-label-md bg-secondary text-on-secondary hover:bg-secondary-container transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5">
              Sign Up
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-xxs shadow-sm">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={toggleMobileMenu} 
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-surface-container-lowest border-b border-surface-container/50 shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col p-4 gap-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 rounded-lg font-label-md text-label-md transition-colors ${
                    isActive 
                      ? 'bg-secondary/10 text-secondary font-bold' 
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="h-px bg-outline-variant/30 my-2" />
            
            <Link 
              href="/login" 
              onClick={closeMobileMenu}
              className="px-4 py-3 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center border border-outline-variant/50"
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              onClick={closeMobileMenu}
              className="px-4 py-3 rounded-lg font-label-md text-label-md bg-secondary text-on-secondary hover:bg-secondary-container transition-colors flex items-center justify-center shadow-md"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
