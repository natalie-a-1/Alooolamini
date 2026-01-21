/**
 * Link control for exiting verification mode and updating the email.
 */
import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from '../LoginScreen.styles';

type ChangeEmailLinkProps = {
  onPress: () => void;
};

export function ChangeEmailLink({ onPress }: ChangeEmailLinkProps) {
  return (
    <Pressable style={styles.linkButton} onPress={onPress}>
      <Text style={styles.linkText}>Use different email</Text>
    </Pressable>
  );
}
