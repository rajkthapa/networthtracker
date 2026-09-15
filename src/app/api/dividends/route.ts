import { NextRequest, NextResponse } from 'next/server';

interface DividendInfo {
  annualDividendPerShare: number;
  yieldPercent: number;
}

const YAHOO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Yahoo Finance chart endpoint (no auth/crumb required, unlike v7/v10 quote APIs) with
// events=div returns the trailing dividend payout history alongside the current price,
// from which we derive a trailing-12-month dividend rate and yield.
async function fetchTickerDividend(ticker: string): Promise<DividendInfo | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1y&interval=1d&events=div`,
      { headers: YAHOO_HEADERS, next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const chartResult = data?.chart?.result?.[0];
    if (!chartResult) return null;

    const dividendEvents = chartResult.events?.dividends;
    if (!dividendEvents) return null;

    const cutoff = Date.now() - ONE_YEAR_MS;
    const annualDividendPerShare = Object.values(dividendEvents as Record<string, { amount: number; date: number }>)
      .filter(e => e.date * 1000 >= cutoff)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    if (annualDividendPerShare <= 0) return null;

    const price = chartResult.meta?.regularMarketPrice || 0;
    const yieldPercent = price > 0 ? (annualDividendPerShare / price) * 100 : 0;

    return { annualDividendPerShare, yieldPercent };
  } catch (err) {
    console.error(`Failed to fetch dividend data for ${ticker}:`, err);
    return null;
  }
}

async function fetchDividendData(tickers: string[]): Promise<Record<string, DividendInfo>> {
  const result: Record<string, DividendInfo> = {};
  await Promise.all(tickers.map(async (ticker) => {
    const info = await fetchTickerDividend(ticker);
    if (info) result[ticker.toUpperCase()] = info;
  }));
  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols')?.split(',').filter(Boolean) || [];

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'Missing symbols' }, { status: 400 });
  }

  const dividends = await fetchDividendData(symbols);
  return NextResponse.json({ dividends });
}
