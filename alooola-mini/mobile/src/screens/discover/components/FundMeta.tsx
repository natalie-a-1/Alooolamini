/**
 * Additional meta information for a mutual fund.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { type MutualFund } from '@/services/mutualFunds';
import { styles } from '../DiscoverScreen.styles';

type FundMetaProps = {
  fund: MutualFund;
};

export function FundMeta({ fund }: FundMetaProps) {
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailSectionTitle}>Additional Details</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Timezone</Text>
        <Text style={styles.detailValue}>{fund.timezone}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Market Hours</Text>
        <Text style={styles.detailValue}>{`${fund.marketOpen}-${fund.marketClose}`}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Symbol</Text>
        <Text style={styles.detailValue}>{fund.symbol}</Text>
      </View>
    </View>
  );
}
