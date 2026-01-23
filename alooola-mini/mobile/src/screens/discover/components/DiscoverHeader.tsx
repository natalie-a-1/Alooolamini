/**
 * Discover header with title and subtitle.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../DiscoverScreen.styles';

export function DiscoverHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>Investment opportunities for medical professionals</Text>
    </View>
  );
}
