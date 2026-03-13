'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Landmark, TrendingUp, Bitcoin, Flame, Upload, PanelLeft } from 'lucide-react';
import { useState } from 'react';
import { PlanBadge } from '@/components/subscription/PlanBadge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
  { href: '/networth', label: 'Net Worth', icon: TrendingUp },
  { href: '/crypto', label: 'Crypto', icon: Bitcoin },
  { href: '/fire', label: 'FIRE', icon: Flame },
  { href: '/import', label: 'Import', icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`hidden md:flex flex-col bg-th-card border-r border-[var(--border-color)] p-3 transition-all duration-200 ${collapsed ? 'w-[72px]' : 'w-60'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-3 py-3 mb-6 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-4.5 h-4.5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-base font-bold text-th-heading">WealthPulse</h1>
            <p className="text-[9px] text-th-faint font-medium tracking-widest uppercase">Smart Finance</p>
          </div>
        )}
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
              className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Plan Badge */}
      <div className="px-1 mb-2">
        <PlanBadge collapsed={collapsed} />
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--border-color)] pt-3 mt-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`nav-item nav-item-inactive w-full ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <PanelLeft className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
