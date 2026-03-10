'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './auth-context';
import { createClient } from './supabase';

interface Subscription {
  plan: 'free' | 'pro';
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionState {
  subscription: Subscription;
  isPro: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

const defaultSubscription: Subscription = {
  plan: 'free',
  status: 'active',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

const SubscriptionContext = createContext<SubscriptionState | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription>(defaultSubscription);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(defaultSubscription);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      setSubscription(defaultSubscription);
    } else {
      setSubscription({
        plan: data.plan as 'free' | 'pro',
        status: data.status,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
      });
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isPro = subscription.plan === 'pro' && subscription.status === 'active';

  return (
    <SubscriptionContext.Provider value={{ subscription, isPro, loading, refetch: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
