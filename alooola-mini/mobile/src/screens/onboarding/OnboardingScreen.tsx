/**
 * Onboarding flow with API integration.
 * Dynamically skips steps based on existing user data.
 */
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/theme/colors';
import { useOnboardingFlow } from './hooks/useOnboardingFlow';
import { styles } from './OnboardingScreen.styles';
import {
  AmountStep,
  AvatarStep,
  GoalsStep,
  HouseholdStep,
  NameStep,
  RiskStep,
  SummaryStep,
} from './steps';

export function OnboardingScreen() {
  const { user } = useAuth();
  const {
    // State
    isLoading,
    isSaving,
    currentStepIndex,
    currentStep,
    totalSteps,
    formData,
    options,
    joinError,

    // Form setters
    setName,
    setAvatarUri,
    toggleGoal,
    setRiskTolerance,
    setInvestmentAmount,
    setHouseholdChoice,
    setInviteCode,

    // Navigation
    handleNext,
    handleBack,
    handleSkip,
    canProceed,
    canSkip,
  } = useOnboardingFlow();

  // Show loading screen while fetching initial data
  if (isLoading) {
    return (
      <Screen scroll={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ink} />
          <Text style={styles.loadingText}>Setting up your experience...</Text>
        </View>
      </Screen>
    );
  }

  const displayName = formData.name.trim() || user?.name || '';
  const showSkipButton =
    canSkip &&
    (currentStep === 'avatar'
      ? !formData.avatarUri || formData.avatarUri.startsWith('/')
      : formData.householdChoice !== 'join');

  return (
    <Screen scroll={false}>
      {/* Progress indicator */}
      <View style={styles.progressBlock}>
        <View style={styles.progressRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= currentStepIndex ? styles.progressActive : styles.progressInactive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepLabel}>
          Step {currentStepIndex + 1} of {totalSteps}
        </Text>
      </View>

      {/* Step content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {currentStep === 'name' && <NameStep name={formData.name} onNameChange={setName} />}

        {currentStep === 'avatar' && (
          <AvatarStep avatarUri={formData.avatarUri} onAvatarChange={setAvatarUri} />
        )}

        {currentStep === 'household' && (
          <HouseholdStep
            householdChoice={formData.householdChoice}
            inviteCode={formData.inviteCode}
            joinError={joinError}
            onHouseholdChoiceChange={setHouseholdChoice}
            onInviteCodeChange={setInviteCode}
          />
        )}

        {currentStep === 'goals' && (
          <GoalsStep
            goals={options.goals}
            selectedGoals={formData.selectedGoals}
            onToggleGoal={toggleGoal}
          />
        )}

        {currentStep === 'risk' && (
          <RiskStep
            riskTolerances={options.riskTolerances}
            selectedRisk={formData.riskTolerance}
            onRiskChange={setRiskTolerance}
          />
        )}

        {currentStep === 'amount' && (
          <AmountStep
            starterAmounts={options.starterAmounts}
            selectedAmount={formData.investmentAmount}
            onAmountChange={setInvestmentAmount}
          />
        )}

        {currentStep === 'summary' && <SummaryStep displayName={displayName} />}
      </ScrollView>

      {/* Footer navigation */}
      <View style={styles.footer}>
        {currentStepIndex > 0 && (
          <Pressable
            onPress={handleBack}
            style={[styles.footerButton, styles.footerButtonSecondary]}
            disabled={isSaving}
          >
            <Text style={styles.footerButtonSecondaryText}>Back</Text>
          </Pressable>
        )}

        {showSkipButton && (
          <Pressable
            onPress={handleSkip}
            style={[styles.footerButton, styles.footerButtonSecondary]}
            disabled={isSaving}
          >
            <Text style={styles.footerButtonSecondaryText}>Skip</Text>
          </Pressable>
        )}

        <Pressable
          onPress={handleNext}
          disabled={!canProceed() || isSaving}
          style={[
            styles.footerButton,
            canProceed() && !isSaving ? styles.footerButtonPrimary : styles.footerButtonDisabled,
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <Text
                style={
                  canProceed() ? styles.footerButtonPrimaryText : styles.footerButtonDisabledText
                }
              >
                {currentStepIndex === totalSteps - 1 ? 'Get Started' : 'Continue'}
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
