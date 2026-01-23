/**
 * Action buttons for a mutual fund detail view.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../DiscoverScreen.styles';

type FundActionsProps = {
  onAddToWatchlist: () => void;
  onBuy: () => void;
};

export function FundActions({ onAddToWatchlist, onBuy }: FundActionsProps) {
  return (
    <View style={styles.detailActions}>
      <Pressable style={[styles.detailActionButton, styles.detailActionSecondary]} onPress={onAddToWatchlist}>
        <Icon name="heart" size={14} color={COLORS.ink} />
        <Text style={styles.detailActionSecondaryText}>Add to watchlist</Text>
      </Pressable>
      <Pressable style={[styles.detailActionButton, styles.detailActionPrimary]} onPress={onBuy}>
        <Text style={styles.detailActionPrimaryText}>Buy fund</Text>
      </Pressable>
    </View>
  );
}
