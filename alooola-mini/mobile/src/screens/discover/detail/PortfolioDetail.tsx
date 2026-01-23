/**
 * Portfolio detail screen with buy and watchlist actions.
 * Shows performance chart, statistics, and holdings breakdown.
 */
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { useHousehold } from '@/hooks/useHousehold';
import {
  useAccounts,
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useBuyPortfolio,
} from '@/lib/useQueries';
import { type CuratedPortfolio } from '@/services/portfolios';
import { ApiClientError } from '@/services/api';
import { styles } from '../DiscoverScreen.styles';
import { BuyModal } from '../components/BuyModal';
import { FundPerformanceChart } from '../components/FundPerformanceChart';

/**
 * Generate simulated performance points based on 1-year return percentage.
 * Creates a realistic-looking chart with some variation.
 */
function generatePerformancePoints(oneYearReturnPct: number | null): { date: string; close: number }[] {
  const basePrice = 100; // Start from $100 for simulation
  const points: { date: string; close: number }[] = [];
  
  const yearlyReturn = oneYearReturnPct ?? 8; // Default to 8% if no data
  const monthlyReturn = yearlyReturn / 12;
  
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Calculate price with some realistic variation
    const monthsFromStart = 11 - i;
    const baseGrowth = basePrice * (1 + (monthlyReturn / 100) * monthsFromStart);
    // Add some random-ish variation (deterministic based on month)
    const variation = Math.sin(monthsFromStart * 0.8) * 2 + Math.cos(monthsFromStart * 1.2) * 1.5;
    const close = baseGrowth + variation;
    
    points.push({
      date: date.toISOString().split('T')[0],
      close: Math.max(close, basePrice * 0.9), // Don't go below 90% of base
    });
  }
  
  return points;
}

type PortfolioDetailProps = {
  portfolio: CuratedPortfolio;
  onBack: () => void;
};

export function PortfolioDetail({ portfolio, onBack }: PortfolioDetailProps) {
  const { household } = useHousehold();
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Data hooks
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts(household?.id);
  const { data: watchlistItems = [] } = useWatchlist();

  // Mutation hooks
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const buyPortfolio = useBuyPortfolio();

  // Check if portfolio is in watchlist
  const isInWatchlist = useMemo(
    () => watchlistItems.some((item) => item.portfolioId === portfolio.id),
    [watchlistItems, portfolio.id]
  );

  const handleWatchlistToggle = async () => {
    try {
      if (isInWatchlist) {
        await removeFromWatchlist.mutateAsync(portfolio.id);
      } else {
        await addToWatchlist.mutateAsync(portfolio.id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update watchlist');
    }
  };

  const handleBuy = async (data: { amount: number; accountId: string }) => {
    if (!household?.id) {
      Alert.alert('Error', 'No household selected');
      return;
    }

    try {
      await buyPortfolio.mutateAsync({
        householdId: household.id,
        portfolioId: portfolio.id,
        amountInvested: data.amount,
        fundingAccountId: data.accountId,
      });
      setShowBuyModal(false);
      Alert.alert('Success', `Successfully invested $${data.amount.toFixed(2)} in ${portfolio.name}`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        Alert.alert('Purchase Failed', error.message);
      } else {
        Alert.alert('Error', 'Failed to complete purchase');
      }
    }
  };

  const returnPct = portfolio.oneYearReturnPct
    ? `${Number(portfolio.oneYearReturnPct) >= 0 ? '+' : ''}${Number(portfolio.oneYearReturnPct).toFixed(1)}%`
    : 'N/A';
  const isPositive = Number(portfolio.oneYearReturnPct ?? 0) >= 0;

  // Generate simulated performance chart data
  const performancePoints = useMemo(
    () => generatePerformancePoints(portfolio.oneYearReturnPct ? Number(portfolio.oneYearReturnPct) : null),
    [portfolio.oneYearReturnPct]
  );

  // Calculate simulated price range
  const priceValues = performancePoints.map((p) => p.close);
  const rangeLow = Math.min(...priceValues);
  const rangeHigh = Math.max(...priceValues);
  const currentPrice = priceValues[priceValues.length - 1];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <View style={styles.backIcon}>
              <Icon name="chevronRight" size={20} color={COLORS.ink} />
            </View>
          </Pressable>
          <View style={styles.detailHeaderText}>
            <Text style={styles.detailTitle}>{portfolio.name}</Text>
            <Text style={styles.detailSubtitle}>
              {portfolio.riskTolerance.charAt(0).toUpperCase() + portfolio.riskTolerance.slice(1)} Risk Portfolio
            </Text>
          </View>
        </View>

        {/* Overview Stats */}
        <View style={styles.detailCard}>
          <Text style={styles.detailSectionTitle}>Overview</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Value</Text>
            <Text style={styles.detailValue}>${currentPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>1Y Return</Text>
            <Text style={isPositive ? styles.detailValuePositive : styles.detailValueNegative}>
              {returnPct}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>52w Range</Text>
            <Text style={styles.detailValue}>
              ${rangeLow.toFixed(2)} - ${rangeHigh.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Performance Chart */}
        <FundPerformanceChart points={performancePoints} currency="USD" />

        {/* Description */}
        {portfolio.description && (
          <View style={styles.detailCard}>
            <Text style={styles.detailSectionTitle}>About</Text>
            <Text style={styles.detailLabel}>{portfolio.description}</Text>
          </View>
        )}

        {/* Holdings */}
        {portfolio.holdings && portfolio.holdings.length > 0 && (
          <View style={styles.detailCard}>
            <Text style={styles.detailSectionTitle}>Holdings ({portfolio.holdings.length})</Text>
            {portfolio.holdings.map((holding) => (
              <View key={holding.id} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{holding.symbol}</Text>
                <Text style={styles.detailValue}>{Number(holding.weightPct).toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Risk Information */}
        <View style={styles.detailCard}>
          <Text style={styles.detailSectionTitle}>Risk Profile</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Risk Level</Text>
            <Text style={styles.detailValue}>
              {portfolio.riskTolerance.charAt(0).toUpperCase() + portfolio.riskTolerance.slice(1)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Asset Count</Text>
            <Text style={styles.detailValue}>{portfolio.holdings?.length ?? 0} holdings</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.detailActions}>
          <Pressable
            style={[styles.detailActionButton, styles.detailActionSecondary]}
            onPress={handleWatchlistToggle}
            disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
          >
            <Icon
              name="heart"
              size={14}
              color={isInWatchlist ? COLORS.danger : COLORS.ink}
            />
            <Text style={styles.detailActionSecondaryText}>
              {isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.detailActionButton, styles.detailActionPrimary]}
            onPress={() => setShowBuyModal(true)}
          >
            <Text style={styles.detailActionPrimaryText}>Buy</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Buy Modal */}
      <BuyModal
        visible={showBuyModal}
        portfolio={portfolio}
        accounts={accounts}
        isLoadingAccounts={isLoadingAccounts}
        onClose={() => setShowBuyModal(false)}
        onSubmit={handleBuy}
        isSubmitting={buyPortfolio.isPending}
      />
    </Screen>
  );
}
