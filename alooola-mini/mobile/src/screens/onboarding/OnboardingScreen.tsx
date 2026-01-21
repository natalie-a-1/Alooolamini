/**
 * Onboarding flow with API integration.
 * Dynamically skips steps based on existing user data.
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { ApiClientError } from '@/services/api';
import { 
  completeOnboarding, 
  getMyOnboarding, 
  joinHouseholdWithInviteCode, 
  saveOnboarding 
} from '@/services/onboarding';
import { COLORS } from '@/theme/colors';
import { styles } from './OnboardingScreen.styles';
import { GOALS, RISK_LEVELS, STARTER_AMOUNTS } from './OnboardingScreen.mock';

// Step IDs for dynamic flow
type StepId = 'name' | 'avatar' | 'household' | 'goals' | 'risk' | 'amount' | 'summary';

export function OnboardingScreen() {
  const { setShowOnboarding, user } = useAuth();
  
  // UI state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Steps to show (dynamically determined based on existing data)
  const [steps, setSteps] = useState<StepId[]>([]);
  
  // Form data
  const [name, setName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  
  // Household step data
  const [householdChoice, setHouseholdChoice] = useState<'join' | 'skip' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Fetch existing user data and determine which steps to show
  useEffect(() => {
    async function loadExistingData() {
      try {
        const data = await getMyOnboarding();
        
        // Pre-fill existing data
        if (data.name) setName(data.name);
        if (data.avatarUrl) setAvatarUri(data.avatarUrl);
        
        // Build steps list dynamically
        const stepsToShow: StepId[] = [];
        
        // Only show name step if user doesn't have a name
        if (!data.name) {
          stepsToShow.push('name');
        }
        
        // Always show avatar step (it's skippable)
        stepsToShow.push('avatar');
        
        // Show household step if user doesn't have a household
        if (!data.household) {
          stepsToShow.push('household');
        }
        
        // Always show these investment steps
        stepsToShow.push('goals', 'risk', 'amount', 'summary');
        
        setSteps(stepsToShow);
      } catch (error) {
        console.error('Failed to load onboarding data:', error);
        // Default to full flow if we can't fetch data
        setSteps(['name', 'avatar', 'household', 'goals', 'risk', 'amount', 'summary']);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadExistingData();
  }, []);

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleJoinHousehold = async () => {
    if (!inviteCode.trim()) {
      setJoinError('Please enter an invite code');
      return false;
    }
    
    setJoinError(null);
    setIsSaving(true);
    
    try {
      await joinHouseholdWithInviteCode(inviteCode.trim());
      return true;
    } catch (error) {
      if (error instanceof ApiClientError) {
        setJoinError(error.message);
      } else {
        setJoinError('Failed to join household. Please check the code and try again.');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const isPresetAmount = STARTER_AMOUNTS.includes(investmentAmount);

      // Save onboarding data
      await saveOnboarding({
        name: name.trim() || undefined,
        avatarUrl: avatarUri, // null means use default
        goals: selectedGoals,
        riskTolerance,
        starterAmount: isPresetAmount ? parseInt(investmentAmount, 10) : undefined,
        starterAmountCustom: !isPresetAmount && investmentAmount ? parseInt(investmentAmount, 10) : undefined,
      });

      // Complete onboarding - creates personal household if needed, tracks referral
      await completeOnboarding();

      // Navigate to main app
      setShowOnboarding(false);
    } catch (error) {
      // Even if API fails, let user continue (data can be saved later)
      console.error('Failed to save onboarding:', error);
      setShowOnboarding(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    // Handle household join if user chose to join
    if (currentStep === 'household' && householdChoice === 'join') {
      const success = await handleJoinHousehold();
      if (!success) return; // Stay on this step if join failed
    }
    
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    // For avatar step, skip means use default
    if (currentStep === 'avatar') {
      setAvatarUri(null);
    }
    // For household step, skip means create personal household later
    if (currentStep === 'household') {
      setHouseholdChoice('skip');
    }
    handleNext();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'name':
        return name.trim().length >= 2;
      case 'avatar':
        return true; // Avatar is optional
      case 'household':
        // Can proceed if skipping, or if joining with a code
        return householdChoice === 'skip' || (householdChoice === 'join' && inviteCode.trim().length >= 6);
      case 'goals':
        return selectedGoals.length > 0;
      case 'risk':
        return riskTolerance !== '';
      case 'amount':
        return investmentAmount !== '';
      case 'summary':
        return true;
      default:
        return true;
    }
  };

  const canSkip = currentStep === 'avatar' || currentStep === 'household';

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

  const displayName = name.trim() || user?.name || '';

  return (
    <Screen scroll={false}>
      <View style={styles.progressBlock}>
        <View style={styles.progressRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= currentStepIndex ? styles.progressActive : styles.progressInactive]}
            />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step {currentStepIndex + 1} of {totalSteps}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Step: Name */}
        {currentStep === 'name' && (
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
                  onChangeText={setName}
                  style={styles.textInput}
                  placeholderTextColor={COLORS.subtleInk}
                  autoFocus
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>
        )}

        {/* Step: Profile Picture */}
        {currentStep === 'avatar' && (
          <View>
            <Text style={styles.heading}>Add a profile picture</Text>
            <Text style={styles.subheading}>
              Help others recognize you. You can skip this for now.
            </Text>

            <View style={styles.avatarContainer}>
              <Pressable onPress={handlePickImage} style={styles.avatarPicker}>
                {avatarUri && !avatarUri.startsWith('/') ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon name="camera" size={32} color={COLORS.subtleInk} />
                    <Text style={styles.avatarPlaceholderText}>Tap to upload</Text>
                  </View>
                )}
              </Pressable>
              {avatarUri && !avatarUri.startsWith('/') && (
                <Pressable onPress={() => setAvatarUri(null)} style={styles.removeAvatar}>
                  <Text style={styles.removeAvatarText}>Remove</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                If you skip, we'll use a friendly default avatar for you.
              </Text>
            </View>
          </View>
        )}

        {/* Step: Household */}
        {currentStep === 'household' && (
          <View>
            <Text style={styles.heading}>Are you part of a household?</Text>
            <Text style={styles.subheading}>
              Join an existing household to share finances with family or a partner, or skip to continue solo.
            </Text>

            <View style={styles.list}>
              <Pressable
                onPress={() => {
                  setHouseholdChoice('join');
                  setJoinError(null);
                }}
                style={[styles.optionCard, householdChoice === 'join' && styles.optionCardSelected]}
              >
                <View
                  style={[
                    styles.optionIcon,
                    householdChoice === 'join' ? styles.optionIconSelected : styles.optionIconDefault,
                  ]}
                >
                  <Icon name="users" size={16} color={householdChoice === 'join' ? COLORS.surface : COLORS.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>Join a household</Text>
                  <Text style={styles.optionDescription}>I have an invite code from someone</Text>
                </View>
                {householdChoice === 'join' && <Icon name="checkCircle" size={14} color={COLORS.ink} />}
              </Pressable>

              <Pressable
                onPress={() => {
                  setHouseholdChoice('skip');
                  setJoinError(null);
                }}
                style={[styles.optionCard, householdChoice === 'skip' && styles.optionCardSelected]}
              >
                <View
                  style={[
                    styles.optionIcon,
                    householdChoice === 'skip' ? styles.optionIconSelected : styles.optionIconDefault,
                  ]}
                >
                  <Icon name="user" size={16} color={householdChoice === 'skip' ? COLORS.surface : COLORS.ink} />
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
                    onChangeText={(text) => {
                      setInviteCode(text);
                      setJoinError(null);
                    }}
                    style={styles.textInput}
                    placeholderTextColor={COLORS.subtleInk}
                    autoCapitalize="none"
                  />
                </View>
                {joinError && (
                  <Text style={styles.errorText}>{joinError}</Text>
                )}
              </View>
            )}

            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                You can always create or join a household later from your profile settings.
              </Text>
            </View>
          </View>
        )}

        {/* Step: Goals */}
        {currentStep === 'goals' && (
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

        {/* Step: Risk Tolerance */}
        {currentStep === 'risk' && (
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

        {/* Step: Investment Amount */}
        {currentStep === 'amount' && (
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

        {/* Step: Summary */}
        {currentStep === 'summary' && (
          <View>
            <Text style={styles.heading}>You're all set{displayName ? `, ${displayName.split(' ')[0]}` : ''}!</Text>
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
        {currentStepIndex > 0 && (
          <Pressable
            onPress={handleBack}
            style={[styles.footerButton, styles.footerButtonSecondary]}
            disabled={isSaving}
          >
            <Text style={styles.footerButtonSecondaryText}>Back</Text>
          </Pressable>
        )}
        {canSkip && (currentStep === 'avatar' ? !avatarUri || avatarUri.startsWith('/') : householdChoice !== 'join') && (
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
