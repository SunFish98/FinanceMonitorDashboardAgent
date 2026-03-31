import { FredObservation } from './types';

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

export interface FredResponse {
  observations: FredObservation[];
  error?: string;
}

export async function fetchFredSeries(
  seriesId: string,
  apiKey: string,
  limit: number = 12
): Promise<FredResponse> {
  const url = new URL(FRED_BASE_URL);
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('sort_order', 'desc');
  url.searchParams.set('file_type', 'json');

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return { observations: data.observations || [] };
}

export function getMockObservations(seriesId: string): FredObservation[] {
  const mockData: Record<string, FredObservation[]> = {
    PAYEMS: [
      { date: '2025-02-01', value: '159800' },
      { date: '2025-01-01', value: '159545' },
      { date: '2024-12-01', value: '159312' },
      { date: '2024-11-01', value: '159091' },
      { date: '2024-10-01', value: '158889' },
      { date: '2024-09-01', value: '158632' },
    ],
    UNRATE: [
      { date: '2025-02-01', value: '4.1' },
      { date: '2025-01-01', value: '4.0' },
      { date: '2024-12-01', value: '4.2' },
      { date: '2024-11-01', value: '4.2' },
      { date: '2024-10-01', value: '4.1' },
      { date: '2024-09-01', value: '4.1' },
    ],
    ICSA: [
      { date: '2025-03-15', value: '223000' },
      { date: '2025-03-08', value: '220000' },
      { date: '2025-03-01', value: '222000' },
      { date: '2025-02-22', value: '219000' },
      { date: '2025-02-15', value: '215000' },
      { date: '2025-02-08', value: '218000' },
    ],
    CPIAUCSL: [
      { date: '2025-02-01', value: '316.664' },
      { date: '2025-01-01', value: '315.605' },
      { date: '2024-12-01', value: '314.938' },
      { date: '2024-11-01', value: '314.174' },
      { date: '2024-10-01', value: '314.686' },
      { date: '2024-09-01', value: '315.301' },
    ],
    CPILFESL: [
      { date: '2025-02-01', value: '328.913' },
      { date: '2025-01-01', value: '327.850' },
      { date: '2024-12-01', value: '326.886' },
      { date: '2024-11-01', value: '325.930' },
      { date: '2024-10-01', value: '324.943' },
      { date: '2024-09-01', value: '323.947' },
    ],
    PCEPI: [
      { date: '2025-01-01', value: '125.023' },
      { date: '2024-12-01', value: '124.567' },
      { date: '2024-11-01', value: '124.012' },
      { date: '2024-10-01', value: '123.789' },
      { date: '2024-09-01', value: '123.456' },
      { date: '2024-08-01', value: '123.102' },
    ],
    PPIACO: [
      { date: '2025-02-01', value: '272.5' },
      { date: '2025-01-01', value: '271.8' },
      { date: '2024-12-01', value: '271.2' },
      { date: '2024-11-01', value: '270.6' },
      { date: '2024-10-01', value: '270.0' },
      { date: '2024-09-01', value: '271.5' },
    ],
    A191RL1Q225SBEA: [
      { date: '2024-10-01', value: '2.3' },
      { date: '2024-07-01', value: '3.0' },
      { date: '2024-04-01', value: '1.4' },
      { date: '2024-01-01', value: '1.6' },
      { date: '2023-10-01', value: '4.9' },
      { date: '2023-07-01', value: '2.1' },
    ],
    UMCSENT: [
      { date: '2025-03-01', value: '57.9' },
      { date: '2025-02-01', value: '64.7' },
      { date: '2025-01-01', value: '71.1' },
      { date: '2024-12-01', value: '74.0' },
      { date: '2024-11-01', value: '71.8' },
      { date: '2024-10-01', value: '70.5' },
    ],
    RSXFS: [
      { date: '2025-02-01', value: '723456' },
      { date: '2025-01-01', value: '718920' },
      { date: '2024-12-01', value: '730000' },
      { date: '2024-11-01', value: '715600' },
      { date: '2024-10-01', value: '709800' },
      { date: '2024-09-01', value: '705200' },
    ],
    MANEMP: [
      { date: '2025-02-01', value: '48.6' },
      { date: '2025-01-01', value: '50.9' },
      { date: '2024-12-01', value: '49.3' },
      { date: '2024-11-01', value: '48.4' },
      { date: '2024-10-01', value: '46.5' },
      { date: '2024-09-01', value: '47.2' },
    ],
    NMFCI: [
      { date: '2025-02-01', value: '53.5' },
      { date: '2025-01-01', value: '52.8' },
      { date: '2024-12-01', value: '54.1' },
      { date: '2024-11-01', value: '52.1' },
      { date: '2024-10-01', value: '56.0' },
      { date: '2024-09-01', value: '54.9' },
    ],
    HOUST: [
      { date: '2025-02-01', value: '1501' },
      { date: '2025-01-01', value: '1366' },
      { date: '2024-12-01', value: '1499' },
      { date: '2024-11-01', value: '1289' },
      { date: '2024-10-01', value: '1311' },
      { date: '2024-09-01', value: '1354' },
    ],
    EXHOSLUSM495S: [
      { date: '2025-01-01', value: '4.08' },
      { date: '2024-12-01', value: '4.24' },
      { date: '2024-11-01', value: '4.15' },
      { date: '2024-10-01', value: '3.96' },
      { date: '2024-09-01', value: '3.84' },
      { date: '2024-08-01', value: '3.86' },
    ],
  };

  return mockData[seriesId] || [
    { date: '2025-03-01', value: '100.0' },
    { date: '2025-02-01', value: '99.5' },
    { date: '2025-01-01', value: '99.0' },
  ];
}

export function calculateYoYChange(observations: FredObservation[]): number | null {
  if (observations.length < 2) return null;
  const current = parseFloat(observations[0].value);
  const previous = parseFloat(observations[1].value);
  if (isNaN(current) || isNaN(previous) || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
