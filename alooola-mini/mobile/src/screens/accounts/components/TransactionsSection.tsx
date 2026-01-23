/**
 * TransactionsSection
 * -------------------
 * Displays a section listing a set of transactions for an account.
 * Handles three states:
 *   - Loading: shows a loading spinner while data is fetching.
 *   - Populated: renders a list of transactions with summary rows.
 *   - Empty: displays helpful messaging when there are no transactions.
 *
 * Props:
 *  - isLoading: boolean
 *      Whether the transaction data is currently loading.
 *  - transactions: Transaction[]
 *      Array of transactions for the given account.
 *  - onPressAdd: () => void
 *      Handler invoked when the "Add" button is pressed.
 */

import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { type Transaction } from '@/services/spending';
import { styles } from '../AccountsScreen.styles';
import { TransactionRow } from './TransactionRow';

/** Props for TransactionsSection */
type TransactionsSectionProps = {
  /** Whether the transactions are currently loading */
  isLoading: boolean;
  /** Array of transactions for the account */
  transactions: Transaction[];
  /** Handler for pressing the "Add" button */
  onPressAdd: () => void;
};

/**
 * Renders a transaction list section with header, loading, populated, and empty states.
 * @param isLoading   Whether data is loading
 * @param transactions  The array of transactions to display
 * @param onPressAdd    Called when the Add button is pressed
 */
export function TransactionsSection({
  isLoading,
  transactions,
  onPressAdd,
}: TransactionsSectionProps) {
  /**
   * Renders the loading spinner.
   */
  const renderLoading = () => (
    <ActivityIndicator color={COLORS.ink} />
  );

  /**
   * Renders the populated transaction list.
   */
  const renderTransactionList = () => (
    <View style={styles.transactionList}>
      {transactions.map((txn) => (
        <TransactionRow key={txn.id} transaction={txn} />
      ))}
    </View>
  );

  /**
   * Renders the empty state when there are no transactions.
   */
  const renderEmptyState = () => (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Icon name="dollar" size={24} color={COLORS.subtleInk} />
      </View>
      <Text style={styles.emptyTitle}>No Transactions</Text>
      <Text style={styles.emptyText}>
        Transactions for this account will appear here.
      </Text>
    </View>
  );

  return (
    <View style={styles.section}>
      {/* Section header with title and Add button */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        <Pressable
          style={styles.addButton}
          onPress={onPressAdd}
          accessibilityLabel="Add transaction"
        >
          <Icon name="plus" size={14} color={COLORS.surface} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {/* Determine which state to render */}
      {isLoading
        ? renderLoading()
        : (transactions.length > 0
          ? renderTransactionList()
          : renderEmptyState())
      }
    </View>
  );
}
