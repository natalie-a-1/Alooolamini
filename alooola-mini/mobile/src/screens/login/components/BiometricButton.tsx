/**
 * Biometric login call-to-action rendered when biometrics and a refresh token are available.
 */
import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../LoginScreen.styles';

type BiometricButtonProps = {
  isLoading: boolean;
  label: string;
  onPress: () => void;
  visible: boolean;
};

export function BiometricButton({ isLoading, label, onPress, visible }: BiometricButtonProps) {
  if (!visible) return null;

  return (
    <Pressable style={[styles.demoButton, isLoading && styles.buttonDisabled]} onPress={onPress} disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator color={COLORS.ink} />
      ) : (
        <>
          <Icon name="shield" size={16} color={COLORS.ink} />
          <Text style={styles.demoButtonText}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
