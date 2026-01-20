/**
 * Spending screen translated to React Native.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { Screen } from './Screen';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/layout';

/** React Native component for Spending. */
export function Spending() {
  const [timeframe, setTimeframe] = useState('This Month');
  const timeframes = ['This Week', 'This Month', 'This Year'];

  const totalSpent = 4235.8;
  const monthlyBudget = 6000.0;
  const percentUsed = (totalSpent / monthlyBudget) * 100;

  const categories = [
    {
      id: 1,
      name: 'Medical Equipment',
      icon: 'stethoscope',
      amount: 1250.0,
      percent: 29.5,
      color: '#e2e8f0',
      textColor: '#475569',
    },
    {
      id: 2,
      name: 'Continuing Education',
      icon: 'book',
      amount: 890.0,
      percent: 21.0,
      color: '#e4e4e7',
      textColor: '#52525b',
    },
    {
      id: 3,
      name: 'Professional Dues',
      icon: 'briefcase',
      amount: 650.0,
      percent: 15.3,
      color: '#e7e5e4',
      textColor: '#57534e',
    },
    {
      id: 4,
      name: 'Dining',
      icon: 'utensils',
      amount: 485.5,
      percent: 11.5,
      color: '#f5f5f5',
      textColor: '#737373',
    },
    {
      id: 5,
      name: 'Transportation',
      icon: 'car',
      amount: 420.3,
      percent: 9.9,
      color: '#f3f4f6',
      textColor: '#6b7280',
    },
    {
      id: 6,
      name: 'Other',
      icon: 'package',
      amount: 540.0,
      percent: 12.8,
      color: '#f3f4f6',
      textColor: '#6b7280',
    },
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Spending</Text>
      </View>

      <View style={styles.timeframeRow}>
        {timeframes.map((tf) => (
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
          ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={styles.progressBlock}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Budget Used</Text>
            <Text style={styles.progressLabel}>{percentUsed.toFixed(1)}% of ${monthlyBudget.toLocaleString()}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(percentUsed, 100)}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.list}>
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Icon name={category.icon} size={18} color={category.textColor} />
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
      </View>

      <View style={[styles.card, styles.insightCard]}>
        <View style={styles.insightRow}>
          <View style={styles.insightIcon}>
            <Icon name="dollar" size={16} color={COLORS.surface} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.cardTitle}>Spending Insight</Text>
            <Text style={styles.insightText}>
              Your professional development spending is 21% of your budget. Great investment in your career growth!
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: COLORS.ink,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  timeframeChip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
  },
  timeframeChipActive: {
    backgroundColor: COLORS.ink,
  },
  timeframeChipInactive: {
    backgroundColor: COLORS.surface,
  },
  timeframeTextActive: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  timeframeTextInactive: {
    color: COLORS.mutedInk,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.pill,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.md,
  },
  progressBlock: {
    gap: SPACING.sm,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accentEmerald,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.lg,
  },
  list: {
    gap: SPACING.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  categoryBarTrack: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
  },
  categoryAmountBlock: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
  },
  categoryPercent: {
    fontSize: 10,
  },
  insightCard: {
    backgroundColor: '#f8fafc',
  },
  insightRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  insightText: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
});
