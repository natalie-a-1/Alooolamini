/**
 * Spending screen with budget tracking.
 */
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { COLORS } from '@/theme/colors';
import { styles } from './SpendingScreen.styles';
import { MOCK_CATEGORIES, MONTHLY_BUDGET, TIMEFRAMES, TOTAL_SPENT } from './SpendingScreen.mock';

export function SpendingScreen() {
  const [timeframe, setTimeframe] = useState('This Month');
  const percentUsed = (TOTAL_SPENT / MONTHLY_BUDGET) * 100;

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
          ${TOTAL_SPENT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={styles.progressBlock}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Budget Used</Text>
            <Text style={styles.progressLabel}>{percentUsed.toFixed(1)}% of ${MONTHLY_BUDGET.toLocaleString()}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(percentUsed, 100)}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.list}>
          {MOCK_CATEGORIES.map((category) => (
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
