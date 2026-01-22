/**
 * EmptyAccountsState
 * ------------------
 * Component displayed when no user financial accounts exist.
 * Shows an empty state UI with prompt to add the first account.
 *
 * Props:
 *  - onPressAdd: Function triggered when user taps "Add Your First Account" button.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../AccountsScreen.styles';

/**
 * Props for EmptyAccountsState
 */
type EmptyAccountsStateProps = {
  /** Called when the user presses the add account button */
  onPressAdd: () => void;
};

/**
 * Renders the empty state for the accounts screen.
 * Provides a call-to-action to add a new financial account.
 */
export function EmptyAccountsState({ onPressAdd }: EmptyAccountsStateProps) {
  return (
    <View style={styles.emptyCard}>
      {/* Icon representing absence of accounts */}
      <View style={styles.emptyIcon}>
        <Icon name="creditCard" size={28} color={COLORS.subtleInk} />
      </View>

      {/* Title */}
      <Text style={styles.emptyTitle}>No Accounts Yet</Text>

      {/* Caption */}
      <Text style={styles.emptyText}>
        Add your first account to start tracking balances and transactions.
      </Text>

      {/* Add Account button */}
      <Pressable style={styles.emptyButton} onPress={onPressAdd} accessibilityLabel="Add your first account">
        <Text style={styles.emptyButtonText}>Add Your First Account</Text>
      </Pressable>
    </View>
  );
}
