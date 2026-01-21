/**
 * Renders the login header with the Alooola logo.
 */
import React from 'react';
import { Image, View } from 'react-native';
import { styles } from '../LoginScreen.styles';

export function Header() {
  return (
    <View style={styles.header}>
      <Image source={require('../../../../assets/alooola.png')} style={styles.logo} resizeMode="contain" />
    </View>
  );
}
