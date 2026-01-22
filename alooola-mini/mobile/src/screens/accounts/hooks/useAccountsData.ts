/**
 * Manages accounts data: accounts list, selection, transactions, add account modal state.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHousehold } from '@/hooks/useHousehold';
import { createAccount, getAccounts, getTransactions, type Account, type Transaction } from '@/services/spending';

export type AccountType = 'checking' | 'savings' | 'investment' | 'credit';

type AddAccountPayload = {
  name: string;
  type: AccountType;
  institution?: string;
  last4?: string;
};

export function useAccountsData() {
  const { household } = useHousehold();

  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });

  const selectedAccount = accounts[selectedIndex];

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance?.currentBalance ?? 0), 0);

  const loadAccounts = useCallback(async () => {
    if (!household?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getAccounts(household.id);
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [household?.id]);

  const loadTransactions = useCallback(async () => {
    if (!household?.id || !selectedAccount) {
      setTransactions([]);
      return;
    }

    setIsLoadingTransactions(true);
    try {
      const result = await getTransactions(household.id, {
        accountId: selectedAccount.id,
        limit: 10,
      });
      setTransactions(result.items);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [household?.id, selectedAccount?.id]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setSelectedIndex(viewableItems[0].index);
      }
    }
  );

  const handleAddAccount = useCallback(
    async (data: AddAccountPayload) => {
      if (!household?.id) return null;

      setIsSubmitting(true);
      try {
        await createAccount(household.id, data);
        const refreshed = await getAccounts(household.id);
        setAccounts(refreshed);
        const newIndex = Math.max(refreshed.length - 1, 0);
        setSelectedIndex(newIndex);
        setShowAddModal(false);
        return newIndex;
      } catch (error) {
        console.error('Failed to create account:', error);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [household?.id]
  );

  return {
    isLoading,
    accounts,
    totalBalance,
    selectedIndex,
    setSelectedIndex,
    selectedAccount,
    transactions,
    isLoadingTransactions,
    showAddModal,
    setShowAddModal,
    isSubmitting,
    handleAddAccount,
    handleViewableItemsChanged,
    viewabilityConfig: viewabilityConfig.current,
  };
}
