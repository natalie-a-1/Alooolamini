/**
 * Marketing highlights shown on the signup flow.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '@/theme/colors';
import { styles } from '../LoginScreen.styles';

export function FeatureHighlights() {
  return (
    <View style={styles.features}>
      <View style={styles.featureRow}>
        <View style={[styles.featureDot, { backgroundColor: COLORS.accentPurple }]} />
        <Text style={styles.featureText}>AI-powered investment insights</Text>
      </View>
      <View style={styles.featureRow}>
        <View style={[styles.featureDot, { backgroundColor: COLORS.accentBlue }]} />
        <Text style={styles.featureText}>Personalized wealth strategies</Text>
      </View>
      <View style={styles.featureRow}>
        <View style={[styles.featureDot, { backgroundColor: COLORS.accentGreen }]} />
        <Text style={styles.featureText}>Earn rewards on every transaction</Text>
      </View>
    </View>
  );
}
