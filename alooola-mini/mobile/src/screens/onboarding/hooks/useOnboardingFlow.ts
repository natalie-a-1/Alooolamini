/**
 * Custom React hook for managing the state, transitions, and actions
 * associated with the user onboarding flow. This hook coordinates step
 * navigation, API integration, form data management, in-flow error handling,
 * and local validation rules.
 *
 * @returns {UseOnboardingFlowReturn} - State, setters, actions, navigation, and helpers.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ApiClientError } from '@/services/api';
import {
  completeOnboarding,
  getMyOnboarding,
  getOnboardingOptions,
  joinHouseholdWithInviteCode,
  saveOnboarding,
  type GoalOption,
  type OnboardingInput,
  type RiskToleranceId,
  type RiskToleranceOption,
} from '@/services/onboarding';

/* -------------------------------------------------------------------------- */
/*                            Types and Interfaces                            */
/* -------------------------------------------------------------------------- */

/**
 * All possible step identifiers in the onboarding process.
 */
export type StepId = 'name' | 'avatar' | 'household' | 'goals' | 'risk' | 'amount' | 'summary';

/**
 * Local state shape for onboarding form progress.
 * This does not match API 1:1; some fields are for UI state only.
 */
export interface OnboardingFormData {
  name: string;
  avatarUri: string | null;
  selectedGoals: string[];
  riskTolerance: RiskToleranceId | '';
  investmentAmount: string; // always string for controlled input even if user enters number
  householdChoice: 'join' | 'skip' | null;
  inviteCode: string;
}

/**
 * Options used for select inputs and validations, loaded from the onboarding API.
 */
export interface OnboardingOptionsData {
  goals: GoalOption[];
  riskTolerances: RiskToleranceOption[];
  starterAmounts: number[];
}

/**
 * Complete return signature for the useOnboardingFlow hook.
 * Provides state, all triggers/setters, navigation, and helpers.
 */
export interface UseOnboardingFlowReturn {
  // State
  isLoading: boolean;
  isSaving: boolean;
  currentStepIndex: number;
  steps: StepId[];
  currentStep: StepId;
  totalSteps: number;
  formData: OnboardingFormData;
  options: OnboardingOptionsData;
  joinError: string | null;

  // Form data setters
  setName: (name: string) => void;
  setAvatarUri: (uri: string | null) => void;
  setSelectedGoals: (goals: string[]) => void;
  toggleGoal: (goalKey: string) => void;
  setRiskTolerance: (tolerance: RiskToleranceId | '') => void;
  setInvestmentAmount: (amount: string) => void;
  setHouseholdChoice: (choice: 'join' | 'skip' | null) => void;
  setInviteCode: (code: string) => void;
  clearJoinError: () => void;

