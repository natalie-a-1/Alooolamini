/**
 * Accounts screen with account carousel, transactions, and add-account flow.
 */
import React, { useEffect, useRef } from 'react';
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
import { styles, SNAP_INTERVAL } from './AccountsScreen.styles';

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
    newlyCreatedAccountId,
    setNewlyCreatedAccountId,
  } = useAccountsData();

  const flatListRef = useRef<FlatList>(null);

  // Scroll to newly created account when it appears in the accounts list
  useEffect(() => {
    if (newlyCreatedAccountId && accounts.length > 0 && flatListRef.current) {
      const newAccountIndex = accounts.findIndex((acc) => acc.id === newlyCreatedAccountId);
      
      if (newAccountIndex !== -1) {
        // Use setTimeout to ensure FlatList has finished rendering
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({
              index: newAccountIndex,
              animated: true,
              viewPosition: 0.5, // Center the item
            });
            
            // Set it as selected
            setSelectedIndex(newAccountIndex);
          } catch (error) {
            // Fallback: scroll to offset if scrollToIndex fails
            const offset = newAccountIndex * SNAP_INTERVAL;
            flatListRef.current?.scrollToOffset({
              offset,
              animated: true,
            });
            setSelectedIndex(newAccountIndex);
          }
          
          // Clear the tracking ID
          setNewlyCreatedAccountId(null);
        }, 100);
      }
    }
  }, [accounts, newlyCreatedAccountId, setSelectedIndex, setNewlyCreatedAccountId]);

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
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center"
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              getItemLayout={(_, index) => ({
                length: SNAP_INTERVAL,
                offset: SNAP_INTERVAL * index,
                index,
              })}
              onViewableItemsChanged={handleViewableItemsChanged.current}
              viewabilityConfig={viewabilityConfig}
              onScrollToIndexFailed={(info) => {
                // Fallback: scroll to offset if index is out of bounds
                const wait = new Promise((resolve) => setTimeout(resolve, 500));
                wait.then(() => {
                  if (flatListRef.current && info.index < accounts.length) {
                    const offset = info.index * SNAP_INTERVAL;
                    flatListRef.current.scrollToOffset({ offset, animated: true });
                    setSelectedIndex(info.index);
                  }
                });
              }}
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
