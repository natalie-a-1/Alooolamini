/**
 * Renders the mutual fund list with loading, error, and notice states.
 */
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS } from '@/theme/colors';
import { type MutualFund } from '@/services/mutualFunds';
import { styles } from '../DiscoverScreen.styles';
import { MutualFundCard } from './MutualFundCard';

type MutualFundListProps = {
  funds: MutualFund[];
  isLoading: boolean;
  errorMessage: string | null;
  listNotice: string | null;
  isDemoList: boolean;
  onSelect: (fund: MutualFund) => void;
};

export function MutualFundList({ funds, isLoading, errorMessage, listNotice, isDemoList, onSelect }: MutualFundListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mutual Funds</Text>
      <Text style={styles.sectionSubtitle}>Powered by Alpha Vantage time series data</Text>
      {listNotice && <Text style={styles.listNotice}>{listNotice}</Text>}
      {isLoading ? (
        <ActivityIndicator color={COLORS.ink} style={{ marginTop: 20 }} />
      ) : errorMessage ? (
        <Text style={styles.emptyStateText}>{errorMessage}</Text>
      ) : (
        <View style={styles.list}>
          {funds.length === 0 ? (
            <Text style={styles.emptyStateText}>No mutual funds found.</Text>
          ) : (
            funds.map((fund, index) => (
              <MutualFundCard key={fund.id} fund={fund} index={index} onPress={() => onSelect(fund)} />
            ))
          )}
        </View>
      )}
    </View>
  );
}
