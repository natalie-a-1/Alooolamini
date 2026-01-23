/**
 * Investments API service.
 */
import { apiGet } from './api';

export interface InvestmentSnapshot {
  totalValue: number;
  gainAmount: number | null;
  asOf: string;
}

export interface InvestmentSummary {
  totalValue: number;
  snapshots: InvestmentSnapshot[];
}

export async function getInvestmentSummary(
  householdId: string,
  range?: '1M' | '3M' | '6M' | '1Y' | 'ALL'
): Promise<InvestmentSummary> {
  const params = range ? `?range=${range}` : '';
  return apiGet<InvestmentSummary>(`/households/${householdId}/investments/summary${params}`);
}
