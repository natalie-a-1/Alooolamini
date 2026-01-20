/**
 * Onboarding API service.
 */
import { apiGet, apiPut } from './api';

export interface GoalOption {
  id: string;
  key: string;
  label: string;
}

export interface OnboardingOptions {
  goals: GoalOption[];
  riskTolerances: Array<{ id: string; label: string; description: string }>;
  starterAmounts: number[];
}

export interface UserOnboarding {
  goals: string[];
  riskTolerance: string | null;
  starterAmount: number | null;
  starterAmountCustom: number | null;
  goalOtherText: string | null;
  completedAt: string | null;
}

export interface OnboardingInput {
  goals?: string[];
  riskTolerance?: string;
  starterAmount?: number;
  starterAmountCustom?: number;
  goalOtherText?: string;
}

/**
 * Get onboarding options (goals, risk levels, amounts).
 */
export async function getOnboardingOptions(): Promise<OnboardingOptions> {
  return apiGet<OnboardingOptions>('/onboarding/options');
}

/**
 * Get current user's onboarding data.
 */
export async function getMyOnboarding(): Promise<UserOnboarding> {
  return apiGet<UserOnboarding>('/onboarding/me');
}

/**
 * Save onboarding selections.
 */
export async function saveOnboarding(data: OnboardingInput): Promise<UserOnboarding> {
  return apiPut<UserOnboarding>('/onboarding/me', data);
}
