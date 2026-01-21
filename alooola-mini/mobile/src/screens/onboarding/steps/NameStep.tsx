/**
 * Name input step for onboarding.
 */
import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../OnboardingScreen.styles';

interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
}

export function NameStep({ name, onNameChange }: NameStepProps) {
  return (
    <View>
      <Text style={styles.heading}>What's your name?</Text>
      <Text style={styles.subheading}>
        We'll use this to personalize your experience.
      </Text>

      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <Icon name="user" size={20} color={COLORS.subtleInk} />
          <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={onNameChange}
            style={styles.textInput}
            placeholderTextColor={COLORS.subtleInk}
            autoFocus
            autoCapitalize="words"
          />
        </View>
      </View>
    </View>
  );
}
