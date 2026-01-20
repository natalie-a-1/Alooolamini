import { z } from "zod";

export const portfolioDetailSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ portfolioId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

export const createPositionSchema = z.object({
  body: z.object({
    portfolioId: z.string().uuid(),
    amountInvested: z.number().positive(),
  }),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

export const listPositionsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

export const listSnapshotsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({
    range: z.enum(["1M", "3M", "6M", "1Y", "ALL"]).optional(),
  }).optional().default({}),
});
