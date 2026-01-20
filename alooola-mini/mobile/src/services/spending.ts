/**
 * Spending API service.
 */
import { apiGet } from './api';

export interface SpendingCategory {
  id: string;
  name: string;
  amount: number;
  percent: number;
}

export interface SpendingSummary {
  totalSpent: number;
  budget: number;
  percentUsed: number;
  categories: SpendingCategory[];
}

export interface Transaction {
  id: string;
  txnType: 'debit' | 'credit';
  amount: number;
  currency: string;
  merchant: string;
  txnDate: string;
  note: string | null;
  category: {
    id: string;
    name: string;
  };
}

export interface AccountBalance {
  availableBalance: number;
  currentBalance: number;
  asOf: string;
}

export interface RewardAccount {
  balance: number;
  lifetimeEarned: number;
  rewardRatePct: number;
}

/**
 * Get spending summary for a household.
 */
export async function getSpendingSummary(
  householdId: string,
  period?: string
): Promise<SpendingSummary> {
  const params = period ? `?period=${period}` : '';
  return apiGet<SpendingSummary>(`/households/${householdId}/spending${params}`);
}

/**
 * Get transactions for a household.
 */
export async function getTransactions(
  householdId: string,
  options?: { limit?: number; cursor?: string }
): Promise<{ items: Transaction[]; nextCursor?: string }> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.cursor) params.set('cursor', options.cursor);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiGet(`/households/${householdId}/transactions${query}`);
}

/**
 * Get account balances for a household.
 */
export async function getAccountBalances(householdId: string): Promise<AccountBalance[]> {
  return apiGet<AccountBalance[]>(`/households/${householdId}/accounts/balances`);
}

/**
 * Get user's reward account.
 */
export async function getRewardAccount(): Promise<RewardAccount> {
  return apiGet<RewardAccount>('/rewards/me');
}
