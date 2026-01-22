/**
 * Card item for a mutual fund in the list.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { type MutualFund } from '@/services/mutualFunds';
import { styles } from '../DiscoverScreen.styles';
import { BORDER_ACCENTS } from '../DiscoverScreen.mock';

type MutualFundCardProps = {
  fund: MutualFund;
  index: number;
  onPress: () => void;
};

export function MutualFundCard({ fund, index, onPress }: MutualFundCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.opportunityCard, BORDER_ACCENTS[index % BORDER_ACCENTS.length]]}>
      <View style={styles.minimalCardHeader}>
        <View style={styles.fundTitleBlock}>
          <Text style={styles.opportunityTitle}>{fund.name}</Text>
          <Text style={styles.minimalSubline}>
            {fund.symbol} • {fund.type || 'Mutual Fund'}
          </Text>
        </View>
        <Icon name="chevronRight" size={18} color={COLORS.subtleInk} />
      </View>
    </Pressable>
  );
}
