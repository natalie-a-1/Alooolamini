/**
 * Spending screen with budget tracking.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useHousehold } from '@/hooks/useHousehold';
import { getSpendingSummary } from '@/services/spending';
import { COLORS } from '@/theme/colors';
import { styles } from './SpendingScreen.styles';
import { TIMEFRAMES } from './SpendingScreen.mock';

// Category icon and color mapping
type IconName = 'shoppingCart' | 'utensils' | 'car' | 'film' | 'shoppingBag' | 'heart' | 'zap' | 'moreHorizontal' | 'helpCircle' | 'pieChart' | 'stethoscope' | 'briefcase' | 'graduationCap' | 'building';

const CATEGORY_STYLES: Record<string, { icon: IconName; color: string; textColor: string }> = {
  'Groceries': { icon: 'shoppingCart', color: '#E8F5E9', textColor: '#2E7D32' },
  'Dining': { icon: 'utensils', color: '#FFF3E0', textColor: '#E65100' },
  'Transportation': { icon: 'car', color: '#E3F2FD', textColor: '#1565C0' },
  'Entertainment': { icon: 'film', color: '#F3E5F5', textColor: '#7B1FA2' },
  'Shopping': { icon: 'shoppingBag', color: '#FCE4EC', textColor: '#C2185B' },
  'Healthcare': { icon: 'heart', color: '#FFEBEE', textColor: '#C62828' },
  'Medical Equipment': { icon: 'stethoscope', color: '#E3F2FD', textColor: '#1565C0' },
  'Utilities': { icon: 'zap', color: '#FFFDE7', textColor: '#F9A825' },
  'Professional Dues': { icon: 'briefcase', color: '#E1F5FE', textColor: '#0277BD' },
  'Continuing Education': { icon: 'graduationCap', color: '#F3E5F5', textColor: '#7B1FA2' },
  'Other': { icon: 'moreHorizontal', color: '#ECEFF1', textColor: '#546E7A' },
  'Uncategorized': { icon: 'helpCircle', color: '#F5F5F5', textColor: '#757575' },
};

function getCategoryStyle(name: string) {
  const normalizedName = name.trim();
  // Try exact match first
  if (CATEGORY_STYLES[normalizedName]) {
    return CATEGORY_STYLES[normalizedName];
  }
  // Try case-insensitive match
  const lowerName = normalizedName.toLowerCase();
  const matchedKey = Object.keys(CATEGORY_STYLES).find(
    key => key.toLowerCase() === lowerName
  );
  if (matchedKey) {
    return CATEGORY_STYLES[matchedKey];
  }
  // Fallback to Other
  return CATEGORY_STYLES['Other'];
}

interface SpendingData {
  totalSpent: number;
  monthlyBudget: number;
  categories: Array<{
    id: string;
    name: string;
    amount: number;
    percent: number;
    icon: IconName;
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
    if (!household?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getSpendingSummary(household.id, timeframe);
      
      // Transform API response to include UI styling
      const transformedData: SpendingData = {
        totalSpent: data.totalSpent,
        monthlyBudget: data.budget,
        categories: data.categories.map((cat) => {
          const style = getCategoryStyle(cat.name);
          return {
            id: cat.id,
            name: cat.name,
            amount: cat.amount,
            percent: cat.percent,
            icon: style.icon,
            color: style.color,
            textColor: style.textColor,
          };
        }),
      };
      
      setSpending(transformedData);
    } catch (err) {
      console.error('Failed to load spending:', err);
      setSpending(null);
    } finally {
      setIsLoading(false);
    }
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
            {spending.categories.map((category) => {
              // Ensure icon name is valid
              const iconName: IconName = category.icon || 'moreHorizontal';
              return (
                <View key={category.id} style={styles.categoryCard}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Icon name={iconName} size={18} color={category.textColor} />
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
              );
            })}
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
