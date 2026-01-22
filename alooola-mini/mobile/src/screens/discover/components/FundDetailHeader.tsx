/**
 * Header section for fund detail view.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { type MutualFund } from '@/services/mutualFunds';
import { styles } from '../DiscoverScreen.styles';

type FundDetailHeaderProps = {
  fund: MutualFund;
  onBack: () => void;
  notice?: string | null;
};

export function FundDetailHeader({ fund, onBack, notice }: FundDetailHeaderProps) {
  return (
    <View style={{ marginBottom: styles.detailHeader.marginBottom }}>
      <View style={styles.detailHeader}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Icon name="chevronRight" size={18} color={COLORS.ink} style={styles.backIcon} />
        </Pressable>
        <View style={styles.detailHeaderText}>
          <Text style={styles.detailTitle}>{fund.name}</Text>
          <Text style={styles.detailSubtitle}>
            {fund.symbol} • {fund.type || 'Mutual Fund'}
          </Text>
        </View>
      </View>
      {notice ? <Text style={styles.detailNotice}>{notice}</Text> : null}
    </View>
  );
}
