const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    avatar: 'SC',
    color: 'from-primary-500 to-grape-500',
    quote: 'WealthPulse finally made me feel in control of my finances. The dashboard is beautiful and the FIRE calculator keeps me motivated.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Small Business Owner',
    avatar: 'MJ',
    color: 'from-success-500 to-teal-500',
    quote: 'I love how easy it is to track everything in one place. The crypto tracking with live prices is a game-changer for my portfolio.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Product Designer',
    avatar: 'ER',
    color: 'from-grape-500 to-accent-500',
    quote: 'The Plaid integration saves me so much time. My bank balances update automatically and I can focus on what matters - growing my wealth.',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-th-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-th-heading mb-4">
            Loved by Wealth Builders
          </h2>
          <p className="text-th-muted text-lg max-w-2xl mx-auto">
            Join thousands of users who trust WealthPulse to track and grow their net worth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[var(--bg-subtle)] rounded-2xl p-6 border border-[var(--border-color)]">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-th-heading">{t.name}</p>
                  <p className="text-xs text-th-faint">{t.role}</p>
                </div>
              </div>
              <p className="text-sm text-th-body leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
