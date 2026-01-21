/**
 * Watchlist API service.
 */
import { apiGet, apiPost, apiDelete } from './api';
import type { CuratedPortfolio } from './portfolios';

export interface WatchlistItem {
  id: string;
  userId: string;
  portfolioId: string;
  createdAt: string;
  portfolio: CuratedPortfolio;
}

/**
 * Get all watchlist items for the current user.
 */
export async function getWatchlist(): Promise<WatchlistItem[]> {
  return apiGet<WatchlistItem[]>('/watchlist');
}

/**
 * Check if a portfolio is in the user's watchlist.
 */
export async function isInWatchlist(portfolioId: string): Promise<boolean> {
  const result = await apiGet<{ inWatchlist: boolean }>(`/watchlist/${portfolioId}`);
  return result.inWatchlist;
}

/**
 * Add a portfolio to the user's watchlist.
 */
export async function addToWatchlist(portfolioId: string): Promise<WatchlistItem> {
  return apiPost<WatchlistItem>('/watchlist', { portfolioId });
}

/**
 * Remove a portfolio from the user's watchlist.
 */
export async function removeFromWatchlist(portfolioId: string): Promise<void> {
  await apiDelete(`/watchlist/${portfolioId}`);
}
