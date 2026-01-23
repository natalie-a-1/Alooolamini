/**
 * Displays the user's total balance and timeframe gain/loss summary.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { formatCurrency } from '@/lib/format';
import { styles } from '../HomeScreen.styles';

type BalanceSummaryProps = {
  totalValue: number;
  timeframeGain: { amount: number; percent: number };
  timeframeLabel: string;
};

export function BalanceSummary({ totalValue, timeframeGain, timeframeLabel }: BalanceSummaryProps) {
  const isPositive = timeframeGain.amount >= 0;
  const gainPrefix = timeframeGain.amount >= 0 ? '+' : '-';
  const percentPrefix = timeframeGain.percent >= 0 ? '+' : '';

  return (
    <View style={styles.balanceBlock}>
      <Text style={styles.balanceValue}>{formatCurrency(totalValue)}</Text>
      <View style={styles.balanceGainRow}>
        <View style={[styles.gainIconCircle, !isPositive && styles.gainIconCircleNegative]}>
          <Icon name={isPositive ? 'trendingUp' : 'trendingDown'} size={12} color={isPositive ? COLORS.success : COLORS.danger} />
        </View>
        <Text style={[styles.gainText, !isPositive && styles.gainTextNegative]}>
          {gainPrefix}
          {formatCurrency(Math.abs(timeframeGain.amount))} ({percentPrefix}
          {timeframeGain.percent.toFixed(2)}%) · {timeframeLabel}
        </Text>
      </View>
    </View>
  );
}
