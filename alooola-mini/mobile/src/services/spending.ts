/**
 * Spending API service.
 * 
 * Provides functions and types to interact with the spending, accounts,
 * transactions, and budgeting resources in a household context.
 */
import { apiGet, apiPost } from './api';

/**
 * Represents a category of spending, such as Groceries or Utilities.
 */
export interface SpendingCategory {
  /** Unique identifier for this category. */
  id: string;
  /** The category's display name. */
  name: string;
  /** Total amount spent in this category. */
  amount: number;
  /** Percentage of total spending within this category. */
  percent: number;
}

/**
 * Summary information about spending and budget usage for a household.
 */
export interface SpendingSummary {
  /** Total amount spent over the summary period. */
  totalSpent: number;
  /** Total budget allocated for the period. */
  budget: number;
  /** Percentage of the budget that has been used. */
  percentUsed: number;
  /** Breakdown of spending by categories. */
  categories: SpendingCategory[];
}

/**
 * Current and available balance for a financial account.
 */
export interface AccountBalance {
  /** Funds available to spend. */
  availableBalance: number;
  /** Total balance, may include pending/held funds. */
  currentBalance: number;
  /** ISO8601 date string indicating balance "as of" time. */
  asOf: string;
}

/**
 * Represents a financial account within a household.
 */
export interface Account {
  /** Account unique ID. */
  id: string;
  /** Account display name (e.g., "Chase Checking"). */
  name: string;
  /** Account type (checking, savings, investment, credit). */
  type: 'checking' | 'savings' | 'investment' | 'credit';
  /** The institution, if known (may be null for manual accounts). */
  institution: string | null;
  /** Last 4 digits of account number, if applicable. */
  last4: string | null;
  /** Account balance details. */
  balance: AccountBalance | null;
}

/**
 * A single transaction (spend or receive) for a household account.
 */
export interface Transaction {
  /** Unique transaction identifier. */
  id: string;
  /** Account associated with this transaction. */
  accountId: string;
  /** Household that owns this transaction. */
  householdId: string;
  /** Type of transaction: spend (debit) or receive (credit). */
  txnType: 'spend' | 'receive';
  /** Amount of the transaction (positive value). */
  amount: number;
  /** ISO currency code, such as "USD". */
  currency: string;
  /** Merchant or payee name. */
  merchant: string;
  /** ISO8601 transaction date string. */
  txnDate: string;
  /** Category assigned to the transaction, or null if uncategorized. */
  category: {
    id: string;
    name: string;
  } | null;
  /** User that the transaction is attributed to, if any. */
  attributedUser: {
    id: string;
    name: string;
  } | null;
}

/**
 * A generic spending category.
 */
export interface Category {
  /** Unique category ID. */
  id: string;
  /** Display name for the category. */
  name: string;
}

/**
 * Fetches all financial accounts associated with a household.
 * 
 * @param householdId - The unique ID for the household
 * @returns Promise resolving to an array of Account objects
 */
export async function getAccounts(householdId: string): Promise<Account[]> {
  return apiGet<Account[]>(`/households/${householdId}/accounts`);
}

/**
 * Creates a new account in the given household.
 *
 * @param householdId - ID of the household to add the account to
 * @param data - New account details (name, type, etc.)
 * @returns Promise resolving to the created Account object
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
 * Retrieves transactions for a household.
 * Can be filtered by account, paginated with a limit/cursor.
 *
 * @param householdId - The household ID
 * @param options - Optional filters: limit, cursor (for pagination), accountId
 * @returns Promise resolving to a paginated list of Transactions
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
  return apiGet<{ items: Transaction[]; nextCursor?: string; hasMore?: boolean }>(
    `/households/${householdId}/transactions${query}`
  );
}

/**
 * Creates a new transaction (spend/receive) in a household account.
 *
 * @param householdId - The household ID
 * @param data - Transaction data (account, amount, merchant, etc.)
 * @returns Promise resolving to the created Transaction object
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
 * Retrieves all spending categories available for a household.
 * 
 * @param householdId - The household ID
 * @returns Promise resolving to an array of Category objects
 */
export async function getCategories(householdId: string): Promise<Category[]> {
  return apiGet<Category[]>(`/households/${householdId}/categories`);
}

/**
 * Fetches the current spending summary for a household over a time period.
 *
 * @param householdId - The household ID
 * @param period - Optional period string (e.g., "month", "year") for time range
 * @returns Promise resolving to a SpendingSummary object
 */
export async function getSpendingSummary(
  householdId: string,
  period?: string
): Promise<SpendingSummary> {
  const params = period ? `?period=${period}` : '';
  return apiGet<SpendingSummary>(`/households/${householdId}/spending${params}`);
}
