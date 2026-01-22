/**
 * CTA button to open the AI assistant chat.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../DiscoverScreen.styles';

type AskAIButtonProps = {
  onPress: () => void;
};

export function AskAIButton({ onPress }: AskAIButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.aiButton}>
      <View style={styles.aiButtonHeader}>
        <Icon name="message" size={16} color={COLORS.surface} />
        <Text style={styles.aiButtonTitle}>Ask AI</Text>
      </View>
      <Text style={styles.aiButtonText}>Get insights on portfolio options or schedule with an advisor</Text>
    </Pressable>
  );
}
