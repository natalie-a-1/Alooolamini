/**
 * Home screen with portfolio overview.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { MainTabScreenProps } from '@/navigation/types';
import { Icon } from '@/components/Icon';
import { NotificationsModal } from '@/components/NotificationsModal';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { getUnreadCount } from '@/services/notifications';
import { getPortfolioSummary, type PortfolioSummary } from '@/services/portfolios';
import { getWatchlist, type WatchlistItem } from '@/services/watchlist';
import { COLORS } from '@/theme/colors';
import { styles } from './HomeScreen.styles';
import { TIMEFRAMES } from './HomeScreen.mock';

const PLACEHOLDER_BARS = Array.from({ length: 12 }, (_, index) => index);

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Get the number of days for each timeframe
function getTimeframeDays(tf: string): number {
  switch (tf) {
    case '1M': return 30;
    case '3M': return 90;
    case '6M': return 180;
    case '1Y': return 365;
    case 'ALL': return Infinity;
    default: return 30;
  }
}

export function HomeScreen() {
  const navigation = useNavigation<MainTabScreenProps<'Home'>['navigation']>();
  const { user } = useAuth();
  const { household } = useHousehold();
  const [timeframe, setTimeframe] = useState('1M');
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  
  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Watchlist state
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);

  // Initial load - only on mount and household change
  const loadPortfolio = useCallback(async () => {
    if (!household?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all data once, filter client-side
      const data = await getPortfolioSummary(household.id, 'ALL');
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

  // Reset selection when timeframe changes
  useEffect(() => {
    setSelectedBarIndex(null);
  }, [timeframe]);

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

  // Load watchlist items
  const loadWatchlist = useCallback(async () => {
    try {
      const items = await getWatchlist();
      setWatchlistItems(items);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    }
  }, []);

  // Reload watchlist when screen comes into focus (e.g., after adding from Discover)
  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, [loadWatchlist])
  );

  const handleNotificationsChange = useCallback(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  // Filter snapshots based on selected timeframe
  const chartData = useMemo(() => {
    if (!portfolio?.snapshots?.length) return [];
    
    const days = getTimeframeDays(timeframe);
    if (days === Infinity) {
      return portfolio.snapshots;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return portfolio.snapshots.filter(s => new Date(s.asOf) >= cutoffDate);
  }, [portfolio, timeframe]);

  const chartValues = useMemo(() => {
    return chartData.map(s => s.totalValue);
  }, [chartData]);

  const { minValue, valueRange } = useMemo(() => {
    if (!chartValues.length) return { minValue: 0, valueRange: 0 };
    const maxValue = Math.max(...chartValues);
    const minValue = Math.min(...chartValues);
    return { minValue, valueRange: maxValue - minValue };
  }, [chartValues]);

  // Get selected snapshot data for tooltip
  const selectedSnapshot = selectedBarIndex !== null ? chartData[selectedBarIndex] : null;

  // Calculate gain for the current timeframe view
  const timeframeGain = useMemo(() => {
    if (chartData.length < 2) return { amount: 0, percent: 0 };
    const firstValue = chartData[0].totalValue;
    const lastValue = chartData[chartData.length - 1].totalValue;
    const amount = lastValue - firstValue;
    const percent = firstValue > 0 ? (amount / firstValue) * 100 : 0;
    return { amount, percent };
  }, [chartData]);

  // Get label for timeframe
  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case '1M': return 'past month';
      case '3M': return 'past 3 months';
      case '6M': return 'past 6 months';
      case '1Y': return 'past year';
      case 'ALL': return 'all time';
      default: return 'all time';
    }
  }, [timeframe]);

  const userName = user?.name?.split(' ')[0] || 'there';
  const totalValue = portfolio?.totalValue ?? 0;
  const hasPortfolio = totalValue > 0;
  const insightMessage = hasPortfolio
    ? `Hi ${userName}! Based on your portfolio, consider diversifying into healthcare sector investments for sector-aligned growth potential.`
    : `Hi ${userName}! Once you start investing, we'll share personalized insights right here.`;

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
      ) : (
        <>
          <View style={styles.balanceBlock}>
            <Text style={styles.balanceValue}>
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.balanceGainRow}>
              <View style={[styles.gainIconCircle, timeframeGain.amount < 0 && styles.gainIconCircleNegative]}>
                <Icon 
                  name={timeframeGain.amount >= 0 ? 'trendingUp' : 'trendingDown'} 
                  size={12} 
                  color={timeframeGain.amount >= 0 ? COLORS.success : COLORS.danger} 
                />
              </View>
              <Text style={[styles.gainText, timeframeGain.amount < 0 && styles.gainTextNegative]}>
                {timeframeGain.amount >= 0 ? '+' : '-'}${Math.abs(timeframeGain.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({timeframeGain.percent >= 0 ? '+' : ''}{timeframeGain.percent.toFixed(2)}%) · {timeframeLabel}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            {chartData.length > 0 ? (
              <>
                {/* Tooltip for selected bar */}
                {selectedSnapshot && (
                  <View style={styles.chartTooltip}>
                    <Text style={styles.chartTooltipValue}>
                      {formatCurrency(selectedSnapshot.totalValue)}
                    </Text>
                    <Text style={styles.chartTooltipDate}>
                      {formatShortDate(selectedSnapshot.asOf)}
                    </Text>
                  </View>
                )}
                
                <View style={styles.chartArea}>
                  <View style={styles.chartBars}>
                    {chartData.map((snapshot, index) => {
                      const heightPct = valueRange === 0 ? 50 : ((snapshot.totalValue - minValue) / valueRange) * 100;
                      const isSelected = selectedBarIndex === index;
                      return (
                        <Pressable
                          key={`${snapshot.asOf}-${index}`}
                          style={styles.chartBarWrapper}
                          onPress={() => setSelectedBarIndex(isSelected ? null : index)}
                        >
                          <View
                            style={[
                              styles.chartBar,
                              { height: `${Math.max(heightPct, 5)}%` },
                              isSelected && styles.chartBarSelected,
                            ]}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                
                {/* Date range labels */}
                <View style={styles.chartDateLabels}>
                  <Text style={styles.chartDateLabel}>
                    {formatShortDate(chartData[0].asOf)}
                  </Text>
                  <Text style={styles.chartDateLabel}>
                    {formatShortDate(chartData[chartData.length - 1].asOf)}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.chartArea}>
                  <View style={styles.chartBars}>
                    {PLACEHOLDER_BARS.map((index) => (
                      <View key={`placeholder-${index}`} style={styles.chartBarWrapper}>
                        <View style={[styles.chartBar, styles.chartBarPlaceholder]} />
                      </View>
                    ))}
                  </View>
                </View>
                <Text style={styles.emptyChartText}>No performance data yet.</Text>
              </>
            )}
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

          <View style={[styles.card, styles.insightCard]}>
            <View style={styles.insightRow}>
              <View style={styles.aiBadge}>
                <Text style={styles.aiText}>AI</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.cardTitle}>Personalized Insight</Text>
                <Text style={styles.insightText}>
                  {insightMessage}
                </Text>
              </View>
            </View>
          </View>

          {/* Watchlist Section */}
          {watchlistItems.length > 0 && (
            <View style={styles.watchlistSection}>
              <Text style={styles.sectionTitle}>Your Watchlist</Text>
              <View style={styles.watchlistList}>
                {watchlistItems.slice(0, 3).map((item) => {
                  const returnPct = item.portfolio.oneYearReturnPct 
                    ? `${Number(item.portfolio.oneYearReturnPct) >= 0 ? '+' : ''}${Number(item.portfolio.oneYearReturnPct).toFixed(1)}%`
                    : 'N/A';
                  return (
                    <Pressable 
                      key={item.id} 
                      style={styles.watchlistItem}
                      onPress={() => navigation.navigate('Discover')}
                    >
                      <View style={styles.watchlistItemLeft}>
                        <Text style={styles.watchlistItemName} numberOfLines={1}>
                          {item.portfolio.name}
                        </Text>
                        <Text style={styles.watchlistItemRisk}>
                          {item.portfolio.riskTolerance.charAt(0).toUpperCase() + item.portfolio.riskTolerance.slice(1)}
                        </Text>
                      </View>
                      <View style={styles.watchlistItemRight}>
                        <Text style={[
                          styles.watchlistItemReturn,
                          Number(item.portfolio.oneYearReturnPct) >= 0 ? styles.returnPositive : styles.returnNegative
                        ]}>
                          {returnPct}
                        </Text>
                        <Text style={styles.watchlistItemLabel}>1Y</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              {watchlistItems.length > 3 && (
                <Pressable 
                  style={styles.watchlistViewAll}
                  onPress={() => navigation.navigate('Discover')}
                >
                  <Text style={styles.watchlistViewAllText}>
                    View all {watchlistItems.length} items
                  </Text>
                  <Icon name="chevronRight" size={14} color={COLORS.mutedInk} />
                </Pressable>
              )}
            </View>
          )}
        </>
      )}

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationsChange={handleNotificationsChange}
      />
    </Screen>
  );
}
