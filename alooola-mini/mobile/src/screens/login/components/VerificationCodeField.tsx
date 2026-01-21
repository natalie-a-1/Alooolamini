/**
 * Verification code input shown after signup.
 */
import React from 'react';
import { TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../LoginScreen.styles';

type VerificationCodeFieldProps = {
  verificationCode: string;
  onChange: (value: string) => void;
};

export function VerificationCodeField({ verificationCode, onChange }: VerificationCodeFieldProps) {
  return (
    <View style={styles.inputCard}>
      <View style={styles.inputRow}>
        <Icon name="lock" size={16} color={COLORS.subtleInk} />
        <TextInput
          placeholder="Verification Code"
          value={verificationCode}
          onChangeText={onChange}
          keyboardType="number-pad"
          style={styles.input}
          placeholderTextColor={COLORS.subtleInk}
        />
      </View>
    </View>
  );
}
