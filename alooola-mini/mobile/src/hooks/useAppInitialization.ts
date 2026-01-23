/**
 * App initialization hook that prefetches all critical data before showing the main app.
 *
 * This ensures a seamless user experience where all screens are ready to render
 * immediately without individual loading states visible on first navigation.
 *
 * Critical data includes:
 * - Investment summary (Home screen hero section)
 * - Accounts list (Accounts screen)
 * - Portfolio positions (Home holdings section)
 * - Curated portfolios (Discover screen)
 * - Watchlist (Home watchlist section)
 */
import { useQueries } from '@tanstack/react-query';
import { investmentKeys, accountKeys, portfolioKeys, watchlistKeys } from '@/lib/queryKeys';
import { getInvestmentSummary } from '@/services/investments';
import { getAccounts, getCategories } from '@/services/spending';
import { getCuratedPortfolios, getPortfolioPositions } from '@/services/portfolios';
import { getWatchlist } from '@/services/watchlist';

type UseAppInitializationParams = {
  householdId: string | undefined;
  enabled: boolean;
};

type UseAppInitializationReturn = {
  /** Whether all critical data is still loading */
  isInitializing: boolean;
  /** Whether initialization completed successfully (at least core data loaded) */
  isReady: boolean;
  /** Error message if critical data failed to load */
  error: string | null;
  /** Progress as a value between 0 and 1 */
  progress: number;
};

/**
 * Prefetches all critical app data in parallel before showing the main UI.
 *
 * @param params.householdId - The user's household ID
 * @param params.enabled - Whether to start fetching (should be true after auth)
 * @returns Loading state and readiness indicator
 */
export function useAppInitialization({
  householdId,
  enabled,
}: UseAppInitializationParams): UseAppInitializationReturn {
  // Define all critical queries that must complete before showing the app
  const queries = useQueries({
    queries: [
      {
        queryKey: investmentKeys.summary(householdId ?? ''),
        queryFn: async () => {
          if (!householdId) return null;
          return getInvestmentSummary(householdId, 'ALL');
        },
        enabled: enabled && !!householdId,
        staleTime: 0, // Always fetch fresh on init
      },
      {
        queryKey: accountKeys.list(householdId ?? ''),
        queryFn: async () => {
          if (!householdId) return [];
          return getAccounts(householdId);
        },
        enabled: enabled && !!householdId,
      },
      {
        queryKey: investmentKeys.positions(householdId ?? ''),
        queryFn: async () => {
          if (!householdId) return [];
          return getPortfolioPositions(householdId);
        },
        enabled: enabled && !!householdId,
      },
      {
        queryKey: portfolioKeys.list(),
        queryFn: getCuratedPortfolios,
        enabled: enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      {
        queryKey: watchlistKeys.list(),
        queryFn: getWatchlist,
        enabled: enabled,
      },
      {
        queryKey: accountKeys.categories(householdId ?? ''),
        queryFn: async () => {
          if (!householdId) return [];
          return getCategories(householdId);
        },
        enabled: enabled && !!householdId,
      },
    ],
  });

  // Calculate loading state
  const loadedCount = queries.filter((q) => q.isSuccess || q.isError).length;
  const totalCount = queries.length;
  const progress = totalCount > 0 ? loadedCount / totalCount : 0;

  // Check if any critical query is still loading
  const isInitializing = queries.some((q) => q.isLoading);

  // Check for critical failures (investment summary or accounts)
  // These are required for the app to function
  const criticalQueries = queries.slice(0, 2); // investment summary, accounts
  const hasCriticalError = criticalQueries.some((q) => q.isError);

  // App is ready when all queries finished loading (success or error)
  // and no critical errors occurred
  const isReady = !isInitializing && !hasCriticalError;

  // Get error message if there's a critical failure
  let error: string | null = null;
  if (hasCriticalError) {
    const failedQuery = criticalQueries.find((q) => q.isError);
    error = failedQuery?.error instanceof Error
      ? failedQuery.error.message
      : 'Failed to load account data. Please try again.';
  }

  return {
    isInitializing,
    isReady,
    error,
    progress,
  };
}
