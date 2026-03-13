import { LayoutDashboard, TrendingUp, Bitcoin, Landmark, Flame, ArrowLeftRight } from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Beautiful Dashboard',
    description: 'See your complete financial picture at a glance with charts, stats, and month-over-month comparisons.',
    color: 'bg-[var(--bg-accent-subtle)] text-[var(--text-accent)]',
  },
  {
    icon: TrendingUp,
    title: 'Net Worth Tracking',
    description: 'Track your net worth over time with automatic snapshots, trends, and growth analysis.',
    color: 'bg-[var(--bg-positive-subtle)] text-[var(--text-positive)]',
  },
  {
    icon: Bitcoin,
    title: 'Crypto Portfolio',
    description: 'Monitor your crypto holdings with live CoinGecko prices, 24h changes, and portfolio allocation.',
    color: 'bg-[var(--bg-amber-subtle)] text-[var(--text-warn)]',
  },
  {
    icon: Landmark,
    title: 'Bank Connections',
    description: 'Connect your bank accounts with Plaid for automatic balance syncing and transaction imports.',
    color: 'bg-grape-500/10 text-[var(--text-accent-secondary)]',
    pro: true,
  },
  {
    icon: Flame,
    title: 'FIRE Calculator',
    description: 'Plan your path to financial independence with FIRE projections, savings rate tracking, and goal setting.',
    color: 'bg-[var(--bg-negative-subtle)] text-[var(--text-negative)]',
    pro: true,
  },
  {
    icon: ArrowLeftRight,
    title: 'Smart Transactions',
    description: 'Categorize income and expenses automatically. Import from CSV/Excel or enter manually.',
    color: 'bg-cyan-500/10 text-cyan-400',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-th-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-th-heading mb-4">
            Everything You Need to{' '}
            <span className="text-primary-600">
              Master Your Money
            </span>
          </h2>
          <p className="text-th-muted text-lg max-w-2xl mx-auto">
            Powerful tools to track, analyze, and grow your wealth. From daily expenses to long-term investments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="relative group bg-th-card rounded-2xl p-6 border border-[var(--border-color)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300"
              >
                {feature.pro && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-grape-800 text-white px-2.5 py-1 rounded-full">
                    Pro
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-th-heading mb-2">{feature.title}</h3>
                <p className="text-sm text-th-muted leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
