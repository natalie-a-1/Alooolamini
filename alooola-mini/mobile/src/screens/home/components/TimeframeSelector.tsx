/**
 * Chip selector for performance timeframes.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../HomeScreen.styles';
import { TIMEFRAMES } from '../HomeScreen.mock';

type Timeframe = (typeof TIMEFRAMES)[number];

type TimeframeSelectorProps = {
  timeframe: Timeframe;
  onSelect: (timeframe: Timeframe) => void;
};

/** Display-friendly labels for each timeframe */
const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  '1D': 'Today',
  '1M': '1M',
  '1Y': '1Y',
  ALL: 'All',
};

export function TimeframeSelector({ timeframe, onSelect }: TimeframeSelectorProps) {
  return (
    <View style={styles.timeframeRow}>
      {TIMEFRAMES.map((tf) => (
        <Pressable
          key={tf}
          onPress={() => onSelect(tf)}
          style={[
            styles.timeframeChip,
            timeframe === tf ? styles.timeframeChipActive : styles.timeframeChipInactive,
          ]}
        >
          <Text style={timeframe === tf ? styles.timeframeTextActive : styles.timeframeTextInactive}>
            {TIMEFRAME_LABELS[tf]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
