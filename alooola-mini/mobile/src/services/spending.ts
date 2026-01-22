/**
 * Spending API service.
 */
import { apiGet, apiPost } from './api';

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

export interface AccountBalance {
  availableBalance: number;
  currentBalance: number;
  asOf: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  institution: string | null;
  last4: string | null;
  balance: AccountBalance | null;
}

export interface Transaction {
  id: string;
  accountId: string;
  householdId: string;
  txnType: 'spend' | 'receive';
  amount: number;
  currency: string;
  merchant: string;
  txnDate: string;
  category: {
    id: string;
    name: string;
  } | null;
  attributedUser: {
    id: string;
    name: string;
  } | null;
}

export interface RewardAccount {
  balance: number;
  lifetimeEarned: number;
  rewardRatePct: number;
}

export interface Category {
  id: string;
  name: string;
}

/**
 * Get all accounts for a household.
 */
export async function getAccounts(householdId: string): Promise<Account[]> {
  return apiGet<Account[]>(`/households/${householdId}/accounts`);
}

/**
 * Create a new account.
 */
export async function createAccount(
  householdId: string,
  data: {
    name: string;
    type: 'checking' | 'savings' | 'investment' | 'credit';
    institution?: string;
    last4?: string;
    currentBalance?: number;
  }
): Promise<Account> {
  return apiPost<Account>(`/households/${householdId}/accounts`, data);
}

/**
 * Get transactions for a household, optionally filtered by account.
 */
export async function getTransactions(
  householdId: string,
  options?: { limit?: number; cursor?: string; accountId?: string }
): Promise<{ items: Transaction[]; nextCursor?: string; hasMore?: boolean }> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.cursor) params.set('cursor', options.cursor);
  if (options?.accountId) params.set('accountId', options.accountId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiGet(`/households/${householdId}/transactions${query}`);
}

/**
 * Create a new transaction for a household account.
 */
export async function createTransaction(
  householdId: string,
  data: {
    accountId: string;
    txnType: 'spend' | 'receive';
    amount: number;
    currency?: string;
    merchant: string;
    categoryId?: string | null;
    note?: string | null;
    attributedUserId?: string | null;
  }
): Promise<Transaction> {
  return apiPost<Transaction>(`/households/${householdId}/transactions`, {
    currency: 'USD',
    ...data,
  });
}

/**
 * Get categories for a household.
 */
export async function getCategories(householdId: string): Promise<Category[]> {
  return apiGet<Category[]>(`/households/${householdId}/categories`);
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
