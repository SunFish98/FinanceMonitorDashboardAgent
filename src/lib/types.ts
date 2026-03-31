export type IndicatorStatus = 'beat' | 'miss' | 'inline' | 'pending';

export type IndicatorCategory =
  | 'employment'
  | 'inflation'
  | 'gdp'
  | 'pmi_retail'
  | 'housing';

export interface FredObservation {
  date: string;
  value: string;
}

export interface EconomicIndicator {
  id: string;
  name: string; // Chinese name
  nameEn: string;
  description: string; // Chinese description
  schedule: string; // Chinese release schedule
  importance: 1 | 2 | 3 | 4 | 5;
  category: IndicatorCategory;
  fredSeriesId: string;
  unit: string;
  unitSuffix?: string;
  marketImpact: {
    beat: string;
    miss: string;
    inline: string;
  };
  // Runtime data (populated from API)
  currentValue?: number | null;
  previousValue?: number | null;
  forecast?: number | null;
  status?: IndicatorStatus;
  releaseDate?: string;
  observations?: FredObservation[];
}

export interface FOMCMeeting {
  id: string;
  date: string; // ISO date string
  endDate?: string;
  status: 'past' | 'upcoming' | 'current';
  rateDecision?: number; // basis points change
  currentRate?: number; // federal funds rate target
  notes?: string;
}

export interface TruthPost {
  id: string;
  title?: string;
  content: string;
  date: string; // ISO date string
  url: string;
  imageUrl?: string;
  isRetruth?: boolean;
}

export interface FedProbability {
  meetingDate: string;
  meetingLabel: string;
  probabilities: RateProbability[];
  currentRate: number;
  mostLikelyOutcome: string;
}

export interface RateProbability {
  rate: string; // e.g., "5.25-5.50"
  probability: number; // 0-100
  change: number; // basis points from current
}

export interface DashboardData {
  indicators: EconomicIndicator[];
  fomcMeetings: FOMCMeeting[];
  truthPosts: TruthPost[];
  fedProbabilities: FedProbability[];
  lastUpdated: string;
}
