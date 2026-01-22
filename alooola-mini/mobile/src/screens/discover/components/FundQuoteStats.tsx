/**
 * Quote and summary stats for a mutual fund.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '@/theme/colors';
import { styles } from '../DiscoverScreen.styles';

type FundQuoteStatsProps = {
  price: number | null;
  oneYearPercent: number | null;
  rangeLow: number | null;
  rangeHigh: number | null;
  currency?: string;
};

function formatPrice(value: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return '';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function FundQuoteStats({ price, oneYearPercent, rangeLow, rangeHigh, currency }: FundQuoteStatsProps) {
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailSectionTitle}>Overview</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Price</Text>
        <Text style={styles.detailValue}>{price !== null ? formatPrice(price, currency) : '—'}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>1Y change</Text>
        <Text
          style={[
            styles.detailValue,
            oneYearPercent !== null && oneYearPercent < 0 ? styles.detailValueNegative : styles.detailValuePositive,
          ]}
        >
          {formatPercent(oneYearPercent) || '—'}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>52w range</Text>
        <Text style={styles.detailValue}>
          {rangeLow !== null && rangeHigh !== null ? `${formatPrice(rangeLow, currency)} - ${formatPrice(rangeHigh, currency)}` : '—'}
        </Text>
      </View>
    </View>
  );
}
