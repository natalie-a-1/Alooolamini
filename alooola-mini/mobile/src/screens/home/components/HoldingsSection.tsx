/**
 * Renders the user's portfolio holdings (investments they've purchased).
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { formatCurrency } from '@/lib/format';
import { type PortfolioPosition } from '@/services/portfolios';
import { styles } from '../HomeScreen.styles';

type HoldingsSectionProps = {
  positions: PortfolioPosition[];
  onPressItem: () => void;
  onPressViewAll: () => void;
};

export function HoldingsSection({ positions, onPressItem, onPressViewAll }: HoldingsSectionProps) {
  if (!positions.length) {
    return null;
  }

  return (
    <View style={styles.watchlistSection}>
      <Text style={styles.sectionTitle}>Your Holdings</Text>
      <View style={styles.watchlistList}>
        {positions.slice(0, 3).map((position) => {
          const returnPct = position.portfolio.oneYearReturnPct
            ? `${Number(position.portfolio.oneYearReturnPct) >= 0 ? '+' : ''}${Number(position.portfolio.oneYearReturnPct).toFixed(1)}%`
            : 'N/A';
          const isPositive = Number(position.portfolio.oneYearReturnPct ?? 0) >= 0;
          return (
            <Pressable key={position.id} style={styles.watchlistItem} onPress={onPressItem}>
              <View style={styles.watchlistItemLeft}>
                <Text style={styles.watchlistItemName} numberOfLines={1}>
                  {position.portfolio.name}
                </Text>
                <Text style={styles.watchlistItemRisk}>
                  {formatCurrency(Number(position.amountInvested))} invested
                </Text>
              </View>
              <View style={styles.watchlistItemRight}>
                <Text style={[styles.watchlistItemReturn, isPositive ? styles.returnPositive : styles.returnNegative]}>
                  {returnPct}
                </Text>
                <Text style={styles.watchlistItemLabel}>1Y</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {positions.length > 3 ? (
        <Pressable style={styles.watchlistViewAll} onPress={onPressViewAll}>
          <Text style={styles.watchlistViewAllText}>View all {positions.length} holdings</Text>
          <Icon name="chevronRight" size={14} color={COLORS.mutedInk} />
        </Pressable>
      ) : null}
    </View>
  );
}
