import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { series: string } }
) {
  const seriesId = params.series;
  const apiKey = process.env.NEXT_PUBLIC_FRED_API_KEY;

  if (!apiKey || apiKey === 'your_fred_api_key_here') {
    return NextResponse.json(
      {
        observations: [],
        source: 'no_key',
        seriesId,
        error: 'FRED API key not configured. Add NEXT_PUBLIC_FRED_API_KEY to .env.local',
      },
      { status: 200 }
    );
  }

  try {
    const url = new URL('https://api.stlouisfed.org/fred/series/observations');
    url.searchParams.set('series_id', seriesId);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('limit', '13');
    url.searchParams.set('sort_order', 'desc');
    url.searchParams.set('file_type', 'json');

    const response = await fetch(url.toString(), {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`FRED API ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = await response.json();
    // Filter out observations with value "." (not yet released)
    const observations = (data.observations || []).filter(
      (o: { value: string }) => o.value !== '.'
    );

    return NextResponse.json({
      observations,
      source: 'fred',
      seriesId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        observations: [],
        source: 'error',
        seriesId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
