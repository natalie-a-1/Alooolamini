/**
 * AccountsHeader
 * --------------
 * Displays the accounts screen header including:
 *   - Section title ("Accounts")
 *   - Total combined balance of all accounts
 *   - Call-to-action (button) to add a new account
 *
 * Props:
 *   - totalBalance: number
 *       The sum of all account balances to display (in USD).
 *   - onPressAdd: () => void
 *       Callback triggered when the add button is pressed.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon } from '@/components/Icon';
import { formatCurrency } from '@/lib/format';
import { styles } from '../AccountsScreen.styles';

/**
 * Props for AccountsHeader component.
 */
type AccountsHeaderProps = {
  /** The total sum of all account balances (USD). */
  totalBalance: number;
  /** Callback for when the add-account button is pressed. */
  onPressAdd: () => void;
};

/**
 * Renders the header row for the accounts list,
 * including the title, total balance, and add-account button.
 */
export function AccountsHeader({ totalBalance, onPressAdd }: AccountsHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Header left: section title and total balance */}
      <View style={styles.headerLeft}>
        <Text style={styles.title}>Accounts</Text>
        <Text style={styles.totalBalance}>
          {formatCurrency(totalBalance)} total
        </Text>
      </View>
      {/* Add Account Button (CTA) */}
      <Pressable style={styles.addButton} onPress={onPressAdd}>
        <Icon name="plus" size={16} color="#fff" />
        <Text style={styles.addButtonText}>Add</Text>
      </Pressable>
    </View>
  );
}
