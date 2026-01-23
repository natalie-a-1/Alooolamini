/**
 * Portfolio API service.
 */
import { apiGet, apiPost } from './api';

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

export interface PortfolioPosition {
  id: string;
  userId: string;
  householdId: string;
  portfolioId: string;
  amountInvested: number;
  portfolio: CuratedPortfolio;
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
 * Buy a portfolio position.
 * Debits the specified funding account and creates/updates the user's position.
 * 
 * @param householdId - The household making the purchase
 * @param portfolioId - The portfolio to buy
 * @param amountInvested - Dollar amount to invest
 * @param fundingAccountId - Checking or savings account to debit
 */
export async function buyPortfolio(
  householdId: string,
  portfolioId: string,
  amountInvested: number,
  fundingAccountId: string
): Promise<PortfolioPosition> {
  return apiPost<PortfolioPosition>(`/households/${householdId}/portfolio-positions`, {
    portfolioId,
    amountInvested,
    fundingAccountId,
  });
}

/**
 * Get user's portfolio positions for a household.
 */
export async function getPortfolioPositions(householdId: string): Promise<PortfolioPosition[]> {
  return apiGet<PortfolioPosition[]>(`/households/${householdId}/portfolio-positions`);
}
