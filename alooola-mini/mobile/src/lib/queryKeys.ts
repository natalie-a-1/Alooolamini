/**
 * Centralized query keys for TanStack Query.
 *
 * All query keys are defined here to ensure consistency across the app
 * and enable targeted cache invalidation after mutations.
 *
 * Key structure follows the pattern: [feature, ...params]
 */

/**
 * Query keys for investment/portfolio data.
 */
export const investmentKeys = {
  /** Base key for all investment queries */
  all: ['investments'] as const,

  /** Investment summary for a specific household */
  summary: (householdId: string) => [...investmentKeys.all, 'summary', householdId] as const,
};

/**
 * Query keys for account data (spending/banking).
 */
export const accountKeys = {
  /** Base key for all account queries */
  all: ['accounts'] as const,

  /** All accounts for a specific household */
  list: (householdId: string) => [...accountKeys.all, 'list', householdId] as const,

  /** Transactions for a specific account */
  transactions: (householdId: string, accountId: string) =>
    [...accountKeys.all, 'transactions', householdId, accountId] as const,

  /** Categories for a household */
  categories: (householdId: string) => [...accountKeys.all, 'categories', householdId] as const,
};

/**
 * Query keys for watchlist data.
 */
export const watchlistKeys = {
  /** Base key for all watchlist queries */
  all: ['watchlist'] as const,

  /** Full watchlist for the current user */
  list: () => [...watchlistKeys.all, 'list'] as const,

  /** Check if a specific portfolio is in watchlist */
  item: (portfolioId: string) => [...watchlistKeys.all, 'item', portfolioId] as const,
};

/**
 * Query keys for notification data.
 */
export const notificationKeys = {
  /** Base key for all notification queries */
  all: ['notifications'] as const,

  /** Unread notification count */
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};
