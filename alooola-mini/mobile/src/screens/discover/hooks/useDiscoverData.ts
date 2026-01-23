/**
 * Manages Discover screen data: curated portfolios for investment.
 * Uses TanStack Query for cached server state with automatic caching.
 */
import { useMemo, useState } from 'react';
import { useCuratedPortfolios } from '@/lib/useQueries';
import type { CuratedPortfolio } from '@/services/portfolios';

type UseDiscoverDataReturn = {
  isLoading: boolean;
  errorMessage: string | null;
  portfolios: CuratedPortfolio[];
  selectedPortfolio: CuratedPortfolio | null;
  selectPortfolio: (portfolio: CuratedPortfolio | null) => void;
};

export function useDiscoverData(): UseDiscoverDataReturn {
  const [selectedPortfolio, setSelectedPortfolio] = useState<CuratedPortfolio | null>(null);

  // Server state via TanStack Query - cached and shared across screens
  const { data: portfolios = [], isLoading, error } = useCuratedPortfolios();

  return useMemo(
    () => ({
      isLoading,
      errorMessage: error ? 'Failed to load portfolios' : null,
      portfolios,
      selectedPortfolio,
      selectPortfolio: setSelectedPortfolio,
    }),
    [error, isLoading, portfolios, selectedPortfolio]
  );
}