  // Navigation
  handleNext: () => Promise<void>;
  handleBack: () => void;
  handleSkip: () => void;
  canProceed: () => boolean;
  canSkip: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              Default State                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_OPTIONS: OnboardingOptionsData = {
  goals: [],
  riskTolerances: [],
  starterAmounts: [],
};

const DEFAULT_FORM_DATA: OnboardingFormData = {
  name: '',
  avatarUri: null,
  selectedGoals: [],
  riskTolerance: '',
  investmentAmount: '',
  householdChoice: null,
  inviteCode: '',
};

/* -------------------------------------------------------------------------- */
/*                           useOnboardingFlow Hook                           */
/* -------------------------------------------------------------------------- */

export function useOnboardingFlow(): UseOnboardingFlowReturn {
  const { setShowOnboarding } = useAuth();

  // --------------------------- State Declarations --------------------------

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [steps, setSteps] = useState<StepId[]>([]);

  const [options, setOptions] = useState<OnboardingOptionsData>(DEFAULT_OPTIONS);
  const [formData, setFormData] = useState<OnboardingFormData>(DEFAULT_FORM_DATA);

  const [joinError, setJoinError] = useState<string | null>(null);

  // ------------------------ Derived/Computed Values ------------------------

  // Current step and skip capability
  const currentStep: StepId = steps[currentStepIndex] ?? 'name';
  const totalSteps = steps.length;
  const canSkip: boolean = currentStep === 'avatar' || currentStep === 'household';

  /* ------------------------------------------------------------------------ */
  /*                              Fetch API Data                              */
  /* ------------------------------------------------------------------------ */

  /**
   * Loads onboarding options (goals, risk, starterAmounts) and user onboarding
   * progress from the API. If user data is available, it pre-fills the form state
   * and dynamically builds the step list according to progress.
   */
  useEffect(() => {
    async function loadData() {
      try {
        // Load both API resources in parallel to improve first render
        const [optionsData, userData] = await Promise.all([
          getOnboardingOptions(),
          getMyOnboarding(),
        ]);
        setOptions(optionsData);

        // Pre-fill form with any available basic data (expand as needed)
        setFormData((prev) => ({
          ...prev,
          name: userData.name ?? '',
          avatarUri: userData.avatarUrl,
        }));

        // Assemble a step list, skipping 'name' and 'household' if already set
        const stepsToShow: StepId[] = [];
        if (!userData.name) stepsToShow.push('name');
        stepsToShow.push('avatar');
        if (!userData.household) stepsToShow.push('household');
        stepsToShow.push('goals', 'risk', 'amount', 'summary');

        setSteps(stepsToShow);
      } catch (error) {
        // If API fails, show all onboarding steps
        console.error('Failed to load onboarding data:', error);
        setSteps(['name', 'avatar', 'household', 'goals', 'risk', 'amount', 'summary']);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    // No dependencies; only runs on mount
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                          Form Data Setters/Actions                       */
  /* ------------------------------------------------------------------------ */

  /**
   * Update user's entered display name.
   */
  const setName = useCallback((name: string) => {
    setFormData((prev) => ({ ...prev, name }));
  }, []);

  /**
   * Set file URI for user's avatar (can be null).
   */
  const setAvatarUri = useCallback((avatarUri: string | null) => {
    setFormData((prev) => ({ ...prev, avatarUri }));
  }, []);

  /**
   * Set the user's full set of selected goals (replace array).
   */
  const setSelectedGoals = useCallback((selectedGoals: string[]) => {
    setFormData((prev) => ({ ...prev, selectedGoals }));
  }, []);

  /**
   * Toggle a goal key in or out of formData.selectedGoals.
   */
  const toggleGoal = useCallback((goalKey: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(goalKey)
        ? prev.selectedGoals.filter((k) => k !== goalKey)
        : [...prev.selectedGoals, goalKey],
    }));
  }, []);

  /**
   * Set user's risk tolerance selection.
   */
  const setRiskTolerance = useCallback((riskTolerance: RiskToleranceId | '') => {
    setFormData((prev) => ({ ...prev, riskTolerance }));
  }, []);

  /**
   * Update the investment amount (always treated as string for controlled input).
   */
  const setInvestmentAmount = useCallback((investmentAmount: string) => {
    setFormData((prev) => ({ ...prev, investmentAmount }));
  }, []);

  /**
   * Set onboarding household join/skip state, and clear any stale errors.
   */
  const setHouseholdChoice = useCallback((householdChoice: 'join' | 'skip' | null) => {
    setFormData((prev) => ({ ...prev, householdChoice }));
    setJoinError(null);
  }, []);

  /**
   * Update the value of the invite code input and clear previous errors.
   */
  const setInviteCode = useCallback((inviteCode: string) => {
    setFormData((prev) => ({ ...prev, inviteCode }));
    setJoinError(null);
  }, []);

  /**
   * Explicitly clear any error displayed for household join step.
   */
  const clearJoinError = useCallback(() => {
    setJoinError(null);
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                         Step Completion/Save Logic                       */
  /* ------------------------------------------------------------------------ */

  /**
   * If joining a household, perform the join and handle errors,
   * returning success status.
   */
  const handleJoinHousehold = useCallback(async (): Promise<boolean> => {
    if (!formData.inviteCode.trim()) {
      setJoinError('Please enter an invite code');
      return false;
    }

    setIsSaving(true);
    try {
      await joinHouseholdWithInviteCode(formData.inviteCode.trim());
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
  }, [formData.inviteCode]);

  /**
   * Final handler to save onboarding data and mark onboarding as complete
   * on the backend. Allows the user to continue even if saving fails.
   */
  const handleComplete = useCallback(async () => {
    setIsSaving(true);
    try {
      // Determine if amount matches preset or is custom
      const starterAmountStrings = options.starterAmounts.map(String);
      const isPresetAmount = starterAmountStrings.includes(formData.investmentAmount);

      const input: OnboardingInput = {
        name: formData.name.trim() || undefined,
        avatarUrl: formData.avatarUri,
        goalKeys: formData.selectedGoals,
        riskTolerance: formData.riskTolerance || undefined,
        starterAmount: isPresetAmount ? parseInt(formData.investmentAmount, 10) : undefined,
        starterAmountCustom:
          !isPresetAmount && formData.investmentAmount
            ? parseInt(formData.investmentAmount, 10)
            : undefined,
      };

      await saveOnboarding(input);
      await completeOnboarding();
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      // Even on failure, allow user to move into main app.
      setShowOnboarding(false);
    } finally {
      setIsSaving(false);
    }
  }, [formData, options.starterAmounts, setShowOnboarding]);

  /* ------------------------------------------------------------------------ */
  /*                           Step Navigation Logic                          */
  /* ------------------------------------------------------------------------ */

  /**
   * Proceed to the next step, executing any special operations
   * (e.g. household join) required for the current step.
   * On last step, completes onboarding.
   */
  const handleNext = useCallback(async () => {
    if (currentStep === 'household' && formData.householdChoice === 'join') {
      const success = await handleJoinHousehold();
      if (!success) return;
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      await handleComplete();
    }
  }, [
    currentStep,
    currentStepIndex,
    formData.householdChoice,
    handleComplete,
    handleJoinHousehold,
    totalSteps,
  ]);

  /**
   * Move backwards one step in the flow, unless already at the start.
   */
  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  /**
   * Trigger "skip" for optional steps, clearing the value if appropriate.
   * Used for avatar and household steps.
   */
  const handleSkip = useCallback(() => {
    if (currentStep === 'avatar') {
      setAvatarUri(null);
    }
    if (currentStep === 'household') {
      setHouseholdChoice('skip');
    }
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStep, currentStepIndex, setAvatarUri, setHouseholdChoice, totalSteps]);

  /* ------------------------------------------------------------------------ */
  /*                              Validation Logic                            */
  /* ------------------------------------------------------------------------ */

  /**
   * Check if the current step's form fields are valid and user
   * may proceed. Used for "Next" button enabled state.
   */
  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 'name':
        return formData.name.trim().length >= 2;
      case 'avatar':
        return true;
      case 'household':
        return (
          formData.householdChoice === 'skip' ||
          (formData.householdChoice === 'join' && formData.inviteCode.trim().length >= 6)
        );
      case 'goals':
        return formData.selectedGoals.length > 0;
      case 'risk':
        return formData.riskTolerance !== '';
      case 'amount':
        return formData.investmentAmount !== '';
      case 'summary':
      default:
        return true;
    }
  }, [currentStep, formData]);

  /* ------------------------------------------------------------------------ */
  /*                        Aggregate/Return Hook API                         */
  /* ------------------------------------------------------------------------ */

  return {
    // State
    isLoading,
    isSaving,
    currentStepIndex,
    steps,
    currentStep,
    totalSteps,
    formData,
    options,
    joinError,

    // Form setters
    setName,
    setAvatarUri,
    setSelectedGoals,
    toggleGoal,
    setRiskTolerance,
    setInvestmentAmount,
    setHouseholdChoice,
    setInviteCode,
    clearJoinError,

    // Navigation/actions
    handleNext,
    handleBack,
    handleSkip,
    canProceed,
    canSkip,
  };
}
