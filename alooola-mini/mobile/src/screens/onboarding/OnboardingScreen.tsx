/**
 * Onboarding flow with API integration.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { saveOnboarding } from '@/services/onboarding';
import { COLORS } from '@/theme/colors';
import { styles } from './OnboardingScreen.styles';
import { GOALS, RISK_LEVELS, STARTER_AMOUNTS } from './OnboardingScreen.mock';

export function OnboardingScreen() {
  const { setShowOnboarding } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const isPresetAmount = STARTER_AMOUNTS.includes(investmentAmount);

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
              {GOALS.map((goal) => {
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
              {RISK_LEVELS.map((level) => (
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
                Tip: Professionals with stable income often choose moderate to aggressive strategies
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
              {STARTER_AMOUNTS.map((amount) => (
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
                    investmentAmount && !STARTER_AMOUNTS.includes(investmentAmount)
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
                Your funds are FDIC insured and protected with bank-level security
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
