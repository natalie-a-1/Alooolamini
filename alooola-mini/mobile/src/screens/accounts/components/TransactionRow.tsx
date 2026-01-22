/**
 * TransactionRow
 * --------------
 * Renders a concise row displaying a single transaction's summary.
 * Shows the merchant, attributed user, transaction date, and formatted amount.
 *
 * Props:
 *  - transaction: Transaction
 *      The transaction object containing all row data.
 *
 * Usage:
 *  <TransactionRow transaction={txn} />
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { formatCurrency, formatDate } from '@/lib/format';
import { type Transaction } from '@/services/spending';
import { styles } from '../AccountsScreen.styles';

/**
 * Props for TransactionRow component.
 */
type TransactionRowProps = {
  /** The transaction object to display */
  transaction: Transaction;
};

/**
 * Displays an individual transaction's merchant, user, date, and formatted amount.
 * Amounts are colored/styled based on credit/debit.
 */
export function TransactionRow({ transaction }: TransactionRowProps) {
  // Determine if the transaction is a debit (spend) or credit
  const isDebit = transaction.txnType === 'spend';

  // Format amount: negative for debits, positive for credits
  const adjustedAmount = isDebit ? -transaction.amount : transaction.amount;

  // Fallback user name if missing
  const userName = transaction.attributedUser?.name ?? 'Unknown';

  // Format the transaction date
  const formattedDate = formatDate(transaction.txnDate);

  return (
    <View style={styles.transactionCard} accessibilityRole="button" accessibilityLabel={`Transaction: ${transaction.merchant} ${formatCurrency(adjustedAmount)}`}>
      {/* Transaction Icon */}
      <View style={styles.transactionIcon}>
        <Icon name="dollar" size={18} color={COLORS.mutedInk} />
      </View>
      {/* Transaction Info: Merchant and metadata */}
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionMerchant} numberOfLines={1} ellipsizeMode="tail">
          {transaction.merchant}
        </Text>
        <Text style={styles.transactionMeta} numberOfLines={1} ellipsizeMode="tail">
          {userName} · {formattedDate}
        </Text>
      </View>
      {/* Transaction Amount */}
      <View style={styles.transactionAmountContainer}>
        <Text
          style={[
            styles.transactionAmount,
            isDebit ? styles.amountDebit : styles.amountCredit,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {formatCurrency(adjustedAmount)}
        </Text>
      </View>
    </View>
  );
}
