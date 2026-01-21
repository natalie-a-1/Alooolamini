/**
 * Home screen with portfolio overview.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { NotificationsModal } from '@/components/NotificationsModal';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { getUnreadCount } from '@/services/notifications';
import { getPortfolioSummary, type PortfolioSummary } from '@/services/portfolios';
import { COLORS } from '@/theme/colors';
import { styles } from './HomeScreen.styles';
import { TIMEFRAMES } from './HomeScreen.mock';

export function HomeScreen() {
  const { user } = useAuth();
  const { household } = useHousehold();
  const [timeframe, setTimeframe] = useState('1M');
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const loadPortfolio = useCallback(async () => {
    if (!household?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getPortfolioSummary(household.id);
      setPortfolio(data);
    } catch (err) {
      // No portfolio data is expected for new users
      setPortfolio(null);
    } finally {
      setIsLoading(false);
    }
  }, [household?.id]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  // Load unread notification count
  const loadUnreadCount = useCallback(async () => {
    try {
      const { count } = await getUnreadCount();
      setUnreadNotifications(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const handleNotificationsChange = useCallback(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const chartData = useMemo(() => {
    if (!portfolio?.snapshots?.length) return [];
    return portfolio.snapshots.map(s => s.totalValue);
  }, [portfolio]);

  const { minValue, range } = useMemo(() => {
    if (!chartData.length) return { minValue: 0, range: 0 };
    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);
    return { minValue, range: maxValue - minValue };
  }, [chartData]);

  const userName = user?.name?.split(' ')[0] || 'there';
  const hasPortfolio = portfolio && portfolio.totalValue > 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Invest</Text>
        <Pressable style={styles.iconButton} onPress={() => setShowNotifications(true)}>
          <Icon name="bell" size={18} color={COLORS.ink} />
          {unreadNotifications > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ink} />
        </View>
      ) : hasPortfolio ? (
        <>
          <View style={styles.balanceBlock}>
            <Text style={styles.balanceValue}>
              ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.balanceGainRow}>
              <View style={styles.gainIconCircle}>
                <Icon 
                  name={portfolio.gainAmount >= 0 ? 'trendingUp' : 'trendingDown'} 
                  size={12} 
                  color={portfolio.gainAmount >= 0 ? COLORS.success : COLORS.danger} 
                />
              </View>
              <Text style={[styles.gainText, portfolio.gainAmount < 0 && styles.gainTextNegative]}>
                ${Math.abs(portfolio.gainAmount).toFixed(2)} · all time
              </Text>
            </View>
          </View>

          {chartData.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.cardMeta}>${portfolio.gainAmount.toLocaleString()} · all time</Text>
                  <Text style={styles.cardTitle}>Portfolio value</Text>
                  <Text style={styles.cardValue}>
                    ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              <View style={styles.chartArea}>
                <View style={styles.chartBars}>
                  {chartData.map((value, index) => {
                    const heightPct = range === 0 ? 50 : ((value - minValue) / range) * 100;
                    return (
                      <View key={`${value}-${index}`} style={styles.chartBarWrapper}>
                        <View style={[styles.chartBar, { height: `${Math.max(heightPct, 5)}%` }]} />
                      </View>
                    );
                  })}
                </View>
                <View style={styles.chartMidline} />
              </View>
            </View>
          )}

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
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Icon name="trendingUp" size={32} color={COLORS.accentPurple} />
          </View>
          <Text style={styles.emptyTitle}>Start Investing</Text>
          <Text style={styles.emptyText}>
            Hi {userName}! You haven't made your first investment yet. Let's get started building your wealth.
          </Text>
          
          <View style={styles.ctaList}>
            <Pressable style={styles.ctaButton}>
              <View style={styles.ctaIcon}>
                <Icon name="pieChart" size={16} color={COLORS.accentPurple} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Explore Portfolios</Text>
                <Text style={styles.ctaText}>Browse AI-curated investment options</Text>
              </View>
              <Icon name="chevronRight" size={16} color={COLORS.subtleInk} />
            </Pressable>

            <Pressable style={styles.ctaButton}>
              <View style={styles.ctaIcon}>
                <Icon name="dollarSign" size={16} color={COLORS.accentGreen} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Fund Your Account</Text>
                <Text style={styles.ctaText}>Add funds to start investing</Text>
              </View>
              <Icon name="chevronRight" size={16} color={COLORS.subtleInk} />
            </Pressable>

            <Pressable style={styles.ctaButton}>
              <View style={styles.ctaIcon}>
                <Icon name="messageCircle" size={16} color={COLORS.accentBlue} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Talk to an Advisor</Text>
                <Text style={styles.ctaText}>Get personalized guidance</Text>
              </View>
              <Icon name="chevronRight" size={16} color={COLORS.subtleInk} />
            </Pressable>
          </View>
        </View>
      )}

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationsChange={handleNotificationsChange}
      />
    </Screen>
  );
}
