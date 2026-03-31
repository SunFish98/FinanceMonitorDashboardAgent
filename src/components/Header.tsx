'use client';

import { formatDate } from '@/lib/utils';

interface HeaderProps {
  lastUpdated?: string;
  onRefresh?: () => void;
}

export default function Header({ lastUpdated, onRefresh }: HeaderProps) {
  return (
    <header className="border-b border-dashboard-border bg-dashboard-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="live-indicator w-2 h-2 rounded-full bg-accent-green inline-block" />
            <span className="text-accent-green text-xs font-mono tracking-widest uppercase">LIVE</span>
          </div>
          <div className="w-px h-4 bg-dashboard-border" />
          <h1 className="text-text-primary font-semibold text-base tracking-tight">
            美国经济监测仪表盘
          </h1>
          <span className="hidden sm:inline text-text-muted text-xs">
            / US Economic Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-text-secondary">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>更新于 {formatDate(lastUpdated)}</span>
            </div>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary border border-dashboard-border hover:border-dashboard-border-light rounded transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
