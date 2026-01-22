/**
 * Custom hook to manage accounts data for the Accounts screen.
 * Uses TanStack Query for server state with automatic cache invalidation on mutations.
 *
 * Handles loading accounts, account selection, transaction fetching, category fetching,
 * and state for add-account and add-transaction modals.
 */
import { useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import {
  useAccounts,
  useTransactions,
  useCategories,
  useCreateAccount,
  useCreateTransaction,
} from '@/lib/useQueries';

/**
 * The supported types of accounts.
 */
export type AccountType = 'checking' | 'savings' | 'investment' | 'credit';

/**
 * Shape of the payload needed to add a new account.
 */
type AddAccountPayload = {
  /** User-friendly name for this account */
  name: string;
  /** Account type, e.g. 'checking' */
  type: AccountType;
  /** Optional financial institution name */
  institution?: string;
  /** Last 4 digits of the account number, if applicable */
  last4?: string;
  /** Initial current balance for the new account */
  currentBalance?: number;
};

/**
 * Main accounts data management hook.
 * @returns Object containing account, transaction, modal, and handler state for the Accounts screen.
 */
export function useAccountsData() {
  const { household } = useHousehold();
  const { user } = useAuth();

  /** The selected account index in the carousel/list */
  const [selectedIndex, setSelectedIndex] = useState(0);

  /** Show/hide the modal for adding a new account */
  const [showAddModal, setShowAddModal] = useState(false);

  /** Show/hide the modal for adding a new transaction */
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  // Server state via TanStack Query - cached and shared across screens
  const { data: accounts = [], isLoading } = useAccounts(household?.id);
  const selectedAccount = accounts[selectedIndex];

  const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions(
    household?.id,
    selectedAccount?.id
  );

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories(household?.id);

  // Mutations with automatic cache invalidation
  const createAccountMutation = useCreateAccount();
  const createTransactionMutation = useCreateTransaction();

  /**
   * FlatList viewability configuration for account carousel.
   * Used to determine which account is "selected" (currently in view).
   */
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });

  /**
   * The total balance across all household accounts.
   */
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance?.currentBalance ?? 0), 0);

  /**
   * Listener for carousel item view changes.
   * Updates the selected account index based on which card is in view.
   */
  const handleViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{ index: number | null }>;
    }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setSelectedIndex(viewableItems[0].index);
      }
    }
  );

  /**
   * Handler to add a new account.
   * Uses mutation which automatically invalidates accounts cache.
   *
   * @param data - Account fields from add-account modal/form
   * @returns Index of new account if successful, else `null`
   */
  const handleAddAccount = async (data: AddAccountPayload) => {
    if (!household?.id) return null;

    try {
      await createAccountMutation.mutateAsync({
        householdId: household.id,
        data,
      });
      // After mutation completes and cache is invalidated, set index to last account
      const newIndex = Math.max(accounts.length, 0);
      setSelectedIndex(newIndex);
      setShowAddModal(false);
      return newIndex;
    } catch (error) {
      console.error('Failed to create account:', error);
      return null;
    }
  };

  /**
   * Handler to add a new transaction to the current account.
   * Uses mutation which automatically invalidates accounts and transactions cache.
   *
   * @param data - Transaction payload data
   */
  const handleAddTransaction = async (data: {
    txnType: 'spend' | 'receive';
    amount: number;
    merchant: string;
    categoryId?: string;
  }) => {
    if (!household?.id || !selectedAccount) return;

    try {
      await createTransactionMutation.mutateAsync({
        householdId: household.id,
        data: {
          accountId: selectedAccount.id,
          txnType: data.txnType,
          amount: data.amount,
          merchant: data.merchant,
          categoryId: data.categoryId || undefined,
          attributedUserId: user?.id ?? null,
        },
      });
      setShowAddTransactionModal(false);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  // Return all state, data, and handlers required by components using this hook
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
    isSubmitting: createAccountMutation.isPending,
    handleAddAccount,
    showAddTransactionModal,
    setShowAddTransactionModal,
    isSubmittingTransaction: createTransactionMutation.isPending,
    handleAddTransaction,
    categories,
    isLoadingCategories,
    handleViewableItemsChanged,
    viewabilityConfig: viewabilityConfig.current,
  };
}
