/**
 * Discover screen listing mutual funds with detail view.
 */
import React from 'react';
import { Screen } from '@/components/Screen';
import { useDiscoverData } from './hooks/useDiscoverData';
import { DiscoverHeader } from './components/DiscoverHeader';
import { MutualFundList } from './components/MutualFundList';
import { MutualFundDetail } from './detail/MutualFundDetail';

export function DiscoverScreen() {
  const {
    isLoading,
    isDemoList,
    listNotice,
    errorMessage,
    mutualFunds,
    selectedFund,
    selectFund,
    demoPerformance,
    demoQuote,
  } = useDiscoverData();

  if (selectedFund) {
    return (
      <MutualFundDetail
        fund={selectedFund}
        onBack={() => selectFund(null)}
        forceDemo={isDemoList}
        demoPerformance={demoPerformance}
        demoQuote={demoQuote}
      />
    );
  }

  return (
    <Screen>
      <DiscoverHeader />
      <MutualFundList
        funds={mutualFunds}
        isLoading={isLoading}
        errorMessage={errorMessage}
        listNotice={listNotice}
        isDemoList={isDemoList}
        onSelect={selectFund}
      />
    </Screen>
  );
}
