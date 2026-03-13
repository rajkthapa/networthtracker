'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function Delta({ value, isPercent = true, showIcon = true }: { value: number; isPercent?: boolean; showIcon?: boolean }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold num ${positive ? 'text-[var(--text-positive)]' : 'text-[var(--text-negative)]'}`}>
      {showIcon && (positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
      {isPercent ? formatPercent(value) : formatCurrency(Math.abs(value))}
    </span>
  );
}
