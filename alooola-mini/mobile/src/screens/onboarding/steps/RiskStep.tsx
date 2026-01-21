/**
 * Risk tolerance selection step for onboarding.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { RiskToleranceId, RiskToleranceOption } from '@/services/onboarding';
import { styles } from '../OnboardingScreen.styles';

interface RiskStepProps {
  riskTolerances: RiskToleranceOption[];
  selectedRisk: RiskToleranceId | '';
  onRiskChange: (risk: RiskToleranceId) => void;
}

export function RiskStep({ riskTolerances, selectedRisk, onRiskChange }: RiskStepProps) {
  return (
    <View>
      <Text style={styles.heading}>What's your risk tolerance?</Text>
      <Text style={styles.subheading}>
        This helps us recommend the right investment strategy for you.
      </Text>

      <View style={styles.list}>
        {riskTolerances.map((level) => (
          <Pressable
            key={level.id}
            onPress={() => onRiskChange(level.id)}
            style={[styles.optionCard, selectedRisk === level.id && styles.optionCardSelected]}
          >
            <Text style={styles.optionLabel}>{level.label}</Text>
            <Text style={styles.optionDescription}>{level.description}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipText}>
          Tip: Professionals with stable income often choose moderate to aggressive strategies for
          long-term wealth building.
        </Text>
      </View>
    </View>
  );
}
