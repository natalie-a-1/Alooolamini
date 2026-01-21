/**
 * Available balance screen.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useHousehold } from '@/hooks/useHousehold';
import { COLORS } from '@/theme/colors';
import { styles } from './AvailableScreen.styles';

interface BalanceData {
  availableBalance: number;
  totalRewards: number;
  rewardRate: number;
}

export function AvailableScreen() {
  const { household } = useHousehold();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<BalanceData | null>(null);

  const loadBalance = useCallback(async () => {
    // In production, this would fetch from API
    // For now, show empty state for new users
    setIsLoading(false);
    setBalance(null);
  }, [household?.id]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ink} />
        </View>
      </Screen>
    );
  }

  const hasBalance = balance && balance.availableBalance > 0;

  return (
    <Screen>
      <View style={styles.balanceBlock}>
        <Text style={styles.label}>Available</Text>
        <Text style={styles.balance}>
          ${(balance?.availableBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Total earned rewards</Text>
          <Icon name="gift" size={18} color={COLORS.subtleInk} />
        </View>
        <Text style={styles.cardValue}>
          ${(balance?.totalRewards ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={styles.cardMeta}>earning {balance?.rewardRate ?? 2}% in stock</Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={[styles.primaryButton, styles.button]}>
          <Text style={styles.primaryButtonText}>Add Funds</Text>
        </Pressable>
        <Pressable style={[styles.secondaryButton, styles.button]}>
          <Text style={styles.secondaryButtonText}>Move Funds</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>
        {hasBalance ? (
          <View style={styles.list}>
            {/* Activity list would be rendered here when data exists */}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Icon name="clock" size={24} color={COLORS.subtleInk} />
            </View>
            <Text style={styles.emptyTitle}>No Activity Yet</Text>
            <Text style={styles.emptyText}>
              Your transactions and rewards will appear here once you add funds and start using your account.
            </Text>
            <Pressable style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Add Your First Funds</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
}
