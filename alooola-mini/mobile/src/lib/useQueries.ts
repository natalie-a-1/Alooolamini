/**
 * Shared TanStack Query hooks for server state management.
 *
 * These hooks wrap the existing service functions and provide:
 * - Automatic caching and background refetch
 * - Consistent loading/error states
 * - Cache invalidation after mutations
 *
 * All network calls still happen in services/<feature>.ts per architecture guidelines.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investmentKeys, accountKeys, watchlistKeys, notificationKeys } from './queryKeys';
import { getInvestmentSummary, type InvestmentSummary } from '@/services/investments';
import {
  getAccounts,
  getTransactions,
  getCategories,
  createAccount,
  createTransaction,
  type Account,
  type Transaction,
  type Category,
} from '@/services/spending';
import { getWatchlist, addToWatchlist, removeFromWatchlist, type WatchlistItem } from '@/services/watchlist';
import { getUnreadCount } from '@/services/notifications';

// ============================================================================
// Investment Hooks
// ============================================================================

/**
 * Fetches investment summary for a household.
 * Returns cached data instantly if available, with background refresh.
 * Uses staleTime: 0 to ensure fresh data on every mount (navigation).
 */
export function useInvestmentSummary(householdId: string | undefined) {
  return useQuery<InvestmentSummary | null>({
    queryKey: investmentKeys.summary(householdId ?? ''),
    queryFn: async () => {
      if (!householdId) return null;
      return getInvestmentSummary(householdId, 'ALL');
    },
    enabled: !!householdId,
    // Always refetch when mounting to ensure Home screen shows fresh investment data
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

// ============================================================================
// Account Hooks
// ============================================================================

/**
 * Fetches all accounts for a household.
 */
export function useAccounts(householdId: string | undefined) {
  return useQuery<Account[]>({
    queryKey: accountKeys.list(householdId ?? ''),
    queryFn: async () => {
      if (!householdId) return [];
      return getAccounts(householdId);
    },
    enabled: !!householdId,
  });
}

/**
 * Fetches transactions for a specific account.
 */
export function useTransactions(householdId: string | undefined, accountId: string | undefined) {
  return useQuery<Transaction[]>({
    queryKey: accountKeys.transactions(householdId ?? '', accountId ?? ''),
    queryFn: async () => {
      if (!householdId || !accountId) return [];
      const result = await getTransactions(householdId, { accountId, limit: 10 });
      return result.items;
    },
    enabled: !!householdId && !!accountId,
  });
}

/**
 * Fetches categories for a household.
 */
export function useCategories(householdId: string | undefined) {
  return useQuery<Category[]>({
    queryKey: accountKeys.categories(householdId ?? ''),
    queryFn: async () => {
      if (!householdId) return [];
      return getCategories(householdId);
    },
    enabled: !!householdId,
  });
}

/**
 * Mutation to create a new account.
 * Invalidates accounts list on success.
 */
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      householdId,
      data,
    }: {
      householdId: string;
      data: {
        name: string;
        type: 'checking' | 'savings' | 'investment' | 'credit';
        institution?: string;
        last4?: string;
        currentBalance?: number;
      };
    }) => {
      return createAccount(householdId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate accounts list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: accountKeys.list(variables.householdId),
      });
      // Also invalidate investment summary as account creation might affect totals
      queryClient.invalidateQueries({
        queryKey: investmentKeys.summary(variables.householdId),
      });
    },
  });
}

/**
 * Mutation to create a new transaction.
 * Invalidates accounts and transactions on success.
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      householdId,
      data,
    }: {
      householdId: string;
      data: {
        accountId: string;
        txnType: 'spend' | 'receive';
        amount: number;
        merchant: string;
        categoryId?: string;
        attributedUserId?: string | null;
      };
    }) => {
      return createTransaction(householdId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate transactions for the specific account
      queryClient.invalidateQueries({
        queryKey: accountKeys.transactions(variables.householdId, variables.data.accountId),
      });
      // Invalidate accounts list (balances change)
      queryClient.invalidateQueries({
        queryKey: accountKeys.list(variables.householdId),
      });
      // Invalidate investment summary (totals might change)
      queryClient.invalidateQueries({
        queryKey: investmentKeys.summary(variables.householdId),
      });
    },
  });
}

// ============================================================================
// Watchlist Hooks
// ============================================================================

/**
 * Fetches the user's watchlist.
 */
export function useWatchlist() {
  return useQuery<WatchlistItem[]>({
    queryKey: watchlistKeys.list(),
    queryFn: getWatchlist,
  });
}

/**
 * Mutation to add a portfolio to watchlist.
 */
export function useAddToWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (portfolioId: string) => addToWatchlist(portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  });
}

/**
 * Mutation to remove a portfolio from watchlist.
 */
export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (portfolioId: string) => removeFromWatchlist(portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  });
}

// ============================================================================
// Notification Hooks
// ============================================================================

/**
 * Fetches unread notification count.
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const result = await getUnreadCount();
      return result.count;
    },
  });
}
