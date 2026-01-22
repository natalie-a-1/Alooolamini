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
          <Text style={timeframe === tf ? styles.timeframeTextActive : styles.timeframeTextInactive}>{tf}</Text>
        </Pressable>
      ))}
    </View>
  );
}
