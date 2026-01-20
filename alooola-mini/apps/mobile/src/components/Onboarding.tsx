/**
 * Onboarding flow with API integration.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon } from './Icon';
import { Screen } from './Screen';
import { useAuth } from '../hooks/useAuth';
import { saveOnboarding } from '../services/onboarding';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/layout';

/** React Native component for Onboarding. */
export function Onboarding() {
  const { setShowOnboarding } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const goals = [
    { id: 'retirement', label: 'Retirement Planning', icon: 'target' },
    { id: 'wealth', label: 'Wealth Building', icon: 'trendingUp' },
    { id: 'education', label: 'Education Fund', icon: 'graduationCap' },
    { id: 'property', label: 'Property Investment', icon: 'home' },
    { id: 'emergency', label: 'Emergency Fund', icon: 'shield' },
    { id: 'other', label: 'Other Goals', icon: 'crosshair' },
  ];

  const riskLevels = [
    {
      id: 'conservative',
      label: 'Conservative',
      description: 'Lower risk, steady growth',
    },
    {
      id: 'moderate',
      label: 'Moderate',
      description: 'Balanced risk and reward',
    },
    {
      id: 'aggressive',
      label: 'Aggressive',
      description: 'Higher risk, maximum growth',
    },
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const starterAmounts = ['1000', '5000', '10000', '25000', '50000'];
      const isPresetAmount = starterAmounts.includes(investmentAmount);

      await saveOnboarding({
        goals: selectedGoals,
        riskTolerance,
        starterAmount: isPresetAmount ? parseInt(investmentAmount, 10) : undefined,
        starterAmountCustom: !isPresetAmount ? parseInt(investmentAmount, 10) : undefined,
      });

      // Complete onboarding - this will trigger navigation to main app
      setShowOnboarding(false);
    } catch (error) {
      // Even if API fails, let user continue (data can be saved later)
      console.error('Failed to save onboarding:', error);
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const canProceed = () => {
    if (step === 0) return selectedGoals.length > 0;
    if (step === 1) return riskTolerance !== '';
    if (step === 2) return investmentAmount !== '';
    return true;
  };

  return (
    <Screen scroll={false}>
      <View style={styles.progressBlock}>
        <View style={styles.progressRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= step ? styles.progressActive : styles.progressInactive]}
            />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step {step + 1} of 4</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {step === 0 && (
          <View>
            <Text style={styles.heading}>What are your financial goals?</Text>
            <Text style={styles.subheading}>
              Select all that apply. We'll tailor your experience accordingly.
            </Text>

            <View style={styles.list}>
              {goals.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <Pressable
                    key={goal.id}
                    onPress={() => toggleGoal(goal.id)}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        isSelected ? styles.optionIconSelected : styles.optionIconDefault,
                      ]}
                    >
                      <Icon name={goal.icon} size={16} color={isSelected ? COLORS.surface : COLORS.ink} />
                    </View>
                    <Text style={styles.optionLabel}>{goal.label}</Text>
                    {isSelected && <Icon name="checkCircle" size={14} color={COLORS.ink} />}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.heading}>What's your risk tolerance?</Text>
            <Text style={styles.subheading}>
              This helps us recommend the right investment strategy for you.
            </Text>

            <View style={styles.list}>
              {riskLevels.map((level) => (
                <Pressable
                  key={level.id}
                  onPress={() => setRiskTolerance(level.id)}
                  style={[styles.optionCard, riskTolerance === level.id && styles.optionCardSelected]}
                >
                  <Text style={styles.optionLabel}>{level.label}</Text>
                  <Text style={styles.optionDescription}>{level.description}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                💡 Tip: Professionals with stable income often choose moderate to aggressive strategies
                for long-term wealth building.
              </Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.heading}>How much would you like to start with?</Text>
            <Text style={styles.subheading}>You can always add more funds later.</Text>

            <View style={styles.list}>
              {['1000', '5000', '10000', '25000', '50000'].map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => setInvestmentAmount(amount)}
                  style={[styles.optionCard, investmentAmount === amount && styles.optionCardSelected]}
                >
                  <Text style={styles.optionLabel}>${parseInt(amount, 10).toLocaleString()}</Text>
                  {investmentAmount === amount && <Icon name="checkCircle" size={14} color={COLORS.ink} />}
                </Pressable>
              ))}
            </View>

            <View style={styles.customCard}>
              <Text style={styles.customLabel}>Custom Amount</Text>
              <View style={styles.customRow}>
                <Text style={styles.customPrefix}>$</Text>
                <TextInput
                  placeholder="Enter amount"
                  value={
                    investmentAmount && !['1000', '5000', '10000', '25000', '50000'].includes(investmentAmount)
                      ? investmentAmount
                      : ''
                  }
                  onChangeText={setInvestmentAmount}
                  keyboardType="numeric"
                  style={styles.customInput}
                  placeholderTextColor={COLORS.subtleInk}
                />
              </View>
            </View>

            <View style={styles.tipCardSuccess}>
              <Text style={styles.tipText}>
                ✓ Your funds are FDIC insured and protected with bank-level security
              </Text>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.heading}>You're all set!</Text>
            <Text style={styles.subheading}>Here's what you get with Alooola Mini:</Text>

            <View style={styles.list}>
              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#ede9fe' }]}>
                  <Icon name="trendingUp" size={16} color={COLORS.accentPurple} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>AI-Powered Insights</Text>
                  <Text style={styles.benefitText}>
                    Personalized investment recommendations tailored to your goals and expertise
                  </Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#dcfce7' }]}>
                  <Icon name="gift" size={16} color={COLORS.accentGreen} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>2% Rewards on Everything</Text>
                  <Text style={styles.benefitText}>
                    Earn stock rewards on all your spending and transactions
                  </Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: '#dbeafe' }]}>
                  <Icon name="users" size={16} color={COLORS.accentBlue} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Joint Accounts</Text>
                  <Text style={styles.benefitText}>
                    Share and manage wealth with your partner or family
                  </Text>
                </View>
              </View>

              <View style={[styles.benefitCard, styles.benefitHighlight]}>
                <View style={[styles.benefitIcon, { backgroundColor: COLORS.accentGreen }]}>
                  <Icon name="gift" size={16} color={COLORS.surface} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Refer & Earn $200</Text>
                  <Text style={styles.benefitText}>
                    Invite friends and colleagues and earn $200 for each successful referral
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <Pressable
            onPress={() => setStep(step - 1)}
            style={[styles.footerButton, styles.footerButtonSecondary]}
            disabled={isLoading}
          >
            <Text style={styles.footerButtonSecondaryText}>Back</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleNext}
          disabled={!canProceed() || isLoading}
          style={[
            styles.footerButton,
            canProceed() && !isLoading ? styles.footerButtonPrimary : styles.footerButtonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <Text
                style={
                  canProceed() ? styles.footerButtonPrimaryText : styles.footerButtonDisabledText
                }
              >
                {step === 3 ? 'Get Started' : 'Continue'}
              </Text>
              <Icon
                name="chevronRight"
                size={18}
                color={canProceed() ? COLORS.surface : COLORS.subtleInk}
              />
            </>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressBlock: {
    paddingBottom: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: RADIUS.pill,
  },
  progressActive: {
    backgroundColor: COLORS.ink,
  },
  progressInactive: {
    backgroundColor: COLORS.border,
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  heading: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: 12,
    color: COLORS.mutedInk,
    marginBottom: SPACING.lg,
  },
  list: {
    gap: SPACING.sm,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#f3f4f6',
    borderColor: COLORS.ink,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconDefault: {
    backgroundColor: '#f3f4f6',
  },
  optionIconSelected: {
    backgroundColor: COLORS.ink,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    flex: 1,
  },
  optionDescription: {
    fontSize: 11,
    color: COLORS.mutedInk,
  },
  tipCard: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#dbeafe',
    borderRadius: RADIUS.lg,
  },
  tipCardSuccess: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#dcfce7',
    borderRadius: RADIUS.lg,
  },
  tipText: {
    fontSize: 11,
    color: COLORS.mutedInk,
  },
  customCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  customLabel: {
    fontSize: 10,
    color: COLORS.mutedInk,
    marginBottom: SPACING.xs,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  customPrefix: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
  },
  customInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
  },
  benefitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  benefitHighlight: {
    backgroundColor: '#ecfdf5',
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  benefitText: {
    fontSize: 11,
    color: COLORS.mutedInk,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    flex: 1,
  },
  footerButtonSecondary: {
    backgroundColor: COLORS.surface,
  },
  footerButtonPrimary: {
    backgroundColor: COLORS.ink,
  },
  footerButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  footerButtonSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mutedInk,
  },
  footerButtonPrimaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.surface,
  },
  footerButtonDisabledText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.subtleInk,
  },
});
