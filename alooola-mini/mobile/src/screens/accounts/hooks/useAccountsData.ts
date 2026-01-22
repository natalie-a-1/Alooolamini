/**
 * Custom hook to manage accounts data for the Accounts screen.
 * Handles loading accounts, account selection, transaction fetching, category fetching,
 * and state for add-account and add-transaction modals.
 *
 * Returned values and methods cover all the logic for the main Accounts view.
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
  const { household } = useHousehold(); // Household context (selected household)
  const { user } = useAuth();           // User context

  /** Whether accounts are loading */
  const [isLoading, setIsLoading] = useState(true);

  /** List of accounts in the household */
  const [accounts, setAccounts] = useState<Account[]>([]);

  /** The selected account index in the carousel/list */
  const [selectedIndex, setSelectedIndex] = useState(0);

  /** Transactions for the selected account */
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  /** Whether transactions are loading */
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  /** Show/hide the modal for adding a new account */
  const [showAddModal, setShowAddModal] = useState(false);

  /** Whether a new account is being submitted/created */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Show/hide the modal for adding a new transaction */
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  /** Whether a new transaction is being submitted/created */
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);

  /** List of all household categories for transaction categorization */
  const [categories, setCategories] = useState<Category[]>([]);

  /** Whether categories are loading */
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  /**
   * FlatList viewability configuration for account carousel.
   * Used to determine which account is "selected" (currently in view).
   */
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });

  /** The currently selected (active) account object, or undefined */
  const selectedAccount = accounts[selectedIndex];

  /**
   * The total balance across all household accounts.
   */
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance?.currentBalance ?? 0), 0);

  /**
   * Fetch accounts for the selected household; clear and stop loading if household is absent.
   * Updates `accounts` state and handles error display.
   */
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

  /**
   * Fetch transactions for the currently selected account in the household.
   * Limits to 10 recent transactions. Clears on error or if preconditions aren't met.
   */
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

  /**
   * Load accounts on household change.
   */
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  /**
   * Load transactions any time selection or account list changes.
   */
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  /**
   * Load all transaction categories for the household.
   * Handles errors and loading state.
   */
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
   * Reloads accounts and sets selected index to new account.
   * Shows/hides modal, handles loading state and returns new index or null on error.
   *
   * @param data - Account fields from add-account modal/form
   * @returns Index of new account if successful, else `null`
   */
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

  /**
   * Handler to add a new transaction to the current account.
   * On success, reloads account balances and recent transactions, and closes modal.
   *
   * @param data - Transaction payload data
   */
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

  // Return all state, data, and handlers required by components using this hook
  return {
    isLoading,                       // true if account data is loading
    accounts,                        // list of all household accounts
    totalBalance,                    // sum of all account balances
    selectedIndex,                   // index of selected account
    setSelectedIndex,                // setter for account selection
    selectedAccount,                 // currently selected account
    transactions,                    // transactions for selected account
    isLoadingTransactions,           // true if transactions are loading
    showAddModal,                    // show/hide add account modal
    setShowAddModal,                 // setter for modal
    isSubmitting,                    // true if submitting new account
    handleAddAccount,                // function to create new account
    showAddTransactionModal,         // show/hide add transaction modal
    setShowAddTransactionModal,      // setter for add transaction modal
    isSubmittingTransaction,         // true if submitting new transaction
    handleAddTransaction,            // handler to add a transaction
    categories,                      // category list for transactions
    isLoadingCategories,             // true if category list is loading
    handleViewableItemsChanged,      // handler for carousel view events
    viewabilityConfig: viewabilityConfig.current, // viewability config for FlatList
  };
}
