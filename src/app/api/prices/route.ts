import { NextRequest, NextResponse } from 'next/server';

// CoinGecko free API for crypto prices
async function fetchCryptoPrices(symbols: string[]): Promise<Record<string, { price: number; change24h: number }>> {
  const result: Record<string, { price: number; change24h: number }> = {};

  // Map common symbols to CoinGecko IDs
  const symbolToId: Record<string, string> = {
    BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', ADA: 'cardano',
    LINK: 'chainlink', DOT: 'polkadot', DOGE: 'dogecoin', XRP: 'ripple',
    AVAX: 'avalanche-2', MATIC: 'matic-network', ATOM: 'cosmos',
    UNI: 'uniswap', AAVE: 'aave', LTC: 'litecoin', NEAR: 'near',
    APT: 'aptos', SUI: 'sui', ARB: 'arbitrum', OP: 'optimism',
    FIL: 'filecoin', ALGO: 'algorand', HBAR: 'hedera-hashgraph',
  };

  const ids = symbols
    .map(s => symbolToId[s.toUpperCase()])
    .filter(Boolean);

  if (ids.length === 0) return result;

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
    const data = await res.json();

    for (const symbol of symbols) {
      const id = symbolToId[symbol.toUpperCase()];
      if (id && data[id]) {
        result[symbol.toUpperCase()] = {
          price: data[id].usd || 0,
          change24h: data[id].usd_24h_change || 0,
        };
      }
    }
  } catch (err) {
    console.error('CoinGecko fetch error:', err);
  }

  return result;
}

// Yahoo Finance API (free, no key needed) for stock prices
async function fetchStockPrices(tickers: string[]): Promise<Record<string, { price: number; change24h: number }>> {
  const result: Record<string, { price: number; change24h: number }> = {};

  if (tickers.length === 0) return result;

  try {
    const symbolsStr = tickers.join(',');
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}&fields=regularMarketPrice,regularMarketChangePercent`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) throw new Error(`Yahoo Finance API error: ${res.status}`);
    const data = await res.json();
    const quotes = data?.quoteResponse?.result || [];

    for (const quote of quotes) {
      result[quote.symbol] = {
        price: quote.regularMarketPrice || 0,
        change24h: quote.regularMarketChangePercent || 0,
      };
    }
  } catch (err) {
    console.error('Yahoo Finance fetch error:', err);
    // Fallback: try individual fetches
    for (const ticker of tickers) {
      try {
        const res = await fetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        if (res.ok) {
          const data = await res.json();
          const price = data?.quoteSummary?.result?.[0]?.price;
          if (price) {
            result[ticker] = {
              price: price.regularMarketPrice?.raw || 0,
              change24h: price.regularMarketChangePercent?.raw ? price.regularMarketChangePercent.raw * 100 : 0,
            };
          }
        }
      } catch {
        // Skip individual errors
      }
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'crypto' or 'stock'
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
