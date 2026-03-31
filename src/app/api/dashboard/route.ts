import { NextResponse } from 'next/server';
import { ECONOMIC_INDICATORS } from '@/lib/indicators';
import { FOMC_MEETINGS_2025_2026 } from '@/lib/fomc';
import { fetchLatestFredValue } from '@/lib/fred';
import { EconomicIndicator, DashboardData, TruthPost, FedProbability } from '@/lib/types';

// Mock Truth Social posts for demonstration
const MOCK_TRUTH_POSTS: TruthPost[] = [
  {
    id: '1',
    content:
      '美联储应该立即降息！我们的经济比任何人想象的都要强大。通货膨胀已经在控制之下，是时候刺激增长了！🇺🇸',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com',
  },
  {
    id: '2',
    content:
      '就业数字看起来很好！我们正在创造历史上最好的经济。股市在创造新高，这是我承诺的。MAGA！',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com',
  },
  {
    id: '3',
    content:
      'CPI数据显示通胀持续下降。Powell应该跟进并降低利率。利率过高正在损害我们的经济！',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com',
  },
];

// Mock Fed rate probabilities
const MOCK_FED_PROBABILITIES: FedProbability[] = [
  {
    meetingDate: '2026-04-29',
    meetingLabel: '4月FOMC',
    currentRate: 3.5,
    mostLikelyOutcome: '维持不变 (3.25-3.50%)',
    probabilities: [
      { rate: '3.00-3.25', probability: 5, change: -50 },
      { rate: '3.25-3.50', probability: 72, change: -25 },
      { rate: '3.50-3.75', probability: 23, change: 0 },
    ],
  },
  {
    meetingDate: '2026-06-10',
    meetingLabel: '6月FOMC',
    currentRate: 3.5,
    mostLikelyOutcome: '降息25bp (3.25-3.50%)',
    probabilities: [
      { rate: '2.75-3.00', probability: 3, change: -75 },
      { rate: '3.00-3.25', probability: 18, change: -50 },
      { rate: '3.25-3.50', probability: 54, change: -25 },
      { rate: '3.50-3.75', probability: 25, change: 0 },
    ],
  },
];

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_FRED_API_KEY || '';

  let indicators: EconomicIndicator[] = ECONOMIC_INDICATORS.map((ind) => ({ ...ind }));

  if (apiKey && apiKey !== 'your_fred_api_key_here') {
    // Fetch real data from FRED
    const fetchPromises = indicators.map(async (indicator) => {
      try {
        const { current, previous, observations } = await fetchLatestFredValue(
          indicator.fredSeriesId,
          apiKey
        );
        return {
          ...indicator,
          currentValue: current,
          previousValue: previous,
          observations,
          status: current !== null ? ('inline' as const) : ('pending' as const),
        };
      } catch {
        return { ...indicator, status: 'pending' as const };
      }
    });

    indicators = await Promise.all(fetchPromises);
  } else {
    // Use mock data
    indicators = indicators.map((ind) => ({
      ...ind,
      currentValue: getMockValue(ind.id),
      previousValue: getMockPreviousValue(ind.id),
      status: getMockStatus(ind.id),
      releaseDate: new Date().toISOString(),
      observations: generateMockObservations(ind.id),
    }));
  }

  const dashboardData: DashboardData = {
    indicators,
    fomcMeetings: FOMC_MEETINGS_2025_2026,
    truthPosts: MOCK_TRUTH_POSTS,
    fedProbabilities: MOCK_FED_PROBABILITIES,
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(dashboardData);
}

function getMockValue(id: string): number {
  const values: Record<string, number> = {
    'nonfarm-payrolls': 228,
    'unemployment-rate': 4.1,
    cpi: 3.2,
    'core-cpi': 3.4,
    pce: 2.8,
    gdp: 29800,
    'ism-manufacturing': 49.3,
    'retail-sales': 724850,
    'housing-starts': 1423,
    'existing-home-sales': 4.02,
  };
  return values[id] ?? 0;
}

function getMockPreviousValue(id: string): number {
  const values: Record<string, number> = {
    'nonfarm-payrolls': 195,
    'unemployment-rate': 4.2,
    cpi: 3.0,
    'core-cpi': 3.3,
    pce: 2.6,
    gdp: 29400,
    'ism-manufacturing': 47.8,
    'retail-sales': 718200,
    'housing-starts': 1381,
    'existing-home-sales': 3.88,
  };
  return values[id] ?? 0;
}

function getMockStatus(id: string): 'beat' | 'miss' | 'inline' | 'pending' {
  const statuses: Record<string, 'beat' | 'miss' | 'inline' | 'pending'> = {
    'nonfarm-payrolls': 'beat',
    'unemployment-rate': 'beat',
    cpi: 'miss',
    'core-cpi': 'miss',
    pce: 'inline',
    gdp: 'beat',
    'ism-manufacturing': 'miss',
    'retail-sales': 'beat',
    'housing-starts': 'inline',
    'existing-home-sales': 'beat',
  };
  return statuses[id] ?? 'pending';
}

function generateMockObservations(id: string): { date: string; value: string }[] {
  const baseValue = getMockValue(id);
  const observations = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const variation = (Math.random() - 0.5) * 0.1 * baseValue;
    observations.push({
      date: date.toISOString().split('T')[0],
      value: (baseValue + variation).toFixed(2),
    });
  }

  return observations;
}
