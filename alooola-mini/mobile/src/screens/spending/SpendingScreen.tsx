/**
 * Spending screen with budget tracking.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useHousehold } from '@/hooks/useHousehold';
import { COLORS } from '@/theme/colors';
import { styles } from './SpendingScreen.styles';
import { TIMEFRAMES } from './SpendingScreen.mock';

interface SpendingData {
  totalSpent: number;
  monthlyBudget: number;
  categories: Array<{
    id: string;
    name: string;
    amount: number;
    percent: number;
    icon: string;
    color: string;
    textColor: string;
  }>;
}

export function SpendingScreen() {
  const { household } = useHousehold();
  const [timeframe, setTimeframe] = useState('This Month');
  const [isLoading, setIsLoading] = useState(true);
  const [spending, setSpending] = useState<SpendingData | null>(null);

  const loadSpending = useCallback(async () => {
    // In production, this would fetch from API
    // For now, show empty state for new users
    setIsLoading(false);
    setSpending(null);
  }, [household?.id, timeframe]);

  useEffect(() => {
    loadSpending();
  }, [loadSpending]);

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.header}>
          <Text style={styles.title}>Spending</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ink} />
        </View>
      </Screen>
    );
  }

  const hasSpending = spending && spending.totalSpent > 0;
  const percentUsed = spending ? (spending.totalSpent / spending.monthlyBudget) * 100 : 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Spending</Text>
      </View>

      <View style={styles.timeframeRow}>
        {TIMEFRAMES.map((tf) => (
          <Pressable
            key={tf}
            onPress={() => setTimeframe(tf)}
            style={[styles.timeframeChip, timeframe === tf ? styles.timeframeChipActive : styles.timeframeChipInactive]}
          >
            <Text style={timeframe === tf ? styles.timeframeTextActive : styles.timeframeTextInactive}>{tf}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconCircle}>
            <Icon name="trendingDown" size={12} color={COLORS.accentRose} />
          </View>
          <Text style={styles.cardLabel}>Total Spent</Text>
        </View>
        <Text style={styles.cardValue}>
          ${(spending?.totalSpent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={styles.progressBlock}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Budget Used</Text>
            <Text style={styles.progressLabel}>{percentUsed.toFixed(1)}% of ${(spending?.monthlyBudget ?? 5000).toLocaleString()}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(percentUsed, 100)}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {hasSpending ? (
          <View style={styles.list}>
            {spending.categories.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Icon name={category.icon as any} size={18} color={category.textColor} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View style={styles.categoryBarTrack}>
                    <View style={[styles.categoryBarFill, { backgroundColor: category.color, width: `${category.percent}%` }]} />
                  </View>
                </View>
                <View style={styles.categoryAmountBlock}>
                  <Text style={styles.categoryAmount}>
                    ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={[styles.categoryPercent, { color: category.textColor }]}>{category.percent.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Icon name="pieChart" size={24} color={COLORS.subtleInk} />
            </View>
            <Text style={styles.emptyTitle}>No Spending Data</Text>
            <Text style={styles.emptyText}>
              Link a bank account or card to automatically track your spending and see insights.
            </Text>
            <Pressable style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Connect Account</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
}
