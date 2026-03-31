import { NextRequest, NextResponse } from 'next/server';
import { fetchFredSeries } from '@/lib/fred';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const seriesId = searchParams.get('series_id');
  const limit = parseInt(searchParams.get('limit') || '24', 10);

  if (!seriesId) {
    return NextResponse.json({ error: 'series_id is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FRED_API_KEY || '';

  if (!apiKey || apiKey === 'your_fred_api_key_here') {
    return NextResponse.json({ error: 'FRED API key not configured' }, { status: 503 });
  }

  try {
    const observations = await fetchFredSeries(seriesId, apiKey, limit);
    return NextResponse.json({ observations });
  } catch (error) {
    console.error('FRED fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch FRED data' }, { status: 500 });
  }
}
