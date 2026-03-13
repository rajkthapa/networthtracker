'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { TrendingUp, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#testimonials', label: 'Testimonials' },
];

export function LandingNavbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-th-card/90 backdrop-blur-xl shadow-sm border-b border-[var(--border-color)]' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-th-heading">
              WealthPulse
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-th-body hover:text-th-heading transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-[var(--bg-hover-strong)] transition-colors text-th-muted hover:text-th-heading"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-th-heading hover:text-th-heading px-4 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="btn-primary text-sm px-5 py-2.5"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-[var(--bg-hover-strong)] transition-colors text-th-heading"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-th-card border-t border-[var(--border-color)] shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-th-heading hover:bg-[var(--bg-hover)]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
              <Link href="/auth/login" className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium text-th-heading hover:bg-[var(--bg-hover)]">
                Log in
              </Link>
              <Link href="/auth/signup" className="block w-full text-center px-4 py-3 rounded-xl btn-primary text-sm">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
