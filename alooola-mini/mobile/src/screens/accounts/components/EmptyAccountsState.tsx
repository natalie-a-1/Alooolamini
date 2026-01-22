/**
 * Empty state shown when no accounts exist.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../AccountsScreen.styles';

type EmptyAccountsStateProps = {
  onPressAdd: () => void;
};

export function EmptyAccountsState({ onPressAdd }: EmptyAccountsStateProps) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Icon name="creditCard" size={28} color={COLORS.subtleInk} />
      </View>
      <Text style={styles.emptyTitle}>No Accounts Yet</Text>
      <Text style={styles.emptyText}>Add your first account to start tracking balances and transactions.</Text>
      <Pressable style={styles.emptyButton} onPress={onPressAdd}>
        <Text style={styles.emptyButtonText}>Add Your First Account</Text>
      </Pressable>
    </View>
  );
}
