/**
 * Manages Home screen data: portfolio summary, chart state, notifications, and watchlist.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { getUnreadCount } from '@/services/notifications';
import { getPortfolioSummary, type PortfolioSummary } from '@/services/portfolios';
import { getWatchlist, type WatchlistItem } from '@/services/watchlist';
import { getTimeframeDays } from '@/lib/format';
import { TIMEFRAMES } from '../HomeScreen.mock';

type Timeframe = (typeof TIMEFRAMES)[number];

type TimeframeGain = { amount: number; percent: number };

export function useHomeData() {
  const { user } = useAuth();
  const { household } = useHousehold();

  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);

  const loadPortfolio = useCallback(async () => {
    if (!household?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getPortfolioSummary(household.id, 'ALL');
      setPortfolio(data);
    } catch (err) {
      setPortfolio(null);
    } finally {
      setIsLoading(false);
    }
  }, [household?.id]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  useEffect(() => {
    setSelectedBarIndex(null);
  }, [timeframe]);

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

  const loadWatchlist = useCallback(async () => {
    try {
      const items = await getWatchlist();
      setWatchlistItems(items);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, [loadWatchlist])
  );

  const handleNotificationsChange = useCallback(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const chartData = useMemo(() => {
    if (!portfolio?.snapshots?.length) return [];

    const days = getTimeframeDays(timeframe);
    if (days === Infinity) {
      return portfolio.snapshots;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return portfolio.snapshots.filter((snapshot) => new Date(snapshot.asOf) >= cutoffDate);
  }, [portfolio, timeframe]);

  const chartValues = useMemo(() => chartData.map((snapshot) => snapshot.totalValue), [chartData]);

  const { minValue, valueRange } = useMemo(() => {
    if (!chartValues.length) return { minValue: 0, valueRange: 0 };
    const maxValue = Math.max(...chartValues);
    const minValue = Math.min(...chartValues);
    return { minValue, valueRange: maxValue - minValue };
  }, [chartValues]);

  const selectedSnapshot = selectedBarIndex !== null ? chartData[selectedBarIndex] : null;

  const timeframeGain: TimeframeGain = useMemo(() => {
    if (chartData.length < 2) return { amount: 0, percent: 0 };
    const firstValue = chartData[0].totalValue;
    const lastValue = chartData[chartData.length - 1].totalValue;
    const amount = lastValue - firstValue;
    const percent = firstValue > 0 ? (amount / firstValue) * 100 : 0;
    return { amount, percent };
  }, [chartData]);

  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case '1M':
        return 'past month';
      case '3M':
        return 'past 3 months';
      case '6M':
        return 'past 6 months';
      case '1Y':
        return 'past year';
      case 'ALL':
      default:
        return 'all time';
    }
  }, [timeframe]);

  const userName = user?.name?.split(' ')[0] || 'there';
  const totalValue = portfolio?.totalValue ?? 0;
  const hasPortfolio = totalValue > 0;
  const insightMessage = hasPortfolio
    ? `Hi ${userName}! Based on your portfolio, consider diversifying into healthcare sector investments for sector-aligned growth potential.`
    : `Hi ${userName}! Once you start investing, we'll share personalized insights right here.`;

  return {
    isLoading,
    timeframe,
    setTimeframe,
    portfolio,
    chartData,
    minValue,
    valueRange,
    selectedBarIndex,
    setSelectedBarIndex,
    selectedSnapshot,
    timeframeGain,
    timeframeLabel,
    totalValue,
    insightMessage,
    unreadNotifications,
    showNotifications,
    setShowNotifications,
    handleNotificationsChange,
    watchlistItems,
  };
}
