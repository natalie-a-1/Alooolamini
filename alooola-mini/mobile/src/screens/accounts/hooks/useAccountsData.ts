/**
 * Manages accounts data: accounts list, selection, transactions, add account modal state.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import {
  createAccount,
  createTransaction,
  getAccounts,
  getTransactions,
  type Account,
  type Transaction,
  type Category,
  getCategories,
} from '@/services/spending';

export type AccountType = 'checking' | 'savings' | 'investment' | 'credit';

type AddAccountPayload = {
  name: string;
  type: AccountType;
  institution?: string;
  last4?: string;
  currentBalance?: number;
};

export function useAccountsData() {
  const { household } = useHousehold();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

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

  useEffect(() => {
    const loadCategories = async () => {
      if (!household?.id) {
        setCategories([]);
        return;
      }
      setIsLoadingCategories(true);
      try {
        const data = await getCategories(household.id);
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [household?.id]);

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

  const handleAddTransaction = useCallback(
    async (data: { txnType: 'spend' | 'receive'; amount: number; merchant: string; categoryId?: string }) => {
      if (!household?.id || !selectedAccount) return;
      setIsSubmittingTransaction(true);
      try {
        await createTransaction(household.id, {
          accountId: selectedAccount.id,
          txnType: data.txnType,
          amount: data.amount,
          merchant: data.merchant,
          categoryId: data.categoryId || undefined,
          attributedUserId: user?.id ?? null,
        });
        const refreshedAccounts = await getAccounts(household.id);
        setAccounts(refreshedAccounts);
        await loadTransactions();
        setShowAddTransactionModal(false);
      } catch (error) {
        console.error('Failed to create transaction:', error);
      } finally {
        setIsSubmittingTransaction(false);
      }
    },
    [household?.id, loadTransactions, selectedAccount, user?.id]
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
    showAddTransactionModal,
    setShowAddTransactionModal,
    isSubmittingTransaction,
    handleAddTransaction,
    categories,
    isLoadingCategories,
    handleViewableItemsChanged,
    viewabilityConfig: viewabilityConfig.current,
  };
}
