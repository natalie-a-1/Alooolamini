/**
 * Validation schemas for the auth module.
 */
import { z } from "zod";

/** Validation schema for register. */
export const registerSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
    name: z.string().min(1).max(100),
    referralCode: z.string().min(4).max(12).optional(),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for login. */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for validating a referral code. */
export const validateReferralSchema = z.object({
  body: z.object({
    code: z.string().min(4).max(12),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for email verify. */
export const emailVerifySchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
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
    email: z.string().trim().email().optional(),
    name: z.string().min(1).optional(),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Request body types inferred from schemas for consistent contracts. */
export type RegisterBody = z.infer<typeof registerSchema>["body"];
export type LoginBody = z.infer<typeof loginSchema>["body"];
export type ValidateReferralBody = z.infer<typeof validateReferralSchema>["body"];
export type EmailVerifyBody = z.infer<typeof emailVerifySchema>["body"];
export type RefreshBody = z.infer<typeof refreshSchema>["body"];
export type LogoutBody = z.infer<typeof logoutSchema>["body"];
export type DemoBody = z.infer<typeof demoSchema>["body"];
