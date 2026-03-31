'use client';

import { useState, useEffect } from 'react';

interface MacroHeaderProps {
  lastUpdated: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

interface MarketQuote {
  symbol: string;
  label: string;
  price: number | null;
  changePercent: number | null;
  prefix: string;
  suffix: string;
  decimals: number;
  trend: 'up' | 'down' | 'flat';
  error?: string;
}

function getMarketSession(): { label: string; color: string } {
  const hour = new Date().getUTCHours();
  const nyHour = (hour - 4 + 24) % 24; // EDT
  if (nyHour >= 9 && nyHour < 16) return { label: '美股交易中', color: 'text-accent-green' };
  if (nyHour >= 4 && nyHour < 9) return { label: '盘前交易', color: 'text-accent-yellow' };
  return { label: '盘后/休市', color: 'text-text-secondary' };
}

export default function MacroHeader({ lastUpdated, onRefresh, isRefreshing }: MacroHeaderProps) {
  const [now, setNow] = useState(new Date());
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/market');
        if (res.ok) {
          const data = await res.json();
          setQuotes(data.quotes || []);
        }
      } catch {}
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const session = getMarketSession();

  const fmtTime = (d: Date) =>
    d.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });

  const fmtLast = (s: string | null) => {
    if (!s) return '—';
    return new Date(s).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const fmtPrice = (q: MarketQuote) => {
    if (q.price == null) return '—';
    return `${q.prefix}${q.price.toFixed(q.decimals)}${q.suffix}`;
  };

  return (
    <header className="bg-dashboard-card border-b border-dashboard-border sticky top-0 z-50">
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center shrink-0">
            <span className="text-accent-blue text-sm font-bold">$</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-text-primary leading-tight">美国经济监测仪表盘</h1>
            <p className="text-[10px] text-text-secondary">US Economic Monitoring Dashboard</p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent-green/10 border border-accent-green/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green live-indicator" />
            <span className="text-[10px] text-accent-green font-medium">LIVE</span>
          </div>
        </div>

        {/* Right: Stats + Controls */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:block text-right">
            <div className={`text-xs font-medium ${session.color}`}>{session.label}</div>
            <div className="text-[10px] text-text-muted">纽约市场</div>
          </div>
          <div className="hidden lg:block text-right">
            <div className="text-xs font-mono text-text-primary">{fmtTime(now)}</div>
            <div className="text-[10px] text-text-muted">北京时间</div>
          </div>
          {lastUpdated && (
            <div className="hidden md:block text-right">
              <div className="text-xs font-mono text-text-secondary">{fmtLast(lastUpdated)}</div>
              <div className="text-[10px] text-text-muted">最后更新</div>
            </div>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-xs hover:bg-accent-blue/20 transition-colors disabled:opacity-50 shrink-0"
          >
            <svg className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? '更新中' : '刷新'}
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="px-4 lg:px-6 py-1.5 bg-dashboard-card-alt border-t border-dashboard-border flex items-center gap-6 overflow-x-auto">
        {quotes.map((q) => (
          <div key={q.symbol} className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-text-muted">{q.label}</span>
            <span className="text-xs font-mono font-medium text-text-primary">{fmtPrice(q)}</span>
            <span className={`text-[10px] ${q.trend === 'up' ? 'text-accent-green' : q.trend === 'down' ? 'text-accent-red' : 'text-accent-yellow'}`}>
              {q.trend === 'up' ? '▲' : q.trend === 'down' ? '▼' : '━'}
            </span>
            {q.changePercent != null && (
              <span className={`text-[10px] font-mono ${q.changePercent >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {q.changePercent >= 0 ? '+' : ''}{q.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        ))}
        <span className="text-[10px] text-text-muted italic shrink-0 ml-auto">(行情来源: Yahoo Finance)</span>
      </div>
    </header>
  );
}
