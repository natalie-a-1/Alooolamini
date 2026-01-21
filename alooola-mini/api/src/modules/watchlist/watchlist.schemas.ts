/**
 * Validation schemas for the watchlist module.
 */
import { z } from "zod";

/** Validation schema for adding/removing from watchlist. */
export const watchlistItemSchema = z.object({
  body: z.object({
    portfolioId: z.string().uuid(),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for checking if in watchlist. */
export const watchlistCheckSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({
    portfolioId: z.string().uuid(),
  }),
  query: z.object({}).optional().default({}),
});
