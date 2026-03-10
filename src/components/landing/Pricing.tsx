import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with personal finance tracking.',
    features: [
      'Manual account tracking',
      'Up to 3 accounts',
      'Income & expense logging',
      'CSV / Excel import',
      'Dashboard & charts',
      'Crypto price tracking',
    ],
    cta: 'Get Started',
    href: '/auth/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'Unlock the full power of WealthPulse for serious wealth builders.',
    features: [
      'Everything in Free',
      'Unlimited accounts',
      'Plaid bank connections',
      'Automatic balance sync',
      'FIRE planning tools',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    href: '/auth/signup',
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-gradient-to-b from-surface-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-surface-500 text-lg max-w-2xl mx-auto">
            Start free and upgrade when you need more power. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 ${
                plan.highlight
                  ? 'bg-gradient-to-br from-primary-600 via-grape-600 to-primary-700 text-white shadow-2xl shadow-primary-500/20 scale-[1.02]'
                  : 'bg-white border border-surface-200 shadow-card'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-white text-grape-700 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-surface-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlight ? 'text-white/70' : 'text-surface-500'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-5xl font-bold ${plan.highlight ? 'text-white' : 'text-surface-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlight ? 'text-white/60' : 'text-surface-400'}`}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.highlight ? 'bg-white/20' : 'bg-success-50'
                    }`}>
                      <Check className={`w-3 h-3 ${plan.highlight ? 'text-white' : 'text-success-600'}`} />
                    </div>
                    <span className={`text-sm ${plan.highlight ? 'text-white/90' : 'text-surface-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-3.5 rounded-xl font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-white text-primary-700 hover:bg-white/90 shadow-lg'
                    : 'bg-surface-900 text-white hover:bg-surface-800'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
