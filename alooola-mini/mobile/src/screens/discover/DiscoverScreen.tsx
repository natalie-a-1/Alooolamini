/**
 * Discover screen listing curated portfolios for investment.
 */
import React from 'react';
import { Screen } from '@/components/Screen';
import { useDiscoverData } from './hooks/useDiscoverData';
import { DiscoverHeader } from './components/DiscoverHeader';
import { PortfolioList } from './components/PortfolioList';
import { PortfolioDetail } from './detail/PortfolioDetail';

export function DiscoverScreen() {
  const {
    isLoading,
    errorMessage,
    portfolios,
    selectedPortfolio,
    selectPortfolio,
  } = useDiscoverData();

  if (selectedPortfolio) {
    return (
      <PortfolioDetail
        portfolio={selectedPortfolio}
        onBack={() => selectPortfolio(null)}
      />
    );
  }

  return (
    <Screen>
      <DiscoverHeader />
      <PortfolioList
        portfolios={portfolios}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSelect={selectPortfolio}
      />
    </Screen>
  );
}
