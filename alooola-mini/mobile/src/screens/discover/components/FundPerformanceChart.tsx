/**
 * Performance bar chart for a mutual fund.
 */
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { COLORS } from '@/theme/colors';
import { styles } from '../DiscoverScreen.styles';

type FundPerformanceChartProps = {
  points: { date: string; close: number }[];
  currency?: string;
};

export function FundPerformanceChart({ points, currency }: FundPerformanceChartProps) {
  if (points.length === 0) {
    return (
      <View style={styles.detailCard}>
        <Text style={styles.emptyStateText}>No performance data available.</Text>
      </View>
    );
  }

  const values = points.map((point) => point.close);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getBarHeight = (value: number) => {
    const minHeight = 24;
    const maxHeight = 100;
    const normalized = (value - minValue) / valueRange;
    return minHeight + normalized * (maxHeight - minHeight);
  };

  const formatMonthLabel = (dateValue: string) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', { month: 'short' });
  };

  const formatPrice = (value: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `$${value.toFixed(2)}`;
    }
  };

  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailSectionTitle}>Performance (12 months)</Text>
      <View style={styles.detailChart}>
        <View style={styles.detailBars}>
          {points.map((point, index) => {
            const barHeight = getBarHeight(point.close);
            const isActive = activeIndex === index;
            return (
              <View key={point.date} style={styles.detailBarWrapper}>
                <Pressable
                  style={styles.chartPressable}
                  onPressIn={() => setActiveIndex(index)}
                  onPressOut={() => setActiveIndex(null)}
                  onHoverIn={() => setActiveIndex(index)}
                  onHoverOut={() => setActiveIndex(null)}
                >
                  {isActive && (
                    <View style={[styles.chartTooltip, { bottom: barHeight + 10 }]}>
                      <Text style={styles.chartTooltipText} numberOfLines={1}>
                        {formatPrice(point.close)}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.detailBar, { height: barHeight }, isActive && styles.detailBarActive]} />
                </Pressable>
              </View>
            );
          })}
        </View>
        <View style={styles.detailChartLabels}>
          {points.map((point, index) => (
            <Text key={`${point.date}-label`} style={styles.chartLabel} numberOfLines={1}>
              {index % 2 === 0 ? formatMonthLabel(point.date) : ''}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
