import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center" style={{ background: 'var(--hero-bg)' }}>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-th-heading mb-4 tracking-tight">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-th-muted text-lg max-w-xl mx-auto mb-8">
              Join WealthPulse today and start your journey to financial freedom. Free forever, no credit card required.
            </p>
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 btn-primary px-8 py-4 text-base"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
