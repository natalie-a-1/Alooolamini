/**
 * Mock data and types for the Discover screen.
 */
import type { CuratedPortfolio } from '@/services/portfolios';

export interface Opportunity {
  id: string; // UUID from database
  name: string;
  ticker: string;
  return: string;
  risk: string;
  description?: string;
}

export const BORDER_ACCENTS = [
  { borderLeftColor: '#94a3b8' },
  { borderLeftColor: '#71717a' },
  { borderLeftColor: '#6b7280' },
  { borderLeftColor: '#78716c' },
];

/**
 * Transform a CuratedPortfolio from the API to an Opportunity for display.
 */
export function portfolioToOpportunity(portfolio: CuratedPortfolio): Opportunity {
  // Get ticker symbols from holdings
  const tickers = portfolio.holdings?.map(h => h.symbol).join(', ') || '';
  
  // Format return percentage
  const returnPct = portfolio.oneYearReturnPct 
    ? `${portfolio.oneYearReturnPct >= 0 ? '+' : ''}${Number(portfolio.oneYearReturnPct).toFixed(1)}%`
    : 'N/A';
  
  // Format risk tolerance
  const riskMap: Record<string, string> = {
    conservative: 'Conservative',
    moderate: 'Moderate',
    aggressive: 'Aggressive',
  };
  
  return {
    id: portfolio.id,
    name: portfolio.name,
    ticker: tickers,
    return: returnPct,
    risk: riskMap[portfolio.riskTolerance] || portfolio.riskTolerance,
    description: portfolio.description || undefined,
  };
}

export const QUICK_ACTIONS = ['Portfolio recommendations', 'Tax strategies', 'Schedule with advisor'];

export const AVAILABLE_DATES = ['Mon, Jan 20', 'Tue, Jan 21', 'Wed, Jan 22', 'Thu, Jan 23', 'Fri, Jan 24'];

export const AVAILABLE_TIMES = ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '5:00 PM'];

export const INITIAL_AI_MESSAGE = {
  id: 1,
  type: 'ai' as const,
  text: 'Hi Dr. Morgan! How can I help you today?',
  time: 'Just now',
};
