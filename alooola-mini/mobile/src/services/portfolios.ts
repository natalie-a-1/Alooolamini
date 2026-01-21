/**
 * Portfolio API service.
 */
import { apiGet } from './api';

export interface CuratedPortfolio {
  id: string;
  name: string;
  description: string | null;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  oneYearReturnPct: number | null;
  holdings: PortfolioHolding[];
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  weightPct: number;
}

export interface PortfolioSummary {
  totalValue: number;
  gainAmount: number;
  gainPercent: number;
  snapshots: PortfolioSnapshot[];
}

export interface PortfolioSnapshot {
  totalValue: number;
  gainAmount: number | null;
  asOf: string;
}

/**
 * Get all curated portfolios.
 */
export async function getCuratedPortfolios(): Promise<CuratedPortfolio[]> {
  return apiGet<CuratedPortfolio[]>('/portfolios');
}

/**
 * Get a specific portfolio by ID.
 */
export async function getPortfolio(id: string): Promise<CuratedPortfolio> {
  return apiGet<CuratedPortfolio>(`/portfolios/${id}`);
}

/**
 * Get portfolio summary for a household.
 * @param range - Optional time range: '1M', '3M', '6M', '1Y', or 'ALL'
 */
export async function getPortfolioSummary(householdId: string, range?: string): Promise<PortfolioSummary> {
  const params = range ? `?range=${range}` : '';
  return apiGet<PortfolioSummary>(`/households/${householdId}/portfolio-summary${params}`);
}
