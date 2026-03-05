'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Landmark, TrendingUp, Bitcoin, Flame, Upload, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
  { href: '/networth', label: 'Net Worth', icon: TrendingUp },
  { href: '/crypto', label: 'Crypto', icon: Bitcoin },
  { href: '/fire', label: 'FIRE', icon: Flame },
  { href: '/import', label: 'Import', icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white/60 backdrop-blur-xl border-r border-surface-100 p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 via-grape-500 to-accent-500 flex items-center justify-center shadow-glow-primary">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gradient-primary bg-gradient-to-r from-primary-600 to-grape-600">WealthPulse</h1>
          <p className="text-[10px] text-surface-400 font-medium tracking-wider uppercase">Smart Finance</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-item',
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse-soft" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-surface-100 pt-4 mt-4">
        <button className="nav-item nav-item-inactive w-full">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 via-grape-500/10 to-accent-500/10 border border-primary-100">
          <p className="text-xs font-semibold text-primary-700">Pro Tip</p>
          <p className="text-[11px] text-surface-500 mt-1">Connect your bank for automatic transaction imports</p>
        </div>
      </div>
    </aside>
  );
}
