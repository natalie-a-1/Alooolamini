/**
 * Primary submit button for login, signup, or verification actions.
 */
import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { COLORS } from '@/theme/colors';
import { styles } from '../LoginScreen.styles';

type PrimaryActionButtonProps = {
  disabled?: boolean;
  isLoading: boolean;
  label: string;
  onPress: () => void;
};

export function PrimaryActionButton({ disabled, isLoading, label, onPress }: PrimaryActionButtonProps) {
  const isDisabled = Boolean(disabled) || isLoading;

  return (
    <Pressable style={[styles.primaryButton, isDisabled && styles.buttonDisabled]} onPress={onPress} disabled={isDisabled}>
      {isLoading ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.primaryButtonText}>{label}</Text>}
    </Pressable>
  );
}
