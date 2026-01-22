/**
 * Accounts screen with account carousel, transactions, and add-account flow.
 */
import React, { useRef } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { COLORS } from '@/theme/colors';
import { AccountCard } from './components/AccountCard';
import { AccountsHeader } from './components/AccountsHeader';
import { AddAccountModal } from './components/AddAccountModal';
import { EmptyAccountsState } from './components/EmptyAccountsState';
import { PageIndicator } from './components/PageIndicator';
import { TransactionsSection } from './components/TransactionsSection';
import { AddTransactionModal } from './components/AddTransactionModal';
import { useAccountsData } from './hooks/useAccountsData';
import { styles } from './AccountsScreen.styles';

export function AccountsScreen() {
  const {
    isLoading,
    accounts,
    totalBalance,
    selectedIndex,
    setSelectedIndex,
    transactions,
    isLoadingTransactions,
    showAddModal,
    setShowAddModal,
    isSubmitting,
    handleAddAccount,
    showAddTransactionModal,
    setShowAddTransactionModal,
    isSubmittingTransaction,
    handleAddTransaction,
    categories,
    isLoadingCategories,
    handleViewableItemsChanged,
    viewabilityConfig,
  } = useAccountsData();

  const flatListRef = useRef<FlatList>(null);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ink} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AccountsHeader totalBalance={totalBalance} onPressAdd={() => setShowAddModal(true)} />

      {accounts.length > 0 ? (
        <>
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={accounts}
              renderItem={({ item }) => <AccountCard account={item} />}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onViewableItemsChanged={handleViewableItemsChanged.current}
              viewabilityConfig={viewabilityConfig}
            />
          </View>

          <PageIndicator count={accounts.length} activeIndex={selectedIndex} />

          <TransactionsSection
            isLoading={isLoadingTransactions}
            transactions={transactions}
            onPressAdd={() => setShowAddTransactionModal(true)}
          />
        </>
      ) : (
        <EmptyAccountsState onPressAdd={() => setShowAddModal(true)} />
      )}

      <AddAccountModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddAccount}
        isSubmitting={isSubmitting}
      />

      <AddTransactionModal
        visible={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        onSubmit={handleAddTransaction}
        isSubmitting={isSubmittingTransaction}
        categories={categories}
        isLoadingCategories={isLoadingCategories}
      />
    </Screen>
  );
}
