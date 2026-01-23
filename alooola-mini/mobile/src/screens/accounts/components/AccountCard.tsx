/**
 * AccountCard
 * -----------
 * UI card component to present a summary of a single financial account.
 *
 * Props:
 *   - account: Account
 *       The account object to display (name, type, balance, institution, last4).
 *
 * Visuals:
 *   - Accent color and icon derive from the account type.
 *   - Shows account name, type icon, current balance, institution, and last 4 digits.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { type Account } from '@/services/spending';
import { formatCurrency } from '@/lib/format';
import { styles, ACCOUNT_COLORS } from '../AccountsScreen.styles';
import { ACCOUNT_TYPE_ICONS } from '../helpers/accountTypes';

/**
 * Props for the AccountCard component.
 */
type AccountCardProps = {
  /** The account data to render */
  account: Account;
};

/**
 * Renders a card view for a single account,
 * shows name, type, current balance, and institution info.
 */
export function AccountCard({ account }: AccountCardProps) {
  // Pick accent color based on type; fallback to blue.
  const accentColor = ACCOUNT_COLORS[account.type] || COLORS.accentBlue;
  // Default balance is 0 if missing.
  const balance = account.balance?.currentBalance ?? 0;

  return (
    <View style={styles.accountCard}>
      {/* Vertical color accent */}
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />

      <View style={styles.cardContent}>
        {/* Header: Name and type icon */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{account.name}</Text>
          <View
            style={[
              styles.cardTypeIcon,
              { backgroundColor: `${accentColor}15` } // translucent icon bg
            ]}
          >
            <Icon
              name={ACCOUNT_TYPE_ICONS[account.type]}
              size={16}
              color={accentColor}
            />
          </View>
        </View>

        {/* Current balance */}
        <View style={styles.cardBalanceContainer}>
          <Text style={styles.cardBalanceLabel}>Current Balance</Text>
          <Text style={styles.cardBalance}>{formatCurrency(balance)}</Text>
        </View>

        {/* Footer: Institution and last 4 digits (if any) */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardInstitution}>
            {account.institution || 'No institution'}
          </Text>
          {account.last4 && (
            <Text style={styles.cardLast4}>•••• {account.last4}</Text>
          )}
        </View>
      </View>
    </View>
  );
}
