/**
 * Renders the watchlist preview with up to three items and navigation actions.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { type WatchlistItem } from '@/services/watchlist';
import { styles } from '../HomeScreen.styles';

type WatchlistSectionProps = {
  items: WatchlistItem[];
  onPressItem: () => void;
  onPressViewAll: () => void;
};

export function WatchlistSection({ items, onPressItem, onPressViewAll }: WatchlistSectionProps) {
  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.watchlistSection}>
      <Text style={styles.sectionTitle}>Your Watchlist</Text>
      <View style={styles.watchlistList}>
        {items.slice(0, 3).map((item) => {
          const returnPct = item.portfolio.oneYearReturnPct
            ? `${Number(item.portfolio.oneYearReturnPct) >= 0 ? '+' : ''}${Number(item.portfolio.oneYearReturnPct).toFixed(1)}%`
            : 'N/A';
          const isPositive = Number(item.portfolio.oneYearReturnPct) >= 0;
          return (
            <Pressable key={item.id} style={styles.watchlistItem} onPress={onPressItem}>
              <View style={styles.watchlistItemLeft}>
                <Text style={styles.watchlistItemName} numberOfLines={1}>
                  {item.portfolio.name}
                </Text>
                <Text style={styles.watchlistItemRisk}>
                  {item.portfolio.riskTolerance.charAt(0).toUpperCase() + item.portfolio.riskTolerance.slice(1)}
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
      {items.length > 3 ? (
        <Pressable style={styles.watchlistViewAll} onPress={onPressViewAll}>
          <Text style={styles.watchlistViewAllText}>View all {items.length} items</Text>
          <Icon name="chevronRight" size={14} color={COLORS.mutedInk} />
        </Pressable>
      ) : null}
    </View>
  );
}
