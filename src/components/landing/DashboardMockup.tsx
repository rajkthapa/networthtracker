export function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Browser chrome */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-surface-900/10 border border-surface-200 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-surface-50 border-b border-surface-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-danger-400" />
            <div className="w-3 h-3 rounded-full bg-warning-400" />
            <div className="w-3 h-3 rounded-full bg-success-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-lg px-4 py-1 text-xs text-surface-400 border border-surface-200 w-64 text-center">
              app.wealthpulse.io/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex">
          {/* Mini sidebar */}
          <div className="hidden sm:flex flex-col w-16 bg-surface-50 border-r border-surface-100 py-4 px-2 gap-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-primary-600 to-grape-600 flex items-center justify-center mb-2">
              <div className="w-4 h-4 border-2 border-white rounded-sm" />
            </div>
            {[true, false, false, false, false].map((active, i) => (
              <div key={i} className={`w-10 h-10 mx-auto rounded-xl ${active ? 'bg-primary-600' : 'bg-surface-200'}`} />
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 p-4 sm:p-6 space-y-4">
            {/* Net worth hero */}
            <div className="bg-gradient-to-r from-primary-50 to-grape-50 rounded-xl p-4 border border-primary-100">
              <div className="text-[10px] text-surface-500 uppercase tracking-wider mb-1">Net Worth</div>
              <div className="text-2xl sm:text-3xl font-bold text-surface-900">$284,750</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-semibold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">+12.4%</span>
                <span className="text-[10px] text-surface-400">vs last month</span>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Income', value: '$8,450', color: 'border-l-success-500', change: '+5.2%' },
                { label: 'Expenses', value: '$4,120', color: 'border-l-danger-500', change: '-8.1%' },
                { label: 'Savings', value: '51.2%', color: 'border-l-grape-500', change: '' },
              ].map(stat => (
                <div key={stat.label} className={`bg-white rounded-xl p-3 border border-surface-100 border-l-4 ${stat.color}`}>
                  <div className="text-[10px] text-surface-500 uppercase tracking-wider">{stat.label}</div>
                  <div className="text-sm sm:text-lg font-bold text-surface-900 mt-0.5">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Chart placeholder */}
            <div className="bg-white rounded-xl border border-surface-100 p-4">
              <div className="text-xs font-semibold text-surface-700 mb-3">Net Worth Trend</div>
              <div className="flex items-end gap-1 h-20">
                {[35, 42, 38, 50, 48, 55, 60, 58, 65, 72, 70, 78].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-primary-500 to-grape-400 opacity-80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
