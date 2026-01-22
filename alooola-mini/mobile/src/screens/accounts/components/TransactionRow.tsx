/**
 * Renders a single transaction row with merchant, user, date, and amount.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { formatCurrency, formatDate } from '@/lib/format';
import { type Transaction } from '@/services/spending';
import { styles } from '../AccountsScreen.styles';

type TransactionRowProps = {
  transaction: Transaction;
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isDebit = transaction.txnType === 'spend';
  const amount = isDebit ? -transaction.amount : transaction.amount;
  const userName = transaction.attributedUser?.name || 'Unknown';
  const date = formatDate(transaction.txnDate);

  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Icon name="dollar" size={18} color={COLORS.mutedInk} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
        <Text style={styles.transactionMeta}>
          {userName} · {date}
        </Text>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text style={[styles.transactionAmount, isDebit ? styles.amountDebit : styles.amountCredit]}>
          {formatCurrency(amount)}
        </Text>
      </View>
    </View>
  );
}
