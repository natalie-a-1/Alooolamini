/**
 * Investment amount selection step for onboarding.
 */
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../OnboardingScreen.styles';

interface AmountStepProps {
  starterAmounts: number[];
  selectedAmount: string;
  onAmountChange: (amount: string) => void;
}

export function AmountStep({ starterAmounts, selectedAmount, onAmountChange }: AmountStepProps) {
  const starterAmountStrings = starterAmounts.map(String);
  const isCustomAmount = selectedAmount && !starterAmountStrings.includes(selectedAmount);

  return (
    <View>
      <Text style={styles.heading}>How much would you like to start with?</Text>
      <Text style={styles.subheading}>You can always add more funds later.</Text>

      <View style={styles.list}>
        {starterAmounts.map((amount) => {
          const amountStr = String(amount);
          return (
            <Pressable
              key={amount}
              onPress={() => onAmountChange(amountStr)}
              style={[styles.optionCard, selectedAmount === amountStr && styles.optionCardSelected]}
            >
              <Text style={styles.optionLabel}>${amount.toLocaleString()}</Text>
              {selectedAmount === amountStr && (
                <Icon name="checkCircle" size={14} color={COLORS.ink} />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.customCard}>
        <Text style={styles.customLabel}>Custom Amount</Text>
        <View style={styles.customRow}>
          <Text style={styles.customPrefix}>$</Text>
          <TextInput
            placeholder="Enter amount"
            value={isCustomAmount ? selectedAmount : ''}
            onChangeText={onAmountChange}
            keyboardType="numeric"
            style={styles.customInput}
            placeholderTextColor={COLORS.subtleInk}
          />
        </View>
      </View>

      <View style={styles.tipCardSuccess}>
        <Text style={styles.tipText}>
          Your funds are FDIC insured and protected with bank-level security
        </Text>
      </View>
    </View>
  );
}
