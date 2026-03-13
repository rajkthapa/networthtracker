'use client';

import { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

const proFeatures = [
  'Unlimited accounts',
  'Plaid bank connections',
  'Automatic balance sync',
  'FIRE planning tools',
  'Priority support',
];

export function UpgradeModal({ open, onClose, feature }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-th-card rounded-3xl shadow-[var(--shadow-glass)] border border-[var(--border-strong)] max-w-md w-full p-8 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors">
          <X className="w-5 h-5 text-th-faint" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-grape-800 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-th-heading mb-2">Upgrade to Pro</h2>
          {feature && (
            <p className="text-sm text-th-muted">
              <span className="font-semibold text-grape-400">{feature}</span> is a Pro feature.
              Upgrade to unlock it and much more.
            </p>
          )}
        </div>

        <div className="bg-[var(--bg-subtle)] rounded-2xl p-5 mb-6 border border-[var(--border-color)]">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-th-heading">$9.99</span>
            <span className="text-sm text-th-faint">/month</span>
          </div>
          <ul className="space-y-2.5">
            {proFeatures.map(f => (
              <li key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-success-500/15 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-success-400" />
                </div>
                <span className="text-sm text-th-body">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3.5 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Upgrade Now <Sparkles className="w-4 h-4" /></>
          )}
        </button>

        <p className="text-xs text-th-faint text-center mt-4">
          Cancel anytime. Powered by Stripe.
        </p>
      </div>
    </div>
  );
}
