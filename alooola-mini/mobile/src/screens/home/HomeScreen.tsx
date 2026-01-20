/**
 * Home screen with portfolio overview.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/theme/colors';
import { styles } from './HomeScreen.styles';
import { DEMO_DATA, TIMEFRAMES } from './HomeScreen.mock';

export function HomeScreen() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('1M');
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState(DEMO_DATA);

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
            {TIMEFRAMES.map((tf) => (
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
