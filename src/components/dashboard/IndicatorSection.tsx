'use client';

import { useState } from 'react';
import { EconomicIndicator, FredObservation } from '@/lib/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/indicators-config';
import { getStatusBg, getStatusColor, getStatusLabel, getImportanceStars, formatNumber, cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface IndicatorSectionProps {
  category: string;
  indicators: EconomicIndicator[];
  observationsMap: Record<string, FredObservation[]>;
  isLoading: boolean;
  fredSource: 'fred' | 'no_key' | 'error' | null;
}

function MiniSparkline({ observations, status }: { observations: FredObservation[]; status?: string }) {
  const data = observations.slice(-8).map((o) => ({ v: parseFloat(o.value) })).filter((d) => !isNaN(d.v));
  if (data.length < 2) return null;
  const color = status === 'beat' ? '#00d4aa' : status === 'miss' ? '#ff4d6d' : status === 'inline' ? '#ffd60a' : '#8892b0';
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
          <defs>
            <linearGradient id={`g-${status}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g-${status})`} dot={false} isAnimationActive={false} />
          <Tooltip content={() => null} wrapperStyle={{ display: 'none' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function IndicatorCard({ indicator }: { indicator: EconomicIndicator }) {
  const [expanded, setExpanded] = useState(false);
  const { status, currentValue, previousValue } = indicator;
  const statusBg = getStatusBg(status);
  const statusColor = getStatusColor(status);

  const scale = indicator.displayScale ?? 1;
  const displayCurrent = currentValue != null ? currentValue * scale : null;
  const displayPrevious = previousValue != null ? previousValue * scale : null;

  const decimals = indicator.unit.includes('%') ? 1
    : indicator.unit.includes('指数') || indicator.unit.includes('活动') ? 2
    : displayCurrent != null && displayCurrent > 1000 ? 0
    : 2;
  const changeAbs = displayCurrent != null && displayPrevious != null ? displayCurrent - displayPrevious : null;

  const scaledObservations = (indicator.observations || []).map((o) => ({
    ...o,
    value: isNaN(parseFloat(o.value)) ? o.value : String(parseFloat(o.value) * scale),
  }));

  return (
    <div
      className={cn('card-hover rounded-lg border p-3 cursor-pointer select-none bg-dashboard-card', statusBg)}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-[10px] text-text-muted truncate">{indicator.nameEn}</div>
          <div className="text-xs font-medium text-text-primary leading-tight mt-0.5">{indicator.name}</div>
        </div>
        {status && status !== 'pending' && (
          <span className={cn('shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium', statusBg, statusColor)}>
            {getStatusLabel(status)}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mt-2">
        <div>
          <div className={cn('text-lg font-mono font-bold leading-none', displayCurrent != null ? statusColor : 'text-text-muted')}>
            {displayCurrent != null ? formatNumber(displayCurrent, decimals) : '---'}
            {indicator.unitSuffix && displayCurrent != null && (
              <span className="text-xs ml-0.5 text-text-secondary">{indicator.unitSuffix}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-text-muted">{indicator.unit}</span>
            {changeAbs !== null && (
              <span className={cn('text-[10px] font-mono', changeAbs >= 0 ? 'text-accent-green' : 'text-accent-red')}>
                {changeAbs >= 0 ? '+' : ''}{formatNumber(changeAbs, decimals)}
              </span>
            )}
          </div>
        </div>
        <MiniSparkline observations={scaledObservations} status={status} />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-accent-gold">{getImportanceStars(indicator.importance)}</span>
        <svg className={cn('w-3 h-3 text-text-muted transition-transform', expanded && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-dashboard-border space-y-2" onClick={(e) => e.stopPropagation()}>
          <p className="text-[11px] text-text-secondary leading-relaxed">{indicator.description}</p>
          <div className="text-[10px] text-text-muted">
            <span className="text-text-secondary">发布时间：</span>{indicator.schedule}
          </div>
          {status && status !== 'pending' && (
            <div className={cn('text-[11px] leading-relaxed p-2 rounded border', statusBg, statusColor)}>
              <span className="text-text-secondary mr-1">市场影响：</span>
              {indicator.marketImpact[status as 'beat' | 'miss' | 'inline']}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-dashboard-border bg-dashboard-card p-3">
      <div className="h-3 bg-dashboard-border rounded w-3/4 mb-2" />
      <div className="h-4 bg-dashboard-border rounded w-1/2 mb-4" />
      <div className="h-6 bg-dashboard-border rounded w-1/3" />
    </div>
  );
}

export default function IndicatorSection({ category, indicators, observationsMap, isLoading, fredSource }: IndicatorSectionProps) {
  const label = CATEGORY_LABELS[category] || category;
  const icon = CATEGORY_ICONS[category] || '📊';

  const COLORS: Record<string, string> = {
    employment: '#4d9fff',
    inflation: '#ff4d6d',
    gdp: '#00d4aa',
    pmi_retail: '#f59e0b',
    housing: '#a78bfa',
  };
  const color = COLORS[category] || '#8892b0';

  // Merge observations into indicators
  const enriched = indicators.map((ind) => ({
    ...ind,
    observations: observationsMap[ind.fredSeriesId] || ind.observations || [],
  }));

  return (
    <section className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="text-sm font-semibold text-text-primary">
          {icon} {label}
        </h2>
        <div className="flex-1 h-px bg-dashboard-border" />
        <span className="text-text-muted text-xs">{indicators.length} 项指标</span>
        {fredSource === 'fred' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/20">实时 FRED</span>
        )}
        {fredSource === 'no_key' && (
          <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer"
            className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:underline">
            ⚠ 需配置 FRED API Key — 点击获取免费 Key
          </a>
        )}
        {fredSource === 'error' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">FRED 获取失败</span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: indicators.length || 3 }).map((_, i) => <SkeletonCard key={i} />)
          : enriched.map((ind) => <IndicatorCard key={ind.id} indicator={ind} />)
        }
      </div>
    </section>
  );
}
