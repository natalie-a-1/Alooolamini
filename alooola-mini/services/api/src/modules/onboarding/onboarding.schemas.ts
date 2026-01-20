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
    goalKeys: z.array(z.string()).optional(),
    goalOtherText: z.string().nullable().optional(),
    riskTolerance: z.enum(["conservative", "moderate", "aggressive"]).optional(),
    starterAmount: z.number().nullable().optional(),
    starterAmountCustom: z.number().nullable().optional(),
  }).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});
