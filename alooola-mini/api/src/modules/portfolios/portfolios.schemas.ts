/**
 * Validation schemas for the portfolios module.
 */
import { z } from "zod";

/** Validation schema for portfolio detail. */
export const portfolioDetailSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ portfolioId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for create position (buy portfolio). */
export const createPositionSchema = z.object({
  body: z.object({
    portfolioId: z.string().uuid(),
    amountInvested: z.number().positive(),
    fundingAccountId: z.string().uuid(),
  }),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Type for create position input. */
export type CreatePositionInput = z.infer<typeof createPositionSchema>["body"];

/** Validation schema for list positions. */
export const listPositionsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for list snapshots. */
export const listSnapshotsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({
    range: z.enum(["1M", "3M", "6M", "1Y", "ALL"]).optional(),
  }).optional().default({}),
});
