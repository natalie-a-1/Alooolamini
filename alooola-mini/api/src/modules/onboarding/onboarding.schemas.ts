/**
 * Validation schemas for the onboarding module.
 */
import { z } from "zod";

/** Validation schema for onboarding options. */
export const onboardingOptionsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for onboarding me. */
export const onboardingMeSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().nullable().optional(),
    goalKeys: z.array(z.string()).optional(),
    goalOtherText: z.string().nullable().optional(),
    riskTolerance: z.enum(["conservative", "moderate", "aggressive"]).optional(),
    starterAmount: z.number().nullable().optional(),
    starterAmountCustom: z.number().nullable().optional(),
  }).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for joining household with invite code. */
export const joinHouseholdSchema = z.object({
  body: z.object({
    inviteCode: z.string().min(6),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for completing onboarding. */
export const completeOnboardingSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});
