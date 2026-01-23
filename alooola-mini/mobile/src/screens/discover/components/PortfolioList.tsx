/**
 * List of curated portfolios for discovery.
 */
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { COLORS } from '@/theme/colors';
import { type CuratedPortfolio } from '@/services/portfolios';
import { styles } from '../DiscoverScreen.styles';

type PortfolioListProps = {
  portfolios: CuratedPortfolio[];
  isLoading: boolean;
  errorMessage: string | null;
  onSelect: (portfolio: CuratedPortfolio) => void;
};

const RISK_COLORS: Record<string, string> = {
  conservative: COLORS.accentBlue,
  moderate: COLORS.accentPurple,
  aggressive: COLORS.accentEmerald,
};

export function PortfolioList({
  portfolios,
  isLoading,
  errorMessage,
  onSelect,
}: PortfolioListProps) {
  if (isLoading) {
    return (
      <View style={styles.section}>
        <ActivityIndicator color={COLORS.ink} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.section}>
        <Text style={styles.emptyStateText}>{errorMessage}</Text>
      </View>
    );
  }

  if (portfolios.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.emptyStateText}>No portfolios available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Investment Portfolios</Text>
      <View style={styles.list}>
        {portfolios.map((portfolio) => {
          const riskColor = RISK_COLORS[portfolio.riskTolerance] ?? COLORS.ink;
          const returnPct = portfolio.oneYearReturnPct
            ? `${Number(portfolio.oneYearReturnPct) >= 0 ? '+' : ''}${Number(portfolio.oneYearReturnPct).toFixed(1)}%`
            : 'N/A';
          const isPositive = Number(portfolio.oneYearReturnPct ?? 0) >= 0;

          return (
            <Pressable
              key={portfolio.id}
              style={[styles.opportunityCard, { borderLeftColor: riskColor }]}
              onPress={() => onSelect(portfolio)}
            >
              <View style={styles.minimalCardHeader}>
                <View style={styles.fundTitleBlock}>
                  <Text style={styles.opportunityTitle}>{portfolio.name}</Text>
                  <Text style={styles.minimalSubline}>
                    {portfolio.riskTolerance.charAt(0).toUpperCase() +
                      portfolio.riskTolerance.slice(1)}{' '}
                    • {portfolio.holdings?.length ?? 0} holdings
                  </Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.detailValue,
                      isPositive ? styles.detailValuePositive : styles.detailValueNegative,
                    ]}
                  >
                    {returnPct}
                  </Text>
                  <Text style={styles.minimalSubline}>1Y Return</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
