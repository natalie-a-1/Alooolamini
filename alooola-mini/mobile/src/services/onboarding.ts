/**
 * Onboarding API service.
 */
import { apiGet, apiPost, apiPut } from './api';

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

export interface Household {
  id: string;
  name: string;
}

export interface UserOnboarding {
  name: string | null;
  avatarUrl: string | null;
  goals: string[];
  riskTolerance: string | null;
  starterAmount: number | null;
  starterAmountCustom: number | null;
  goalOtherText: string | null;
  completedAt: string | null;
  household: Household | null;
}

export interface OnboardingInput {
  name?: string;
  avatarUrl?: string | null;
  goals?: string[];
  riskTolerance?: string;
  starterAmount?: number;
  starterAmountCustom?: number;
  goalOtherText?: string;
}

export interface JoinHouseholdResult {
  household: Household;
  membership: {
    id: string;
    role: string;
    status: string;
  };
}

export interface CompleteOnboardingResult {
  completed: boolean;
  household: Household | null;
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

/**
 * Join a household with an invite code.
 */
export async function joinHouseholdWithInviteCode(inviteCode: string): Promise<JoinHouseholdResult> {
  return apiPost<JoinHouseholdResult>('/onboarding/household/join', { inviteCode });
}

/**
 * Complete onboarding - creates personal household if needed, tracks referral completion.
 */
export async function completeOnboarding(): Promise<CompleteOnboardingResult> {
  return apiPost<CompleteOnboardingResult>('/onboarding/complete', {});
}
