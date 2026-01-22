/**
 * Header showing total balance and add-account CTA.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { formatCurrency } from '@/lib/format';
import { styles } from '../AccountsScreen.styles';

type AccountsHeaderProps = {
  totalBalance: number;
  onPressAdd: () => void;
};

export function AccountsHeader({ totalBalance, onPressAdd }: AccountsHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.title}>Accounts</Text>
        <Text style={styles.totalBalance}>{formatCurrency(totalBalance)} total</Text>
      </View>
      <Pressable style={styles.addButton} onPress={onPressAdd}>
        <Icon name="plus" size={16} color="#fff" />
        <Text style={styles.addButtonText}>Add</Text>
      </Pressable>
    </View>
  );
}
