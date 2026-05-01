import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  : null;

// Record price to price_history table (one entry per symbol per day)
async function recordPriceHistory(entries: { symbol: string; assetType: 'crypto' | 'stock'; price: number }[]) {
  if (!supabaseAdmin || entries.length === 0) return;
  const today = new Date().toISOString().split('T')[0];
  const rows = entries.map(e => ({
    symbol: e.symbol,
    asset_type: e.assetType,
    price: e.price,
    date: today,
  }));
  // upsert to avoid duplicates (unique on symbol, asset_type, date)
  await supabaseAdmin.from('price_history').upsert(rows, { onConflict: 'symbol,asset_type,date' });
}

// CoinGecko free API for crypto prices
async function fetchCryptoPrices(symbols: string[]): Promise<Record<string, { price: number; change24h: number }>> {
  const result: Record<string, { price: number; change24h: number }> = {};

  const symbolToId: Record<string, string> = {
    BTC: 'bitcoin', ETH: 'ethereum', BNB: 'binancecoin', SOL: 'solana', ADA: 'cardano',
    LINK: 'chainlink', DOT: 'polkadot', DOGE: 'dogecoin', XRP: 'ripple',
    AVAX: 'avalanche-2', MATIC: 'matic-network', ATOM: 'cosmos',
    UNI: 'uniswap', AAVE: 'aave', LTC: 'litecoin', NEAR: 'near',
    APT: 'aptos', SUI: 'sui', ARB: 'arbitrum', OP: 'optimism',
    FIL: 'filecoin', ALGO: 'algorand', HBAR: 'hedera-hashgraph',
  };

  const ids = symbols.map(s => symbolToId[s.toUpperCase()]).filter(Boolean);
  if (ids.length === 0) return result;

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
    const data = await res.json();

    const historyEntries: { symbol: string; assetType: 'crypto' | 'stock'; price: number }[] = [];
    for (const symbol of symbols) {
      const id = symbolToId[symbol.toUpperCase()];
      if (id && data[id]) {
        const price = data[id].usd || 0;
        result[symbol.toUpperCase()] = {
          price,
          change24h: data[id].usd_24h_change || 0,
        };
        if (price > 0) {
          historyEntries.push({ symbol: symbol.toUpperCase(), assetType: 'crypto', price });
        }
      }
    }
    await recordPriceHistory(historyEntries);
  } catch (err) {
    console.error('CoinGecko fetch error:', err);
  }

  return result;
}

// Stock prices via Yahoo Finance v8 chart endpoint (still publicly accessible)
async function fetchStockPrices(tickers: string[]): Promise<Record<string, { price: number; change24h: number }>> {
  const result: Record<string, { price: number; change24h: number }> = {};
  if (tickers.length === 0) return result;

  const historyEntries: { symbol: string; assetType: 'crypto' | 'stock'; price: number }[] = [];

  // Fetch each ticker individually via chart endpoint (reliable and free)
  await Promise.all(tickers.map(async (ticker) => {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=2d&interval=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          next: { revalidate: 300 },
        }
      );

      if (!res.ok) throw new Error(`Yahoo chart error ${res.status}`);
      const data = await res.json();
      const chartResult = data?.chart?.result?.[0];
      if (!chartResult) return;

      const meta = chartResult.meta;
      const currentPrice = meta?.regularMarketPrice || 0;
      const previousClose = meta?.chartPreviousClose || meta?.previousClose || 0;
      const change24h = previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0;

      result[ticker.toUpperCase()] = { price: currentPrice, change24h };

      if (currentPrice > 0) {
        historyEntries.push({ symbol: ticker.toUpperCase(), assetType: 'stock', price: currentPrice });
      }
    } catch (err) {
      console.error(`Failed to fetch ${ticker}:`, err);
    }
  }));

  await recordPriceHistory(historyEntries);
  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const symbols = searchParams.get('symbols')?.split(',').filter(Boolean) || [];

  if (!type || symbols.length === 0) {
    return NextResponse.json({ error: 'Missing type or symbols' }, { status: 400 });
  }

  let prices: Record<string, { price: number; change24h: number }> = {};

  if (type === 'crypto') {
    prices = await fetchCryptoPrices(symbols);
  } else if (type === 'stock') {
    prices = await fetchStockPrices(symbols);
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  return NextResponse.json({ prices });
}
