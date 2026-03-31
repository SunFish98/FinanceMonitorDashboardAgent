import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// CME FedWatch probability data endpoints (public, no auth required)
const CME_ENDPOINTS = [
  'https://www.cmegroup.com/CmeWS/mvc/FFMDataHandler/getFedFundProbability',
  'https://www.cmegroup.com/CmeWS/mvc/FFMDataHandler/getFedFundProbabilityData',
];

interface CmeProbabilityEntry {
  date?: string;
  meetingDate?: string;
  probabilities?: Array<{ rate: number | string; probability: number | string }>;
  probs?: Array<{ rate: number | string; prob: number | string }>;
}

function parseCmeResponse(data: unknown): { parsed: boolean; data: unknown } {
  // CME returns various formats — try to detect if it's usable data
  if (!data) return { parsed: false, data: null };
  if (Array.isArray(data) && data.length > 0) return { parsed: true, data };
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data as object);
    if (keys.length > 0) return { parsed: true, data };
  }
  return { parsed: false, data: null };
}

export async function GET() {
  const errors: string[] = [];
  let rawData: unknown = null;

  // Try each CME endpoint
  for (const url of CME_ENDPOINTS) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          Referer: 'https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html',
          Origin: 'https://www.cmegroup.com',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('json')) {
          const data = await response.json();
          const { parsed } = parseCmeResponse(data);
          if (parsed) {
            rawData = data;
            break;
          }
        }
      } else {
        errors.push(`${url} returned ${response.status}`);
      }
    } catch (err) {
      errors.push(`${url}: ${err instanceof Error ? err.message : 'timeout/network error'}`);
    }
  }

  if (rawData !== null) {
    // Return the raw CME data — let the client display it or handle parsing
    return NextResponse.json({
      probabilities: [],
      source: 'cme_raw',
      raw: rawData,
      lastUpdated: new Date().toISOString(),
    });
  }

  // CME blocked or unavailable — return error, no fake data
  return NextResponse.json({
    probabilities: [],
    source: 'error',
    error: 'CME FedWatch API不可用。请直接访问 https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html',
    errors,
    lastUpdated: new Date().toISOString(),
  });
}
