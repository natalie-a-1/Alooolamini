/**
 * Small visual divider separating authentication entry points.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../LoginScreen.styles';

export function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}
