import { MonthRange } from './types';

export type PeriodKey = 'month' | '3m' | 'ytd' | '12m' | 'all';

export const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: '3m', label: '3M' },
  { key: 'ytd', label: 'YTD' },
  { key: '12m', label: '12M' },
  { key: 'all', label: 'All' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shiftMonth(yyyymm: string, delta: number): string {
  const [y, m] = yyyymm.split('-').map(Number);
  const idx = y * 12 + (m - 1) + delta;
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`;
}

export function monthLabel(yyyymm: string, long = false): string {
  const [y, m] = yyyymm.split('-').map(Number);
  if (long) return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return `${MONTHS[m - 1]} ${y}`;
}

export function singleMonth(yyyymm: string): MonthRange {
  return { from: yyyymm, to: yyyymm };
}

/** Range for a period key, anchored on the month the dashboard is showing. */
export function periodToRange(key: PeriodKey, anchor: string, earliest?: string): MonthRange {
  switch (key) {
    case 'month': return singleMonth(anchor);
    case '3m': return { from: shiftMonth(anchor, -2), to: anchor };
    case 'ytd': return { from: `${anchor.slice(0, 4)}-01`, to: anchor };
    case '12m': return { from: shiftMonth(anchor, -11), to: anchor };
    case 'all': return { from: earliest && earliest < anchor ? earliest : anchor, to: anchor };
  }
}

export function rangeLabel(range: MonthRange): string {
  if (range.from === range.to) return monthLabel(range.from, true);
  if (range.from.slice(0, 4) === range.to.slice(0, 4) && range.from.endsWith('-01') && range.to.endsWith('-12')) {
    return range.from.slice(0, 4);
  }
  return `${monthLabel(range.from)} – ${monthLabel(range.to)}`;
}

export function inRange(date: string, range: MonthRange): boolean {
  const m = date.slice(0, 7);
  return m >= range.from && m <= range.to;
}

/** Recharts 3 chart-level onClick → index of the clicked category (bar group / point). */
export function clickedIndex(state: any): number | null {
  const raw = state?.activeTooltipIndex ?? state?.activeIndex;
  if (raw === undefined || raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
