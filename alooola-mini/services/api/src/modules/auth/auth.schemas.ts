/**
 * Validation schemas for the auth module.
 */
import { z } from "zod";

/** Validation schema for email start. */
export const emailStartSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for email verify. */
export const emailVerifySchema = z.object({
  body: z.object({
    email: z.string().email(),
    token: z.string().min(6),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for refresh. */
export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for logout. */
export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10).optional(),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for demo. */
export const demoSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    name: z.string().min(1).optional(),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});
