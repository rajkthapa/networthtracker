'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export function IncomeExpenseChart({ height = 300 }: { height?: number }) {
  const { monthlyData } = useApp();

  return (
    <div className="chart-container">
      <h3 className="section-header mb-4">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={monthlyData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf3" />
          <XAxis dataKey="month" stroke="#8b95ad" fontSize={11} tickLine={false} />
          <YAxis stroke="#8b95ad" fontSize={12} tickLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
          <Tooltip formatter={(value: any, name: any) => [formatCurrency(value), name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Savings']} />
          <Legend />
          <Bar dataKey="income" fill="#40c057" radius={[6, 6, 0, 0]} name="income" />
          <Bar dataKey="expenses" fill="#fa5252" radius={[6, 6, 0, 0]} name="expenses" />
          <Bar dataKey="savings" fill="#4c6ef5" radius={[6, 6, 0, 0]} name="savings" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
