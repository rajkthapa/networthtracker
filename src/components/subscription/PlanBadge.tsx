'use client';

import { useSubscription } from '@/lib/subscription-context';
import { Sparkles, Crown } from 'lucide-react';
import { useState } from 'react';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';

export function PlanBadge({ collapsed }: { collapsed: boolean }) {
  const { isPro, subscription, loading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (loading) return null;

  const handleManage = async () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Portal error:', data.error);
        setPortalLoading(false);
      }
    } catch {
      setPortalLoading(false);
    }
  };

  if (collapsed) {
    return (
      <>
        <div className="flex justify-center">
          <button
            onClick={handleManage}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${
              isPro ? 'bg-grape-800' : 'bg-[var(--bg-hover)]'
            }`}
            title={isPro ? 'Manage Pro Plan' : 'Upgrade to Pro'}
          >
            {isPro ? (
              <Crown className="w-4 h-4 text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-th-faint" />
            )}
          </button>
        </div>
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      </>
    );
  }

  if (isPro) {
    return (
      <button
        onClick={handleManage}
        disabled={portalLoading}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-grape-500/10 border border-grape-500/20 hover:border-grape-500/30 transition-all text-left disabled:opacity-50"
      >
        <div className="w-8 h-8 rounded-lg bg-grape-800 flex items-center justify-center flex-shrink-0">
          {portalLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Crown className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-grape-300">Pro Plan</p>
          <p className="text-[10px] text-grape-500">
            {portalLoading ? 'Opening...' : subscription.cancelAtPeriodEnd ? 'Cancels soon' : 'Manage plan'}
          </p>
        </div>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowUpgrade(true)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] transition-all text-left group"
      >
        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/20 transition-colors">
          <Sparkles className="w-4 h-4 text-[var(--text-accent)]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-th-body">Free Plan</p>
          <p className="text-[10px] text-[var(--text-accent)] font-medium">Upgrade to Pro</p>
        </div>
      </button>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
