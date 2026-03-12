import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-th-base text-th-body py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-grape-500 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold">WealthPulse</span>
            </div>
            <p className="text-th-muted text-sm leading-relaxed max-w-sm">
              The smart way to track your net worth, investments, and financial goals. Built for people who take their money seriously.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-th-muted mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-th-body hover:text-th-heading transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-sm text-th-body hover:text-th-heading transition-colors">Pricing</a></li>
              <li><a href="#testimonials" className="text-sm text-th-body hover:text-th-heading transition-colors">Testimonials</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-th-muted mb-4">Account</h4>
            <ul className="space-y-3">
              <li><Link href="/auth/login" className="text-sm text-th-body hover:text-th-heading transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="text-sm text-th-body hover:text-th-heading transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-8 text-center">
          <p className="text-sm text-th-faint">&copy; {new Date().getFullYear()} WealthPulse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
