/**
 * Household selection step for onboarding.
 */
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../OnboardingScreen.styles';

interface HouseholdStepProps {
  householdChoice: 'join' | 'skip' | null;
  inviteCode: string;
  joinError: string | null;
  onHouseholdChoiceChange: (choice: 'join' | 'skip' | null) => void;
  onInviteCodeChange: (code: string) => void;
}

export function HouseholdStep({
  householdChoice,
  inviteCode,
  joinError,
  onHouseholdChoiceChange,
  onInviteCodeChange,
}: HouseholdStepProps) {
  return (
    <View>
      <Text style={styles.heading}>Are you part of a household?</Text>
      <Text style={styles.subheading}>
        Join an existing household to share finances with family or a partner, or skip to
        continue solo.
      </Text>

      <View style={styles.list}>
        <Pressable
          onPress={() => onHouseholdChoiceChange('join')}
          style={[styles.optionCard, householdChoice === 'join' && styles.optionCardSelected]}
        >
          <View
            style={[
              styles.optionIcon,
              householdChoice === 'join' ? styles.optionIconSelected : styles.optionIconDefault,
            ]}
          >
            <Icon
              name="users"
              size={16}
              color={householdChoice === 'join' ? COLORS.surface : COLORS.ink}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionLabel}>Join a household</Text>
            <Text style={styles.optionDescription}>I have an invite code from someone</Text>
          </View>
          {householdChoice === 'join' && <Icon name="checkCircle" size={14} color={COLORS.ink} />}
        </Pressable>

        <Pressable
          onPress={() => onHouseholdChoiceChange('skip')}
          style={[styles.optionCard, householdChoice === 'skip' && styles.optionCardSelected]}
        >
          <View
            style={[
              styles.optionIcon,
              householdChoice === 'skip' ? styles.optionIconSelected : styles.optionIconDefault,
            ]}
          >
            <Icon
              name="user"
              size={16}
              color={householdChoice === 'skip' ? COLORS.surface : COLORS.ink}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionLabel}>Continue solo</Text>
            <Text style={styles.optionDescription}>Create or join a household later</Text>
          </View>
          {householdChoice === 'skip' && <Icon name="checkCircle" size={14} color={COLORS.ink} />}
        </Pressable>
      </View>

      {householdChoice === 'join' && (
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Icon name="mail" size={20} color={COLORS.subtleInk} />
            <TextInput
              placeholder="Enter invite code"
              value={inviteCode}
              onChangeText={onInviteCodeChange}
              style={styles.textInput}
              placeholderTextColor={COLORS.subtleInk}
              autoCapitalize="none"
            />
          </View>
          {joinError && <Text style={styles.errorText}>{joinError}</Text>}
        </View>
      )}

      <View style={styles.tipCard}>
        <Text style={styles.tipText}>
          You can always create or join a household later from your profile settings.
        </Text>
      </View>
    </View>
  );
}
