/**
 * Home screen that composes data-driven components for portfolio, insights, and watchlist.
 */
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { MainTabScreenProps } from '@/navigation/types';
import { NotificationsModal } from '@/components/NotificationsModal';
import { Screen } from '@/components/Screen';
import { COLORS } from '@/theme/colors';
import { BalanceSummary } from './components/BalanceSummary';
import { HomeHeader } from './components/HomeHeader';
import { PerformanceChart } from './components/PerformanceChart';
import { TimeframeSelector } from './components/TimeframeSelector';
import { WatchlistSection } from './components/WatchlistSection';
import { useHomeData } from './hooks/useHomeData';
import { styles } from './HomeScreen.styles';

export function HomeScreen() {
  const navigation = useNavigation<MainTabScreenProps<'Home'>['navigation']>();
  const {
    isLoading,
    timeframe,
    setTimeframe,
    chartData,
    minValue,
    valueRange,
    selectedBarIndex,
    setSelectedBarIndex,
    timeframeGain,
    timeframeLabel,
    totalValue,
    insightMessage,
    unreadNotifications,
    showNotifications,
    setShowNotifications,
    handleNotificationsChange,
    watchlistItems,
  } = useHomeData();

  return (
    <Screen>
      <HomeHeader unreadCount={unreadNotifications} onPressNotifications={() => setShowNotifications(true)} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ink} />
        </View>
      ) : (
        <>
          <BalanceSummary totalValue={totalValue} timeframeGain={timeframeGain} timeframeLabel={timeframeLabel} />
          <PerformanceChart
            chartData={chartData}
            minValue={minValue}
            valueRange={valueRange}
            selectedBarIndex={selectedBarIndex}
            onSelectBar={setSelectedBarIndex}
          />
          <TimeframeSelector timeframe={timeframe} onSelect={setTimeframe} />
          <WatchlistSection
            items={watchlistItems}
            onPressItem={() => navigation.navigate('Discover')}
            onPressViewAll={() => navigation.navigate('Discover')}
          />
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
