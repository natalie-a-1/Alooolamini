/**
 * Demo login call-to-action used for interview environments.
 */
import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../LoginScreen.styles';

type DemoLoginButtonProps = {
  isLoading: boolean;
  onPress: () => void;
};

export function DemoLoginButton({ isLoading, onPress }: DemoLoginButtonProps) {
  return (
    <Pressable style={[styles.demoButton, isLoading && styles.buttonDisabled]} onPress={onPress} disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator color={COLORS.ink} />
      ) : (
        <>
          <Icon name="gift" size={16} color={COLORS.ink} />
          <Text style={styles.demoButtonText}>Try Demo (No Sign Up)</Text>
        </>
      )}
    </Pressable>
  );
}
