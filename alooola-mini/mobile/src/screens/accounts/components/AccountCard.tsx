/**
 * Card component for displaying an individual account summary.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { type Account } from '@/services/spending';
import { formatCurrency } from '@/lib/format';
import { styles, ACCOUNT_COLORS } from '../AccountsScreen.styles';
import { ACCOUNT_TYPE_ICONS } from '../helpers/accountTypes';

type AccountCardProps = {
  account: Account;
};

export function AccountCard({ account }: AccountCardProps) {
  const accentColor = ACCOUNT_COLORS[account.type] || COLORS.accentBlue;
  const balance = account.balance?.currentBalance ?? 0;

  return (
    <View style={styles.accountCard}>
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{account.name}</Text>
          <View style={[styles.cardTypeIcon, { backgroundColor: `${accentColor}15` }]}>
            <Icon name={ACCOUNT_TYPE_ICONS[account.type]} size={16} color={accentColor} />
          </View>
        </View>

        <View style={styles.cardBalanceContainer}>
          <Text style={styles.cardBalanceLabel}>Current Balance</Text>
          <Text style={styles.cardBalance}>{formatCurrency(balance)}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardInstitution}>{account.institution || 'No institution'}</Text>
          {account.last4 ? <Text style={styles.cardLast4}>•••• {account.last4}</Text> : null}
        </View>
      </View>
    </View>
  );
}
