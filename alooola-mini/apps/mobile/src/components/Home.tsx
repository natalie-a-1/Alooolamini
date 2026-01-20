/**
 * Home screen with portfolio overview.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { Screen } from './Screen';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/layout';

// Demo data for when API isn't connected
const DEMO_DATA = {
  portfolioValue: 134420.5,
  gain: 2945.75,
  chartData: [50, 45, 55, 52, 60, 58, 65, 62, 70, 68, 75, 72, 80, 78, 85, 82, 88, 86, 90, 88, 92],
};

/** React Native component for Home. */
export function Home() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('1M');
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState(DEMO_DATA);

  const timeframes = ['1M', '3M', '6M', '1Y', 'ALL'];

  // For demo purposes, we use the hardcoded data
  // In production, this would fetch from the API
  useEffect(() => {
    // API integration would go here
    // For now, using demo data
    setPortfolioData(DEMO_DATA);
  }, [timeframe]);

  const { portfolioValue, gain, chartData } = portfolioData;

  const { minValue, range } = useMemo(() => {
    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);
    return { minValue, range: maxValue - minValue };
  }, [chartData]);

  const userName = user?.name?.split(' ')[0] || 'there';

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Invest</Text>
        <Pressable style={styles.iconButton}>
          <Icon name="bell" size={18} color={COLORS.ink} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ink} />
        </View>
      ) : (
        <>
          <View style={styles.balanceBlock}>
            <Text style={styles.balanceValue}>
              ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.balanceGainRow}>
              <View style={styles.gainIconCircle}>
                <Icon name="trendingUp" size={12} color={COLORS.success} />
              </View>
              <Text style={styles.gainText}>${gain.toFixed(2)} · all time</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.cardMeta}>${gain.toLocaleString()} · all time</Text>
                <Text style={styles.cardTitle}>Portfolio value</Text>
                <Text style={styles.cardValue}>
                  ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.cardHeaderRight}>
                <Text style={styles.axisLabel}>$150,000</Text>
                <Text style={[styles.axisLabel, styles.axisLabelSpacer]}>$100,000</Text>
                <Text style={[styles.axisLabel, styles.axisLabelSpacer]}>$50,000</Text>
              </View>
            </View>

            <View style={styles.chartArea}>
              <View style={styles.chartBars}>
                {chartData.map((value, index) => {
                  const heightPct = range === 0 ? 0 : ((value - minValue) / range) * 100;
                  return (
                    <View key={`${value}-${index}`} style={styles.chartBarWrapper}>
                      <View style={[styles.chartBar, { height: `${heightPct}%` }]} />
                    </View>
                  );
                })}
              </View>
              <View style={styles.chartMidline} />
            </View>
          </View>

          <View style={styles.timeframeRow}>
            {timeframes.map((tf) => (
              <Pressable
                key={tf}
                onPress={() => setTimeframe(tf)}
                style={[
                  styles.timeframeChip,
                  timeframe === tf ? styles.timeframeChipActive : styles.timeframeChipInactive,
                ]}
              >
                <Text style={timeframe === tf ? styles.timeframeTextActive : styles.timeframeTextInactive}>
                  {tf}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable>
            <Text style={styles.seeMore}>See More</Text>
          </Pressable>

          <View style={[styles.card, styles.insightCard]}>
            <View style={styles.insightRow}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiText}>AI</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.cardTitle}>Personalized Insight</Text>
                <Text style={styles.insightText}>
                  Hi {userName}! Based on your portfolio, consider diversifying into healthcare sector
                  investments for sector-aligned growth potential.
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: COLORS.ink,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  balanceBlock: {
    marginBottom: SPACING.lg,
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  balanceGainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gainIconCircle: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.pill,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gainText: {
    fontSize: 12,
    color: COLORS.mutedInk,
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
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.subtleInk,
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.ink,
  },
  axisLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  axisLabelSpacer: {
    marginTop: SPACING.xl,
  },
  chartArea: {
    height: 120,
    position: 'relative',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.ink,
  },
  chartMidline: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: COLORS.border,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  timeframeChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
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
  seeMore: {
    fontSize: 18,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.lg,
  },
  insightCard: {
    backgroundColor: COLORS.surface,
  },
  insightRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  aiBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
});
