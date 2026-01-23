/**
 * @file onboarding.schemas.ts
 * @description Shared types and zod validation schemas for onboarding flows.
 */

import { z } from "zod";

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

/**
 * Valid risk tolerance level identifiers.
 */
export const RISK_TOLERANCE_IDS = ["conservative", "moderate", "aggressive"] as const;

/**
 * Type representing a risk tolerance level ID.
 */
export type RiskToleranceId = (typeof RISK_TOLERANCE_IDS)[number];

/**
 * Goal option returned from the onboarding API.
 */
export interface GoalOption {
  /** Unique key identifier for the goal. */
  key: string;
  /** Display label for the goal. */
  label: string;
  /** Icon name for front-end representation. */
  icon: string;
}

/**
 * Structure of a risk tolerance option.
 */
export interface RiskToleranceOption {
  /** The risk tolerance ID (from RISK_TOLERANCE_IDS). */
  id: RiskToleranceId;
  /** UI display label. */
  label: string;
  /** UI description to help user understand risk level. */
  description: string;
}

/**
 * API response structure for all available onboarding options.
 */
export interface OnboardingOptionsResponse {
  /** Array of available goals. */
  goals: GoalOption[];
  /** Available risk tolerance options (with labels). */
  riskTolerances: readonly RiskToleranceOption[];
  /** Allowed starter investment amounts. */
  starterAmounts: readonly number[];
}

/**
 * Response shape for a user's onboarding data.
 */
export interface UserOnboardingResponse {
  /** User's display name. */
  name: string | null;
  /** Avatar image URL or null. */
  avatarUrl: string | null;
  /** Keys of selected goals. */
  goalKeys: string[];
  /** Optional entered text if "Other" goal selected. */
  goalOtherText: string | null;
  /** Selected risk tolerance, or null if unset. */
  riskTolerance: RiskToleranceId | null;
  /** Chosen starter amount (predefined), or null. */
  starterAmount: number | null;
  /** Custom starter amount, or null. */
  starterAmountCustom: number | null;
  /** ISO string timestamp for onboarding completion. */
  completedAt: string | null;
  /** Household info if joined, or null. */
  household: { id: string; name: string } | null;
}

/**
 * Response returned after onboarding completion.
 */
export interface CompleteOnboardingResponse {
  /** Indicates if onboarding has been completed successfully. */
  completed: boolean;
  /** The household the user belongs to (if any). */
  household: { id: string; name: string } | null;
}

/**
 * Response returned after joining a household via invite code.
 */
export interface JoinHouseholdResponse {
  /** The joined household's identifying info. */
  household: { id: string; name: string };
  /** The membership relation details. */
  membership: { id: string; role: string; status: string };
}

// -----------------------------------------------------------------------------
// Validation Schemas
// -----------------------------------------------------------------------------

/**
 * Validation schema for the onboarding options endpoint.
 * (GET: no payload required)
 */
export const onboardingOptionsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/**
 * Validation schema for saving/updating user's onboarding state (PUT /me).
 */
export const onboardingMeSchema = z.object({
  body: z.object({
    /**
     * User's chosen display name.
     */
    name: z.string().min(1).max(100).optional(),
    /**
     * URL for uploaded avatar or null.
     */
    avatarUrl: z.string().nullable().optional(),
    /**
     * Array of goal keys selected by the user.
     */
    goalKeys: z.array(z.string()).optional(),
    /**
     * Text entered for "other" goal (if applicable).
     */
    goalOtherText: z.string().nullable().optional(),
    /**
     * Selected risk tolerance ID.
     */
    riskTolerance: z.enum(RISK_TOLERANCE_IDS).optional(),
    /**
     * Selected starter investment amount (predefined), or null.
     */
    starterAmount: z.number().nullable().optional(),
    /**
     * User-entered custom starter investment amount, or null.
     */
    starterAmountCustom: z.number().nullable().optional(),
  }).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/**
 * Inferred type for onboarding form input body.
 */
export type OnboardingMeInput = z.infer<typeof onboardingMeSchema>["body"];

/**
 * Validation schema for joining a household with an invite code.
 */
export const joinHouseholdSchema = z.object({
  body: z.object({
    /**
     * Household invite code (minimum length 6).
     */
    inviteCode: z.string().min(6),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/**
 * Validation schema for onboarding completion request (POST).
 */
export const completeOnboardingSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});
