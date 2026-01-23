/**
 * PageIndicator
 * -------------
 * Renders a row of dots representing pagination in a carousel or swiper.
 * The active dot is visually highlighted.
 *
 * Props:
 *  - count: number
 *      The total number of pages/dots to render.
 *  - activeIndex: number
 *      The zero-based index of the currently active page/dot.
 *
 * Usage:
 *  <PageIndicator count={4} activeIndex={2} />
 *  // Renders 4 dots, with the 3rd dot active.
 */

import React from 'react';
import { View } from 'react-native';
import { styles } from '../AccountsScreen.styles';

/** Props for PageIndicator */
type PageIndicatorProps = {
  /** The total number of pages/dots to render */
  count: number;
  /** The zero-based index of the currently active page/dot */
  activeIndex: number;
};

/**
 * Pagination dots component for carousels.
 * Returns null if there is only one or zero pages.
 */
export function PageIndicator({ count, activeIndex }: PageIndicatorProps) {
  // No indicator needed if there is only one or zero pages
  if (count <= 1) return null;

  return (
    <View style={styles.pageIndicator} accessibilityRole="list">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex && styles.dotActive,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: index === activeIndex }}
        />
      ))}
    </View>
  );
}
