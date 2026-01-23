/**
 * Manages Home screen data: portfolio summary, chart state, notifications, watchlist, and holdings.
 * Uses TanStack Query for cached server state with stale-while-revalidate pattern.
 */
import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { getTimeframeDays } from '@/lib/format';
import { useInvestmentSummary, useWatchlist, useUnreadNotificationCount, usePortfolioPositions } from '@/lib/useQueries';
import { TIMEFRAMES } from '../HomeScreen.mock';

type Timeframe = (typeof TIMEFRAMES)[number];

type TimeframeGain = { amount: number; percent: number };

export function useHomeData() {
  const { user } = useAuth();
  const { household } = useHousehold();

  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Server state via TanStack Query - cached and shared across screens
  const { data: portfolio, isLoading } = useInvestmentSummary(household?.id);
  const { data: watchlistItems = [] } = useWatchlist();
  const { data: positions = [], isLoading: isLoadingPositions } = usePortfolioPositions(household?.id);
  const { data: unreadNotifications = 0, refetch: refetchNotifications } = useUnreadNotificationCount();

  // Reset bar selection when timeframe changes
  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    setSelectedBarIndex(null);
  };

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
      case '1D':
        return 'today';
      case '1M':
        return 'past month';
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

  const handleNotificationsChange = () => {
    refetchNotifications();
  };

  return {
    isLoading,
    timeframe,
    setTimeframe: handleTimeframeChange,
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
    positions,
    isLoadingPositions,
  };
}
