/**
 * Password input used for both login and signup.
 */
import React from 'react';
import { TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../LoginScreen.styles';

type PasswordFieldProps = {
  isLogin: boolean;
  password: string;
  onChange: (value: string) => void;
};

export function PasswordField({ isLogin, password, onChange }: PasswordFieldProps) {
  return (
    <View style={styles.inputCard}>
      <View style={styles.inputRow}>
        <Icon name="lock" size={16} color={COLORS.subtleInk} />
        <TextInput
          placeholder={isLogin ? 'Password' : 'Create Password'}
          value={password}
          onChangeText={onChange}
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor={COLORS.subtleInk}
        />
      </View>
    </View>
  );
}
