/**
 * Pagination dots for the account carousel.
 */
import React from 'react';
import { View } from 'react-native';
import { styles } from '../AccountsScreen.styles';

type PageIndicatorProps = {
  count: number;
  activeIndex: number;
};

export function PageIndicator({ count, activeIndex }: PageIndicatorProps) {
  if (count <= 1) return null;

  return (
    <View style={styles.pageIndicator}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.dot, index === activeIndex && styles.dotActive]} />
      ))}
    </View>
  );
}
