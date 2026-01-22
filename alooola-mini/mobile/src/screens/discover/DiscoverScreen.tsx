/**
 * Discover screen and AI assistant flow.
 */
import React from 'react';
import { Screen } from '@/components/Screen';
import { useDiscoverData } from './hooks/useDiscoverData';
import { DiscoverHeader } from './components/DiscoverHeader';
import { AskAIButton } from './components/AskAIButton';
import { MutualFundList } from './components/MutualFundList';
import { AIChat } from './components/AIChat';
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
    showAIChat,
    openAIChat,
    closeAIChat,
    demoPerformance,
    demoQuote,
  } = useDiscoverData();

  if (showAIChat) {
    return <AIChat onClose={closeAIChat} />;
  }

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
      <AskAIButton onPress={openAIChat} />
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
