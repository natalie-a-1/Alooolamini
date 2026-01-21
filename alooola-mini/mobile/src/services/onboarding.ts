/**
 * Onboarding API service.
 * Types match the API response structure from onboarding.schemas.ts
 */
import { apiGet, apiPost, apiPut } from './api';

// ============================================================================
// Type Definitions (mirrored from API)
// ============================================================================

/** Risk tolerance levels. */
export type RiskToleranceId = 'conservative' | 'moderate' | 'aggressive';

/** Goal option returned from API. */
export interface GoalOption {
  key: string;
  label: string;
  icon: string;
}

/** Risk tolerance option with display info. */
export interface RiskToleranceOption {
  id: RiskToleranceId;
  label: string;
  description: string;
}

/** Household info. */
export interface Household {
  id: string;
  name: string;
}

/** Onboarding options response. */
export interface OnboardingOptions {
  goals: GoalOption[];
  riskTolerances: RiskToleranceOption[];
  starterAmounts: number[];
}

/** User's current onboarding state. */
export interface UserOnboarding {
  name: string | null;
  avatarUrl: string | null;
  goalKeys: string[];
  goalOtherText: string | null;
  riskTolerance: RiskToleranceId | null;
  starterAmount: number | null;
  starterAmountCustom: number | null;
  completedAt: string | null;
  household: Household | null;
}

/** Input for saving onboarding data. */
export interface OnboardingInput {
  name?: string;
  avatarUrl?: string | null;
  goalKeys?: string[];
  goalOtherText?: string;
  riskTolerance?: RiskToleranceId;
  starterAmount?: number;
  starterAmountCustom?: number;
}

/** Join household response. */
export interface JoinHouseholdResult {
  household: Household;
  membership: {
    id: string;
    role: string;
    status: string;
  };
}

/** Complete onboarding response. */
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
