'use client';

import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { EconomicIndicator, IndicatorStatus, FredObservation } from '@/lib/types';

interface IndicatorCardProps {
  indicator: EconomicIndicator;
  observations: FredObservation[];
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<IndicatorStatus, { label: string; className: string; color: string }> = {
  beat: { label: '超出预期', className: 'status-beat', color: '#00d4aa' },
  miss: { label: '不及预期', className: 'status-miss', color: '#ff4d6d' },
  inline: { label: '符合预期', className: 'status-inline', color: '#ffd60a' },
  pending: { label: '待公布', className: 'status-pending', color: '#8892b0' },
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-xs ${i < count ? 'text-accent-gold' : 'text-text-muted'}`}>★</span>
      ))}
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function SparklineChart({ data, color }: { data: { value: number; date: string }[]; color: string }) {
  if (!data || data.length < 2) return null;
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length > 0) {
      return (
        <div style={{ background: '#0f1629', border: '1px solid #1e2d4a', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#e8eaf0' }}>
          <div>{label}</div>
          <div>{payload[0].value.toFixed(2)}</div>
        </div>
      );
    }
    return null;
  };
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        <Tooltip content={<CustomTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function formatValue(value: number | null | undefined, indicator: EconomicIndicator): string {
  if (value === null || value === undefined) return 'N/A';
  const seriesId = indicator.fredSeriesId;
  if (seriesId === 'PAYEMS' || seriesId === 'ICSA') return `${(value / 1000).toFixed(1)}K`;
  if (seriesId === 'HOUST') return `${value.toFixed(0)}K`;
  if (seriesId === 'RSXFS') return `$${(value / 1000).toFixed(1)}B`;
  if (indicator.unit.includes('%')) return `${value.toFixed(1)}%`;
  if (seriesId === 'EXHOSLUSM495S') return `${value.toFixed(2)}M`;
  return value.toFixed(1);
}

const importanceColors: Record<number, string> = {
  5: 'text-accent-red',
  4: 'text-accent-gold',
  3: 'text-accent-blue',
  2: 'text-text-secondary',
  1: 'text-text-muted',
};

export default function IndicatorCard({ indicator, observations, isLoading = false }: IndicatorCardProps) {
  const [expanded, setExpanded] = useState(false);

  const chartData = observations.slice().reverse().map((obs) => ({
    date: obs.date,
    value: parseFloat(obs.value),
  })).filter((d) => !isNaN(d.value));

  const currentObs = observations[0];
  const previousObs = observations[1];
  const currentValue = currentObs ? parseFloat(currentObs.value) : null;
  const previousValue = previousObs ? parseFloat(previousObs.value) : null;

  const status: IndicatorStatus = indicator.status || 'pending';
  const statusConfig = STATUS_CONFIG[status];

  const changeValue = currentValue !== null && previousValue !== null ? currentValue - previousValue : null;
  const changePercent = currentValue !== null && previousValue !== null && previousValue !== 0
    ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100 : null;

  const trendColor = changeValue !== null ? (changeValue > 0 ? '#00d4aa' : changeValue < 0 ? '#ff4d6d' : '#8892b0') : '#8892b0';

  if (isLoading) {
    return (
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-dashboard-border rounded w-3/4 mb-3" />
        <div className="h-8 bg-dashboard-border rounded w-1/2 mb-2" />
        <div className="h-3 bg-dashboard-border rounded w-full mb-2" />
        <div className="h-10 bg-dashboard-border rounded w-full" />
      </div>
    );
  }

  return (
    <div
      className={`bg-dashboard-card border border-dashboard-border rounded-xl p-4 card-hover cursor-pointer ${status === 'beat' ? 'glow-green' : status === 'miss' ? 'glow-red' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold truncate ${importanceColors[indicator.importance] || 'text-text-primary'}`}>
            {indicator.name}
          </h3>
          <p className="text-xs text-text-muted truncate">{indicator.nameEn}</p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.className}`}>{statusConfig.label}</span>
          <StarRating count={indicator.importance} />
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <div>
          <span className="text-xl font-bold font-terminal text-text-primary">{formatValue(currentValue, indicator)}</span>
          {currentObs && <span className="text-xs text-text-muted ml-2">{currentObs.date.substring(0, 7)}</span>}
        </div>
        {changeValue !== null && (
          <div className="flex items-center gap-1 text-xs font-mono" style={{ color: trendColor }}>
            <span>{changeValue > 0 ? '▲' : changeValue < 0 ? '▼' : '━'}</span>
            <span>
              {Math.abs(changeValue).toFixed(2)}
              {changePercent !== null && ` (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)`}
            </span>
          </div>
        )}
      </div>

      {previousValue !== null && (
        <div className="flex items-center gap-4 mb-3 text-xs text-text-secondary">
          <span>前值：<span className="font-mono text-text-primary ml-1">{formatValue(previousValue, indicator)}</span></span>
          {indicator.forecast !== null && indicator.forecast !== undefined && (
            <span>预期：<span className="font-mono text-accent-yellow ml-1">{formatValue(indicator.forecast, indicator)}</span></span>
          )}
        </div>
      )}

      {chartData.length > 1 && (
        <div className="mb-3">
          <SparklineChart data={chartData} color={statusConfig.color} />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-text-muted border-t border-dashboard-border pt-2">
        <span className="truncate">{indicator.schedule}</span>
        <svg className={`w-3 h-3 flex-shrink-0 ml-2 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-dashboard-border space-y-3 animate-fade-in">
          <p className="text-xs text-text-secondary leading-relaxed">{indicator.description}</p>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-text-primary">市场影响分析</h4>
            <div className="space-y-1.5">
              <div className="flex gap-2 text-xs">
                <span className="text-accent-green flex-shrink-0 font-medium">超预期▲</span>
                <span className="text-text-secondary">{indicator.marketImpact.beat}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-accent-red flex-shrink-0 font-medium">不及预期▼</span>
                <span className="text-text-secondary">{indicator.marketImpact.miss}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-accent-yellow flex-shrink-0 font-medium">符合预期━</span>
                <span className="text-text-secondary">{indicator.marketImpact.inline}</span>
              </div>
            </div>
          </div>
          {observations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-text-primary mb-2">近期数据</h4>
              <div className="space-y-1">
                {observations.slice(0, 6).map((obs) => (
                  <div key={obs.date} className="flex justify-between text-xs">
                    <span className="text-text-muted">{obs.date.substring(0, 7)}</span>
                    <span className="font-mono text-text-secondary">{formatValue(parseFloat(obs.value), indicator)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
