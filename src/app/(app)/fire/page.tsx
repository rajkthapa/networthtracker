'use client';

import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Flame, Zap, Shield, Award, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSubscription } from '@/lib/subscription-context';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { useState } from 'react';

export default function FIREPage() {
  const { netWorth, monthIncome, monthExpenses, monthlyData } = useApp();
  const { isPro } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!isPro) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="page-header">FIRE Calculator</h1>
          <p className="text-sm text-surface-500 mt-1">Financial Independence, Retire Early</p>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-danger-50 via-warning-50 to-danger-50 p-10 md:p-16 text-center border border-danger-100">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-danger-100 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-danger-500" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 mb-3">Pro Feature</h2>
            <p className="text-surface-500 mb-8">
              FIRE planning tools including retirement projections, savings rate analysis, and Coast FIRE calculations are available on the Pro plan.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-grape-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} feature="FIRE Calculator" />
      </div>
    );
  }

  const annualExpenses = monthExpenses * 12;
  const monthlySavings = monthIncome - monthExpenses;
  const annualSavings = monthlySavings * 12;
  const savingsRate = monthIncome > 0 ? (monthlySavings / monthIncome) * 100 : 0;

  // FIRE calculations (4% rule)
  const fireNumber = annualExpenses * 25;
  const leanFireNumber = (annualExpenses * 0.6) * 25;
  const fatFireNumber = (annualExpenses * 1.5) * 25;
  const coastFireNumber = fireNumber > 0 ? fireNumber / Math.pow(1.07, 30) : 0;

  const fireProgress = fireNumber > 0 ? (netWorth / fireNumber) * 100 : 0;
  const leanFireProgress = leanFireNumber > 0 ? (netWorth / leanFireNumber) * 100 : 0;
  const fatFireProgress = fatFireNumber > 0 ? (netWorth / fatFireNumber) * 100 : 0;
  const coastFireProgress = coastFireNumber > 0 ? (netWorth / coastFireNumber) * 100 : 0;

  // Years to FIRE
  const returnRate = 0.07;
  let yearsToFire = 0;
  let projected = netWorth;
  if (fireNumber > 0 && annualSavings > 0) {
    while (projected < fireNumber && yearsToFire < 100) {
      projected = projected * (1 + returnRate) + annualSavings;
      yearsToFire++;
    }
  }

  // Monthly passive income at 4% withdrawal
  const monthlyPassiveIncome = (netWorth * 0.04) / 12;

  // Expense coverage: what % of expenses can passive income cover
  const expenseCoverage = monthExpenses > 0 ? (monthlyPassiveIncome / monthExpenses) * 100 : 0;

  // Projection data
  const projectionData = [];
  let projNW = netWorth;
  const projYears = Math.min(yearsToFire > 0 ? yearsToFire + 5 : 30, 40);
  for (let i = 0; i <= projYears; i++) {
    projectionData.push({
      year: `Year ${i}`,
      netWorth: Math.round(projNW),
      fireTarget: Math.round(fireNumber),
      leanFire: Math.round(leanFireNumber),
    });
    projNW = projNW * (1 + returnRate) + annualSavings;
  }

  // Average savings rate from all months
  const avgSavingsRate = monthlyData.length > 0
    ? monthlyData.reduce((s, m) => s + m.savingsRate, 0) / monthlyData.length
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header flex items-center gap-3">
          <Flame className="w-8 h-8 text-warning-500" />
          FIRE Calculator
        </h1>
        <p className="text-sm text-surface-500 mt-1">Financial Independence, Retire Early</p>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warning-500 via-danger-500 to-accent-500 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Your FIRE Number</p>
              <h2 className="text-3xl md:text-4xl font-bold num">{formatCurrency(fireNumber, true)}</h2>
              <p className="text-white/60 text-xs mt-1">Based on {formatCurrency(annualExpenses, true)}/yr expenses x 25</p>
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Years to FIRE</p>
              <h2 className="text-3xl md:text-4xl font-bold">{yearsToFire > 0 && yearsToFire < 100 ? yearsToFire : '—'} <span className="text-lg">years</span></h2>
              <p className="text-white/60 text-xs mt-1">At {savingsRate.toFixed(0)}% savings rate + 7% returns</p>
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">FIRE Progress</p>
              <h2 className="text-3xl md:text-4xl font-bold">{fireProgress.toFixed(1)}%</h2>
              <div className="w-full h-3 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min(fireProgress, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FIRE Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card border-l-4 border-success-500">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-success-500" />
            <p className="text-sm font-semibold text-surface-700">Lean FIRE</p>
          </div>
          <p className="text-xl font-bold text-surface-900 num">{formatCurrency(leanFireNumber, true)}</p>
          <p className="text-[10px] text-surface-400 mt-0.5">60% of current expenses</p>
          <div className="w-full h-2 bg-surface-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-success-500 rounded-full" style={{ width: `${Math.min(leanFireProgress, 100)}%` }} />
          </div>
          <p className="text-xs text-surface-400 mt-1">{leanFireProgress.toFixed(1)}% complete</p>
        </div>

        <div className="stat-card border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-primary-500" />
            <p className="text-sm font-semibold text-surface-700">Regular FIRE</p>
          </div>
          <p className="text-xl font-bold text-surface-900 num">{formatCurrency(fireNumber, true)}</p>
          <p className="text-[10px] text-surface-400 mt-0.5">100% of current expenses</p>
          <div className="w-full h-2 bg-surface-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(fireProgress, 100)}%` }} />
          </div>
          <p className="text-xs text-surface-400 mt-1">{fireProgress.toFixed(1)}% complete</p>
        </div>

        <div className="stat-card border-l-4 border-grape-500">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-grape-500" />
            <p className="text-sm font-semibold text-surface-700">Coast FIRE</p>
          </div>
          <p className="text-xl font-bold text-surface-900 num">{formatCurrency(coastFireNumber, true)}</p>
          <p className="text-[10px] text-surface-400 mt-0.5">Stop saving, retire at 65</p>
          <div className="w-full h-2 bg-surface-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-grape-500 rounded-full" style={{ width: `${Math.min(coastFireProgress, 100)}%` }} />
          </div>
          <p className="text-xs text-surface-400 mt-1">{coastFireProgress.toFixed(1)}% complete</p>
        </div>

        <div className="stat-card border-l-4 border-accent-500">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-accent-500" />
            <p className="text-sm font-semibold text-surface-700">Fat FIRE</p>
          </div>
          <p className="text-xl font-bold text-surface-900 num">{formatCurrency(fatFireNumber, true)}</p>
          <p className="text-[10px] text-surface-400 mt-0.5">150% of current expenses</p>
          <div className="w-full h-2 bg-surface-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-accent-500 rounded-full" style={{ width: `${Math.min(fatFireProgress, 100)}%` }} />
          </div>
          <p className="text-xs text-surface-400 mt-1">{fatFireProgress.toFixed(1)}% complete</p>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="chart-container">
        <h3 className="section-header mb-4">Wealth Projection (7% annual returns)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4c6ef5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4c6ef5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ebf3" vertical={false} />
            <XAxis dataKey="year" stroke="#8b95ad" fontSize={11} tickLine={false} />
            <YAxis stroke="#8b95ad" fontSize={12} tickLine={false} tickFormatter={(v) => formatCurrency(v, true)} />
            <Tooltip formatter={(value: any, name: any) => [formatCurrency(value), name === 'netWorth' ? 'Projected Net Worth' : name === 'fireTarget' ? 'FIRE Target' : 'Lean FIRE']} />
            <Area type="monotone" dataKey="leanFire" stroke="#40c057" strokeDasharray="5 5" fill="none" strokeWidth={1.5} name="leanFire" />
            <Area type="monotone" dataKey="fireTarget" stroke="#fa5252" strokeDasharray="5 5" fill="none" strokeWidth={2} name="fireTarget" />
            <Area type="monotone" dataKey="netWorth" stroke="#4c6ef5" fill="url(#projGrad)" strokeWidth={3} name="netWorth" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics + Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="chart-container bg-gradient-to-br from-primary-50 to-grape-50">
          <h3 className="section-header mb-4">Key Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
              <span className="text-sm text-surface-600">Monthly Income</span>
              <span className="text-sm font-bold text-surface-800">{formatCurrency(monthIncome)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
              <span className="text-sm text-surface-600">Monthly Expenses</span>
              <span className="text-sm font-bold text-danger-600">{formatCurrency(monthExpenses)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
              <span className="text-sm text-surface-600">Monthly Savings</span>
              <span className="text-sm font-bold text-success-600">{formatCurrency(monthlySavings)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
              <span className="text-sm text-surface-600">Current Savings Rate</span>
              <span className="text-sm font-bold text-grape-600">{savingsRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
              <span className="text-sm text-surface-600">Avg Savings Rate (all months)</span>
              <span className="text-sm font-bold text-grape-600">{avgSavingsRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
              <span className="text-sm text-surface-600">Passive Income (4% rule)</span>
              <span className="text-sm font-bold text-primary-600">{formatCurrency(monthlyPassiveIncome)}/mo</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
              <span className="text-sm text-surface-600">Expense Coverage</span>
              <span className="text-sm font-bold text-primary-600">{expenseCoverage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
              <span className="text-sm text-surface-600">Remaining to FIRE</span>
              <span className="text-sm font-bold text-surface-800">{formatCurrency(Math.max(fireNumber - netWorth, 0))}</span>
            </div>
          </div>
        </div>

        <div className="chart-container bg-gradient-to-br from-warning-50 to-danger-50">
          <h3 className="section-header mb-4">FIRE Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-sm font-semibold text-surface-800">Increase savings rate to 80%</p>
                <p className="text-xs text-surface-500">Could reduce your FIRE timeline by ~3 years</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
              <span className="text-xl">📈</span>
              <div>
                <p className="text-sm font-semibold text-surface-800">Max out tax-advantaged accounts</p>
                <p className="text-xs text-surface-500">401(k) $23,500 + Roth IRA $7,000 + HSA $4,150 = $34,650/yr</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-surface-800">Grow dividend income</p>
                <p className="text-xs text-surface-500">Your passive income covers {expenseCoverage.toFixed(0)}% of expenses — aim for 100%</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
              <span className="text-xl">🏠</span>
              <div>
                <p className="text-sm font-semibold text-surface-800">Eliminate high-interest debt first</p>
                <p className="text-xs text-surface-500">Credit cards at 22-25% APR cost more than investments earn</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
              <span className="text-xl">📊</span>
              <div>
                <p className="text-sm font-semibold text-surface-800">Coast FIRE {coastFireProgress >= 100 ? 'achieved!' : 'is close'}</p>
                <p className="text-xs text-surface-500">{coastFireProgress >= 100 ? 'You could stop saving and still retire by 65' : `${formatCurrency(Math.max(coastFireNumber - netWorth, 0))} more to reach Coast FIRE`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
