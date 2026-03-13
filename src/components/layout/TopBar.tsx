'use client';

import { Bell, Search, LogOut, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

export function TopBar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-th-card/60 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <h1 className="text-lg font-bold text-th-heading">WealthPulse</h1>
        </div>

        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-th-faint" />
            <input
              type="text"
              placeholder="Search transactions, accounts..."
              className="input-field pl-10 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-th-faint hover:text-th-body hover:bg-[var(--bg-hover-strong)] transition-all"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] text-th-faint hover:text-th-body hover:bg-[var(--bg-hover-strong)] transition-all relative">
            <Bell className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-xl bg-grape-800 dark:bg-grape-700 flex items-center justify-center text-white font-semibold text-sm cursor-pointer"
            >
              {initials}
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-th-card rounded-2xl shadow-[var(--shadow-glass)] border border-[var(--border-strong)] z-50 overflow-hidden">
                  <div className="p-3 border-b border-[var(--border-color)]">
                    <p className="text-sm font-semibold text-th-heading truncate">{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs text-th-faint truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={async () => { setShowMenu(false); await signOut(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-danger-400 hover:bg-danger-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
