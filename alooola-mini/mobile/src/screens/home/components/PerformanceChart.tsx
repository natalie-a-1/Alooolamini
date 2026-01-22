/**
 * Renders the performance bar chart with selectable bars and tooltips.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { formatCurrency, formatDate } from '@/lib/format';
import { styles } from '../HomeScreen.styles';

type ChartSnapshot = {
  asOf: string;
  totalValue: number;
};

type PerformanceChartProps = {
  chartData: ChartSnapshot[];
  minValue: number;
  valueRange: number;
  selectedBarIndex: number | null;
  onSelectBar: (index: number | null) => void;
};

const PLACEHOLDER_BARS = Array.from({ length: 12 }, (_, index) => index);

export function PerformanceChart({
  chartData,
  minValue,
  valueRange,
  selectedBarIndex,
  onSelectBar,
}: PerformanceChartProps) {
  const selectedSnapshot = selectedBarIndex !== null ? chartData[selectedBarIndex] : null;

  if (!chartData.length) {
    return (
      <View style={styles.card}>
        <View style={styles.chartArea}>
          <View style={styles.chartBars}>
            {PLACEHOLDER_BARS.map((index) => (
              <View key={`placeholder-${index}`} style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, styles.chartBarPlaceholder]} />
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.emptyChartText}>No performance data yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {selectedSnapshot ? (
        <View style={styles.chartTooltip}>
          <Text style={styles.chartTooltipValue}>{formatCurrency(selectedSnapshot.totalValue)}</Text>
          <Text style={styles.chartTooltipDate}>{formatDate(selectedSnapshot.asOf)}</Text>
        </View>
      ) : null}

      <View style={styles.chartArea}>
        <View style={styles.chartBars}>
          {chartData.map((snapshot, index) => {
            const heightPct = valueRange === 0 ? 50 : ((snapshot.totalValue - minValue) / valueRange) * 100;
            const isSelected = selectedBarIndex === index;
            return (
              <Pressable
                key={`${snapshot.asOf}-${index}`}
                style={styles.chartBarWrapper}
                onPress={() => onSelectBar(isSelected ? null : index)}
              >
                <View
                  style={[
                    styles.chartBar,
                    { height: `${Math.max(heightPct, 5)}%` },
                    isSelected && styles.chartBarSelected,
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.chartDateLabels}>
        <Text style={styles.chartDateLabel}>{formatDate(chartData[0].asOf)}</Text>
        <Text style={styles.chartDateLabel}>{formatDate(chartData[chartData.length - 1].asOf)}</Text>
      </View>
    </View>
  );
}
