import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// Re-export as `stripe` getter for convenience
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    maxAccounts: 3,
    features: ['Manual tracking', 'Up to 3 accounts', 'Dashboard & charts', 'CSV import', 'Crypto tracking'],
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    maxAccounts: Infinity,
    features: ['Everything in Free', 'Unlimited accounts', 'Plaid bank connections', 'FIRE planning', 'Priority support'],
  },
} as const;

export type PlanType = keyof typeof PLANS;
