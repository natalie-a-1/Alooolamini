/**
 * Signup-only inputs for name and referral code.
 */
import React from 'react';
import { TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../LoginScreen.styles';

type SignupFieldsProps = {
  name: string;
  referralCode: string;
  onChangeName: (value: string) => void;
  onChangeReferral: (value: string) => void;
};

export function SignupFields({ name, referralCode, onChangeName, onChangeReferral }: SignupFieldsProps) {
  return (
    <>
      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <Icon name="user" size={16} color={COLORS.subtleInk} />
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={onChangeName}
            style={styles.input}
            placeholderTextColor={COLORS.subtleInk}
          />
        </View>
      </View>

      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <Icon name="gift" size={16} color={COLORS.subtleInk} />
          <TextInput
            placeholder="Referral Code (optional)"
            value={referralCode}
            onChangeText={onChangeReferral}
            autoCapitalize="characters"
            style={styles.input}
            placeholderTextColor={COLORS.subtleInk}
          />
        </View>
      </View>
    </>
  );
}
