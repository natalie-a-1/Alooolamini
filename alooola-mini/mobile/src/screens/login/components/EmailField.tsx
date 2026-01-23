/**
 * Email input used for both login and signup flows.
 */
import React from 'react';
import { TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../LoginScreen.styles';

type EmailFieldProps = {
  email: string;
  onChange: (value: string) => void;
};

export function EmailField({ email, onChange }: EmailFieldProps) {
  return (
    <View style={styles.inputCard}>
      <View style={styles.inputRow}>
        <Icon name="mail" size={16} color={COLORS.subtleInk} />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={onChange}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor={COLORS.subtleInk}
        />
      </View>
    </View>
  );
}
