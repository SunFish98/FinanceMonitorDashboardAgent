import { NextRequest, NextResponse } from 'next/server';
import { getMockObservations } from '@/lib/fred-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { series: string } }
) {
  const seriesId = params.series;
  const apiKey = process.env.NEXT_PUBLIC_FRED_API_KEY;

  if (!apiKey || apiKey === 'your_fred_api_key_here') {
    // Return mock data
    const observations = getMockObservations(seriesId);
    return NextResponse.json({
      observations,
      source: 'mock',
      seriesId,
    });
  }

  try {
    const url = new URL('https://api.stlouisfed.org/fred/series/observations');
    url.searchParams.set('series_id', seriesId);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('limit', '12');
    url.searchParams.set('sort_order', 'desc');
    url.searchParams.set('file_type', 'json');

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`FRED API responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({
      observations: data.observations || [],
      source: 'fred',
      seriesId,
    });
  } catch (error) {
    console.error(`Failed to fetch FRED series ${seriesId}:`, error);
    // Fallback to mock data on error
    const observations = getMockObservations(seriesId);
    return NextResponse.json({
      observations,
      source: 'mock_fallback',
      seriesId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
