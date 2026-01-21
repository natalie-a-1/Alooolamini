/**
 * Financial goals selection step for onboarding.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import type { GoalOption } from '@/services/onboarding';
import { styles } from '../OnboardingScreen.styles';

interface GoalsStepProps {
  goals: GoalOption[];
  selectedGoals: string[];
  onToggleGoal: (goalKey: string) => void;
}

export function GoalsStep({ goals, selectedGoals, onToggleGoal }: GoalsStepProps) {
  return (
    <View>
      <Text style={styles.heading}>What are your financial goals?</Text>
      <Text style={styles.subheading}>
        Select all that apply. We'll tailor your experience accordingly.
      </Text>

      <View style={styles.list}>
        {goals.map((goal) => {
          const isSelected = selectedGoals.includes(goal.key);
          return (
            <Pressable
              key={goal.key}
              onPress={() => onToggleGoal(goal.key)}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            >
              <View
                style={[
                  styles.optionIcon,
                  isSelected ? styles.optionIconSelected : styles.optionIconDefault,
                ]}
              >
                <Icon
                  name={goal.icon as any}
                  size={16}
                  color={isSelected ? COLORS.surface : COLORS.ink}
                />
              </View>
              <Text style={styles.optionLabel}>{goal.label}</Text>
              {isSelected && <Icon name="checkCircle" size={14} color={COLORS.ink} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
