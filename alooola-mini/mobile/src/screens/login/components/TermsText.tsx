/**
 * Legal acknowledgement text for the login experience.
 */
import React from 'react';
import { Text } from 'react-native';
import { styles } from '../LoginScreen.styles';

export function TermsText() {
  return <Text style={styles.terms}>By continuing, you agree to our Terms of Service and Privacy Policy</Text>;
}
