import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { DashboardMockup } from './DashboardMockup';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-th-base to-grape-500/10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-grape-500/15 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary-500/15 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-th-card/80 backdrop-blur border border-[var(--border-strong)] rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-grape-500" />
            <span className="text-sm font-medium text-th-heading">Smart finance tracking for everyone</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-th-heading tracking-tight leading-[1.1] mb-6">
            Track Your Wealth,{' '}
            <span className="bg-gradient-to-r from-primary-600 via-grape-600 to-accent-500 bg-clip-text text-transparent">
              Build Your Future
            </span>
          </h1>

          <p className="text-lg text-th-muted leading-relaxed max-w-2xl mx-auto mb-10">
            Monitor net worth, investments, crypto, and spending in one beautiful dashboard.
            Set FIRE goals and watch your wealth grow over time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-grape-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-primary-500/25 transition-all text-base"
            >
              Start Free Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-8 py-4 bg-th-card text-th-heading font-semibold rounded-2xl border border-[var(--border-strong)] hover:border-[var(--border-stronger)] hover:bg-[var(--bg-hover)] transition-all text-base"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <DashboardMockup />
      </div>
    </section>
  );
}
