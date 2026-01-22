/**
 * TanStack Query client configuration.
 *
 * Provides a single QueryClient instance with stale-while-revalidate defaults
 * optimized for mobile navigation patterns:
 * - Data is considered fresh for 30 seconds (staleTime)
 * - Cached data persists for 5 minutes (gcTime)
 * - No automatic refetch on window focus (mobile tabs don't trigger this often)
 * - Retry failed requests once with exponential backoff
 */
import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance for the entire mobile app.
 * All screens share this cache for consistent server state.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Data stays "fresh" for 30 seconds. During this time, cached data is
       * returned immediately without background refetch.
       */
      staleTime: 30 * 1000,

      /**
       * Cached data is kept for 5 minutes after becoming unused.
       * Prevents excessive re-fetching when navigating between tabs.
       */
      gcTime: 5 * 60 * 1000,

      /**
       * Disable automatic refetch on window focus.
       * Mobile tab switches shouldn't trigger full data refreshes.
       */
      refetchOnWindowFocus: false,

      /**
       * Retry failed requests once with exponential backoff.
       */
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      /**
       * Retry mutations once on failure.
       */
      retry: 1,
    },
  },
});
