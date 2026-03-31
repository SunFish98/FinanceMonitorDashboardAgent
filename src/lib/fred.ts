import { FredObservation } from './types';

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

export async function fetchFredSeries(
  seriesId: string,
  apiKey: string,
  limit = 24
): Promise<FredObservation[]> {
  const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}`;

  const response = await fetch(url, { next: { revalidate: 300 } });

  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status} for series ${seriesId}`);
  }

  const data = await response.json();
  return data.observations || [];
}

export async function fetchLatestFredValue(
  seriesId: string,
  apiKey: string
): Promise<{ current: number | null; previous: number | null; observations: FredObservation[] }> {
  try {
    const observations = await fetchFredSeries(seriesId, apiKey, 24);

    // Filter out missing values ('.')
    const validObs = observations.filter((o) => o.value !== '.' && !isNaN(parseFloat(o.value)));

    if (validObs.length === 0) {
      return { current: null, previous: null, observations: [] };
    }

    const current = parseFloat(validObs[0].value);
    const previous = validObs.length > 1 ? parseFloat(validObs[1].value) : null;

    return {
      current,
      previous,
      observations: validObs.slice(0, 12).reverse(),
    };
  } catch (error) {
    console.error(`Error fetching FRED series ${seriesId}:`, error);
    return { current: null, previous: null, observations: [] };
  }
}

export function computeYoYChange(observations: FredObservation[]): number | null {
  if (observations.length < 13) return null;
  const latest = parseFloat(observations[observations.length - 1].value);
  const yearAgo = parseFloat(observations[observations.length - 13].value);
  if (isNaN(latest) || isNaN(yearAgo) || yearAgo === 0) return null;
  return ((latest - yearAgo) / Math.abs(yearAgo)) * 100;
}
