/**
 * Mutual funds API service.
 */
import { apiGet } from './api';

export interface MutualFund {
  id: string;
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: number | null;
}

export interface MutualFundPerformancePoint {
  date: string;
  close: number;
}

export interface MutualFundPerformance {
  symbol: string;
  points: MutualFundPerformancePoint[];
  rangeLow: number;
  rangeHigh: number;
  oneMonthChange: number;
  oneMonthChangePercent: number;
  oneYearChange: number;
  oneYearChangePercent: number;
}

export interface MutualFundQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  asOf: string;
}

/**
 * Get all mutual funds for discovery.
 */
export async function getMutualFunds(options?: {
  keywords?: string;
  limit?: number;
}): Promise<MutualFund[]> {
  const params: string[] = [];
  if (options?.keywords) {
    params.push(`keywords=${encodeURIComponent(options.keywords)}`);
  }
  if (typeof options?.limit === 'number') {
    params.push(`limit=${options.limit}`);
  }
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return apiGet<MutualFund[]>(`/mutual-funds${query}`);
}

/**
 * Get monthly mutual fund performance.
 */
export async function getMutualFundPerformance(symbol: string): Promise<MutualFundPerformance> {
  const encoded = encodeURIComponent(symbol);
  return apiGet<MutualFundPerformance>(`/mutual-funds/${encoded}/performance`);
}

/**
 * Get latest mutual fund quote.
 */
export async function getMutualFundQuote(symbol: string): Promise<MutualFundQuote> {
  const encoded = encodeURIComponent(symbol);
  return apiGet<MutualFundQuote>(`/mutual-funds/${encoded}/quote`);
}
