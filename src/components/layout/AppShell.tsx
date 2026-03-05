'use client';

import { useAuth } from '@/lib/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppProvider } from '@/lib/store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname.startsWith('/auth');

  useEffect(() => {
    if (loading) return;
    if (!user && !isAuthPage) {
      router.push('/auth/login');
    }
    if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, isAuthPage, router]);

  // Loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-50 via-white to-grape-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-500 text-sm">Loading WealthPulse...</p>
        </div>
      </div>
    );
  }

  // Auth pages (login/signup) - no sidebar/nav
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Not logged in and not on auth page - show nothing while redirecting
  if (!user) {
    return null;
  }

  // Authenticated layout
  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--background)]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-6 px-4 md:px-8 pt-4">
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </AppProvider>
  );
}
