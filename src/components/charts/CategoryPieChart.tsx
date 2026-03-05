'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export function CategoryPieChart({ type, height = 280 }: { type: 'income' | 'expense'; height?: number }) {
  const { getCategoryBreakdown } = useApp();
  const data = getCategoryBreakdown(type);

  return (
    <div className="chart-container">
      <h3 className="section-header mb-2">{type === 'income' ? 'Income' : 'Expense'} Breakdown</h3>
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
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="w-full lg:w-auto space-y-1.5 max-h-60 overflow-y-auto scrollbar-hide">
          {data.map((item) => (
            <div key={item.category} className="flex items-center gap-2 text-sm whitespace-nowrap">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-surface-600 text-xs">{item.icon}</span>
              <span className="text-surface-700 font-medium text-xs">{item.name}</span>
              <span className="text-surface-500 text-xs ml-auto pl-3">{formatCurrency(item.amount)}</span>
              <span className="text-surface-400 text-[10px] w-10 text-right">{item.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
