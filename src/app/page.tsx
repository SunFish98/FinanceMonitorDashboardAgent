'use client';

import { useState, useEffect, useCallback } from 'react';
import MacroHeader from '@/components/dashboard/MacroHeader';
import IndicatorSection from '@/components/dashboard/IndicatorSection';
import FedWatchPanel from '@/components/dashboard/FedWatchPanel';
import TruthSocialFeed from '@/components/dashboard/TruthSocialFeed';
import {
  EconomicIndicator,
  FOMCMeeting,
  FedProbability,
  FredObservation,
} from '@/lib/types';
import { INDICATORS_CONFIG, getUniqueCategories } from '@/lib/indicators-config';

const REFRESH_INTERVAL = parseInt(
  process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '300000',
  10
);

interface DashboardState {
  indicators: EconomicIndicator[];
  observationsMap: Record<string, FredObservation[]>;
  fredSource: 'fred' | 'no_key' | 'error' | null;
  fomcMeetings: FOMCMeeting[];
  currentRate: number;
  currentRateRange: string;
  rateSource: string;
  fedProbabilities: FedProbability[];
  fedwatchSource: string;
  fedwatchError?: string;
  lastUpdated: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  errors: string[];
}


export default function Dashboard() {
  const [state, setState] = useState<DashboardState>({
    indicators: INDICATORS_CONFIG,
    observationsMap: {},
    fredSource: null,
    fomcMeetings: [],
    currentRate: 4.25,
    currentRateRange: '4.25% - 4.50%',
    rateSource: 'hardcoded',
    fedProbabilities: [],
    fedwatchSource: 'pending',
    fedwatchError: undefined,
    lastUpdated: null,
    isLoading: true,
    isRefreshing: false,
    errors: [],
  });

  const fetchAllData = useCallback(async (isInitial = false) => {
    setState((prev) => ({
      ...prev,
      isLoading: isInitial,
      isRefreshing: !isInitial,
      errors: [],
    }));

    const errors: string[] = [];
    const observationsMap: Record<string, FredObservation[]> = {};
    let fredSourceRef: 'fred' | 'no_key' | 'error' | null = null;

    // Fetch FRED data for all indicators
    await Promise.allSettled(
      INDICATORS_CONFIG.map(async (indicator) => {
        try {
          const url = indicator.fredUnits
            ? `/api/fred/${indicator.fredSeriesId}?units=${indicator.fredUnits}`
            : `/api/fred/${indicator.fredSeriesId}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            // Track the source from the first response (all same key)
            if (!fredSourceRef) fredSourceRef = data.source as 'fred' | 'no_key' | 'error';
            observationsMap[indicator.fredSeriesId] = data.observations || [];
          } else {
            errors.push(`Failed to fetch ${indicator.nameEn}`);
          }
        } catch {
          errors.push(`Network error for ${indicator.nameEn}`);
        }
      })
    );

    const fredSource: 'fred' | 'no_key' | 'error' = fredSourceRef ?? 'error';

    // status is always 'pending' — we don't have real consensus forecast data
    const indicators: EconomicIndicator[] = INDICATORS_CONFIG.map((ind) => {
      const obs = observationsMap[ind.fredSeriesId] || [];
      return {
        ...ind,
        currentValue: obs[0] ? parseFloat(obs[0].value) : null,
        previousValue: obs[1] ? parseFloat(obs[1].value) : null,
        status: 'pending' as const,
        observations: obs,
      };
    });

    // Fetch FOMC data
    let fomcMeetings: FOMCMeeting[] = [];
    let currentRate = 4.25;
    let currentRateRange = '4.25% - 4.50%';
    let rateSource = 'hardcoded';
    try {
      const fomcResponse = await fetch('/api/fomc');
      if (fomcResponse.ok) {
        const fomcData = await fomcResponse.json();
        fomcMeetings = fomcData.meetings || [];
        currentRate = fomcData.currentRate || 4.25;
        currentRateRange = fomcData.currentRateRange || '4.25% - 4.50%';
        rateSource = fomcData.rateSource || 'hardcoded';
      }
    } catch {
      errors.push('Failed to fetch FOMC data');
    }

    // Fetch FedWatch data
    let fedProbabilities: FedProbability[] = [];
    let fedwatchSource = 'error';
    let fedwatchError: string | undefined;
    try {
      const fedwatchResponse = await fetch('/api/fedwatch');
      if (fedwatchResponse.ok) {
        const fedData = await fedwatchResponse.json();
        fedProbabilities = fedData.probabilities || [];
        fedwatchSource = fedData.source || 'error';
        fedwatchError = fedData.error;
      }
    } catch {
      errors.push('Failed to fetch FedWatch data');
    }

    setState((prev) => ({
      ...prev,
      indicators,
      observationsMap,
      fredSource,
      fomcMeetings,
      currentRate,
      currentRateRange,
      rateSource,
      fedProbabilities,
      fedwatchSource,
      fedwatchError,
      lastUpdated: new Date().toISOString(),
      isLoading: false,
      isRefreshing: false,
      errors,
    }));
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData(false);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const categories = getUniqueCategories();

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <MacroHeader
        lastUpdated={state.lastUpdated}
        onRefresh={() => fetchAllData(false)}
        isRefreshing={state.isRefreshing}
      />

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-6">
        {/* Error Banner — only show non-data errors (network issues etc.) */}
        {state.errors.length > 0 && !state.isLoading && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400">
              ⚠ 网络错误：{state.errors.slice(0, 3).join(' | ')}
            </p>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Column (wider) - Economic Indicators + FedWatch */}
          <div className="flex-1 min-w-0">
            {/* Economic Indicators by Category */}
            {categories.map((category) => {
              const categoryIndicators = state.indicators.filter(
                (ind) => ind.category === category
              );
              return (
                <IndicatorSection
                  key={category}
                  category={category}
                  indicators={categoryIndicators}
                  observationsMap={state.observationsMap}
                  isLoading={state.isLoading}
                  fredSource={state.fredSource}
                />
              );
            })}

            {/* FedWatch Panel */}
            <FedWatchPanel
              meetings={state.fomcMeetings}
              probabilities={state.fedProbabilities}
              currentRate={state.currentRate}
              currentRateRange={state.currentRateRange}
              rateSource={state.rateSource}
              isLoading={state.isLoading}
              fedwatchSource={state.fedwatchSource}
              fedwatchError={state.fedwatchError}
            />
          </div>

          {/* Right Column (narrower) - Truth Social Feed */}
          <div className="xl:w-96 flex-shrink-0">
            <div className="sticky top-[105px]">
              <TruthSocialFeed />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-dashboard-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span>数据来源: FRED API, CME FedWatch, Truth Social RSS</span>
              <span className="text-dashboard-border">|</span>
              <span>每5分钟自动刷新</span>
            </div>
            <div>
              <span>⚠️ 本仪表盘仅供参考，不构成投资建议</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
