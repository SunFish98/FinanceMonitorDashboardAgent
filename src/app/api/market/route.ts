import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SYMBOLS = [
  { symbol: '^GSPC', label: '标普500', prefix: '', decimals: 0 },
  { symbol: 'GC=F', label: '黄金', prefix: '$', decimals: 1 },
  { symbol: 'CL=F', label: 'WTI原油', prefix: '$', decimals: 2 },
  { symbol: 'DX-Y.NYB', label: 'DXY美元', prefix: '', decimals: 2 },
  { symbol: '^TNX', label: '10年美债', prefix: '', decimals: 3, suffix: '%' },
];

async function fetchYahoo(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Yahoo ${symbol}: ${res.status}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`No meta for ${symbol}`);
  return {
    price: meta.regularMarketPrice ?? meta.previousClose,
    previousClose: meta.previousClose,
    changePercent: meta.regularMarketChangePercent ?? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100),
  };
}

export async function GET() {
  const results = await Promise.allSettled(
    SYMBOLS.map(async (s) => {
      const q = await fetchYahoo(s.symbol);
      return {
        symbol: s.symbol,
        label: s.label,
        price: q.price,
        changePercent: q.changePercent,
        prefix: s.prefix,
        suffix: s.suffix ?? '',
        decimals: s.decimals,
        trend: q.changePercent > 0.05 ? 'up' : q.changePercent < -0.05 ? 'down' : 'flat',
      };
    })
  );

  const quotes = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    return {
      symbol: SYMBOLS[i].symbol,
      label: SYMBOLS[i].label,
      price: null,
      changePercent: null,
      prefix: SYMBOLS[i].prefix,
      suffix: (SYMBOLS[i] as {suffix?: string}).suffix ?? '',
      decimals: SYMBOLS[i].decimals,
      trend: 'flat' as const,
      error: r.reason instanceof Error ? r.reason.message : 'error',
    };
  });

  return NextResponse.json({ quotes, lastUpdated: new Date().toISOString() });
}
