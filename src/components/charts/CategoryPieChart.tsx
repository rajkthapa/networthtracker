'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { PieChart as PieIcon } from 'lucide-react';
import { CategoryDrilldownModal } from '@/components/modals/CategoryDrilldownModal';

export function CategoryPieChart({ type, height = 280 }: { type: 'income' | 'expense'; height?: number }) {
  const { getCategoryBreakdown } = useApp();
  const data = getCategoryBreakdown(type);
  const title = type === 'income' ? 'Income' : 'Expense';
  const [drilldown, setDrilldown] = useState<{ category: string; name: string; icon: string; color: string } | null>(null);

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="section-header mb-2">{title} Breakdown</h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center">
            <PieIcon className="w-7 h-7 text-th-faint" />
          </div>
          <p className="text-sm font-medium text-th-body">No {type} data this month</p>
          <p className="text-xs text-th-muted text-center max-w-[200px]">Add {type === 'income' ? 'income' : 'expenses'} to see your category breakdown</p>
        </div>
      </div>
    );
  }

  const handleCategoryClick = (item: typeof data[0]) => {
    setDrilldown({ category: item.category, name: item.name, icon: item.icon, color: item.color });
  };

  return (
    <>
      <div className="chart-container">
        <h3 className="section-header mb-2">{title} Breakdown</h3>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                strokeWidth={0}
                cursor="pointer"
                onClick={(_, index) => handleCategoryClick(data[index])}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-th-card/95 border border-[var(--border-strong)] rounded-xl px-4 py-3 shadow-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{d.icon}</span>
                        <span className="text-sm font-semibold text-th-heading">{d.name}</span>
                      </div>
                      <p className="text-sm font-bold text-th-heading num">{formatCurrency(d.amount)}</p>
                      <p className="text-xs text-th-muted">{d.percentage.toFixed(1)}% of total</p>
                      <p className="text-[10px] text-primary-500 mt-1">Click to see trends</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-full lg:w-auto space-y-1 max-h-60 overflow-y-auto scrollbar-hide">
            {data.map((item) => (
              <button
                key={item.category}
                onClick={() => handleCategoryClick(item)}
                className="flex items-center gap-2 text-sm whitespace-nowrap w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors group"
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-th-body text-xs">{item.icon}</span>
                <span className="text-th-heading font-medium text-xs group-hover:text-primary-400 transition-colors">{item.name}</span>
                <span className="text-th-heading text-xs ml-auto pl-3 font-semibold num">{formatCurrency(item.amount)}</span>
                <span className="text-th-faint text-[10px] w-10 text-right">{item.percentage.toFixed(1)}%</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {drilldown && (
        <CategoryDrilldownModal
          category={drilldown.category}
          name={drilldown.name}
          icon={drilldown.icon}
          color={drilldown.color}
          type={type}
          onClose={() => setDrilldown(null)}
        />
      )}
    </>
  );
}
