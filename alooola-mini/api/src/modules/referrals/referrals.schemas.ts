/**
 * Validation schemas for the referrals module.
 */
import { z } from "zod";

/** Validation schema for referral event. */
export const referralEventSchema = z.object({
  body: z.object({
    eventType: z.enum(["click", "signup", "complete"]),
    meta: z.record(z.unknown()).optional(),
  }),
  params: z.object({
    code: z.string().min(3),
  }),
  query: z.object({}).optional().default({}),
});
