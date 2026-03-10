'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, ArrowLeftRight, Landmark, TrendingUp, MoreHorizontal, Bitcoin, Flame, Upload, X } from 'lucide-react';

const primaryNav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'Txns', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
  { href: '/networth', label: 'Worth', icon: TrendingUp },
];

const moreNav = [
  { href: '/crypto', label: 'Crypto Portfolio', icon: Bitcoin },
  { href: '/fire', label: 'FIRE Calculator', icon: Flame },
  { href: '/import', label: 'Import Data', icon: Upload },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const isMoreActive = moreNav.some(item => pathname === item.href);

  return (
    <>
      {/* More menu sheet */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-surface-900/30 backdrop-blur-sm" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-[calc(env(safe-area-inset-bottom)+24px)] animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-surface-900">More</h3>
              <button onClick={() => setShowMore(false)} className="p-2 rounded-xl hover:bg-surface-100">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            <div className="space-y-1">
              {moreNav.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-surface-700 hover:bg-surface-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-surface-100 px-2 pb-[env(safe-area-inset-bottom)] z-40">
        <div className="flex items-center justify-around py-1.5">
          {primaryNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-150 min-w-[52px] ${
                  isActive ? 'text-primary-600' : 'text-surface-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-150 ${isActive ? 'bg-primary-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(true)}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-150 min-w-[52px] ${
              isMoreActive ? 'text-primary-600' : 'text-surface-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-150 ${isMoreActive ? 'bg-primary-50' : ''}`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
