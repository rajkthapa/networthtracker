'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '@/lib/store';

export function SavingsRateChart({ height = 250 }: { height?: number }) {
  const { monthlyData } = useApp();

  return (
    <div className="chart-container">
      <h3 className="section-header mb-4">Savings Rate Trend</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={monthlyData}>
          <defs>
            <linearGradient id="savingsRateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#be4bdb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#be4bdb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf3" />
          <XAxis dataKey="month" stroke="#8b95ad" fontSize={11} tickLine={false} />
          <YAxis stroke="#8b95ad" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Savings Rate']} />
          <Line type="monotone" dataKey="savingsRate" stroke="#be4bdb" strokeWidth={3} dot={{ r: 5, fill: '#be4bdb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
