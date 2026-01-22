/**
 * Transaction list section with loading and empty states.
 */
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { type Transaction } from '@/services/spending';
import { styles } from '../AccountsScreen.styles';
import { TransactionRow } from './TransactionRow';

type TransactionsSectionProps = {
  isLoading: boolean;
  transactions: Transaction[];
};

export function TransactionsSection({ isLoading, transactions }: TransactionsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Transactions</Text>
      {isLoading ? (
        <ActivityIndicator color={COLORS.ink} />
      ) : transactions.length > 0 ? (
        <View style={styles.transactionList}>
          {transactions.map((txn) => (
            <TransactionRow key={txn.id} transaction={txn} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Icon name="dollar" size={24} color={COLORS.subtleInk} />
          </View>
          <Text style={styles.emptyTitle}>No Transactions</Text>
          <Text style={styles.emptyText}>Transactions for this account will appear here.</Text>
        </View>
      )}
    </View>
  );
}
