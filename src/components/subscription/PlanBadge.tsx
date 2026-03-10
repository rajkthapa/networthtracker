'use client';

import { useSubscription } from '@/lib/subscription-context';
import { Sparkles, Crown } from 'lucide-react';
import { useState } from 'react';

export function PlanBadge({ collapsed }: { collapsed: boolean }) {
  const { isPro, subscription, loading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  if (loading) return null;

  const handleManage = async () => {
    if (!isPro) return;
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setPortalLoading(false);
    }
  };

  if (collapsed) {
    return (
      <div className="flex justify-center">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isPro ? 'bg-gradient-to-br from-grape-500 to-accent-500' : 'bg-surface-100'
        }`}>
          {isPro ? (
            <Crown className="w-4 h-4 text-white" />
          ) : (
            <span className="text-xs font-bold text-surface-500">F</span>
          )}
        </div>
      </div>
    );
  }

  if (isPro) {
    return (
      <button
        onClick={handleManage}
        disabled={portalLoading}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-grape-50 to-accent-50 border border-grape-100 hover:border-grape-200 transition-all text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-grape-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Crown className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-grape-700">Pro Plan</p>
          <p className="text-[10px] text-grape-500">
            {subscription.cancelAtPeriodEnd ? 'Cancels soon' : 'Manage plan'}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50 border border-surface-100">
      <div className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-surface-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-surface-700">Free Plan</p>
        <p className="text-[10px] text-surface-400">3 accounts max</p>
      </div>
    </div>
  );
}
