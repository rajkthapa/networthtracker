'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Landmark, TrendingUp, Bitcoin, Flame, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'Txns', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
  { href: '/networth', label: 'Worth', icon: TrendingUp },
  { href: '/crypto', label: 'Crypto', icon: Bitcoin },
  { href: '/fire', label: 'FIRE', icon: Flame },
  { href: '/import', label: 'Import', icon: Upload },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-surface-100 px-2 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[52px]',
                isActive
                  ? 'text-primary-600'
                  : 'text-surface-400 hover:text-surface-600'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-all duration-200',
                isActive && 'bg-primary-500/10'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
