import { NextResponse } from 'next/server';
import { FedProbability } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MOCK_FED_PROBABILITIES: FedProbability[] = [
  {
    meetingDate: '2025-05-07',
    meetingLabel: '2025年5月FOMC',
    currentRate: 4.25,
    mostLikelyOutcome: '维持不变 (4.25-4.50%)',
    probabilities: [
      { rate: '4.50-4.75', probability: 2, change: 25 },
      { rate: '4.25-4.50', probability: 78, change: 0 },
      { rate: '4.00-4.25', probability: 18, change: -25 },
      { rate: '3.75-4.00', probability: 2, change: -50 },
    ],
  },
  {
    meetingDate: '2025-06-18',
    meetingLabel: '2025年6月FOMC',
    currentRate: 4.25,
    mostLikelyOutcome: '降息25BP (4.00-4.25%)',
    probabilities: [
      { rate: '4.25-4.50', probability: 25, change: 0 },
      { rate: '4.00-4.25', probability: 52, change: -25 },
      { rate: '3.75-4.00', probability: 20, change: -50 },
      { rate: '3.50-3.75', probability: 3, change: -75 },
    ],
  },
  {
    meetingDate: '2025-07-30',
    meetingLabel: '2025年7月FOMC',
    currentRate: 4.25,
    mostLikelyOutcome: '降息25BP (4.00-4.25%)',
    probabilities: [
      { rate: '4.25-4.50', probability: 15, change: 0 },
      { rate: '4.00-4.25', probability: 45, change: -25 },
      { rate: '3.75-4.00', probability: 30, change: -50 },
      { rate: '3.50-3.75', probability: 10, change: -75 },
    ],
  },
  {
    meetingDate: '2025-09-17',
    meetingLabel: '2025年9月FOMC',
    currentRate: 4.25,
    mostLikelyOutcome: '降息25-50BP',
    probabilities: [
      { rate: '4.00-4.25', probability: 20, change: -25 },
      { rate: '3.75-4.00', probability: 40, change: -50 },
      { rate: '3.50-3.75', probability: 30, change: -75 },
      { rate: '3.25-3.50', probability: 10, change: -100 },
    ],
  },
];

export async function GET() {
  try {
    // Attempt to fetch from CME FedWatch
    const cmeUrl =
      'https://www.cmegroup.com/CmeWS/mvc/FFMDataHandler/getFedFundProbability';

    const response = await fetch(cmeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FinanceDashboard/1.0)',
        Accept: 'application/json',
      },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      // If we got real data, try to parse it
      if (data && Array.isArray(data)) {
        return NextResponse.json({
          probabilities: MOCK_FED_PROBABILITIES, // Use mock as CME format varies
          source: 'mock',
          rawCme: data.slice(0, 2),
        });
      }
    }
  } catch {
    // Fall through to mock data
  }

  return NextResponse.json({
    probabilities: MOCK_FED_PROBABILITIES,
    source: 'mock',
    lastUpdated: new Date().toISOString(),
  });
}
