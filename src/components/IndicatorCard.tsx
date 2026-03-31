'use client';

import { EconomicIndicator } from '@/lib/types';
import {
  getStatusColor,
  getStatusBg,
  getStatusLabel,
  getImportanceStars,
  formatNumber,
  cn,
} from '@/lib/utils';
import MiniChart from './MiniChart';

interface IndicatorCardProps {
  indicator: EconomicIndicator;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function IndicatorCard({
  indicator,
  isExpanded,
  onToggleExpand,
}: IndicatorCardProps) {
  const { status, currentValue, previousValue, observations } = indicator;
  const statusColor = getStatusColor(status);
  const statusBg = getStatusBg(status);

  const change =
    currentValue != null && previousValue != null && previousValue !== 0
      ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
      : null;

  const changeAbs =
    currentValue != null && previousValue != null
      ? currentValue - previousValue
      : null;

  const hasData = currentValue != null;

  return (
    <div
      className={cn(
        'card-hover rounded-lg border p-3 cursor-pointer select-none',
        'bg-dashboard-card',
        statusBg
      )}
      onClick={onToggleExpand}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-xs text-text-secondary truncate">{indicator.nameEn}</div>
          <div className="text-sm font-medium text-text-primary leading-tight mt-0.5 truncate">
            {indicator.name}
          </div>
        </div>
        <div className={cn('shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium', statusBg, statusColor)}>
          {getStatusLabel(status)}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between mt-3">
        <div>
          <div className={cn('text-xl font-mono font-bold leading-none', hasData ? statusColor : 'text-text-muted')}>
            {hasData ? formatNumber(currentValue, getDecimals(indicator)) : '---'}
            {hasData && indicator.unitSuffix && (
              <span className="text-xs ml-1 text-text-secondary">{indicator.unitSuffix}</span>
            )}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">{indicator.unit}</div>
        </div>
        {hasData && changeAbs !== null && (
          <div className={cn('text-right text-xs', changeAbs >= 0 ? 'text-accent-green' : 'text-accent-red')}>
            <div className="font-mono">{changeAbs >= 0 ? '+' : ''}{formatNumber(changeAbs, getDecimals(indicator))}</div>
            {change !== null && (
              <div className="text-[10px] text-text-muted">
                {change >= 0 ? '+' : ''}{formatNumber(change, 1)}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mini chart */}
      {observations && observations.length > 1 && (
        <div className="mt-2">
          <MiniChart observations={observations} status={status} />
        </div>
      )}

      {/* Importance */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-accent-gold">{getImportanceStars(indicator.importance)}</span>
        <svg
          className={cn('w-3 h-3 text-text-muted transition-transform', isExpanded && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-dashboard-border space-y-2" onClick={(e) => e.stopPropagation()}>
          <div className="text-[11px] text-text-secondary leading-relaxed">{indicator.description}</div>
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

function getDecimals(indicator: EconomicIndicator): number {
  if (indicator.unit.includes('%') || indicator.unit.includes('指数')) return 1;
  if (indicator.currentValue && indicator.currentValue > 1000) return 0;
  return 2;
}
